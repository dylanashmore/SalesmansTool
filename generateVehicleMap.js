const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "app/images/vehiclePics");
const outputFile = path.join(baseDir, "vehiclePicMap.ts");

const mapEntries = [];

const categories = fs.readdirSync(baseDir);

categories.forEach((category) => {
  const categoryPath = path.join(baseDir, category);

  if (!fs.statSync(categoryPath).isDirectory()) return;

  const vehicles = fs.readdirSync(categoryPath);

  vehicles.forEach((vehicleFolder) => {
    const folderPath = path.join(categoryPath, vehicleFolder);

    if (!fs.statSync(folderPath).isDirectory()) return;

    const files = fs.readdirSync(folderPath);

    const webp = files.find((f) => f.endsWith(".webp"));

    if (!webp) return;

    const relativePath = `./${category}/${vehicleFolder}/${webp}`;

    mapEntries.push(
      `  "${vehicleFolder}": require("${relativePath}")`
    );
  });
});

const fileContent = `export const vehiclePicById: Record<string, any> = {
${mapEntries.join(",\n")}
};
`;

fs.writeFileSync(outputFile, fileContent);

console.log("vehiclePicMap.ts generated!");