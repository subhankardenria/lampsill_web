'use client';

import { useEffect, useState } from 'react';
import { APP_STORE_URL, FREE_UNTIL } from '@/lib/copy';
import { Mark } from './Chrome';
import { PlayBadge } from './PlayBadge';

/**
 * THE WAY TO DOWNLOAD FROM ANYWHERE ON THE PAGE (owner, 2 Nov 2026, drawings
 * A and B of three; C, a "before you go" pop-up, was left out because it
 * interrupts).
 *
 *   laptop   A, a lamp card in the corner with a QR code. A laptop can't
 *            install a phone app, so the card is a way onto a phone: point
 *            the camera at it and Google Play opens on Lampsill.
 *   phone    B, a slim bar at the foot of the screen. On Android, Google's
 *            badge opens the Play Store app on Lampsill; on an iPhone it says
 *            "iPhone soon" and offers the email address, until APP_STORE_URL
 *            is set.
 *
 * WHEN. Not on arrival: the card after the visitor has passed "How it works"
 * (they know what it is), the bar after the first screen. Once the visitor
 * reaches the price, where the badge is already in front of them, it is done
 * for that visit and does not come back, even scrolling up. (It used to step
 * aside only while the badge was on screen, and so came and went between the
 * price, the questions and the footer: owner, 2 Nov 2026, "it comes and goes
 * in certain area".) The × hides it for good on that browser.
 *
 * Nothing here covers what is being read in the middle of the page, and
 * nothing in it moves for a reader who asked for reduced motion.
 */
const KEY = 'lampsill.install.hidden';

type Kind = 'card' | 'android' | 'iphone';

function kindOfDevice(): Kind {
  const ua = navigator.userAgent;
  const iphone = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iphone) return 'iphone';
  if (/Android/.test(ua) || window.matchMedia('(max-width: 46rem)').matches) return 'android';
  return 'card';
}

export default function InstallPrompt() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [past, setPast] = useState(false);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(KEY) === '1');
    } catch {
      setHidden(false);
    }
    const k = kindOfDevice();
    setKind(k);

    // The card waits for the end of "How it works"; the bar for one screen.
    const how = document.getElementById('how');
    const onScroll = () => {
      const after = k === 'card' && how ? how.offsetTop + how.offsetHeight * 0.6 : window.innerHeight;
      setPast(window.scrollY > after);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Done for this visit once the page itself shows the badge: from the
    // price on. A quarter of the screen in, so brushing the edge doesn't count.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDone(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -25% 0px' },
    );
    document.querySelectorAll('#price, #get, footer.footer').forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  function hide() {
    setHidden(true);
    try {
      localStorage.setItem(KEY, '1');
    } catch {}
  }

  if (!kind || hidden) return null;
  const shown = past && !done;

  if (kind === 'card') {
    return (
      <aside className={`install-card${shown ? ' shown' : ''}`} aria-label="Get Lampsill" inert={!shown}>
        <button className="install-x" type="button" onClick={hide} aria-label="Hide">
          &times;
        </button>
        <div className="install-top">
          <span className="install-glow" aria-hidden="true">
            <Mark className="install-mark" />
          </span>
          <div>
            <p className="install-title">
              Leave a light on <em>tonight.</em>
            </p>
            <p className="install-sub">Free until {FREE_UNTIL}</p>
          </div>
        </div>
        <div className="install-qr-row">
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed QR code */}
          <img className="install-qr" src="/google-play-qr.svg" width={104} height={104} alt="QR code for Lampsill on Google Play" />
          <div>
            <p>Point your phone&rsquo;s camera here. Google Play opens on Lampsill.</p>
            <PlayBadge height={46} />
          </div>
        </div>
      </aside>
    );
  }

  // Android gets Google's own badge (owner, 2 Nov 2026: "instead of install
  // can we put google button there too"); an iPhone gets a plain button,
  // since a Play badge is no use to it.
  const iphoneSoon = kind === 'iphone' && !APP_STORE_URL;
  return (
    <aside className={`install-bar${shown ? ' shown' : ''}`} aria-label="Get Lampsill" inert={!shown}>
      <Mark className="install-mark" />
      <p className="install-bar-text">
        <b>Lampsill</b>
        <span>{iphoneSoon ? 'iPhone soon' : `Free until ${FREE_UNTIL.split(' ')[0]}`}</span>
      </p>
      {kind === 'android' ? (
        <PlayBadge height={48} />
      ) : iphoneSoon ? (
        <a className="install-go" href="mailto:hello@lampsill.com?subject=Tell%20me%20when%20Lampsill%20is%20on%20iPhone">
          Tell me
        </a>
      ) : (
        <a className="install-go" href={APP_STORE_URL!} target="_blank" rel="noopener">
          Get it
        </a>
      )}
      <button className="install-x" type="button" onClick={hide} aria-label="Hide">
        &times;
      </button>
    </aside>
  );
}
