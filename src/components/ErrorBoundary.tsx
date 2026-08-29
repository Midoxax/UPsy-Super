import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { captureException } from "@/lib/analytics/sentry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      // Compared against undefined rather than truthiness so that an explicit
      // `fallback={null}` means "render nothing" — the right behaviour for
      // decorative subtrees that should fail silently. A truthiness check
      // would send those to the full-page error UI instead.
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h1 className="text-h2 text-foreground mb-4">Something went wrong</h1>
            <p className="text-body text-muted-foreground mb-6">
              We're sorry for the inconvenience. Please try refreshing the page or returning to the homepage.
            </p>
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Technical details
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
              <Button onClick={this.handleReset}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
