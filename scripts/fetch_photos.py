"""
Baixa fotos oficiais Garmin pros top-32 SKUs do projeto, redimensiona pra
200x150 webp e gera src/images.js com WB_IMAGES.photo populado.

Uso:
    python scripts/fetch_photos.py

Saida:
    src/images.js  (sobrescreve o existente)
    scripts/photos_log.txt  (log de o que conseguiu/falhou)
"""

import os, re, sys, json, base64, io
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JS = os.path.join(ROOT, 'src', 'images.js')
LOG    = os.path.join(ROOT, 'scripts', 'photos_log.txt')

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' \
     '(KHTML, like Gecko) Chrome/126.0 Safari/537.36'

# Overrides manuais — URLs descobertas via pesquisa pra SKUs cujo CDN
# padrão (res.garmin.com/en/products/{SKU}/v/cf-lg.jpg) retorna 404.
# Chave = id do device. Valor = URL DIRETA da foto que retorna 200 OK.
URL_OVERRIDES = {
    'gar-gpsmap-9013xsv':         'https://res.garmin.com/en/products/010-02675-00/g/cf-lg.jpg',
    'gar-echomap-uhd2-93sv':      'https://res.garmin.com/en/products/010-02593-00/v/cf-lg.jpg',
    'gar-fantom-126':             'https://res.garmin.com/en/products/K10-00012-19/g/cf-lg-16f4fc63-9ea4-40d2-8ec7-2fd8318897a7.jpg',
    'gar-vhf-315-ais':            'https://res.garmin.com/en/products/010-02047-00/g/cf-lg-b162fe5f-e60f-4622-bfbf-2e953a36c75a.jpg',
    'gar-bluenet-30':             'https://res.garmin.com/en/products/010-02613-00/g/cf-lg.jpg',
    'gar-force-kraken-white-63':  'https://res.garmin.com/en/products/010-02574-00/v/cf-lg.jpg',
}

# Lista final de 32 SKUs. Cada entrada: (id, sku, modelo, productPageUrl).
# productPageUrl quando conhecido — senao sera deduzido via search no garmin.com.
SKUS = [
    # MFDs (8)
    ('gar-gpsmap-1243xsv', '010-02675-62', 'GPSMAP 1243xsv',
     'https://www.garmin.com/en-US/p/762128/pn/010-02675-62'),
    ('gar-gpsmap-9012',    '010-02675-50', 'GPSMAP 9012',
     'https://www.garmin.com/en-US/p/762128/pn/010-02675-50'),
    ('gar-gpsmap-9019',    '010-02675-10', 'GPSMAP 9019',
     'https://www.garmin.com/en-US/p/762128/pn/010-02675-10'),
    ('gar-gpsmap-8612xsv', '010-02092-52', 'GPSMAP 8612xsv',
     'https://www.garmin.com/en-US/p/616762/pn/010-02092-52'),
    ('gar-gpsmap-8616xsv', '010-02093-52', 'GPSMAP 8616xsv',
     'https://www.garmin.com/en-US/p/616762/pn/010-02093-52'),
    ('gar-gpsmap-743xsv',  '010-02365-50', 'GPSMAP 743xsv',
     'https://www.garmin.com/en-US/p/696253/pn/010-02365-50'),
    ('gar-gpsmap-9013xsv', '010-02697-00', 'GPSMAP 9013xsv',
     'https://www.garmin.com/en-US/p/889245/pn/010-02697-00'),
    ('gar-echomap-uhd2-93sv','010-02692-01','ECHOMAP UHD2 93sv',
     'https://www.garmin.com/en-US/p/737772/pn/010-02692-01'),

    # Radar (4)
    ('gar-fantom-18x',   '010-02584-00', 'GMR Fantom 18x',
     'https://www.garmin.com/en-US/p/762107/pn/010-02584-00'),
    ('gar-fantom-24x',   '010-02585-00', 'GMR Fantom 24x',
     'https://www.garmin.com/en-US/p/762107/pn/010-02585-00'),
    ('gar-radar-18xhd3', '010-02841-00', 'GMR 18 xHD3',
     'https://www.garmin.com/en-US/p/951697/pn/010-02841-00'),
    ('gar-fantom-126',   '010-01366-00', 'GMR Fantom 126',
     'https://www.garmin.com/en-US/p/559921/pn/010-01366-00'),

    # Sonar (5)
    ('gar-gls10',  '010-12954-00', 'GLS 10 LiveScope Module',
     'https://www.garmin.com/en-US/p/734415/pn/010-12954-00'),
    ('gar-lvs34',  '010-02706-10', 'LVS34 Transducer',
     'https://www.garmin.com/en-US/p/787935/pn/010-02706-10'),
    ('gar-gsd-26', '010-00958-00', 'GSD 26',
     'https://www.garmin.com/en-US/p/121343/pn/010-00958-00'),
    ('gar-gsd-28', '010-02797-00', 'GSD 28',
     'https://www.garmin.com/en-US/p/880646/pn/010-02797-00'),
    ('gar-ps70-th','010-02768-10', 'Panoptix PS70-TH',
     'https://www.garmin.com/en-US/p/864084/pn/010-02768-10'),

    # Autopilot (3)
    ('gar-ghc50',                '010-02496-00', 'GHC 50',
     'https://www.garmin.com/en-US/p/716330/pn/010-02496-00'),
    ('gar-reactor40-hyd-corepack','010-00705-86','Reactor 40 Hyd Corepack',
     'https://www.garmin.com/en-US/p/127531/pn/010-00705-86'),
    ('gar-reactor40-hyd-1l2',    '010-00705-08','Reactor 40 Hyd 1.2L Pump',
     'https://www.garmin.com/en-US/p/127531/pn/010-00705-08'),

    # VHF (3)
    ('gar-vhf-215-ais', '010-02098-00', 'VHF 215 AIS',
     'https://www.garmin.com/en-US/p/779717/pn/010-02098-00'),
    ('gar-vhf-315-ais', '010-02047-01', 'VHF 315 AIS',
     'https://www.garmin.com/en-US/p/716331/pn/010-02047-01'),
    ('gar-vhf-115',     '010-02096-00', 'VHF 115',
     'https://www.garmin.com/en-US/p/779715/pn/010-02096-00'),

    # Network / Camera (3)
    ('gar-gms-10',       '010-00351-00', 'GMS 10',
     'https://www.garmin.com/en-US/p/107550/pn/010-00351-00'),
    ('gar-bluenet-30',   '010-12346-00', 'BlueNet 30 Gateway',
     'https://www.garmin.com/en-US/p/1024858/pn/010-12346-00'),
    ('gar-gc-200',       '010-02164-00', 'GC 200 Marine IP Camera',
     'https://www.garmin.com/en-US/p/779712/pn/010-02164-00'),

    # Sensor / Antenna (3)
    ('gar-msc-10',       '010-02407-00', 'MSC 10',
     'https://www.garmin.com/en-US/p/702588/pn/010-02407-00'),
    ('gar-gps-24xd',     '010-02315-00', 'GPS 24xd',
     'https://www.garmin.com/en-US/p/696258/pn/010-02315-00'),
    ('gar-gwind-wired',  '010-01616-20', 'gWind Wired',
     'https://www.garmin.com/en-US/p/581087/pn/010-01616-20'),

    # Trolling / Audio (2)
    ('gar-force-kraken-white-63', '010-02835-60', 'Force Kraken 63" White',
     'https://www.garmin.com/en-US/p/957895/pn/010-02835-60'),
    ('gar-fusion-ra770', '010-01905-00', 'Fusion Apollo MS-RA770',
     'https://www.garmin.com/en-US/p/630625/pn/010-01905-00'),

    # AIS (1)
    ('gar-ais-800', '010-02087-00', 'AIS 800',
     'https://www.garmin.com/en-US/p/697061/pn/010-02087-00'),
]

OG_RE  = re.compile(rb'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', re.I)
OG_RE2 = re.compile(rb'<meta\s+content=["\']([^"\']+)["\']\s+property=["\']og:image["\']', re.I)
# Fallback: imagem grande do CDN Garmin no formato res.garmin.com
CDN_RE = re.compile(rb'(https?://res\.garmin\.com/[^"\'\s]+\.(?:png|jpg|jpeg|webp))', re.I)

def fetch(url, max_bytes=None):
    req = Request(url, headers={'User-Agent': UA, 'Accept':'*/*'})
    with urlopen(req, timeout=30) as r:
        if max_bytes:
            return r.read(max_bytes)
        return r.read()

def find_image_url(html, sku):
    m = OG_RE.search(html) or OG_RE2.search(html)
    if m:
        return m.group(1).decode('utf-8', 'replace')
    # Tenta matches CDN + filtra os que tem o SKU no path
    for m in CDN_RE.finditer(html):
        u = m.group(1).decode('utf-8', 'replace')
        if sku in u:
            return u
    # Senao, primeiro match CDN
    m = CDN_RE.search(html)
    if m:
        return m.group(1).decode('utf-8', 'replace')
    return None

def to_webp_b64(img_bytes, target=(200,150), quality=82):
    img = Image.open(io.BytesIO(img_bytes)).convert('RGBA')
    # Fit-contain dentro de target preservando aspect; fundo branco
    img.thumbnail(target, Image.LANCZOS)
    canvas = Image.new('RGB', target, (255,255,255))
    x = (target[0]-img.size[0])//2
    y = (target[1]-img.size[1])//2
    canvas.paste(img, (x,y), img if img.mode=='RGBA' else None)
    buf = io.BytesIO()
    canvas.save(buf, format='WEBP', quality=quality, method=6)
    b = buf.getvalue()
    return 'data:image/webp;base64,' + base64.b64encode(b).decode('ascii'), len(b)

def try_cdn_direct(sku):
    """Tenta CDN res.garmin.com diretamente sem precisar do productPage.
    Pattern principal: /v/cf-lg.jpg ou /g/cf-lg.jpg.
    Fallback: pra variantes (sufixo -52, -62, -10, etc), tenta SKU base
    da família (-00) — muitas vezes a foto é compartilhada."""
    base_sku = sku
    # Gera SKU "base" trocando sufixo por -00 (ex: 010-02675-62 -> 010-02675-00)
    parts = sku.split('-')
    base_sku_alt = '-'.join(parts[:-1] + ['00']) if len(parts)==3 else sku
    skus_to_try = [sku] if sku == base_sku_alt else [sku, base_sku_alt]
    for s in skus_to_try:
        for path in ['v/cf-lg.jpg', 'g/cf-lg.jpg', 'v/cf-lg.png', 'g/cf-lg.png']:
            u = f'https://res.garmin.com/en/products/{s}/{path}'
            try:
                data = fetch(u)
                if len(data) > 800:  # filtra placeholder vazio
                    return u, data
            except (URLError, HTTPError):
                continue
    return None, None

def main():
    results = {}
    log_lines = []
    total_in = 0
    for (id_, sku, model, page) in SKUS:
        log_lines.append(f'\n--- {id_}  ({sku})  {model}')
        img_bytes = None
        img_url = None
        # Estratégia 0: override manual (pra SKUs com CDN não-padrão)
        if id_ in URL_OVERRIDES:
            try:
                img_url = URL_OVERRIDES[id_]
                img_bytes = fetch(img_url)
                log_lines.append(f'  override: {img_url} ({len(img_bytes)/1024:.1f} KB raw)')
            except Exception as e:
                log_lines.append(f'  ! override falhou: {e}')
                img_bytes = None
                img_url = None
        # Estratégia 1: CDN direto (se override não rolou)
        if not img_bytes:
            img_url, img_bytes = try_cdn_direct(sku)
            if img_url:
                log_lines.append(f'  CDN direto: {img_url} ({len(img_bytes)/1024:.1f} KB raw)')
        # Estratégia 2: extrair og:image da productPage (se nada antes funcionou)
        if not img_bytes:
            try:
                html = fetch(page, max_bytes=600_000)
                img_url = find_image_url(html, sku)
                if img_url:
                    log_lines.append(f'  via og:image: {img_url}')
                    img_bytes = fetch(img_url)
            except (URLError, HTTPError) as e:
                log_lines.append(f'  ! productPage 404: {e}')
            except Exception as e:
                log_lines.append(f'  ! erro: {type(e).__name__}: {e}')
        if not img_bytes:
            log_lines.append('  ! NAO ACHOU foto em nenhum lugar')
            continue
        try:
            data_uri, size_b = to_webp_b64(img_bytes)
            results[id_] = data_uri
            total_in += size_b
            log_lines.append(f'  OK {size_b/1024:.1f} KB webp final')
        except Exception as e:
            log_lines.append(f'  ! resize/encode falhou: {type(e).__name__}: {e}')

    # Gera images.js
    js = ['/* =========================================================================',
          '   GARMIN SYSTEM BUILDER — IMAGE BANK',
          '   --------------------------------------------------------------------------',
          '   Gerado por scripts/fetch_photos.py em ' + os.popen('date /t').read().strip() if os.name=='nt' else '',
          '   Total: ' + f'{len(results)} fotos · {total_in/1024:.0f} KB webp inline (base64)',
          '   --------------------------------------------------------------------------',
          '   Toggle Foto/Silhueta no header do app alterna entre as variantes.',
          '   ========================================================================= */',
          '',
          'window.WB_IMAGES = window.WB_IMAGES || {photo:{}, silhouette:{}};',
          '']
    for id_, uri in sorted(results.items()):
        # Escapa apenas a aspa simples (data URI nao tem)
        js.append(f"window.WB_IMAGES.photo[{id_!r}] = '{uri}';")

    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(js) + '\n')

    with open(LOG, 'w', encoding='utf-8') as f:
        f.write('\n'.join(log_lines))

    print(f'OK: {len(results)}/{len(SKUS)} fotos baixadas · {total_in/1024:.0f} KB total')
    print(f'Saida: {OUT_JS}')
    print(f'Log:   {LOG}')

if __name__ == '__main__':
    main()
