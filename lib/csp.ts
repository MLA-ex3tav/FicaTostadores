export function buildContentSecurityPolicy(isProduction: boolean): string {
  // Production uses ISR/static pages (revalidate). Nonce-based CSP requires fully
  // dynamic rendering — Next.js inline bootstrap scripts would be blocked otherwise.
  const scriptSrc = isProduction
    ? [
        "'self'",
        "'unsafe-inline'",
        "https://apis.google.com",
        "https://www.gstatic.com",
        "https://*.firebaseapp.com",
      ]
    : [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://apis.google.com",
        "https://www.gstatic.com",
        "https://*.firebaseapp.com",
      ];

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com https://www.gstatic.com https://*.google.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.googleapis.com https://apis.google.com https://www.gstatic.com https://accounts.google.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com",
    "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.google.com",
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}
