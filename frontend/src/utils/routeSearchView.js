export function getRouteSearchView(status, routes = []) {
  if (status === "loading") return "loading";
  if (status === "error") return "error";
  if (status === "success" && routes.length === 0) return "empty";
  if (status === "success") return "results";
  return "idle";
}
