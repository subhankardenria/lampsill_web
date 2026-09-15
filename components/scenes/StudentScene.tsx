/**
 * THE STUDENT BUILDING — Adam's, for "A son or daughter".
 *
 * Derived from StreetScene and bound by the same id contract (see the comment
 * at the top of that file): the engine animates #winMain, #doorLight, #winNbr
 * and the rest by id, so this scene supplies every one of them. Adam's window
 * sits at the street window's exact coordinates for the same reason.
 */
export default function StudentScene() {
  return (
            <svg className="scene-svg" id="scene" viewBox="0 0 200 132" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <defs>
            <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#04070A"/><stop offset="52%" stopColor="#0A121A"/><stop offset="100%" stopColor="#17262F"/>
            </linearGradient>
            <linearGradient id="dawnG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D3B58"/><stop offset="58%" stopColor="#5C7890"/><stop offset="100%" stopColor="#C6AF91"/>
            </linearGradient>
            <radialGradient id="moonG"><stop offset="0%" stopColor="#AFCCE6" stopOpacity=".12"/><stop offset="100%" stopColor="#AFCCE6" stopOpacity="0"/></radialGradient>

            <linearGradient id="wallA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1C2832"/><stop offset="100%" stopColor="#0A1016"/></linearGradient>
            <linearGradient id="wallB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#131C24"/><stop offset="100%" stopColor="#070C11"/></linearGradient>
            <linearGradient id="wallC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0D151C"/><stop offset="100%" stopColor="#05090D"/></linearGradient>
            <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#111E28"/><stop offset="100%" stopColor="#090F15"/></linearGradient>
            <linearGradient id="sillG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4A5F70"/><stop offset="42%" stopColor="#2B3A46"/><stop offset="100%" stopColor="#121A21"/></linearGradient>
            <linearGradient id="woodG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#161D24"/><stop offset="100%" stopColor="#090E13"/></linearGradient>
            <linearGradient id="pavG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#151D24"/><stop offset="100%" stopColor="#090E13"/></linearGradient>

            {/* three hues, each a complete little lighting kit. Cross-fading
            whole groups rather than tweening stop-colours: GSAP will
            happily animate a gradient stop and browsers disagree about
            what that means mid-flight, and a safety product's alarm
            colour is not the place to find out which one you got. */}
            <radialGradient id="hot-gold"><stop offset="0%" stopColor="#FFE7BC" stopOpacity=".95"/><stop offset="48%" stopColor="#F5C97B" stopOpacity=".42"/><stop offset="100%" stopColor="#F5C97B" stopOpacity="0"/></radialGradient>
            <radialGradient id="hot-ember"><stop offset="0%" stopColor="#FFD2BB" stopOpacity=".82"/><stop offset="48%" stopColor="#F0A184" stopOpacity=".38"/><stop offset="100%" stopColor="#F0A184" stopOpacity="0"/></radialGradient>
            <radialGradient id="hot-alarm"><stop offset="0%" stopColor="#FFCBD2" stopOpacity=".95"/><stop offset="48%" stopColor="#FF919D" stopOpacity=".46"/><stop offset="100%" stopColor="#FF919D" stopOpacity="0"/></radialGradient>
            <radialGradient id="air-gold"><stop offset="0%" stopColor="#F5C97B" stopOpacity=".30"/><stop offset="46%" stopColor="#F5C97B" stopOpacity=".10"/><stop offset="100%" stopColor="#F5C97B" stopOpacity="0"/></radialGradient>
            <radialGradient id="air-ember"><stop offset="0%" stopColor="#F0A184" stopOpacity=".26"/><stop offset="46%" stopColor="#F0A184" stopOpacity=".09"/><stop offset="100%" stopColor="#F0A184" stopOpacity="0"/></radialGradient>
            <radialGradient id="air-alarm"><stop offset="0%" stopColor="#FF919D" stopOpacity=".34"/><stop offset="46%" stopColor="#FF919D" stopOpacity=".12"/><stop offset="100%" stopColor="#FF919D" stopOpacity="0"/></radialGradient>
            <linearGradient id="doorG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFE3B4" stopOpacity=".85"/><stop offset="100%" stopColor="#F5C97B" stopOpacity=".22"/></linearGradient>
            <linearGradient id="spill-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F5C97B" stopOpacity=".34"/><stop offset="100%" stopColor="#F5C97B" stopOpacity="0"/></linearGradient>
            <linearGradient id="spill-ember" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F0A184" stopOpacity=".28"/><stop offset="100%" stopColor="#F0A184" stopOpacity="0"/></linearGradient>
            <linearGradient id="spill-alarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF919D" stopOpacity=".36"/><stop offset="100%" stopColor="#FF919D" stopOpacity="0"/></linearGradient>

            <filter id="blurBig" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3.4"/></filter>
            {/* the spill keeps an EDGE. Light through a window casts a
            trapezoid with a soft border, not a cloud; blurring it to
            4 units turned it into cotton wool on the wall. */}
            <filter id="blurSpill" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="1.9"/></filter>
            <filter id="blurMid" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="1.6"/></filter>
            {/* plaster. 5% of monochrome noise over a dark wall is the
            difference between a painted surface and a fill colour. */}
            <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".92" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            </filter>
            <clipPath id="glassClip"><path d="M62 96 L62 50 L102 50 L102 96 Z"/></clipPath>
            <clipPath id="glassClipB"><path d="M110 96 L110 50 L150 50 L150 96 Z"/></clipPath>
            </defs>

            {/* ================= SKY ================= */}
            <g id="skyLayer">
            <rect x="-12" y="-14" width="224" height="160" fill="url(#skyG)"/>
            <rect id="dawnRect" x="-12" y="-14" width="224" height="160" fill="url(#dawnG)" opacity="0"/>
            <ellipse cx="30" cy="12" rx="48" ry="36" fill="url(#moonG)"/>
            <g id="stars" fill="#DCE9F2">
            <circle cx="18" cy="16" r=".7" opacity=".8"/><circle cx="46" cy="9"  r=".45" opacity=".5"/>
            <circle cx="72" cy="19" r=".55" opacity=".65"/><circle cx="96" cy="8"  r=".4"  opacity=".45"/>
            <circle cx="118" cy="21" r=".6" opacity=".7"/><circle cx="139" cy="12" r=".45" opacity=".5"/>
            <circle cx="158" cy="26" r=".7" opacity=".75"/><circle cx="176" cy="14" r=".5" opacity=".55"/>
            <circle cx="190" cy="33" r=".55" opacity=".6"/><circle cx="8"  cy="34" r=".45" opacity=".45"/>
            <circle cx="60" cy="30" r=".4"  opacity=".4"/><circle cx="108" cy="34" r=".45" opacity=".45"/>
            </g>
            </g>

            {/* ================= THE BUILDING ================= */}
            {/* A block of student rooms at night, seen from the car park. Same
            materials as the street — gradient walls, a lit parapet edge, grain —
            so it reads as the same world, one life-stage later. Adam's room is
            at exactly the street window's coordinates, because the lighting
            kits, the rings and the breathing lamp are positioned for it. */}
            <g id="street">
            {/* a taller block further back, and the reason there is depth */}
            <g id="blockFar">
            <rect x="170" y="8" width="40" height="124" fill="url(#wallC)"/>
            <rect x="170" y="8" width="40" height=".8" fill="#26333D" opacity=".7"/>
            <rect x="178" y="16" width="7" height="9" fill="#0A1117"/>
            <rect x="190" y="16" width="7" height="9" fill="#0A1117"/>
            <rect x="178" y="30" width="7" height="9" fill="#3A3424" opacity=".55"/>
            <rect x="190" y="30" width="7" height="9" fill="#0A1117"/>
            </g>

            <rect x="-6" y="24" width="182" height="112" fill="url(#wallA)"/>
            {/* parapet: a band with its own shadow, like the street's eaves */}
            <rect x="-6" y="21.5" width="184" height="3.2" fill="#44586A"/>
            <rect x="-6" y="24.7" width="182" height="1.2" fill="#03060A" opacity=".7"/>
            <rect x="174.8" y="24" width="1.2" height="112" fill="#03060A" opacity=".55"/>
            {/* floor slab lines */}
            <g fill="#9FB6C6" opacity=".05">
            <rect x="-6" y="44" width="182" height=".5"/>
            <rect x="-6" y="103" width="182" height=".5"/>
            </g>

            {/* the other rooms on Adam's floor: dark, one dim — someone up late */}
            <rect x="14" y="50" width="40" height="46" fill="#070C11"/>
            <rect x="14" y="50" width="40" height="46" fill="none" stroke="#2A3A47" strokeWidth="2.2"/>
            <rect x="14" y="50" width="40" height="7" fill="#0D141A"/>
            <rect x="12" y="96" width="44" height="2.6" fill="url(#sillG)"/>

            {/* the floor below: tops of windows, one warm with a desk lamp */}
            <rect x="14" y="110" width="40" height="30" fill="#2A2517"/>
            <rect x="14" y="110" width="40" height="30" fill="none" stroke="#2A3A47" strokeWidth="2.2"/>
            <rect x="62" y="110" width="40" height="30" fill="#070C11"/>
            <rect x="62" y="110" width="40" height="30" fill="none" stroke="#2A3A47" strokeWidth="2.2"/>
            <rect x="110" y="110" width="40" height="30" fill="#070C11"/>
            <rect x="110" y="110" width="40" height="30" fill="none" stroke="#2A3A47" strokeWidth="2.2"/>

            {/* stairwell glazing, dark until the hall lights come on */}
            <rect x="157" y="28" width="11" height="108" fill="#060A0E"/>
            <rect x="157" y="28" width="11" height="108" fill="none" stroke="#2A3A47" strokeWidth="1.6"/>
            <g fill="#2A3A47">
            <rect x="157" y="44" width="11" height="1"/>
            <rect x="157" y="103" width="11" height="1"/>
            </g>

            {/* grain over the lot */}
            <rect x="-6" y="16" width="216" height="120" filter="url(#grain)" opacity=".05"/>
            </g>

            {/* ============ LIGHT THAT LANDS ON THINGS ============ */}
            {/* behind the window: the bloom in the air and the spill down
            the wall onto the pavement. Three hues, cross-faded. */}
            <g id="out-gold" opacity="0">
            <polygon points="57,101 105,101 124,126 38,126" fill="url(#spill-gold)" filter="url(#blurSpill)"/>
            <ellipse cx="82" cy="76" rx="52" ry="48" fill="url(#air-gold)"/>
            </g>
            <g id="out-ember" opacity="0">
            <polygon points="57,101 105,101 124,126 38,126" fill="url(#spill-ember)" filter="url(#blurSpill)"/>
            <ellipse cx="82" cy="76" rx="52" ry="48" fill="url(#air-ember)"/>
            </g>
            <g id="out-alarm" opacity="0">
            <polygon points="57,101 105,101 124,126 38,126" fill="url(#spill-alarm)" filter="url(#blurSpill)"/>
            <ellipse cx="82" cy="76" rx="52" ry="48" fill="url(#air-alarm)"/>
            </g>

            {/* the alarm, radiating off the window */}
            <g id="rings" opacity="0">
            <circle className="rr" cx="82" cy="72" r="26" fill="none" stroke="#FF919D" strokeWidth="1.2"/>
            <circle className="rr" cx="82" cy="72" r="26" fill="none" stroke="#FF919D" strokeWidth="1.2"/>
            <circle className="rr" cx="82" cy="72" r="26" fill="none" stroke="#FF919D" strokeWidth="1.2"/>
            </g>

            {/* ================= THE WINDOW ================= */}
            <g id="winMain">
            <g clipPath="url(#glassClip)">
            <path d="M62 96 L62 50 L102 50 L102 96 Z" fill="url(#glassG)"/>

            {/* the lamp's own light, inside the room */}
            <g id="in-gold"  opacity="0"><ellipse cx="74" cy="89" rx="28" ry="18" fill="url(#hot-gold)"/></g>
            <g id="in-ember" opacity="0"><ellipse cx="74" cy="89" rx="28" ry="18" fill="url(#hot-ember)"/></g>
            <g id="in-alarm" opacity="0"><ellipse cx="74" cy="89" rx="28" ry="18" fill="url(#hot-alarm)"/></g>

            {/* THE LAMP, as a silhouette. This is the whole brand in one
            shape and it must stay a shape: the moment it becomes a
            bright rectangle it is a status pill again.
            It stands in the LEFT pane, not the middle. Centred, the
            glazing bar runs straight down it and it reads as two
            black trapezoids rather than one lamp — and a lamp put
            down off to one side is where a lamp actually goes. */}
            <g id="lamp" fill="#04070A">
            <path d="M65.8 79 L78.2 79 L80.6 87.4 L63.4 87.4 Z"/>
            <rect x="70.8" y="87.4" width="2.4" height="5.4"/>
            <ellipse cx="72" cy="93.4" rx="5.6" ry="1.6"/>
            </g>
            <path d="M65.8 79 L78.2 79" stroke="#7C8B96" strokeWidth=".55" opacity=".45"/>
            {/* the lip under the shade, where the bulb actually is. A
            silhouette with no hot edge reads as a cut-out; one
            bright line along the bottom reads as a lamp that is on. */}
            {/* a desk edge and a stack of books beside the lamp, and a roller
            blind half down: the three things that make it a student's room */}
            <rect x="60" y="93.6" width="44" height="3" fill="#04070A"/>
            <g fill="#04070A">
            <rect x="86" y="88.6" width="11" height="2.4"/>
            <rect x="87" y="86.4" width="9" height="2.2"/>
            <rect x="85.6" y="91" width="12" height="2.6"/>
            </g>
            <path id="lampLip" d="M63.4 87.4 L80.6 87.4" stroke="#FFE9C4" strokeWidth="1.5" opacity=".6" filter="url(#blurMid)"/>

            {/* sheen. Two soft diagonals: glass is only legible as glass
            when something reflects off it. */}
            <rect x="50" y="36" width="11" height="78" fill="#BDD9F1" opacity=".075" transform="rotate(-19 58 74)"/>
            <rect x="66" y="36" width="4.5" height="78" fill="#BDD9F1" opacity=".045" transform="rotate(-19 58 74)"/>

            {/* GLAZING BARS, INSIDE THE CLIP. A dark bar with a lit edge
            on it: one tone is a line, two tones is a piece of wood.
            They live inside the glass clip-path rather than being
            positioned to fit, because bars drawn free-hand overshoot
            the glass the moment anything about the opening changes —
            which is exactly what had happened next door, where the
            bar ran up out of the arch and eight units into the
            brickwork. Clipped, that is not a mistake anyone can
            make again. */}
            <rect x="60" y="50" width="44" height="9" fill="#0B1117"/>
            <rect x="60" y="58.6" width="44" height=".9" fill="#2A3A47"/>
            <g id="mullions">
            <rect x="80.7" y="42" width="2.6" height="54" fill="#0A1218"/>
            <rect x="80.7" y="42" width=".8"  height="54" fill="#6F8DA6" opacity=".55"/>
            <rect x="60" y="68.7" width="44" height="2.6" fill="#0A1218"/>
            <rect x="60" y="68.7" width="44" height=".8"  fill="#6F8DA6" opacity=".55"/>
            </g>
            </g>


            {/* frame: recess shadow, then the frame, then the edge that
            catches the skylight */}
            <path d="M62 96 L62 50 L102 50 L102 96 Z" fill="none" stroke="#04070A" strokeWidth="5" strokeLinejoin="round"/>
            <path id="frameMain" d="M62 96 L62 50 L102 50 L102 96 Z" fill="none" stroke="#4A5E70" strokeWidth="2.8" strokeLinejoin="round"/>
            <path d="M62 96 L62 50 L102 50 L102 96 Z" fill="none" stroke="#9CBEDA" strokeWidth=".7" strokeLinejoin="round" opacity=".32" transform="translate(0,-0.7)"/>

            {/* THE SILL. Lit on top, shadowed underneath. It is the single
            most convincing object in the picture for exactly that
            reason, and it costs three rectangles. */}
            <rect x="58" y="99" width="48" height="2.6" fill="#04070A" opacity=".7" filter="url(#blurMid)"/>
            <rect x="58" y="96" width="48" height="3" rx=".4" fill="url(#sillG)"/>
            <rect x="58" y="96" width="48" height=".8" rx=".4" fill="#93AEC2" opacity=".75"/>
            </g>

            {/* warm wash on the sill itself, over the stone */}
            <g id="sillWash" opacity="0">
            <rect x="59" y="95" width="44" height="3.2" fill="#F5C97B" opacity=".38" filter="url(#blurMid)"/>
            </g>

            {/* THE HALL LIGHTS. There is no front door to open in a student
            block; the visible sign that Sam is on his way down the corridor is
            the stairwell glazing lighting up, floor by floor. Same id as the
            street's open door, so the engine needs no changes. */}
            <g id="doorway">
            <g id="doorLight" opacity="0">
            <rect x="158" y="29" width="9" height="106" fill="#F5C97B" opacity=".42"/>
            <rect x="158" y="29" width="1" height="106" fill="#FFE9C4" opacity=".7"/>
            <ellipse cx="162.5" cy="80" rx="14" ry="56" fill="url(#air-gold)"/>
            </g>
            </g>

            {/* SAM'S ROOM. Dark all story, lit at the end — the payoff is the
            same as on the street: two lights on instead of one. */}
            <g id="winNbr">
            <g clipPath="url(#glassClipB)">
            <path d="M110 96 L110 50 L150 50 L150 96 Z" fill="url(#glassG)"/>
            <g id="in-nbr" opacity="0"><ellipse cx="130" cy="88" rx="24" ry="16" fill="url(#hot-gold)"/></g>
            <rect x="100" y="40" width="9" height="70" fill="#BDD9F1" opacity=".06" transform="rotate(-19 120 72)"/>
            <rect x="108" y="50" width="44" height="12" fill="#0B1117"/>
            <rect x="108" y="61.6" width="44" height=".9" fill="#2A3A47"/>
            </g>
            <path d="M110 96 L110 50 L150 50 L150 96 Z" fill="none" stroke="#04070A" strokeWidth="5" strokeLinejoin="round"/>
            <path d="M110 96 L110 50 L150 50 L150 96 Z" fill="none" stroke="#4A5E70" strokeWidth="2.8" strokeLinejoin="round"/>
            <rect x="106" y="99" width="48" height="2.6" fill="#04070A" opacity=".7" filter="url(#blurMid)"/>
            <rect x="106" y="96" width="48" height="3" rx=".4" fill="url(#sillG)"/>
            <rect x="106" y="96" width="48" height=".8" rx=".4" fill="#93AEC2" opacity=".7"/>
            </g>
            <g id="out-nbr" opacity="0">
            <polygon points="108,99 152,99 166,124 94,124" fill="url(#spill-gold)" filter="url(#blurSpill)"/>
            <ellipse cx="130" cy="78" rx="36" ry="32" fill="url(#air-gold)"/>
            </g>

            {/* THE CLOCK. Deliberately not part of the world — it sits on the
            bottom edge like a scrubber, because it is the reader's
            instrument, not Adam's. */}
            <path id="arcbg" d="M20 128.5 L180 128.5" stroke="#1C2932" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0"/>
            <path id="arc"   d="M20 128.5 L180 128.5" stroke="#F5C97B" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0"/>
            </svg>
  );
}
