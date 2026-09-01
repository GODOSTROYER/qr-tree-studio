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
// must forward the selected RGB value to the renderer. Idempotent for Vercel cache restores.
source = source.replace(
  'if (_0x2d9aad <= 0 || _0x153546 !== 0) {',
  'if (_0x2d9aad <= 0 || (_0x153546 !== 0 && _0x153546 !== 3)) {'
);

// Normalize old URLs before replacing the UI blocks.
source = source
  .split('https://ppweilai.online/assets/logo.png').join(logoDataUri)
  .split('https://arnavbule.in/assets/logo.png').join(logoDataUri)
  .split('src="/arnav-bule-logo.svg"').join(`src="${logoDataUri}"`)
  .split('src="https://www.arnavbule.me/mypic.jpeg"').join(`src="${logoDataUri}"`)
  .split('aria-label="访问主页"').join('aria-label="Arnav Bule portfolio"');

// Theme override state. Automatic complementary mode is the default.
if (!source.includes('const [_qrBgMode, _setQrBgMode]')) {
  source = source.replace(
    'const [_0x2b80c3, _0x23dd65] = (0, m.useState)(false);',
    'const [_0x2b80c3, _0x23dd65] = (0, m.useState)(false);\n  const [_qrBgMode, _setQrBgMode] = (0, m.useState)("auto");'
  );
}

// Derive a representative tree color, then invert RGB for a true complementary
// automatic backdrop. White becomes black, dark colors become light, and colored
// trees receive their inverse hue. Manual sun/moon overrides remain available.
if (!source.includes('const _qrTreeLuminance')) {
  const paletteBlock = `  if (_0x2d9aad <= 0 || (_0x153546 !== 0 && _0x153546 !== 3)) {
    _0x5bd40a.current = [0, 0, 0, 0];
  } else {
    const _0x4d37f5 = Me[_0x2d9aad];
    _0x5bd40a.current = [_0x4d37f5.rgb[0], _0x4d37f5.rgb[1], _0x4d37f5.rgb[2], 1];
  }`;
  const adaptiveTheme = `${paletteBlock}
  const _qrSeasonColors = [[0.91, 0.63, 0.69], [0.18, 0.48, 0.25], [0.96, 0.62, 0.24], [0.96, 0.97, 0.99]];
  const _qrTreeRgb = _0x2d9aad > 0 && (_0x153546 === 0 || _0x153546 === 3) ? Me[_0x2d9aad].rgb : _qrSeasonColors[_0x153546] || [0.5, 0.5, 0.5];
  const _qrTreeLuminance = 0.2126 * _qrTreeRgb[0] + 0.7152 * _qrTreeRgb[1] + 0.0722 * _qrTreeRgb[2];
  const _qrComplementRgb = _qrTreeRgb.map(_qrChannel => Math.round((1 - _qrChannel) * 255));
  const _qrAutoBackground = \`rgb(\${_qrComplementRgb[0]}, \${_qrComplementRgb[1]}, \${_qrComplementRgb[2]})\`;
  const _qrBackground = _qrBgMode === "light" ? "#f7f3ea" : _qrBgMode === "dark" ? "#0d0e10" : _qrAutoBackground;
  const _qrBackgroundLuminance = _qrBgMode === "light" ? 0.95 : _qrBgMode === "dark" ? 0.05 : 1 - _qrTreeLuminance;
  const _qrForeground = _qrBackgroundLuminance < 0.48 ? "#ffffff" : "#161616";`;
  source = source.replace(paletteBlock, adaptiveTheme);
}

// Remove the old top-left logo entirely. Branding belongs in the top-right cluster.
const topLogoPattern = /<a href="[^"]*" target="_blank" rel="noopener noreferrer" aria-label="[^"]*" style=\{\{\s*\.\.\.Te\.topLogoLink,[\s\S]*?<\/a>/;
source = source.replace(topLogoPattern, '');

// Replace either the pristine credits UI or a previously cached branded control.
const originalCreditsPattern = /<div ref=\{_0x4efbdf\} style=\{Te\.creditsHintWrap\}>[\s\S]*?<button type="button" aria-label="查看项目说明与开源信息"[\s\S]*?\{Ae\.info\}<\/button><\/div>/;
const cachedBrandPattern = /<div ref=\{_0x4efbdf\} style=\{Te\.creditsHintWrap\}><a href="https:\/\/arnavbule\.in"[\s\S]*?<\/a><\/div>/;
const controls = `<div ref={_0x4efbdf} style={{...Te.creditsHintWrap,gap:8,alignItems:"center"}}>
  <a href="https://arnavbule.in" target="_blank" rel="noopener noreferrer" aria-label="Arnav Bule portfolio" title="Arnav Bule portfolio" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:78,height:42,padding:0,border:"none",background:"transparent",textDecoration:"none"}}>
    <img src="${logoDataUri}" alt="Arnav Bule" style={{width:"100%",height:"100%",objectFit:"contain",display:"block",filter:"brightness(0)"}} />
  </a>
  <button type="button" aria-label="About QR Tree Studio" title="About QR Tree Studio" onClick={() => _0x23dd65(_qrOpen => !_qrOpen)} style={{width:36,height:36,borderRadius:10,border:"1px solid rgba(127,127,127,.24)",background:_qrBackgroundLuminance < .48 ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.7)",color:_qrForeground,fontSize:18,fontWeight:800,cursor:"pointer",backdropFilter:"blur(10px)"}}>?</button>
  <button type="button" aria-label="Light background" title={_qrBgMode === "light" ? "Return to automatic complementary background" : "Use light background"} onClick={() => _setQrBgMode(_qrBgMode === "light" ? "auto" : "light")} style={{width:36,height:36,borderRadius:10,border:_qrBgMode === "light" ? "2px solid currentColor" : "1px solid rgba(127,127,127,.24)",background:_qrBackgroundLuminance < .48 ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.7)",color:_qrForeground,fontSize:17,cursor:"pointer",backdropFilter:"blur(10px)"}}>☀️</button>
  <button type="button" aria-label="Dark background" title={_qrBgMode === "dark" ? "Return to automatic complementary background" : "Use dark background"} onClick={() => _setQrBgMode(_qrBgMode === "dark" ? "auto" : "dark")} style={{width:36,height:36,borderRadius:10,border:_qrBgMode === "dark" ? "2px solid currentColor" : "1px solid rgba(127,127,127,.24)",background:_qrBackgroundLuminance < .48 ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.7)",color:_qrForeground,fontSize:17,cursor:"pointer",backdropFilter:"blur(10px)"}}>🌙</button>
  {_0x2b80c3 && <div style={{...Te.creditsHintTooltip,right:0,left:"auto",width:280}}><div style={Te.creditsHintArrow} /><div style={{...Te.creditsHintCard,textAlign:"left"}}><div style={{fontWeight:800,fontSize:13,marginBottom:6,color:"#2b251f"}}>QR Tree Studio</div><div style={{color:"#62574c",lineHeight:1.45,marginBottom:8}}>Create scannable 3D voxel QR trees with seasonal scenes, palette controls, top-down QR viewing, sharing, and adaptive complementary backgrounds.</div><div style={{borderTop:"1px solid rgba(120,110,95,.18)",paddingTop:8}}><a href="https://github.com/GODOSTROYER/qr-tree-studio" target="_blank" rel="noopener noreferrer" style={{...Te.creditsHintLink,fontWeight:700}}>View source on GitHub ↗</a></div></div></div>}
</div>`;
source = source.replace(originalCreditsPattern, controls);
source = source.replace(cachedBrandPattern, controls);

// Apply the adaptive color to both the DOM background and the WebGPU canvas surface.
source = source.replace('return <div style={Te.container}><div style={Te.canvasWrapper}>', 'return <div style={{...Te.container,backgroundColor:_qrBackground,color:_qrForeground,transition:"background-color .45s ease"}}><div style={Te.canvasWrapper}>');
source = source.replace('...Te.canvas,\n          width: "100%",', '...Te.canvas,\n          backgroundColor: _qrBackground,\n          transition: "background-color .45s ease",\n          width: "100%",');

const translations = new Map([
  ['默认', 'Default'], ['薰衣草紫', 'Lavender'], ['珊瑚红', 'Coral Red'], ['樱花粉', 'Blossom Pink'],
  ['薄荷绿', 'Mint'], ['海洋蓝', 'Ocean Blue'], ['金色', 'Gold'], ['春季', 'Spring'], ['夏季', 'Summer'],
  ['秋季', 'Autumn'], ['冬季', 'Winter'], ['点击查看3D树', 'View 3D tree'], ['点击树木查看扫码二维码', 'Click the tree to view the QR code'],
  ['当前浏览器不支持 WebGPU', 'This browser does not support WebGPU'],
  ['本程序需要 WebGPU 支持。推荐使用最新版 Chrome、Edge 或其他支持 WebGPU 的现代浏览器。', 'This experience requires WebGPU. Use a current version of Chrome, Edge, or another modern WebGPU-capable browser.'],
  ['3D 艺术二维码生成器', 'QR Tree Studio'], ['3D艺术二维码生成器', 'QR Tree Studio'],
  ['将任意网址、文本或内容转化为精美的3D体素艺术魔法树，同时支持真实扫码识别。', 'Turn a URL or text into a scannable 3D voxel QR tree.'],
  ['支持春季 · 夏季 · 秋季 · 冬季', 'Spring · Summer · Autumn · Winter'], ['点击树木可俯视查看扫码二维码', 'Click the tree for a top-down scannable QR code'],
  ['二维码', 'QR code'], ['生成', 'Generate'], ['复制', 'Copy'], ['分享', 'Share'], ['下载', 'Download'], ['上传', 'Upload'],
  ['静音', 'Mute'], ['取消静音', 'Unmute'], ['链接', 'Link'], ['文本', 'Text'], ['颜色', 'Color'], ['扫码', 'Scan'], ['查看', 'View'], ['关闭', 'Close'], ['重置', 'Reset']
]);
for (const [from, to] of translations) source = source.split(from).join(to);

source = source
  .split('https://github.com/xscanzm/magic-tree-qr').join('https://github.com/GODOSTROYER/qr-tree-studio')
  .split('github.com/xscanzm/magic-tree-qr').join('github.com/GODOSTROYER/qr-tree-studio')
  .split('xscanzm').join('Arnav Bule')
  .split('https://ppweilai.online/').join('https://arnavbule.in/')
  .split('ppweilai.online').join('arnavbule.in');

source = source.replace(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+/g, '');

if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(source)) throw new Error('Chinese characters remain after branding patch.');
if (source.includes('xscanzm') || source.includes('ppweilai.online')) throw new Error('Legacy creator branding remains after patch.');
if (!source.includes('_0x153546 !== 3')) throw new Error('Palette support patch was not applied.');
if (!source.includes('const _qrTreeLuminance')) throw new Error('Adaptive complementary theme logic was not applied.');
if (!source.includes('brightness(0)')) throw new Error('Black portfolio logo styling was not applied.');
if (!source.includes('github.com/GODOSTROYER/qr-tree-studio')) throw new Error('Project GitHub link was not applied.');

fs.writeFileSync(file, source);
console.log('Applied adaptive complementary theme, top-right utility controls, black logo, and project info panel.');
