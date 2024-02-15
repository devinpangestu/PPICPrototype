import { useLocation, useRouteMatch } from "react-router-dom";

export const CustomRedirect = ({ path, to }) => {
  const location = useLocation();
  const routeMatch = useRouteMatch(location.pathname);

  if (!to || routeMatch === null) {
    window.location.replace("/");
    return;
  }

  window.location.replace(to);
};
