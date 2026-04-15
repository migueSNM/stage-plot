import type { Project, StageItem } from '../../shared/types'

export const DEMO_PROJECT: Project = {
  id: 'demo-project',
  name: 'Rock Band — Demo',
  description: 'Example stage plot',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// 5-piece rock band layout.
// Canvas orientation: upstage = top, downstage (audience) = bottom.
// Stage left = left side of canvas (audience POV: right).
// Items are placed in a ~900×600 visible area.
export const DEMO_ITEMS: StageItem[] = [
  // ── Drums (center, upstage) ──────────────────────────────────────────────
  {
    id: 'demo-1', project_id: 'demo-project', type: 'drums',
    label: 'Drums', x: 440, y: 130, rotation: 0, width: 60, height: 60,
    color: '#7c3aed', extra: null, sort_order: 1
  },

  // ── Guitar rig (stage left) ──────────────────────────────────────────────
  {
    id: 'demo-2', project_id: 'demo-project', type: 'amp_combo',
    label: 'Guitar Amp', x: 200, y: 140, rotation: 0, width: 60, height: 60,
    color: '#57534e', extra: null, sort_order: 2
  },
  {
    id: 'demo-3', project_id: 'demo-project', type: 'guitar_electric',
    label: 'Guitar', x: 200, y: 270, rotation: 0, width: 60, height: 60,
    color: '#ea580c', extra: null, sort_order: 3
  },

  // ── Bass rig (stage right) ───────────────────────────────────────────────
  {
    id: 'demo-4', project_id: 'demo-project', type: 'amp_bass',
    label: 'Bass Amp', x: 700, y: 140, rotation: 0, width: 60, height: 60,
    color: '#57534e', extra: null, sort_order: 4
  },
  {
    id: 'demo-5', project_id: 'demo-project', type: 'bass_electric',
    label: 'Bass', x: 700, y: 270, rotation: 0, width: 60, height: 60,
    color: '#16a34a', extra: null, sort_order: 5
  },

  // ── Keys (far stage right) ───────────────────────────────────────────────
  {
    id: 'demo-6', project_id: 'demo-project', type: 'keyboard',
    label: 'Keys', x: 840, y: 260, rotation: 0, width: 60, height: 60,
    color: '#0891b2', extra: null, sort_order: 6
  },
  {
    id: 'demo-7', project_id: 'demo-project', type: 'di_box',
    label: 'DI (Keys)', x: 840, y: 340, rotation: 0, width: 60, height: 60,
    color: '#57534e', extra: null, sort_order: 7
  },

  // ── Lead vocal (center, downstage) ──────────────────────────────────────
  {
    id: 'demo-8', project_id: 'demo-project', type: 'person',
    label: 'Lead Vocal', x: 440, y: 380, rotation: 0, width: 60, height: 60,
    color: '#e11d48', extra: null, sort_order: 8
  },
  {
    id: 'demo-9', project_id: 'demo-project', type: 'microphone',
    label: 'Vocal Mic', x: 440, y: 320, rotation: 0, width: 60, height: 60,
    color: '#f59e0b', extra: null, sort_order: 9
  },

  // ── Monitors ────────────────────────────────────────────────────────────
  {
    id: 'demo-10', project_id: 'demo-project', type: 'monitor',
    label: 'Mon 1', x: 200, y: 380, rotation: 0, width: 60, height: 60,
    color: '#475569', extra: null, sort_order: 10
  },
  {
    id: 'demo-11', project_id: 'demo-project', type: 'monitor',
    label: 'Mon 2', x: 340, y: 430, rotation: 0, width: 60, height: 60,
    color: '#475569', extra: null, sort_order: 11
  },
  {
    id: 'demo-12', project_id: 'demo-project', type: 'monitor',
    label: 'Mon 3', x: 540, y: 430, rotation: 0, width: 60, height: 60,
    color: '#475569', extra: null, sort_order: 12
  },
  {
    id: 'demo-13', project_id: 'demo-project', type: 'monitor',
    label: 'Mon 4', x: 700, y: 380, rotation: 0, width: 60, height: 60,
    color: '#475569', extra: null, sort_order: 13
  },

  // ── Sidefill monitors ───────────────────────────────────────────────────
  {
    id: 'demo-14', project_id: 'demo-project', type: 'monitor_sidefill',
    label: 'Sidefill L', x: 100, y: 280, rotation: -20, width: 60, height: 60,
    color: '#374151', extra: null, sort_order: 14
  },
  {
    id: 'demo-15', project_id: 'demo-project', type: 'monitor_sidefill',
    label: 'Sidefill R', x: 800, y: 380, rotation: 20, width: 60, height: 60,
    color: '#374151', extra: null, sort_order: 15
  }
]
