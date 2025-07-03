"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorId: "",
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to system for diagnostics
    this.logErrorToSystem(error, errorInfo)
  }

  private logErrorToSystem(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const errorLog = {
        id: this.state.errorId,
        timestamp: Date.now(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      // Store in localStorage for system diagnostics
      const existingErrors = JSON.parse(localStorage.getItem("zacai_error_log") || "[]")
      existingErrors.push(errorLog)

      // Keep only last 50 errors
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50)
      }

      localStorage.setItem("zacai_error_log", JSON.stringify(existingErrors))
    } catch (logError) {
      console.error("Failed to log error to system:", logError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: "",
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                System Error Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Error ID: {this.state.errorId}</Badge>
                <Badge variant="outline">{new Date().toLocaleString()}</Badge>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-red-700 font-mono text-sm">
                  {this.state.error?.name}: {this.state.error?.message}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">What happened?</h3>
                <p className="text-blue-700 text-sm">
                  ZacAI encountered an unexpected error. The system has automatically logged this issue for diagnostics.
                  You can try the recovery options below.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Recovery Options:</h3>
                <div className="space-y-2 text-green-700 text-sm">
                  <p>
                    • <strong>Retry:</strong> Attempt to recover from this error
                  </p>
                  <p>
                    • <strong>Reload:</strong> Refresh the entire application
                  </p>
                  <p>
                    • <strong>Home:</strong> Return to the main page
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload App
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error?.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    <Bug className="w-4 h-4 inline mr-1" />
                    Developer Details (Click to expand)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to access error boundary functionality
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error("Manual error report:", error, errorInfo)

    // Log to system
    try {
      const errorLog = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: "manual",
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        additionalInfo: errorInfo,
      }

      const existingErrors = JSON.parse(localStorage.getItem("zacai_error_log") || "[]")
      existingErrors.push(errorLog)
      localStorage.setItem("zacai_error_log", JSON.stringify(existingErrors))
    } catch (logError) {
      console.error("Failed to log manual error:", logError)
    }
  }
}

// Utility to get error logs for diagnostics
export function getErrorLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem("zacai_error_log") || "[]")
  } catch {
    return []
  }
}

// Utility to clear error logs
export function clearErrorLogs(): void {
  localStorage.removeItem("zacai_error_log")
}
