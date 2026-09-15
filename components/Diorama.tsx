'use client';

import { useEffect, useRef, useState } from 'react';
import type * as T from 'three';
import WindowMark from './WindowMark';

/**
 * THE HERO AS AN OBJECT YOU CAN HOLD: a small street at night, in real 3D.
 *
 * Anna's house with the arched, lit window (the brand mark, built), Leo's
 * house next door, a street lamp, a moon. Drag to turn it like a model on a
 * table. Tap it and it plays the product in miniature, without a word of
 * explanation needed: her phone on the sill glows red and pulses, nobody
 * answers, and Leo's window comes on next door. Then it settles back.
 *
 * THE SVG MARK IS THE FALLBACK, AND THE FIRST PAINT. It renders immediately
 * (and is all you get without WebGL, without JavaScript, or with reduced
 * motion — where the scene still draws, but never moves by itself). The 3D
 * canvas fades in over it only once its first frame exists, so a slow phone
 * never shows an empty box.
 *
 * COST CONTROL. three.js is loaded with a dynamic import after the page is up,
 * so it never delays the headline. The loop only runs while the scene is on
 * screen and the tab is visible; pixel ratio is capped; shadows are one map.
 */

/* THE STORY, IN EIGHT STEPS, EACH ONE SENTENCE. Written for someone who has
   never heard of Lampsill and isn't reading carefully: what happens, in the
   order it happens, with the time of day so "twelve quiet hours" is something
   you watch rather than something you're told. Every step is true to the
   product: her phone asks first, you're the one alerted, the text comes from
   you, and Leo is a neighbour with a key — nobody is dispatched. */
const STEPS: { t: number; time: string; text: string }[] = [
  { t: 0, time: '08:40', text: 'Tuesday morning. Anna puts her phone down on the windowsill.' },
  { t: 3500, time: '08:40', text: 'The day goes by. Nobody picks it up.' },
  { t: 7800, time: '20:50', text: 'Twelve quiet hours. Her own phone asks first: “Still there?”' },
  { t: 11800, time: '21:00', text: 'No answer after 10 minutes. Your phone gets the alert.' },
  { t: 15200, time: '21:01', text: 'You tap “Text Leo”. The message goes to Leo, next door.' },
  { t: 18600, time: '21:02', text: 'Leo sees it and switches his lamp on.' },
  { t: 20600, time: '21:03', text: 'He walks over and lets himself in with his key.' },
  { t: 27400, time: '21:06', text: 'Anna’s unwell, but alright. Two lights on instead of one.' },
];
/* When things happen, in ms from pressing play. Each visual beat sits INSIDE
   the step whose sentence describes it — the tap on "Text Leo" used to land
   during "your phone gets the alert", a beat before the words said "one tap". */
const AT = {
  clockFrom: 3500, clockTo: 7500,
  ring: 7800, alert: 11800,
  tap: 15700, send: 16100, arrive: 18400,
  leoLamp: 18600,
  leoDoor: 20600, walk: 21300, atDoor: 25000, doorOpen: 25100, doorOpened: 25900, inside: 27100,
};
const STORY_END = 32000;
const OUTRO_MS = 2400;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (s: number, a: number, b: number) => clamp01((s - a) / (b - a));
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

export default function Diorama() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(-1);
  const play = useRef<() => void>(() => {});
  const bubbleRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      // ---------- renderer ----------
      /* PHONES GET A LIGHTER RENDER of the same scene: lower resolution, no
         antialiasing (the higher pixel density hides it), and the two room
         lamps lose their shadow maps — each point-light shadow is six extra
         renders a frame. The street lamp keeps its shadow: without it, it
         lights Leo's dark room through his wall. */
      const lite = window.matchMedia('(max-width: 40rem), (pointer: coarse)').matches;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: 'low-power' });
      } catch {
        return; // no WebGL: the SVG mark stays, which is a complete hero
      }
      if (renderer.getContext().isContextLost()) {
        renderer.dispose();
        return;
      }
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoft was removed in r186
      renderer.domElement.className = 'diorama-canvas';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0a1014, 22, 46);

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      const target = new THREE.Vector3(0.5, 1.8, 0.4);

      // ---------- materials ----------
      const mat = (color: number, rough = 0.9, extra: Record<string, unknown> = {}) =>
        new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
      const wallA = mat(0x4d5866);
      const wallB = mat(0x434d59);
      const roofM = mat(0x232c35, 0.8);
      const trim = mat(0x8fbce0, 0.45, { metalness: 0.2 });
      const dark = mat(0x0d1318, 0.7);
      const stone = mat(0x222a32, 1);
      const paving = mat(0x36414b, 0.95);
      // the lampshade: fabric with a bulb behind it, so it glows from inside
      const shadeM = new THREE.MeshStandardMaterial({
        color: 0xcdbb98, emissive: 0xffc98a, emissiveIntensity: 3.2, roughness: 1, side: THREE.DoubleSide, toneMapped: false,
      });
      const plaster = mat(0xe6d3b3, 0.95);
      const wood = mat(0x5c3d24, 0.8);
      const fabric = mat(0x7d3b2e, 1);
      const phoneM = new THREE.MeshStandardMaterial({ color: 0x0a0d10, emissive: 0xff5a6a, emissiveIntensity: 0, roughness: 0.4 });

      const box = (w: number, h: number, d: number, m: T.Material, x: number, y: number, z: number, shadow = true) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
        mesh.position.set(x, y, z);
        mesh.castShadow = shadow;
        mesh.receiveShadow = true;
        scene.add(mesh);
        return mesh;
      };

      const roof = (w: number, h: number, d: number, x: number, y: number, z: number) => {
        const s = new THREE.Shape();
        s.moveTo(-w / 2, 0);
        s.lineTo(w / 2, 0);
        s.lineTo(0, h);
        s.closePath();
        const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
        g.translate(0, 0, -d / 2);
        const m = new THREE.Mesh(g, roofM);
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        scene.add(m);
      };

      // an arch: straight sides from y=0 to y=h, a semicircle on top
      const archShape = (w: number, h: number, cx = 0, cy = 0) => {
        const r = w / 2;
        const s = new THREE.Shape();
        s.moveTo(cx - r, cy);
        s.lineTo(cx + r, cy);
        s.lineTo(cx + r, cy + h);
        s.absarc(cx, cy + h, r, 0, Math.PI, false);
        s.lineTo(cx - r, cy);
        return s;
      };

      // ---------- the plinth and street ----------
      box(9.4, 0.5, 6.4, stone, 0.5, -0.25, 0);
      box(9.4, 0.05, 1.7, paving, 0.5, 0.025, 2.35, false);

      // ---------- Anna's house ----------
      const ax = -1.5;
      const front = 1.3;
      /* THE WINDOW IS A REAL OPENING, so her phone can be INSIDE it. The phone
         used to lie on a ledge stuck to the outside of a solid box — outdoors,
         in the rain — when the story says it's on her windowsill indoors. Now
         the front wall is a thick slab with the arch cut through it: glass at
         the front, an inside sill behind it with the phone on it, and the
         lamplight on the back wall of the room. */
      const slabD = 0.8;
      const inner = front - slabD; // the inside face of the front wall
      const back = -0.6; // the room's back wall
      box(3.4, 3.4, back + 1.3, wallA, ax, 1.7, (back + -1.3) / 2); // the rest of the house
      roof(3.8, 1.4, 2.9, ax, 3.4, 0);
      box(0.45, 0.9, 0.45, wallA, ax + 1.0, 4.2, -0.5); // chimney

      // the arched window, which is the Lampsill mark
      const wx = ax - 0.55;
      const wy = 1.25;
      const winW = 1.25;
      const winH = 0.95;
      const wallShape = new THREE.Shape();
      wallShape.moveTo(-1.7, 0);
      wallShape.lineTo(1.7, 0);
      wallShape.lineTo(1.7, 3.4);
      wallShape.lineTo(-1.7, 3.4);
      wallShape.lineTo(-1.7, 0);
      wallShape.holes.push(archShape(winW, winH, wx - ax, wy));
      // the doorway, cut through too, so the door can open onto the lit room
      const doorHole = new THREE.Shape();
      doorHole.moveTo(0.85 - 0.475, 0.02);
      doorHole.lineTo(0.85 + 0.475, 0.02);
      doorHole.lineTo(0.85 + 0.475, 1.95);
      doorHole.lineTo(0.85 - 0.475, 1.95);
      doorHole.lineTo(0.85 - 0.475, 0.02);
      wallShape.holes.push(doorHole);
      const slab = new THREE.Mesh(new THREE.ExtrudeGeometry(wallShape, { depth: slabD, bevelEnabled: false }), wallA);
      slab.position.set(ax, 0, inner);
      slab.castShadow = true;
      slab.receiveShadow = true;
      scene.add(slab);

      /* A REAL ROOM BEHIND THE GLASS, LIT BY A REAL LAMP. Not an emissive
         panel: plaster walls, a floor, a side table with a lamp, curtains, a
         picture — and the lamp is a shadow-casting light. So the walls fall off
         from warm to dim the way a room does, and the only light that leaves
         the house is what gets through the window: an arch with its cross of
         bars, thrown out across the sill and the pavement. */
      const roomD = inner - back;
      const roomZ = (inner + back) / 2;
      box(0.1, 3.4, roomD, wallA, ax - 1.65, 1.7, roomZ); // outer side walls
      box(0.1, 3.4, roomD, wallA, ax + 1.65, 1.7, roomZ);
      box(3.2, 3.2, 0.03, plaster, ax, 1.7, back + 0.02, false); // back wall
      box(0.03, 3.2, roomD, plaster, ax - 1.59, 1.7, roomZ, false); // inside of the side walls
      box(0.03, 3.2, roomD, plaster, ax + 1.59, 1.7, roomZ, false);
      box(3.2, 0.05, roomD, wood, ax, 0.32, roomZ, false); // floorboards
      box(3.2, 0.05, roomD, plaster, ax, 3.12, roomZ, false); // ceiling

      // curtains, drawn back to the edges of the window
      box(0.2, winH + winW / 2 + 0.25, 0.05, fabric, wx - winW / 2 - 0.02, wy + (winH + winW / 2) / 2, inner - 0.05);
      box(0.2, winH + winW / 2 + 0.25, 0.05, fabric, wx + winW / 2 + 0.02, wy + (winH + winW / 2) / 2, inner - 0.05);

      // a picture on the back wall
      box(0.6, 0.46, 0.04, wood, wx + 0.25, 2.2, back + 0.05);
      box(0.48, 0.34, 0.02, mat(0x4f6f86, 0.7), wx + 0.25, 2.2, back + 0.08, false);

      // the side table and its lamp
      const lx = wx - 0.22;
      const lz = inner - 0.35; // just behind the window, so the glowing shade is in view
      box(0.5, 0.04, 0.36, wood, lx, 1.18, lz);
      box(0.08, 0.84, 0.08, wood, lx, 0.76, lz);
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.07, 0.26, 16), wood);
      lampBase.position.set(lx, 1.33, lz);
      lampBase.castShadow = true;
      scene.add(lampBase);
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.19, 0.24, 28, 1, true), shadeM);
      shade.position.set(lx, 1.58, lz);
      scene.add(shade);

      const bulbLight = new THREE.PointLight(0xffb870, 14, 6, 2);
      bulbLight.position.set(lx, 1.56, lz);
      bulbLight.castShadow = !lite;
      bulbLight.shadow.mapSize.set(512, 512);
      bulbLight.shadow.bias = -0.004;
      bulbLight.shadow.camera.near = 0.05;
      bulbLight.shadow.camera.far = 6;
      scene.add(bulbLight);

      const archFrame = new THREE.Mesh(
        new THREE.ExtrudeGeometry(
          (() => {
            const f = archShape(winW + 0.26, winH);
            f.holes.push(archShape(winW, winH));
            return f;
          })(),
          { depth: 0.12, bevelEnabled: false },
        ),
        trim,
      );
      archFrame.position.set(wx, wy, front);
      archFrame.castShadow = true;
      scene.add(archFrame);

      // the pane: clear enough to see the phone and the room through
      const pane = new THREE.Mesh(
        new THREE.ShapeGeometry(archShape(winW, winH)),
        new THREE.MeshStandardMaterial({
          color: 0xd9e8f5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false,
        }),
      );
      pane.position.set(wx, wy, front - 0.06);
      scene.add(pane);
      box(0.06, winH + winW / 2, 0.05, trim, wx, wy + (winH + winW / 2) / 2, front - 0.04, false);
      box(winW, 0.06, 0.05, trim, wx, wy + 0.62, front - 0.04, false);
      box(winW + 0.5, 0.1, 0.35, trim, wx, wy - 0.06, front + 0.16); // the stone sill outside

      // her phone, lying on the windowsill INSIDE, behind the glass
      const phone = box(0.42, 0.045, 0.24, phoneM, wx + 0.28, wy + 0.023, front - 0.42, false);


      // front door, hinged on its left so it can swing open into the room
      const door = (width: number, height: number, hingeX: number, z: number) => {
        const pivot = new THREE.Group();
        pivot.position.set(hingeX, 0.02, z);
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.07), dark);
        leaf.position.set(width / 2, height / 2, -0.04);
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        pivot.add(leaf);
        const knob = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), trim);
        knob.position.set(width - 0.12, height * 0.48, 0.01);
        pivot.add(knob);
        scene.add(pivot);
        return pivot;
      };
      const annaDoor = door(0.95, 1.93, ax + 0.85 - 0.475, front);
      // spills out when it opens — set back from the doorway and kept soft, or
      // it lit Leo up like a flash as he walked through
      const annaDoorLight = new THREE.PointLight(0xffc27a, 0, 3.5, 2);
      annaDoorLight.position.set(ax + 0.85, 1.7, front + 1.0);
      scene.add(annaDoorLight);

      // ---------- Leo's house, next door ----------
      /* THE SAME REAL ROOM, WITH ITS LIGHT OFF. Leo's window used to be a
         panel that faded to gold. Now it opens onto his front room — an
         armchair, a bookcase, curtains, a floor lamp — sitting in the dark.
         When he's texted, the floor lamp actually switches on: a warm glow
         that starts at the shade and fills the room, while the light through
         his window reaches the pavement. Two lit rooms instead of one. */
      const bx = 2.5;
      const bz = -0.5;
      const bFront = bz + 1.2;
      const bSlab = 0.6;
      const bInner = bFront - bSlab;
      const bBack = bz - 0.3;
      box(2.8, 2.9, bBack - (bz - 1.2), wallB, bx, 1.45, (bBack + bz - 1.2) / 2); // rest of the house
      roof(3.2, 1.2, 2.7, bx, 2.9, bz);

      const lwx = bx - 0.55;
      const lwy = 1.65;
      const lw = 0.84;
      const rect = (w: number, h: number, cx = 0, cy = 0) => {
        const r = new THREE.Shape();
        r.moveTo(cx - w / 2, cy - h / 2);
        r.lineTo(cx + w / 2, cy - h / 2);
        r.lineTo(cx + w / 2, cy + h / 2);
        r.lineTo(cx - w / 2, cy + h / 2);
        r.lineTo(cx - w / 2, cy - h / 2);
        return r;
      };
      const bWall = rect(2.8, 2.9, 0, 1.45);
      bWall.holes.push(rect(lw, lw, lwx - bx, lwy));
      bWall.holes.push(rect(0.85, 1.73, 0.75, 0.885));
      const bFrontWall = new THREE.Mesh(new THREE.ExtrudeGeometry(bWall, { depth: bSlab, bevelEnabled: false }), wallB);
      bFrontWall.position.set(bx, 0, bInner);
      bFrontWall.castShadow = true;
      bFrontWall.receiveShadow = true;
      scene.add(bFrontWall);

      // window frame, pane and bars
      const bFrameShape = rect(lw + 0.14, lw + 0.14);
      bFrameShape.holes.push(rect(lw, lw));
      const bFrame = new THREE.Mesh(new THREE.ExtrudeGeometry(bFrameShape, { depth: 0.1, bevelEnabled: false }), trim);
      bFrame.position.set(lwx, lwy, bFront);
      bFrame.castShadow = true;
      scene.add(bFrame);
      const bPane = new THREE.Mesh(
        new THREE.PlaneGeometry(lw, lw),
        new THREE.MeshStandardMaterial({ color: 0xd9e8f5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false }),
      );
      bPane.position.set(lwx, lwy, bFront - 0.05);
      scene.add(bPane);
      box(0.05, lw, 0.05, trim, lwx, lwy, bFront - 0.03, false);
      box(lw + 0.3, 0.08, 0.28, trim, lwx, lwy - lw / 2 - 0.05, bFront + 0.12); // outside sill

      // the room
      const bRoomD = bInner - bBack;
      const bRoomZ = (bInner + bBack) / 2;
      const plasterB = mat(0xd9d3c6, 0.95);
      box(0.1, 2.9, bRoomD, wallB, bx - 1.35, 1.45, bRoomZ);
      box(0.1, 2.9, bRoomD, wallB, bx + 1.35, 1.45, bRoomZ);
      box(2.6, 2.7, 0.03, plasterB, bx, 1.45, bBack + 0.02, false);
      box(0.03, 2.7, bRoomD, plasterB, bx - 1.29, 1.45, bRoomZ, false);
      box(0.03, 2.7, bRoomD, plasterB, bx + 1.29, 1.45, bRoomZ, false);
      box(2.6, 0.05, bRoomD, wood, bx, 0.3, bRoomZ, false);
      box(2.6, 0.05, bRoomD, plasterB, bx, 2.72, bRoomZ, false);

      // curtains, slate blue
      const curtainB = mat(0x3e5366, 1);
      box(0.16, lw + 0.3, 0.05, curtainB, lwx - lw / 2 - 0.02, lwy + 0.02, bInner - 0.05);
      box(0.16, lw + 0.3, 0.05, curtainB, lwx + lw / 2 + 0.02, lwy + 0.02, bInner - 0.05);

      // a bookcase on the back wall, with a few books
      const shelfX = lwx + 0.25;
      box(0.7, 1.3, 0.24, wood, shelfX, 0.98, bBack + 0.14);
      [0.62, 1.02, 1.42].forEach((y, i) => {
        box(0.64, 0.03, 0.2, mat(0x3a2716, 0.9), shelfX, y, bBack + 0.2, false);
        [0xa34b3a, 0x2f5d7c, 0xc9a04a, 0x4d6b4a].forEach((c, k) => {
          if ((i + k) % 4 === 3) return;
          box(0.07, 0.22 + ((k * 7 + i * 3) % 4) * 0.02, 0.15, mat(c, 0.8), shelfX - 0.24 + k * 0.1, y + 0.14, bBack + 0.2, false);
        });
      });

      // an armchair by the window
      const chairM = mat(0x55684f, 1);
      const cx = lwx - 0.2;
      const cz = bInner - 0.42;
      box(0.52, 0.2, 0.46, chairM, cx, 0.52, cz); // seat
      box(0.52, 0.5, 0.12, chairM, cx, 0.8, cz - 0.2); // back
      box(0.1, 0.32, 0.46, chairM, cx - 0.26, 0.6, cz); // arms
      box(0.1, 0.32, 0.46, chairM, cx + 0.26, 0.6, cz);

      // the floor lamp, off until Leo is texted
      const flx = lwx + 0.38;
      const flz = bInner - 0.3;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.35, 10), dark);
      pole.position.set(flx, 0.98, flz);
      pole.castShadow = true;
      scene.add(pole);
      const leoShadeM = new THREE.MeshStandardMaterial({
        color: 0xe9dfca, emissive: 0xffc98a, emissiveIntensity: 0, roughness: 1, side: THREE.DoubleSide, toneMapped: false,
      });
      const leoShade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.17, 0.22, 24, 1, true), leoShadeM);
      leoShade.position.set(flx, 1.72, flz);
      scene.add(leoShade);
      const leoBulb = new THREE.PointLight(0xffb870, 0, 5, 2);
      leoBulb.position.set(flx, 1.7, flz);
      leoBulb.castShadow = !lite;
      leoBulb.shadow.mapSize.set(512, 512);
      leoBulb.shadow.bias = -0.004;
      leoBulb.shadow.camera.near = 0.05;
      leoBulb.shadow.camera.far = 6;
      scene.add(leoBulb);

      const leoDoor = door(0.85, 1.72, bx + 0.75 - 0.425, bFront);
      const leoDoorLight = new THREE.PointLight(0xffc27a, 0, 3, 2);
      leoDoorLight.position.set(bx + 0.75, 1.6, bFront + 0.9);
      scene.add(leoDoorLight);

      // ---------- street lamp ----------
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.6, 12), dark);
      post.position.set(4.1, 1.8, 2.3);
      post.castShadow = true;
      scene.add(post);
      const bulbM = new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffe2b0, emissiveIntensity: 2.2 });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), bulbM);
      bulb.position.set(4.1, 3.65, 2.3);
      scene.add(bulb);

      // ---------- Leo ----------
      // A simple figure — coat, head, two legs — enough to read as a person
      // walking at this size, and nothing that pretends to be a face.
      const leo = new THREE.Group();
      const coatM = mat(0x3b4a5a, 0.9);
      const skinM = mat(0xd9b08c, 0.8);
      const legM = mat(0x1c232b, 0.9);
      const legL = new THREE.Group();
      const legR = new THREE.Group();
      [legL, legR].forEach((g, i) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.6, 0.12), legM);
        leg.position.y = -0.3;
        leg.castShadow = true;
        g.add(leg);
        g.position.set(i ? 0.08 : -0.08, 0.62, 0);
        leo.add(g);
      });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.42, 6, 12), coatM);
      body.position.y = 0.95;
      body.castShadow = true;
      leo.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 14), skinM);
      head.position.y = 1.42;
      head.castShadow = true;
      leo.add(head);
      leo.visible = false;
      scene.add(leo);
      const walk: [number, number, number][] = [
        [bx + 0.75, 0.3, bInner - 0.1], // inside his front door
        [bx + 0.75, 0.05, bFront + 0.6],
        [bx + 0.75, 0.05, 2.15],
        [ax + 0.85, 0.05, 2.15],
        [ax + 0.85, 0.05, front + 0.55],
        [ax + 0.85, 0.32, inner - 0.35], // inside Anna's
      ];
      const walkLen = walk.slice(1).map((q, i) => Math.hypot(q[0] - walk[i][0], q[2] - walk[i][2]));
      const walkTotal = walkLen.reduce((a, b) => a + b, 0);
      const walkToDoor = walkLen.slice(0, 4).reduce((a, b) => a + b, 0); // up to her front step
      const walkAt = (f: number) => {
        let d = f * walkTotal;
        for (let i = 0; i < walkLen.length; i++) {
          if (d <= walkLen[i] || i === walkLen.length - 1) {
            const k = Math.min(1, d / walkLen[i]);
            const a = walk[i];
            const b = walk[i + 1];
            return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, z: a[2] + (b[2] - a[2]) * k, dx: b[0] - a[0], dz: b[2] - a[2] };
          }
          d -= walkLen[i];
        }
        return { x: 0, y: 0, z: 0, dx: 0, dz: 1 };
      };

      // "Still there?" — rings spreading out from her phone on the sill
      const phonePos = new THREE.Vector3(wx + 0.28, wy + 0.06, front - 0.42);
      const rings = [0, 1, 2].map(() => {
        const m = new THREE.Mesh(
          new THREE.RingGeometry(0.16, 0.19, 40),
          new THREE.MeshBasicMaterial({ color: 0xff6b7a, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }),
        );
        m.rotation.x = -Math.PI / 2;
        m.position.copy(phonePos);
        scene.add(m);
        return m;
      });

      // the text message: a small light that travels from you to Leo's window
      const msgM = new THREE.MeshBasicMaterial({ color: 0xffe2a8, toneMapped: false, transparent: true, opacity: 0 });
      const msg = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), msgM);
      scene.add(msg);
      const trail = [0, 1, 2, 3, 4].map((i) => {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(0.075 - i * 0.011, 10, 8),
          new THREE.MeshBasicMaterial({ color: 0xffd28a, toneMapped: false, transparent: true, opacity: 0 }),
        );
        scene.add(m);
        return m;
      });
      const msgLight = new THREE.PointLight(0xffd28a, 0, 4, 2);
      scene.add(msgLight);
      const msgEnd = new THREE.Vector3(lwx, lwy, bFront + 0.1);
      let msgCurve: InstanceType<typeof THREE.QuadraticBezierCurve3> | null = null;

      // ---------- sky ----------
      const moonM = new THREE.MeshStandardMaterial({ color: 0xdfe8f2, emissive: 0xcfdcec, emissiveIntensity: 1.1, transparent: true });
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 24, 18),
        moonM,
      );
      moon.position.set(0.9, 4.1, -15); // between the two roofs: the camera sways, so anywhere near an edge it slid out of frame
      scene.add(moon);
      const starPos = new Float32Array(500 * 3);
      for (let i = 0; i < 500; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.random() * Math.PI * 0.42;
        const r = 38;
        starPos[i * 3] = Math.cos(th) * Math.sin(ph) * r;
        starPos[i * 3 + 1] = Math.cos(ph) * r * 0.7 + 2;
        starPos[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * r - 6;
      }
      const starsM = new THREE.PointsMaterial({ color: 0xcfe0f2, size: 0.13, transparent: true, opacity: 0.85, fog: false });
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(
        starGeo,
        starsM,
      );
      scene.add(stars);

      // ---------- light ----------
      // Sky light reaches inside the houses (it ignores walls), so it's kept low
      // and the moon, which DOES cast shadows, carries the outside — otherwise a
      // room with its lamp off still looked lit.
      const hemi = new THREE.HemisphereLight(0x6f8fb6, 0x141a20, 0.55);
      scene.add(hemi);
      const moonLight = new THREE.DirectionalLight(0xa9c2e0, 2.6);
      moonLight.position.set(-6, 10, 6);
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.set(lite ? 512 : 1024, lite ? 512 : 1024);
      moonLight.shadow.camera.left = -7;
      moonLight.shadow.camera.right = 7;
      moonLight.shadow.camera.top = 7;
      moonLight.shadow.camera.bottom = -7;
      moonLight.shadow.bias = -0.0008;
      scene.add(moonLight);

      const lampLight = new THREE.PointLight(0xffd9a0, 34, 11, 2);
      lampLight.position.copy(bulb.position);
      // shadows ON, or it lights Leo's room straight through his walls and his
      // lamp-off room never looked dark
      lampLight.castShadow = true;
      lampLight.shadow.mapSize.set(lite ? 256 : 512, lite ? 256 : 512);
      lampLight.shadow.bias = -0.003;
      lampLight.shadow.camera.near = 0.1;
      lampLight.shadow.camera.far = 12;
      scene.add(lampLight);

      const windowLight = new THREE.PointLight(0xffc16e, 3, 5, 2); // a soft fill; the real spill is the lamp's
      windowLight.position.set(wx, wy + 0.7, front + 0.9);
      scene.add(windowLight);

      const phoneLight = new THREE.PointLight(0xff5a6a, 0, 3.2, 2);
      phoneLight.position.set(wx + 0.28, wy + 0.3, front - 0.3);
      scene.add(phoneLight);

      const leoLight = new THREE.PointLight(0xffc16e, 0, 4, 2); // soft fill outside his window
      leoLight.position.set(lwx, lwy, bFront + 0.9);
      scene.add(leoLight);

      // ---------- camera, drag and sway ----------
      const BASE_AZ = -0.32;
      const BASE_EL = 0.2;
      const BASE_R = 16.5;
      const BASE_TARGET = target.clone();
      let az = BASE_AZ;
      let el0 = BASE_EL;
      let radius = BASE_R;
      let goalAz = BASE_AZ;
      let goalEl = BASE_EL;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let moved = 0;
      let lastInteract = -Infinity;

      const clampAz = (v: number) => Math.min(0.75, Math.max(-1.15, v));
      const clampEl = (v: number) => Math.min(0.55, Math.max(0.04, v));

      const place = () => {
        camera.position.set(
          target.x + Math.sin(az) * Math.cos(el0) * radius,
          target.y + Math.sin(el0) * radius,
          target.z + Math.cos(az) * Math.cos(el0) * radius,
        );
        camera.lookAt(target);
      };

      // ---------- the story: a camera that tells it ----------
      type Cam = { t: number; tx: number; ty: number; tz: number; az: number; el: number; r: number };
      // close on her window while she's inside; back out for your phone; over
      // to Leo's window; wide for the walk; and settle on her open door
      const CAMERA: Cam[] = [
        { t: 2600, tx: wx + 0.1, ty: wy + 0.4, tz: front, az: -0.12, el: 0.1, r: 6.8 },
        { t: 7200, tx: wx + 0.1, ty: wy + 0.4, tz: front, az: -0.05, el: 0.12, r: 6.4 },
        { t: 9000, tx: wx + 0.25, ty: wy + 0.2, tz: front - 0.3, az: -0.08, el: 0.2, r: 4.4 },
        { t: 11600, tx: wx + 0.25, ty: wy + 0.2, tz: front - 0.3, az: -0.04, el: 0.2, r: 4.3 },
        { t: 13200, tx: -0.6, ty: 1.7, tz: 1.0, az: -0.22, el: 0.14, r: 10 },
        { t: 16000, tx: -0.4, ty: 1.8, tz: 1.0, az: -0.18, el: 0.14, r: 10 },
        { t: 18400, tx: lwx, ty: lwy, tz: bFront, az: 0.2, el: 0.1, r: 6.2 },
        { t: 20400, tx: lwx + 0.3, ty: lwy - 0.2, tz: bFront, az: 0.16, el: 0.12, r: 6.6 },
        { t: 23000, tx: 0.5, ty: 1.1, tz: 1.7, az: 0.02, el: 0.2, r: 11.5 },
        { t: 25300, tx: ax + 0.85, ty: 1.1, tz: front + 0.4, az: -0.04, el: 0.14, r: 8.5 },
        { t: 27400, tx: ax + 0.85, ty: 1.1, tz: front + 0.4, az: -0.02, el: 0.14, r: 8.3 },
        // the last shot holds BOTH lit windows — it's what the sentence says
        { t: 29800, tx: 0.4, ty: 1.6, tz: 1.2, az: -0.06, el: 0.15, r: 13 },
        { t: STORY_END, tx: 0.4, ty: 1.6, tz: 1.2, az: -0.04, el: 0.15, r: 13.4 },
      ];

      let storyStart = -Infinity;
      const playing = (now: number) => now - storyStart < STORY_END;
      let keys: Cam[] = [];
      let lastStep = -2;
      play.current = () => {
        const now = performance.now();
        if (playing(now)) return; // let it finish
        storyStart = now;
        msgCurve = null;
        lastStep = -2;
        // the first keyframe is wherever the camera is right now, so it glides
        keys = [{ t: 0, tx: target.x, ty: target.y, tz: target.z, az, el: el0, r: radius }, ...CAMERA];
      };

      const onDown = (e: PointerEvent) => {
        if (playing(performance.now())) return; // the story drives the camera
        dragging = true;
        moved = 0;
        lastX = e.clientX;
        lastY = e.clientY;
        // Capture keeps the drag alive when the pointer leaves the canvas, and
        // is worth nothing if it fails: Safari throws NotFoundError the moment
        // the pointer isn't one it is still tracking. Dragging already works
        // without it, so swallow that rather than letting it abort the handler.
        try {
          renderer.domElement.setPointerCapture(e.pointerId);
        } catch {
          /* no capture; the drag still follows the pointer over the canvas */
        }
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        lastX = e.clientX;
        lastY = e.clientY;
        goalAz = clampAz(goalAz - dx * 0.006);
        goalEl = clampEl(goalEl + dy * 0.004);
        lastInteract = performance.now();
      };
      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        try {
          if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {
          /* the pointer is already gone, which is what we wanted anyway */
        }
        // a tap, not a drag — and not a cancel: on a phone, a swipe that starts
        // on the street and scrolls the page arrives as pointercancel, and used
        // to start the story in the middle of someone scrolling past it
        if (e.type === 'pointerup' && moved < 6) play.current();
      };
      renderer.domElement.addEventListener('pointerdown', onDown);
      renderer.domElement.addEventListener('pointermove', onMove);
      renderer.domElement.addEventListener('pointerup', onUp);
      renderer.domElement.addEventListener('pointercancel', onUp);

      const camAt = (s: number) => {
        let i = 0;
        while (i < keys.length - 1 && s >= keys[i + 1].t) i++;
        const k0 = keys[i];
        const k1 = keys[Math.min(i + 1, keys.length - 1)];
        const span = k1.t - k0.t;
        const f = span > 0 ? ease(clamp01((s - k0.t) / span)) : 1;
        const g = calm ? 1 : f; // reduced motion: cut to each shot, don't glide
        target.set(lerp(k0.tx, k1.tx, g), lerp(k0.ty, k1.ty, g), lerp(k0.tz, k1.tz, g));
        az = lerp(k0.az, k1.az, g);
        el0 = lerp(k0.el, k1.el, g);
        radius = lerp(k0.r, k1.r, g);
      };

      const nightHemi = new THREE.Color(0x6f8fb6);
      const dayHemi = new THREE.Color(0xb9d4ee);
      const nightMoon = new THREE.Color(0xa9c2e0);
      const daySun = new THREE.Color(0xfff1dc);
      const proj = new THREE.Vector3();
      const daySky = new THREE.Color(0x9db4c6);
      const nightFog = new THREE.Color(0x0a1014);

      // ---------- size ----------
      // declared up here because resize() runs before the render loop exists
      let hasDrawn = false;
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        if (renderer.domElement.width === Math.round(w * renderer.getPixelRatio()) && renderer.domElement.height === Math.round(h * renderer.getPixelRatio())) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        // resizing clears the canvas; draw straight away, or the street
        // blinks black for a frame (it did, every time a caption changed length)
        if (hasDrawn && !renderer.getContext().isContextLost()) {
          try {
            renderer.render(scene, camera);
          } catch {
            /* the loop's own guard handles a lost context */
          }
        }
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      // ---------- loop, only while visible ----------
      let raf = 0;
      let onScreen = true;
      let first = true;
      /* THE 3D IS ALLOWED TO FAIL; THE HERO IS NOT. A browser can take the
         WebGL context away at any time — a GPU reset, a phone backgrounding
         the tab, or too many contexts on one page (every hot reload during
         development used to leave one behind). Three.js then throws from deep
         inside shader compilation ("shaderSource must be an instance of
         WebGLShader"). Instead of a crash overlay, the scene stops and the
         SVG mark it was covering fades back in. */
      let dead = false;
      const giveUp = () => {
        if (dead) return;
        dead = true;
        cancelAnimationFrame(raf);
        raf = 0;
        setReady(false);
      };
      const onLost = (e: Event) => {
        e.preventDefault();
        giveUp();
      };
      renderer.domElement.addEventListener('webglcontextlost', onLost);
      const t0 = performance.now();

      const frame = () => {
        raf = 0;
        const now = performance.now();
        const t = (now - t0) / 1000;
        const s = now - storyStart;
        const inStory = s >= 0 && s < STORY_END;
        // after the last step, Leo's lamp and Anna's door ease back to the quiet street
        const outro = s >= STORY_END ? Math.min(1, (s - STORY_END) / OUTRO_MS) : 0;
        const lingering = inStory ? 1 : s >= STORY_END ? 1 - ease(outro) : 0;

        // ----- camera -----
        if (inStory) {
          camAt(s);
          goalAz = clampAz(az);
          goalEl = clampEl(el0);
          lastInteract = now;
        } else {
          if (!calm && !dragging && now - lastInteract > 2500) {
            goalAz += (BASE_AZ + Math.sin(t * 0.18) * 0.22 - goalAz) * 0.01;
            goalEl += (BASE_EL + Math.sin(t * 0.13) * 0.04 - goalEl) * 0.01;
          }
          az += (goalAz - az) * 0.06;
          el0 += (goalEl - el0) * 0.06;
          radius += (BASE_R - radius) * 0.03;
          target.lerp(BASE_TARGET, 0.03);
        }
        place();

        // ----- time of day: morning at the start, night by 20:50 -----
        // eases in over the first second rather than snapping night→day on "play"
        const day = inStory ? ease(ramp(s, 0, 1000)) * (1 - ease(ramp(s, AT.clockFrom, AT.clockTo))) : 0;
        // a daylight sky behind the street; transparent again at night
        renderer.setClearColor(daySky, day * 0.95);
        (scene.fog as T.Fog).color.copy(nightFog).lerp(daySky, day);
        hemi.intensity = lerp(0.55, 1.35, day);
        hemi.color.copy(nightHemi).lerp(dayHemi, day);
        moonLight.intensity = lerp(2.6, 3.4, day);
        moonLight.color.copy(nightMoon).lerp(daySun, day);
        moon.position.y = lerp(4.1, -4, day);
        moonM.opacity = 1 - clamp01(day * 4);
        moon.visible = moonM.opacity > 0.01;
        starsM.opacity = 0.85 * (1 - day);
        const streetOn = 1 - ramp(day, 0.25, 0.55);
        lampLight.intensity = 34 * streetOn;
        bulbM.emissiveIntensity = 0.25 + 1.95 * streetOn;

        // ----- Anna's room: lamp on at dusk, dimmed a little while the phone rings -----
        const breath = calm ? 1 : 1 + Math.sin(t * 0.9) * 0.05;
        const annaLamp = 1 - ramp(day, 0.2, 0.45);
        const ringF = inStory ? ramp(s, AT.ring, AT.ring + 300) * (1 - ramp(s, AT.alert + 600, AT.alert + 1200)) : 0;
        const dim = 1 - 0.35 * ringF;
        shadeM.emissiveIntensity = 3.2 * breath * dim * annaLamp;
        bulbLight.intensity = 14 * breath * dim * annaLamp;
        windowLight.intensity = 3 * dim * annaLamp;

        // ----- her phone: lights once as she puts it down; red and ringing at 20:50 -----
        const putDown = inStory ? ramp(s, 700, 1000) * (1 - ramp(s, 2300, 3000)) : 0;
        const pulse = 0.5 + 0.5 * Math.sin(s / 110);
        if (ringF > 0) {
          phoneM.emissive.setHex(0xff5a6a);
          phoneM.emissiveIntensity = ringF * (1.2 + pulse * 3.5);
          phoneLight.intensity = ringF * (3 + pulse * 12);
          phone.position.x = wx + 0.28 + Math.sin(s / 28) * 0.012 * ringF;
        } else {
          phoneM.emissive.setHex(0x9fc8ff);
          phoneM.emissiveIntensity = putDown * 4;
          phoneLight.intensity = 0;
          phone.position.x = wx + 0.28;
        }
        rings.forEach((m, i) => {
          const cyc = ((((s - AT.ring) / 1100 + i / 3) % 1) + 1) % 1;
          (m.material as T.MeshBasicMaterial).opacity = ringF * (1 - cyc) * 0.9;
          m.scale.setScalar(1 + cyc * 3.2);
        });

        // ----- "Still there?" bubble, pinned to the phone on screen -----
        const bubble = bubbleRef.current;
        if (bubble) {
          const show = inStory && s > AT.ring + 500 && s < AT.alert;
          if (show) {
            proj.copy(phonePos).project(camera);
            bubble.style.transform = `translate(${((proj.x + 1) / 2) * el.clientWidth}px, ${((1 - proj.y) / 2) * el.clientHeight}px)`;
          }
          bubble.dataset.show = show ? '1' : '0';
        }

        // ----- your phone: the alert, then the tap on "Text Leo" -----
        const card = cardRef.current;
        if (card) {
          card.dataset.show = inStory && s > AT.alert && s < AT.send + 250 ? '1' : '0';
          card.dataset.tap = inStory && s > AT.tap ? '1' : '0';
        }

        // ----- the text, flying to Leo's window -----
        if (inStory && s >= AT.send && !msgCurve) {
          // launch from wherever your phone card is on screen
          const r = card?.getBoundingClientRect();
          const h = el.getBoundingClientRect();
          const nx = r && r.width ? ((r.left + r.width * 0.75 - h.left) / h.width) * 2 - 1 : 0.6;
          const ny = r && r.width ? -(((r.top + r.height * 0.85 - h.top) / h.height) * 2 - 1) : -0.5;
          // far enough into the scene to be seen crossing it, not a blur at the lens
          const start = new THREE.Vector3(nx, ny, 0.975).unproject(camera);
          const mid = start.clone().lerp(msgEnd, 0.5);
          mid.y += 1.3;
          msgCurve = new THREE.QuadraticBezierCurve3(start, mid, msgEnd);
        }
        const flight = inStory && msgCurve ? ramp(s, AT.send, AT.arrive) : 0;
        const flying = flight > 0 && flight < 1;
        if (msgCurve) {
          const f = ease(flight);
          const curve = msgCurve;
          msg.position.copy(curve.getPoint(f));
          trail.forEach((m, i) => {
            m.position.copy(curve.getPoint(Math.max(0, f - (i + 1) * 0.035)));
            (m.material as T.MeshBasicMaterial).opacity = flying ? 0.7 - i * 0.12 : 0;
          });
          msgLight.position.copy(msg.position);
        }
        msgM.opacity = flying ? 1 : 0;
        msgLight.intensity = flying ? 6 : 0;

        // ----- Leo's lamp comes on -----
        const leoOn = (inStory ? ramp(s, AT.leoLamp, AT.leoLamp + 900) : 1) * lingering;
        leoShadeM.emissiveIntensity = Math.min(1, leoOn * 1.6) * 3;
        leoBulb.intensity = leoOn * leoOn * 12;
        leoLight.intensity = leoOn * 2;

        // ----- Leo walks over, stops to unlock her door, and goes in -----
        const leoOpen = inStory ? ramp(s, AT.leoDoor, AT.leoDoor + 700) * (1 - ramp(s, AT.walk + 2000, AT.walk + 2800)) : 0;
        leoDoor.rotation.y = leoOpen * 1.25;
        leoDoorLight.intensity = leoOpen * 3 * leoOn;
        const toDoor = walkToDoor / walkTotal;
        let walkF = 0;
        let moving = false;
        if (inStory && s < AT.atDoor) {
          walkF = ramp(s, AT.walk, AT.atDoor) * toDoor;
          moving = s > AT.walk;
        } else if (inStory && s < AT.doorOpened) {
          walkF = toDoor; // standing at her door with the key
        } else if (inStory) {
          walkF = toDoor + ramp(s, AT.doorOpened, AT.inside) * (1 - toDoor);
          moving = s < AT.inside;
        }
        leo.visible = inStory && s > AT.leoDoor + 200 && s < AT.inside + 300;
        if (leo.visible) {
          const q = walkAt(walkF);
          leo.position.set(q.x, q.y, q.z);
          leo.rotation.y = Math.atan2(q.dx, q.dz);
          const swing = moving ? Math.sin(s / 140) * 0.55 : 0;
          legL.rotation.x = swing;
          legR.rotation.x = -swing;
          body.position.y = 0.95 + (moving ? Math.abs(Math.sin(s / 140)) * 0.03 : 0);
        }
        const annaOpen = (inStory ? ramp(s, AT.doorOpen, AT.doorOpened) : 1) * lingering;
        annaDoor.rotation.y = annaOpen * 1.2;
        annaDoorLight.intensity = annaOpen * 2.2;

        // ----- the words under the scene -----
        const stepNow = inStory ? STEPS.reduce((acc, st, i) => (s >= st.t ? i : acc), 0) : -1;
        if (stepNow !== lastStep) {
          lastStep = stepNow;
          setStep(stepNow);
        }
        if (timeRef.current && stepNow >= 0) {
          let clock = STEPS[stepNow].time;
          if (stepNow === 1) {
            const mins = 8 * 60 + 40 + Math.floor(ease(ramp(s, AT.clockFrom, AT.clockTo)) * 12 * 60);
            clock = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
          }
          timeRef.current.textContent = clock;
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${inStory ? s / STORY_END : 0})`;

        try {
          renderer.render(scene, camera);
        } catch (err) {
          console.warn('Lampsill: 3D street unavailable, showing the flat mark instead.', err);
          giveUp();
          return;
        }
        hasDrawn = true;
        if (first) {
          first = false;
          setReady(true);
        }
        if (onScreen && !document.hidden && !dead) raf = requestAnimationFrame(frame);
      };

      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        if (onScreen && !raf && !dead) raf = requestAnimationFrame(frame);
      });
      io.observe(el);
      const onVis = () => {
        if (!document.hidden && onScreen && !raf && !dead) raf = requestAnimationFrame(frame);
      };
      document.addEventListener('visibilitychange', onVis);
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        renderer.domElement.removeEventListener('pointerdown', onDown);
        renderer.domElement.removeEventListener('pointermove', onMove);
        renderer.domElement.removeEventListener('pointerup', onUp);
        renderer.domElement.removeEventListener('pointercancel', onUp);
        scene.traverse((o) => {
          const m = o as T.Mesh;
          m.geometry?.dispose();
          const materials = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
          materials.forEach((x) => x.dispose());
        });
        renderer.domElement.removeEventListener('webglcontextlost', onLost);
        renderer.dispose();
        // dispose() frees three's resources but NOT the browser's context;
        // without this each remount (and every hot reload) leaks one, until
        // the browser starts refusing to compile shaders
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const current = step >= 0 ? STEPS[step] : null;

  return (
    <div className="diorama" data-ready={ready ? '' : undefined}>
      <div className="diorama-stage" ref={host}>
        <div className="diorama-fallback">
          <WindowMark />
        </div>

        {/* pinned to her phone by the render loop */}
        <div className="dio-bubble" ref={bubbleRef} data-show="0" aria-hidden="true">
          <span className="dio-bubble-in">
            <strong>Still there?</strong>
            <em>I’m fine</em>
          </span>
        </div>

        {/* your phone, sliding in with the alert */}
        <div className="dio-card" ref={cardRef} data-show="0" data-tap="0" aria-hidden="true">
          <span className="dio-card-label">Your phone</span>
          <span className="dio-card-app">LAMPSILL · now</span>
          <strong>Anna hasn’t answered</strong>
          <span className="dio-card-body">Quiet for 12 hours. No answer for 10 minutes.</span>
          <span className="dio-card-btns">
            <span>Call Anna</span>
            <span className="hot">Text Leo</span>
          </span>
        </div>
      </div>

      {ready && (
        <div className={`dio-hud${current ? ' is-playing' : ''}`}>
          {current ? (
            <>
              <div className="dio-hud-top">
                <span className="dio-time" ref={timeRef}>
                  {current.time}
                </span>
                <span className="dio-step">
                  {step + 1} of {STEPS.length}
                </span>
              </div>
              <p className="dio-text" key={step} aria-live="polite">
                {current.text}
              </p>
              <span className="dio-bar" aria-hidden="true">
                <span ref={barRef} />
              </span>
            </>
          ) : (
            <>
              <p className="dio-text">A quiet street. Anna lives alone in the house with the lit window.</p>
              <button type="button" className="btn lamp dio-play" onClick={() => play.current()}>
                <span aria-hidden="true">▶</span> Play the story · 30 sec
              </button>
              <span className="dio-hint">or drag to turn the street</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
