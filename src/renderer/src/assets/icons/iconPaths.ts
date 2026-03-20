/**
 * SVG icon definitions for all built-in item types.
 * All paths designed on a 24×24 viewBox.
 *
 * ICON_BODIES: filled silhouette paths — rendered with item color (or dark neutral) at ~0.55 opacity
 * ICON_PATHS:  detail/outline paths   — rendered as white strokes on top of the fill
 */

// ── Filled body silhouettes ────────────────────────────────────────────────
export const ICON_BODIES: Partial<Record<string, string>> = {
  // ── People ───────────────────────────────────────────────────────────────
  // Top-down: head circle + shoulder/torso arc
  person:
    'M12 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z' +
    'M5 22v-5a7 7 0 0 1 14 0v5H5z',

  // ── Guitars & Basses ─────────────────────────────────────────────────────
  // Acoustic guitar: figure-8 body (upper + lower bout) + neck stub
  guitar_acoustic:
    'M10.5 0h3v9.5h-3z' +
    'M12 9.5a7.5 7 0 1 0 .01 0z' +
    'M12 7.5Q9 7.5 9 10.5Q9 12 12 12Q15 12 15 10.5Q15 7.5 12 7.5z',

  // Electric guitar: slim double-cutaway body + neck + headstock
  guitar_electric:
    'M9.5 0h5v3h-5z' +
    'M10.5 3h3v7.5h-3z' +
    'M10.5 10.5C8 10.5 5.5 12 5.5 14.5C5.5 17 6 19 7 21C8 23 9.5 24 12 24C14.5 24 16 23 17 21C18 19 18.5 17 18.5 14.5C18.5 12 16 10.5 13.5 10.5Z',

  // Classical guitar: similar figure-8 with slightly narrower waist
  guitar_classical:
    'M10.5 0h3v9h-3z' +
    'M12 9a6.5 6.5 0 1 0 .01 0z' +
    'M12 7.5Q9.5 7.5 9.5 10.5Q9.5 12 12 12Q14.5 12 14.5 10.5Q14.5 7.5 12 7.5z',

  // Bass electric: longer neck + offset smaller body
  bass_electric:
    'M9.5 0h5v3h-5z' +
    'M10.5 3h3v9h-3z' +
    'M10.5 12C8 12 5 13.5 5 16C5 18.5 6 20.5 7.5 22C9 23.5 10.5 24 12 24C13.5 24 15 23.5 16.5 22C18 20.5 19 18.5 19 16C19 13.5 16 12 13.5 12Z',

  // Upright bass: wide round body + scroll headstock
  bass_upright:
    'M11 0C10 0 9 1 9 2.5L9 5H10.5C11 5 11 5 11 5V9.5C7.5 10.5 4 13.5 4 18C4 22 7.6 25 12 25C16.4 25 20 22 20 18C20 13.5 16.5 10.5 13 9.5V5H14.5L14.5 2.5C14.5 1 13.5 0 11 0Z',

  // ── Amplifiers ───────────────────────────────────────────────────────────
  amp_combo:   'M3 7h18v14H3z',
  amp_head:    'M2 9h20v7H2z',
  amp_cab:     'M4 3h16v18H4z',
  amp_bass:    'M3 6h18v15H3z',
  amp:         'M3 5h18v14H3z',

  // ── Keyboards & Pianos ───────────────────────────────────────────────────
  // Grand piano top-down: straight left edge (keyboard) + curved tail
  piano_grand:
    'M4 5h2v14H4z' +
    'M6 5Q22 7 22 12Q22 17 6 19V5z',

  // Baby grand: shorter
  piano_baby_grand:
    'M4 6h2v12H4z' +
    'M6 6Q20 7.5 20 12Q20 16.5 6 18V6z',

  // Upright piano: tall rectangular front
  piano_upright: 'M3 4h18v17H3z',

  // Stage keyboard: wide flat
  keyboard: 'M2 9h20v7H2z',

  // Organ: two manual rows + pedal board
  organ: 'M2 4h20v4H2zM2 10h20v4H2zM5 16h14v4H5z',

  // ── Drums & Percussion ───────────────────────────────────────────────────
  // Full kit top-down: kick (center), 3 rack toms (arc above), snare (front left), floor tom (right)
  drums:
    'M6.5 12.5a5.5 4.5 0 1 1 11 0 5.5 4.5 0 0 1-11 0z' +  // kick drum
    'M3.5 7a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z' +        // snare
    'M9 5.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z' +                  // rack tom 1
    'M14.5 6.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z' +               // rack tom 2
    'M18 12a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z' +          // floor tom
    'M1 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z',                    // hihat

  // Electronic kit: row of rectangular pads
  drums_electronic: 'M2 9h20v6H2z',

  // Kick drum: large barrel ellipse (side view)
  drums_kick: 'M3 12a9 6 0 1 1 18 0 9 6 0 0 1-18 0z',

  // Snare drum: cylinder with head (side view)
  drums_snare: 'M4 9.5a8 3.5 0 0 1 16 0v5a8 3.5 0 0 1-16 0z',

  // Hi-hat: two stacked cymbal ellipses
  drums_hihat:
    'M4.5 7a7.5 2.5 0 1 1 15 0 7.5 2.5 0 0 1-15 0z' +
    'M4.5 10.5a7.5 2.5 0 1 1 15 0 7.5 2.5 0 0 1-15 0z',

  // Cymbal: shallow dish
  drums_cymbal: 'M3 9a9 2.5 0 1 1 18 0v1a9 2.5 0 0 1-18 0z',

  // Cajon: box (front view)
  cajon: 'M6 4h12v16H6z',

  // Congas: two tall tapered drums
  congas:
    'M3 8a3.5 4 0 0 1 7 0v10H3z' +
    'M14 8a3.5 4 0 0 1 7 0v10h-7z',

  // Marimba: bars above + resonator tubes below
  marimba:
    'M2 7h20v4H2z' +
    'M3.5 11h2v7h-2zM7 11h2v8H7zM10.5 11h2v9h-2zM14 11h2v8h-2zM17.5 11h2v7h-2z',

  // Timpani: kettle bowl shape
  timpani: 'M3 13Q3 8 12 7Q21 8 21 13a9 4 0 0 1-18 0z',

  // ── Horns & Winds ────────────────────────────────────────────────────────
  // Trumpet: horizontal valves + bell flare (side profile)
  wind_trumpet:
    'M4 10h8v4H4z' +            // main tube body
    'M12 10h2v4h-2z' +          // valve cluster left
    'M14 10h2v4h-2z' +          // valve cluster mid
    'M16 10h2v4h-2z' +          // valve cluster right
    'M18 9Q24 9 24 12Q24 15 18 15v-6z',  // bell flare

  // Trombone: U-slide + bell
  wind_trombone:
    'M5 7h2v10H5z' +   // outer left slide
    'M5 7h7v2H5z' +    // top crossbar
    'M5 15h7v2H5z' +   // bottom crossbar
    'M10 5h2v14h-2z' + // inner slide
    'M10 5h5v2h-5z' +  // slide top
    'M10 15h5v2h-5z' + // slide bottom
    'M14 5h2v14h-2z' + // right tube
    'M16 5Q22 6 22 12Q22 18 16 19v-14z', // bell

  // Saxophone: crook at top + wide curved body + bell
  wind_saxophone:
    'M9 2h5Q17 2 17 5v11Q17 20 12 22Q7 20 7 17V5Q7 2 9 2z',

  // Flute: horizontal cylinder
  wind_flute: 'M2 10h20v4H2z',

  // ── Microphones ──────────────────────────────────────────────────────────
  // Handheld mic: rounded capsule head + handle
  microphone:
    'M9 2h6a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z' +
    'M10.5 13h3v7h-3z',

  // Mic on stand: same capsule + stand pole + base
  mic_stand:
    'M9 2h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z' +
    'M11 12h2v8h-2z' +
    'M8 20h8v2H8z',

  // Overhead mic: small capsule + horizontal boom arm
  mic_overhead:
    'M10 3h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' +
    'M4 9h6v2H4z' +
    'M4 9v9H6V11H4z',

  // ── PA & Monitors ────────────────────────────────────────────────────────
  speaker_main:    'M4 2h16v20H4z',
  subwoofer:       'M3 3h18v18H3z',
  monitor:         'M3 21L12 7l9 14H3z',
  monitor_sidefill:'M2 22L10.5 5h3L22 22H2z',

  // IEM: two earbud capsules
  monitor_iem:
    'M5.5 7a4 5.5 0 0 0 0 11a4 5.5 0 0 0 0-11z' +
    'M18.5 7a4 5.5 0 0 0 0 11a4 5.5 0 0 0 0-11z',

  // DI box: small rectangle
  di_box: 'M4 6h16v12H4z',

  // ── Stage & Environment ──────────────────────────────────────────────────
  // FOH position: angled mixing console (trapezoid)
  desk_foh: 'M3 11h18v8H3zM3 11L5 5h14L21 11z',

  // ── Legacy ───────────────────────────────────────────────────────────────
  generic: 'M4 4h16v16H4z',
  guitar:  'M10.5 0h3v9h-3zM12 9a6 6 0 1 0 .01 0z',
  bass:    'M10.5 0h3v10h-3zM12 10a5 6 0 1 0 .01 0z',
}

// ── Detail stroke paths ───────────────────────────────────────────────────
// Rendered as white strokes on top of ICON_BODIES.
export const ICON_PATHS: Record<string, string> = {
  // ── People ───────────────────────────────────────────────────────────────
  person:
    'M12 2.5a3.5 3.5 0 1 1 0 7M8.5 12a7 7 0 0 1 7 0',

  // ── Guitars & Basses ─────────────────────────────────────────────────────
  guitar_acoustic:
    'M12 11a2 2 0 1 0 .01 0M9 16h6M10.5 18.5h3',

  guitar_electric:
    'M10.5 3v7.5M13.5 3v7.5M6.5 15c4 2 7 2 11 0M8 20c2.5 1.5 5.5 1.5 8 0',

  guitar_classical:
    'M12 10.5a1.5 1.5 0 1 0 .01 0M9 15.5h6M10.5 18h3',

  guitar:
    'M12 11a2 2 0 1 0 .01 0M8 16h8M10 18h4',

  bass_electric:
    'M10.5 3v9M13.5 3v9M7 18.5c3 1.5 7 1.5 10 0',

  bass_upright:
    'M10 15v-3M14 15v-3M12 20v4M10 24h4',

  bass:
    'M12 12a2 2 0 1 0 .01 0M8 17h8',

  // ── Amplifiers ───────────────────────────────────────────────────────────
  amp_combo:
    'M12 14a4 4 0 1 0 .01 0M12 14a1.5 1.5 0 1 0 .01 0M5 10h2M5 12h2M15 10h2',

  amp_head:
    'M5 12a1 1 0 1 0 .01 0M9 12a1 1 0 1 0 .01 0M13 12a1 1 0 1 0 .01 0M17 12a1 1 0 1 0 .01 0M4 14.5h16',

  amp_cab:
    'M9 9a2.5 2.5 0 1 0 .01 0M15 9a2.5 2.5 0 1 0 .01 0M9 15a2.5 2.5 0 1 0 .01 0M15 15a2.5 2.5 0 1 0 .01 0',

  amp_bass:
    'M12 13.5a4.5 4.5 0 1 0 .01 0M12 13.5a2 2 0 1 0 .01 0M5 9h2',

  amp:
    'M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 8h3M15 8h2',

  // ── Keyboards & Pianos ───────────────────────────────────────────────────
  piano_grand:
    'M9 5v14M12 5v14M15 6v12M18 7v10M21 9v6',

  piano_baby_grand:
    'M9 6v12M12 6v12M15 7v10',

  piano_upright:
    'M3 14h18M6 14v7M9 14v7M12 14v7M15 14v7M18 14v7M5 8h2M9 7.5h2M14 7.5h2M17.5 8h2',

  keyboard:
    'M6 9v7M10 9v7M14 9v7M18 9v7M8 9v4M12 9v4M16 9v4',

  organ:
    'M5 4v4M8 4v4M11 4v4M14 4v4M17 4v4M5 10v4M8 10v4M11 10v4M14 10v4M17 10v4M7 16v4M12 16v4M17 16v4',

  // ── Drums & Percussion ───────────────────────────────────────────────────
  drums:
    'M6.5 12.5a5.5 4.5 0 0 0 11 0M12 10v5M3.5 7a2.5 2.5 0 0 0 5 0M2 13l-1.5 8M22 13l1 7',

  drums_electronic:
    'M6 9v6M9 9v6M12 9v6M15 9v6M18 9v6M3 15l-1 4M21 15l1 4',

  drums_kick:
    'M7 10l10 4M7 14l10-4M3 12a9 6 0 0 0 18 0',

  drums_snare:
    'M5 14l14-5M5 15.5l14-5',

  drums_hihat:
    'M12 13.5v9M9.5 22h5',

  drums_cymbal:
    'M12 11v9M9 20h6',

  cajon:
    'M9.5 9a2.5 3 0 1 0 5 0 2.5 3 0 0 0-5 0M6 20l-2 2M18 20l2 2',

  congas:
    'M3 8a3.5 4 0 0 0 7 0M14 8a3.5 4 0 0 0 7 0M5 11h3M16 11h3',

  percussion:
    'M3 14a4.5 5 0 1 0 9 0M13 12a5 5 0 1 0 10 0',

  marimba:
    'M6 8v3M9.5 7v4M13 7v4M16.5 7v3M20 8v3M6.5 11h3M14.5 11h4',

  timpani:
    'M6 13v2M9 12.5v2.5M12 12v3M15 12.5v2.5M18 13v2',

  // ── Horns & Winds ────────────────────────────────────────────────────────
  wind_trumpet:
    'M6 11v2M8 10.5v3M10 10.5v3M12 10.5v3M14 10.5v3M16 10.5v3',

  wind_trombone:
    'M10 7h4M10 17h4',

  wind_saxophone:
    'M9 7h5M9 10.5h5M9 14h4M12 19a3 3 0 0 0 3-3',

  wind_flute:
    'M4 10v4M7 9.5a2 2 0 1 0 .01 0M13 9.5a2 2 0 1 0 .01 0M19 9.5a2 2 0 1 0 .01 0',

  // ── Microphones ──────────────────────────────────────────────────────────
  microphone:
    'M9 6h6M9 8.5h6M9 11h6M12 13v4M9 17h6',

  mic_stand:
    'M9 5.5h6M9 8h6M12 12v8M9 20h6',

  mic_overhead:
    'M10 6h4M10 8.5h4M4 10h6',

  // ── PA & Monitors ────────────────────────────────────────────────────────
  speaker_main:
    'M12 9a5 5 0 1 0 .01 0M12 11a3 3 0 1 0 .01 0M10 3h4',

  subwoofer:
    'M12 12a6 6 0 1 0 .01 0M12 12a2.5 2.5 0 1 0 .01 0',

  monitor:
    'M11 17a3 3 0 1 0 .01 0M12 12l-1 5M13 12l1 5',

  monitor_sidefill:
    'M12 16a3.5 3.5 0 1 0 .01 0',

  monitor_iem:
    'M7 15v4M17 15v4M9 22H5M21 22h-4',

  di_box:
    'M20 9h3M20 15h3M1 12h3M8 10h8M8 14h8',

  // ── Stage & Environment ──────────────────────────────────────────────────
  desk_foh:
    'M7 14v5M10 14v5M13 14v5M16 14v5M8 14h2M11 15h2M14 16h2',

  // Platform riser (used as grid lines on the opaque fill — rendered via platform branch)
  platform:
    'M2 8l4-4h16l-4 4M22 8v10l-4 4M2 8h20v10H2M6 8v10M10 8v10M14 8v10M18 8v10',

  // ── Annotations ──────────────────────────────────────────────────────────
  text: 'M5 7h14M12 7v11',

  // Cable palette icon
  cable: 'M4 12h16M4 12a2 2 0 1 0 .01 0M20 12a2 2 0 1 0 .01 0',

  // Generic fallback
  generic: 'M4 4h16v16H4zM12 8v8M8 12h8',

  // Custom placeholder
  custom: 'M12 2l3 7h7l-6 4.5 2.3 7-6.3-4.5-6.3 4.5 2.3-7L2 9h7z',
}
