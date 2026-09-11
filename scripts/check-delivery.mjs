// Node 18+，只使用内置模块。检查随包资源完整性、相对引用及 JS 语法。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'handoff/asset-manifest.json');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true })
  .filter(entry => !entry.name.startsWith('.'))
  .flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const assetFiles = walk(path.join(root, 'assets')).sort();
const actual = assetFiles.map(file => ({
  path: path.relative(root, file).split(path.sep).join('/'),
  bytes: fs.statSync(file).size,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
}));
if (process.argv.includes('--update-manifest')) {
  fs.writeFileSync(manifestPath, JSON.stringify({ version: 'ui-v1.0.0', assets: actual }, null, 2) + '\n');
  console.log(`已生成 ${actual.length} 个资源的大小与 SHA-256 清单。`);
}
const expected = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).assets;
if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('资源与清单不一致。请检查缺失/改动；确认是有意更新后使用 --update-manifest。');
const files = ['index.html', 'css', 'js', 'demo', 'handoff'].flatMap(item => {
  const absolute = path.join(root, item);
  return fs.statSync(absolute).isDirectory() ? walk(absolute) : [absolute];
});
let references = 0, scripts = 0;
const verifyReference = (from, reference) => {
  if (!reference || /^(?:[a-z]+:|#|\/\/)/i.test(reference) || reference.includes('${')) return;
  const local = decodeURIComponent(reference.split(/[?#]/)[0]);
  const target = path.resolve(path.dirname(from), local);
  if (!fs.existsSync(target)) throw new Error(`引用不存在：${path.relative(root, from)} → ${reference}`);
  references++;
};
for (const file of files) {
  const ext = path.extname(file);
  if (!['.html', '.css', '.js'].includes(ext)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (ext === '.html') {
    for (const match of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) verifyReference(file, match[1]);
  } else if (ext === '.css') {
    for (const match of text.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)) verifyReference(file, match[1]);
  } else {
    new vm.Script(text, { filename: path.relative(root, file) });
    scripts++;
  }
}
for (const name of ['ui.js', 'chart-theme.js']) {
  const text = fs.readFileSync(path.join(root, 'js', name), 'utf8');
  if (/BatteryGuardianDemo|demo\/|normal-2026|risk-2026/.test(text)) throw new Error(`复用层依赖演示数据：${name}`);
}
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!page.includes('data-battery-report') || !page.includes('js/ui.js')) throw new Error('页面缺少 UI 作用域或交互入口。');
console.log(`通过：${actual.length} 个资源一致，${references} 个本地引用有效，${scripts} 个脚本语法正确，复用层无演示数据依赖。`);
console.log('下一步：打开 /handoff/ 运行浏览器自动检查，并按 CHECKLIST.md 进行真机验收。');
