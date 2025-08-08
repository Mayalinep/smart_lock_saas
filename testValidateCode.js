// testValidateCode.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function main() {
  console.log('🔐 Test validation de code (hash)\n');
  try {
    // 1) Créer owner et récupérer cookie
    const owner = { email: `owner.${Date.now()}@ex.com`, password: 'Mot2Passe!', firstName: 'Own', lastName: 'Er' };
    const regOwner = await axios.post(`${BASE_URL}/auth/register`, owner);
    const ownerCookie = regOwner.headers['set-cookie'].find(c => c.startsWith('token='));
    console.log('✅ Owner créé');

    // 2) Créer propriété
    const propRes = await axios.post(`${BASE_URL}/properties`, { title: 'Prop Hash', address: '2 Rue Hash' }, { headers: { Cookie: ownerCookie } });
    const propertyId = propRes.data.data.property.id;
    console.log('✅ Propriété créée:', propertyId);

    // 3) Créer target user (accès)
    const guest = { email: `guest.${Date.now()}@ex.com`, password: 'Mot2Passe!', firstName: 'Gu', lastName: 'Est' };
    const regGuest = await axios.post(`${BASE_URL}/auth/register`, guest);
    const guestId = regGuest.data.data.user.id;
    console.log('✅ Utilisateur cible créé:', guestId);

    // 4) Créer un accès futur
    const start = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const create = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: guestId,
      startDate: start,
      endDate: end,
      accessType: 'TEMPORARY',
      description: 'hash test'
    }, { headers: { Cookie: ownerCookie } });
    const access = create.data.data.access;
    console.log('✅ Accès créé. Code (retourné en clair):', access.code);

    // 5) Valider le code (devrait être NOT_STARTED car start dans 10min)
    try {
      await axios.post(`${BASE_URL}/access/validate`, { code: access.code, propertyId });
      console.log('⚠️ Attendu 401 NOT_STARTED, mais a retourné 200');
    } catch (err) {
      console.log('✅ Validation (early) NOT_STARTED attendue:', err.response?.status, err.response?.data?.data?.reason);
    }

    // 6) Recréer un accès qui commence dans 1 min (valide côté Zod),
    // puis basculer startDate en base pour tester la validation OK immédiatement
    const startSoon = new Date(Date.now() + 1 * 60 * 1000).toISOString();
    const endSoon = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const createNow = await axios.post(`${BASE_URL}/access`, {
      propertyId,
      userId: guestId,
      startDate: startSoon,
      endDate: endSoon,
      accessType: 'TEMPORARY',
      description: 'hash test now'
    }, { headers: { Cookie: ownerCookie } });
    const accessNow = createNow.data.data.access;
    console.log('✅ Accès immédiat créé. Code:', accessNow.code);

    // Forcer startDate dans le passé pour valider tout de suite
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    await db.access.update({ where: { id: accessNow.id }, data: { startDate: new Date(Date.now() - 60 * 1000) } });
    await db.$disconnect();

    const validateOk = await axios.post(`${BASE_URL}/access/validate`, { code: accessNow.code, propertyId });
    console.log('✅ Validation OK:', validateOk.data);

    // 7) Mauvais code
    try {
      await axios.post(`${BASE_URL}/access/validate`, { code: '000000', propertyId });
    } catch (err) {
      console.log('✅ Validation KO attendue:', err.response.status, err.response.data.message);
    }

    console.log('\n🎉 Test hash & validation terminé');
  } catch (e) {
    console.error('❌ Erreur test:', e.response?.data || e.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}

