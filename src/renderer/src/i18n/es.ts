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
    resetZoom: 'Restablecer Zoom',
    importBg: 'Importar Imagen de Fondo',
    lockBg: 'Bloquear Fondo',
    unlockBg: 'Desbloquear Fondo',
    removeBg: 'Eliminar Fondo'
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
    // Categorías
    catPeople: 'Personas',
    catGuitars: 'Guitarras y Bajos',
    catAmps: 'Amplificadores',
    catKeys: 'Teclados y Piano',
    catDrums: 'Batería y Percusión',
    catHorns: 'Vientos y Metales',
    catMics: 'Micrófonos',
    catPa: 'PA y Monitores',
    catStage: 'Escenario',
    catCables: 'Cables',
    catAnnotations: 'Anotaciones',
    catCustom: 'Personalizados',
    // Personas
    performer: 'Intérprete',
    // Guitarras y Bajos
    guitarAcoustic: 'Guitarra Acústica',
    guitarElectric: 'Guitarra Eléctrica',
    guitarClassical: 'Guitarra Clásica',
    bassElectric: 'Bajo Eléctrico',
    bassUpright: 'Contrabajo',
    // Amplificadores
    ampCombo: 'Combo',
    ampHead: 'Cabezal',
    ampCab: 'Pantalla / Cabinet',
    ampBass: 'Amplificador de Bajo',
    // Teclados y Piano
    pianoGrand: 'Piano de Cola (Concert)',
    pianoBabyGrand: 'Piano de Cola (Baby Grand)',
    pianoUpright: 'Piano Vertical',
    keyboard: 'Piano de Escenario / Keys',
    organ: 'Órgano',
    // Batería y Percusión
    drums: 'Batería Completa',
    drumsElectronic: 'Batería Electrónica',
    drumsKick: 'Bombo',
    drumsSnare: 'Caja',
    drumsHihat: 'Hi-Hat',
    drumsCymbal: 'Platillo',
    cajon: 'Cajón',
    congas: 'Congas',
    marimba: 'Marimba / Vibráfono',
    timpani: 'Timbales Sinfónicos',
    // Vientos
    windTrumpet: 'Trompeta',
    windTrombone: 'Trombón',
    windSaxophone: 'Saxofón',
    windFlute: 'Flauta',
    // Micrófonos
    microphone: 'Micrófono de Mano',
    micStand: 'Micrófono en Pie',
    micOverhead: 'Overhead',
    // PA y Monitores
    mainSpeaker: 'Altavoz Principal (PA)',
    subwoofer: 'Subwoofer',
    monitor: 'Monitor de Escenario',
    monitorSidefill: 'Side Fill',
    monitorIem: 'Sistema IEM',
    diBox: 'Caja DI',
    // Escenario
    platform: 'Plataforma / Tarima',
    deskFoh: 'Posición FOH',
    // Cables
    cables: 'Cables',
    cableXlr: 'Cable XLR',
    cableTrs: 'Cable TRS',
    cableTs: 'Cable TS',
    cableMidi: 'Cable MIDI',
    cableSpeakon: 'Cable Speakon',
    // Anotaciones
    annotations: 'Anotaciones',
    text: 'Texto',
    // Personalizados
    custom: 'Personalizados',
    customAdd: 'Agregar elemento personalizado…',
    customNew: 'Nuevo Elemento Personalizado',
    customEdit: 'Editar Elemento Personalizado',
    customName: 'Nombre',
    customNamePlaceholder: 'ej. Bajo, Cabina vocal…',
    customEmoji: 'Ícono',
    customColor: 'Color Predeterminado',
    customColorNone: 'Sin color',
    customColorReset: 'Restablecer',
    customSave: 'Guardar',
    customCancel: 'Cancelar',
    customEditTitle: 'Editar',
    customDeleteTitle: 'Eliminar'
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
    bringToFront: 'Traer al Frente',
    sendToBack: 'Enviar al Fondo',
    lockLayer: 'Bloquear Capa',
    unlockLayer: 'Desbloquear Capa',
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
