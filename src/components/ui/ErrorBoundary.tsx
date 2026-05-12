import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackTitle?: string;
    fallbackMessage?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Error capturado:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center" role="alert">
                    <AlertTriangle className="w-12 h-12 text-yellow-500" aria-hidden="true" />
                    <h2 className="text-lg font-semibold text-texto-oscuro">
                        {this.props.fallbackTitle || 'Algo ha ido mal'}
                    </h2>
                    <p className="text-sm text-texto-claro max-w-md">
                        {this.props.fallbackMessage || 'Se ha producido un error inesperado. Puedes intentar recargar este componente.'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-acento text-white rounded-lg hover:bg-acento-claro hover:text-texto-oscuro transition-colors text-sm font-medium"
                        aria-label="Reintentar carga del componente"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
