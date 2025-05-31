'use client'

import type React from 'react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // You could send error to analytics service here
    if (typeof window !== 'undefined') {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Boundary Caught Error')
        console.error('Error:', error)
        console.error('Error Info:', errorInfo)
        console.error('Component Stack:', errorInfo.componentStack)
        console.groupEnd()
      }
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportError = () => {
    const { error, errorInfo } = this.state
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    // You could send this to an error reporting service
    console.log('Error Report:', errorReport)

    // For now, just copy to clipboard
    navigator.clipboard?.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Error report copied to clipboard!'))
      .catch(() => console.log('Failed to copy error report'))
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="glassmorphism border-red-500/30 bg-red-500/5 max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30">
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-400 font-pixel">
                Oops! Something Went Wrong
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                The roach encountered an unexpected error. Don't worry, we're still unkillable!
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 rounded-lg bg-background/50 border border-red-500/20">
                  <h4 className="font-semibold text-red-400 mb-2 flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Error Details
                  </h4>
                  <div className="text-sm font-mono text-muted-foreground space-y-2">
                    <div>
                      <span className="text-red-400">Message:</span> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <details className="cursor-pointer">
                        <summary className="text-red-400 hover:text-red-300">Stack Trace</summary>
                        <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats to Show Site is Still Working */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg glassmorphism border border-neon-green/30">
                  <div className="text-lg font-bold text-neon-green">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-3 rounded-lg glassmorphism border border-neon-blue/30">
                  <div className="text-lg font-bold text-neon-blue">24/7</div>
                  <div className="text-xs text-muted-foreground">Support</div>
                </div>
                <div className="text-center p-3 rounded-lg glassmorphism border border-nuclear-glow/30">
                  <div className="text-lg font-bold text-nuclear-glow">∞</div>
                  <div className="text-xs text-muted-foreground">Survival</div>
                </div>
                <div className="text-center p-3 rounded-lg glassmorphism border border-neon-orange/30">
                  <div className="text-lg font-bold text-neon-orange">🪳</div>
                  <div className="text-xs text-muted-foreground">Unkillable</div>
                </div>
              </div>

              {/* Recovery Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 nuclear-gradient hover-glow"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-neon-blue text-neon-blue hover:bg-neon-blue/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>

                <Button
                  onClick={this.handleReportError}
                  variant="outline"
                  className="flex-1 border-neon-orange text-neon-orange hover:bg-neon-orange/10"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              {/* Helpful Message */}
              <div className="text-center p-4 rounded-lg bg-neon-green/5 border border-neon-green/20">
                <p className="text-sm text-neon-green">
                  💡 <strong>Pro Tip:</strong> Try refreshing the page or check your internet connection.
                  The roach army is here to help if the problem persists!
                </p>
              </div>

              {/* Contact Information */}
              <div className="text-center text-xs text-muted-foreground">
                <p>Need help? Contact us:</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <Badge variant="outline" className="border-neon-blue/30">
                    Discord: /boomroach
                  </Badge>
                  <Badge variant="outline" className="border-neon-green/30">
                    Telegram: @boomroach_army
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
