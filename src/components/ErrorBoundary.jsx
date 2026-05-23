import { Component } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-onyx-950 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-bone">Something went wrong</h1>
          <p className="mt-2 text-sm text-bone/50">An unexpected error occurred. We've been notified.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => this.setState({ error: null })}
            className="btn-ghost text-sm"
          >
            Try again
          </button>
          <Link to="/" className="btn-gold text-sm">
            Back to home
          </Link>
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <pre className="mt-4 max-w-xl overflow-auto rounded-xl border border-white/10 bg-onyx-900 p-4 text-left text-xs text-red-400">
            {this.state.error?.message}
          </pre>
        )}
      </div>
    )
  }
}
