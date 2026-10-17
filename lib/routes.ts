export const WORKSPACE_ROOT = "/dashboard";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  docs: "/docs",
  overview: "/dashboard",
  generate: "/dashboard/generate",
  history: "/dashboard/history",
  playground: "/dashboard/playground",
  ticket: (id: string) => `/dashboard/tickets/${id}`,
};

export interface NavItem {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
}

export const NAV_PRIMARY: NavItem[] = [
  {
    label: "Generate",
    href: ROUTES.generate,
    isActive: (pathname) => pathname.startsWith(ROUTES.generate),
  },
  {
    label: "History",
    href: ROUTES.history,
    isActive: (pathname) =>
      pathname.startsWith(ROUTES.history) ||
      pathname.startsWith(`${WORKSPACE_ROOT}/tickets`),
  },
];
