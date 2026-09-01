import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('node_modules/magic-tree-qr-upstream/src/main.jsx');
const logoSource = path.resolve('assets/arnav-bule-logo.svg');

if (!fs.existsSync(file)) {
  throw new Error(`Application source not found after dependency install: ${file}`);
}
if (!fs.existsSync(logoSource)) {
  throw new Error(`Brand logo source not found: ${logoSource}`);
}

const logoSvg = fs.readFileSync(logoSource, 'utf8');
const logoDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;

let source = fs.readFileSync(file, 'utf8');

// Custom palettes are exposed for Spring (0) and Winter (3), so both seasons
// must forward the selected RGB value to the renderer.
source = source.replace(
  'if (_0x2d9aad <= 0 || _0x153546 !== 0) {',
  'if (_0x2d9aad <= 0 || (_0x153546 !== 0 && _0x153546 !== 3)) {'
);

// Make the top-left home logo self-contained and link it to Arnav's portfolio.
source = source
  .split('https://ppweilai.online/assets/logo.png').join(logoDataUri)
  .split('aria-label="访问主页"').join('aria-label="Arnav Bule portfolio"');

// Replace the old credits/GitHub control with Arnav's embedded portfolio brand logo.
const creditsPattern = /<div ref=\{_0x4efbdf\} style=\{Te\.creditsHintWrap\}>[\s\S]*?<button type="button" aria-label="查看项目说明与开源信息"[\s\S]*?\{Ae\.info\}<\/button><\/div>/;
const brandControl = `<div ref={_0x4efbdf} style={Te.creditsHintWrap}><a href="https://arnavbule.in" target="_blank" rel="noopener noreferrer" aria-label="Arnav Bule portfolio" title="Arnav Bule" style={{...Te.githubButton,overflow:"hidden",padding:3,display:"flex",alignItems:"center",justifyContent:"center"}}><img src="${logoDataUri}" alt="Arnav Bule" style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}} /></a></div>`;
source = source.replace(creditsPattern, brandControl);

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

// Remove legacy creator/project identifiers from anything user-visible or bundled.
source = source
  .split('https://github.com/xscanzm/magic-tree-qr').join('https://arnavbule.in')
  .split('github.com/xscanzm/magic-tree-qr').join('arnavbule.in')
  .split('xscanzm').join('Arnav Bule')
  .split('https://ppweilai.online/').join('https://arnavbule.in/')
  .split('ppweilai.online').join('arnavbule.in');

// Guarantee no Han characters remain in the shipped application source.
source = source.replace(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+/g, '');

if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(source)) {
  throw new Error('Chinese characters remain after branding patch.');
}
if (source.includes('xscanzm') || source.includes('ppweilai.online')) {
  throw new Error('Legacy creator branding remains after patch.');
}
if (!source.includes('_0x153546 !== 3')) {
  throw new Error('Palette support patch was not applied.');
}
if (!source.includes('data:image/svg+xml;charset=utf-8,')) {
  throw new Error('Embedded brand logo was not applied.');
}

fs.writeFileSync(file, source);
console.log('Applied QR Tree Studio palette, English UI, and embedded portfolio branding patches.');
