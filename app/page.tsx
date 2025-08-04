import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-12 max-w-2xl mx-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤖 MyFlame Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ton compagnon automatique pour suivre tes webnovels préférés !
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🎯 Fonctionnalités automatiques :</h3>
              <ul className="text-sm text-green-700 text-left space-y-1">
                <li>• 🕐 <strong>Vérification automatique</strong> tous les jours à 1h du matin</li>
                <li>• 🔔 <strong>Notifications en temps réel</strong> des nouveaux chapitres</li>
                <li>• 🧠 <strong>Scraping intelligent</strong> multi-méthodes</li>
                <li>• 📱 <strong>Dashboard moderne</strong> comme AniList</li>
                <li>• 🔄 <strong>Auto-refresh</strong> sans intervention</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              🤖 Dashboard Auto
            </a>
            
            <a
              href="/admin"
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              ⚙️ Administration
          </a>
        </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <a
              href="/admin/scraping"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              🧠 Scraper
            </a>
            <a
              href="/admin/visualiser"
              className="text-green-500 hover:text-green-700 underline"
            >
              👁️ Visualiser
        </a>
        <a
              href="/admin/gerer-histoires"
              className="text-orange-500 hover:text-orange-700 underline"
            >
              🗂️ Gérer
        </a>
        <a
              href="/api/auto-check"
              className="text-purple-500 hover:text-purple-700 underline"
            >
              🔍 Test Auto
            </a>
          </div>

          <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚡ Système complet :</h3>
            <p className="text-sm text-yellow-700">
              Combine <strong>cron job automatique</strong> + <strong>notifications temps réel</strong> + <strong>dashboard intelligent</strong> 
              pour une expérience complètement automatisée comme AniList ! Vérification quotidienne à 1h du matin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
