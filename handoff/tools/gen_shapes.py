import os, re, json, xml.etree.ElementTree as ET
import sys
# Использование: python3 gen_shapes.py <папка assets/svg с Icons, Logos, Mascot> <папка components/brand>
A=sys.argv[1]; out=sys.argv[2]; os.makedirs(out,exist_ok=True)
NS='{http://www.w3.org/2000/svg}'
def camel(s): return re.sub(r'-([a-z])',lambda m:m.group(1).upper(),s)
def conv(el, cmap):
    tag=el.tag.replace(NS,'')
    props={}
    for k,v in el.attrib.items():
        if k in ('xmlns',): continue
        if v.upper() in cmap: v=cmap[v.upper()]
        props[camel(k)]=v
    kids=[conv(c,cmap) for c in el]
    d={'t':tag,'p':props}
    if kids: d['c']=kids
    return d
def load(path, cmap):
    r=ET.parse(path).getroot()
    return r.attrib['viewBox'], [conv(c,cmap) for c in r]
icons={}
for f in sorted(os.listdir(A+'/Icons')):
    vb,sh=load(A+'/Icons/'+f, {'#2C1F1A':'$current'})
    assert vb=='0 0 48 48'
    icons[f[:-4]]=sh
logo_map={'#8E3B22':'$logo.deep','#C8623A':'$logo.warm','#E07B39':'$logo.orange','#F2B28A':'$logo.apricot','#E8B04A':'$logo.head','#8FA66B':'$logo.leaf','#6E8A4E':'$logo.leafDeep'}
vb,logo=load(A+'/Logos/logo-mark.svg', logo_map)
tim_map=dict(logo_map); tim_map.update({'#E07A5F':'$mascot.cheek','#EADCD0':'$color.border','#F8DCCD':'$color.primarySoft','#6A554C':'$color.textMuted'})
timka={}
for pose in ('hello','breathe','sleep'):
    tvb,timka[pose]=load(A+'/Mascot/timka-%s.svg'%pose, tim_map)
def ts(o): return json.dumps(o, ensure_ascii=False, indent=None, separators=(',',':'))
src='''// Сгенерировано из assets/*.svg (gen_shapes.py). Фигуры для react-native-svg.
// Цвет '$current' — цвет иконки; '$group.token' — токен темы (logo.apricot, color.border…).
export type Shape = { t: string; p: Record<string, string>; c?: Shape[] };

export type IconName = %s;
export const iconShapes: Record<IconName, Shape[]> = %s;
export const iconNames = Object.keys(iconShapes) as IconName[];

/** Знак «Две половины», viewBox %s. Градиенты l, r, s. */
export const logoShapes: Shape[] = %s;

/** Тимка, viewBox %s. */
export const timkaShapes: Record<'hello' | 'breathe' | 'sleep', Shape[]> = %s;
'''%(' | '.join("'%s'"%k for k in icons), ts(icons), vb, ts(logo), tvb, ts(timka))
open(out+'/shapes.ts','w').write(src)
print('ok:', out+'/shapes.ts')
