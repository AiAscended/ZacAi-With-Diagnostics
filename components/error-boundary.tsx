"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

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
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The application encountered an unexpected error. Please refresh the page to try again.
              </p>
              <Button onClick={this.handleReload} className="w-full">
                Refresh Page
              </Button>
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
