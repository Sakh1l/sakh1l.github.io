export interface NavigationItem {
  href: string;
  label: string;
}

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];
