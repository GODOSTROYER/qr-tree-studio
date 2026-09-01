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

// Automatic is the default. The one combined theme control can temporarily
// override it for the current tab without creating separate sun/moon buttons.
if (!source.includes('qr-tree-studio-adaptive-theme-state')) {
  replaceOnce(
    '  const [_0x2b80c3, _0x23dd65] = (0, m.useState)(false);',
    `  const [_0x2b80c3, _0x23dd65] = (0, m.useState)(false);
  /* qr-tree-studio-adaptive-theme-state */
  const [_qrThemeMode, _setQrThemeMode] = (0, m.useState)(() => {
    try {
      const _qrStoredThemeMode = sessionStorage.getItem("qr-tree-theme-mode");
      return _qrStoredThemeMode === "light" || _qrStoredThemeMode === "dark" ? _qrStoredThemeMode : "auto";
    } catch {
      return "auto";
    }
  });
  const _qrThemeMixRef = (0, m.useRef)(null);
  const _qrThemeAnimationRef = (0, m.useRef)(0);`,
    'adaptive theme state'
  );
}

const paletteBlock = `  if (_0x2d9aad <= 0 || (_0x153546 !== 0 && _0x153546 !== 3)) {
    _0x5bd40a.current = [0, 0, 0, 0];
  } else {
    const _0x4d37f5 = Me[_0x2d9aad];
    _0x5bd40a.current = [_0x4d37f5.rgb[0], _0x4d37f5.rgb[1], _0x4d37f5.rgb[2], 1];
  }`;

if (!source.includes('qr-tree-studio-adaptive-theme-values')) {
  const adaptiveThemeValues = `${paletteBlock}
  /* qr-tree-studio-adaptive-theme-values */
  const _qrSeasonTreeColors = [
    [0.91, 0.63, 0.69],
    [0.15, 0.38, 0.12],
    [0.94, 0.58, 0.17],
    [0.94, 0.97, 1]
  ];
  const _qrTreeColor = _0x2d9aad > 0 && (_0x153546 === 0 || _0x153546 === 3) && Me[_0x2d9aad]
    ? Me[_0x2d9aad].rgb
    : _qrSeasonTreeColors[_0x153546] || _qrSeasonTreeColors[1];
  const _qrTreeBrightness = Math.sqrt(
    0.299 * _qrTreeColor[0] * _qrTreeColor[0] +
    0.587 * _qrTreeColor[1] * _qrTreeColor[1] +
    0.114 * _qrTreeColor[2] * _qrTreeColor[2]
  );
  const _qrAutoTheme = _qrTreeBrightness >= 0.56 ? "dark" : "light";
  const _qrResolvedTheme = _qrThemeMode === "auto" ? _qrAutoTheme : _qrThemeMode;
  const _qrThemeTarget = _qrResolvedTheme === "dark" ? 1 : 0;
  if (_qrThemeMixRef.current === null) {
    _qrThemeMixRef.current = _qrThemeTarget;
  }
  const _qrLightBackgrounds = ["#f6f1e7", "#f1f3e9", "#f6efe5", "#e5ebf1"];
  const _qrDarkBackgrounds = ["#15131b", "#0d1813", "#1b140e", "#0e1723"];
  const _qrThemeVars = _qrResolvedTheme === "dark" ? {
    "--qr-bg": _qrDarkBackgrounds[_0x153546] || "#10151b",
    "--qr-fg": "#edf2f7",
    "--qr-muted": "rgba(226, 232, 240, 0.72)",
    "--qr-muted-strong": "#cbd5df",
    "--qr-panel": "rgba(15, 21, 28, 0.68)",
    "--qr-glass-soft": "rgba(24, 31, 40, 0.72)",
    "--qr-control": "rgba(27, 35, 45, 0.82)",
    "--qr-control-active": "rgba(51, 62, 76, 0.94)",
    "--qr-control-hover": "rgba(44, 55, 69, 0.94)",
    "--qr-input": "rgba(18, 25, 33, 0.9)",
    "--qr-input-focus": "rgba(27, 36, 46, 0.97)",
    "--qr-border": "rgba(226, 232, 240, 0.14)",
    "--qr-border-strong": "rgba(226, 232, 240, 0.3)",
    "--qr-control-border-hover": "rgba(226, 232, 240, 0.42)",
    "--qr-outline": "rgba(241, 245, 249, 0.76)",
    "--qr-card": "rgba(18, 24, 32, 0.96)",
    "--qr-accent": "#e39a58",
    "--qr-on-accent": "#15100c",
    "--qr-link": "#f0ad70",
    "--qr-panel-shadow": "0 18px 48px rgba(0, 0, 0, 0.28)",
    "--qr-control-shadow": "0 8px 24px rgba(0, 0, 0, 0.2)"
  } : {
    "--qr-bg": _qrLightBackgrounds[_0x153546] || "#f6f1e7",
    "--qr-fg": "#3f352b",
    "--qr-muted": "rgba(92, 79, 63, 0.78)",
    "--qr-muted-strong": "#5f4e3d",
    "--qr-panel": "rgba(247, 241, 231, 0.66)",
    "--qr-glass-soft": "rgba(248, 242, 232, 0.78)",
    "--qr-control": "rgba(253, 247, 238, 0.82)",
    "--qr-control-active": "rgba(238, 227, 209, 0.96)",
    "--qr-control-hover": "rgba(255, 251, 245, 0.98)",
    "--qr-input": "rgba(255, 250, 242, 0.92)",
    "--qr-input-focus": "rgba(255, 252, 247, 0.99)",
    "--qr-border": "rgba(156, 140, 119, 0.24)",
    "--qr-border-strong": "rgba(128, 112, 91, 0.42)",
    "--qr-control-border-hover": "rgba(128, 112, 91, 0.52)",
    "--qr-outline": "rgba(95, 78, 61, 0.72)",
    "--qr-card": "rgba(252, 248, 240, 0.96)",
    "--qr-accent": "#c87a36",
    "--qr-on-accent": "#fff9f1",
    "--qr-link": "#7d4f24",
    "--qr-panel-shadow": "0 12px 36px rgba(80, 60, 30, 0.1)",
    "--qr-control-shadow": "0 7px 20px rgba(80, 60, 30, 0.1)"
  };
  (0, m.useEffect)(() => {
    try {
      sessionStorage.setItem("qr-tree-theme-mode", _qrThemeMode);
    } catch {}
  }, [_qrThemeMode]);
  (0, m.useEffect)(() => {
    if (_qrThemeAnimationRef.current) {
      cancelAnimationFrame(_qrThemeAnimationRef.current);
    }
    const _qrReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const _qrFromTheme = Number.isFinite(_qrThemeMixRef.current) ? _qrThemeMixRef.current : _qrThemeTarget;
    if (_qrReducedMotion || Math.abs(_qrFromTheme - _qrThemeTarget) < 0.001) {
      _qrThemeMixRef.current = _qrThemeTarget;
      return undefined;
    }
    const _qrThemeStartedAt = performance.now();
    const _qrThemeDuration = 900;
    const _qrAnimateTheme = _qrNow => {
      const _qrRawProgress = Math.min(1, (_qrNow - _qrThemeStartedAt) / _qrThemeDuration);
      const _qrEasedProgress = _qrRawProgress * _qrRawProgress * _qrRawProgress * (_qrRawProgress * (_qrRawProgress * 6 - 15) + 10);
      _qrThemeMixRef.current = _qrFromTheme + (_qrThemeTarget - _qrFromTheme) * _qrEasedProgress;
      if (_qrRawProgress < 1) {
        _qrThemeAnimationRef.current = requestAnimationFrame(_qrAnimateTheme);
      } else {
        _qrThemeMixRef.current = _qrThemeTarget;
        _qrThemeAnimationRef.current = 0;
      }
    };
    _qrThemeAnimationRef.current = requestAnimationFrame(_qrAnimateTheme);
    return () => {
      if (_qrThemeAnimationRef.current) {
        cancelAnimationFrame(_qrThemeAnimationRef.current);
        _qrThemeAnimationRef.current = 0;
      }
    };
  }, [_qrThemeTarget]);
  (0, m.useLayoutEffect)(() => {
    document.documentElement.dataset.qrTheme = _qrResolvedTheme;
    document.documentElement.style.colorScheme = _qrResolvedTheme;
    for (const [_qrThemeVariable, _qrThemeValue] of Object.entries(_qrThemeVars)) {
      document.documentElement.style.setProperty(_qrThemeVariable, _qrThemeValue);
    }
    document.documentElement.style.backgroundColor = _qrThemeVars["--qr-bg"];
    document.body.style.backgroundColor = _qrThemeVars["--qr-bg"];
    const _qrThemeMeta = document.querySelector('meta[name="theme-color"]');
    _qrThemeMeta?.setAttribute("content", _qrThemeVars["--qr-bg"]);
  }, [_qrResolvedTheme, _qrThemeVars["--qr-bg"]]);`;

  if (!source.includes(paletteBlock)) {
    throw new Error('Unable to insert the adaptive theme calculation.');
  }
  source = source.replace(paletteBlock, adaptiveThemeValues);
}

// Retheme the existing inline style system through inherited variables. Missing
// optional style buckets are skipped safely.
if (!source.includes('qr-tree-studio-theme-style-overrides')) {
  const themeStyleOverrides = `/* qr-tree-studio-theme-style-overrides */
const _qrAssignStyle = (_qrStyle, _qrPatch) => {
  if (_qrStyle) Object.assign(_qrStyle, _qrPatch);
};
_qrAssignStyle(Te.container, {
  backgroundColor: "var(--qr-bg)",
  color: "var(--qr-fg)",
  transition: "background-color 900ms cubic-bezier(.22, 1, .36, 1), color 650ms ease"
});
_qrAssignStyle(Te.canvas, {
  backgroundColor: "var(--qr-bg)",
  transition: "background-color 900ms cubic-bezier(.22, 1, .36, 1)"
});
_qrAssignStyle(Te.helperText, {
  color: "var(--qr-muted)",
  border: "1px solid var(--qr-border)",
  background: "var(--qr-glass-soft)",
  transition: "background-color 700ms cubic-bezier(.22, 1, .36, 1), border-color 700ms ease, color 500ms ease"
});
_qrAssignStyle(Te.inputContainer, {
  background: "var(--qr-panel)",
  border: "1px solid var(--qr-border)",
  boxShadow: "var(--qr-panel-shadow)",
  transition: "background-color 700ms cubic-bezier(.22, 1, .36, 1), border-color 700ms ease, box-shadow 700ms ease"
});
_qrAssignStyle(Te.input, {
  backgroundColor: "var(--qr-input)",
  border: "1px solid var(--qr-border)",
  color: "var(--qr-fg)",
  caretColor: "var(--qr-accent)",
  transition: "background-color 650ms ease, border-color 650ms ease, color 450ms ease"
});
_qrAssignStyle(Te.inputFocused, {
  backgroundColor: "var(--qr-input-focus)",
  borderColor: "var(--qr-border-strong)"
});
[Te.seasonBtn, Te.muteBtn, Te.iconBtn, Te.scanQrBtn, Te.visitLinkBtn].forEach(_qrStyle => _qrAssignStyle(_qrStyle, {
  backgroundColor: "var(--qr-control)",
  color: "var(--qr-muted-strong)",
  border: "1px solid var(--qr-border)",
  transition: "background-color 650ms ease, border-color 650ms ease, color 450ms ease, transform 180ms ease"
}));
[Te.seasonBtnActive, Te.muteBtnActive, Te.iconBtnActive].forEach(_qrStyle => _qrAssignStyle(_qrStyle, {
  backgroundColor: "var(--qr-control-active)",
  color: "var(--qr-fg)",
  border: "1px solid var(--qr-border-strong)"
}));
_qrAssignStyle(Te.shareBtn, {
  backgroundColor: "var(--qr-accent)",
  color: "var(--qr-on-accent)",
  transition: "background-color 650ms ease, color 450ms ease, transform 180ms ease"
});
_qrAssignStyle(Te.generateAnotherBtn, {
  backgroundColor: "var(--qr-accent)",
  color: "var(--qr-on-accent)",
  transition: "background-color 650ms ease, color 450ms ease, transform 180ms ease"
});
_qrAssignStyle(Te.paletteSwatchActive, { outline: "2px solid var(--qr-outline)" });
_qrAssignStyle(Te.sharePopover, {
  border: "1px solid var(--qr-border)",
  background: "var(--qr-card)",
  boxShadow: "var(--qr-panel-shadow)",
  transition: "background-color 650ms ease, border-color 650ms ease, box-shadow 650ms ease"
});
_qrAssignStyle(Te.sharePopoverItem, { color: "var(--qr-fg)" });
_qrAssignStyle(Te.sharePopoverItemHover, { backgroundColor: "var(--qr-control-active)" });
_qrAssignStyle(Te.sharePopoverIcon, { color: "var(--qr-muted-strong)" });
_qrAssignStyle(Te.githubButton, { color: "var(--qr-muted-strong)" });
_qrAssignStyle(Te.creditsHintButton, { color: "var(--qr-muted-strong)" });
_qrAssignStyle(Te.creditsHintCard, {
  border: "1px solid var(--qr-border)",
  background: "var(--qr-card)",
  color: "var(--qr-muted-strong)",
  boxShadow: "var(--qr-panel-shadow)",
  transition: "background-color 650ms ease, border-color 650ms ease, color 450ms ease"
});
_qrAssignStyle(Te.creditsHintArrow, { borderBottom: "6px solid var(--qr-card)" });
_qrAssignStyle(Te.creditsHintLink, { color: "var(--qr-link)" });`;

  replaceOnce(
    '};\nvar Pe = a(',
    `};\n${themeStyleOverrides}\nvar Pe = a(`,
    'theme-aware style overrides'
  );
}

// Reuse the final aligned float in the renderer uniform for a continuously
// animated 0..1 light/dark blend.
replaceOnce('  _pad2: f32,\\n', '  themeMix: f32,\\n', 'theme mix uniform');
replaceOnce(
  '  _0x49c9f6[15] = 0;',
  '  _0x49c9f6[15] = Math.max(0, Math.min(1, _0x4a15bf.themeMix ?? 0));',
  'theme mix uniform upload'
);

if (!source.includes('qr-tree-studio-gpu-theme-clear')) {
  replaceOnce(
    '  const _0x235809 = _0x202404 ? _0x778c68.sceneTextureView : _0xb56c7c;\n  const _0x11b771 = _0x1728fc.beginRenderPass({',
    `  const _0x235809 = _0x202404 ? _0x778c68.sceneTextureView : _0xb56c7c;
  /* qr-tree-studio-gpu-theme-clear */
  const _qrGpuThemeMix = Math.max(0, Math.min(1, _0x4a15bf.themeMix ?? 0));
  let _qrGpuLightClear = [0.965, 0.945, 0.906];
  let _qrGpuDarkClear = [0.065, 0.055, 0.085];
  if (_0x4a15bf.season > 0.5 && _0x4a15bf.season < 1.5) {
    _qrGpuLightClear = [0.945, 0.955, 0.91];
    _qrGpuDarkClear = [0.035, 0.075, 0.055];
  } else if (_0x4a15bf.season > 1.5 && _0x4a15bf.season < 2.5) {
    _qrGpuLightClear = [0.965, 0.94, 0.9];
    _qrGpuDarkClear = [0.085, 0.055, 0.035];
  } else if (_0x4a15bf.season > 2.5) {
    _qrGpuLightClear = [0.88, 0.91, 0.94];
    _qrGpuDarkClear = [0.035, 0.065, 0.105];
  }
  const _qrGpuClear = {
    r: _qrGpuLightClear[0] + (_qrGpuDarkClear[0] - _qrGpuLightClear[0]) * _qrGpuThemeMix,
    g: _qrGpuLightClear[1] + (_qrGpuDarkClear[1] - _qrGpuLightClear[1]) * _qrGpuThemeMix,
    b: _qrGpuLightClear[2] + (_qrGpuDarkClear[2] - _qrGpuLightClear[2]) * _qrGpuThemeMix,
    a: 1
  };
  const _0x11b771 = _0x1728fc.beginRenderPass({`,
    'animated WebGPU clear color'
  );
  replaceOnce(
    '      clearValue: _0x4a15bf.season > 2.5 ? { r: 0.88, g: 0.91, b: 0.94, a: 1 } : { r: 0.965, g: 0.945, b: 0.906, a: 1 },',
    '      clearValue: _qrGpuClear,',
    'theme-aware WebGPU clear attachment'
  );
}

const skyFragmentBefore = 'fragment: "\\n" + ye + "\\n\\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\\n\\n@fragment\\nfn main(@location(0) uv: vec2f) -> @location(0) vec4f {\\n  let season = uniforms.season;\\n  if (season > 2.5) {\\n    // Soft, poetic misty winter paper tone (harmonious with spring/summer/autumn)\\n    let topCol = vec3f(0.82, 0.86, 0.90);\\n    let botCol = vec3f(0.91, 0.94, 0.96);\\n    let t = smoothstep(0.0, 1.0, uv.y);\\n    let sky = mix(topCol, botCol, t);\\n    return vec4f(sky, 1.0);\\n  }\\n  return vec4f(0.965, 0.945, 0.906, 1.0);\\n}\\n",';
const skyFragmentAfter = 'fragment: "\\n" + ye + "\\n\\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\\n\\n@fragment\\nfn main(@location(0) uv: vec2f) -> @location(0) vec4f {\\n  let season = uniforms.season;\\n  let themeMix = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let vertical = smoothstep(0.0, 1.0, uv.y);\\n\\n  var lightTop = vec3f(0.965, 0.945, 0.906);\\n  var lightBottom = vec3f(0.985, 0.972, 0.944);\\n  var darkTop = vec3f(0.065, 0.055, 0.085);\\n  var darkBottom = vec3f(0.125, 0.105, 0.145);\\n\\n  if (season > 0.5 && season < 1.5) {\\n    lightTop = vec3f(0.945, 0.955, 0.91);\\n    lightBottom = vec3f(0.975, 0.97, 0.93);\\n    darkTop = vec3f(0.035, 0.075, 0.055);\\n    darkBottom = vec3f(0.075, 0.13, 0.09);\\n  } else if (season > 1.5 && season < 2.5) {\\n    lightTop = vec3f(0.965, 0.94, 0.90);\\n    lightBottom = vec3f(0.985, 0.965, 0.925);\\n    darkTop = vec3f(0.085, 0.055, 0.035);\\n    darkBottom = vec3f(0.16, 0.105, 0.065);\\n  } else if (season > 2.5) {\\n    lightTop = vec3f(0.82, 0.86, 0.90);\\n    lightBottom = vec3f(0.91, 0.94, 0.96);\\n    darkTop = vec3f(0.035, 0.065, 0.105);\\n    darkBottom = vec3f(0.075, 0.12, 0.17);\\n  }\\n\\n  let lightSky = mix(lightTop, lightBottom, vertical);\\n  let darkSky = mix(darkTop, darkBottom, vertical);\\n  let sky = mix(lightSky, darkSky, themeMix);\\n  return vec4f(sky, 1.0);\\n}\\n",';
replaceOnce(skyFragmentBefore, skyFragmentAfter, 'animated seasonal sky theme');

// Pass the animated mix through the renderer and through every live/snapshot draw.
replaceOnce(
  '      customColorRef: _0x2728d7,\n      treeSeed: _0x5399fb,',
  '      customColorRef: _0x2728d7,\n      themeMixRef: _qrThemeMixRefInner,\n      treeSeed: _0x5399fb,',
  'renderer theme ref destructuring'
);
replaceOnce(
  '            rainMode: _0x1f741d,\n            trunkSeed: _0x5dd6ef\n          });',
  '            rainMode: _0x1f741d,\n            trunkSeed: _0x5dd6ef,\n            themeMix: _qrThemeMixRefInner.current\n          });',
  'snapshot theme mix'
);
replaceOnce(
  '            rainMode: _0x4d86e9.current,\n            trunkSeed: _0x5dd6ef\n          });',
  '            rainMode: _0x4d86e9.current,\n            trunkSeed: _0x5dd6ef,\n            themeMix: _qrThemeMixRefInner.current\n          });',
  'live render theme mix'
);
replaceOnce(
  '    }, [_0x1b3318, _0x1f69fa, _0xc8ac50, _0x357820, _0x45ded0, _0x2728d7, _0x5399fb, _0x1ddb2b, _0x3d1546, _0x1e3edc]);',
  '    }, [_0x1b3318, _0x1f69fa, _0xc8ac50, _0x357820, _0x45ded0, _0x2728d7, _qrThemeMixRefInner, _0x5399fb, _0x1ddb2b, _0x3d1546, _0x1e3edc]);',
  'renderer theme dependency'
);
replaceOnce(
  '    customColorRef: _0x5bd40a,\n    treeSeed: _0x2f2fa6,',
  '    customColorRef: _0x5bd40a,\n    themeMixRef: _qrThemeMixRef,\n    treeSeed: _0x2f2fa6,',
  'renderer theme ref input'
);

// Keep top-down QR snapshots synchronized with manual or automatic theme changes,
// but wait until the crossfade reaches an endpoint before capturing.
if (!source.includes('qr-tree-studio-theme-snapshot-sync')) {
  replaceOnce(
    '        let _0x422c2b = false;',
    '        let _0x422c2b = false;\n        let _qrLastSnapshotTheme = -1;',
    'snapshot theme state'
  );
  replaceOnce(
    '          const _0x7ae42c = _0x2728d7.current.join(",");',
    `          const _0x7ae42c = _0x2728d7.current.join(",");
          /* qr-tree-studio-theme-snapshot-sync */
          const _qrSnapshotThemeMix = Math.max(0, Math.min(1, _qrThemeMixRefInner.current ?? 0));
          if (_qrSnapshotThemeMix > 0.02 && _qrSnapshotThemeMix < 0.98) {
            _0x422c2b = true;
            return;
          }`,
    'settled theme snapshot gate'
  );
  replaceOnce(
    '          const _0x4f601d = _0x42fa71 !== _0x45ded0.current || _0xdd66a6 !== _0x7ae42c || _0x2a658b !== _0x2323cd.current;',
    '          const _0x4f601d = _0x42fa71 !== _0x45ded0.current || _0xdd66a6 !== _0x7ae42c || _0x2a658b !== _0x2323cd.current || Math.abs(_qrLastSnapshotTheme - _qrSnapshotThemeMix) > 0.001;',
    'snapshot theme invalidation'
  );
  replaceOnce(
    '          _0x2a658b = _0x2323cd.current;',
    '          _0x2a658b = _0x2323cd.current;\n          _qrLastSnapshotTheme = _qrSnapshotThemeMix;',
    'snapshot theme bookkeeping'
  );
}

if (!source.includes('data-qr-theme-root="true"')) {
  replaceOnce(
    '  if (navigator.gpu) {\n    return <div style={Te.container}>',
    `  if (navigator.gpu) {
    return <div data-qr-theme-root="true" data-theme={_qrResolvedTheme} style={{
      ...Te.container,
      ..._qrThemeVars,
      color: "var(--qr-fg)",
      colorScheme: _qrResolvedTheme
    }}>`,
    'theme-aware application root'
  );
}

// Keep the original information glyph and add exactly one elegant, combined
// light/dark control. Its small accent dot indicates automatic mode.
if (!source.includes('data-qr-utility-cluster="true"')) {
  const helpPattern = /<div ref=\{_0x4efbdf\} style=\{Te\.creditsHintWrap\}>[\s\S]*?<button data-qr-help-button="true"[\s\S]*?\{Ae\.info\}<\/button><\/div>/;
  const sunMoonIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}><path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.3 17.7-1.4 1.4" /><path d="m19.1 4.9-1.4 1.4" /></svg>';
  const utilityCluster = `<div data-qr-utility-cluster="true" ref={_0x4efbdf} style={{...Te.creditsHintWrap,height:34,gap:7}}>
  <button data-qr-theme-toggle="true" type="button" aria-label={"Theme mode: " + _qrThemeMode + ". Click to cycle automatic, light, and dark."} title={_qrThemeMode === "auto" ? "Automatic theme · " + _qrResolvedTheme : (_qrThemeMode === "light" ? "Light theme" : "Dark theme")} onClick={() => _setQrThemeMode(_qrMode => { const _qrOppositeAuto = _qrAutoTheme === "dark" ? "light" : "dark"; return _qrMode === "auto" ? _qrOppositeAuto : _qrMode === _qrOppositeAuto ? _qrAutoTheme : "auto"; })} style={{...Te.creditsHintButton,width:32,height:32,position:"relative",border:"1px solid var(--qr-border)",background:"var(--qr-control)",color:"var(--qr-muted-strong)",boxShadow:"var(--qr-control-shadow)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",transition:"background-color 650ms ease, border-color 650ms ease, color 450ms ease, box-shadow 650ms ease, transform 180ms ease"}}><span aria-hidden={true} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",transform:"rotate(" + (_qrThemeTarget * 180) + "deg)",transition:"transform 900ms cubic-bezier(.22, 1, .36, 1)"}}>${sunMoonIcon}</span><span aria-hidden={true} style={{position:"absolute",right:5,bottom:5,width:4,height:4,borderRadius:"50%",background:_qrThemeMode === "auto" ? "var(--qr-accent)" : "var(--qr-muted-strong)",boxShadow:"0 0 0 2px var(--qr-control)",transition:"background-color 450ms ease, box-shadow 650ms ease"}} /></button>
  {_0x2b80c3 && <div style={Te.creditsHintTooltip}><div style={Te.creditsHintArrow} /><div style={Te.creditsHintCard}><div style={{fontWeight:700,fontSize:12,marginBottom:5,color:"var(--qr-fg)"}}>QR Tree Studio</div><div style={{color:"var(--qr-muted)",marginBottom:7}}>Click the tree for a top-down scannable QR code.<br />The interface automatically contrasts with the tree brightness.</div><div style={{borderTop:"1px solid var(--qr-border)",paddingTop:7}}><a href="https://github.com/GODOSTROYER/qr-tree-studio" target="_blank" rel="noopener noreferrer" style={Te.creditsHintLink}>View source on GitHub</a></div></div></div>}
  <button data-qr-help-button="true" type="button" aria-label="About QR Tree Studio" title="About QR Tree Studio" onClick={() => _0x23dd65(_0x3b08aa => !_0x3b08aa)} style={{...Te.creditsHintButton,width:32,height:32,border:"1px solid var(--qr-border)",background:"var(--qr-control)",color:"var(--qr-muted-strong)",boxShadow:"var(--qr-control-shadow)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",transition:"background-color 650ms ease, border-color 650ms ease, color 450ms ease, box-shadow 650ms ease, transform 180ms ease"}}>{Ae.info}</button>
</div>`;

  if (!helpPattern.test(source)) {
    throw new Error('Unable to install the adaptive theme utility control safely.');
  }
  source = source.replace(helpPattern, utilityCluster);
}

const requiredFragments = [
  'qr-tree-studio-adaptive-theme-state',
  'qr-tree-studio-adaptive-theme-values',
  'qr-tree-studio-theme-style-overrides',
  'qr-tree-studio-gpu-theme-clear',
  'qr-tree-studio-theme-snapshot-sync',
  'data-qr-theme-root="true"',
  'data-qr-utility-cluster="true"',
  'data-qr-theme-toggle="true"',
  'data-qr-help-button="true"',
  'clearValue: _qrGpuClear',
  'let themeMix = smoothstep(0.0, 1.0, uniforms.themeMix)',
  'themeMix: f32',
  'themeMix: _qrThemeMixRefInner.current'
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Required adaptive-theme fragment was not applied: ${fragment}`);
  }
}

for (const fragment of ['☀️', '🌙', 'data-qr-light-theme', 'data-qr-dark-theme']) {
  if (source.includes(fragment)) {
    throw new Error(`Unwanted duplicate or emoji theme control remains: ${fragment}`);
  }
}

fs.writeFileSync(appFile, source);
console.log('Applied smooth, tree-aware light/dark themes with one elegant adaptive control.');
