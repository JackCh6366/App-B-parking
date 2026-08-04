import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-white border border-rose-200 rounded-2xl shadow-md text-slate-800 flex flex-col items-center justify-center text-center max-w-md mx-auto my-12">
          <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center text-rose-600 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            {this.props.fallbackText || '應用程式遇到預期外錯誤'}
          </h2>
          <p className="text-xs text-slate-500 mb-4 font-mono break-all bg-slate-50 p-2 rounded border border-slate-200 w-full">
            {this.state.error?.message || '不明錯誤'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新載入元件</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
