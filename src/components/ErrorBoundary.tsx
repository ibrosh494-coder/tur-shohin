import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-graphite-50 px-4">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
            <h1 className="mb-2 font-display text-2xl font-bold text-graphite-900">Что-то пошло не так</h1>
            <p className="mb-6 text-graphite-500">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>
            {this.state.error && (
              <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-graphite-100 p-3 text-left text-xs text-graphite-600">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-full bg-pine-600 px-6 py-3 font-bold text-white transition-colors hover:bg-pine-700"
            >
              <RefreshCw className="h-4 w-4" />
              На главную
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
