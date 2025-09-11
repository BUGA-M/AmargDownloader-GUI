const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src/splashscreen.html');
const dest = path.join(__dirname, 'dist', 'splashscreen.html');

fs.copyFileSync(src, dest);
console.log('splashscreen.html copié dans dist/');
