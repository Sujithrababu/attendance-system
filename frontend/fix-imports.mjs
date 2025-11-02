// fix-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, 'src', 'components');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix import statements - add .js to local imports
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]*?)(?<!\.js)['"]/g,
    "from '$1.js'"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed imports in: ${path.relative(__dirname, filePath)}`);
}

// Process all JS files
function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.js')) {
      fixImports(fullPath);
    }
  }
}

processDirectory(componentsDir);
console.log('🎉 All imports fixed!');