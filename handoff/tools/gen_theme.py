import json, os, re
import sys
# Использование: python3 gen_theme.py <tokens.json> <папка темы, куда писать tokens.ts>
t=json.load(open(sys.argv[1]))
out=sys.argv[2]; os.makedirs(out,exist_ok=True)
px=lambda v:float(v.replace('px','')) if isinstance(v,str) else v
def num(v):
    f=px(v); return str(int(f)) if f==int(f) else str(f)
def key(k): return k if re.match(r'^[A-Za-z_]\w*$',k) else "'%s'"%k
fam={}
for c in t['color']['tokens']:
    g,n=c['name'].split('.'); fam.setdefault(g,[]).append((n,c['value'],c.get('usage','')))
L=[]
L.append("// Сгенерировано из design-system/tokens.json. Не правьте руками — меняйте tokens.json и перегенерируйте.\n// Имена совпадают с токенами дизайн-системы: color.primary → theme.color.primary.\n")
L.append("export type SchemeName = 'light' | 'dark';\n")
for scheme in ('light','dark'):
    L.append("const %sPalette = {"%scheme)
    for g,items in fam.items():
        L.append("  %s: {"%g)
        for n,v,u in items:
            u=u.replace('*/','')
            L.append("    /** %s */\n    %s: '%s',"%(u.split('. На нём')[0] or n, n, v[scheme]))
        L.append("  },")
    L.append("} as const;\n")
L.append("export const palettes = { light: lightPalette, dark: darkPalette };\nexport type Palette = { [G in keyof typeof lightPalette]: { [K in keyof (typeof lightPalette)[G]]: string } };\n")
for famname,var in (('spacing','space'),('size','size'),('radius','radius')):
    L.append("export const %s = {"%var)
    for x in t[famname]['tokens']:
        n=x['name'].split('.',1)[1]
        L.append("  /** %s */\n  %s: %s,"%(x.get('usage','').replace('*/',''), key(n), num(x['value'])))
    L.append("} as const;\n")
L.append("/** Тени: строка boxShadow (React Native 0.76+, новая архитектура; работает на Android и в вебе). */")
L.append("export const shadows = {")
for scheme in ('light','dark'):
    L.append("  %s: {"%scheme)
    for x in t['shadow']['tokens']:
        L.append("    %s: '%s',"%(x['name'].split('.')[1], x['value'][scheme]))
    L.append("  },")
L.append("} as const;\n")
L.append("/** Фолбэк для старых устройств/старой архитектуры: elevation на Android. */\nexport const elevation = { sm: 2, md: 6, lg: 16 } as const;\n")
# typography
fontmap={('display',700):'Nunito_700Bold',('display',800):'Nunito_800ExtraBold',('display',900):'Nunito_900Black',
 ('text',400):'GolosText_400Regular',('text',500):'GolosText_500Medium',('text',600):'GolosText_600SemiBold',('text',700):'GolosText_700Bold'}
L.append("/** Имена семейств после загрузки через expo-font (см. fonts.ts). На кастомных шрифтах не задавайте fontWeight — вес уже в имени семейства. */")
L.append("export const fontFamily = {")
L.append("  display: { 700: 'Nunito_700Bold', 800: 'Nunito_800ExtraBold', 900: 'Nunito_900Black' },")
L.append("  text: { 400: 'GolosText_400Regular', 500: 'GolosText_500Medium', 600: 'GolosText_600SemiBold', 700: 'GolosText_700Bold' },")
L.append("} as const;\n")
L.append("export const typography = {")
for g in t['type']['groups']:
    for s in g['styles']:
        fs=px(s['fontSize']); parts=["fontFamily: '%s'"%fontmap[(g['family'],s['fontWeight'])],"fontSize: %s"%num(s['fontSize']),"lineHeight: %s"%num(s['lineHeight'])]
        if 'letterSpacing' in s:
            em=float(s['letterSpacing'].replace('em','')); parts.append("letterSpacing: %s"%round(em*fs,2))
        if s['name']=='overline': parts.append("textTransform: 'uppercase' as const")
        L.append("  /** %s */\n  %s: { %s },"%(s.get('usage','').replace('*/',''), s['name'], ', '.join(parts)))
L.append("} as const;\n")
L.append("/** Длительности анимаций, мс. Кривая — ease-out, без пружин. */\nexport const motion = { press: 160, toast: 240, feed: 240, sheet: 320 } as const;\n")
open(out+'/tokens.ts','w').write('\n'.join(L))
print('ok:', out+'/tokens.ts')
