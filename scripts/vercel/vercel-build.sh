#!/bin/bash

# Script de build personnalisé pour Vercel
echo "🔧 Début du build Vercel..."

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Générer le client Prisma
echo "🗄️ Génération du client Prisma..."
npx prisma generate

# Vérifier que le client Prisma a été généré
if [ -d "node_modules/.prisma" ]; then
    echo "✅ Client Prisma généré avec succès"
else
    echo "❌ Erreur: Client Prisma non généré"
    exit 1
fi

echo "🚀 Build terminé avec succès" 