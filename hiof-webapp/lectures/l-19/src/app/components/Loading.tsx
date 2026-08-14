// /app/components/Loading.tsx

interface LoadingProps {
  title?: string;
  message?: string;
}

export function Loading({
  title = "Laster...",
  message = "Henter data fra server",
}: LoadingProps) {
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-6"
      data-testid="loading"
    >
      <div className="text-center space-y-6 max-w-lg">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          {/* Pulse effect behind spinner */}
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-blue-100 rounded-full animate-pulse"></div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
