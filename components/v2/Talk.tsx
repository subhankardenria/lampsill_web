'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { PLAY_URL } from '@/lib/copy';

/**
 * THE TALK. The reason most people never set anything up isn't the app; it's
 * the conversation ("I'm not having you watch me"). So the page has that
 * conversation, out loud, and every answer in it is a true thing about
 * Lampsill: no location, nothing seen, nothing to press, asked first.
 *
 * It is an illustration, not a quote from a real family, and says so by being
 * between "You" and "Mum".
 *
 * Then one button sends the reader's own version to the person, through the
 * phone's share sheet (or copies it, where there isn't one).
 */
const CHAT: { me: boolean; t: string }[] = [
  { me: true, t: 'Mum, can I ask a favour? There’s an app I’d like you to put on your phone.' },
  { me: false, t: 'Is this one of those tracking apps? I’m not having you watching me.' },
  { me: true, t: 'No. It can’t see where you are, and I can’t see what you do on your phone.' },
  { me: true, t: 'It only notices if your phone hasn’t been used for a day or so.' },
  { me: false, t: 'And then what?' },
  { me: true, t: 'It asks you “Are you OK?” first. One tap and nobody is told. Only if you don’t answer do I get a message.' },
  { me: false, t: 'So I don’t have to do anything?' },
  { me: true, t: 'Nothing. Carry on as usual.' },
  { me: false, t: 'Fine. Send me the code, love.' },
];

const SHARE =
  'I’ve found an app called Lampsill. It can’t see where you are or what you do on your phone. It only notices if your phone ' +
  'hasn’t been used for a day or so, and then asks you “Are you OK?” first. Nothing to press each day. ' +
  `Would you put it on for me? ${PLAY_URL}`;

export default function Talk() {
  const calm = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, amount: 0.45 });
  const [n, setN] = useState(0);
  const [typing, setTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [round, setRound] = useState(0);

  // the messages arrive one by one, each after a moment of "typing"
  useEffect(() => {
    if (!seen) return;
    if (calm) {
      setN(CHAT.length);
      return;
    }
    if (n >= CHAT.length) return;
    const len = CHAT[n].t.length;
    const gap = n === 0 ? 150 : 320;
    const a = window.setTimeout(() => setTyping(true), gap);
    const b = window.setTimeout(() => {
      setTyping(false);
      setN((x) => x + 1);
    }, gap + Math.min(1100, 380 + len * 8));
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [seen, n, calm, round]);

  // keep the newest message in view inside the chat window
  useEffect(() => {
    const el = box.current?.querySelector('.v2-chat-scroll');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: calm ? 'auto' : 'smooth' });
  }, [n, typing, calm]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: SHARE });
        return;
      }
      await navigator.clipboard.writeText(SHARE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* the reader closed the share sheet */
    }
  };

  const next = CHAT[n];

  return (
    <section className="v2-talk" id="what-this-isnt" aria-labelledby="v2-talk-h">
      <div className="v2-wrap v2-talk-grid">
        <div className="v2-talk-copy">
          <p className="v2-eyebrow">&ldquo;She won&rsquo;t want it&rdquo;</p>
          <h2 id="v2-talk-h" className="v2-h2">
            The hardest part is asking. <em>So here&rsquo;s how it goes.</em>
          </h2>
          <p className="v2-body">
            Nobody living on their own wants to be watched, and Lampsill doesn&rsquo;t watch. No location, nothing
            from their phone shown to you, nothing for them to press. The only thing they&rsquo;ll ever notice is &ldquo;Are you
            OK?&rdquo;, if their phone has gone unused.
          </p>
        </div>

        <div className="v2-talk-cta">
          <div className="v2-talk-actions">
            <button type="button" className="v2-talk-send" onClick={share}>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                <path d="M3 10l14-6-5 13-2.5-5.2L3 10z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {copied ? 'Copied. Paste it to them.' : 'Send them a message about it'}
            </button>
            <button
              type="button"
              className="v2-link v2-talk-replay"
              onClick={() => {
                setN(0);
                setRound((r) => r + 1);
              }}
            >
              Play it again
            </button>
          </div>
          <p className="v2-talk-preview">
            <span>The message:</span> &ldquo;{SHARE.replace(` ${PLAY_URL}`, '')}&rdquo; and a link to the app.
          </p>
        </div>

        <div className="v2-chat" ref={box} aria-label="An example conversation between you and your mum">
          <div className="v2-chat-top" aria-hidden="true">
            <span className="v2-chat-av">M</span>
            <div>
              <b>Mum</b>
              <span>{typing && next && !next.me ? 'typing…' : 'online'}</span>
            </div>
          </div>
          <div className="v2-chat-scroll">
            <AnimatePresence initial={false}>
              {CHAT.slice(0, n).map((m, i) => (
                <motion.p
                  key={`${round}-${i}`}
                  className={`v2-bubble ${m.me ? 'me' : 'them'}`}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                >
                  {m.t}
                </motion.p>
              ))}
              {typing && next && (
                <motion.span
                  key={`t-${round}-${n}`}
                  className={`v2-bubble v2-typing ${next.me ? 'me' : 'them'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  aria-hidden="true"
                >
                  <i />
                  <i />
                  <i />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
