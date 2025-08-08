const { execSync } = require('child_process');

console.log('🔍 Recherche de l\'URL de déploiement Vercel...\n');

try {
    // Vérifier si Vercel CLI est installé
    console.log('📋 Vérification de Vercel CLI...');
    const vercelVersion = execSync('vercel --version', { encoding: 'utf8' });
    console.log(`✅ Vercel CLI installé: ${vercelVersion.trim()}`);
    
    // Lister les projets
    console.log('\n📋 Projets Vercel disponibles:');
    const projects = execSync('vercel ls', { encoding: 'utf8' });
    console.log(projects);
    
    // Obtenir l'URL du projet actuel
    console.log('\n📋 URL du projet actuel:');
    const projectUrl = execSync('vercel inspect', { encoding: 'utf8' });
    console.log(projectUrl);
    
} catch (error) {
    console.log('❌ Erreur lors de la recherche:');
    console.log(error.message);
    
    console.log('\n💡 Solutions:');
    console.log('1. Installer Vercel CLI: npm i -g vercel');
    console.log('2. Se connecter: vercel login');
    console.log('3. Ou aller sur vercel.com et copier l\'URL manuellement');
} 