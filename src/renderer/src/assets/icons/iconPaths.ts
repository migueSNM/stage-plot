/**
 * SVG icon body silhouettes for all built-in item types.
 * All paths are on a 24×24 viewBox.
 * Rendered with fill-rule="evenodd" so inner sub-paths act as cutouts
 * (soundholes, speaker cones, knobs, etc.).
 *
 * ICON_BODIES: filled silhouette — white fill, evenodd cutouts for details
 * ICON_PATHS:  (unused — kept for reference only)
 */

// helper: full circle as arc path  M cx+r cy  A r r 0 1 0 cx-r cy  A r r 0 1 0 cx+r cy Z
// ── Filled body silhouettes ────────────────────────────────────────────────
export const ICON_BODIES: Partial<Record<string, string>> = {

  // ── Person (vocalist) ────────────────────────────────────────────────────
  // Head + torso. Simple, recognisable human silhouette.
  person:
    'M12 1a3 3 0 1 0 0.01 0Z' +                         // head
    'M7 23v-4.5C7 16 9 14 12 14s5 2 5 4.5V23H7Z',      // torso/shoulders

  // ── Acoustic Guitar ───────────────────────────────────────────────────────
  // Figure-8 body, neck, headstock, soundhole cutout.
  guitar_acoustic:
    // headstock
    'M10 0h4v2.5h-4Z' +
    // neck + body (continuous)
    'M10.75 2.5V8C7.8 8.6 6 10.2 6 12.2C6 13.8 7 15 9 15.6' +
    'C7 16.4 6 18 6 19.5C6 23 8.8 24.5 12 24.5' +
    'C15.2 24.5 18 23 18 19.5C18 18 17 16.4 15 15.6' +
    'C17 15 18 13.8 18 12.2C18 10.2 16.2 8.6 13.25 8V2.5H10.75Z' +
    // soundhole cutout (evenodd)
    'M14.3 19.5A2.3 2.3 0 1 0 9.7 19.5A2.3 2.3 0 0 0 14.3 19.5Z',

  // ── Electric Guitar (Stratocaster style) ──────────────────────────────────
  guitar_electric:
    // headstock
    'M10.5 0.5h3v2l1.5 0.5V4.5H10.5V2.5Z' +
    // neck
    'M11 4.5h2V11h-2Z' +
    // double-cutaway body
    'M11 11C9.2 11 7 12 7 13.5C7 14.5 7.8 15.5 9.5 15.8' +
    'L7.5 16.5C6 17.5 5.5 19 5.5 20.5C5.5 23 8 25 12 25' +
    'C16 25 18.5 23 18.5 20.5C18.5 19 18 17.5 16.5 16.5L14.5 15.8' +
    'C16.2 15.5 17 14.5 17 13.5C17 12 14.8 11 13 11H11Z',

  // ── Classical Guitar ──────────────────────────────────────────────────────
  guitar_classical:
    'M10 0h4v2.5h-4Z' +
    'M10.75 2.5V8C8 8.6 6.5 10 6.5 11.8C6.5 13.3 7.5 14.5 9.5 15' +
    'C7.5 15.8 6.5 17.2 6.5 18.8C6.5 22 9 24 12 24' +
    'C15 24 17.5 22 17.5 18.8C17.5 17.2 16.5 15.8 14.5 15' +
    'C16.5 14.5 17.5 13.3 17.5 11.8C17.5 10 16 8.6 13.25 8V2.5H10.75Z' +
    'M14 18.2A2 2 0 1 0 10 18.2A2 2 0 0 0 14 18.2Z',

  // ── Electric Bass ─────────────────────────────────────────────────────────
  bass_electric:
    // headstock (4-peg bass style)
    'M10.5 0h3v2l1.5 0.5V4H10.5V2Z' +
    // longer neck
    'M11 4h2V12h-2Z' +
    // P-bass offset body
    'M11 12C9 12 6.5 13 6.5 15.2C6.5 16.7 7.8 17.8 10 18.3' +
    'L7.5 19.2C6 20 5.5 21.5 5.5 23C5.5 24 6.5 25 8 25' +
    'H16C17.5 25 18.5 24 18.5 23C18.5 21.5 18 20 16.5 19.2' +
    'L14 18.3C16.2 17.8 17.5 16.7 17.5 15.2C17.5 13 15 12 13 12H11Z',

  // ── Upright / Double Bass ─────────────────────────────────────────────────
  bass_upright:
    // scroll + neck
    'M10.5 0C9.5 0 9 0.8 9 2V5H10.5C11 5 11.5 5.5 11.5 6V9.5' +
    'C7.5 10.5 4.5 13.5 4.5 17.5C4.5 22 7.8 24.5 12 24.5' +
    'C16.2 24.5 19.5 22 19.5 17.5C19.5 13.5 16.5 10.5 12.5 9.5V6' +
    'C12.5 5.5 13 5 13.5 5H15V2C15 0.8 14.5 0 13.5 0H10.5Z' +
    // f-hole left (evenodd cutout)
    'M9.5 14.5V19.5C9.5 20 9.8 20.5 10.3 20.5C10.8 20.5 11.2 20 11.2 19.5' +
    'V14.5C11.2 14 10.8 13.5 10.3 13.5C9.8 13.5 9.5 14 9.5 14.5Z' +
    // f-hole right
    'M12.8 14.5V19.5C12.8 20 13.2 20.5 13.7 20.5C14.2 20.5 14.5 20 14.5 19.5' +
    'V14.5C14.5 14 14.2 13.5 13.7 13.5C13.2 13.5 12.8 14 12.8 14.5Z',

  // ── Drums (top-down kit) ───────────────────────────────────────────────────
  drums:
    'M6 15A6 5 0 1 0 18 15A6 5 0 0 0 6 15Z' +          // kick drum
    'M4 9.5A2.5 2.5 0 1 0 9 9.5A2.5 2.5 0 0 0 4 9.5Z' + // snare (front-L)
    'M9 6.5A2 2 0 1 0 13 6.5A2 2 0 0 0 9 6.5Z' +        // rack tom 1
    'M13 7A2 2 0 1 0 17 7A2 2 0 0 0 13 7Z' +             // rack tom 2
    'M17.5 13.5A2.5 2.5 0 1 0 22.5 13.5A2.5 2.5 0 0 0 17.5 13.5Z' + // floor tom
    'M1 12A2 1.5 0 1 0 5 12A2 1.5 0 0 0 1 12Z' +        // hi-hat
    'M17.5 8A2.5 1.5 0 1 0 22.5 8A2.5 1.5 0 0 0 17.5 8Z', // ride cymbal

  // ── Electronic Drum Kit ───────────────────────────────────────────────────
  drums_electronic:
    'M2 7.5h20v10H2Z' +                                  // rack frame
    'M4 9.5h4v4.5H4Z' +                                  // pad 1
    'M10 9.5h4v4.5h-4Z' +                                // pad 2
    'M16 9.5h4v4.5h-4Z' +                                // pad 3
    'M7 20h3v3H7Z' +                                     // leg 1
    'M14 20h3v3h-3Z',                                    // leg 2

  // ── Kick Drum (side view) ─────────────────────────────────────────────────
  drums_kick:
    'M3.5 12A8.5 7 0 1 0 20.5 12A8.5 7 0 0 0 3.5 12Z' + // shell
    'M8.5 12A3.5 3 0 1 0 15.5 12A3.5 3 0 0 0 8.5 12Z',  // batter head

  // ── Snare Drum (side view) ────────────────────────────────────────────────
  drums_snare:
    'M3.5 9.5A8.5 3.5 0 0 1 20.5 9.5V15A8.5 3.5 0 0 1 3.5 15Z',

  // ── Hi-Hat ────────────────────────────────────────────────────────────────
  drums_hihat:
    'M3.5 7.5A8.5 2.5 0 1 0 20.5 7.5A8.5 2.5 0 0 0 3.5 7.5Z' +
    'M3.5 11A8.5 2.5 0 1 0 20.5 11A8.5 2.5 0 0 0 3.5 11Z' +
    'M11 8.5h2V11h-2Z',                                  // rod

  // ── Cymbal ────────────────────────────────────────────────────────────────
  drums_cymbal:
    'M2.5 9.5A9.5 3 0 1 0 21.5 9.5A9.5 3 0 0 0 2.5 9.5Z' +
    'M9.5 9.5A2.5 1 0 1 0 14.5 9.5A2.5 1 0 0 0 9.5 9.5Z', // dome cutout

  // ── Cajon ─────────────────────────────────────────────────────────────────
  cajon:
    'M7 3h10v18H7Z' +
    'M10 8.5A2 2.5 0 1 0 14 8.5A2 2.5 0 0 0 10 8.5Z',  // sound port

  // ── Congas ────────────────────────────────────────────────────────────────
  congas:
    // left conga (tall tapered drum)
    'M3.5 6.5A3.5 3.5 0 0 1 10.5 6.5V19C10.5 20.5 9.5 22 7 22C4.5 22 3.5 20.5 3.5 19Z' +
    // right conga (taller)
    'M13.5 5.5A3.5 3.5 0 0 1 20.5 5.5V19.5C20.5 21.5 19 23 17 23C15 23 13.5 21.5 13.5 19.5Z',

  // ── Marimba / Xylophone ───────────────────────────────────────────────────
  marimba:
    // bars (graduated heights, longer at left)
    'M2.5 5h2.5v5H2.5Z' +
    'M6 4.5h2.5v5.5H6Z' +
    'M9.5 4h2.5v6H9.5Z' +
    'M13 4h2.5v6H13Z' +
    'M16.5 4.5h2.5v5.5h-2.5Z' +
    'M19 5h2.5v5H19Z' +
    // resonator tubes
    'M3 10h1.5v7H3ZM6.5 10h1.5v8H6.5ZM10 10h1.5v9H10ZM13.5 10h1.5v8h-1.5ZM17 10h1.5v7H17ZM19.5 10h1.5v6h-1.5Z',

  // ── Timpani ───────────────────────────────────────────────────────────────
  timpani:
    // kettle (open top hemisphere + stem)
    'M3 13C3 9 7 6.5 12 6.5C17 6.5 21 9 21 13A9 4.5 0 0 1 3 13Z' +
    'M5 14Q5 19.5 12 20Q19 19.5 19 14',                  // bowl rim

  // ── Percussion (generic) ──────────────────────────────────────────────────
  percussion:
    'M1.5 12A5.5 5 0 1 0 12.5 12A5.5 5 0 0 0 1.5 12Z' +
    'M11.5 11A5.5 5 0 1 0 22.5 11A5.5 5 0 0 0 11.5 11Z',

  // ── Trumpet ───────────────────────────────────────────────────────────────
  wind_trumpet:
    // main lead pipe
    'M2 11h13v2.5H2Z' +
    // three valves (cylinders sticking up)
    'M7 8h2.5v6H7Z' +
    'M10.5 8h2.5v6h-2.5Z' +
    'M14 8h2.5v6H14Z' +
    // bell flare
    'M15 9.5Q22 9.5 22 12.25Q22 15 15 15Z' +
    // mouthpiece receiver
    'M1 10h2.5v4H1Z',

  // ── Trombone ──────────────────────────────────────────────────────────────
  wind_trombone:
    // outer slide (left vertical)
    'M1.5 7.5h2.5v9H1.5Z' +
    // top bar
    'M1.5 7.5h9v2.5h-9Z' +
    // bottom bar
    'M1.5 14.5h9v2.5h-9Z' +
    // inner slide (right side)
    'M8.5 5.5h2.5v13H8.5Z' +
    'M11 5.5h2.5v13H11Z' +
    // upper brace
    'M11 5.5h7v2.5h-7Z' +
    // lower brace
    'M11 16h7v2.5h-7Z' +
    // right tube
    'M16 5.5h2.5v13H16Z' +
    // bell flare
    'M18.5 5.5Q23.5 6.5 23.5 12Q23.5 17.5 18.5 18.5V5.5Z',

  // ── Saxophone ─────────────────────────────────────────────────────────────
  wind_saxophone:
    // main curved body
    'M14 1C12 1 10 2.5 10 5V15.5C10 19.5 11.5 22.5 12 23' +
    'C12.5 22.5 14 19.5 14 15.5V5C14 3.5 15 2.5 16 2.5' +
    'C15.5 1.5 14.8 1 14 1Z' +
    // bell flare at bottom
    'M10 17.5Q7 19.5 6 22L9.5 23.5Q10.5 22 12 20.5Z' +
    // neck crook + mouthpiece
    'M14 1L15 0.5L16 1.5L15 2.5Z',

  // ── Flute ─────────────────────────────────────────────────────────────────
  wind_flute:
    'M1.5 10.5h21v3H1.5Z' +                             // body tube
    'M1.5 8.5h3v2.5h-3Z' +                              // head joint / embouchure
    'M7.5 7.5A1.5 1.5 0 1 0 10.5 7.5A1.5 1.5 0 0 0 7.5 7.5Z' + // key 1
    'M13 7.5A1.5 1.5 0 1 0 16 7.5A1.5 1.5 0 0 0 13 7.5Z',      // key 2

  // ── Microphone (handheld) ─────────────────────────────────────────────────
  microphone:
    // capsule head (rounded dome top, straight sides)
    'M9 2C7.5 2 7 3.5 7 5V10.5C7 12.8 9.2 14.5 12 14.5' +
    'C14.8 14.5 17 12.8 17 10.5V5C17 3.5 16.5 2 15 2H9Z' +
    // handle / grip
    'M10.5 14.5h3V23h-3Z' +
    // grill lines (evenodd cutouts on capsule)
    'M7 6.5h10v1H7ZM7 8.5h10v1H7ZM7 10.5h10v1H7Z',

  // ── Microphone on Stand ───────────────────────────────────────────────────
  mic_stand:
    // capsule
    'M9.5 1.5C8 1.5 7.5 3 7.5 4.5V9.5C7.5 11.8 9.5 13.5 12 13.5' +
    'C14.5 13.5 16.5 11.8 16.5 9.5V4.5C16.5 3 16 1.5 14.5 1.5H9.5Z' +
    // pole
    'M11.5 13.5h1V21h-1Z' +
    // base tripod
    'M8.5 21h7v1.5h-7Z' +
    'M7 22.5L9 24h-2ZM17 22.5L15 24h2Z',

  // ── Overhead Microphone ───────────────────────────────────────────────────
  mic_overhead:
    // small capsule (side address)
    'M10 2C9 2 8 3 8 4.5V9.5C8 11 9 12 10 12H14C15 12 16 11 16 9.5V4.5C16 3 15 2 14 2H10Z' +
    // horizontal boom arm
    'M2.5 9h8V11H2.5Z' +
    // vertical stand
    'M2.5 9V18.5H4V11H2.5Z',

  // ── Speaker / PA Main ─────────────────────────────────────────────────────
  speaker_main:
    // cabinet
    'M4 2h16v21H4Z' +
    // LF driver surround (cutout ring)
    'M6.5 14A5.5 5.5 0 1 0 17.5 14A5.5 5.5 0 0 0 6.5 14Z' +
    // cone (evenodd refill)
    'M9 14A3 3 0 1 0 15 14A3 3 0 0 0 9 14Z' +
    // HF tweeter (cutout)
    'M10 6.5A2 2 0 1 0 14 6.5A2 2 0 0 0 10 6.5Z',

  // ── Subwoofer ─────────────────────────────────────────────────────────────
  subwoofer:
    'M3 3h18v18H3Z' +
    'M6 12A6 6 0 1 0 18 12A6 6 0 0 0 6 12Z' +           // surround
    'M9 12A3 3 0 1 0 15 12A3 3 0 0 0 9 12Z',            // cone

  // ── Floor Monitor Wedge ───────────────────────────────────────────────────
  monitor:
    // wedge body
    'M1.5 22.5L11 4.5h2L22.5 22.5H1.5Z' +
    // speaker surround (cutout)
    'M7.5 18A4.5 4.5 0 1 0 16.5 18A4.5 4.5 0 0 0 7.5 18Z' +
    // cone (refill)
    'M10 18A2 2 0 1 0 14 18A2 2 0 0 0 10 18Z',

  // ── Side Fill Monitor ─────────────────────────────────────────────────────
  monitor_sidefill:
    'M2 22.5L11 4h2L22 22.5H2Z' +
    'M8.5 18A3.5 3.5 0 1 0 15.5 18A3.5 3.5 0 0 0 8.5 18Z',

  // ── IEM / In-Ear Monitor ──────────────────────────────────────────────────
  monitor_iem:
    // two earbuds
    'M5 6A3.5 6 0 1 0 5 18A3.5 6 0 0 0 5 6Z' +
    'M19 6A3.5 6 0 1 0 19 18A3.5 6 0 0 0 19 6Z' +
    // cable connecting them
    'M8.5 12h7v1.5h-7Z',

  // ── DI Box ────────────────────────────────────────────────────────────────
  di_box:
    'M4 5h16v15H4Z' +                                   // box body
    'M20 9h3v6h-3Z' +                                   // XLR out port
    'M1 9h3v6H1Z' +                                     // line in port
    'M8 8.5h8v2H8Z' +                                   // top label strip
    'M7 13h10v2.5H7Z',                                  // pad switch area

  // ── FOH Mixing Desk ───────────────────────────────────────────────────────
  desk_foh:
    // main surface (trapezoid)
    'M3 11h18v11H3Z' +
    // angled meter bridge
    'M3 11L5 4h14l2 7H3Z' +
    // channel faders (cutouts on main surface)
    'M5.5 13h2v6h-2ZM9 13h2v7H9ZM12.5 13h2v6h-2ZM16 13h2v6h-2Z',

  // ── Generic / Fallback ────────────────────────────────────────────────────
  generic: 'M4 4h16v16H4Z',

  // ── Legacy aliases ────────────────────────────────────────────────────────
  guitar:
    'M10 0h4v2.5h-4Z' +
    'M10.75 2.5V8C7.8 8.6 6 10.2 6 12.2C6 13.8 7 15 9 15.6' +
    'C7 16.4 6 18 6 19.5C6 23 8.8 24.5 12 24.5' +
    'C15.2 24.5 18 23 18 19.5C18 18 17 16.4 15 15.6' +
    'C17 15 18 13.8 18 12.2C18 10.2 16.2 8.6 13.25 8V2.5H10.75Z' +
    'M14.3 19.5A2.3 2.3 0 1 0 9.7 19.5A2.3 2.3 0 0 0 14.3 19.5Z',

  bass:
    'M10.5 0h3v2l1.5 0.5V4H10.5V2Z' +
    'M11 4h2V12h-2Z' +
    'M11 12C9 12 6.5 13 6.5 15.2C6.5 16.7 7.8 17.8 10 18.3' +
    'L7.5 19.2C6 20 5.5 21.5 5.5 23C5.5 24 6.5 25 8 25' +
    'H16C17.5 25 18.5 24 18.5 23C18.5 21.5 18 20 16.5 19.2' +
    'L14 18.3C16.2 17.8 17.5 16.7 17.5 15.2C17.5 13 15 12 13 12H11Z',

  amp:
    'M3 5h18v14H3Z' +
    'M6.5 12A5.5 5.5 0 1 0 17.5 12A5.5 5.5 0 0 0 6.5 12Z' +
    'M9.5 12A2.5 2.5 0 1 0 14.5 12A2.5 2.5 0 0 0 9.5 12Z',

  // Amp variants
  amp_combo:
    'M3 6h18v17H3Z' +                                   // cabinet
    'M5.5 14.5A6.5 6.5 0 1 0 18.5 14.5A6.5 6.5 0 0 0 5.5 14.5Z' + // woofer ring
    'M9 14.5A3 3 0 1 0 15 14.5A3 3 0 0 0 9 14.5Z' +    // cone
    'M5 8h3v2.5H5Z' +                                   // control left
    'M14 8h5v2.5h-5Z',                                  // controls right

  amp_head:
    'M2 8h20v9H2Z' +                                    // unit body
    'M4.5 10.5A1.5 1.5 0 1 0 7.5 10.5A1.5 1.5 0 0 0 4.5 10.5Z' +  // knob 1
    'M8.5 10.5A1.5 1.5 0 1 0 11.5 10.5A1.5 1.5 0 0 0 8.5 10.5Z' + // knob 2
    'M12.5 10.5A1.5 1.5 0 1 0 15.5 10.5A1.5 1.5 0 0 0 12.5 10.5Z' + // knob 3
    'M16.5 10.5A1.5 1.5 0 1 0 19.5 10.5A1.5 1.5 0 0 0 16.5 10.5Z',  // knob 4

  amp_cab:
    'M4 2.5h16v20H4Z' +                                 // cabinet
    'M7 10A5 5 0 1 0 17 10A5 5 0 0 0 7 10Z' +          // driver surround
    'M9.5 10A2.5 2.5 0 1 0 14.5 10A2.5 2.5 0 0 0 9.5 10Z', // cone

  amp_bass:
    'M3 5h18v18H3Z' +                                   // cabinet
    'M5.5 15A6.5 6.5 0 1 0 18.5 15A6.5 6.5 0 0 0 5.5 15Z' + // woofer
    'M9 15A3 3 0 1 0 15 15A3 3 0 0 0 9 15Z',           // cone

  // Piano variants
  piano_grand:
    'M3 5.5h2.5v14H3Z' +                               // left edge (keyboard spine)
    'M5.5 5.5Q23 7 23 12.5Q23 18 5.5 20V5.5Z' +        // curved lid + body
    'M3 20h20v2.5H3Z',                                  // base

  piano_baby_grand:
    'M3 6.5h2.5v12H3Z' +
    'M5.5 6.5Q21 8 21 13Q21 18 5.5 19.5V6.5Z' +
    'M3 19.5h18v2H3Z',

  piano_upright:
    'M3 3h18v16H3Z' +                                   // main body
    'M3 19h18v1.5H3Z' +                                 // keyboard rail
    'M5 20.5h3V24H5Z' +                                 // left leg
    'M16 20.5h3V24h-3Z',                                // right leg

  keyboard:
    'M1.5 7.5h21v9H1.5Z' +                             // body
    // black key cutouts (evenodd)
    'M4.5 7.5h2.5V14H4.5ZM8.5 7.5H11V14H8.5ZM13.5 7.5H16V14h-2.5ZM17 7.5h2.5V14H17Z',

  organ:
    'M2 3h20v5H2Z' +                                   // upper manual
    'M2 9.5h20v5H2Z' +                                  // lower manual
    'M5 16h14v4H5Z',                                    // pedalboard
}

// ── Detail strokes (kept for reference, not rendered) ─────────────────────
export const ICON_PATHS: Record<string, string> = {}
