import fs from 'node:fs';
import path from 'node:path';

const engineRoot = path.resolve('node_modules/qr-tree-engine');
const appFile = path.join(engineRoot, 'src/main.jsx');
const logoFile = path.resolve('assets/arnav-bule-logo.svg');

if (!fs.existsSync(appFile)) {
  throw new Error(`QR Tree engine source not found after dependency install: ${appFile}`);
}
if (!fs.existsSync(logoFile)) {
  throw new Error(`Portfolio logo not found: ${logoFile}`);
}

const logoSvg = fs.readFileSync(logoFile, 'utf8');
const logoDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;
let source = fs.readFileSync(appFile, 'utf8');

function replaceOnce(before, after, label) {
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Unable to apply ${label}; expected source fragment was not found.`);
  }
  source = source.replace(before, after);
}

// Use the same restrained Lucide icon language as the portfolio.
const lucideImport = 'import { Flower2, Sun, Leaf, Snowflake } from "lucide-react";';
if (!source.includes(lucideImport)) {
  replaceOnce(
    'import jsQR from "jsqr";',
    `import jsQR from "jsqr";\n${lucideImport}`,
    'Lucide icon import'
  );
}

// Custom colors are intentionally supported in Spring and Winter.
replaceOnce(
  'if (_0x2d9aad <= 0 || _0x153546 !== 0) {',
  'if (_0x2d9aad <= 0 || (_0x153546 !== 0 && _0x153546 !== 3)) {',
  'Spring/Winter palette support'
);

// All four seasonal themes should be keyboard-accessible.
replaceOnce(
  'if (_0x469151.key >= "1" && _0x469151.key <= "3") {',
  'if (_0x469151.key >= "1" && _0x469151.key <= "4") {',
  'four-season keyboard selection'
);

// Replace the decorative/weather-like theme glyphs with consistent line icons.
if (!source.includes('qr-tree-studio-elegant-season-icons')) {
  const seasonPattern =
    /var Ne = \[\{\s*label: "春季",\s*icon: Ae\.spring\s*\}, \{\s*label: "夏季",\s*icon: Ae\.summer\s*\}, \{\s*label: "秋季",\s*icon: Ae\.fall\s*\}, \{\s*label: "冬季",\s*icon: Ae\.winter\s*\}\];/;

  const elegantSeasons = `/* qr-tree-studio-elegant-season-icons */
var Ne = [{
  label: "春季",
  icon: <Flower2 size={18} strokeWidth={1.65} aria-hidden={true} />
}, {
  label: "夏季",
  icon: <Sun size={18} strokeWidth={1.65} aria-hidden={true} />
}, {
  label: "秋季",
  icon: <Leaf size={18} strokeWidth={1.65} aria-hidden={true} />
}, {
  label: "冬季",
  icon: <Snowflake size={18} strokeWidth={1.65} aria-hidden={true} />
}];`;

  if (!seasonPattern.test(source)) {
    throw new Error('Unable to replace the seasonal icon set safely.');
  }
  source = source.replace(seasonPattern, elegantSeasons);
}

// Make theme selection visible to the renderer immediately, then let React state
// drive persistence, audio, URL state, and the rest of the UI.
replaceOnce(
  'onClick={() => _0x49fe52(_0x1786c)}',
  'onClick={() => { _0x3129c7.current = _0x1786c; _0x49fe52(_0x1786c); }}',
  'immediate season switching'
);

// Keep one logo only: a 4:3 landscape mark at the top-left, using the same asset
// in every season. objectFit "fill" applies the slight stretch requested.
if (!source.includes('data-qr-brand-logo="true"')) {
  const topLogoPattern =
    /<a href="[^"]*" target="_blank" rel="noopener noreferrer" aria-label="[^"]*" style=\{\{\s*\.\.\.Te\.topLogoLink,[\s\S]*?<\/a>/;

  const topLogo = `<a data-qr-brand-logo="true" href="https://arnavbule.in" target="_blank" rel="noopener noreferrer" aria-label="Arnav Bule portfolio" title="Arnav Bule portfolio" style={{
        ...Te.topLogoLink,
        left: "max(14px, env(safe-area-inset-left, 0px))",
        transform: "none",
        width: "clamp(80px, 6vw, 96px)",
        height: "clamp(60px, 4.5vw, 72px)",
        padding: 0,
        borderRadius: 10,
        overflow: "hidden"
      }}><img src="${logoDataUri}" alt="Arnav Bule" draggable={false} style={{
        width: "100%",
        height: "100%",
        objectFit: "fill",
        display: "block",
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,.18))"
      }} /></a>`;

  if (!topLogoPattern.test(source)) {
    throw new Error('Unable to replace the top-left logo safely.');
  }
  source = source.replace(topLogoPattern, topLogo);
}

// Restore the original repo's elegant information control at the top-right.
// There are no duplicate logo, light-mode, dark-mode, sun, moon, or emoji buttons.
if (!source.includes('data-qr-help-button="true"')) {
  const creditsPattern =
    /<div ref=\{_0x4efbdf\} style=\{Te\.creditsHintWrap\}>[\s\S]*?<button type="button" aria-label="查看项目说明与开源信息"[\s\S]*?\{Ae\.info\}<\/button><\/div>/;

  const helpControl = `<div ref={_0x4efbdf} style={Te.creditsHintWrap}>{_0x2b80c3 && <div style={Te.creditsHintTooltip}><div style={Te.creditsHintArrow} /><div style={Te.creditsHintCard}><div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: "#3f3328" }}>QR Tree Studio</div><div style={{ color: "#6e5d4e", marginBottom: 6 }}>Click the tree for a top-down scannable QR code.<br />Spring · Summer · Autumn · Winter</div><div style={{ borderTop: "1px solid rgba(158, 142, 121, 0.22)", paddingTop: 6 }}><a href="https://github.com/GODOSTROYER/qr-tree-studio" target="_blank" rel="noopener noreferrer" style={Te.creditsHintLink}>View source on GitHub</a></div></div></div>}<button data-qr-help-button="true" type="button" aria-label="About QR Tree Studio" title="About QR Tree Studio" onClick={() => _0x23dd65(_0x3b08aa => !_0x3b08aa)} style={Te.creditsHintButton}>{Ae.info}</button></div>`;

  if (!creditsPattern.test(source)) {
    throw new Error('Unable to restore the top-right information control safely.');
  }
  source = source.replace(creditsPattern, helpControl);
}

const translations = new Map([
  ['默认', 'Default'],
  ['薰衣草紫', 'Lavender'],
  ['珊瑚红', 'Coral Red'],
  ['樱花粉', 'Blossom Pink'],
  ['薄荷绿', 'Mint'],
  ['海洋蓝', 'Ocean Blue'],
  ['金色', 'Gold'],
  ['春季', 'Spring'],
  ['夏季', 'Summer'],
  ['秋季', 'Autumn'],
  ['冬季', 'Winter'],
  ['季节选择器', 'Season selector'],
  ['点击查看3D树', 'View 3D tree'],
  ['点击树木查看扫码二维码', 'Click the tree to view the QR code'],
  ['当前浏览器不支持 WebGPU', 'This browser does not support WebGPU'],
  ['本程序需要 WebGPU 支持。推荐使用最新版 Chrome、Edge 或其他支持 WebGPU 的现代浏览器。', 'This experience requires WebGPU. Use a current version of Chrome, Edge, or another modern WebGPU-capable browser.'],
  ['3D 艺术二维码生成器', 'QR Tree Studio'],
  ['3D艺术二维码生成器', 'QR Tree Studio'],
  ['将任意网址、文本或内容转化为精美的3D体素艺术魔法树，同时支持真实扫码识别。', 'Turn a URL or text into a scannable 3D voxel QR tree.'],
  ['支持春季 · 夏季 · 秋季 · 冬季', 'Spring · Summer · Autumn · Winter'],
  ['点击树木可俯视查看扫码二维码', 'Click the tree for a top-down scannable QR code'],
  ['二维码', 'QR code'],
  ['生成', 'Generate'],
  ['复制', 'Copy'],
  ['分享', 'Share'],
  ['下载', 'Download'],
  ['上传', 'Upload'],
  ['静音', 'Mute'],
  ['取消静音', 'Unmute'],
  ['链接', 'Link'],
  ['文本', 'Text'],
  ['颜色', 'Color'],
  ['扫码', 'Scan'],
  ['查看', 'View'],
  ['关闭', 'Close'],
  ['重置', 'Reset']
]);

for (const [from, to] of translations) {
  source = source.split(from).join(to);
}

source = source
  .split('https://github.com/xscanzm/magic-tree-qr').join('https://github.com/GODOSTROYER/qr-tree-studio')
  .split('github.com/xscanzm/magic-tree-qr').join('github.com/GODOSTROYER/qr-tree-studio')
  .split('xscanzm').join('Arnav Bule')
  .split('https://ppweilai.online/').join('https://arnavbule.in/')
  .split('ppweilai.online').join('arnavbule.in');

// Keep the shipped interface English-only without changing rendering code.
source = source.replace(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+/g, '');

const forbiddenFragments = [
  '_qrBgMode',
  'Light background',
  'Dark background',
  '☀️',
  '🌙',
  'xscanzm',
  'ppweilai.online'
];

for (const fragment of forbiddenFragments) {
  if (source.includes(fragment)) {
    throw new Error(`Unwanted legacy/adaptive-theme fragment remains: ${fragment}`);
  }
}

if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(source)) {
  throw new Error('Chinese characters remain after the UI patch.');
}
if (!source.includes('qr-tree-studio-elegant-season-icons')) {
  throw new Error('Elegant season icons were not applied.');
}
if (!source.includes('data-qr-brand-logo="true"')) {
  throw new Error('Top-left portfolio logo was not applied.');
}
if (!source.includes('data-qr-help-button="true"') || !source.includes('{Ae.info}')) {
  throw new Error('Original-style information control was not restored.');
}
if (!source.includes('_0x153546 !== 3')) {
  throw new Error('Spring/Winter palette support was not applied.');
}
if (!source.includes('_0x469151.key <= "4"')) {
  throw new Error('All four themes are not keyboard-accessible.');
}

fs.writeFileSync(appFile, source);
console.log('Applied the single top-left portfolio logo, Lucide season icons, original help control, and restored seasonal rendering.');
