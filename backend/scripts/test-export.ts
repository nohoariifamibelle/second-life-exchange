/**
 * Script de test pour l'endpoint d'export RGPD
 * Usage: npx ts-node scripts/test-export.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Remplace ces valeurs par un utilisateur de test existant
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
};

async function testExport() {
  console.log('🔐 Connexion...');

  // 1. Login
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  });

  if (!loginResponse.ok) {
    console.error('❌ Échec de connexion:', await loginResponse.text());
    process.exit(1);
  }

  const { accessToken } = await loginResponse.json();
  console.log('✅ Connecté avec succès');

  // 2. Export
  console.log('\n📦 Demande d\'export RGPD...');
  const exportResponse = await fetch(`${API_URL}/users/me/export`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!exportResponse.ok) {
    console.error('❌ Échec de l\'export:', await exportResponse.text());
    process.exit(1);
  }

  // Vérifier les headers
  const contentDisposition = exportResponse.headers.get('content-disposition');
  console.log('📎 Content-Disposition:', contentDisposition);

  const data = await exportResponse.json();

  // 3. Validation
  console.log('\n✅ Export réussi!');
  console.log('─'.repeat(50));
  console.log('📅 Date d\'export:', data.exportedAt);
  console.log('📜 Article RGPD:', data.gdprArticle);
  console.log('─'.repeat(50));

  // Vérifications de sécurité
  console.log('\n🔒 Vérifications de sécurité:');

  // Pas de mot de passe
  if ('password' in data.user) {
    console.error('❌ ERREUR: Le mot de passe est présent dans l\'export!');
  } else {
    console.log('✅ Mot de passe exclu');
  }

  // Données utilisateur
  console.log('\n👤 Données utilisateur:');
  console.log('   - Email:', data.user.email);
  console.log('   - Nom:', data.user.firstName, data.user.lastName);
  console.log('   - Créé le:', data.user.createdAt);

  // Stats
  console.log('\n📊 Statistiques:');
  console.log('   - Items:', data.items?.length || 0);
  console.log('   - Échanges:', data.exchanges?.length || 0);
  console.log('   - Reviews données:', data.reviews?.given?.length || 0);
  console.log('   - Reviews reçues:', data.reviews?.received?.length || 0);

  // Vérifier minimisation des données
  console.log('\n🔍 Vérification minimisation des données:');
  if (data.exchanges?.length > 0) {
    const exchange = data.exchanges[0];
    const otherUser = exchange.proposer._id === data.user._id
      ? exchange.receiver
      : exchange.proposer;

    if (otherUser && !otherUser.email) {
      console.log('✅ Emails des autres utilisateurs masqués');
    } else if (otherUser?.email) {
      console.error('❌ ERREUR: Email d\'un autre utilisateur visible!');
    }
  }

  // Sauvegarder le fichier
  const fs = await import('fs');
  fs.writeFileSync('test-export-result.json', JSON.stringify(data, null, 2));
  console.log('\n💾 Fichier sauvegardé: test-export-result.json');
}

testExport().catch(console.error);
