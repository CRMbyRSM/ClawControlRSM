import { Component, ErrorInfo, ReactNode } from 'react'
import { useStore } from '../store'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  componentStack: string
  objectFindings: string[]
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, componentStack: '', objectFindings: [] }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ClawControlRSM] React error boundary caught:', error)
    console.error('[ClawControlRSM] Component stack:', info.componentStack)

    // Scan ALL store data for non-primitive values that could crash React
    const objectFindings: string[] = []
    try {
      const state = useStore.getState()
      if (state) {
        const scanObj = (label: string, obj: any, depth = 0) => {
          if (!obj || typeof obj !== 'object' || depth > 3) return
          for (const [k, v] of Object.entries(obj)) {
            if (v !== null && v !== undefined && typeof v === 'object') {
              // Skip known structural fields and functions
              if (typeof v === 'function') continue
              if (k === 'attachments' || k === 'requirements' || k === 'missing' || k === 'install') continue
              try {
                const snippet = JSON.stringify(v).slice(0, 200)
                objectFindings.push(`${label}.${k} [${Array.isArray(v) ? 'array' : 'object'}]: ${snippet}`)
              } catch {
                objectFindings.push(`${label}.${k} [non-serializable object]`)
              }
            }
          }
        }
        state.messages?.forEach((m: any, i: number) => scanObj(`msg[${i}]`, m))
        state.sessions?.forEach((s: any, i: number) => scanObj(`session[${i}]`, s))
        state.agents?.forEach((a: any, i: number) => scanObj(`agent[${i}]`, a))
        state.skills?.forEach((s: any, i: number) => scanObj(`skill[${i}]`, s))
        state.cronJobs?.forEach((c: any, i: number) => scanObj(`cron[${i}]`, c))
      }
    } catch (scanErr) {
      objectFindings.push(`[Store scan failed: ${scanErr}]`)
    }

    console.error('[ClawControlRSM] Object findings:', objectFindings)
    this.setState({
      error,
      componentStack: info.componentStack || '',
      objectFindings
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          background: '#0a0d12',
          color: '#e0e6ed',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          overflow: 'auto'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#8594a3', marginBottom: '0.5rem', maxWidth: '600px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.state.componentStack && (
            <pre style={{
              background: '#1a1d24',
              color: '#f59e0b',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              maxWidth: '600px',
              maxHeight: '200px',
              overflow: 'auto',
              textAlign: 'left',
              marginBottom: '1rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>{this.state.componentStack}</pre>
          )}
          {this.state.objectFindings.length > 0 && (
            <div style={{
              background: '#1a1d24',
              color: '#f87171',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              maxWidth: '600px',
              maxHeight: '250px',
              overflow: 'auto',
              textAlign: 'left',
              marginBottom: '1rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              <strong>⚠️ Objects found in store (potential culprits):</strong>{'\n'}
              {this.state.objectFindings.slice(0, 30).join('\n')}
            </div>
          )}
          <p style={{ color: '#4a5568', fontSize: '0.8rem', marginBottom: '1.5rem', maxWidth: '500px' }}>
            Screenshot this and send to Antonella for debugging
          </p>
          <button
            onClick={() => {
              try { localStorage.removeItem('clawcontrol-storage') } catch {}
              window.location.reload()
            }}
            style={{
              background: '#17a192',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            Reset &amp; Reload
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              color: '#8594a3',
              border: '1px solid #1e2533',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Just Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
