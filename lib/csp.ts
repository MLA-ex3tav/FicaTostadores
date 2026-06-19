export function buildContentSecurityPolicy(
  nonce: string,
  isProduction: boolean,
): string {
  const scriptSrc = isProduction
    ? [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        "https://apis.google.com",
        "https://www.gstatic.com",
        "https://*.firebaseapp.com",
      ]
    : [
        "'self'",
        `'nonce-${nonce}'`,
        "'unsafe-eval'",
        "https://apis.google.com",
        "https://www.gstatic.com",
        "https://*.firebaseapp.com",
      ];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com",
    "frame-src https://accounts.google.com https://*.firebaseapp.com",
  ].join("; ");
}

export function createCspNonce(): string {
  return btoa(crypto.randomUUID());
}
