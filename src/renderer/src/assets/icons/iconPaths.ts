/**
 * SVG icon definitions for all built-in item types.
 * All paths designed on a 24×24 viewBox.
 *
 * ICON_BODIES: flat white silhouette paths — rendered as solid white fill on dark canvas.
 *              The item's color is expressed through a colored shadow/glow around the icon.
 *
 * ICON_PATHS:  small detail overlay paths used only in the ItemPalette (18×18 sidebar icons).
 *              These are simple stroke-only paths for recognizability at tiny size.
 */

// ── Flat white silhouette bodies ───────────────────────────────────────────
export const ICON_BODIES: Partial<Record<string, string>> = {

  // ── People ────────────────────────────────────────────────────────────────
  // Top-down: filled head circle + torso/shoulders
  person:
    'M12 1a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z' +
    'M5.5 22v-4.5a6.5 6.5 0 0 1 13 0V22H5.5z',

  // ── Guitars & Basses ──────────────────────────────────────────────────────
  // Acoustic guitar: figure-8 body, round soundhole cutout, neck + headstock
  guitar_acoustic:
    // headstock
    'M10 0h4v2.5h-4z' +
    // nut + neck
    'M10.5 2.5h3v7h-3z' +
    // upper bout
    'M7.5 9.5a4.5 3.5 0 0 0 9 0z' +
    // waist join
    'M9 12.5h6v1.5H9z' +
    // lower bout (larger)
    'M6 14a6 5.5 0 1 0 12 0 6 5.5 0 0 0-12 0z' +
    // soundhole (negative space — drawn as separate white circle later via subtraction isn't possible in SVG fill, so we leave it implied by the icon scale)',
    '',

  // Electric guitar: double-cutaway Strat-style silhouette
  guitar_electric:
    // headstock
    'M10 0h4v2.5h-4z' +
    // neck
    'M10.5 2.5h3v7.5h-3z' +
    // body — offset double-cutaway shape
    'M10.5 9.5C7 9.5 4 11 4 14c0 2.5 1 5 3 7 1.5 1.5 3 2.5 5 2.5h0.5V22h3v1.5h3V22h0.5c2 0 3.5-1 5-2.5 2-2 3-4.5 3-7 0-3-3-4.5-6.5-4.5z',

  // Classical guitar: wider rounder body, figure-8
  guitar_classical:
    'M10 0h4v2.5h-4z' +
    'M10.5 2.5h3v7h-3z' +
    'M7 9.5a5 4 0 0 0 10 0z' +
    'M9 13h6v1.5H9z' +
    'M6.5 14.5a5.5 5.5 0 1 0 11 0 5.5 5.5 0 0 0-11 0z',

  // Electric bass: longer neck, P-Bass offset body
  bass_electric:
    'M10 0h4v3h-4z' +
    'M10.5 3h3v9.5h-3z' +
    'M10.5 12C7 12 4.5 13.5 4.5 16.5c0 2.5 1 5 3 6.5 1.5 1 3 1 4.5 1h3c1.5 0 3 0 4.5-1 2-1.5 3-4 3-6.5 0-3-2.5-4.5-6-4.5z',

  // Upright bass: large pear/cello body, scroll headstock
  bass_upright:
    // scroll headstock
    'M10.5 0C9 0 8 1 8 2.5c0 1 0.5 2 1.5 2.5H10v4h4V5h0.5C15.5 4.5 16 3.5 16 2.5 16 1 15 0 13.5 0z' +
    // neck
    'M10.5 9h3v5h-3z' +
    // body — wide pear shape
    'M6.5 13.5C4.5 14.5 3 16.5 3 19c0 3.5 4 5.5 9 5.5s9-2 9-5.5c0-2.5-1.5-4.5-3.5-5.5H6.5z',

  // ── Amplifiers ────────────────────────────────────────────────────────────
  // Combo amp: cabinet with speaker circle + control strip
  amp_combo:
    // cabinet
    'M3 7h18v16H3z' +
    // control strip
    'M3 7h18v3H3z',

  amp_head:
    // short rack unit
    'M2 9h20v7H2z',

  // 4x12 cab: 4 speaker circles (implied by the icon)
  amp_cab:
    'M4 3h16v18H4z',

  amp_bass:
    'M3 6h18v15H3z',

  amp:
    'M3 5h18v14H3z',

  // ── Keyboards & Pianos ────────────────────────────────────────────────────
  // Grand piano: side/top profile — curved tail, keyboard at front
  piano_grand:
    // lid + body outline
    'M4 6h2v14H4z' +
    'M6 6Q21 8 21 12Q21 17 6 19V6z' +
    // keyboard strip (lighter, implied)
    'M4 6h2v13H4z',

  piano_baby_grand:
    'M4 6.5h2v12H4z' +
    'M6 6.5Q20 8 20 12Q20 16 6 18.5V6.5z',

  // Upright piano: tall front-view rect, keyboard at bottom
  piano_upright:
    'M3 4h18v16H3z',

  // Stage keyboard: wide flat rectangle, key lines along edge
  keyboard:
    // main body
    'M2 9h20v7H2z',

  // Organ: two manual rows stacked
  organ:
    'M2 4h20v4H2z' +
    'M2 10h20v4H2z' +
    'M5 16h14v4H5z',

  // ── Drums & Percussion ────────────────────────────────────────────────────
  // Full kit top-down: kick drum center, snare front-left, hi-hat left, 2 rack toms, floor tom right
  drums:
    'M6.5 12.5a5.5 4.5 0 1 1 11 0 5.5 4.5 0 0 1-11 0z' +   // kick
    'M3.5 7a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z' +          // snare
    'M9 5.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z' +                    // rack tom 1
    'M14.5 6.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z' +                 // rack tom 2
    'M18.5 12a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z' +          // floor tom
    'M0.5 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z',                    // hi-hat

  // Electronic drum kit: grid of pads
  drums_electronic:
    // frame
    'M2 7h20v11H2z' +
    // 3 pads row 1
    'M4 9h4v3H4zM10 9h4v3h-4zM16 9h4v3h-4z' +
    // 2 pads row 2
    'M4 13h4v3H4zM10 13h4v3h-4zM16 13h4v3h-4z',

  // Kick drum: large barrel side view
  drums_kick:
    'M3 12a9 6 0 1 1 18 0 9 6 0 0 1-18 0z',

  // Snare drum: cylinder with angled top head
  drums_snare:
    'M4 9.5a8 3.5 0 0 1 16 0v5a8 3.5 0 0 1-16 0z',

  // Hi-hat: two stacked cymbal discs on stand
  drums_hihat:
    'M4.5 7.5a7.5 2.5 0 1 1 15 0 7.5 2.5 0 0 1-15 0z' +
    'M4.5 11a7.5 2.5 0 1 1 15 0 7.5 2.5 0 0 1-15 0z' +
    'M11 13.5h2v9h-2z',

  // Cymbal: shallow dome
  drums_cymbal:
    'M3 10a9 2.5 0 1 1 18 0v1a9 2.5 0 0 1-18 0z' +
    'M11 11.5h2v9h-2z',

  // Cajon: wooden box front view
  cajon:
    'M6 4h12v16H6z',

  // Congas: two tall tapered drums
  congas:
    'M3 8a3.5 3.5 0 0 1 7 0v12H3z' +
    'M14 8a3.5 3.5 0 0 1 7 0v12h-7z',

  // Marimba: bars with resonator tubes below
  marimba:
    'M2 7h20v4H2z' +
    'M3.5 11h2v6h-2z' +
    'M7 11h2v7H7z' +
    'M10.5 11h2v8h-2z' +
    'M14 11h2v7h-2z' +
    'M17.5 11h2v6h-2z',

  // Timpani: large kettle drum front-left
  timpani:
    'M3 13Q3 8 12 7Q21 8 21 13a9 4 0 0 1-18 0z' +
    // bowl
    'M3 13Q4 22 12 22Q20 22 21 13z',

  // Generic percussion: hand drum
  percussion:
    'M3 14a4.5 5 0 1 0 9 0 4.5 5 0 0 0-9 0z' +
    'M13 12a5 5 0 1 0 10 0 5 5 0 0 0-10 0z',

  // ── Horns & Winds ─────────────────────────────────────────────────────────
  // Trumpet: side profile — 3 valves + bell
  wind_trumpet:
    'M3 10.5h8v3H3z' +           // main tube left
    'M11 10.5h2v3h-2z' +         // first valve
    'M13 10.5h2v3h-2z' +         // second valve
    'M15 10.5h2v3h-2z' +         // third valve
    // valve bumps (top)
    'M11.5 9h1.5v1.5h-1.5zM13.5 8.5h1.5v2h-1.5zM15.5 9h1.5v1.5h-1.5z' +
    // valve bumps (bottom)
    'M11.5 13.5h1.5v1.5h-1.5zM13.5 13.5h1.5v2h-1.5zM15.5 13.5h1.5v1.5h-1.5z' +
    'M17 9.5Q23 9.5 23 12Q23 14.5 17 14.5z',   // bell flare

  // Trombone: U-slide + bell
  wind_trombone:
    'M4.5 7h2v10H4.5z' +    // outer left slide
    'M4.5 7h7v2H4.5z' +     // top crossbar
    'M4.5 15h7v2H4.5z' +    // bottom crossbar
    'M9.5 5h2v14H9.5z' +    // inner slide
    'M9.5 5h5.5v2H9.5z' +   // slide top
    'M9.5 15h5.5v2H9.5z' +  // slide bottom
    'M13.5 5h2v14H13.5z' +  // right tube
    'M15.5 5Q21.5 5.5 21.5 12Q21.5 18.5 15.5 19V5z',  // bell

  // Saxophone: curved S-body, mouthpiece top, bell bottom
  wind_saxophone:
    // body
    'M9.5 2h5Q18 2 18 5.5v10Q18 21 12 23Q6 21 6 15.5V5.5Q6 2 9.5 2z' +
    // mouthpiece nub
    'M13 1h3v3h-3z' +
    // bell lip
    'M6 20Q3 21 3 23h9Q11 21 6 20z',

  // Flute: long horizontal tube with tone holes
  wind_flute:
    'M1.5 10.5h21v3H1.5z' +
    // end cap left
    'M1.5 10.5h2v3H1.5z' +
    // embouchure hole (visible as small recess)
    'M5 10.5h2v3H5z',

  // ── Microphones ───────────────────────────────────────────────────────────
  // Handheld mic: capsule head + handle
  microphone:
    'M9 1.5h6a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z' +
    'M10.5 12.5h3v7h-3z' +
    'M9 19.5h6v2H9z',

  // Mic on a stand
  mic_stand:
    'M9 1.5h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z' +
    'M11 11.5h2v9h-2z' +
    'M8 20.5h8v2H8z',

  // Overhead condenser: pencil mic + boom arm
  mic_overhead:
    // vertical pole
    'M11 8h2v14h-2z' +
    // base
    'M8 20.5h8v2H8z' +
    // horizontal boom
    'M3.5 8h8v2H3.5z' +
    // capsule at end of boom
    'M2 5h3.5v5H2a1.75 1.75 0 0 1 0-5z',

  // ── PA & Monitors ─────────────────────────────────────────────────────────
  // Main PA speaker cabinet: tall rect, driver circle, tweeter
  speaker_main:
    'M4 2h16v20H4z',

  subwoofer:
    'M3 3h18v18H3z',

  // Floor monitor wedge: side profile
  monitor:
    'M3 21L12 7l9 14H3z',

  monitor_sidefill:
    'M2 22L10.5 5h3L22 22H2z',

  // In-ear monitors: two earbuds
  monitor_iem:
    'M5.5 7a4 5.5 0 0 0 0 11 4 5.5 0 0 0 0-11z' +
    'M18.5 7a4 5.5 0 0 0 0 11 4 5.5 0 0 0 0-11z',

  // DI box: small rectangular metal box with connectors
  di_box:
    'M4 6h16v12H4z',

  // ── Stage & Environment ───────────────────────────────────────────────────
  // FOH mixing console: trapezoid top-down view
  desk_foh:
    'M3 11h18v8H3z' +
    'M3 11L5 5h14l2 6z',

  // ── Legacy ────────────────────────────────────────────────────────────────
  generic:
    'M4 4h16v16H4z',

  guitar:
    'M10.5 0h3v9h-3z' +
    'M12 9a6 6 0 1 0 .01 0z',

  bass:
    'M10.5 0h3v10h-3z' +
    'M12 10a5 6 0 1 0 .01 0z',
}

// ── Detail paths for palette icons (18×18 sidebar display only) ───────────
// These are simple stroke paths used to add recognizable detail inside the
// small palette icon circles. They are NOT used on the main canvas.
export const ICON_PATHS: Record<string, string> = {
  // ── People ────────────────────────────────────────────────────────────────
  person:
    'M12 2.5a3.5 3.5 0 1 1 0 7M8.5 12a7 7 0 0 1 7 0',

  // ── Guitars & Basses ──────────────────────────────────────────────────────
  guitar_acoustic:
    'M12 12.5a2 2 0 1 0 .01 0M9 17h6M10.5 19.5h3',

  guitar_electric:
    'M7 15c4 2 6 2 10 0M8 20c2.5 1.5 5.5 1.5 8 0',

  guitar_classical:
    'M12 11.5a1.5 1.5 0 1 0 .01 0M9 16.5h6M10.5 19h3',

  guitar:
    'M12 11a2 2 0 1 0 .01 0M8 16h8M10 18h4',

  bass_electric:
    'M7 18.5c3 1.5 7 1.5 10 0',

  bass_upright:
    'M10 16v-2M14 16v-2M12 21v3',

  bass:
    'M12 12a2 2 0 1 0 .01 0M8 17h8',

  // ── Amplifiers ────────────────────────────────────────────────────────────
  amp_combo:
    'M12 15a4 4 0 1 0 .01 0M12 15a1.5 1.5 0 1 0 .01 0M5 10h1.5M19 10h-1.5',

  amp_head:
    'M5 12.5a1 1 0 1 0 .01 0M9 12.5a1 1 0 1 0 .01 0M13 12.5a1 1 0 1 0 .01 0M17 12.5a1 1 0 1 0 .01 0',

  amp_cab:
    'M9 9a2.5 2.5 0 1 0 .01 0M15 9a2.5 2.5 0 1 0 .01 0M9 15a2.5 2.5 0 1 0 .01 0M15 15a2.5 2.5 0 1 0 .01 0',

  amp_bass:
    'M12 13.5a4.5 4.5 0 1 0 .01 0M12 13.5a2 2 0 1 0 .01 0',

  amp:
    'M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',

  // ── Keyboards & Pianos ────────────────────────────────────────────────────
  piano_grand:
    'M9 5v14M12 5v14M15 6v12M18 7v10M21 9v6',

  piano_baby_grand:
    'M9 6.5v12M12 6.5v12M15 7.5v10',

  piano_upright:
    'M3 14h18M6 14v6M9 14v6M12 14v6M15 14v6M18 14v6M5 8h2M9 7.5h2M14 7.5h2M17.5 8h2',

  keyboard:
    'M6 9v7M10 9v7M14 9v7M18 9v7M8 9v4M12 9v4M16 9v4',

  organ:
    'M5 4v4M8 4v4M11 4v4M14 4v4M17 4v4M5 10v4M8 10v4M11 10v4M14 10v4M17 10v4',

  // ── Drums & Percussion ────────────────────────────────────────────────────
  drums:
    'M6.5 12.5a5.5 4.5 0 0 0 11 0M12 10v5',

  drums_electronic:
    'M6 9v6M9 9v6M12 9v6M15 9v6M18 9v6',

  drums_kick:
    'M7 10l10 4M7 14l10-4',

  drums_snare:
    'M5 14l14-5M5 15.5l14-5',

  drums_hihat:
    'M12 13.5v9M9.5 22h5',

  drums_cymbal:
    'M12 11v9M9 20h6',

  cajon:
    'M9.5 9a2.5 3 0 1 0 5 0 2.5 3 0 0 0-5 0',

  congas:
    'M3 8a3.5 4 0 0 0 7 0M14 8a3.5 4 0 0 0 7 0',

  percussion:
    'M3 14a4.5 5 0 1 0 9 0M13 12a5 5 0 1 0 10 0',

  marimba:
    'M6 8v3M9.5 7v4M13 7v4M16.5 7v3M20 8v3',

  timpani:
    'M6 13v2M9 12.5v2.5M12 12v3M15 12.5v2.5M18 13v2',

  // ── Horns & Winds ─────────────────────────────────────────────────────────
  wind_trumpet:
    'M6 11v2M8 10.5v3M10 10.5v3M12 10.5v3M14 10.5v3M16 10.5v3',

  wind_trombone:
    'M10 7h4M10 17h4',

  wind_saxophone:
    'M9 7h5M9 10.5h5M9 14h4M12 19a3 3 0 0 0 3-3',

  wind_flute:
    'M4 10v4M7 9.5a2 2 0 1 0 .01 0M13 9.5a2 2 0 1 0 .01 0M19 9.5a2 2 0 1 0 .01 0',

  // ── Microphones ───────────────────────────────────────────────────────────
  microphone:
    'M9 6h6M9 8.5h6M9 11h6M12 13v4M9 17h6',

  mic_stand:
    'M9 5.5h6M9 8h6M12 12v8M9 20h6',

  mic_overhead:
    'M10 6h4M10 8.5h4M4 10h6',

  // ── PA & Monitors ─────────────────────────────────────────────────────────
  speaker_main:
    'M12 9a5 5 0 1 0 .01 0M12 11a3 3 0 1 0 .01 0M10 3h4',

  subwoofer:
    'M12 12a6 6 0 1 0 .01 0M12 12a2.5 2.5 0 1 0 .01 0',

  monitor:
    'M11 17a3 3 0 1 0 .01 0',

  monitor_sidefill:
    'M12 16a3.5 3.5 0 1 0 .01 0',

  monitor_iem:
    'M7 15v4M17 15v4M9 22H5M21 22h-4',

  di_box:
    'M20 9h3M20 15h3M1 12h3M8 10h8M8 14h8',

  // ── Stage & Environment ───────────────────────────────────────────────────
  desk_foh:
    'M7 14v5M10 14v5M13 14v5M16 14v5M8 14h2M11 15h2M14 16h2',

  platform:
    'M2 8l4-4h16l-4 4M22 8v10l-4 4M2 8h20v10H2M6 8v10M10 8v10M14 8v10M18 8v10',

  // ── Annotations ───────────────────────────────────────────────────────────
  text: 'M5 7h14M12 7v11',

  // Cable palette icon
  cable: 'M4 12h16M4 12a2 2 0 1 0 .01 0M20 12a2 2 0 1 0 .01 0',

  // Generic fallback
  generic: 'M4 4h16v16H4zM12 8v8M8 12h8',

  // Custom placeholder
  custom: 'M12 2l3 7h7l-6 4.5 2.3 7-6.3-4.5-6.3 4.5 2.3-7L2 9h7z',
}
