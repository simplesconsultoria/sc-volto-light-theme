export type NavigationItem = {
  title: string;
  nav_title?: string;
  description?: string;
  url: string;
  items?: NavigationItem[];
};
