import { useCallback, useEffect } from 'react'
import type React from 'react'
import type Konva from 'konva'
import { jsPDF } from 'jspdf'
import type { Project, PatchMapRow } from '../../../shared/types'
import i18n from '../i18n'

interface ExportFns {
  png: (() => void) | null
  pdf: (() => void) | null
}

interface UseExportHandlersConfig {
  stageRef: React.RefObject<Konva.Stage | null>
  activeProject: Project | null
  patchRows: PatchMapRow[]
  registerExport: (fns: ExportFns) => void
}

export function useExportHandlers({
  stageRef,
  activeProject,
  patchRows,
  registerExport
}: UseExportHandlersConfig): void {
  const exportPng = useCallback(() => {
    if (!stageRef.current || !activeProject) return
    const stage = stageRef.current
    const savedScaleX = stage.scaleX()
    const savedScaleY = stage.scaleY()
    const savedX = stage.x()
    const savedY = stage.y()
    stage.scaleX(1)
    stage.scaleY(1)
    stage.x(0)
    stage.y(0)
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    stage.scaleX(savedScaleX)
    stage.scaleY(savedScaleY)
    stage.x(savedX)
    stage.y(savedY)
    const link = document.createElement('a')
    link.download = `${activeProject.name}.png`
    link.href = dataUrl
    link.click()
  }, [activeProject, stageRef])

  const exportPdf = useCallback(() => {
    if (!stageRef.current || !activeProject) return
    const stage = stageRef.current
    const savedScaleX = stage.scaleX()
    const savedScaleY = stage.scaleY()
    const savedX = stage.x()
    const savedY = stage.y()
    stage.scaleX(1)
    stage.scaleY(1)
    stage.x(0)
    stage.y(0)
    const w = stage.width()
    const h = stage.height()
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    stage.scaleX(savedScaleX)
    stage.scaleY(savedScaleY)
    stage.x(savedX)
    stage.y(savedY)

    const pdf = new jsPDF({
      orientation: w > h ? 'landscape' : 'portrait',
      unit: 'px',
      format: [w, h],
      hotfixes: ['px_scaling']
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, w, h)

    // Input list goes on its own page(s) after the stage plot
    if (patchRows.length > 0) {
      drawInputListPages(pdf, activeProject.name, patchRows)
    }

    pdf.save(`${activeProject.name}.pdf`)
  }, [activeProject, patchRows, stageRef])

  useEffect(() => {
    registerExport({ png: exportPng, pdf: exportPdf })
  }, [exportPng, exportPdf, registerExport])
}

// A4 portrait in px (jsPDF px_scaling: 1px = 0.75pt)
const LIST_PAGE_W = 794
const LIST_PAGE_H = 1123

function drawInputListPages(doc: jsPDF, projectName: string, rows: PatchMapRow[]): void {
  const margin = 48
  const tableW = LIST_PAGE_W - margin * 2
  const cellPadX = 8
  const fontSize = 11
  const lineH = 17
  const headerH = 24

  // Column layout: # | Instrument | Element | Notes
  const numW = 60
  const instrumentW = Math.round((tableW - numW) * 0.3)
  const elementW = Math.round((tableW - numW) * 0.3)
  const notesW = tableW - numW - instrumentW - elementW
  const cols = [
    { header: i18n.t('patchMap.colNumber'), w: numW },
    { header: i18n.t('patchMap.colInstrument'), w: instrumentW },
    { header: i18n.t('patchMap.colElement'), w: elementW },
    { header: i18n.t('patchMap.colNotes'), w: notesW }
  ]

  let y = 0

  function drawHeaderRow(): void {
    doc.setFillColor(40, 40, 52)
    doc.rect(margin, y, tableW, headerH, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    let x = margin
    for (const col of cols) {
      doc.text(col.header.toUpperCase(), x + cellPadX, y + headerH * 0.65)
      x += col.w
    }
    y += headerH
  }

  function startPage(first: boolean): void {
    doc.addPage([LIST_PAGE_W, LIST_PAGE_H], 'portrait')
    y = margin
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.setFontSize(first ? 20 : 12)
    doc.text(
      first ? i18n.t('patchMap.title') : `${i18n.t('patchMap.title')} (cont.)`,
      margin,
      y + (first ? 16 : 10)
    )
    if (first) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(110, 110, 120)
      doc.text(projectName, margin, y + 34)
      y += 52
    } else {
      y += 24
    }
    drawHeaderRow()
  }

  startPage(true)

  rows.forEach((row, idx) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(fontSize)
    const cells = [
      [String(idx + 1)],
      doc.splitTextToSize(row.instrument, instrumentW - cellPadX * 2) as string[],
      doc.splitTextToSize(row.element, elementW - cellPadX * 2) as string[],
      doc.splitTextToSize(row.notes, notesW - cellPadX * 2) as string[]
    ]
    const lines = Math.max(1, ...cells.map((c) => c.length))
    const rowH = lines * lineH + 10

    if (y + rowH > LIST_PAGE_H - margin) startPage(false)

    // Subtle alternating background
    if (idx % 2 === 1) {
      doc.setFillColor(244, 244, 248)
      doc.rect(margin, y, tableW, rowH, 'F')
    }
    doc.setDrawColor(220, 220, 228)
    doc.line(margin, y + rowH, margin + tableW, y + rowH)

    let x = margin
    cells.forEach((cellLines, colIdx) => {
      if (colIdx === 0) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(120, 120, 130)
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30, 30, 30)
      }
      doc.setFontSize(fontSize)
      // Draw wrapped lines ourselves so row height matches the measured line count
      cellLines.forEach((line, lineIdx) => {
        doc.text(line, x + cellPadX, y + 5 + lineH * (lineIdx + 0.8))
      })
      x += cols[colIdx].w
    })

    y += rowH
  })
}
