import { useCallback, useEffect } from 'react'
import type React from 'react'
import type Konva from 'konva'
import { jsPDF } from 'jspdf'
import type { Project, PatchMapRow } from '../../../shared/types'

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

    // When there are patch rows, widen the page to fit a sidebar column
    const COL_W = patchRows.length > 0 ? 160 : 0
    const pdfW = w + COL_W

    const pdf = new jsPDF({
      orientation: pdfW > h ? 'landscape' : 'portrait',
      unit: 'px',
      format: [pdfW, h],
      hotfixes: ['px_scaling']
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, w, h)

    if (patchRows.length > 0) {
      drawPatchColumn(pdf, w, h, COL_W, patchRows)
    }

    pdf.save(`${activeProject.name}.pdf`)
  }, [activeProject, patchRows, stageRef])

  useEffect(() => {
    registerExport({ png: exportPng, pdf: exportPdf })
  }, [exportPng, exportPdf, registerExport])
}

function drawPatchColumn(
  doc: jsPDF,
  x: number,
  h: number,
  colW: number,
  rows: PatchMapRow[]
): void {
  // Adaptive row height — shrink to fit all rows, cap at 20px each
  const rowH = Math.max(11, Math.min(20, Math.floor(h / rows.length)))
  const numW = 24  // width reserved for the row number
  const padX = 6
  const fontSize = Math.max(6, rowH * 0.52)

  // Column background
  doc.setFillColor(248, 248, 252)
  doc.rect(x, 0, colW, h, 'F')

  // Left separator
  doc.setDrawColor(200, 200, 210)
  doc.line(x, 0, x, h)

  let y = 0
  rows.forEach((row, idx) => {
    if (y + rowH > h) return  // overflow — stop rendering

    // Subtle alternating background
    if (idx % 2 === 1) {
      doc.setFillColor(240, 240, 246)
      doc.rect(x, y, colW, rowH, 'F')
    }

    // Row separator
    doc.setDrawColor(220, 220, 228)
    doc.line(x, y + rowH, x + colW, y + rowH)

    const baseline = y + rowH * 0.68

    // Row number — muted, right-aligned in the number zone
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(fontSize * 0.85)
    doc.setTextColor(160, 160, 170)
    doc.text(String(idx + 1), x + numW - padX, baseline, { align: 'right' })

    // Thin separator between number and name
    doc.setDrawColor(220, 220, 228)
    doc.line(x + numW, y + 2, x + numW, y + rowH - 2)

    // Name
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(fontSize)
    doc.setTextColor(30, 30, 30)
    const nameW = colW - numW - padX * 2
    const clipped = doc.splitTextToSize(row.name || '', nameW)
    doc.text(clipped[0] ?? '', x + numW + padX, baseline)

    y += rowH
  })
}
