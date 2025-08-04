const { spawn } = require('child_process');

console.log('🔄 Redémarrage du serveur avec les nouvelles variables d\'environnement...');

// Arrêter tous les processus Next.js
const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe', '/FI', 'WINDOWTITLE eq *next*'], {
  stdio: 'inherit'
});

killProcess.on('close', (code) => {
  console.log('✅ Processus arrêtés');
  
  // Attendre un moment
  setTimeout(() => {
    console.log('🚀 Redémarrage du serveur...');
    
    // Redémarrer le serveur
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    server.on('error', (err) => {
      console.error('❌ Erreur lors du démarrage:', err);
    });

  }, 2000);
});