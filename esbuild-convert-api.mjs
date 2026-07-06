import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, "../lib/api-client-react/src");

async function convertFile(filePath) {
  const ext = path.extname(filePath);
  if (ext !== ".ts" && ext !== ".tsx") return;

  const isTSX = ext === ".tsx";
  const newExt = isTSX ? ".jsx" : ".js";
  const newFilePath = filePath.slice(0, -ext.length) + newExt;

  console.log(`Converting ${path.relative(srcDir, filePath)} -> ${path.basename(newFilePath)}`);

  const code = fs.readFileSync(filePath, "utf8");

  const result = await esbuild.transform(code, {
    loader: isTSX ? "tsx" : "ts",
    jsx: isTSX ? "preserve" : undefined,
    format: "esm",
    target: "esnext"
  });

  fs.writeFileSync(newFilePath, result.code, "utf8");
  fs.unlinkSync(filePath); // Delete old TS file
}

async function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await traverse(fullPath);
    } else {
      await convertFile(fullPath);
    }
  }
}

async function main() {
  console.log("Starting conversion...");
  await traverse(srcDir);
  console.log("Conversion complete.");
}

main().catch(console.error);
