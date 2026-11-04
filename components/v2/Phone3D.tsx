'use client';

import { motion, type MotionValue } from 'framer-motion';

/**
 * A phone in real 3D, built from CSS: a screen face, a back face, and a stack
 * of thin rounded slices between them for the edge, so it keeps its
 * thickness when it turns. No WebGL, so it is crisp at any size, costs
 * nothing to load, and the screen is the app's own screenshot
 * (dist/screens, drawn by the app's screen tool).
 *
 * Turning is the parent's business: pass rotateX/rotateY as motion values.
 *
 * `screens` lists every screen this phone will ever show. They are all in
 * the page from the start, stacked, and `src` picks the one that is lit, so
 * changing it is a crossfade between two pictures already loaded. (Swapping
 * one <img> for another left the phone blank while the next one downloaded.)
 */
const SLICES = 10;

export default function Phone3D({
  src,
  alt = '',
  rotateX,
  rotateY,
  className = '',
  screens,
}: {
  src: string;
  screens?: string[];
  alt?: string;
  rotateX?: MotionValue<number> | number;
  rotateY?: MotionValue<number> | number;
  className?: string;
}) {
  const all = screens ?? [src];
  return (
    <div className={`p3d ${className}`}>
      <motion.div className="p3d-body" style={{ rotateX, rotateY }}>
        {Array.from({ length: SLICES }, (_, i) => (
          <span key={i} className="p3d-slice" style={{ transform: `translateZ(${-i * 1.2}px)` }} />
        ))}
        <span className="p3d-back" style={{ transform: `translateZ(${-SLICES * 1.2}px) rotateY(180deg)` }} />
        <div className="p3d-front">
          <div className="p3d-screen">
            {all.map((s) => (
              <motion.img
                key={s}
                src={s}
                alt={s === src ? alt : ''}
                aria-hidden={s === src ? undefined : true}
                width={804}
                height={1748}
                decoding="async"
                initial={false}
                animate={{ opacity: s === src ? 1 : 0, scale: s === src ? 1 : 1.04 }}
                transition={{ duration: 0.45 }}
              />
            ))}
            <span className="p3d-glare" aria-hidden="true" />
          </div>
          <span className="p3d-island" aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  );
}
