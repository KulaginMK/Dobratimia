"""Собирает страницы документов для сайта из Markdown в legal/: python3 legal/build_pages.py

Понимает только то, что есть в наших документах: заголовки, абзацы, списки, таблицы, **жирный**, ссылки.
Баннер в начале (строки с «>») и всё после «---» с заметками для проверяющего на страницу не попадает.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'landing'

# Источник → страница. Порядок — как в меню документов.
PAGES = [
    ('privacy-policy.md', 'privacy.html', 'Политика конфиденциальности', 'Для пользователей'),
    ('consent.md', 'consent.html', 'Согласие на обработку данных', 'Для пользователей'),
    ('privacy-policy-specialists.md', 'specialists-privacy.html', 'Политика для специалистов', 'Для специалистов'),
    ('consent-specialists.md', 'specialists-consent.html', 'Согласие специалиста', 'Для специалистов'),
]
SITE = 'https://kulaginmk.github.io/Dobratimia/landing/'


def inline(text: str) -> str:
    text = html.escape(text, quote=False)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Ссылки на наши же страницы делаем относительными: так они работают и на проверочном сервере.
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: f'<a href="{local(m[2])}">{m[1]}</a>', text)
    text = re.sub(r'(?<![">])(https?://[^\s<]+?)([.,;:)]?)(?=\s|$|<)', lambda m: f'<a href="{local(m[1])}">{m[1]}</a>{m[2]}', text)
    text = re.sub(r'(?<![\w.">/])([\w.+-]+@[\w-]+\.[\w.]+\w)', r'<a href="mailto:\1">\1</a>', text)
    text = re.sub(r'(?<![\w/">])(t\.me/\w+)', r'<a href="https://\1">\1</a>', text)
    return text


def local(url: str) -> str:
    return (url[len(SITE):] or './') if url.startswith(SITE) else url


def slug(text: str) -> str:
    match = re.match(r'(\d+)\.', text)
    return f's{match[1]}' if match else ''


def body(markdown: str) -> tuple[str, str]:
    """Markdown → (заголовок, html). Без баннера и без заметок для проверяющего."""
    markdown = markdown.split('\n---\n', 1)[0]
    lines = [line for line in markdown.splitlines() if not line.startswith('>')]
    title, out, i = '', [], 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
        elif line.startswith('# '):
            title = line[2:].strip()
            i += 1
        elif line.startswith('## ') or line.startswith('### '):
            level = 2 if line.startswith('## ') else 3
            text = line[level + 1:].strip()
            anchor = f' id="{slug(text)}"' if level == 2 and slug(text) else ''
            out.append(f'<h{level}{anchor}>{inline(text)}</h{level}>')
            i += 1
        elif line.startswith('- '):
            items = []
            while i < len(lines) and lines[i].startswith('- '):
                items.append(f'<li>{inline(lines[i][2:])}</li>')
                i += 1
            out.append('<ul>' + ''.join(items) + '</ul>')
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append([cell.strip() for cell in lines[i].strip('|').split('|')])
                i += 1
            head, rest = rows[0], [r for r in rows[1:] if not set(''.join(r)) <= set('-: ')]
            table = '<thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead><tbody>'
            # data-label — подпись колонки: на узком экране строка таблицы показывается карточкой.
            table += ''.join(
                '<tr>' + ''.join(f'<td data-label="{html.escape(h)}">{inline(c)}</td>' for h, c in zip(head, r)) + '</tr>'
                for r in rest
            ) + '</tbody>'
            out.append(f'<div class="table"><table>{table}</table></div>')
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r'(#{1,3} |- |\|)', lines[i]):
                para.append(inline(lines[i].strip()))
                i += 1
            cls = ' class="meta"' if para[0].startswith('Редакция от') else ''
            out.append(f'<p{cls}>' + '<br>'.join(para) + '</p>')
    return title, '\n'.join(out)


def page(file: str, title: str, content: str) -> str:
    groups = {}
    for _, out_file, label, group in PAGES:
        current = ' aria-current="page"' if out_file == file else ''
        groups.setdefault(group, []).append(f'<a href="{out_file}"{current}>{label}</a>')
    nav = ''.join(f'<div><span>{g}</span>{"".join(links)}</div>' for g, links in groups.items())
    return TEMPLATE.format(title=html.escape(title), nav=nav, content=content)


TEMPLATE = (Path(__file__).resolve().parent / 'page_template.html').read_text(encoding='utf-8')


def main() -> None:
    for source, out_file, _, _ in PAGES:
        title, content = body((ROOT / 'legal' / source).read_text(encoding='utf-8'))
        text = page(out_file, title, content)
        visible = re.sub(r'<[^>]+>', '', content)
        # Самопроверка: на сайт не должны попасть пропуски в квадратных скобках и заметки для юриста.
        assert '[' not in visible and ']' not in visible, f'{source}: на странице остались квадратные скобки'
        assert 'Заметки для проверяющего' not in visible, f'{source}: на страницу попали заметки'
        assert title and '<h2' in content, f'{source}: не нашлись заголовки'
        (OUT / out_file).write_text(text, encoding='utf-8')
        print(f'landing/{out_file} ← legal/{source}')


if __name__ == '__main__':
    main()
