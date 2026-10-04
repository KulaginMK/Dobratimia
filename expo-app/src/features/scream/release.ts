/** Как исчезают слова после «Отпустить»: шредер, взрыв или развеивание по ветру. */
export type ReleaseEffect = 'shred' | 'burst' | 'dust';

const EFFECTS: ReleaseEffect[] = ['shred', 'burst', 'dust'];

/** Сначала весь текст увеличивается — так исчезновение заметнее. На 10%: больше — и он вылезет за рамку поля. */
export const GROW_MS = 450;
export const GROW_SCALE = 1.1;
// Короткая пауза между увеличением и первым словом.
const HOLD_MS = 120;
/** Сколько длится исчезновение одного слова. */
const WORD_MS: Record<ReleaseEffect, number> = { shred: 700, burst: 650, dust: 800 };
// Слова уходят по порядку, с минимальной задержкой. У длинного текста задержка меньше:
// вся анимация не должна тянуться дольше TOTAL_MAX_MS.
const STAGGER_MS = 70;
const TOTAL_MAX_MS = 3200;
// Очень длинный текст уходит не по одному слову, а по нескольку — иначе телефон не успеет это нарисовать.
const UNITS_MAX = 90;
const PIECES_MAX = 200;

/** Строка текста, как она легла в поле: отступ сверху и её слова вместе с пробелами после них. */
export type MeasuredLine = { top: number; tokens: string[] };

/**
 * Кусочек слова: окошко в сетке cols × rows и то, как оно улетает.
 * Время — в долях исчезновения слова (0…1), расстояния — в dp, поворот — в градусах.
 */
export type Piece = {
  key: string;
  col: number;
  row: number;
  /** Когда кусочек трогается с места. */
  delay: number;
  /** Сдвиг к концу движения. */
  dx: number;
  dy: number;
  /** Падение вниз с разгоном, как у бумаги. */
  fall: number;
  rotate: number;
  /** Масштаб к концу движения. */
  scale: number;
  /** С какой доли своего движения кусочек начинает таять. */
  fadeFrom: number;
  /** Сдвиг в сторону в самом начале: полосы шредера расходятся, будто их разрезали. */
  cut: number;
  /** true — кусочек разгоняется (падает), false — тормозит (разлетается). */
  accelerate: boolean;
};

/** Слово (или несколько слов подряд, если текст очень длинный) и его кусочки. */
export type Unit = {
  key: string;
  text: string;
  /** Когда слово начинает исчезать, мс от нажатия «Отпустить». */
  startMs: number;
  cols: number;
  rows: number;
  /** Пусто — это просто пробелы: они ничего не показывают и не анимируются. */
  pieces: Piece[];
};

export type ReleasePlan = {
  lines: { key: string; top: number; units: Unit[] }[];
  wordMs: number;
  totalMs: number;
};

// Очередь эффектов живёт в памяти приложения: в ней только названия анимаций, текста здесь нет.
let queue: ReleaseEffect[] = [];
let last: ReleaseEffect | null = null;

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Следующая анимация: все три идут в случайном порядке, одна и та же дважды подряд не выпадает. */
export function nextReleaseEffect(): ReleaseEffect {
  if (queue.length === 0) {
    queue = shuffled(EFFECTS);
    if (queue[0] === last) queue.push(queue.shift() as ReleaseEffect);
  }
  last = queue.shift() as ReleaseEffect;
  return last;
}

/** Текст → слова вместе с пробелами после них; пробелы в начале строки — отдельным куском. */
export function splitWords(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

const random = (from: number, to: number) => from + Math.random() * (to - from);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Shape = Pick<Unit, 'cols' | 'rows' | 'pieces'>;

/** Шредер: слово режется на вертикальные полоски, они расходятся и падают. */
function shred(key: string, letters: number, max: number): Shape {
  const cols = clamp(Math.ceil(letters / 2), 2, Math.min(6, Math.max(2, max)));
  return {
    cols,
    rows: 1,
    pieces: Array.from({ length: cols }, (_, col) => ({
      key: `${key}-${col}`,
      col,
      row: 0,
      delay: random(0, 0.25),
      dx: random(-5, 5),
      dy: 0,
      fall: random(70, 130),
      rotate: random(-8, 8),
      scale: 1,
      fadeFrom: 0.6,
      cut: (col - (cols - 1) / 2) * 2,
      accelerate: true,
    })),
  };
}

/** Сетка кусочков для взрыва и развеивания: два ряда, пока хватает запаса на число кусочков. */
function grid(letters: number, max: number) {
  const rows = max >= 4 ? 2 : 1;
  const cols = clamp(Math.ceil(letters / 3), 2, Math.min(4, Math.max(2, Math.floor(max / rows))));
  return { cols, rows };
}

/** Взрыв: кусочки слова разлетаются от его середины, кувыркаясь. */
function burst(key: string, letters: number, max: number): Shape {
  const { cols, rows } = grid(letters, max);
  const pieces: Piece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Направление — от середины слова. Слово шире, чем выше, поэтому по вертикали добавляем разброс.
      const angle = Math.atan2(row - (rows - 1) / 2 + random(-0.6, 0.6), col - (cols - 1) / 2) + random(-0.4, 0.4);
      const distance = random(60, 150);
      pieces.push({
        key: `${key}-${row}-${col}`,
        col,
        row,
        delay: random(0, 0.08),
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        fall: 40,
        rotate: random(-200, 200),
        scale: random(0.4, 0.7),
        fadeFrom: 0.4,
        cut: 0,
        accelerate: false,
      });
    }
  }
  return { cols, rows, pieces };
}

/** Развеивание: кусочки слова слева направо отрываются и улетают вверх, тая. */
function dust(key: string, letters: number, max: number): Shape {
  const { cols, rows } = grid(letters, max);
  const pieces: Piece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pieces.push({
        key: `${key}-${row}-${col}`,
        col,
        row,
        delay: 0.35 * (col / (cols - 1)) + random(0, 0.1),
        dx: random(20, 80),
        dy: -random(30, 100),
        fall: 0,
        rotate: random(-35, 35),
        scale: random(0.2, 0.5),
        fadeFrom: 0.2,
        cut: 0,
        accelerate: false,
      });
    }
  }
  return { cols, rows, pieces };
}

const BUILDERS = { shred, burst, dust };

/** Соседние слова строки — по `size` в одном куске. */
function chunked(tokens: string[], size: number): string[] {
  if (size <= 1) return tokens;
  const chunks: string[] = [];
  for (let i = 0; i < tokens.length; i += size) chunks.push(tokens.slice(i, i + size).join(''));
  return chunks;
}

const isWord = (token: string) => token.trim() !== '';

/** Расписывает исчезновение: какое слово когда уходит и на какие кусочки распадается. */
export function planRelease(effect: ReleaseEffect, measured: MeasuredLine[]): ReleasePlan {
  const words = measured.reduce((count, line) => count + line.tokens.filter(isWord).length, 0);
  const lines = measured.map((line) => ({ top: line.top, tokens: chunked(line.tokens, Math.ceil(words / UNITS_MAX)) }));
  const units = lines.reduce((count, line) => count + line.tokens.filter(isWord).length, 0);

  const wordMs = WORD_MS[effect];
  const firstMs = GROW_MS + HOLD_MS;
  const stagger = units > 1 ? Math.min(STAGGER_MS, (TOTAL_MAX_MS - firstMs - wordMs) / (units - 1)) : 0;
  const piecesPerUnit = Math.max(1, Math.floor(PIECES_MAX / Math.max(1, units)));

  let order = 0;
  return {
    wordMs,
    totalMs: firstMs + Math.max(0, units - 1) * stagger + wordMs,
    lines: lines.map((line, lineIndex) => ({
      key: `l${lineIndex}`,
      top: line.top,
      units: line.tokens.map((token, tokenIndex) => {
        const key = `u${lineIndex}-${tokenIndex}`;
        // Переносы строк уже учтены в строках. Обычные пробелы меняем на неразрывные:
        // иначе пробел в конце слова не занимает места, и слова слипаются.
        const text = token.replace(/[\r\n]/g, '').replace(/\s/g, ' ');
        if (!isWord(token)) return { key, text, startMs: 0, cols: 1, rows: 1, pieces: [] };
        const startMs = firstMs + order * stagger;
        order += 1;
        return { key, text, startMs, ...BUILDERS[effect](key, token.trim().length, piecesPerUnit) };
      }),
    })),
  };
}
