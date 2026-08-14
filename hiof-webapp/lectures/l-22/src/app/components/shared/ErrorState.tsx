// /app/components/shared/ErrorState.tsx

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({
  message,
  onRetry,
  title = "Noe gikk galt",
}: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Main error container with proper ARIA role */}
      <div
        className="text-center space-y-6 max-w-lg bg-white p-8 rounded-lg shadow-lg"
        role="alert"
        aria-live="assertive"
      >
        {/* Error icon with accessible description */}
        <div className="relative">
          <AlertCircle
            size={64}
            className="mx-auto text-red-500 animate-bounce"
            aria-hidden="true"
          />
        </div>

        {/* Error content with proper heading hierarchy */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Action button with improved accessibility */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            aria-describedby="retry-help"
            type="button"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Prøv igjen
          </button>
        )}

        {/* Help text with proper ID for button reference */}
        <p id="retry-help" className="text-sm text-gray-500">
          Hvis problemet vedvarer, kontakt support.
        </p>
      </div>
    </div>
  );
}
