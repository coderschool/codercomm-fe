#!/bin/bash
set -e

# Build the project
echo "Building the project..."
npm run build

# Fix paths in index.html for Firebase hosting
echo "Fixing paths in index.html..."
sed -i '' 's|src="/assets/|src="./assets/|g' dist/index.html
sed -i '' 's|href="/assets/|href="./assets/|g' dist/index.html
sed -i '' 's|href="/logo.png"|href="./logo.png"|g' dist/index.html
sed -i '' 's|href="/favicon.ico"|href="./favicon.ico"|g' dist/index.html
sed -i '' 's|href="/manifest.json"|href="./manifest.json"|g' dist/index.html

# Create Firebase configuration file if it doesn't exist
if [ ! -f "firebase.json" ]; then
  echo "Creating Firebase configuration file..."
  cat > firebase.json << EOF
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF
fi

echo "Build and configuration complete!"
echo "To deploy, run: firebase deploy" 