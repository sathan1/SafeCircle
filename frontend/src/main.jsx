import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SafeCircle ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('safecircle_user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcf8f8] flex flex-col items-center justify-center p-6 text-stone-900 font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-stone-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-2xl mx-auto border border-rose-200">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-stone-900">Application Notice</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              SafeCircle caught a runtime exception. You can refresh or return to the login screen.
            </p>
            <div className="bg-stone-50 p-3 rounded-xl text-left border border-stone-200 overflow-x-auto text-[11px] font-mono text-rose-800">
              {this.state.error?.message || String(this.state.error)}
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-rose-200"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
