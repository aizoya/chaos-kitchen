import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { validateContent } from '../src/content.mjs';
validateContent();
const root = new URL('../', import.meta.url),
  read = (p) => readFile(new URL(p, root), 'utf8');
let html = await read('index.html');
const css = await read('styles.css');
let js = '';
const allowedImports = new Set([
  "import {createControllerReader} from './controller.mjs';",
  "import {INGREDIENTS,TICKETS,STAGES,nameOf,COOKING} from './content.mjs';",
  "import {INGREDIENTS, STAGES, nameOf, COOKING} from './content.mjs';",
  "import {createGame, dispatch, ticketDuration} from './engine.mjs';",
  "import {createService, dispatchService, serviceView} from './service.mjs';",
  "import {mountShowtime, setShowtimePaused, setShowtimeSound, shiftLesson, nextShiftGoal, inspectionResult} from './showtime.mjs';",
  "import {createGame, judgePlate, dispatch, ticketFor, stageFor, multiplier, HEAT, pantryFor, ticketDuration} from './engine.mjs';",
  "import {FOOD, BELL} from './art.mjs';",
]);
const normalizedImports = new Set(
  [...allowedImports].map((line) => line.replace(/\s/g, '').replace(/,}/g, '}')),
);
for (const file of ['content', 'engine', 'service', 'showtime', 'art', 'controller', 'app'])
  js +=
    (await read(`src/${file}.mjs`))
      .replace(/^import[\s\S]*?;\r?\n/gm, (statement) =>
        normalizedImports.has(statement.replace(/\s/g, '').replace(/,}/g, '}')) ? '' : statement,
      )
      .replace(/^export /gm, '') + '\n';
if (/^import /m.test(js)) throw Error('Unexpected import in offline build');
html = html
  .replace(/<link rel="stylesheet" href="styles.css"\s*\/?>/, () => `<style>${css}</style>`)
  .replace(
    '<script type="module" src="src/app.mjs"></script>',
    () => `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`,
  );
for (const [name, mime] of [
  ['aizoya-master-logo.png', 'image/png'],
  ['grace-avatar.webp', 'image/webp'],
  ['chef-franklyn-anime-v1.webp', 'image/webp'],
  ['chef-franklyn-intro-v1.mp4', 'video/mp4'],
]) {
  const bytes = await readFile(new URL(`public/${name}`, root));
  html = html.replaceAll(
    `public/${name}`,
    `data:${mime};base64,${bytes.toString('base64')}`,
  );
}
if(/(?:src|href)="(?:src\/|public\/|styles\.css)/.test(html))throw Error('Unbundled runtime resource');
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/Chaos-Kitchen.html', root), html);
// Analytics is limited to the Vercel-hosted entry point. The downloadable
// game remains self-contained and never includes the tracking script.
// Server-rendered sharing metadata is hosted-only; offline play remains network-free.
const share = `<!-- hosted-share -->
<meta name="description" content="Read it. Cook it. Serve it. Survive the rush. Play AIZOYA’s Chaos Kitchen free." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Chaos Kitchen — AIZOYA" />
<meta property="og:description" content="Can you survive the dinner rush? Play free." />
<meta property="og:url" content="https://play.aizoya.com/" />
<meta property="og:site_name" content="AIZOYA" />
<meta property="og:image" content="https://play.aizoya.com/aizoya-share-logo.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="AIZOYA logo — Chaos Kitchen" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Chaos Kitchen — AIZOYA" />
<meta name="twitter:description" content="Can you survive the dinner rush? Play free." />
<meta name="twitter:image" content="https://play.aizoya.com/aizoya-share-logo.png" />
<!-- /hosted-share -->
`;
const hosted = process.env.VERCEL === '1'
  ? html.replace('</head>', share + '<script defer src="/_vercel/insights/script.js"></script>\n</head>')
  : html;
await writeFile(new URL('dist/aizoya-share-logo.png', root), await readFile(new URL('public/aizoya-master-logo.png', root)));
await writeFile(new URL('dist/index.html', root), hosted);
console.log(
  'Built dist/Chaos-Kitchen.html — self-contained, no runtime network',
);
