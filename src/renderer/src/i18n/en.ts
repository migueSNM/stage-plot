const en = {
  app: { name: 'Stage Plot' },
  toolbar: {
    projects: 'Projects',
    close: 'Close',
    export: 'Export',
    exportPng: 'Export PNG',
    exportPdf: 'Export PDF',
    undo: 'Undo',
    redo: 'Redo',
    language: 'Language',
    theme: 'Theme'
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
    circle: 'Circle'
  },
  canvas: {
    frontOfStage: 'FRONT OF STAGE',
    hint: 'Delete to remove · Dbl-click or right-click to rename · [ / ] to rotate'
  },
  contextMenu: {
    rename: 'Rename',
    delete: 'Delete',
    rotateCW: 'Rotate 90° CW',
    rotateCCW: 'Rotate 90° CCW'
  }
} as const

export default en
