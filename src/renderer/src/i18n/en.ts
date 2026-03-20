const en = {
  app: { name: 'Stage Plot' },
  toolbar: {
    projects: 'Projects',
    close: 'Close',
    export: 'Export',
    exportPng: 'Export PNG',
    exportPdf: 'Export PDF',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    undo: 'Undo',
    redo: 'Redo',
    language: 'Language',
    theme: 'Theme',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset Zoom',
    importBg: 'Import Background Image',
    lockBg: 'Lock Background',
    unlockBg: 'Unlock Background',
    removeBg: 'Remove Background'
  },
  projects: {
    title: 'Projects',
    newPlaceholder: 'New project name…',
    create: 'Create',
    noProjects: 'No projects yet',
    openOrCreate: 'Open or create a project to get started'
  },
  palette: {
    title: 'Items',
    search: 'Search…',
    noMatch: 'No items match',
    // Categories
    catPeople: 'People',
    catGuitars: 'Guitars & Basses',
    catAmps: 'Amplifiers',
    catKeys: 'Keyboards & Piano',
    catDrums: 'Drums & Percussion',
    catHorns: 'Horns & Winds',
    catMics: 'Microphones',
    catPa: 'PA & Monitors',
    catStage: 'Stage',
    catCables: 'Cables',
    catAnnotations: 'Annotations',
    catCustom: 'Custom',
    // People
    performer: 'Performer',
    // Guitars & Basses
    guitarAcoustic: 'Acoustic Guitar',
    guitarElectric: 'Electric Guitar',
    guitarClassical: 'Classical Guitar',
    bassElectric: 'Electric Bass',
    bassUpright: 'Upright Bass',
    // Amplifiers
    ampCombo: 'Combo Amp',
    ampHead: 'Amp Head',
    ampCab: 'Speaker Cabinet',
    ampBass: 'Bass Amp',
    // Keyboards & Piano
    pianoGrand: 'Concert Grand Piano',
    pianoBabyGrand: 'Baby Grand Piano',
    pianoUpright: 'Upright Piano',
    keyboard: 'Stage Piano / Keys',
    organ: 'Organ',
    // Drums & Percussion
    drums: 'Full Drum Kit',
    drumsElectronic: 'Electronic Drum Kit',
    drumsKick: 'Kick Drum',
    drumsSnare: 'Snare Drum',
    drumsHihat: 'Hi-Hat',
    drumsCymbal: 'Cymbal',
    cajon: 'Cajón',
    congas: 'Congas',
    marimba: 'Marimba / Vibraphone',
    timpani: 'Timpani',
    // Horns & Winds
    windTrumpet: 'Trumpet',
    windTrombone: 'Trombone',
    windSaxophone: 'Saxophone',
    windFlute: 'Flute',
    // Microphones
    microphone: 'Handheld Microphone',
    micStand: 'Mic on Stand',
    micOverhead: 'Overhead Mic',
    // PA & Monitors
    mainSpeaker: 'Main PA Speaker',
    subwoofer: 'Subwoofer',
    monitor: 'Stage Monitor (Wedge)',
    monitorSidefill: 'Side Fill Monitor',
    monitorIem: 'IEM System',
    diBox: 'DI Box',
    // Stage
    platform: 'Stage Platform / Riser',
    deskFoh: 'FOH Mix Position',
    // Cables
    cables: 'Cables',
    cableXlr: 'XLR Cable',
    cableTrs: 'TRS Cable',
    cableTs: 'TS Cable',
    cableMidi: 'MIDI Cable',
    cableSpeakon: 'Speakon Cable',
    // Annotations
    annotations: 'Annotations',
    text: 'Text',
    // Custom
    custom: 'Custom',
    customAdd: 'Add custom item…',
    customNew: 'New Custom Item',
    customEdit: 'Edit Custom Item',
    customName: 'Name',
    customNamePlaceholder: 'e.g. Bass Rig, Vocal Booth…',
    customEmoji: 'Icon',
    customColor: 'Default Color',
    customColorNone: 'No color',
    customColorReset: 'Reset',
    customSave: 'Save',
    customCancel: 'Cancel',
    customEditTitle: 'Edit',
    customDeleteTitle: 'Delete'
  },
  canvas: {
    frontOfStage: 'FRONT OF STAGE',
    hint: 'Delete to remove · Dbl-click or right-click to rename · [ / ] to rotate',
    hintMulti: '{{count}} items selected · Delete to remove all'
  },
  contextMenu: {
    rename: 'Rename',
    delete: 'Delete',
    rotateCW: 'Rotate 90° CW',
    rotateCCW: 'Rotate 90° CCW',
    changeColor: 'Change Color',
    bringToFront: 'Bring to Front',
    sendToBack: 'Send to Back',
    lockLayer: 'Lock Layer',
    unlockLayer: 'Unlock Layer',
    deleteSelected: 'Delete Selected ({{count}})'
  },
  fileOps: {
    importSuccess: 'Project "{{name}}" imported successfully',
    importError: 'Failed to import file. Make sure it is a valid .stageplot file.'
  },
  updates: {
    downloading: 'Downloading update v{{version}}…',
    ready: 'Update downloaded — restart to install.',
    restart: 'Restart now',
    installError: 'Could not install update automatically.',
    downloadManually: 'Download manually'
  }
} as const

export default en
