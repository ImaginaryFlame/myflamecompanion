export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Spinner principal */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          
          {/* Spinner secondaire */}
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-300 opacity-20"></div>
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Chargement en cours...
          </h2>
          <p className="text-gray-600 mt-2">
            Préparation de votre companion
          </p>
        </div>

        {/* Animation de points */}
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
} 