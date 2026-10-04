/* @ds-bundle: {"format":4,"namespace":"Dobratimia","components":[{"name":"Logo"},{"name":"Timka"},{"name":"Icon"},{"name":"Button"},{"name":"Card"},{"name":"TextField"},{"name":"Switch"},{"name":"Chip"},{"name":"ScreenIndicator"},{"name":"BottomSheet"},{"name":"Toast"},{"name":"EmptyState"},{"name":"Skeleton"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;
  var uid = 0;
  function nextId(prefix) { uid += 1; return prefix + '-' + uid; }
  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(' ');
  }
  function useControlled(value, defaultValue) {
    var st = useState(defaultValue);
    var isControlled = value !== undefined;
    return [isControlled ? value : st[0], function (v) { if (!isControlled) st[1](v); }];
  }

  /* ---------- Logo ---------- */
  var HALF = 'M10.5 21 Q10.5 17 14.5 17 H16.5 C25 17.4 30.2 23.2 31.8 31 L31 38 C28.8 30.5 24.5 26.2 18.5 25.8 V33 C18.5 44 23.5 51.5 31 56.5 C18 55.5 10.5 46 10.5 33 Z';
  function stop(offset, token) { return h('stop', { offset: offset, style: { stopColor: 'var(--' + token + ')' } }); }
  function LogoMark(props) {
    var size = props.size || 48;
    var mono = props.mono;
    var ids = React.useMemo(function () { return { l: nextId('dt-lg-l'), r: nextId('dt-lg-r'), s: nextId('dt-lg-s') }; }, []);
    var fl = mono || 'url(#' + ids.l + ')';
    var fr = mono || 'url(#' + ids.r + ')';
    var fs = mono || 'url(#' + ids.s + ')';
    return h('svg', { width: size, height: size, viewBox: '0 0 64 64', role: 'img', 'aria-label': props.title || 'Добратимия', className: 'dt-logo-mark' },
      mono ? null : h('defs', null,
        h('linearGradient', { id: ids.l, x1: 0, y1: 17, x2: 0, y2: 57, gradientUnits: 'userSpaceOnUse' }, stop(0, 'logo\\.deep'), stop(1, 'logo\\.warm')),
        h('linearGradient', { id: ids.r, x1: 0, y1: 17, x2: 0, y2: 57, gradientUnits: 'userSpaceOnUse' }, stop(0, 'logo\\.orange'), stop(1, 'logo\\.apricot')),
        h('linearGradient', { id: ids.s, x1: 0, y1: 55, x2: 0, y2: 33, gradientUnits: 'userSpaceOnUse' }, stop(0, 'logo\\.orange'), stop(0.55, 'logo\\.leaf'), stop(1, 'logo\\.leafDeep'))
      ),
      h('path', { d: HALF, fill: fl }),
      h('g', { transform: 'translate(64 0) scale(-1 1)' }, h('path', { d: HALF, fill: fr })),
      h('circle', { cx: 32, cy: 9.5, r: 5.5, fill: mono || 'var(--logo\\.head)', style: mono ? null : { fill: 'var(--logo\\.head)' } }),
      h('path', { d: 'M32 54 C31.2 50 31.4 45.5 32.6 41.5', fill: 'none', stroke: fs, strokeWidth: 2.4, strokeLinecap: 'round' }),
      h('path', { d: 'M31.6 48.5 C26.4 48.6 22.6 45.2 22.2 39.8 C27.6 39.6 31.4 43 31.6 48.5Z', fill: fs }),
      h('path', { d: 'M32.6 43.6 C33 38 37 34.4 42.4 34.4 C42.4 40 38.4 43.6 32.6 43.6Z', fill: fs })
    );
  }
  function Logo(props) {
    var size = props.size || 40;
    var variant = props.variant || 'horizontal';
    var mark = h(LogoMark, { size: size, mono: props.mono, title: variant === 'mark' ? 'Добратимия' : '' });
    if (variant === 'mark') return h('span', { className: 'dt-logo' }, mark);
    var word = h('span', { className: 'dt-logo-word', style: { fontSize: Math.round(size * 0.58) + 'px', color: props.mono || undefined } }, 'Добратимия');
    if (variant === 'stacked') return h('span', { className: 'dt-logo dt-logo--stacked' }, mark, word);
    return h('span', { className: 'dt-logo' }, mark, word);
  }

  /* ---------- Timka ---------- */
  var INK = '#2C1F1A';
  function tv(token) { return { fill: 'var(--' + token + ')' }; }
  function face(eyesClosed, y, mouth) {
    var parts = [];
    if (eyesClosed) {
      parts.push(h('path', { key: 'e1', d: 'M44 ' + y + ' Q48 ' + (y + 3.5) + ' 52 ' + y, fill: 'none', stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round' }));
      parts.push(h('path', { key: 'e2', d: 'M68 ' + y + ' Q72 ' + (y + 3.5) + ' 76 ' + y, fill: 'none', stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round' }));
    } else {
      parts.push(h('circle', { key: 'e1', cx: 48, cy: y, r: 3.6, fill: INK }));
      parts.push(h('circle', { key: 'e2', cx: 72, cy: y, r: 3.6, fill: INK }));
    }
    if (mouth === 'o') parts.push(h('circle', { key: 'm', cx: 60, cy: y + 13, r: 3.6, fill: INK }));
    else if (mouth !== 'none') parts.push(h('path', { key: 'm', d: 'M53 ' + (y + 9) + ' Q60 ' + (y + 16) + ' 67 ' + (y + 9), fill: 'none', stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round' }));
    parts.push(h('ellipse', { key: 'c1', cx: 39, cy: y + 9, rx: 5.5, ry: 3.2, opacity: 0.55, style: tv('mascot\\.cheek') }));
    parts.push(h('ellipse', { key: 'c2', cx: 81, cy: y + 9, rx: 5.5, ry: 3.2, opacity: 0.55, style: tv('mascot\\.cheek') }));
    return parts;
  }
  var SPROUT_UP = [
    h('path', { key: 's', d: 'M60 30 C60 22 59 16 60 10', fill: 'none', strokeWidth: 3.5, strokeLinecap: 'round', style: { stroke: 'var(--logo\\.leafDeep)' } }),
    h('path', { key: 'l1', d: 'M59.5 18 C53 19 47 15 46 7 C54 6 59 10 59.5 18Z', style: tv('logo\\.leaf') }),
    h('path', { key: 'l2', d: 'M60.5 14 C61 6 67 2 75 3 C75 11 69 15 60.5 14Z', style: tv('logo\\.leafDeep') })
  ];
  var SPROUT_SLEEP = [
    h('path', { key: 's', d: 'M60 40 C61 32 64 27 70 24', fill: 'none', strokeWidth: 3.5, strokeLinecap: 'round', style: { stroke: 'var(--logo\\.leafDeep)' } }),
    h('path', { key: 'l1', d: 'M66 27 C62 21 56 20 50 22 C54 28 60 30 66 27Z', style: tv('logo\\.leaf') }),
    h('path', { key: 'l2', d: 'M69 25 C73 18 80 17 86 20 C82 26 75 28 69 25Z', style: tv('logo\\.leafDeep') })
  ];
  function Timka(props) {
    var size = props.size || 160;
    var pose = props.pose || 'hello';
    var label = { hello: 'Тимка машет', breathe: 'Тимка дышит', sleep: 'Тимка спит' }[pose] || 'Тимка';
    var kids = [];
    if (pose === 'breathe') {
      kids.push(h('circle', { key: 'ring', cx: 60, cy: 66, r: 52, style: tv('color\\.primarySoft') }));
      kids = kids.concat(SPROUT_UP);
      kids.push(h('path', { key: 'b', d: 'M60 28 C88 28 102 48 102 70 C102 92 84 102 60 102 C36 102 18 92 18 70 C18 48 32 28 60 28Z', style: tv('logo\\.apricot') }));
      kids = kids.concat(face(true, 64, 'o'));
    } else if (pose === 'sleep') {
      kids.push(h('ellipse', { key: 'sh', cx: 60, cy: 104, rx: 38, ry: 4.5, style: tv('color\\.border') }));
      kids = kids.concat(SPROUT_SLEEP);
      kids.push(h('path', { key: 'b', d: 'M60 38 C90 38 106 56 106 76 C106 96 86 102 60 102 C34 102 14 96 14 76 C14 56 30 38 60 38Z', style: tv('logo\\.apricot') }));
      kids = kids.concat(face(true, 74, 'none'));
      kids.push(h('path', { key: 'z1', d: 'M92 30 H100 L92 40 H100', fill: 'none', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', style: { stroke: 'var(--color\\.textMuted)' } }));
      kids.push(h('path', { key: 'z2', d: 'M104 16 H110 L104 23 H110', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { stroke: 'var(--color\\.textMuted)' } }));
    } else {
      kids = kids.concat(SPROUT_UP);
      kids.push(h('ellipse', { key: 'sh', cx: 60, cy: 104, rx: 32, ry: 4.5, style: tv('color\\.border') }));
      kids.push(h('ellipse', { key: 'arm', cx: 103, cy: 58, rx: 7, ry: 11, transform: 'rotate(28 103 58)', style: tv('logo\\.apricot') }));
      kids.push(h('path', { key: 'b', d: 'M60 28 C86 28 100 48 100 70 C100 92 82 102 60 102 C38 102 20 92 20 70 C20 48 34 28 60 28Z', style: tv('logo\\.apricot') }));
      kids = kids.concat(face(false, 64, 'smile'));
    }
    return h('svg', { width: size, height: size, viewBox: '0 -6 120 120', role: 'img', 'aria-label': props.title || label, className: 'dt-timka' }, kids);
  }

  /* ---------- Icon ---------- */
  var SOFT = 0.32;
  var ICONS = {
    home: [['p', 'M17 19 H31 Q37 19 37 25 V35 Q37 41 31 41 H17 Q11 41 11 35 V25 Q11 19 17 19Z', SOFT], ['p', 'M7 22 Q7 20 9 18.5 L22 8.6 Q24 7.2 26 8.6 L39 18.5 Q41 20 41 22 Q41 24 39 24 H9 Q7 24 7 22Z'], ['p', 'M24 29 Q28 29 28 33 V41 H20 V33 Q20 29 24 29Z']],
    scream: [['c', 24, 22, 17, SOFT], ['p', 'M24 6 Q31 6 31 13 V24 Q31 31 24 31 Q17 31 17 24 V13 Q17 6 24 6Z'], ['p', 'M22 31 H26 V38 H22Z'], ['p', 'M17 38 H31 Q33 38 33 40 Q33 42 31 42 H17 Q15 42 15 40 Q15 38 17 38Z']],
    breath: [['p', 'M9 12 H29 Q32 12 32 15 Q32 18 29 18 H9 Q6 18 6 15 Q6 12 9 12Z'], ['p', 'M9 21 H39 Q42 21 42 24 Q42 27 39 27 H9 Q6 27 6 24 Q6 21 9 21Z', SOFT], ['p', 'M9 30 H23 Q26 30 26 33 Q26 36 23 36 H9 Q6 36 6 33 Q6 30 9 30Z'], ['c', 36, 15, 4, SOFT]],
    techniques: [['c', 24, 19, 13, SOFT], ['p', 'M20 30 H28 Q31 30 31 33 Q31 36 28 36 H20 Q17 36 17 33 Q17 30 20 30Z'], ['p', 'M22 37 H26 Q28.5 37 28.5 39.5 Q28.5 42 26 42 H22 Q19.5 42 19.5 39.5 Q19.5 37 22 37Z'], ['p', 'M24 12 Q30 12 31 18 Q31.3 19.5 29.8 19.5 Q28.6 19.5 28.3 18.3 Q27.6 15 24 15 Q22.5 15 22.5 13.5 Q22.5 12 24 12Z']],
    diary: [['p', 'M17 7 H32 Q39 7 39 14 V34 Q39 41 32 41 H17 Q10 41 10 34 V14 Q10 7 17 7Z', SOFT], ['p', 'M14.5 7 Q19 7 19 11.5 V36.5 Q19 41 14.5 41 Q10 41 10 36.5 V11.5 Q10 7 14.5 7Z'], ['c', 29, 19, 5], ['p', 'M24.75 29 H33.25 Q35 29 35 30.75 Q35 32.5 33.25 32.5 H24.75 Q23 32.5 23 30.75 Q23 29 24.75 29Z']],
    specialist: [['p', 'M7 41 Q7 26 20 26 Q33 26 33 41 Z', SOFT], ['c', 20, 16, 8], ['p', 'M38 22 L33.2 17.2 Q31.4 15 33.2 13 Q35.4 11 38 13.6 Q40.6 11 42.8 13 Q44.6 15 42.8 17.2 Z']],
    map: [['p', 'M15 42 A9 2.6 0 1 0 33 42 A9 2.6 0 1 0 15 42Z', SOFT], ['p', 'M24 5 C16 5 11 11 11 18.5 C11 28 24 41 24 41 C24 41 37 28 37 18.5 C37 11 32 5 24 5Z M24 13 A5.5 5.5 0 1 0 24.01 13Z', 1, 'evenodd']],
    sos: [['ring', 24, 24, 13, 8, SOFT], ['ring', 24, 24, 13, 8, 1, '8 12.42', 4]],
    phone: [['p', 'M15 8 Q11 8 10 12 Q8 22 17 31 Q26 40 36 38 Q40 37 40 33 V29 Q40 27 38 26.5 L32 25 Q30 24.6 29 26 L27 28.5 Q21 25.5 19.5 20.5 L22 18.5 Q23.4 17.5 23 15.5 L21.5 9.5 Q21 8 19 8 Z'], ['s', 'M29 7 A12 12 0 0 1 41 19', 3.5, SOFT]],
    message: [['p', 'M10 9 H38 Q42 9 42 13 V30 Q42 34 38 34 H22 L14 41 V34 H10 Q6 34 6 30 V13 Q6 9 10 9Z', SOFT], ['c', 16, 21.5, 2.8], ['c', 24, 21.5, 2.8], ['c', 32, 21.5, 2.8]],
    heart: [['p', 'M24 40 L10.5 26.5 Q5 20.5 10.5 14.5 Q16.5 9 24 15.5 Q31.5 9 37.5 14.5 Q43 20.5 37.5 26.5 Z']],
    sprout: [['p', 'M13 43 A11 5.5 0 0 1 35 43Z', SOFT], ['s', 'M24 42 V24', 4], ['p', 'M23.5 31 C16 31 10.5 26 10 18 C18 17.8 23 23 23.5 31Z'], ['p', 'M24.5 26 C25 18 30.5 12.5 38.5 12.5 C38.5 20.5 33 26 24.5 26Z']],
    bell: [['p', 'M24 6 Q34 6 35 17 L36 28 L40 34 H8 L12 28 L13 17 Q14 6 24 6Z'], ['p', 'M19 37 H29 Q29 42 24 42 Q19 42 19 37Z', SOFT]],
    close: [['s', 'M14 14 L34 34 M34 14 L14 34', 4]],
    chevronRight: [['s', 'M19 12 L31 24 L19 36', 4]],
    chevronLeft: [['s', 'M29 12 L17 24 L29 36', 4]],
    check: [['s', 'M11 25 L20 34 L37 15', 4]],
    play: [['p', 'M16 10 Q16 7 19 8.5 L37 21.5 Q40 24 37 26.5 L19 39.5 Q16 41 16 38 Z']],
    pause: [['p', 'M14 10 H20 Q22 10 22 12 V36 Q22 38 20 38 H14 Q12 38 12 36 V12 Q12 10 14 10Z M28 10 H34 Q36 10 36 12 V36 Q36 38 34 38 H28 Q26 38 26 36 V12 Q26 10 28 10Z']]
  };
  function Icon(props) {
    var name = props.name || 'home';
    var size = props.size || 24;
    var spec = ICONS[name] || ICONS.home;
    var kids = spec.map(function (s, i) {
      if (s[0] === 'p') return h('path', { key: i, d: s[1], fill: 'currentColor', fillOpacity: s[2] === undefined ? 1 : s[2], fillRule: s[3] || undefined });
      if (s[0] === 'c') return h('circle', { key: i, cx: s[1], cy: s[2], r: s[3], fill: 'currentColor', fillOpacity: s[4] === undefined ? 1 : s[4] });
      if (s[0] === 's') return h('path', { key: i, d: s[1], fill: 'none', stroke: 'currentColor', strokeWidth: s[2], strokeLinecap: 'round', strokeLinejoin: 'round', strokeOpacity: s[3] === undefined ? 1 : s[3] });
      return h('circle', { key: i, cx: s[1], cy: s[2], r: s[3], fill: 'none', stroke: 'currentColor', strokeWidth: s[4], strokeOpacity: s[5], strokeDasharray: s[6], strokeDashoffset: s[7] });
    });
    var a11y = props.title ? { role: 'img', 'aria-label': props.title } : { 'aria-hidden': true };
    return h('svg', Object.assign({ width: size, height: size, viewBox: '0 0 48 48', className: cx('dt-icon', props.className), style: props.color ? { color: props.color } : undefined }, a11y), kids);
  }
  Icon.names = Object.keys(ICONS);

  /* ---------- Button ---------- */
  function Button(props) {
    var variant = props.variant || 'primary';
    var size = props.size || 'md';
    var content = [];
    if (props.icon) content.push(h(Icon, { key: 'i', name: props.icon, size: size === 'lg' ? 26 : 22 }));
    if (props.children !== undefined && props.children !== null) content.push(h('span', { key: 't', className: 'dt-btn__label' }, props.children));
    if (props.iconRight) content.push(h(Icon, { key: 'ir', name: props.iconRight, size: size === 'lg' ? 26 : 22 }));
    var cls = cx('dt-btn', 'dt-btn--' + variant, 'dt-btn--' + size, props.fullWidth && 'dt-btn--full', !props.children && 'dt-btn--icon-only', props.className);
    var common = { className: cls, onClick: props.onClick, 'aria-label': props['aria-label'] };
    if (props.href) return h('a', Object.assign({ href: props.href }, common), content);
    return h('button', Object.assign({ type: props.type || 'button', disabled: props.disabled }, common), content);
  }

  /* ---------- Card ---------- */
  function Card(props) {
    var variant = props.variant || 'surface';
    var cls = cx('dt-card', 'dt-card--' + variant, props.interactive && 'dt-card--interactive', props.className);
    if (props.onClick) return h('button', { type: 'button', className: cls, onClick: props.onClick, style: props.style }, props.children);
    return h('div', { className: cls, style: props.style }, props.children);
  }

  /* ---------- TextField ---------- */
  function TextField(props) {
    var id = React.useMemo(function () { return props.id || nextId('dt-field'); }, [props.id]);
    var st = useControlled(props.value, props.defaultValue || '');
    var invalid = !!props.error;
    var inputProps = {
      id: id, className: 'dt-field__input', value: st[0], placeholder: props.placeholder, disabled: props.disabled,
      'aria-invalid': invalid || undefined, 'aria-describedby': (props.hint || props.error) ? id + '-hint' : undefined,
      onChange: function (e) { st[1](e.target.value); if (props.onChange) props.onChange(e.target.value); }
    };
    var control = props.multiline ? h('textarea', Object.assign({ rows: props.rows || 4 }, inputProps)) : h('input', Object.assign({ type: props.type || 'text' }, inputProps));
    return h('div', { className: cx('dt-field', invalid && 'dt-field--error', props.disabled && 'dt-field--disabled', props.className) },
      props.label ? h('label', { className: 'dt-field__label', htmlFor: id }, props.label) : null,
      control,
      (props.error || props.hint) ? h('div', { id: id + '-hint', className: 'dt-field__hint' }, props.error || props.hint) : null
    );
  }

  /* ---------- Switch ---------- */
  function Switch(props) {
    var st = useControlled(props.checked, !!props.defaultChecked);
    var on = !!st[0];
    var id = React.useMemo(function () { return nextId('dt-sw'); }, []);
    function toggle() { if (props.disabled) return; st[1](!on); if (props.onChange) props.onChange(!on); }
    return h('div', { className: cx('dt-switch', props.disabled && 'dt-switch--disabled', props.className) },
      h('div', { className: 'dt-switch__text' },
        h('span', { id: id, className: 'dt-switch__label' }, props.label),
        props.description ? h('span', { className: 'dt-switch__desc' }, props.description) : null
      ),
      h('button', { type: 'button', role: 'switch', 'aria-checked': on, 'aria-labelledby': id, disabled: props.disabled, className: cx('dt-switch__track', on && 'is-on'), onClick: toggle },
        h('span', { className: 'dt-switch__thumb' }, on ? h(Icon, { name: 'check', size: 14 }) : null)
      )
    );
  }

  /* ---------- Chip ---------- */
  function Chip(props) {
    var st = useControlled(props.selected, !!props.defaultSelected);
    var sel = !!st[0];
    function toggle() { st[1](!sel); if (props.onChange) props.onChange(!sel); }
    return h('button', { type: 'button', 'aria-pressed': sel, className: cx('dt-chip', sel && 'is-selected', props.className), onClick: toggle, disabled: props.disabled },
      sel && !props.icon ? h(Icon, { name: 'check', size: 16 }) : null,
      props.icon ? h(Icon, { name: props.icon, size: 18 }) : null,
      h('span', null, props.children)
    );
  }

  /* ---------- ScreenIndicator ---------- */
  var DEFAULT_SCREENS = ['Анатомия', 'Техники', 'Главная', 'Специалисты', 'Слово'];
  function ScreenIndicator(props) {
    var screens = props.screens || DEFAULT_SCREENS;
    var st = useControlled(props.current, props.defaultCurrent === undefined ? 2 : props.defaultCurrent);
    var current = st[0];
    var variant = props.variant || 'labels';
    return h('nav', { className: cx('dt-indicator', 'dt-indicator--' + variant, props.className), 'aria-label': 'Экраны приложения' },
      screens.map(function (name, i) {
        var active = i === current;
        function go() { st[1](i); if (props.onSelect) props.onSelect(i); }
        var href = props.hrefs && props.hrefs[i];
        var tag = href ? 'a' : 'button';
        var extra = href ? { href: href } : { type: 'button' };
        return h(tag, Object.assign({ key: name, className: cx('dt-indicator__item', active && 'is-active'), 'aria-current': active ? 'page' : undefined, 'aria-label': variant === 'dots' ? name : undefined, onClick: go }, extra),
          h('span', { className: 'dt-indicator__dot' }),
          variant === 'dots' && !active ? null : h('span', { className: 'dt-indicator__label' }, name)
        );
      })
    );
  }

  /* ---------- BottomSheet ---------- */
  function BottomSheet(props) {
    var titleId = React.useMemo(function () { return nextId('dt-sheet'); }, []);
    if (props.open === false) return null;
    return h('div', { className: cx('dt-sheet-layer', props.inline && 'dt-sheet-layer--inline') },
      h('div', { className: 'dt-sheet__scrim', onClick: props.onClose, 'aria-hidden': true }),
      h('section', { className: 'dt-sheet', role: 'dialog', 'aria-modal': true, 'aria-labelledby': props.title ? titleId : undefined },
        h('div', { className: 'dt-sheet__handle', 'aria-hidden': true }),
        props.title ? h('div', { className: 'dt-sheet__head' },
          h('h2', { id: titleId, className: 'dt-sheet__title' }, props.title),
          props.onClose ? h(Button, { variant: 'text', icon: 'close', 'aria-label': 'Закрыть', onClick: props.onClose }) : null
        ) : null,
        h('div', { className: 'dt-sheet__body' }, props.children)
      )
    );
  }

  /* ---------- Toast ---------- */
  function Toast(props) {
    var tone = props.tone || 'neutral';
    var icon = { success: 'check', error: 'close' }[tone];
    return h('div', { className: cx('dt-toast', 'dt-toast--' + tone, props.className), role: tone === 'error' ? 'alert' : 'status' },
      icon ? h('span', { className: 'dt-toast__icon' }, h(Icon, { name: icon, size: 16 })) : null,
      h('span', { className: 'dt-toast__msg' }, props.message || props.children),
      props.actionLabel ? h('button', { type: 'button', className: 'dt-toast__action', onClick: props.onAction }, props.actionLabel) : null
    );
  }

  /* ---------- EmptyState ---------- */
  function EmptyState(props) {
    return h('div', { className: cx('dt-empty', props.className) },
      h(Timka, { pose: props.pose || 'sleep', size: props.illustrationSize || 140 }),
      h('h3', { className: 'dt-empty__title' }, props.title),
      props.text ? h('p', { className: 'dt-empty__text' }, props.text) : null,
      props.actionLabel ? h(Button, { variant: 'primary', onClick: props.onAction }, props.actionLabel) : null
    );
  }

  /* ---------- Skeleton ---------- */
  function Skeleton(props) {
    var variant = props.variant || 'text';
    if (variant === 'circle') { var s = props.size || 48; return h('span', { className: 'dt-skel dt-skel--circle', style: { width: s, height: s }, 'aria-hidden': true }); }
    if (variant === 'card') return h('div', { className: 'dt-skel dt-skel--card', style: { height: props.height || 120 }, 'aria-hidden': true });
    if (variant === 'listItem') {
      return h('div', { className: 'dt-skel-item', 'aria-hidden': true },
        h('span', { className: 'dt-skel dt-skel--icon' }),
        h('div', { className: 'dt-skel-lines' }, h('span', { className: 'dt-skel dt-skel--line', style: { width: '62%' } }), h('span', { className: 'dt-skel dt-skel--line', style: { width: '38%' } }))
      );
    }
    var n = props.lines || 3;
    var widths = ['100%', '92%', '64%', '80%', '48%'];
    var rows = [];
    for (var i = 0; i < n; i++) rows.push(h('span', { key: i, className: 'dt-skel dt-skel--line', style: { width: i === n - 1 ? '60%' : widths[i % widths.length] } }));
    return h('div', { className: 'dt-skel-lines', role: 'status', 'aria-label': 'Загрузка' }, rows);
  }

  var api = { Logo: Logo, LogoMark: LogoMark, Timka: Timka, Icon: Icon, Button: Button, Card: Card, TextField: TextField, Switch: Switch, Chip: Chip, ScreenIndicator: ScreenIndicator, BottomSheet: BottomSheet, Toast: Toast, EmptyState: EmptyState, Skeleton: Skeleton };
  window.Dobratimia = Object.assign(window.Dobratimia || {}, api);
})();
