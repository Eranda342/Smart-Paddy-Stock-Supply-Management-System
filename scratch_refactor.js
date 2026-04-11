const fs = require('fs');
const content = fs.readFileSync('scratch_mo.jsx', 'utf8');

// We split the file into parts to inject ChatSection
// We map over unique farmers

let newContent = content;

console.log("File length:", newContent.length);
