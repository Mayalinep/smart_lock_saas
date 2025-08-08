/*
  Génère le fichier OpenAPI JSON à partir de src/docs/openapi.js
*/
const fs = require('fs');
const path = require('path');
const { openapiSpec } = require('../src/docs/openapi');

const outDir = path.resolve(__dirname, '..', 'clients', 'sdk');
const outFile = path.join(outDir, 'openapi.json');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(openapiSpec, null, 2), 'utf-8');
console.log(`✅ OpenAPI JSON généré: ${outFile}`);

