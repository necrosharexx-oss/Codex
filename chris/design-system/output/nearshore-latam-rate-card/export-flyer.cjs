const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const sharp = require('sharp');

const root = path.resolve(__dirname, '../..');
const outputDir = path.resolve(process.argv[2] || __dirname);
const fileBase = process.argv[3] || 'nearshore-latam-rate-card';
const exportScale = 3.125;
const iconLibrary = path.join(process.env.USERPROFILE, 'OneDrive/Escritorio/Chris - PC/3. Michael Page/7. Design System/1. New Design/3. Icons');
const asset = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;

async function main() {
  let html = fs.readFileSync(path.join(outputDir, 'flyer.html'), 'utf8');
  const fonts = [400, 700].map(weight => {
    const file = weight === 700 ? 'aptos-bold.woff2' : 'aptos.woff2';
    return `@font-face {font-family: 'Aptos'; font-weight: ${weight}; font-style: normal; font-display: block; src: url('${asset(path.join(root, 'bundle/fonts', file), 'font/woff2')}') format('woff2');}`;
  }).join('\n');
  html = html.replace('/*__BRAND_STYLES__*/', fonts + '\n' + fs.readFileSync(path.join(root, 'bundle/_ds_bundle.css'), 'utf8'));

  // Evaluate upstream exports without mounting a React UI to reuse its actual icon paths.
  const context = { window: { React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), forwardRef: render => render } } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'bundle/_ds_bundle.js'), 'utf8'), context);
  const officialIcons = context.window.MichaelPageDS.icons;
  const graphicSources = {};
  const collectGraphics = node => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'img') graphicSources.benchmarks = node.props.src;
    for (const child of node.props?.children || []) collectGraphics(child);
  };
  collectGraphics(context.window.MichaelPageDS.Graphic({ name: 'benchmarks' }));

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1160 }, deviceScaleFactor: exportScale });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setContent(html, { waitUntil: 'load' });
    const requestedIcons = await page.locator('[data-library-icon]').evaluateAll(images => [...new Set(images.map(image => image.dataset.libraryIcon))]);
    const library = {};
    for (const name of requestedIcons) {
      if (name !== path.basename(name)) throw new Error(`Icon filename must belong to the brand library: ${name}`);
      library[name] = asset(path.join(iconLibrary, name), 'image/svg+xml');
    }
    const data = {
      logo: asset(path.join(root, 'logos/MichaelPage_colour.png'), 'image/png'),
      whiteLogo: asset(path.join(root, 'logos/MichaelPage_white.png'), 'image/png'),
      graphics: graphicSources,
      library,
      paths: officialIcons,
    };
    await page.evaluate(({ logo, whiteLogo, library, paths, graphics }) => {
      const logoImage = document.getElementById('logo');
      logoImage.src = logoImage.dataset.logo === 'white' ? whiteLogo : logo;
      for (const image of document.querySelectorAll('[data-library-icon]')) image.src = library[image.dataset.libraryIcon];
      for (const image of document.querySelectorAll('[data-graphic]')) image.src = graphics[image.dataset.graphic];
      for (const image of document.querySelectorAll('[data-icon]')) {
        const name = image.dataset.icon;
        if (!paths[name]) throw new Error(`Official design-system icon missing: ${name}`);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        for (const [key, value] of Object.entries({ width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: getComputedStyle(image).color, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) svg.setAttribute(key, value);
        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shape.setAttribute('d', paths[name]);
        svg.append(shape);
        image.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg));
      }
    }, data);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, image => image.decode()));
    });
    const standalone = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);
    const htmlFile = path.join(outputDir, `${fileBase}.html`);
    fs.writeFileSync(htmlFile, standalone);
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const verification = await page.evaluate(() => {
      const flyer = document.getElementById('flyer').getBoundingClientRect();
      const overflow = [];
      const textOverflow = [];
      const walker = document.createTreeWalker(document.getElementById('flyer'), NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const box of range.getClientRects()) {
          if (box.left < flyer.left - 1 || box.right > flyer.right + 1 || box.top < flyer.top - 1 || box.bottom > flyer.bottom + 1) overflow.push(walker.currentNode.textContent.trim());
          const container = walker.currentNode.parentElement.getBoundingClientRect();
          if (box.left < container.left - 1 || box.right > container.right + 1) textOverflow.push(walker.currentNode.textContent.trim());
        }
      }
      return {
        fonts: [...document.fonts].map(font => ({ family: font.family, weight: font.weight, status: font.status })),
        images: [...document.images].map(image => ({ asset: image.dataset.icon || image.dataset.libraryIcon || image.dataset.graphic || image.alt, loaded: image.complete && image.naturalWidth > 0 })),
        tables: [...document.querySelectorAll('tbody')].map(body => [...body.rows].map(row => [...row.cells].map(cell => cell.innerText))),
        dimensions: { width: flyer.width, height: flyer.height },
        overflow,
        textOverflow,
      };
    });
    if (verification.overflow.length || verification.textOverflow.length || verification.images.some(image => !image.loaded) || pageErrors.length) throw new Error(JSON.stringify({ verification, pageErrors }));

    const printFile = path.join(outputDir, `${fileBase}.png`);
    const screenshot = await page.locator('#flyer').screenshot();
    await sharp(screenshot).withMetadata({ density: 300 }).png().toFile(printFile);
    await sharp(screenshot).resize({ width: 1224 }).png().toFile(path.join(outputDir, 'preview.png'));
    await page.pdf({ path: path.join(outputDir, `${fileBase}.pdf`), format: 'Letter', preferCSSPageSize: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    verification.mobile = await page.evaluate(() => {
      const flyer = document.getElementById('flyer').getBoundingClientRect();
      return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, width: flyer.width, left: flyer.left, right: flyer.right };
    });
    if (verification.mobile.documentWidth > 390) throw new Error('Mobile document overflows the viewport.');
    await page.screenshot({ path: path.join(outputDir, 'mobile-preview.png'), fullPage: true });
    fs.writeFileSync(path.join(outputDir, 'verification.json'), JSON.stringify(verification, null, 2));
    console.log(JSON.stringify(verification, null, 2));
    console.log('Exported standalone HTML, 2550 x 3300 PNG (300 DPI), and US Letter PDF.');
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
