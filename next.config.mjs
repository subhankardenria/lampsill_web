/**
 * The CSP is markedly tighter than the static site's was, and that is the one
 * concrete thing moving to Next.js bought us that nothing else could:
 *
 *   - GSAP and Lenis are npm dependencies now, so `script-src` no longer has to
 *     allow cdnjs.cloudflare.com. An allowed CDN is an allowed CDN — anything
 *     that ever gets injected into the page can load from it.
 *   - next/font self-hosts the three typefaces at build time, so neither
 *     fonts.googleapis.com nor fonts.gstatic.com is in here either.
 *
 * What remains: 'unsafe-inline' for styles, which Next needs for its own
 * injected CSS, and 'unsafe-eval' in development only, which the dev overlay
 * needs. Production gets neither.
 */
const dev = process.env.NODE_ENV === 'development';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  // Stripe Checkout is a redirect to their domain, so nothing is framed and
  // nothing of theirs is loaded here. The connect-src is our own route only.
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* DEV ONLY: let the page start when opened at the "Network" address Next
     prints (e.g. http://192.168.29.26:3000) — how you test on a real phone.
     Without this Next 16 blocks its dev connection from any non-localhost
     origin, React never starts in the browser, and every section that waits
     for JavaScript stays invisible. Private-network ranges only; matched per
     dot-separated segment, so a new DHCP address still matches. Ignored by
     `next build` / production. */
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '*.local'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
