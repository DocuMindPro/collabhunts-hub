import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary specifically designed for native mobile apps.
 * Shows a visible error message instead of a white screen when crashes occur.
 * Only shows detailed error info on native platforms for debugging.
 */
class NativeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NativeErrorBoundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isNative = Capacitor.isNativePlatform();
      
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              ⚠️
            </div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#ff6b6b',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: '#a0a0a0',
                marginBottom: '24px',
              }}
            >
              The app encountered an unexpected error.
            </p>
            
            {isNative && this.state.error && (
              <div
                style={{
                  backgroundColor: '#2d2d44',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  overflowX: 'auto',
                }}
              >
                <p style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '8px' }}>
                  Error: {this.state.error.name}
                </p>
                <p style={{ color: '#ffa94d', marginBottom: '8px' }}>
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre
                    style={{
                      color: '#868e96',
                      fontSize: '10px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#4dabf7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NativeErrorBoundary;
