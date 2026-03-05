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
    resetZoom: 'Reset Zoom'
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
    performer: 'Performer',
    microphone: 'Microphone',
    monitor: 'Monitor',
    amp: 'Amp',
    keyboard: 'Keyboard',
    drums: 'Drums',
    diBox: 'DI Box',
    mainSpeaker: 'Main Speaker',
    generic: 'Generic',
    shapes: 'Shapes',
    rectangle: 'Rectangle',
    circle: 'Circle',
    cables: 'Cables',
    cableXlr: 'XLR',
    cableTrs: 'TRS',
    cableTs: 'TS',
    cableMidi: 'MIDI',
    cableSpeakon: 'Speakon',
    annotations: 'Annotations',
    text: 'Text'
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
