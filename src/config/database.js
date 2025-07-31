const { PrismaClient } = require('@prisma/client');

// Instance unique de Prisma Client
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En développement, on évite de créer plusieurs instances
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

// Gestion propre de la fermeture
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma; 