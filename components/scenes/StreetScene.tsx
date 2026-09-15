/**
 * THE STREET — Anna's street, and the reader's own for "Myself".
 *
 * Every element the story engine animates is addressed by id, and the student
 * scene provides the same ids with different architecture. That contract is
 * what lets one engine — with all four of its ordering fixes — drive both
 * pictures. If you add an animated element here, add it there too:
 *   #scene #skyLayer #dawnRect #stars #street #blockFar
 *   #winMain #frameMain #lamp #lampLip #in-gold #in-ember #in-alarm
 *   #out-gold #out-ember #out-alarm #rings .rr #sillWash
 *   #doorLight #winNbr #in-nbr #out-nbr #arc #arcbg
 */
export default function StreetScene() {
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
            <clipPath id="glassClip"><path d="M62 96 L62 64 A20 20 0 0 1 102 64 L102 96 Z"/></clipPath>
            <clipPath id="glassClipB"><path d="M152 96 L152 72 A12 12 0 0 1 176 72 L176 96 Z"/></clipPath>
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

            {/* ================= THE STREET ================= */}
            {/* EVERY BUILDING IS BUILT THE SAME WAY, from the top down:
            an eaves band that oversails, its shadow on the wall below,
            the wall, courses, and a plinth at the bottom. A roofline
            drawn as one bright hairline reads as a cut edge; a band
            with a shadow under it reads as something with a thickness
            that the moon is landing on. */}
            <g id="street">
            {/* far left block: unlit, and the reason the scene has depth */}
            <g id="blockFar">
            <rect x="-6" y="57" width="50" height="75" fill="url(#wallC)"/>
            <rect x="-7" y="54.6" width="52" height="2.6" rx=".3" fill="#1C2832"/>
            <rect x="-6" y="57.2" width="50" height="1" fill="#03060A" opacity=".6"/>
            <rect x="-6" y="114" width="50" height="18" fill="#070C10"/>
            <rect x="-6" y="114" width="50" height=".5" fill="#31404B" opacity=".4"/>
            <rect x="10" y="70" width="15" height="18" rx=".6" fill="#060A0E"/>
            <rect x="10" y="70" width="15" height="18" rx=".6" fill="none" stroke="#1A2630" strokeWidth=".8"/>
            <rect x="17.1" y="70" width=".8" height="18" fill="#1A2630" opacity=".6"/>
            <rect x="8.4" y="88" width="18.2" height="1.7" rx=".4" fill="#27333D"/>
            </g>

            {/* neighbour, right */}
            <g id="houseB">
            <rect x="130" y="48" width="78" height="84" fill="url(#wallB)"/>
            <rect x="129" y="45.6" width="80" height="2.6" rx=".3" fill="#32424E"/>
            <rect x="130" y="48.2" width="78" height="1" fill="#03060A" opacity=".65"/>
            <rect x="130" y="48" width="1" height="84" fill="#03060A" opacity=".5"/>
            <g fill="#9FB6C6" opacity=".045">
            <rect x="130" y="64" width="78" height=".5"/>
            <rect x="130" y="92" width="78" height=".5"/>
            </g>
            <rect x="130" y="114" width="78" height="18" fill="#0A1015"/>
            <rect x="130" y="114" width="78" height=".5" fill="#3A4A57" opacity=".45"/>
            </g>

            {/* ROSA'S HOUSE.
            The wall top was at y=44 and the window's arch apex was
            ALSO at 44, so the window — and the 7.4-wide recess shadow
            drawn around it — sat on top of the roofline with the sky
            showing through. The wall now starts at 33 and the arch
            tops out at 44, which leaves six units of brickwork above
            the darkest part of the reveal. */}
            <g id="houseA">
            <rect x="52" y="18" width="9" height="15" fill="url(#wallA)"/>
            <rect x="50.8" y="16.6" width="11.4" height="2" rx=".4" fill="#3B4D5C"/>
            <rect x="44" y="33" width="86" height="99" fill="url(#wallA)"/>
            <rect x="42.4" y="30.2" width="89.2" height="2.9" rx=".3" fill="#44586A"/>
            <rect x="44" y="33.1" width="86" height="1.3" fill="#03060A" opacity=".7"/>
            {/* corners. One side takes the moon, the other is in its own
            shadow — without this the house is a sticker on a wall. */}
            <rect x="44" y="34" width="1" height="98" fill="#5A7286" opacity=".32"/>
            <rect x="128.7" y="34" width="1.3" height="98" fill="#03060A" opacity=".55"/>
            {/* render courses */}
            <g fill="#9FB6C6" opacity=".05">
            <rect x="44" y="50"  width="86" height=".5"/>
            <rect x="44" y="78"  width="86" height=".5"/>
            <rect x="44" y="106" width="86" height=".5"/>
            </g>
            {/* plinth */}
            <rect x="44" y="115" width="86" height="17" fill="#0B1218"/>
            <rect x="44" y="115" width="86" height=".6" fill="#495E6E" opacity=".45"/>
            {/* downpipe, hopper, brackets, shoe. Nothing says "a real
            building" faster than the boring plumbing on the front. */}
            <g id="pipe">
            <rect x="46.6" y="34.4" width="2.4" height="88" fill="#0C1319"/>
            <rect x="46.6" y="34.4" width=".8" height="88" fill="#4E6274" opacity=".5"/>
            <rect x="45.4" y="33.6" width="4.8" height="2.2" rx=".4" fill="#17212B"/>
            <rect x="45.8" y="56"  width="4" height="1.4" rx=".3" fill="#1A242E"/>
            <rect x="45.8" y="86"  width="4" height="1.4" rx=".3" fill="#1A242E"/>
            <rect x="45.8" y="112" width="4" height="1.4" rx=".3" fill="#1A242E"/>
            <path d="M46.6 122.4 L49 122.4 L50.8 125.4 L46.6 125.4 Z" fill="#0C1319"/>
            </g>
            </g>

            {/* pavement: slabs with joints, and a kerb with a lit top */}
            <rect x="-6" y="123" width="216" height="9" fill="url(#pavG)"/>
            <rect x="-6" y="123" width="216" height=".7" fill="#374751" opacity=".5"/>
            <g fill="#5C707E" opacity=".085">
            <rect x="6"   y="123" width=".5" height="9"/>
            <rect x="34"  y="123" width=".5" height="9"/>
            <rect x="62"  y="123" width=".5" height="9"/>
            <rect x="90"  y="123" width=".5" height="9"/>
            <rect x="118" y="123" width=".5" height="9"/>
            <rect x="146" y="123" width=".5" height="9"/>
            <rect x="174" y="123" width=".5" height="9"/>
            </g>

            {/* a wheelie bin: nothing says someone lives here faster */}
            <g id="bin">
            <rect x="24.2" y="112.4" width="10.4" height="11" rx=".8" fill="#0D141A"/>
            <rect x="24.2" y="112.4" width=".9" height="11" fill="#3B4B58" opacity=".4"/>
            <rect x="23" y="109.8" width="12.8" height="2.8" rx=".8" fill="#161F29"/>
            <rect x="23" y="109.8" width="12.8" height=".7" rx=".35" fill="#4A5D6C" opacity=".45"/>
            </g>

            {/* plaster grain over the lot */}
            <rect x="-6" y="16" width="216" height="116" filter="url(#grain)" opacity=".05"/>
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
            <path d="M62 96 L62 64 A20 20 0 0 1 102 64 L102 96 Z" fill="url(#glassG)"/>

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
            <g id="mullions">
            <rect x="80.7" y="42" width="2.6" height="54" fill="#0A1218"/>
            <rect x="80.7" y="42" width=".8"  height="54" fill="#6F8DA6" opacity=".55"/>
            <rect x="60" y="68.7" width="44" height="2.6" fill="#0A1218"/>
            <rect x="60" y="68.7" width="44" height=".8"  fill="#6F8DA6" opacity=".55"/>
            </g>
            </g>


            {/* frame: recess shadow, then the frame, then the edge that
            catches the skylight */}
            <path d="M62 96 L62 64 A20 20 0 0 1 102 64 L102 96 Z" fill="none" stroke="#04070A" strokeWidth="7.4" strokeLinejoin="round"/>
            <path id="frameMain" d="M62 96 L62 64 A20 20 0 0 1 102 64 L102 96 Z" fill="none" stroke="#3F566B" strokeWidth="4.2" strokeLinejoin="round"/>
            <path d="M62 96 L62 64 A20 20 0 0 1 102 64 L102 96 Z" fill="none" stroke="#9CBEDA" strokeWidth=".8" strokeLinejoin="round" opacity=".38" transform="translate(0,-0.9)"/>

            {/* THE SILL. Lit on top, shadowed underneath. It is the single
            most convincing object in the picture for exactly that
            reason, and it costs three rectangles. */}
            <rect x="56" y="102" width="50" height="3.4" fill="#04070A" opacity=".75" filter="url(#blurMid)"/>
            <rect x="56" y="96" width="50" height="6.4" rx=".8" fill="url(#sillG)"/>
            <rect x="56" y="96" width="50" height=".9" rx=".45" fill="#93AEC2" opacity=".85"/>
            </g>

            {/* warm wash on the sill itself, over the stone */}
            <g id="sillWash" opacity="0">
            <rect x="59" y="95" width="44" height="3.2" fill="#F5C97B" opacity=".38" filter="url(#blurMid)"/>
            </g>

            {/* ROSA'S FRONT DOOR.
            It was a flat rectangle with a dot on it. A door is a stone
            lintel with a shadow under it, a reveal, a painted face with
            two recessed panels, a letterbox, a handle, and a step that
            somebody stands on — and the step is what stops it looking
            like a hole cut in the wall. */}
            <g id="doorway">
            <rect x="106.8" y="90.6" width="21" height="3.2" rx=".4" fill="url(#sillG)"/>
            <rect x="106.8" y="90.6" width="21" height=".7" rx=".35" fill="#8EA9BD" opacity=".65"/>
            <rect x="107.8" y="93.8" width="19" height="1.2" fill="#03060A" opacity=".75"/>

            <rect x="107.8" y="93.8" width="18.6" height="32.2" fill="#03060A"/>
            <rect x="109.2" y="95" width="16" height="31" fill="url(#woodG)"/>
            <rect x="109.2" y="95" width=".7" height="31" fill="#43565F" opacity=".4"/>

            {/* panels: light along the top-left of the recess, nothing
            along the bottom-right. Two strokes, and the face of the
            door stops being flat. */}
            <rect x="111.4" y="98" width="11.6" height="11" rx=".4" fill="#0A1015"/>
            <path d="M111.4 109 L111.4 98 L123 98" fill="none" stroke="#33434E" strokeWidth=".5" opacity=".5"/>
            <rect x="111.4" y="113" width="11.6" height="9.6" rx=".4" fill="#0A1015"/>
            <path d="M111.4 122.6 L111.4 113 L123 113" fill="none" stroke="#33434E" strokeWidth=".5" opacity=".5"/>

            <rect x="114.4" y="110.3" width="7" height="1.3" rx=".35" fill="#2C3A44"/>
            {/* Handle on the LEFT, which means hinges on the right, which
            is the side the door has to open from. It was on the right
            with the open-door sliver down the left, i.e. a door
            swinging off its hinge side. */}
            <circle cx="111.6" cy="111" r=".9" fill="#7D8E9B"/>

            <rect x="105.6" y="125.6" width="23" height="2.6" rx=".4" fill="url(#sillG)"/>
            <rect x="105.6" y="125.6" width="23" height=".7" rx=".35" fill="#8EA9BD" opacity=".55"/>

            {/* the door open, at the end: a sliver of indoors */}
            <g id="doorLight" opacity="0">
            <rect x="109.8" y="95.6" width="4.2" height="30" fill="url(#doorG)"/>
            <rect x="109.8" y="95.6" width="1" height="30" fill="#FFE9C4" opacity=".75"/>
            <polygon points="109,126 115,126 123,132 101,132" fill="url(#spill-gold)" filter="url(#blurSpill)"/>
            </g>
            </g>

            {/* ELLIE'S WINDOW. Dark all story, and lit at the end. The payoff
            is the whole picture having two lights in it instead of one. */}
            <g id="winNbr">
            <g clipPath="url(#glassClipB)">
            <path d="M152 96 L152 72 A12 12 0 0 1 176 72 L176 96 Z" fill="url(#glassG)"/>
            <g id="in-nbr" opacity="0"><ellipse cx="164" cy="90" rx="18" ry="12" fill="url(#hot-gold)"/></g>
            <rect x="144" y="50" width="7" height="56" fill="#BDD9F1" opacity=".06" transform="rotate(-19 150 78)"/>
            <g>
            <rect x="163" y="56" width="2.2" height="40" fill="#0A1218"/>
            <rect x="163" y="56" width=".7"  height="40" fill="#6F8DA6" opacity=".5"/>
            <rect x="150" y="79" width="28" height="2.2" fill="#0A1218"/>
            <rect x="150" y="79" width="28" height=".7"  fill="#6F8DA6" opacity=".5"/>
            </g>
            </g>
            <path d="M152 96 L152 72 A12 12 0 0 1 176 72 L176 96 Z" fill="none" stroke="#04070A" strokeWidth="5.4" strokeLinejoin="round"/>
            <path d="M152 96 L152 72 A12 12 0 0 1 176 72 L176 96 Z" fill="none" stroke="#44596E" strokeWidth="3" strokeLinejoin="round"/>
            <rect x="147" y="101" width="34" height="3.6" fill="#04070A" opacity=".8" filter="url(#blurMid)"/>
            <rect x="147" y="96" width="34" height="5" rx=".7" fill="url(#sillG)"/>
            <rect x="147" y="96" width="34" height=".8" rx=".4" fill="#93AEC2" opacity=".7"/>
            </g>
            <g id="out-nbr" opacity="0">
            <polygon points="149,96 179,96 192,124 136,124" fill="url(#spill-gold)" filter="url(#blurSpill)"/>
            <ellipse cx="164" cy="82" rx="34" ry="30" fill="url(#air-gold)"/>
            </g>

            {/* THE CLOCK. Deliberately not part of the world — it sits on the
            bottom edge like a scrubber, because it is the reader's
            instrument, not Anna's. */}
            <path id="arcbg" d="M20 128.5 L180 128.5" stroke="#1C2932" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0"/>
            <path id="arc"   d="M20 128.5 L180 128.5" stroke="#F5C97B" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0"/>
            </svg>
  );
}
