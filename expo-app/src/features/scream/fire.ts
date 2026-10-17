/**
 * Огонь после «Отпустить»: плоские слои пламени поднимаются снизу, закрывают экран и уходят вверх,
 * открывая результат. Слой — полоса: языки сверху, сплошное тело, рваный хвост снизу (доли высоты экрана).
 * Тело — обычный цветной блок, SVG только у краёв: на Android SVG рисуется картинкой во весь свой размер.
 * Первый, задний слой длинный и закрывает экран целиком; остальные — короткие языки внутри него, сердцевина огня.
 */
export type FlameLayer = { tongues: number; body: number; tail: number; delayMs: number };

export const FLAME_LAYERS: FlameLayer[] = [
  { tongues: 0.45, body: 1.6, tail: 0.35, delayMs: 0 },
  { tongues: 0.4, body: 0.8, tail: 0.35, delayMs: 120 },
  { tongues: 0.35, body: 0.45, tail: 0.3, delayMs: 260 },
  { tongues: 0.3, body: 0.15, tail: 0.25, delayMs: 420 },
];

/** Высота полосы в долях экрана. */
export function bandOf(layer: FlameLayer): number {
  return layer.tongues + layer.body + layer.tail;
}

/** За сколько задний слой проходит путь от низа экрана до выхода целиком за верх. */
export const FIRE_MS = 1500;
// Все слои поднимаются с одной скоростью, в экранах за мс: короткому слою путь короче.
const SPEED = (1 + bandOf(FLAME_LAYERS[0])) / FIRE_MS;

/** Сколько слой идёт от низа экрана до выхода за верх. */
export function durationOf(layer: FlameLayer): number {
  return Math.round((1 + bandOf(layer)) / SPEED);
}

/** Огонь закончился: последний слой ушёл за верх. */
export const DONE_MS = Math.max(...FLAME_LAYERS.map((layer) => layer.delayMs + durationOf(layer)));

/** Верх полосы в долях экрана от его верха: при 0 полоса под экраном, при 1 — целиком над ним. */
export function bandTop(progress: number, band: number): number {
  'worklet';
  return 1 - progress * (1 + band);
}

// Задний слой закрывает экран своим сплошным телом, пока progress между этими долями.
const BACK = FLAME_LAYERS[0];
const COVER_FROM = (1 + BACK.tongues) / (1 + bandOf(BACK));
const COVER_TO = (BACK.tongues + BACK.body) / (1 + bandOf(BACK));
/** Середина этого окна: экран закрыт — под огнём можно сменить замер на результат. */
export const COVERED_MS = Math.round(((COVER_FROM + COVER_TO) / 2) * FIRE_MS);

/**
 * Рваный край слоя для SVG шириной width и высотой height: языки разной ширины и высоты с наклоном
 * и мягкими скруглёнными кончиками (как у Тимки, docs/02), основание — по нижнему краю.
 * Им рисуются и языки сверху слоя, и его хвост снизу (тот же край, перевёрнутый).
 */
export function flameEdge(width: number, height: number, random: () => number = Math.random): string {
  // Языки начинаются и кончаются за краями: на краях экрана не видно обрезанных половинок.
  const from = -0.15 * width;
  const to = 1.15 * width;
  let d = `M ${from} ${height} `;
  for (let x = from; x < to; ) {
    const w = width * (0.24 + 0.2 * random());
    const h = height * (0.35 + 0.65 * random());
    const lean = (random() - 0.5) * 0.7;
    const tip = x + w / 2 + lean * w;
    const tipY = height - h;
    const end = x + w;
    const r = 0.07 * w;
    d +=
      `C ${x + w * 0.05} ${height - h * 0.45} ${tip - w * 0.2 - lean * w * 0.4} ${tipY + h * 0.35} ${tip - r} ${tipY + r * 0.6} ` +
      `Q ${tip} ${tipY} ${tip + r} ${tipY + r * 0.6} ` +
      `C ${tip + w * 0.12 - lean * w * 0.2} ${tipY + h * 0.4} ${end - w * 0.02} ${height - h * 0.35} ${end} ${height} `;
    x = end;
  }
  return `${d}Z`;
}
