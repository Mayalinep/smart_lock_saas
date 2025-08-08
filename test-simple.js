console.log('🧪 Test 1: Vérifier que JWT_SECRET est défini');
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET est défini');
} else {
  console.log('❌ JWT_SECRET manque');
  process.exit(1);
}

console.log('🧪 Test 2: Vérifier que NODE_ENV est test');
if (process.env.NODE_ENV === 'test') {
  console.log('✅ NODE_ENV est test');
} else {
  console.log('❌ NODE_ENV n\'est pas test');
  process.exit(1);
}

console.log('🎉 Tous les tests passent !'); 