# Yōsei — Living QR Studio

Yōsei turns a URL or short message into a decorative, scan-friendly QR code framed by a growing seasonal tree. It is a lightweight, dependency-free static web app with a calm visual interface and no backend.

## Features

- Live QR generation for URLs and short text messages
- Spring, Summer, Autumn, and Winter visual themes
- Six leaf colour palettes
- Sparse-to-wild tree density control
- Soft, Classic, and Diamond QR module shapes
- Download the generated artwork as a PNG
- Copy the current link or message to the clipboard
- Responsive layout for desktop and mobile screens
- White quiet zone and high-contrast finder patterns for reliable scanning

## Run locally

Because the app is static, it can be opened directly in a browser. A local HTTP server is recommended so browser APIs such as clipboard access work consistently:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080> from this directory.

## Deployment

The project can be deployed to any static hosting provider, including Vercel, Netlify, GitHub Pages, or Cloudflare Pages. No build command or environment variables are required.

For Vercel, import this repository and use these settings:

- Framework preset: **Other**
- Build command: leave empty
- Output directory: `.`
- Install command: leave empty

## Technology

- Semantic HTML
- CSS with responsive layout and custom visual styling
- Vanilla JavaScript
- HTML Canvas for the illustrated QR composition
- [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) loaded from jsDelivr

## Notes

The QR payload is generated entirely in the browser. Nothing entered into the app is sent to an application server. Very long messages may exceed the capacity of the selected QR version and will be rejected with an inline status message.

## License

No license has been selected yet. Add one before accepting external contributions or redistributing the project.
