import { appRouter } from "./libs/routing";

// Get all routes from the app directory and export them directly
// React Router dev requires an array of routes as the default export
export default await appRouter();
