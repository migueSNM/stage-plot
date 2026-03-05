const es = {
  app: { name: 'Stage Plot' },
  toolbar: {
    projects: 'Proyectos',
    close: 'Cerrar',
    export: 'Exportar',
    exportPng: 'Exportar PNG',
    exportPdf: 'Exportar PDF',
    exportJson: 'Exportar JSON',
    importJson: 'Importar JSON',
    undo: 'Deshacer',
    redo: 'Rehacer',
    language: 'Idioma',
    theme: 'Tema',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    resetZoom: 'Restablecer Zoom'
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
    guitar: 'Guitarra',
    bass: 'Bajo',
    keyboard: 'Teclado',
    drums: 'Batería',
    percussion: 'Percusión',
    windTrumpet: 'Trompeta',
    windTrombone: 'Trombón',
    windSaxophone: 'Saxofón',
    windFlute: 'Flauta',
    monitor: 'Monitor',
    amp: 'Amplificador',
    diBox: 'Caja DI',
    mainSpeaker: 'Altavoz Principal',
    generic: 'Genérico',
    shapes: 'Formas',
    rectangle: 'Rectángulo',
    circle: 'Círculo',
    cables: 'Cables',
    cableXlr: 'XLR',
    cableTrs: 'TRS',
    cableTs: 'TS',
    cableMidi: 'MIDI',
    cableSpeakon: 'Speakon',
    annotations: 'Anotaciones',
    text: 'Texto'
  },
  canvas: {
    frontOfStage: 'FRENTE DEL ESCENARIO',
    hint: 'Suprimir para eliminar · Doble clic o clic derecho para renombrar · [ / ] para rotar',
    hintMulti: '{{count}} elementos seleccionados · Eliminar para quitar todos'
  },
  contextMenu: {
    rename: 'Renombrar',
    delete: 'Eliminar',
    rotateCW: 'Rotar 90° CW',
    rotateCCW: 'Rotar 90° CCW',
    changeColor: 'Cambiar Color',
    deleteSelected: 'Eliminar Seleccionados ({{count}})'
  },
  fileOps: {
    importSuccess: 'Proyecto "{{name}}" importado exitosamente',
    importError: 'Error al importar el archivo. Asegúrate de que es un archivo .stageplot válido.'
  },
  updates: {
    downloading: 'Descargando actualización v{{version}}…',
    ready: 'Actualización descargada — reinicia para instalar.',
    restart: 'Reiniciar ahora',
    installError: 'No se pudo instalar la actualización automáticamente.',
    downloadManually: 'Descargar manualmente'
  }
} as const

export default es
