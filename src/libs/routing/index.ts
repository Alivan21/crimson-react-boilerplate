import fs from "fs";
import path from "path";
import { type RouteConfigEntry, route, layout, index } from "@react-router/dev/routes";

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
export async function nextJsStyleRoutes(appDir: string = "app"): Promise<RouteConfigEntry[]> {
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

  const node: RouteNode = {
    path: pathSegment,
    relativePath: normalizePath(relativePathSegment),
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

    node.isLayout = files.includes("layout.tsx");
    node.isPage = files.includes("page.tsx");

    // Process directories in parallel with Promise.all
    const childPromises = files
      .filter((file) => file !== "page.tsx" && file !== "layout.tsx")
      .map(async (file) => {
        const filePath = path.join(currentPath, file);
        const fileStats = await fs.promises.stat(filePath);

        if (fileStats.isDirectory()) {
          return buildRouteTreeAsync(filePath, normalizePath(path.join(relativePath, basename)));
        }
        return null;
      });

    // Wait for all child directories to be processed
    const childNodes = await Promise.all(childPromises);

    // Filter out null values (files that weren't directories)
    node.children = childNodes.filter((child): child is RouteNode => child !== null);
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
  const routes: RouteConfigEntry[] = [];

  let currentPath;
  if (node.path === "app") {
    currentPath = "";
  } else {
    currentPath =
      node.isGrouping || !node.path
        ? parentPath
        : parentPath
          ? `${parentPath}/${node.path}`
          : node.path;
  }

  if (node.isPage) {
    const componentPath = normalizePath(`${node.relativePath}/page.tsx`);

    if (currentPath === "") {
      routes.push(index(componentPath));
    } else {
      routes.push(route(currentPath, componentPath));
    }
  }

  if (node.isLayout) {
    const layoutPath = normalizePath(`${node.relativePath}/layout.tsx`);
    const childRoutes = node.children.flatMap((child) => convertTreeToRoutes(child, currentPath));

    if (childRoutes.length > 0) {
      routes.push(layout(layoutPath, childRoutes));
    }
  } else {
    node.children.forEach((child) => {
      routes.push(...convertTreeToRoutes(child, currentPath));
    });
  }

  return routes;
}
