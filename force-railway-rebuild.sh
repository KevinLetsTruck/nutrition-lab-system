#!/bin/bash

# Force Railway to rebuild from scratch by making a small change
echo "# Force rebuild $(date)" >> .railway-rebuild-trigger

git add .railway-rebuild-trigger
git commit -m "🔄 FORCE RAILWAY REBUILD: $(date)"
git push origin main

echo "✅ Forced Railway rebuild triggered!"
echo "⏱️  Check Railway dashboard for deployment progress"
