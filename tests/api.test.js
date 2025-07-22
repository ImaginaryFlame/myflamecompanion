// Tests basiques pour les APIs

const API_BASE = 'http://localhost:3000/api';

// Test de l'API utilisateur
async function testUtilisateurAPI() {
  try {
    const response = await fetch(`${API_BASE}/utilisateur`);
    const data = await response.json();
    console.log('✅ API Utilisateur:', data.length > 0 ? `${data.length} utilisateurs trouvés` : 'Aucun utilisateur');
    return response.ok;
  } catch (error) {
    console.error('❌ Erreur API Utilisateur:', error.message);
    return false;
  }
}

// Test de l'API histoire
async function testHistoireAPI() {
  try {
    const response = await fetch(`${API_BASE}/histoire`);
    const data = await response.json();
    console.log('✅ API Histoire:', data.length > 0 ? `${data.length} histoires trouvées` : 'Aucune histoire');
    return response.ok;
  } catch (error) {
    console.error('❌ Erreur API Histoire:', error.message);
    return false;
  }
}

// Test de l'API chapitre
async function testChapitreAPI() {
  try {
    const response = await fetch(`${API_BASE}/chapitre`);
    const data = await response.json();
    console.log('✅ API Chapitre:', data.length > 0 ? `${data.length} chapitres trouvés` : 'Aucun chapitre');
    return response.ok;
  } catch (error) {
    console.error('❌ Erreur API Chapitre:', error.message);
    return false;
  }
}

// Test de l'API progression
async function testProgressionAPI() {
  try {
    const response = await fetch(`${API_BASE}/progression`);
    const data = await response.json();
    console.log('✅ API Progression:', data.length > 0 ? `${data.length} progressions trouvées` : 'Aucune progression');
    return response.ok;
  } catch (error) {
    console.error('❌ Erreur API Progression:', error.message);
    return false;
  }
}

// Test de l'API note
async function testNoteAPI() {
  try {
    const response = await fetch(`${API_BASE}/note`);
    const data = await response.json();
    console.log('✅ API Note:', data.length > 0 ? `${data.length} notes trouvées` : 'Aucune note');
    return response.ok;
  } catch (error) {
    console.error('❌ Erreur API Note:', error.message);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🧪 Début des tests API...\n');
  
  const results = await Promise.all([
    testUtilisateurAPI(),
    testHistoireAPI(),
    testChapitreAPI(),
    testProgressionAPI(),
    testNoteAPI()
  ]);
  
  const successCount = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log(`\n📊 Résultats: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Toutes les APIs fonctionnent correctement !');
  } else {
    console.log('⚠️ Certaines APIs ont des problèmes.');
  }
}

// Exporter pour utilisation dans Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
} else {
  // Exécuter automatiquement si dans un navigateur
  runAllTests();
} 