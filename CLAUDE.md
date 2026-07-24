# Garmin System Builder · Wonder BOAT

## O que é este projeto

Ferramenta web standalone (single-user, offline) que replica conceitualmente o **System Builder da Navico** — mas focada em **eletrônica marítima Garmin**. Permite ao instalador (Lucas Araújo, Wonder BOAT, IN07169) montar projetos completos de instalação eletrônica de barco com:

- Catálogo Garmin Marine (153 devices + 22 adapters/cabos cobrindo MFD/Radar/Sonar/Autopilot/VHF/AIS/Network/Sensors/Audio/TrollingMotor/Camera/Antenna)
- Canvas drag-and-drop livre com 4 vistas: Tudo / N2K Backbone estruturada / Ethernet hub-and-spoke / Energia
- Auto-hide/dim de dispositivos irrelevantes por vista
- Toggle Foto oficial Garmin / Silhueta Wonder BOAT nos cards (164/175 SKUs com foto real, 94% cobertura)
- Validação automática contra normas NMEA 2000 (R-N2K-01..03), Garmin BlueNet (R-BN-01), Panoptix (R-PANO-01), PoE (R-POE-01), Radar (R-RADAR-01), Autopilot (R-AP-01), VHF DSC (R-VHF-01), J1939 (R-J1939-01), porta sobrecarregada (R-DUP-01) e cabo sem comprimento (R-CABLE-01)
- Cálculo de **Power Use** (12V/24V Battery+Max)
- Cálculo de **N2K Network LEN** com voltage drop usando fórmula oficial Garmin (R = 0.053 Ω/m, drop ≤ 1.67V)
- Vista N2K Backbone vertical estilo Navico (T-Joiners, drops com comprimento editável, voltage por nó com cor semafórica)
- 3 modos de impressão: Slide Cliente (A4 paisagem), A3 Técnico (instalador), Lista de Cabos (A4)
- Item Livre (equipamentos não-Garmin de outras marcas)
- Wizard inicial 3 perguntas (tipo / comprimento / foco)
- Busca global Ctrl+K
- Persistência em localStorage + Export/Import JSON
- Tema claro/escuro

## Stack

- **Vanilla JS** (sem framework, sem build step, sem dependências NPM em runtime)
- **HTML + CSS + 2 arquivos JS** servidos como estáticos
- Renderização SVG inline para canvas e print
- localStorage para persistência

Decisão arquitetural: zero build, zero deploy, zero dependência. Lucas pode abrir `index.html` direto no browser (file://) ou servir via qualquer http server simples. **Não use ES Modules** — o app precisa rodar em file://.

## Estrutura de arquivos

```
WBSystemBuilder/
├── CLAUDE.md              ← este arquivo (contexto pra próximas sessões)
├── README.md              ← docs de uso
├── package.json           ← metadata + scripts npm (apenas pra dev server)
├── .gitignore
├── index.html             ← estrutura HTML + monta UI shell
├── styles.css             ← todo CSS (tema claro/escuro via CSS vars)
├── scripts/
│   └── fetch_photos.py   ← baixa fotos oficiais Garmin, converte pra webp 200x150 base64
└── src/
    ├── data.js            ← CATALOG base + ADAPTERS + RULES (11 regras validação) +
    │                         DEFAULT_ZONES + PORT_TYPES + COMPAT + watts patch (_verify)
    ├── data-extension.js  ← extensão do catálogo (SKUs adicionais + correções de PN,
    │                         carrega DEPOIS de data.js, ANTES de app.js)
    ├── images.js          ← banco de fotos oficiais Garmin (base64 webp) + silhuetas
    └── app.js             ← TUDO o resto: error catcher + state + render + canvas +
                              N2K backbone view + Ethernet hub-and-spoke view + library +
                              inspector + header + search + wizard + toast + theme +
                              print + auto-fix + toggle foto/silhueta + init
```

## Publicação / repositório

Publicado no GitHub como **`wonderboat-ai/WBSystemBuilder`** (renomeado de
`garmin-system-builder` em 2026-07-24 pelo próprio Lucas, via GitHub web UI —
nome da família de ferramentas Wonder BOAT, não específico de marca).
Repositório público com GitHub Pages ativo:
- Site: https://wonderboat-ai.github.io/WBSystemBuilder/
- Repo: https://github.com/wonderboat-ai/WBSystemBuilder

Ao clonar/atualizar o remote local, usar essa URL (o nome antigo
`garmin-system-builder` ainda redireciona via GitHub, mas não confiar nisso
indefinidamente).

## Padrões de código importantes

### REGRA #1 — Não inventar SKU/preço/spec
Nunca adicione um SKU sem confirmar contra fonte oficial Garmin (https://www.garmin.com/en-US/c/marine/). Itens com dado não confirmado devem ter `_verify: true` no schema. O badge amarelo "VERIFICAR" aparece automaticamente na biblioteca.

### REGRA #2 — Cuidado com `const` em escopo global
Os 2 scripts (`data.js`, `app.js`) compartilham o **mesmo Script Record do browser**. `const X` em data.js + `const X` em app.js dá `SyntaxError: Identifier already declared`. **Não redeclare** variáveis: `data.js` declara CATALOG/ADAPTERS/etc. com `const`, `app.js` apenas LÊ esses nomes diretamente (sem destructuring/redeclaração).

### REGRA #3 — Não use `prompt()`, `alert()`, `confirm()` em código novo
O preview do Cowork bloqueia diálogos modais nativos. Use as funções já existentes:
- `toast(msg)` para feedback efêmero (verde, top-center, fade out 2.5s)
- `_openInlineEditor(uid, currentValue)` para edição numérica
- Modal custom HTML (display:none + overlay) para forms maiores (ver `wizard-overlay`, `search-overlay`)

### REGRA #4 — Sempre responder em pt-BR
UI, mensagens, comentários de código relevantes ao usuário, todo conteúdo de texto: pt-BR.

### REGRA #5 — Identidade Wonder BOAT
- Tom: maduro, técnico-premium, sábio + guardião do setor náutico
- Tipografia print: serif Georgia para títulos, Helvetica para metadados, Menlo/Consolas para SKUs e medidas
- Cores: dourado `#d4a64a` (accent Wonder BOAT), azul `#1f5dc4`/`#5b8df6` (Garmin)
- Selo institucional circular "WONDER BOAT · IN07169" em todos os PDFs
- Marca d'água Wonder BOAT (leme + texto) opacity 0.04-0.07 nas páginas de cliente
- Bordões patrimoniais: "600 projetos. Zero improviso." (não inventar novos)

## Como adicionar um novo SKU Garmin

Em `src/data.js`, adicionar entrada no `CATALOG`:

```js
{id:'gar-novo-modelo', sku:'010-XXXXX-00', family:'Família', model:'Nome Comercial', category:'MFD|Radar|Sonar|Autopilot|VHF|AIS|Instrument|Network|Antenna|Camera|Sensor|Audio',
 description:'Texto técnico curto.',
 power:{voltage:'12VDC|24VDC|12-24VDC', watts:0},
 ports:[{type:'BlueNet|GarminMarineNet|N2K-Micro|NMEA0183|J1939|HDMI|Video-BNC|USB|WiFi|Bluetooth|PoE|SonarConn|VHFAntenna|GPSAntenna|Audio|Power-12|Power-24', qty:1}],
 _verify:true},
```

Para adicionar watts confirmado, edite o `[id, watts]` no patch ao final de `data.js`. Marque `_powerVerify:true`.

## Como adicionar uma nova regra de validação

Em `src/data.js`, adicionar no array `RULES`:

```js
{id:'R-XXX-01', name:'Descrição', severity:'error|warn|info',
 check:(project, api)=>{
   const issues = [];
   project.nodes.forEach(n => {
     const dev = api.getDeviceById(n.deviceId);
     // ... lógica de validação
     if (problema) issues.push({title:'...', msg:'...', fix:'... sugestão pro user'});
   });
   return issues;
 }}
```

Se a regra tem auto-fix, adicionar handler em `FIX_HANDLERS` em `src/app.js`:
```js
'R-XXX-01': function(){
  // adiciona/modifica state.project pra resolver
}
```

## Convenções de validação Garmin NMEA 2000 implementadas

- **R-N2K-01**: backbone deve ter exatamente 2 terminadores 120Ω
- **R-N2K-02**: backbone deve ter exatamente 1 cabo de alimentação 12V (fusível 3A)
- **R-N2K-03**: alerta ΣLEN > 20 dispositivos (cuidado com limite 50)
- **R-BN-01**: BlueNet + Marine Network legacy exige BlueNet 30 Gateway
- **R-PANO-01**: Panoptix LiveScope (LVS32/34/62) exige GLS 10
- **R-POE-01**: Câmera PoE exige PoE Isolation Coupler
- **R-RADAR-01**: Radar precisa de MFD compatível na mesma rede
- **R-AP-01**: Reactor 40 Corepack exige GHC 50 ou GHC 20
- **R-VHF-01**: VHF DSC isolado sem GPS conectado
- **R-J1939-01**: Motor J1939 exige gateway J2K100/YDEM-01 antes do N2K
- **R-DUP-01**: porta usada > 1× simultaneamente (sem Tee)
- **R-CABLE-01**: cabos sem comprimento informado

## Fórmula NMEA 2000 oficial Garmin (implementada)

```
V_drop = 0.053 × L_total × LEN_total × 0.1   (round trip)
Limite: V_drop ≤ 1.67 Vdc (Garmin)
ΣLEN ≤ 50 por segmento (NMEA 2000 std)
LEN 1 = 50 mA
Drop ≤ 6m por device (NMEA 2000 std)
Backbone ≤ 100m (cabo Mid)
```

Implementação em `app.js`:
- `computeNetworkLen()` — calcula LEN/V_drop por backbone componente
- `calcN2kVoltagesPerNode()` — calcula tensão por nó usando 2 direções a partir do power tap

## Como rodar

**Opção 1 — Direto do filesystem (mais simples):**
Abrir `index.html` no Chrome (clicar duplo). Funciona offline. Algumas restrições do file:// se aplicam (cookies, alguns CORS), mas o app foi desenhado pra contornar.

**Opção 2 — Servidor local (recomendado pra dev):**
```bash
npm start
# ou
python3 -m http.server 8080
# abre http://localhost:8080
```

## Frentes pendentes (próximas iterações)

1. **Drag pra reordenar devices no N2K Backbone** — atualmente ordem é por categoria.
2. **Split visual em Branch A / Branch B** quando power tap não está no extremo do backbone.
3. **Wireless (Yacht Devices YDWG-02, iKommunicate)** como gateway IP cross-brand.
4. **Tools** — calculadoras avulsas (voltage drop standalone, antenna range, banco de baterias).
5. **Versionamento de catálogo** — campo `version: "AAAA.MM"` + `sourceAuthority: url` por catálogo. Rejeitar dados >12 meses.
6. **Completar os 11 SKUs sem foto** (ver `scripts/photo_failures.json`) — lista renovada após a revisão de conflitos de 2026-07-24 (ids/SKUs diferentes da lista original).

## Convenções gerais Wonder BOAT (do Lucas)

- Sempre pt-BR
- Nunca inventar SKU/preço/spec
- Nunca recomendar adaptação fora da spec do fabricante
- Não autorizar compras nem manipular dados financeiros
- Sinalizar quando projeto entrar em escopo SOLAS (laudo profissional separado)

## Histórico de decisões importantes

- **2026-05-02**: Versão v1 multi-marca descontinuada em favor de apps separados por marca (Garmin primeiro, próximos: Raymarine, Simrad, Icom)
- **2026-05-02**: Orçamento (BOM/markup) removido — foco em diagrama de instalação técnica + lista de cabos
- **2026-05-03**: Fórmula voltage drop migrada de chute (0.08 Ω/m) para padrão Garmin oficial (0.053 Ω/m)
- **2026-05-03**: Vista N2K Backbone estruturada implementada (substitui filtro simples por layout vertical estilo Navico)
- **2026-05-03**: Projeto modularizado em `data.js + app.js + styles.css + index.html` para edição via Claude Code
- **2026-07-24**: Catálogo estendido de ~83 pra 153 devices + 22 adapters via `data-extension.js` (pesquisa profunda por categoria, PNs corrigidos, ~60 SKUs novos)
- **2026-07-24**: Repositório publicado no GitHub (`wonderboat-ai/garmin-system-builder`), depois renomeado por Lucas pra `wonderboat-ai/WBSystemBuilder` + GitHub Pages ativado
- **2026-07-24**: Vista Ethernet hub-and-spoke implementada + auto-hide/dim por vista + toggle Foto/Silhueta com banco de imagens (`src/images.js`, `scripts/fetch_photos.py`)
- **2026-07-24**: Banco de fotos ampliado de 32 pra 164/175 SKUs (94%) via pesquisa em paralelo (23 agentes). Pesquisa revelou 36 SKUs errados no catálogo original — todos corrigidos com fonte oficial cruzada (ver `scripts/sku_corrections_log.json`). 11 itens ficaram com conflito não resolvido, aguardando revisão do Lucas.
- **2026-07-24**: Os 11 conflitos de SKU acima foram revisados e resolvidos (8 agentes de pesquisa em paralelo, fontes cruzadas garmin.com + revendedores). Resultado: 2 itens removidos do catálogo por serem produtos fantasma ("Reactor 40 for Trim Tabs" tinha SKU de um relógio Garmin Instinct; "VHF 315 AIS" não existe — o SKU real é do VHF 315i), 1 item split em 3 variantes por comprimento de eixo (GT56UHD-TR 48"/63"/75"), demais tiveram SKU corrigido ou reclassificado (GMR Fantom 124, LVS32, GT56UHD-IH→TH, Force Kraken 87"→90", ECHOMAP UHD2 64cv→UHD 64cv 1ª geração, GNX Wireless Sail Pack, gWind Wireless, YDEM-01→YDEG-04N, cabo BlueNet 30m→12m). Detalhes completos em `scripts/sku_corrections_log.json` (chave `revised_2026_07_24`). `scripts/photo_failures.json` e `scripts/extra_skus.json` atualizados com os ids/SKUs corrigidos.

## Artefatos de auditoria (não deletar)

- `scripts/sku_corrections_log.json` — todo SKU corrigido nesta sessão (id, sku antigo, sku novo, fonte/nota) + lista dos 11 itens deliberadamente não tocados por ambiguidade.
- `scripts/photo_failures.json` — os SKUs que ainda não têm foto (hoje, os mesmos 11 do log acima).
- `scripts/research_overrides.json` — URLs de imagem descobertas pela pesquisa, consumidas por `fetch_photos.py` via `URL_OVERRIDES`.
- `scripts/extra_skus.json` — lista de trabalho de SKUs sem foto que o `fetch_photos.py` tenta buscar via CDN direto (regenerar via extração do catálogo antes de rodar de novo, se o catálogo mudou).

## Fontes autoritativas (sempre verificar antes de adicionar SKU)

- Garmin Marine: https://www.garmin.com/en-US/c/marine/
- Garmin NMEA 2000 Tech Reference: https://www8.garmin.com/manuals/webhelp/GUID-1415AAD0-FE63-42A6-8F8D-DB713D616122/EN-US/Technical_Reference_for_Garmin_NMEA_2000_Products_EN-US.pdf
- Garmin BlueNet Tech Reference: https://www8.garmin.com/manuals/webhelp/GUID-C3D5DCE9-C0FF-4AC4-B759-D5B34E1EB78E/EN-US/Technical_Reference_for_Garmin_BlueNet_Technology_EN-US.pdf
