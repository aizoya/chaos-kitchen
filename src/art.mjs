const wrap = (body) =>
  `<svg viewBox="0 0 100 80" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const stroke =
  'stroke="#28271f" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"';
export const FOOD = {
  rice: wrap(
    `<path d="M14 54 Q12 36 25 33 Q24 20 38 22 Q44 8 56 21 Q72 14 76 32 Q91 37 86 54Z" fill="#fff5d5" ${stroke}/><path d="M12 53 Q48 66 89 53 L79 69 Q49 81 22 68Z" fill="#cf6843" ${stroke}/><g stroke="#c2a572" stroke-width="3" stroke-linecap="round"><path d="m30 36 4-4m14 7 4-4m12-4 4 4m-22-9 3 3m19 12 4-3m-46 5 4 3m28 1 4 2"/></g>`,
  ),
  chicken: wrap(
    `<path d="m22 54-10 8q-10-1-7 8 4 6 10 0l15-8" fill="#fff0d4" ${stroke}/><path d="M26 62C5 37 37 12 60 17s41 39 17 46Q50 78 26 62Z" fill="#d98736" ${stroke}/><path d="M31 54C19 36 43 20 57 26s28 21 14 29" fill="#efa952"/><g ${stroke} fill="none"><path d="m37 34 18 21m-7-29 19 20m-9-24 18 18"/></g>`,
  ),
  plantain: wrap(
    `<g ${stroke}><path d="M14 46 70 13q15 0 17 12L32 64q-17 5-18-18Z" fill="#d18a26"/><path d="m16 43 53-30q15-3 18 10L33 57Q18 59 16 43Z" fill="#f5c84a"/><path d="m24 43 48-24" fill="none" stroke="#a9752a"/><path d="M34 62 75 32q16 0 16 13L52 76q-17 4-18-14Z" fill="#d18a26"/><path d="m36 59 38-28q15-1 18 10L52 69q-13 2-16-10Z" fill="#f5c84a"/><path d="m44 58 33-22" fill="none" stroke="#a9752a"/></g>`,
  ),
  beans: wrap(
    `<path d="M12 43q40-17 77 0l-9 22q-29 17-57 0Z" fill="#83a7a0" ${stroke}/><ellipse cx="50" cy="43" rx="38" ry="14" fill="#522f2e" ${stroke}/><g fill="#b86c56" ${stroke}><path d="M22 37q-9 4-3 12 7 5 14-1l-2-9q-3 4-9-2Z"/><path d="M44 30q-9 3-4 12 6 5 14-1l-2-10q-3 4-8-1Z"/><path d="M67 38q-9 3-4 12 6 5 14-1l-2-10q-3 4-8-1Z"/><path d="M42 44q-9 3-4 12 6 5 14-1l-2-10q-3 4-8-1Z"/></g>`,
  ),
  garlic: wrap(
    `<path d="M48 10q0 19-17 26C3 67 69 83 81 53q1-12-18-22L59 9" fill="#f4e7c8" ${stroke}/><path d="M50 21q-22 31-4 48m9-42q19 24 6 42" fill="none" stroke="#bea989" stroke-width="2"/><path d="m41 73 6-6 6 6 5-5 6 3" fill="none" ${stroke}/>`,
  ),
  chili: wrap(
    `<path d="M70 28Q92 60 49 69 21 75 9 52q25 14 39-8L58 25Z" fill="#ed5536" ${stroke}/><path d="m56 27 2-9 10 2q3-13 15-14" fill="none" stroke="#668943" stroke-width="6" stroke-linecap="round"/><path d="M64 35q5 16-12 21" fill="none" stroke="#ffb496" stroke-width="4" stroke-linecap="round"/>`,
  ),
  cream: wrap(
    `<path d="m26 24 7-15h32l10 15-4 47H29Z" fill="#fff0d2" ${stroke}/><path d="m26 24 22 7 27-7M48 31v38M33 9l15 16 17-16" fill="none" ${stroke}/><path d="M31 41 47 45v15l-16-4Z" fill="#ed693e"/><path d="M55 40 68 36v15l-13 4Z" fill="#ed693e"/>`,
  ),
  lime: wrap(
    `<path d="M14 53 71 13q27 25 1 49Q42 84 14 53Z" fill="#6f9238" ${stroke}/><path d="M17 50 72 15q21 24-2 43Q41 77 17 50Z" fill="#d0df78" ${stroke}/><path d="m26 49 37-25m-8 6 10 26M45 39l2 25M35 45l-7 14" fill="none" stroke="#90ab48" stroke-width="3"/>`,
  ),
  curry: wrap(`<path d="M12 42h76L78 65Q50 79 22 65Z" fill="#cf6843" ${stroke}/><ellipse cx="50" cy="42" rx="38" ry="15" fill="#e6a330" ${stroke}/><g fill="#c77532" ${stroke}><path d="m25 34 14-3 6 12-16 5Z"/><path d="m55 40 13-6 10 11-15 8Z"/></g><path d="m42 50 8-8m3-17 8 5" stroke="#678f43" stroke-width="4" stroke-linecap="round"/>`),
  fries: wrap(`<g fill="#f5c84a" ${stroke}><path d="m21 51-5-35 10-2 7 37Z"/><path d="m36 51-1-43h10l2 43Z"/><path d="m49 51 8-38 10 2-6 36Z"/><path d="m65 51 8-30 10 3-7 31Z"/></g><path d="m18 39 12 33h39l14-33Q50 55 18 39Z" fill="#e95b39" ${stroke}/><path d="m45 58 6 6 7-9" fill="none" stroke="#fff0d2" stroke-width="4"/>`),
  spaghetti: wrap(`<ellipse cx="50" cy="49" rx="42" ry="24" fill="#fff0d2" ${stroke}/><path d="M21 49q-6-20 19-15t20 13-30 6 10-13 30 13-37 8 6-27 35 14-21 5" fill="none" stroke="#d6a348" stroke-width="6" stroke-linecap="round"/><path d="m43 31 14-3 13 11-15 5-19-5Z" fill="#dc6241" ${stroke}/><path d="m52 33 8-9" stroke="#688c43" stroke-width="4"/>`),
  alfredo: wrap(`<path d="M14 38h57v21Q42 81 18 60Z" fill="#83a7a0" ${stroke}/><path d="M70 42q25-10 18 9l-17 6" fill="none" ${stroke}/><ellipse cx="42" cy="38" rx="28" ry="13" fill="#fff3d5" ${stroke}/><path d="M28 38q14-11 28 0" fill="none" stroke="#d7bd84" stroke-width="3"/><path d="m33 16 3-8m16 9 4-9" stroke="#899485" stroke-width="3" stroke-linecap="round"/>`),
  tamale: wrap(`<path d="m15 44 16-27 43 7 14 22-24 25-37-8Z" fill="#adc16e" ${stroke}/><path d="m31 17 24 30 19-23M15 44l40 3 9 24M88 46l-33 1" fill="none" ${stroke}/><path d="m23 39 28 13m-18-25 20 19m8 8 17-8" fill="none" stroke="#7f974c" stroke-width="2"/><path d="m46 43 16 10m-15 2 13-13" stroke="#e9d9a0" stroke-width="4"/>`),
  nuggets: wrap(`<ellipse cx="50" cy="60" rx="39" ry="12" fill="#fff0d2" ${stroke}/><g fill="#dba34b" ${stroke}><path d="M14 46q-5-17 12-22 18-5 23 12t-14 22Q17 62 14 46Z"/><path d="M46 35q-4-17 14-18 20-2 23 16T65 49Q48 51 46 35Z"/><path d="M39 59q-4-14 13-18 21-4 24 11t-18 16Q44 72 39 59Z"/></g><path d="m26 34 3-3m34-4 4 1m-11 25 4-2" stroke="#f5ca74" stroke-width="4" stroke-linecap="round"/>`),
  burger: wrap(`<path d="M14 35C14 3 83 3 86 35Z" fill="#dba34b" ${stroke}/><path d="m13 40 13-6 15 6 15-5 17 5 14-4-3 14H15Z" fill="#8db15a" ${stroke}/><path d="M15 48h70v10H15Z" fill="#784b31" ${stroke}/><path d="m19 56 20 10 17-9h24l-3 13H22Z" fill="#e9b961" ${stroke}/><path d="m31 25 3-3m15-4 3 1m12 7 3-2" stroke="#fff0d2" stroke-width="3" stroke-linecap="round"/>`),
  ketchup: wrap(`<path d="m42 6-3 14h22L57 6Z" fill="#fff0d2" ${stroke}/><path d="M39 20h22l8 15v34H31V35Z" fill="#d64732" ${stroke}/><path d="M34 40h32v19H34Z" fill="#fff0d2" ${stroke}/><path d="M50 44q-11 10 0 12 11-2 0-12Z" fill="#d64732"/>`),
  cheese: wrap(`<path d="m14 50 52-29 20 22v22H14Z" fill="#f0c34c" ${stroke}/><path d="m14 50 72-7M66 21v16" fill="none" ${stroke}/><g fill="#cf932b"><circle cx="38" cy="54" r="4"/><circle cx="67" cy="57" r="5"/><ellipse cx="59" cy="36" rx="5" ry="3"/></g>`),
  tomato: wrap(`<path d="M49 24C11 6 2 66 37 72c14 4 13-1 24 0 35-2 33-62-5-48Z" fill="#e26247" ${stroke}/><path d="m49 28-15-9 14 1 8-11 1 13 16-2-14 12Z" fill="#689447" ${stroke}/><path d="M26 35q-9 12-2 23" fill="none" stroke="#ffb59c" stroke-width="4" stroke-linecap="round"/>`),
  lettuce: wrap(`<path d="M49 72Q4 61 15 39 4 23 27 22 33 3 49 18 71 1 76 22 99 27 82 43 93 63 49 72Z" fill="#89b15c" ${stroke}/><path d="M49 69V27m0 26L28 35m21 24 23-23m-23 9 13-18" fill="none" stroke="#527c3d" stroke-width="3" stroke-linecap="round"/>`),
};
export const BELL = `<svg viewBox="0 0 64 56" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M9 40h46M15 39C15 15 49 15 49 39M32 16v-5m-5 0h10M8 47h48M5 19l5 4M58 19l-5 4"/></g></svg>`;
export const FLAME = `<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M23 2c5 17-9 16-4 27 5-1 8-7 8-12 20 19 4 31-9 29C1 44-2 26 8 17c-1 11 4 14 7 10C8 15 22 12 23 2Z" fill="currentColor"/></svg>`;
