'use client';

import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion';
import { Mark, Reveals } from '../Chrome';
import Faq from '../Faq';
import Hero from './Hero';
import Familiar from './Familiar';
import How from './How';
import Features from './Features';
import OneWord from './OneWord';
import Free from './Free';
import LampCta from './LampCta';
import Gap from './Gap';
import Talk from './Talk';
import Windows from './Windows';

/**
 * /v2 — a second home page, the same product told as a software product page
 * with motion (owner, 4 Nov 2026: "use framer motion in most creative way";
 * then "keep in mind it's a software product home page ... people should
 * resonate", with real photos allowed).
 *
 *   hero        a real street at night; her phone and yours, in 3D
 *   familiar    three moments people recognise, on photographs
 *   gap         how long a quiet phone goes unnoticed now, and with Lampsill
 *   how         four steps on the app's real screens, one pinned 3D phone
 *   talk        the conversation people dread, played out; send them a message
 *   features    a bento of what's in it, each tile with a working piece
 *   who         a block of flats: it isn't only parents
 *   one word    a watching app's clutter clears to one window and a word
 *   price       free until January 2027
 *   faq         the home page's own answers, unchanged
 *   lamp        a house at night, and the app's pull cord
 *
 * Night only: it sets the dark tokens on its own root whatever the theme.
 * MotionConfig reducedMotion="user" turns every transform into a jump for
 * readers who ask for less motion; the perpetual ones check for themselves.
 */
export default function V2Home({ children, productHunt = null }: { children?: React.ReactNode; productHunt?: string | null }) {
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <MotionConfig reducedMotion="user">
      <div className="v2">
        <Reveals />
        <motion.div className="v2-progress" style={{ scaleX: bar }} aria-hidden="true" />
        <header className="v2-top">
          <div className="v2-wrap v2-top-row">
            <a className="v2-lockup" href="#main" aria-label="Lampsill, back to top">
              <Mark className="v2-mark" />
              <span>Lampsill</span>
            </a>
            <nav className="v2-nav" aria-label="On this page">
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#privacy">Privacy</a>
              <a href="#faq">Questions</a>
              <a className="v2-nav-cta" href="#get">
                Get Lampsill
              </a>
            </nav>
          </div>
        </header>
        <main id="main">
          <Hero productHunt={productHunt} />
          <Familiar />
          <Gap />
          <How />
          <Talk />
          <Features />
          <Windows />
          <OneWord />
          <Free />
          <Faq />
          <LampCta />
        </main>
        {children}
      </div>
    </MotionConfig>
  );
}
