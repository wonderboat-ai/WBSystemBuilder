# Garmin System Builder · Wonder BOAT

## O que é este projeto

Ferramenta web standalone (single-user, offline) que replica conceitualmente o **System Builder da Navico** — mas focada em **eletrônica marítima Garmin**. Permite ao instalador (Lucas Araújo, Wonder BOAT, IN07169) montar projetos completos de instalação eletrônica de barco com:

- Catálogo Garmin Marine (~83 SKUs cobrindo MFD/Radar/Sonar/Autopilot/VHF/AIS/Network/Sensors/Audio)
- Canvas drag-and-drop livre + vista N2K Backbone estruturada
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
garmin-system-builder/
├── CLAUDE.md              ← este arquivo (contexto pra próximas sessões)
├── README.md              ← docs de uso
├── package.json           ← metadata + scripts npm (apenas pra dev server)
├── .gitignore
├── index.html             ← estrutura HTML + monta UI shell
├── styles.css             ← todo CSS (tema claro/escuro via CSS vars)
└── src/
    ├── data.js            ← CATALOG (83 SKUs Garmin) + ADAPTERS (17 cabos/gateways) +
    │                         RULES (11 regras validação) + DEFAULT_ZONES + PORT_TYPES + COMPAT
    │                         + watts patch (estimados de spec sheets, todos _verify)
    └── app.js             ← TUDO o resto: error catcher + state + render + canvas +
                              N2K backbone view + library + inspector + header +
                              search + wizard + toast + theme + print + auto-fix + init
```

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

1. **Imagens dos produtos** (Frente 2 do roadmap) — baixar fotos oficiais Garmin dos top 30 SKUs e embutir como base64 em `data.js`. Substituir caixas de texto nos cards por imagens.
2. **Vista ETHERNET estruturada** — réplica do tab Ethernet do Navico: hub central (GMS-10 ou BlueNet 20), devices ao redor com cabos rotulados, Power Use box, Cabling list com PNs.
3. **Drag pra reordenar devices no N2K Backbone** — atualmente ordem é por categoria.
4. **Split visual em Branch A / Branch B** quando power tap não está no extremo do backbone.
5. **Wireless (Yacht Devices YDWG-02, iKommunicate)** como gateway IP cross-brand.
6. **Tools** — calculadoras avulsas (voltage drop standalone, antenna range, banco de baterias).
7. **Versionamento de catálogo** — campo `version: "AAAA.MM"` + `sourceAuthority: url` por catálogo. Rejeitar dados >12 meses.

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

## Fontes autoritativas (sempre verificar antes de adicionar SKU)

- Garmin Marine: https://www.garmin.com/en-US/c/marine/
- Garmin NMEA 2000 Tech Reference: https://www8.garmin.com/manuals/webhelp/GUID-1415AAD0-FE63-42A6-8F8D-DB713D616122/EN-US/Technical_Reference_for_Garmin_NMEA_2000_Products_EN-US.pdf
- Garmin BlueNet Tech Reference: https://www8.garmin.com/manuals/webhelp/GUID-C3D5DCE9-C0FF-4AC4-B759-D5B34E1EB78E/EN-US/Technical_Reference_for_Garmin_BlueNet_Technology_EN-US.pdf
