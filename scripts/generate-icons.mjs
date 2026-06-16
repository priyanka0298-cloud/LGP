import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const svg = readFileSync(join(publicDir, "icon.svg"));

await sharp(svg).resize(192, 192).png().toFile(join(publicDir, "icon-192.png"));
console.log("✓ icon-192.png");

await sharp(svg).resize(512, 512).png().toFile(join(publicDir, "icon-512.png"));
console.log("✓ icon-512.png");

// Apple touch icon (180x180)
await sharp(svg).resize(180, 180).png().toFile(join(publicDir, "apple-icon.png"));
console.log("✓ apple-icon.png");

console.log("Icons generated.");
