import fs from 'node:fs';
import path from 'node:path';

const appFile = path.resolve('node_modules/qr-tree-engine/src/main.jsx');

if (!fs.existsSync(appFile)) {
  throw new Error(`QR Tree engine source not found after dependency install: ${appFile}`);
}

let source = fs.readFileSync(appFile, 'utf8');

function replaceOnce(before, after, label) {
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Unable to apply ${label}; expected source fragment was not found.`);
  }
  source = source.replace(before, after);
}

function replacePattern(pattern, after, label, appliedMarker) {
  if (appliedMarker && source.includes(appliedMarker)) return;
  if (!pattern.test(source)) {
    throw new Error(`Unable to apply ${label}; expected source pattern was not found.`);
  }
  source = source.replace(pattern, after);
}

// Theme choice is explicitly manual. A stored choice is respected, otherwise
// the interface starts in the calm light theme without inspecting the tree.
replacePattern(
  /  \/\* qr-tree-studio-adaptive-theme-state \*\/[\s\S]*?  const _qrThemeAnimationRef = \(0, m\.useRef\)\(0\);/,
  `  /* qr-tree-studio-adaptive-theme-state qr-tree-studio-manual-theme-state */
  const [_qrThemeMode, _setQrThemeMode] = (0, m.useState)(() => {
    try {
      return localStorage.getItem("qr-tree-theme-mode") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const _qrThemeMixRef = (0, m.useRef)(null);
  const _qrThemeAnimationRef = (0, m.useRef)(0);`,
  'manual theme state',
  'qr-tree-studio-manual-theme-state'
);

// Keep the brightness estimate only for a rare, advisory contrast hint. It
// never changes the selected theme. Winter's baseline is a frosted pine green,
// matching the corrected renderer instead of the former near-white estimate.
replacePattern(
  /  \/\* qr-tree-studio-adaptive-theme-values \*\/[\s\S]*?  const _qrThemeVars = _qrResolvedTheme === "dark" \? \{/,
  `  /* qr-tree-studio-adaptive-theme-values qr-tree-studio-manual-theme-values */
  const _qrSeasonTreeColors = [
    [0.91, 0.63, 0.69],
    [0.15, 0.38, 0.12],
    [0.94, 0.58, 0.17],
    [0.19, 0.36, 0.29]
  ];
  const _qrTreeColor = _0x2d9aad > 0 && (_0x153546 === 0 || _0x153546 === 3) && Me[_0x2d9aad]
    ? Me[_0x2d9aad].rgb
    : _qrSeasonTreeColors[_0x153546] || _qrSeasonTreeColors[1];
  const _qrResolvedTheme = _qrThemeMode;
  const _qrThemeTarget = _qrResolvedTheme === "dark" ? 1 : 0;
  if (_qrThemeMixRef.current === null) {
    _qrThemeMixRef.current = _qrThemeTarget;
  }
  const _qrLightBackgrounds = ["#f6f1e7", "#f1f3e9", "#f6efe5", "#e5ebf1"];
  const _qrDarkBackgrounds = ["#15131b", "#0d1813", "#1b140e", "#0e1723"];
  const _qrLightBackgroundRgb = [
    [0.965, 0.945, 0.906],
    [0.945, 0.955, 0.91],
    [0.965, 0.94, 0.9],
    [0.88, 0.91, 0.94]
  ];
  const _qrDarkBackgroundRgb = [
    [0.065, 0.055, 0.085],
    [0.035, 0.075, 0.055],
    [0.085, 0.055, 0.035],
    [0.035, 0.065, 0.105]
  ];
  const _qrLinearChannel = _qrChannel => _qrChannel <= 0.04045
    ? _qrChannel / 12.92
    : ((_qrChannel + 0.055) / 1.055) ** 2.4;
  const _qrRelativeLuminance = _qrColor =>
    0.2126 * _qrLinearChannel(_qrColor[0]) +
    0.7152 * _qrLinearChannel(_qrColor[1]) +
    0.0722 * _qrLinearChannel(_qrColor[2]);
  const _qrContrastRatio = (_qrFirst, _qrSecond) => {
    const _qrLighter = Math.max(_qrFirst, _qrSecond);
    const _qrDarker = Math.min(_qrFirst, _qrSecond);
    return (_qrLighter + 0.05) / (_qrDarker + 0.05);
  };
  const _qrTreeLuminance = _qrRelativeLuminance(_qrTreeColor);
  const _qrLightBackground = _qrLightBackgroundRgb[_0x153546] || _qrLightBackgroundRgb[1];
  const _qrDarkBackground = _qrDarkBackgroundRgb[_0x153546] || _qrDarkBackgroundRgb[1];
  const _qrCurrentBackground = _qrResolvedTheme === "dark" ? _qrDarkBackground : _qrLightBackground;
  const _qrAlternativeBackground = _qrResolvedTheme === "dark" ? _qrLightBackground : _qrDarkBackground;
  const _qrCurrentContrast = _qrContrastRatio(_qrTreeLuminance, _qrRelativeLuminance(_qrCurrentBackground));
  const _qrAlternativeContrast = _qrContrastRatio(_qrTreeLuminance, _qrRelativeLuminance(_qrAlternativeBackground));
  const _qrRecommendedTheme = _qrResolvedTheme === "dark" ? "light" : "dark";
  const _qrShouldSuggestTheme = _qrCurrentContrast < 1.72 && _qrAlternativeContrast > _qrCurrentContrast + 0.45;
  const _qrThemeVars = _qrResolvedTheme === "dark" ? {`,
  'manual theme values and contrast advisory',
  'qr-tree-studio-manual-theme-values'
);

replaceOnce(
  'sessionStorage.setItem("qr-tree-theme-mode", _qrThemeMode);',
  'localStorage.setItem("qr-tree-theme-mode", _qrThemeMode);',
  'persistent manual theme preference'
);

replaceOnce(
  '    "--qr-control-shadow": "0 8px 24px rgba(0, 0, 0, 0.2)"',
  '    "--qr-control-shadow": "0 8px 24px rgba(0, 0, 0, 0.2)",\n    "--qr-brand-filter": "brightness(0) invert(1)"',
  'dark-theme solid white logo'
);
replaceOnce(
  '    "--qr-control-shadow": "0 7px 20px rgba(80, 60, 30, 0.1)"',
  '    "--qr-control-shadow": "0 7px 20px rgba(80, 60, 30, 0.1)",\n    "--qr-brand-filter": "brightness(0)"',
  'light-theme solid black logo'
);

// Make the portfolio mark quiet, correctly proportioned, and monochrome.
replaceOnce(
  `        width: "clamp(80px, 6vw, 96px)",
        height: "clamp(60px, 4.5vw, 72px)",
        padding: 0,
        borderRadius: 10,
        overflow: "hidden"`,
  `        width: "clamp(42px, 3.1vw, 54px)",
        height: "clamp(28px, 2.07vw, 36px)",
        padding: 0,
        borderRadius: 0,
        overflow: "visible",
        opacity: 0.84,
        transition: "opacity 220ms ease, transform 220ms ease"`,
  'subtle top-left logo sizing'
);
replaceOnce(
  `        objectFit: "fill",
        display: "block",
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,.18))"`,
  `        objectFit: "contain",
        display: "block",
        filter: "var(--qr-brand-filter)",
        transition: "filter 650ms ease"`,
  'theme-aware monochrome logo treatment'
);

// Winter should read as an evergreen tree with selective frost, not a white
// silhouette. Custom Winter colors remain visible beneath a restrained snow cap.
replaceOnce(
  '        let winterSnow = mix(vec3f(0.88, 0.94, 0.99), vec3f(0.98, 0.99, 1.00), noise1);\\n        albedo = winterSnow * shade * tint * canopyAO * edgeDarken;',
  '        let winterPine = mix(vec3f(0.10, 0.22, 0.18), vec3f(0.26, 0.43, 0.36), noise1);\\n        let winterSnow = mix(vec3f(0.78, 0.86, 0.91), vec3f(0.91, 0.95, 0.97), noise2);\\n        let snowMask = smoothstep(0.70, 0.98, noise2);\\n        var winterCanopy = mix(winterPine, winterSnow, snowMask * 0.46);\\n        if (customStr > 0.01) {\\n          let customWinterDark = vec3f(uniforms.customR, uniforms.customG, uniforms.customB) * 0.72;\\n          let customWinterLight = vec3f(uniforms.customR, uniforms.customG, uniforms.customB) * 1.04;\\n          let customWinter = mix(customWinterDark, customWinterLight, noise1);\\n          winterCanopy = mix(customWinter, winterSnow, snowMask * 0.24);\\n        }\\n        albedo = winterCanopy * shade * tint * canopyAO * edgeDarken;',
  'balanced Winter canopy color'
);
replaceOnce(
  '      let snowCol = vec3f(0.93, 0.95, 0.98);\\n      baseColor = mix(baseColor, snowCol, snowCap * 0.82);\\n      // Frost rim on leaf edge\\n      baseColor = mix(baseColor, vec3f(0.86, 0.92, 0.98), t * 0.35);',
  '      let snowCol = vec3f(0.80, 0.87, 0.91);\\n      baseColor = mix(baseColor, snowCol, snowCap * 0.42);\\n      // Frost rim on leaf edge\\n      baseColor = mix(baseColor, vec3f(0.76, 0.84, 0.89), t * 0.16);',
  'restrained Winter leaf frost'
);
replaceOnce(
  '              backgroundColor: _0x13972f.color',
  '              backgroundColor: _0x33296b === 0 && _0x153546 === 3 ? "#31594d" : _0x13972f.color',
  'accurate Winter default swatch'
);

// Replace the automatic control with one direct manual toggle. The compact
// advisory appears only at exceptionally low contrast and switches themes only
// when the user explicitly chooses it.
if (!source.includes('data-qr-manual-theme="true"')) {
  const utilityPattern = /<div data-qr-utility-cluster="true"[\s\S]*?<button data-qr-help-button="true"[\s\S]*?\{Ae\.info\}<\/button>\s*<\/div>/;
  const sunMoonIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}><path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.3 17.7-1.4 1.4" /><path d="m19.1 4.9-1.4 1.4" /></svg>';
  const utilityCluster = `<div data-qr-utility-cluster="true" data-qr-manual-theme="true" ref={_0x4efbdf} style={{...Te.creditsHintWrap,height:34,gap:7,alignItems:"center"}}>
  {_qrShouldSuggestTheme && !_0x2b80c3 && <button data-qr-contrast-hint="true" type="button" onClick={() => _setQrThemeMode(_qrRecommendedTheme)} aria-label={"Use " + _qrRecommendedTheme + " theme for clearer contrast"} title={"Use " + _qrRecommendedTheme + " theme for clearer contrast"} style={{height:30,maxWidth:_0x1bb750.isMobile?138:220,padding:"0 10px",display:"inline-flex",alignItems:"center",gap:7,borderRadius:999,border:"1px solid var(--qr-border)",background:"var(--qr-glass-soft)",color:"var(--qr-muted-strong)",boxShadow:"var(--qr-control-shadow)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",fontSize:11,fontWeight:650,letterSpacing:"0.01em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:"pointer",animation:"qrContrastHintIn 420ms cubic-bezier(.22,1,.36,1) both"}}><span aria-hidden={true} style={{width:5,height:5,borderRadius:"50%",background:"var(--qr-accent)",flex:"0 0 auto",opacity:.82}} /><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{_0x1bb750.isMobile ? "Try " + _qrRecommendedTheme + " theme" : "Try " + _qrRecommendedTheme + " theme for clearer contrast"}</span></button>}
  <button data-qr-theme-toggle="true" type="button" aria-pressed={_qrResolvedTheme === "dark"} aria-label={"Switch to " + (_qrResolvedTheme === "dark" ? "light" : "dark") + " theme"} title={"Switch to " + (_qrResolvedTheme === "dark" ? "light" : "dark") + " theme"} onClick={() => _setQrThemeMode(_qrMode => _qrMode === "dark" ? "light" : "dark")} style={{...Te.creditsHintButton,width:32,height:32,position:"relative",border:"1px solid var(--qr-border)",background:"var(--qr-control)",color:"var(--qr-muted-strong)",boxShadow:"var(--qr-control-shadow)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",transition:"background-color 650ms ease, border-color 650ms ease, color 450ms ease, box-shadow 650ms ease, transform 180ms ease"}}><span aria-hidden={true} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",transform:"rotate(" + (_qrThemeTarget * 180) + "deg)",transition:"transform 900ms cubic-bezier(.22, 1, .36, 1)"}}>${sunMoonIcon}</span></button>
  {_0x2b80c3 && <div style={Te.creditsHintTooltip}><div style={Te.creditsHintArrow} /><div style={Te.creditsHintCard}><div style={{fontWeight:700,fontSize:12,marginBottom:5,color:"var(--qr-fg)"}}>QR Tree Studio</div><div style={{color:"var(--qr-muted)",marginBottom:7}}>Click the tree for a top-down scannable QR code.<br />Choose light or dark from the adjacent control.</div><div style={{borderTop:"1px solid var(--qr-border)",paddingTop:7}}><a href="https://github.com/GODOSTROYER/qr-tree-studio" target="_blank" rel="noopener noreferrer" style={Te.creditsHintLink}>View source on GitHub</a></div></div></div>}
  <button data-qr-help-button="true" type="button" aria-label="About QR Tree Studio" title="About QR Tree Studio" onClick={() => _0x23dd65(_0x3b08aa => !_0x3b08aa)} style={{...Te.creditsHintButton,width:32,height:32,border:"1px solid var(--qr-border)",background:"var(--qr-control)",color:"var(--qr-muted-strong)",boxShadow:"var(--qr-control-shadow)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",transition:"background-color 650ms ease, border-color 650ms ease, color 450ms ease, box-shadow 650ms ease, transform 180ms ease"}}>{Ae.info}</button>
</div>`;

  if (!utilityPattern.test(source)) {
    throw new Error('Unable to replace the automatic theme utility with the manual control.');
  }
  source = source.replace(utilityPattern, utilityCluster);
}

const requiredFragments = [
  'qr-tree-studio-manual-theme-state',
  'qr-tree-studio-manual-theme-values',
  'data-qr-manual-theme="true"',
  'data-qr-contrast-hint="true"',
  'localStorage.setItem("qr-tree-theme-mode"',
  'filter: "var(--qr-brand-filter)"',
  'let winterPine = mix',
  'snowCap * 0.42',
  '_qrShouldSuggestTheme',
  '_qrMode === "dark" ? "light" : "dark"'
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Required manual-theme refinement was not applied: ${fragment}`);
  }
}

for (const fragment of ['_qrAutoTheme', 'Automatic theme', 'cycle automatic']) {
  if (source.includes(fragment)) {
    throw new Error(`Automatic theme behavior remains after manual refinement: ${fragment}`);
  }
}

fs.writeFileSync(appFile, source);
console.log('Applied manual light/dark themes, corrected Winter color, subtle monochrome branding, and a low-contrast advisory.');
