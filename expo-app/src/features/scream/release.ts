/** Как исчезает текст после «Отпустить»: шредер, взрыв или развеивание по ветру. */
export type ReleaseEffect = 'shred' | 'burst' | 'dust';

/** Длительность каждой анимации, мс. */
export const RELEASE_MS: Record<ReleaseEffect, number> = { shred: 2200, burst: 1800, dust: 2400 };

const EFFECTS: ReleaseEffect[] = ['shred', 'burst', 'dust'];

/**
 * Кусок текста: окошко в поле ввода и то, как оно улетает.
 * Время — в долях всей анимации (0…1), расстояния — в dp, поворот — в градусах.
 */
export type Piece = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Когда кусок трогается с места. */
  delay: number;
  /** Сколько длится его движение. */
  span: number;
  /** Сдвиг к концу движения. */
  dx: number;
  dy: number;
  /** Падение вниз с разгоном, как у бумаги. */
  fall: number;
  rotate: number;
  /** Масштаб к концу движения. */
  scale: number;
  /** С какой доли своего движения кусок начинает таять. */
  fadeFrom: number;
  /** Сдвиг в сторону в самом начале: полосы шредера расходятся, будто их разрезали. */
  cut: number;
  /** true — кусок разгоняется (падает), false — тормозит (разлетается). */
  accelerate: boolean;
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

// Шредер: ширина полосы и сколько их бывает.
const STRIP_WIDTH = 16;
const STRIPS_MIN = 8;
const STRIPS_MAX = 24;
const STRIP_GAP = 1.2;
// Взрыв и развеивание: размер кусочка.
const SHARD = { width: 52, height: 44 };
const SPECK = { width: 38, height: 30 };
// Каждый кусок — копия всего текста в окошке, поэтому у длинного текста кусков меньше.
const PIECES_MAX = 54;
const PIECES_MAX_LONG = 24;
const LONG_TEXT = 1500;

const random = (from: number, to: number) => from + Math.random() * (to - from);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Границы ячеек по целым точкам: между соседними кусками не остаётся щелей. */
function edges(size: number, count: number): number[] {
  return Array.from({ length: count + 1 }, (_, i) => Math.round((i * size) / count));
}

function grid(width: number, height: number, cell: { width: number; height: number }, max: number) {
  const cols = clamp(Math.round(width / cell.width), 2, 10);
  const rows = clamp(Math.round(height / cell.height), 2, Math.max(2, Math.floor(max / cols)));
  return { cols, rows, xs: edges(width, cols), ys: edges(height, rows) };
}

/** Шредер: текст режется на вертикальные полосы, они расходятся и падают вниз. */
function shred(width: number, height: number): Piece[] {
  const count = clamp(Math.round(width / STRIP_WIDTH), STRIPS_MIN, STRIPS_MAX);
  const xs = edges(width, count);
  return Array.from({ length: count }, (_, i) => ({
    key: `s${i}`,
    x: xs[i],
    y: 0,
    width: xs[i + 1] - xs[i],
    height,
    delay: random(0.12, 0.42),
    span: 0.55,
    dx: random(-6, 6),
    dy: 0,
    fall: height * 0.6 + random(120, 200),
    rotate: random(-4, 4),
    scale: 1,
    fadeFrom: 0.7,
    cut: (i - (count - 1) / 2) * STRIP_GAP,
    accelerate: true,
  }));
}

/** Взрыв: куски разлетаются от середины поля, кувыркаясь. */
function burst(width: number, height: number, max: number): Piece[] {
  const { cols, rows, xs, ys } = grid(width, height, SHARD, max);
  const pieces: Piece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const centerX = (xs[col] + xs[col + 1]) / 2 - width / 2;
      const centerY = (ys[row] + ys[row + 1]) / 2 - height / 2;
      const angle = Math.atan2(centerY, centerX) + random(-0.35, 0.35);
      const distance = random(140, 300);
      pieces.push({
        key: `b${row}-${col}`,
        x: xs[col],
        y: ys[row],
        width: xs[col + 1] - xs[col],
        height: ys[row + 1] - ys[row],
        delay: random(0, 0.06),
        span: 0.9,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        fall: 80,
        rotate: random(-180, 180),
        scale: random(0.4, 0.7),
        fadeFrom: 0.45,
        cut: 0,
        accelerate: false,
      });
    }
  }
  return pieces;
}

/** Развеивание: кусочки по очереди, слева направо, отрываются и улетают вверх, тая. */
function dust(width: number, height: number, max: number): Piece[] {
  const { cols, rows, xs, ys } = grid(width, height, SPECK, max);
  const pieces: Piece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const wave = 0.75 * (col / (cols - 1)) + 0.25 * (row / (rows - 1));
      pieces.push({
        key: `d${row}-${col}`,
        x: xs[col],
        y: ys[row],
        width: xs[col + 1] - xs[col],
        height: ys[row + 1] - ys[row],
        delay: 0.55 * wave + random(0, 0.1),
        span: 0.35,
        dx: random(30, 100),
        dy: -random(30, 110),
        fall: 0,
        rotate: random(-25, 25),
        scale: random(0.2, 0.5),
        fadeFrom: 0.15,
        cut: 0,
        accelerate: false,
      });
    }
  }
  return pieces;
}

/** Делит поле с текстом (width × height) на куски и задаёт каждому его полёт. */
export function buildPieces(effect: ReleaseEffect, width: number, height: number, textLength: number): Piece[] {
  const max = textLength > LONG_TEXT ? PIECES_MAX_LONG : PIECES_MAX;
  if (effect === 'shred') return shred(width, height);
  if (effect === 'burst') return burst(width, height, max);
  return dust(width, height, max);
}
