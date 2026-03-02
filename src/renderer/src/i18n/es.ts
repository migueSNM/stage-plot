const es = {
  app: { name: 'Stage Plot' },
  toolbar: {
    projects: 'Proyectos',
    close: 'Cerrar',
    export: 'Exportar',
    exportPng: 'Exportar PNG',
    exportPdf: 'Exportar PDF',
    undo: 'Deshacer',
    redo: 'Rehacer',
    language: 'Idioma',
    theme: 'Tema'
  },
  projects: {
    title: 'Proyectos',
    newPlaceholder: 'Nombre del nuevo proyecto…',
    create: 'Crear',
    noProjects: 'Sin proyectos aún',
    openOrCreate: 'Abre o crea un proyecto para empezar'
  },
  palette: {
    title: 'Elementos',
    search: 'Buscar…',
    noMatch: 'Sin coincidencias',
    performer: 'Intérprete',
    microphone: 'Micrófono',
    monitor: 'Monitor',
    amp: 'Amplificador',
    keyboard: 'Teclado',
    drums: 'Batería',
    diBox: 'Caja DI',
    mainSpeaker: 'Altavoz Principal',
    generic: 'Genérico',
    shapes: 'Formas',
    rectangle: 'Rectángulo',
    circle: 'Círculo'
  },
  canvas: {
    frontOfStage: 'FRENTE DEL ESCENARIO',
    hint: 'Suprimir para eliminar · Doble clic o clic derecho para renombrar · [ / ] para rotar'
  },
  contextMenu: {
    rename: 'Renombrar',
    delete: 'Eliminar',
    rotateCW: 'Rotar 90° CW',
    rotateCCW: 'Rotar 90° CCW'
  }
} as const

export default es
