import type { ReactNode } from 'react'

const VALID_TOKEN  = (import.meta.env.VITE_DEMO_TOKEN as string | undefined) ?? ''
const EXPIRES_AT   = (import.meta.env.VITE_DEMO_EXPIRES_AT as string | undefined) ?? ''

function getStatus(): 'ok' | 'expired' | 'invalid' {
  const params = new URLSearchParams(window.location.search)
  const token  = params.get('token') ?? ''

  if (!VALID_TOKEN || token !== VALID_TOKEN) return 'invalid'
  if (EXPIRES_AT && new Date() > new Date(EXPIRES_AT)) return 'expired'
  return 'ok'
}

function DeniedScreen({ status }: { status: 'expired' | 'invalid' }): JSX.Element {
  return (
    <div
      data-theme="dark"
      className="flex h-screen w-screen items-center justify-center bg-canvas"
      style={{ background: '#1a1a2e', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}
    >
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {status === 'expired' ? '⏳' : '🔒'}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          {status === 'expired' ? 'Demo link expired' : 'Access required'}
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
          {status === 'expired'
            ? 'This demo link has expired. Please contact us to request a new link.'
            : 'This demo requires a valid access link. Please contact us to get one.'}
        </p>
        <a
          href="mailto:miguelmchirinos@gmail.com?subject=Stage%20Plot%20Demo%20Access"
          style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 8,
            background: '#7c3aed', color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600
          }}
        >
          Request access
        </a>
      </div>
    </div>
  )
}

export function DemoGate({ children }: { children: ReactNode }): JSX.Element {
  const status = getStatus()
  if (status !== 'ok') return <DeniedScreen status={status} />
  return <>{children}</>
}
