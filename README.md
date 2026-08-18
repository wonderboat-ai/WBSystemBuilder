# WB System Builder — Garmin

Ferramenta web standalone para projetar instalações de eletrônica marítima Garmin, criada para a Wonder BOAT (Lucas Araújo Souza · IN07169).

Inspirada na experiência em desenvolvimento de projetos eletrônicos marítimos para auxílio a navegação e pesca esportiva, mas focada em produtos da marca Garmin, com cálculos de NMEA 2000 conforme a referência técnica oficial Garmin publicada na web.

🔗 **Acesse online:** [wonderboat-ai.github.io/WBSystemBuilder](https://wonderboat-ai.github.io/WBSystemBuilder/)
📦 **Repositório:** [github.com/wonderboat-ai/WBSystemBuilder](https://github.com/wonderboat-ai/WBSystemBuilder)
🏷️ **Versão atual:** `v2026.07.24` (ver `APP_VERSION` em `src/app.js`)

> Publicado no GitHub como **WB System Builder** — nome do repositório da família de ferramentas Wonder BOAT (este app cobre especificamente o catálogo Garmin; próximos: Raymarine, Icom).

## Recursos

- Catálogo Garmin Marine com **153 SKUs** (MFD, Radar, Sonar, Autopilot, VHF/AIS, Network, Câmera, Sensores, Antena, Trolling Motor, Áudio)
- Canvas drag-and-drop livre com **4 vistas dedicadas**:
  - **Tudo** — layout geral livre
  - **N2K Backbone** — vertical estruturada profissional (T-Joiners, drops editáveis, voltagem por nó)
  - **Ethernet** — hub-and-spoke estruturada (switch/gateway central + devices ao redor + cabling list + Power Use)
  - **Energia** — filtra por consumo, com auto-hide de infraestrutura irrelevante (Tees/terminadores N2K)
- Auto-hide/dim de dispositivos irrelevantes por vista (reduz poluição visual em projetos grandes)
- Toggle **Foto oficial Garmin / Silhueta Wonder BOAT** nos cards da biblioteca (166/175 SKUs com foto real embutida em base64 — 95% de cobertura — restante com silhueta categórica desenhada à mão)
- Validação automática contra normas NMEA 2000 / ABYC E-11 / ISO 13297 com 11 regras (R-N2K-01..R-CABLE-01)
- Cálculo de Power Use 12V/24V (Battery + Max)
- Cálculo de Network LEN com voltage drop estimado (fórmula oficial Garmin: R = 0.053 Ω/m)
- Suporte a equipamentos de outras marcas via "Item Livre"
- Wizard inicial (3 perguntas)
- Busca global Ctrl+K
- 3 modos de exportação PDF: Cliente (A4 paisagem), A3 Técnico (4 páginas — Tudo/Ethernet/N2K Backbone/Energia), Lista de Cabos
- Persistência via localStorage + Export/Import JSON
- Tema claro/escuro

## Como rodar

### Modo simples (file://)
Abrir `index.html` direto no Chrome (clique duplo). Funciona offline.

### Modo dev server
```bash
npm start
# ou se preferir python
python3 -m http.server 8080
```
Aceitar em http://localhost:8080

## Estrutura

```
WBSystemBuilder/
├── index.html              # entry point
├── styles.css              # toda a folha de estilos
├── src/
│   ├── data.js             # catálogo Garmin base + adapters + regras + zonas
│   ├── data-extension.js   # extensão do catálogo (SKUs adicionais + correções de PN)
│   ├── images.js           # banco de fotos oficiais Garmin (base64 webp) + silhuetas
│   └── app.js              # toda lógica de UI, render, validação, print
├── scripts/
│   └── fetch_photos.py     # baixa fotos oficiais Garmin, converte pra webp 200x150 base64
├── CLAUDE.md                # contexto técnico para o Claude Code
├── README.md
└── package.json
```

## Stack

- Vanilla JS (sem framework)
- Sem build step
- Sem dependências runtime (Python só é usado offline pelo script de fotos)
- Renderização SVG inline
- localStorage para persistência

## Roadmap

Veja seção "Frentes pendentes" em `CLAUDE.md`:
1. Drag pra reordenar devices no N2K Backbone
2. Split visual Branch A/B quando power tap não está no extremo
3. Wireless gateway (Yacht Devices YDWG-02, iKommunicate)
4. Tools (calculadoras avulsas — voltage drop, antenna range, banco de baterias)
5. Versionamento de catálogo (`version: "AAAA.MM"` + `sourceAuthority`)
6. Completar os SKUs sem foto restantes (`scripts/photo_failures.json`)

## Licença

Uso interno Wonder BOAT.

## Autor

Lucas Araújo Souza · IN07169 · Wonder BOAT · Itajaí/SC
