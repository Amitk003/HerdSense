import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen error-screen">
          <h2>Something went wrong</h2>
          <p className="error-message">{this.state.error?.message}</p>
          <button className="back-btn" onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}>
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
