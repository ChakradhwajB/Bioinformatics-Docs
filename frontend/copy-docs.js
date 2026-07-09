const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'docs');
const dest = path.join(__dirname, 'docs');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (fs.existsSync(src)) {
    // Clear existing dest if it exists to prevent stales
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    copyRecursiveSync(src, dest);
    console.log('Documentation folder synchronized successfully to frontend/docs/');
  } else {
    console.error('Source docs folder not found at', src);
  }
} catch (err) {
  console.error('Error copying documentation folder:', err);
}
