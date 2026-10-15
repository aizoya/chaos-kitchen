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
  "import {mountShowtime, setShowtimePaused, setShowtimeSound, shiftLesson} from './showtime.mjs';",
  "import {createGame, dispatch, ticketFor, stageFor, multiplier, HEAT, pantryFor, ticketDuration} from './engine.mjs';",
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
console.log(
  'Built dist/Chaos-Kitchen.html — self-contained, no runtime network',
);
