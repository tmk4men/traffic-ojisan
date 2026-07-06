// www/ を組み立てるスクリプト（Windows / Mac 両対応）
// リポジトリ直下の実行時アセットだけを www/ にコピーして、Capacitor がアプリに同梱できるようにする。
// 素材の元ファイル（写真/ 効果音/ 画像/ make-ogp.html / README など）は入れない。
import { readdirSync, rmSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'www');

// アプリ本体で読み込む拡張子
const INCLUDE_EXT = /\.(png|webp|mp3|ico|webmanifest|ttf|woff2?)$/i;
// 拡張子は一致するが同梱不要なもの（重い素材・SNSシェア用OGPなど）
const EXCLUDE = new Set([
  'ホームhaikei.png', // 未使用（bg-home.webp を使用）
  'ogp.png',          // 外部SNSシェア用。アプリ内では読み込まない
]);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let count = 0;
let bytes = 0;
for (const name of readdirSync(ROOT)) {
  const src = join(ROOT, name);
  if (!statSync(src).isFile()) continue;
  const isEntry = name === 'index.html';
  if (!isEntry && (!INCLUDE_EXT.test(name) || EXCLUDE.has(name))) continue;
  copyFileSync(src, join(OUT, name));
  count++;
  bytes += statSync(src).size;
}

console.log(`www/ を生成しました: ${count} ファイル / ${(bytes / 1048576).toFixed(2)} MB`);
