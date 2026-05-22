/** One-off: shrink enc-rgb / enc-thermal PNGs for GitHub deploy. Run: node scripts/compress-assets.js */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const dirs = ["assets/images", "assets/thermal"];
const re = /^enc-(rgb|thermal)-/;

async function compressFile(file) {
  const before = fs.statSync(file).size;
  const buf = await sharp(file)
    .resize({ width: 960, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 82 })
    .toBuffer();
  if (buf.length < before) {
    fs.writeFileSync(file, buf);
  }
  const after = fs.statSync(file).size;
  console.log(`${path.relative(root, file)}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`);
}

(async () => {
  for (const dir of dirs) {
    const full = path.join(root, dir);
    for (const name of fs.readdirSync(full)) {
      if (!re.test(name) || !name.endsWith(".png")) continue;
      await compressFile(path.join(full, name));
    }
  }
})();
