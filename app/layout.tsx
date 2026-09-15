import type { Metadata, Viewport } from 'next';
import { Newsreader, Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './sections.css';
import LightField from '@/components/LightField';
import SmoothScroll from '@/components/SmoothScroll';

/* next/font downloads and self-hosts these at build time, which is what lets
   the CSP drop fonts.googleapis.com and fonts.gstatic.com entirely. It also
   removes the render-blocking round trip the <link> version cost. */
const display = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});
const body = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lampsill.com'),
  title: 'Lampsill — If their phone goes quiet, Lampsill tells you',
  description: `For anyone you love who lives alone. If their phone goes quiet, it rings them first. No answer? You're told, and one tap asks someone nearby to knock.`,
  openGraph: {
    title: 'Lampsill — If their phone goes quiet, Lampsill tells you',
    description: `Their phone rings first. If they don't answer, you're told.`,
    type: 'website',
    url: 'https://lampsill.com',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A1014' },
    { media: '(prefers-color-scheme: light)', color: '#FBF9F5' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* PROGRESSIVE ENHANCEMENT. Every "hidden until animated" rule in the
            CSS is scoped to html[data-js], so with no JavaScript — or with
            JavaScript that loads but never gets React running — the page is
            simply all visible, just not animated. This runs before first
            paint, so there is no flash of content that then disappears.

            The 4-second failsafe is for the case that actually happened: the
            scripts arrived but React never started (the dev server blocked its
            connection), and the headline stayed invisible for good. <Reveals>
            sets data-ready once React is running; if that hasn't happened in 4
            seconds, data-js is removed and everything is shown.

            Attributes, not classes, because React owns <html>'s className and
            would wipe a class it didn't render. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.setAttribute('data-js','');setTimeout(function(){if(!d.hasAttribute('data-ready'))d.removeAttribute('data-js')},4000)})();",
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        <LightField />
        {children}
      </body>
    </html>
  );
}
