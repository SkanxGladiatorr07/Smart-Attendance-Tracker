import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React ErrorBoundary exception:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 text-white">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl text-center space-y-5 border-red-500/20">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <AlertOctagon size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold">Something went wrong</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                An unforeseen application error occurred. We have logged the error details to assist diagnostics.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw size={16} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
