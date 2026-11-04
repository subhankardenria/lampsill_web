'use client';

import { AnimatePresence, motion, type MotionValue } from 'framer-motion';

/**
 * A phone in real 3D, built from CSS: a screen face, a back face, and a stack
 * of thin rounded slices between them for the edge, so it keeps its
 * thickness when it turns. No WebGL, so it is crisp at any size, costs
 * nothing to load, and the screen is the app's own screenshot
 * (dist/screens, drawn by the app's screen tool).
 *
 * Turning is the parent's business: pass rotateX/rotateY as motion values.
 * When `src` changes, the new screen crossfades in over the old one.
 */
const SLICES = 10;

export default function Phone3D({
  src,
  alt = '',
  rotateX,
  rotateY,
  className = '',
}: {
  src: string;
  alt?: string;
  rotateX?: MotionValue<number> | number;
  rotateY?: MotionValue<number> | number;
  className?: string;
}) {
  return (
    <div className={`p3d ${className}`}>
      <motion.div className="p3d-body" style={{ rotateX, rotateY }}>
        {Array.from({ length: SLICES }, (_, i) => (
          <span key={i} className="p3d-slice" style={{ transform: `translateZ(${-i * 1.2}px)` }} />
        ))}
        <span className="p3d-back" style={{ transform: `translateZ(${-SLICES * 1.2}px) rotateY(180deg)` }} />
        <div className="p3d-front">
          <div className="p3d-screen">
            <AnimatePresence initial={false}>
              <motion.img
                key={src}
                src={src}
                alt={alt}
                width={804}
                height={1748}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            </AnimatePresence>
            <span className="p3d-glare" aria-hidden="true" />
          </div>
          <span className="p3d-island" aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  );
}
