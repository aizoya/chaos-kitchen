// Optional development renderer. Requires ffmpeg; gameplay/build do not.
// Uses the generated anime poster as key art, with camera motion and local synth audio.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const poster = new URL('public/chef-franklyn-anime-v1.webp', root).pathname;
const video = new URL('public/chef-franklyn-intro-v1.mp4', root).pathname;
if (process.argv[2]) {
  if (existsSync(poster)) throw Error('Poster exists; keep versioned artwork non-destructive.');
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', process.argv[2], '-vf', 'scale=540:720', '-frames:v', '1', '-quality', '85', poster]);
}
if (!existsSync(poster)) throw Error('Supply the generated anime artwork path on the first render.');
if (existsSync(video)) throw Error('Video exists; create a new version before re-rendering.');
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const caption = (text, from, to) => `drawtext=fontfile=${font}:text='${text}':fontsize=23:fontcolor=white:x=(w-tw)/2:y=h-84:enable='between(t,${from},${to})'`;
const filters = [
  "scale=1080:1440,zoompan=z='1+0.0003*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=288:s=540x720:fps=24",
  'drawbox=x=0:y=ih-112:w=iw:h=112:color=black@0.72:t=fill',
  caption('CHEF FRANKLYN IS HERE', 0, 3.95),
  caption('READY TO COOK SOME CHAOS?', 4, 7.95),
  caption('CLOCK IN, CHEF!', 8, 12),
  `drawtext=fontfile=${font}:text='CHAOS KITCHEN':fontsize=16:fontcolor=0xffb84d:x=(w-tw)/2:y=h-40`,
  'fade=t=in:st=0:d=0.35,fade=t=out:st=11.5:d=0.5',
].join(',');
const audio = 'aevalsrc=0.012*(sin(2*PI*110*t)+sin(2*PI*165*t)+sin(2*PI*220*t))*(0.65+0.35*sin(2*PI*2*t))+0.07*sin(2*PI*880*t)*exp(-8*(t-0.5))*between(t\\,0.5\\,1.3):s=44100:d=12';
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-loop', '1', '-i', poster, '-f', 'lavfi', '-i', audio, '-vf', filters, '-af', 'afade=t=in:d=0.2,afade=t=out:st=11:d=1', '-t', '12', '-c:v', 'libx264', '-preset', 'medium', '-crf', '29', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', video]);
console.log('Rendered 12-second animated key-art video with original synthesized audio.');
