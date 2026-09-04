import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DAVOT Uncaught Error Boundary Caught:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('davot_auth');
    window.location.href = '/app/flow';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#f8fafc',
          color: '#1e293b',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)',
            maxWidth: '480px',
            width: '100%',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              !
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              The application encountered an unexpected runtime state. Click below to restore resilient data and reload.
            </p>
            {this.state.error && (
              <pre style={{
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#475569',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '20px',
                maxHeight: '120px'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Reload DAVOT App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
