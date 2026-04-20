const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.json')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Header special case
  if (file.endsWith('Header.tsx') || file.endsWith('OwnerLayout.tsx')) {
    content = content.replace(/<span className="font-medium">Book My<\/span> <span className="font-black">Salon<\/span>/g, '<span className="font-black tracking-widest text-[16px]">MYBOOQED</span>');
  }

  // Footer special case
  if (file.endsWith('Footer.tsx')) {
      content = content.replace(/<span className="font-medium">Book My<\/span> <span className="font-black">Salon<\/span>/g, '<span className="font-black tracking-widest text-[16px]">MYBOOQED</span>');
  }
  
  // General replacements
  content = content.replace(/Book My Salon/gi, 'MyBOOQED');
  content = content.replace(/BookMySalon/gi, 'MyBOOQED');
  content = content.replace(/BOOK MY SALON/g, 'MyBOOQED');
  content = content.replace(/MyBooqed/g, 'MyBOOQED');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Updated: ' + file);
  }
});
console.log('Total files changed: ' + changedFiles);
