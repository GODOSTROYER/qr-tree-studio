# QR Tree Studio

This repository deploys the Magic Tree QR experience through Vite and Vercel.

The upstream implementation is pinned to `xscanzm/magic-tree-qr` commit `c064f61f5adb6daf38450609c1adff937b08289d` as the npm alias `magic-tree-qr-upstream`. The local entry point imports the upstream React/WebGPU application directly, while Vite serves the upstream `public/` directory so its seasonal audio, favicons, and Open Graph image are included in production builds.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Vercel can use the standard Vite defaults: build command `npm run build` and output directory `dist`.

## Upstream

Magic Tree QR: https://github.com/xscanzm/magic-tree-qr

License: upstream MIT license applies to the integrated upstream application.
