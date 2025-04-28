import fs from "fs";
import path from "path";
import { type RouteConfigEntry, route, layout } from "@react-router/dev/routes";

/**
 * Normalizes a path to use forward slashes consistently
 * regardless of the operating system.
 */
function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

/**
 * Represents a node in the route tree structure.
 */
type RouteNode = {
  /** URL path segment */
  path: string;
  /** Filesystem path relative to root */
  relativePath: string;
  /** Whether the node is a directory */
  isDirectory: boolean;
  /** Whether the node contains a layout.tsx file */
  isLayout: boolean;
  /** Whether the node contains a page.tsx file */
  isPage: boolean;
  /** Whether the node represents a dynamic segment ([param]) */
  isDynamicSegment: boolean;
  /** Whether the node represents an optional catch-all segment ([[...param]]) */
  isOptionalSegment: boolean;
  /** Whether the node is a route group that doesn't affect the URL path */
  isGrouping: boolean;
  /** Child route nodes */
  children: RouteNode[];
};

/**
 * Generates React Router routes that follow Next.js App Router conventions.
 *
 * Conventions supported:
 * - Files named page.tsx become route components
 * - Files named layout.tsx become layout components
 * - Folders starting with [...] become catch-all routes
 * - Folders starting with [[...]] become optional catch-all routes
 * - Folders starting with [folderName] become dynamic segments
 * - Folders starting with (folderName) are route groups (don't affect URL path)
 *
 * @param {string} appDir - Directory containing the app router files, relative to src/
 * @returns {Promise<RouteConfigEntry[]>} Array of React Router route configurations
 */
export async function appRouter(appDir: string = "app"): Promise<RouteConfigEntry[]> {
  const rootDir = path.resolve(process.cwd(), "src", appDir);

  try {
    await fs.promises.access(rootDir);
  } catch {
    console.warn(`Directory ${rootDir} does not exist. Creating empty routes.`);
    return [];
  }

  const routeTree = await buildRouteTreeAsync(rootDir, "");
  return convertTreeToRoutes(routeTree);
}

/**
 * Recursively builds a route tree by scanning the directory structure asynchronously.
 *
 * @param {string} currentPath - Absolute filesystem path to current directory
 * @param {string} relativePath - Path relative to the app directory
 * @returns {Promise<RouteNode>} Route tree node representing current directory
 */
async function buildRouteTreeAsync(currentPath: string, relativePath: string): Promise<RouteNode> {
  const stats = await fs.promises.stat(currentPath);
  const basename = path.basename(currentPath);

  const isDynamicSegment =
    basename.startsWith("[") && basename.endsWith("]") && !basename.startsWith("[[");
  const isOptionalSegment = basename.startsWith("[[") && basename.endsWith("]]");
  const isGrouping = basename.startsWith("(") && basename.endsWith(")");

  let pathSegment = basename;

  if (isDynamicSegment) {
    pathSegment = ":" + basename.slice(1, -1);
  } else if (isOptionalSegment) {
    pathSegment = "*?";
  } else if (basename.startsWith("[...") && basename.endsWith("]")) {
    pathSegment = "*";
  } else if (isGrouping) {
    pathSegment = "";
  }

  const relativePathSegment = path.join(relativePath, basename);
  const nodeRelativePath = normalizePath(relativePathSegment);

  const node: RouteNode = {
    path: pathSegment,
    relativePath: nodeRelativePath,
    isDirectory: stats.isDirectory(),
    isLayout: false,
    isPage: false,
    isDynamicSegment,
    isOptionalSegment,
    isGrouping,
    children: [],
  };

  if (stats.isDirectory()) {
    const files = await fs.promises.readdir(currentPath);
    files.sort();

    node.isLayout = files.includes("layout.tsx");
    node.isPage = files.includes("page.tsx") || files.includes("route.ts");

    const childPromises = files
      .filter((file) => !["page.tsx", "layout.tsx", "route.ts"].includes(file))
      .map(async (file) => {
        const filePath = path.join(currentPath, file);
        try {
          const fileStats = await fs.promises.stat(filePath);
          if (fileStats.isDirectory()) {
            return buildRouteTreeAsync(filePath, nodeRelativePath);
          }
        } catch (err) {
          console.error(`Error stating file ${filePath}:`, err);
        }
        return null;
      });

    const childNodes = (await Promise.all(childPromises)).filter(
      (child): child is RouteNode => child !== null,
    );
    node.children = childNodes;
  }

  return node;
}

/**
 * Converts a route tree to React Router route configuration entries.
 *
 * @param {RouteNode} node - Current node in the route tree
 * @param {string} parentPath - URL path of the parent route
 * @returns {RouteConfigEntry[]} React Router route configuration entries
 */
function convertTreeToRoutes(node: RouteNode, parentPath: string = ""): RouteConfigEntry[] {
  // Calculate the path for the current node
  let currentPath: string;
  if (node.relativePath === "app") {
    currentPath = "/"; // Base path is root
  } else if (node.isGrouping) {
    currentPath = parentPath; // Grouping folders don't add to the path
  } else {
    const segment = node.path;
    if (!segment) {
      currentPath = parentPath || "/";
    } else if (parentPath === "/") {
      currentPath = `/${segment}`;
    } else {
      currentPath = parentPath ? `${parentPath}/${segment}` : segment;
    }
  }

  // Determine the component file path if it's a page route
  let componentPath: string | undefined = undefined;
  if (node.isPage) {
    try {
      const files = fs.readdirSync(path.join(process.cwd(), "src", node.relativePath));
      const hasPage = files.includes("page.tsx");
      const hasRoute = files.includes("route.ts");
      if (hasPage) {
        componentPath = normalizePath(`${node.relativePath}/page.tsx`);
      } else if (hasRoute) {
        componentPath = normalizePath(`${node.relativePath}/route.ts`);
      }
    } catch (e) {
      console.error(
        `Error reading directory for page check: ${path.join(process.cwd(), "src", node.relativePath)}`,
        e,
      );
    }
  }

  // Recursively convert children, passing the calculated currentPath
  const childRoutes = node.children.flatMap((child) => convertTreeToRoutes(child, currentPath));

  const currentLevelRoutes: RouteConfigEntry[] = [];

  if (node.isLayout) {
    const layoutPath = normalizePath(`${node.relativePath}/layout.tsx`);
    const layoutChildren = [...childRoutes];

    // If the layout node itself also has a page, add it as an index route *within* the layout
    if (componentPath) {
      layoutChildren.push({ index: true, file: componentPath });
    }

    // Only add layout if it has children or an index page
    if (layoutChildren.length > 0) {
      currentLevelRoutes.push(layout(layoutPath, layoutChildren));
    }
  } else {
    // Not a layout node

    // Add the page route if it exists
    if (componentPath) {
      // *** Use index: true for the root path instead of route("/") ***
      if (currentPath === "/") {
        // Define the root page using index: true at the top level
        currentLevelRoutes.push({ index: true, file: componentPath });
      } else {
        // Define other pages using route(path, file)
        currentLevelRoutes.push(route(currentPath, componentPath));
      }
    }

    // Add children processed earlier. React Router will handle nesting based on paths.
    currentLevelRoutes.push(...childRoutes);
  }

  return currentLevelRoutes;
}
