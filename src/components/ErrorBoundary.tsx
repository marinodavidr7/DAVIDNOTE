import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
        });
      }
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="w-full max-w-sm bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl">
              <i className="fa-solid fa-store"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Súper Colmado DAVID</h2>
              <p className="text-sm text-slate-400 mt-1">
                La aplicación se está reiniciando para cargar la versión más reciente.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center space-x-2"
              >
                <i className="fa-solid fa-rotate-right text-sm"></i>
                <span>Recargar Aplicación</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
