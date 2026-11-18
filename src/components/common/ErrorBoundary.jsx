import React from 'react';

/**
 * Top-level React Error Boundary.
 * Catches unhandled runtime rendering errors, prevents the entire app
 * from crashing to a blank white screen, and provides a clear recovery action.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React runtime error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="card error-boundary-card">
            <h2>Something went wrong</h2>
            <p>
              An unexpected error occurred while rendering the application.
            </p>
            {this.state.error?.message && (
              <pre className="error-message">
                {this.state.error.message}
              </pre>
            )}
            <button
              className="btn btn-primary"
              onClick={this.handleReload}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
