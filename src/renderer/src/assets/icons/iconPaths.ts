/**
 * SVG path data for all built-in item types.
 * All paths designed on a 24×24 viewBox, stroke-only (fill="none").
 * strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round"
 */
export const ICON_PATHS: Record<string, string> = {
  // Head circle (cx12,cy7,r4) + shoulder arc
  person:
    'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 21a7 7 0 0 1 14 0',

  // Capsule body + stand + base
  microphone:
    'M9 3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM12 13v4M9 17h6',

  // Lower body oval + neck + headstock
  guitar:
    'M7 16a5 4 0 1 0 10 0 5 4 0 0 0-10 0zM12 14V5M10 5h4',

  // Longer neck for bass
  bass:
    'M7 16a5 4 0 1 0 10 0 5 4 0 0 0-10 0zM13 14V4M11 4h4',

  // Outer rectangle + white key lines + black keys
  keyboard:
    'M2 9h20v7H2zM6 9v7M10 9v7M14 9v7M18 9v7M8 9v4M12 9v4M16 9v4',

  // Kick drum (large ellipse + head) + snare (small ellipse upper-left)
  drums:
    'M5 16a7 4 0 1 0 14 0 7 4 0 0 0-14 0zM5 16a7 2 0 0 0 14 0M3 10a4 3 0 1 0 8 0 4 3 0 0 0-8 0z',

  // Two drum bodies (congas/bongos)
  percussion:
    'M3 14a4.5 5 0 1 0 9 0 4.5 5 0 0 0-9 0zM13 12a5 5 0 1 0 10 0 5 5 0 0 0-10 0z',

  // Stage wedge (trapezoid) + grille line
  monitor:
    'M3 20L12 7l9 13H3zM8 20h8',

  // Cabinet rectangle + speaker circle
  amp:
    'M3 5h18v14H3zM12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',

  // Box + side XLR connectors + ground lift
  di_box:
    'M4 6h16v12H4zM20 9h3M20 15h3M1 12h3',

  // Tall cabinet + speaker cone (outer) + dust cap (inner)
  speaker_main:
    'M4 3h16v18H4zM12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',

  // Three valves + tubing + bell opening
  wind_trumpet:
    'M10 6v6M13 5v6M16 5v6M4 14a8 4 0 0 0 16-2M8 11h12',

  // U-shape (trombone slide)
  wind_trombone:
    'M5 8h6M5 16h6M5 8v8M11 6v4M11 14v4M11 6h5M11 14h5M16 6v12',

  // Curved body + bell + tone holes
  wind_saxophone:
    'M9 3v12a4 4 0 0 0 8 0v3M7 8h5M7 11h5M7 14h4',

  // Horizontal tube + mouthpiece + finger holes
  wind_flute:
    'M2 12h20M3 10v4M6 10a2 2 0 1 0 0.01 0M11 10a2 2 0 1 0 0.01 0M16 10a2 2 0 1 0 0.01 0',

  // Simple box with crosshair
  generic:
    'M4 4h16v16H4zM12 8v8M8 12h8',

  // T letterform
  text:
    'M5 7h14M12 7v11',

  // Cable – simple line with dots at ends (palette only)
  cable:
    'M4 12h16M4 12a2 2 0 1 0 0.01 0M20 12a2 2 0 1 0 0.01 0',

  // Star (used for "add custom" button)
  custom:
    'M12 2l3 7h7l-6 4.5 2.3 7-6.3-4.5-6.3 4.5 2.3-7L2 9h7z'
}
