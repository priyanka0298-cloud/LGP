// The app shell is server-rendered with its own data-accent, so live previews
// must update it as well as <html>, or the shell keeps the old color.
export function applyAccentAttribute(color: string) {
  document.documentElement.setAttribute("data-accent", color);
  document.querySelectorAll("[data-accent]").forEach((el) => el.setAttribute("data-accent", color));
}
