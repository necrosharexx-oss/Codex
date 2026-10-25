const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const sharp = require('sharp');

const root = path.resolve(__dirname, '../..');
const base = 'msp-delivery-partner';
const libraryPath = path.join(process.env.USERPROFILE, 'OneDrive/Escritorio/Chris - PC/3. Michael Page/7. Design System/1. New Design/3. Icons');
const embedded = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;

async function main() {
  let html = fs.readFileSync(path.join(__dirname, 'two-pager.html'), 'utf8');
  const fontCss = [400, 700].map(weight => {
    const file = weight === 700 ? 'aptos-bold.woff2' : 'aptos.woff2';
    return `@font-face{font-family:'Aptos';font-weight:${weight};font-style:normal;font-display:block;src:url('${embedded(path.join(root, 'bundle/fonts', file), 'font/woff2')}') format('woff2');}`;
  }).join('\n');
  html = html.replace('/*__BRAND_STYLES__*/', fontCss + '\n' + fs.readFileSync(path.join(root, 'bundle/_ds_bundle.css'), 'utf8'));
  const context = { window: { React: { createElement: () => null, forwardRef: render => render } } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'bundle/_ds_bundle.js'), 'utf8'), context);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1040, height: 1180 }, deviceScaleFactor: 3.125 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent(html, { waitUntil: 'load' });
    const requested = await page.evaluate(() => ({
      library: [...new Set([...document.querySelectorAll('[data-library-icon]')].map(image => image.dataset.libraryIcon))],
      photos: [...new Set([...document.querySelectorAll('[data-photo]')].map(image => image.dataset.photo))],
    }));
    const library = {};
    const photos = {};
    for (const name of requested.library) library[name] = embedded(path.join(libraryPath, name), 'image/svg+xml');
    for (const name of requested.photos) {
      const photo = await sharp(path.join(__dirname, 'assets', name))
        .resize({ width: 1000, withoutEnlargement: true })
        .jpeg({ quality: 92, mozjpeg: true }).toBuffer();
      photos[name] = `data:image/jpeg;base64,${photo.toString('base64')}`;
    }
    await page.evaluate(({ logos, library, photos, icons }) => {
      for (const image of document.querySelectorAll('[data-logo]')) image.src = logos[image.dataset.logo];
      for (const image of document.querySelectorAll('[data-photo]')) image.src = photos[image.dataset.photo];
      for (const image of document.querySelectorAll('[data-library-icon]')) image.src = library[image.dataset.libraryIcon];
      for (const image of document.querySelectorAll('[data-icon]')) {
        const icon = image.dataset.icon;
        if (!icons[icon]) throw new Error(`Missing official icon: ${icon}`);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const attrs = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: getComputedStyle(image).color, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
        for (const [key, value] of Object.entries(attrs)) svg.setAttribute(key, value);
        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shape.setAttribute('d', icons[icon]);
        svg.append(shape);
        image.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg));
      }
    }, {
      logos: { colour: embedded(path.join(root, 'logos/MichaelPage_colour.png'), 'image/png'), white: embedded(path.join(root, 'logos/MichaelPage_white.png'), 'image/png') },
      library, photos, icons: context.window.MichaelPageDS.icons,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
    });
    const htmlFile = path.join(__dirname, `${base}.html`);
    fs.writeFileSync(htmlFile, '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML));
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    const audit = await page.evaluate(() => {
      const pages = [...document.querySelectorAll('.page')].map(page => {
        const frame = page.getBoundingClientRect();
        const overflow = [];
        const overlap = [];
        const blocks = [...page.children].map(block => ({ id: block.id || block.className, box: block.getBoundingClientRect() }));
        const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = walker.currentNode.textContent.trim();
          if (!text) continue;
          const range = document.createRange();
          range.selectNodeContents(walker.currentNode);
          const parent = walker.currentNode.parentElement.getBoundingClientRect();
          const section = walker.currentNode.parentElement.closest('section, footer, header');
          const sectionBox = section?.getBoundingClientRect();
          for (const box of range.getClientRects()) {
            if (box.left < frame.left - 1 || box.right > frame.right + 1 || box.top < frame.top - 1 || box.bottom > frame.bottom + 1 || box.left < parent.left - 1 || box.right > parent.right + 1) overflow.push(text);
            if (sectionBox && (box.top < sectionBox.top - 2 || box.bottom > sectionBox.bottom + 2)) overlap.push(text);
          }
        }
        return { id: page.id, width: frame.width, height: frame.height, overflow, overlap, text: page.innerText, blocks: blocks.map(block => ({ id: block.id, height: block.box.height })) };
      });
      return {
        pages,
        fonts: [...document.fonts].map(font => ({ family: font.family, weight: font.weight, status: font.status })),
        images: [...document.images].map(image => ({ asset: image.dataset.photo || image.dataset.libraryIcon || image.dataset.icon || image.alt, loaded: image.complete && image.naturalWidth > 0 })),
      };
    });
    if (errors.length || audit.pages.some(page => page.overflow.length || page.overlap.length) || audit.images.some(image => !image.loaded)) {
      throw new Error(JSON.stringify({ errors, audit }, null, 2));
    }
    const previews = [];
    for (let index = 0; index < 2; index++) {
      const screenshot = await page.locator('.page').nth(index).screenshot();
      await sharp(screenshot).withMetadata({ density: 300 }).png().toFile(path.join(__dirname, `${base}-page-${index + 1}.png`));
      const preview = await sharp(screenshot).resize({ width: 816 }).png().toBuffer();
      previews.push(preview);
      fs.writeFileSync(path.join(__dirname, `preview-page-${index + 1}.png`), preview);
    }
    await sharp({ create: { width: 1660, height: 1056, channels: 4, background: '#F4F4F8' } })
      .composite(previews.map((input, index) => ({ input, left: index * 844, top: 0 })))
      .png().toFile(path.join(__dirname, 'two-page-preview.png'));
    await page.pdf({ path: path.join(__dirname, `${base}.pdf`), format: 'Letter', preferCSSPageSize: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

    audit.viewports = [];
    for (const width of [768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const state = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, pages: [...document.querySelectorAll('.page')].map(page => ({ id: page.id, left: page.getBoundingClientRect().left, right: page.getBoundingClientRect().right })) }));
      if (state.documentWidth > width || state.pages.some(page => page.left < 0 || page.right > width)) throw new Error(`Viewport overflow: ${JSON.stringify(state)}`);
      audit.viewports.push(state);
    }
    fs.writeFileSync(path.join(__dirname, 'verification.json'), JSON.stringify(audit, null, 2));
    console.log(JSON.stringify({ pages: audit.pages.map(({ id, overflow, overlap }) => ({ id, overflow, overlap })), fonts: audit.fonts, images: audit.images.length, viewports: audit.viewports }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
