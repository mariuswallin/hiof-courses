#!/usr/bin/env bash
# scripts/release.sh — deploy-helper. Kjør: bash scripts/release.sh
set -euo pipefail

echo "🧪 Kjører tester..."
pnpm test

echo "🏗️  Bygger..."
pnpm build

echo "🗄️  Migrerer prod-DB..."
pnpm wrangler d1 migrations apply DB --remote

echo "🚀 Deployer..."
pnpm wrangler deploy

echo "✅ Verifiserer..."
PROD_URL="${PUBLIC_URL:-https://kvitter.example.workers.dev}"
curl -fsS "$PROD_URL/api/status" || {
  echo "❌ Status-endpoint svarte ikke 200"
  exit 1
}

echo ""
echo "✅ Deploy fullført!"
echo "🌐 $PROD_URL"
