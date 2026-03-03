// fixVehicleIds.js
// Usage: node fixVehicleIds.js path/to/vehicles.js

const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node fixVehicleIds.js path/to/vehicles.js");
  process.exit(1);
}

let text = fs.readFileSync(filePath, "utf8");

// Regex finds: id: 'something' ... year: 2026 (order can vary within the object?)
// We'll do a safer approach: operate per-object chunk.
const objectRegex = /\{[\s\S]*?\},/g;

let updated = 0;

text = text.replace(objectRegex, (obj) => {
  const idMatch = obj.match(/id:\s*['"]([^'"]+)['"]/);
  const yearMatch = obj.match(/year:\s*(\d{4})/);

  if (!idMatch || !yearMatch) return obj;

  const oldId = idMatch[1];
  const year = yearMatch[1];

  // If id already ends with -YYYY, leave it
  if (new RegExp(`-${year}$`).test(oldId)) return obj;

  const newId = `${oldId}-${year}`;

  // replace only the id value inside this object
  const newObj = obj.replace(
    /id:\s*['"][^'"]+['"]/,
    `id: '${newId}'`
  );

  updated += 1;
  return newObj;
});

fs.writeFileSync(filePath, text, "utf8");
console.log(`Done. Updated ${updated} vehicle ids.`);