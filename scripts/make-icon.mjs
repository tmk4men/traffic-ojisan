// App Store用の 1024x1024 アイコンを icon-512.png から生成する。
// ・ドット絵の質感を保つため nearest（ニアレストネイバー）で2倍拡大
// ・App Storeはアルファ(透過)不可なので、アルファチャンネルを除去して不透明PNGにする
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'icon-512.png');
const OUT_DIR = join(ROOT, 'assets');
const OUT = join(OUT_DIR, 'icon.png');

mkdirSync(OUT_DIR, { recursive: true });

await sharp(SRC)
  .resize(1024, 1024, { kernel: 'nearest' })
  .flatten({ background: '#000000' }) // アルファ除去（元が全不透明なので見た目は不変）
  .png()
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`assets/icon.png を生成: ${meta.width}x${meta.height} / hasAlpha=${meta.hasAlpha}`);
