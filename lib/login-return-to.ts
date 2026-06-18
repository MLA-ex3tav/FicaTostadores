export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) {
    return "/";
  }

  const path = value.trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("/iniciar-sesion") ||
    path.startsWith("/admin/login")
  ) {
    return "/";
  }

  return path;
}

export function buildLoginHref(returnTo: string): string {
  return `/iniciar-sesion?returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`;
}
