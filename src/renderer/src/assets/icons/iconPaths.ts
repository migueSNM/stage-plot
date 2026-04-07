/**
 * SVG icon body silhouettes for all built-in item types.
 * All paths are designed on a 24×24 viewBox (coordinates 0-24).
 * Rendered with fill-rule="evenodd": inner sub-paths become cutouts
 * (soundholes, speaker cones, black keys, knobs, etc.).
 *
 * Design language: flat black-silhouette style, realistic instrument shapes,
 * recognisable at ~60-80px rendered size.
 */

export const ICON_BODIES: Partial<Record<string, string>> = {

  // ── Person (vocalist) ────────────────────────────────────────────────────
  person:
    // head
    'M12 1a3.5 3.5 0 1 0 0.01 0Z' +
    // torso / shoulders (rounded trapezoid)
    'M6.5 23v-4C6.5 15.8 9 13.5 12 13.5S17.5 15.8 17.5 19V23H6.5Z',

  // ── Acoustic Guitar ───────────────────────────────────────────────────────
  // Upright, figure-8 body, neck + headstock + soundhole cutout
  guitar_acoustic:
    // headstock (wider than neck, rectangular)
    'M10 0.5h4v2h-4Z' +
    // neck + full body outline (one continuous path)
    // neck runs y:2.5–8; body: upper bout peaks at y~10.5, waist at y~14, lower bout at y~18
    'M10.75 2.5V8.2' +
    'C8 8.8 6 10.5 6 12.5C6 14 7 15 9 15.5' +
    'C7 16 6 17.5 6 19C6 22.5 8.8 24 12 24' +
    'C15.2 24 18 22.5 18 19C18 17.5 17 16 15 15.5' +
    'C17 15 18 14 18 12.5C18 10.5 16 8.8 13.25 8.2V2.5H10.75Z' +
    // soundhole cutout — circle at lower-bout centre
    'M14.1 18.7A2.1 2.1 0 1 0 9.9 18.7A2.1 2.1 0 0 0 14.1 18.7Z',

  // ── Electric Guitar (Stratocaster style) ─────────────────────────────────
  guitar_electric:
    // headstock (inline 6 style)
    'M10.5 0.5h3v1.5l1.5 0.5V4H10.5V2.5Z' +
    // neck
    'M11 4h2v7h-2Z' +
    // double-cutaway body: upper horns + lower waist
    'M11 11C9.2 11 7 12 7 13.5C7 14.5 7.8 15.5 9.5 15.8' +
    'L7.5 16.5C6 17.5 5.5 19 5.5 20.5C5.5 23 8 24 12 24' +
    'C16 24 18.5 23 18.5 20.5C18.5 19 18 17.5 16.5 16.5L14.5 15.8' +
    'C16.2 15.5 17 14.5 17 13.5C17 12 14.8 11 13 11H11Z',

  // ── Classical Guitar ──────────────────────────────────────────────────────
  // Narrower waist than acoustic, similar layout
  guitar_classical:
    'M10 0.5h4v2h-4Z' +
    'M10.75 2.5V8.2' +
    'C8.2 8.8 6.5 10.2 6.5 12C6.5 13.4 7.5 14.4 9.5 14.8' +
    'C7.5 15.4 6.5 16.8 6.5 18.3C6.5 22 9 24 12 24' +
    'C15 24 17.5 22 17.5 18.3C17.5 16.8 16.5 15.4 14.5 14.8' +
    'C16.5 14.4 17.5 13.4 17.5 12C17.5 10.2 15.8 8.8 13.25 8.2V2.5H10.75Z' +
    // smaller soundhole
    'M13.8 17.8A1.8 1.8 0 1 0 10.2 17.8A1.8 1.8 0 0 0 13.8 17.8Z',

  // ── Electric Bass ─────────────────────────────────────────────────────────
  // Longer neck, Precision-bass offset body
  bass_electric:
    // headstock (4-tuner style)
    'M10.5 0.5h3v1.5l1.5 0.5V4H10.5V2Z' +
    // neck (longer than guitar)
    'M11 4h2v8.5h-2Z' +
    // body: offset double-cutaway
    'M11 12.5C9 12.5 6.5 13.5 6.5 15.5C6.5 17 7.8 18 10 18.5' +
    'L7.5 19.3C6 20.2 5.5 21.5 5.5 23C5.5 24 6.5 24 8 24' +
    'H16C17.5 24 18.5 24 18.5 23C18.5 21.5 18 20.2 16.5 19.3' +
    'L14 18.5C16.2 18 17.5 17 17.5 15.5C17.5 13.5 15 12.5 13 12.5H11Z',

  // ── Upright / Double Bass ─────────────────────────────────────────────────
  // Scroll at top, wide rounded body, f-hole cutouts
  bass_upright:
    // scroll + neck
    'M10.5 0C9.5 0 9 0.8 9 2V5H10.5C11 5 11.5 5.5 11.5 6V10' +
    'C7.5 11 4.5 14 4.5 18C4.5 22 7.8 24 12 24' +
    'C16.2 24 19.5 22 19.5 18C19.5 14 16.5 11 12.5 10V6' +
    'C12.5 5.5 13 5 13.5 5H15V2C15 0.8 14.5 0 13.5 0H10.5Z' +
    // left f-hole cutout (thin vertical teardrop)
    'M9.2 14.5C9.2 13.9 9.6 13.5 10 13.5S10.8 13.9 10.8 14.5V19.5' +
    'C10.8 20.1 10.4 20.5 10 20.5S9.2 20.1 9.2 19.5Z' +
    // right f-hole cutout
    'M13.2 14.5C13.2 13.9 13.6 13.5 14 13.5S14.8 13.9 14.8 14.5V19.5' +
    'C14.8 20.1 14.4 20.5 14 20.5S13.2 20.1 13.2 19.5Z',

  // ── Grand Piano ───────────────────────────────────────────────────────────
  // Based on real grand piano silhouette: tall keyboard-end on left, curved body sweeps right.
  // Body fills y:0-17; keyboard occupies y:17-24.
  // White key rectangles are evenodd cutouts (appear light = white keys).
  // Dark gaps between them suggest black key positions.
  piano_grand:
    // Body + base (the characteristic grand piano curve from sample SVG, scaled to 24x24)
    'M24 24L0 24C0 24 0 15 0 10C0 4 6 1 10 3C13 4.5 13 9 16 10.5C19 12 24 13.5 24 17Z' +
    // White key cutouts — 7 keys in x:0-24, y:17-24
    'M0.3 17h2.8v7H0.3Z' +
    'M3.75 17h2.8v7H3.75Z' +
    'M7.2 17h2.8v7H7.2Z' +
    'M10.6 17h2.8v7H10.6Z' +
    'M14.05 17h2.8v7H14.05Z' +
    'M17.5 17h2.8v7H17.5Z' +
    'M20.9 17h2.8v7H20.9Z',

  // ── Baby Grand Piano ──────────────────────────────────────────────────────
  piano_baby_grand:
    'M23 24L0 24C0 24 0 16 0 11C0 5 5 2 9 3.5C12 5 12 9.5 15 11C18 12.5 23 14 23 18Z' +
    'M0.3 18h2.6v6H0.3Z' +
    'M3.5 18h2.6v6H3.5Z' +
    'M6.7 18h2.6v6H6.7Z' +
    'M9.9 18h2.6v6H9.9Z' +
    'M13.1 18h2.6v6H13.1Z' +
    'M16.3 18h2.6v6H16.3Z' +
    'M19.5 18h2.6v6H19.5Z',

  // ── Upright Piano ─────────────────────────────────────────────────────────
  // Front view. Case body includes key area; white key rectangles are evenodd cutouts.
  piano_upright:
    // Full case
    'M3 2h18v22H3Z' +
    // White key cutouts — 7 keys in x:3-21, y:16-23
    'M3.2 16h2.2v7H3.2Z' +
    'M5.7 16h2.2v7H5.7Z' +
    'M8.2 16h2.2v7H8.2Z' +
    'M10.7 16h2.2v7H10.7Z' +
    'M13.2 16h2.2v7H13.2Z' +
    'M15.7 16h2.2v7H15.7Z' +
    'M18.2 16h2.2v7H18.2Z' +
    // Legs
    'M5 24h2.5v0H5Z' +
    'M16.5 24h2.5v0H16.5Z',

  // ── Stage Keyboard / Synthesizer ──────────────────────────────────────────
  // Landscape body. White key cutouts in lower section.
  keyboard:
    // Body
    'M1.5 7h21v16H1.5Z' +
    // White key cutouts — 7 keys in x:1.5-22.5, y:13-22
    'M1.7 13h2.7v9H1.7Z' +
    'M4.7 13h2.7v9H4.7Z' +
    'M7.7 13h2.7v9H7.7Z' +
    'M10.7 13h2.7v9H10.7Z' +
    'M13.7 13h2.7v9H13.7Z' +
    'M16.7 13h2.7v9H16.7Z' +
    'M19.7 13h2.7v9H19.7Z',

  // ── Organ ─────────────────────────────────────────────────────────────────
  // Hammond-style: two manual keyboards stacked + pedal board.
  organ:
    // Upper manual body
    'M2 3h20v5.5H2Z' +
    // Lower manual body
    'M2 10h20v5.5H2Z' +
    // Pedal board
    'M4 17.5h16v4.5H4Z' +
    // White key cutouts — upper manual (4 keys in x:2-22, y:3-8.5)
    'M2.3 3h4.2v5.5H2.3Z' +
    'M7 3h4.2v5.5H7Z' +
    'M11.8 3h4.2v5.5H11.8Z' +
    'M16.6 3h4.2v5.5H16.6Z' +
    // White key cutouts — lower manual
    'M2.3 10h4.2v5.5H2.3Z' +
    'M7 10h4.2v5.5H7Z' +
    'M11.8 10h4.2v5.5H11.8Z' +
    'M16.6 10h4.2v5.5H16.6Z',

  // ── Drums (top-down kit view) ─────────────────────────────────────────────
  // Kick drum centre, snare front-left, two rack toms above, floor tom right,
  // hi-hat far left, ride cymbal upper right.
  drums:
    'M6 15A6 5 0 1 0 18 15A6 5 0 0 0 6 15Z' +             // kick drum
    'M4 9.5A2.5 2.5 0 1 0 9 9.5A2.5 2.5 0 0 0 4 9.5Z' +  // snare
    'M9 6.5A2 2 0 1 0 13 6.5A2 2 0 0 0 9 6.5Z' +          // rack tom 1
    'M13 7A2 2 0 1 0 17 7A2 2 0 0 0 13 7Z' +               // rack tom 2
    'M17.5 13.5A2.5 2.5 0 1 0 22.5 13.5A2.5 2.5 0 0 0 17.5 13.5Z' + // floor tom
    'M1 12A2 1.5 0 1 0 5 12A2 1.5 0 0 0 1 12Z' +          // hi-hat
    'M17.5 8A2.5 1.5 0 1 0 22.5 8A2.5 1.5 0 0 0 17.5 8Z', // ride cymbal

  // ── Electronic Drum Kit ───────────────────────────────────────────────────
  drums_electronic:
    'M2 7.5h20v9H2Z' +        // rack frame / brain unit
    'M4 9.5h4v4.5H4Z' +       // pad 1
    'M10 9.5h4v4.5h-4Z' +     // pad 2
    'M16 9.5h4v4.5h-4Z' +     // pad 3
    'M7 19h3v3H7Z' +           // leg 1
    'M14 19h3v3h-3Z',          // leg 2

  // ── Kick Drum (side view) ─────────────────────────────────────────────────
  drums_kick:
    'M3.5 12A8.5 7 0 1 0 20.5 12A8.5 7 0 0 0 3.5 12Z' +  // shell
    'M8.5 12A3.5 3 0 1 0 15.5 12A3.5 3 0 0 0 8.5 12Z',   // batter head detail

  // ── Snare Drum (side view) ────────────────────────────────────────────────
  drums_snare:
    'M3.5 9.5A8.5 3.5 0 0 1 20.5 9.5V15A8.5 3.5 0 0 1 3.5 15Z',

  // ── Hi-Hat ────────────────────────────────────────────────────────────────
  drums_hihat:
    'M3.5 7.5A8.5 2.5 0 1 0 20.5 7.5A8.5 2.5 0 0 0 3.5 7.5Z' +  // top cymbal
    'M3.5 11A8.5 2.5 0 1 0 20.5 11A8.5 2.5 0 0 0 3.5 11Z' +      // bottom cymbal
    'M11 9h2v2h-2Z',                                               // rod

  // ── Cymbal ────────────────────────────────────────────────────────────────
  drums_cymbal:
    'M2.5 10A9.5 3 0 1 0 21.5 10A9.5 3 0 0 0 2.5 10Z' +    // cymbal body
    'M9.5 10A2.5 1 0 1 0 14.5 10A2.5 1 0 0 0 9.5 10Z',     // dome cutout

  // ── Cajon ─────────────────────────────────────────────────────────────────
  // Wooden box with oval sound port cutout
  cajon:
    'M7 3h10v18H7Z' +
    'M10 8.5A2 2.5 0 1 0 14 8.5A2 2.5 0 0 0 10 8.5Z',

  // ── Congas ────────────────────────────────────────────────────────────────
  // Two tapered tall barrel drums
  congas:
    'M3.5 6.5A3.5 3.5 0 0 1 10.5 6.5V19.5C10.5 21 9.5 22 7 22C4.5 22 3.5 21 3.5 19.5Z' +
    'M13.5 5.5A3.5 3.5 0 0 1 20.5 5.5V20C20.5 21.5 19 23 17 23C15 23 13.5 21.5 13.5 20Z',

  // ── Marimba / Xylophone ───────────────────────────────────────────────────
  // Graduated bars (longer at left = lower pitch) + resonator tubes below
  marimba:
    'M2.5 5h2.5v5H2.5Z' +
    'M6 4.5h2.5v5.5H6Z' +
    'M9.5 4h2.5v6H9.5Z' +
    'M13 4h2.5v6H13Z' +
    'M16.5 4.5h2.5v5.5H16.5Z' +
    'M19 5h2.5v5H19Z' +
    // resonator tubes
    'M3 10h1.5v7H3Z' +
    'M6.5 10h1.5v8H6.5Z' +
    'M10 10h1.5v9H10Z' +
    'M13.5 10h1.5v8H13.5Z' +
    'M17 10h1.5v7H17Z' +
    'M19.5 10h1.5v6H19.5Z',

  // ── Timpani ───────────────────────────────────────────────────────────────
  // Kettle drum: hemispherical bowl on pedal base
  timpani:
    // bowl (semi-ellipse)
    'M3 13C3 9 7 6.5 12 6.5C17 6.5 21 9 21 13A9 4 0 0 1 3 13Z' +
    // rim
    'M3 13A9 2.5 0 0 0 21 13' +
    // pedal leg
    'M11 17h2v5h-2Z' +
    'M9 22h6v1.5H9Z',

  // ── Generic Percussion ───────────────────────────────────────────────────
  percussion:
    'M1.5 12A5.5 5 0 1 0 12.5 12A5.5 5 0 0 0 1.5 12Z' +
    'M11.5 11.5A5.5 5 0 1 0 22.5 11.5A5.5 5 0 0 0 11.5 11.5Z',

  // ── Trumpet ───────────────────────────────────────────────────────────────
  // Side profile: three valve pistons, bell flare to right, lead pipe on left.
  wind_trumpet:
    // lead pipe
    'M1.5 11h14v2.5H1.5Z' +
    // valve 1
    'M7 8h2.5v7H7Z' +
    // valve 2
    'M10.5 8h2.5v7H10.5Z' +
    // valve 3
    'M14 8h2.5v7H14Z' +
    // bell flare (curves out to the right)
    'M15 9.5Q23 9.5 23 12.25Q23 15 15 15Z' +
    // mouthpiece receiver (left)
    'M1 10h2v4.5H1Z',

  // ── Trombone ──────────────────────────────────────────────────────────────
  // U-shaped slide + bell flare
  wind_trombone:
    // outer left tube
    'M1.5 8h2.5v8.5H1.5Z' +
    // top crossbar
    'M1.5 8h9v2.5h-9Z' +
    // bottom crossbar
    'M1.5 14h9v2.5h-9Z' +
    // inner right of slide
    'M8.5 6h2.5v12H8.5Z' +
    'M11 6h2.5v12H11Z' +
    // top/bottom braces for inner slide
    'M11 6h7v2h-7Z' +
    'M11 16h7v2h-7Z' +
    // far right tube
    'M16.5 6h2.5v12H16.5Z' +
    // bell flare
    'M19 6Q24 7 24 12Q24 17 19 18V6Z',

  // ── Saxophone ─────────────────────────────────────────────────────────────
  // Curved body, neck crook, bell flare at bottom
  wind_saxophone:
    // main body tube (banana/crescent shape)
    'M11 3.5C9 3.5 7.5 5 7.5 7.5V17C7.5 21 10 23 12 23' +
    'C14 23 16.5 21 16.5 17V7.5C16.5 5 15 3.5 13 3.5H11Z' +
    // neck crook going to upper-right
    'M13 3.5C14 2 15.5 1.5 16.5 2L17.5 3.5C16.5 4 15 4 14 4.5Z' +
    // bell flare at bottom-left
    'M7.5 19Q5 21 4.5 23.5L8.5 24Q9 22.5 11 21Z' +
    // mouthpiece nub at end of neck
    'M16.5 1.5h2v2h-2Z',

  // ── Flute ─────────────────────────────────────────────────────────────────
  // Horizontal tube, embouchure hole, two key cups
  wind_flute:
    // body tube
    'M1.5 10.5h21v3H1.5Z' +
    // head joint / embouchure
    'M1.5 8.5h3.5v2.5H1.5Z' +
    // key cups (oval pads above tube)
    'M7.5 8A1.5 1.5 0 1 0 10.5 8A1.5 1.5 0 0 0 7.5 8Z' +
    'M13 8A1.5 1.5 0 1 0 16 8A1.5 1.5 0 0 0 13 8Z',

  // ── Microphone (handheld) ─────────────────────────────────────────────────
  // Rounded dome capsule + grille lines + straight handle
  microphone:
    // capsule head (rounded rectangle)
    'M9 2C7.5 2 7 3.5 7 5V10.5C7 12.8 9.2 14.5 12 14.5' +
    'C14.8 14.5 17 12.8 17 10.5V5C17 3.5 16.5 2 15 2H9Z' +
    // grille line cutouts (horizontal, evenly spaced)
    'M7 6.5h10v1H7Z' +
    'M7 9h10v1H7Z' +
    'M7 11.5h10v1H7Z' +
    // handle
    'M10.5 14.5h3V23h-3Z',

  // ── Microphone on Stand ───────────────────────────────────────────────────
  mic_stand:
    // capsule
    'M9.5 1.5C8 1.5 7.5 3 7.5 4.5V10C7.5 12.2 9.5 13.5 12 13.5' +
    'C14.5 13.5 16.5 12.2 16.5 10V4.5C16.5 3 16 1.5 14.5 1.5H9.5Z' +
    // grille lines
    'M7.5 6h9v1H7.5Z' +
    'M7.5 8.5h9v1H7.5Z' +
    // pole
    'M11.5 13.5h1v8h-1Z' +
    // base
    'M8.5 21.5h7v2h-7Z',

  // ── Overhead Microphone ───────────────────────────────────────────────────
  // Side-address capsule + horizontal boom + vertical stand
  mic_overhead:
    // capsule (small, horizontal orientation)
    'M10 2C9 2 8.5 3 8.5 4.5V10C8.5 11 9 12 10 12H14C15 12 15.5 11 15.5 10V4.5' +
    'C15.5 3 15 2 14 2H10Z' +
    // grille lines
    'M8.5 6h7v1h-7Z' +
    'M8.5 8.5h7v1h-7Z' +
    // boom arm
    'M2 9.5h8.5v1.5H2Z' +
    // vertical stand
    'M2 9.5V20H3.5V11H2Z',

  // ── PA / Main Speaker ─────────────────────────────────────────────────────
  // Tall cabinet: LF driver (surround→cone) + HF tweeter
  speaker_main:
    // cabinet
    'M4 2h16v21H4Z' +
    // LF driver surround (cutout ring)
    'M6.5 13.5A5.5 5.5 0 1 0 17.5 13.5A5.5 5.5 0 0 0 6.5 13.5Z' +
    // LF cone (re-fill)
    'M9 13.5A3 3 0 1 0 15 13.5A3 3 0 0 0 9 13.5Z' +
    // dust cap (cutout)
    'M10.5 13.5A1.5 1.5 0 1 0 13.5 13.5A1.5 1.5 0 0 0 10.5 13.5Z' +
    // HF tweeter
    'M10 6A2 2 0 1 0 14 6A2 2 0 0 0 10 6Z',

  // ── Subwoofer ─────────────────────────────────────────────────────────────
  subwoofer:
    'M3 3h18v18H3Z' +
    'M6 12A6 6 0 1 0 18 12A6 6 0 0 0 6 12Z' +     // surround
    'M9 12A3 3 0 1 0 15 12A3 3 0 0 0 9 12Z',      // cone

  // ── Floor Monitor Wedge ───────────────────────────────────────────────────
  // Low-profile wedge seen from the front: characteristic triangle + speaker cone.
  monitor:
    // wedge body
    'M1.5 22.5L11 4.5h2L22.5 22.5H1.5Z' +
    // speaker surround (cutout)
    'M7.5 18A4.5 4.5 0 1 0 16.5 18A4.5 4.5 0 0 0 7.5 18Z' +
    // cone (re-fill)
    'M10 18A2 2 0 1 0 14 18A2 2 0 0 0 10 18Z',

  // ── Sidefill Monitor ─────────────────────────────────────────────────────
  monitor_sidefill:
    'M2 22.5L11 4h2L22 22.5H2Z' +
    'M8.5 17.5A3.5 3.5 0 1 0 15.5 17.5A3.5 3.5 0 0 0 8.5 17.5Z',

  // ── IEM (In-Ear Monitor) ──────────────────────────────────────────────────
  // Two earbuds + connecting cable
  monitor_iem:
    'M5 6A3.5 6 0 1 0 5 18A3.5 6 0 0 0 5 6Z' +    // left bud
    'M19 6A3.5 6 0 1 0 19 18A3.5 6 0 0 0 19 6Z' + // right bud
    'M8.5 11.5h7v1.5h-7Z',                         // cable

  // ── DI Box ────────────────────────────────────────────────────────────────
  di_box:
    'M4 5h16v14H4Z' +         // box body
    'M20 9h3.5v6H20Z' +       // XLR out port (right)
    'M0.5 9h3.5v6H0.5Z' +     // line in port (left)
    'M8 8h8v2H8Z' +           // top label strip (cutout)
    'M7 13h10v2.5H7Z',        // ground-lift switch area (cutout)

  // ── FOH Mixing Desk ───────────────────────────────────────────────────────
  desk_foh:
    // main flat surface (trapezoid with angled top)
    'M3 11h18v10H3Z' +
    // angled meter bridge at back
    'M3 11L5 4h14l2 7H3Z' +
    // fader channel cutouts on surface
    'M5.5 13h2v6h-2Z' +
    'M9 13h2v7H9Z' +
    'M12.5 13h2v6h-2.5Z' +
    'M16 13h2v6h-2Z',

  // ── Generic ──────────────────────────────────────────────────────────────
  generic: 'M4 4h16v16H4Z',

  // ── Legacy aliases ────────────────────────────────────────────────────────
  // Same shapes as named variants above

  guitar:
    'M10 0.5h4v2h-4Z' +
    'M10.75 2.5V8.2C8 8.8 6 10.5 6 12.5C6 14 7 15 9 15.5' +
    'C7 16 6 17.5 6 19C6 22.5 8.8 24 12 24C15.2 24 18 22.5 18 19' +
    'C18 17.5 17 16 15 15.5C17 15 18 14 18 12.5C18 10.5 16 8.8 13.25 8.2V2.5H10.75Z' +
    'M14.1 18.7A2.1 2.1 0 1 0 9.9 18.7A2.1 2.1 0 0 0 14.1 18.7Z',

  bass:
    'M10.5 0.5h3v1.5l1.5 0.5V4H10.5V2Z' +
    'M11 4h2v8.5h-2Z' +
    'M11 12.5C9 12.5 6.5 13.5 6.5 15.5C6.5 17 7.8 18 10 18.5' +
    'L7.5 19.3C6 20.2 5.5 21.5 5.5 23C5.5 24 6.5 24 8 24' +
    'H16C17.5 24 18.5 24 18.5 23C18.5 21.5 18 20.2 16.5 19.3' +
    'L14 18.5C16.2 18 17.5 17 17.5 15.5C17.5 13.5 15 12.5 13 12.5H11Z',

  amp:
    'M3 5h18v14H3Z' +
    'M6.5 12A5.5 5.5 0 1 0 17.5 12A5.5 5.5 0 0 0 6.5 12Z' +
    'M9.5 12A2.5 2.5 0 1 0 14.5 12A2.5 2.5 0 0 0 9.5 12Z',

  amp_combo:
    'M3 6h18v17H3Z' +
    'M5.5 15A6.5 6.5 0 1 0 18.5 15A6.5 6.5 0 0 0 5.5 15Z' +
    'M9 15A3 3 0 1 0 15 15A3 3 0 0 0 9 15Z' +
    // small controls top-left
    'M5 8.5h3v2.5H5Z' +
    'M14 8.5h5v2.5h-5Z',

  amp_head:
    'M2 8h20v9H2Z' +
    // four knobs (cutouts)
    'M4.5 10.5A1.5 1.5 0 1 0 7.5 10.5A1.5 1.5 0 0 0 4.5 10.5Z' +
    'M8.5 10.5A1.5 1.5 0 1 0 11.5 10.5A1.5 1.5 0 0 0 8.5 10.5Z' +
    'M12.5 10.5A1.5 1.5 0 1 0 15.5 10.5A1.5 1.5 0 0 0 12.5 10.5Z' +
    'M16.5 10.5A1.5 1.5 0 1 0 19.5 10.5A1.5 1.5 0 0 0 16.5 10.5Z',

  amp_cab:
    'M4 2.5h16v20H4Z' +
    'M7 10.5A5 5 0 1 0 17 10.5A5 5 0 0 0 7 10.5Z' +     // surround
    'M9.5 10.5A2.5 2.5 0 1 0 14.5 10.5A2.5 2.5 0 0 0 9.5 10.5Z',  // cone

  amp_bass:
    'M3 5h18v18H3Z' +
    'M5.5 15.5A6.5 6.5 0 1 0 18.5 15.5A6.5 6.5 0 0 0 5.5 15.5Z' +
    'M9 15.5A3 3 0 1 0 15 15.5A3 3 0 0 0 9 15.5Z',
}

// ── Detail strokes (unused — rendering removed) ───────────────────────────
export const ICON_PATHS: Record<string, string> = {}

/**
 * Pre-rotation angles (degrees) applied to the icon Group so that
 * "hanging" instruments appear diagonal on the canvas, like in reference icon sets.
 * Positive = clockwise. Applied on top of the 180° stage-facing flip.
 */
export const ICON_PRESET_ROTATION: Partial<Record<string, number>> = {
  guitar_acoustic: -30,
  guitar_electric: -35,
  guitar_classical: -30,
  bass_electric: -30,
  bass_upright: -20,
  guitar: -30,
  bass: -30,
  wind_saxophone: -30,
  wind_trombone: -25,
  wind_flute: 20,
  microphone: -12,
  mic_stand: -8,
}
