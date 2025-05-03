
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    // Reset the error boundary state
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle size={20} />
              Ocorreu um erro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-gray-700 mb-4">
              Não foi possível carregar este componente. Por favor, tente novamente ou entre em contato com o suporte.
            </p>
            <pre className="bg-gray-100 p-3 rounded-md text-sm mb-4 overflow-auto max-h-32">
              {this.state.error?.toString() || "Erro desconhecido"}
            </pre>
            <div className="flex justify-end">
              <Button onClick={this.handleReset}>Tentar Novamente</Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
