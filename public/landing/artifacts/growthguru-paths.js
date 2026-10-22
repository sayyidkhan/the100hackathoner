// Representative paths in GrowthGuru's src/data/data.js, in source order.
export const LEARNING_PATHS = [
  { title: 'Frontend', color: 0xbd684b, skills: ['HTML', 'CSS', 'JavaScript'], symbols: ['</>', '#', 'JS'], detail: 'Give a page structure, add its style, then bring it to life with JavaScript.' },
  { title: 'Backend', color: 0xc39746, skills: ['Internet', 'HTTP', 'Python'], symbols: ['www', '↔', 'Py'], detail: 'Explore how the web works, understand HTTP, then learn a programming language.' },
  { title: 'Database', color: 0x397c72, skills: ['Databases', 'SQL', 'MySQL'], symbols: ['DB', 'SQL', '≡'], detail: 'Start with data storage, follow the SQL branch, then explore MySQL.' },
];

export function pathState(time, selected = 0, epoch = 0, start = 0) {
  const age = Math.max(0, time - epoch);
  const index = selected === null ? (start + Math.floor(age / 10)) % LEARNING_PATHS.length : selected;
  return { index, progress: (age % 10) / 10, milestone: Math.min(2, Math.floor((age % 10) / 2.8)) };
}
