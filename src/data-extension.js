/* =========================================================================
   GARMIN SYSTEM BUILDER — DATA EXTENSION
   --------------------------------------------------------------------------
   Adições e correções ao catálogo Garmin Marine baseadas em pesquisa
   profunda de 8 categorias (MFDs, Radar, Sonar, Autopilot, VHF, Sensor,
   Network, Áudio) contra fontes oficiais Garmin.
   --------------------------------------------------------------------------
   Carregar APÓS data.js. Estende CATALOG e ADAPTERS in-place.
   --------------------------------------------------------------------------
   Atualizações de PN (tinha errado no data.js original) e ~60 SKUs novos.
   Todos marcados _verify:true — confirmar antes de orçar.
   --------------------------------------------------------------------------
   Pesquisa: maio 2026 · fonte: garmin.com/en-US/c/marine/ + spec sheets
   ========================================================================= */

(function(){

/* ========================================================================
   1) CORREÇÕES DE PART-NUMBERS ERRADOS no data.js original
   ======================================================================== */
// Removidos da lista (após validação 2026-05-03):
//   gar-poe-coupler             → SKU 010-10580-10 já era CORRETO em data.js (Lucas confirmou).
//                                  010-12531-02 é o BlueNet→RJ45 Camera Adapter (item separado).
//   gar-reactor40-hyd-corepack  → idêntico ao data.js (010-00705-86) — fix vazio.
//   gar-ccu                     → idêntico (010-11052-67) — fix vazio.
//   gar-ecu10                   → idêntico (010-11053-02) — fix vazio.
const PN_FIXES = {
  'gar-vhf-115':       '010-02096-00',  // era 010-01957-00
  'gar-vhf-215':       '010-02097-00',  // era 010-01959-00
  'gar-vhf-215-ais':   '010-02098-00',  // era 010-01959-01
  'gar-vhf-315':       '010-02047-00',  // era 010-01958-00
  'gar-vhf-315i':      '010-02047-10',  // era 010-01958-10 — PN INFERIDO (sem confirmação Garmin)
  'gar-gls10':         '010-12954-00',  // era 010-02610-00
  'gar-lvs34':         '010-02706-10',  // era 010-12516-00
  'gar-gsd-26':        '010-00958-00',  // era 010-01112-00
  'gar-fantom-24x':    '010-02585-00',  // era 010-02463-00 (white). 010-02463-00 é 18x.
  'gar-fantom-18x':    '010-02584-00',  // era 010-02462-00. 010-02462-00 é Fantom 18 (legacy).
};
const PN_INFERRED = ['gar-vhf-315i'];   // sem confirmação direta — flagar pra auditoria
Object.entries(PN_FIXES).forEach(([id, sku])=>{
  const item = (CATALOG.find(d=>d.id===id) || ADAPTERS.find(d=>d.id===id));
  if(item){
    item.sku = sku;
    item._pnUpdatedFromResearch = true;
    if(PN_INFERRED.includes(id)) item._pnInferred = true;
  }
});

/* ========================================================================
   2) MFDs — séries Garmin que faltavam
   ======================================================================== */
const NEW_MFDS = [

/* GPSMAP 9000xsv flagship com sondador integrado (2025/2026) */
{id:'gar-gpsmap-9013xsv', sku:'010-02697-00', family:'GPSMAP 9000xsv', model:'GPSMAP 9013xsv', category:'MFD',
 description:'MFD glass-helm 13" 4K com xCHIRP + UHD scanning sonar integrado · BlueNet · Wi-Fi 5GHz.',
 power:{voltage:'12-24VDC',watts:60}, ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:4},
{id:'gar-gpsmap-9017xsv', sku:'010-02697-10', family:'GPSMAP 9000xsv', model:'GPSMAP 9017xsv', category:'MFD',
 description:'MFD glass-helm 17" 4K — flagship com sondador integrado · BlueNet.',
 power:{voltage:'12-24VDC',watts:75}, ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:4},

/* GPSMAP x3 (nova nomenclatura — 7", 9", 12", 15", 16") */
{id:'gar-gpsmap-743xsv', sku:'010-02365-50', family:'GPSMAP x3', model:'GPSMAP 743xsv', category:'MFD',
 description:'MFD 7" multifunção com sondador CHIRP + ClearVü/SideVü integrado.',
 power:{voltage:'12-24VDC',watts:18}, ports:[
  {type:'GarminMarineNet',qty:1},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:3},
{id:'gar-gpsmap-943', sku:'010-02366-60', family:'GPSMAP x3', model:'GPSMAP 943', category:'MFD',
 description:'MFD 9" multifunção sem sondador integrado.',
 power:{voltage:'12-24VDC',watts:22}, ports:[
  {type:'GarminMarineNet',qty:1},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:3},
{id:'gar-gpsmap-943xsv', sku:'010-02366-50', family:'GPSMAP x3', model:'GPSMAP 943xsv', category:'MFD',
 description:'MFD 9" multifunção com sondador CHIRP integrado.',
 power:{voltage:'12-24VDC',watts:24}, ports:[
  {type:'GarminMarineNet',qty:1},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:3},
{id:'gar-gpsmap-1253xsv', sku:'010-02367-50', family:'GPSMAP x3', model:'GPSMAP 1253xsv', category:'MFD',
 description:'MFD 12" Plus com sondador integrado — versão alta resolução.',
 power:{voltage:'12-24VDC',watts:32}, ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:4},

/* GPSMAP 1042xsv (10" — modelo intermediário ainda comercializado) */
{id:'gar-gpsmap-1042xsv', sku:'010-01740-02', family:'GPSMAP 1000', model:'GPSMAP 1042xsv', category:'MFD',
 description:'MFD 10" multifunção com sondador integrado · NMEA 2000 · Marine Network.',
 power:{voltage:'12-24VDC',watts:26}, ports:[
  {type:'GarminMarineNet',qty:1},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Video-BNC',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:3},

/* GPSMAP 16x3 — séries 16" novas */
{id:'gar-gpsmap-1623xsv', sku:'010-02368-00', family:'GPSMAP x3', model:'GPSMAP 1623xsv', category:'MFD',
 description:'MFD 16" multifunção com sondador integrado · Marine Network · BlueNet ready.',
 power:{voltage:'12-24VDC',watts:55}, ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'Video-BNC',qty:2},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:4},
{id:'gar-gpsmap-1643xsv', sku:'010-02368-50', family:'GPSMAP x3', model:'GPSMAP 1643xsv', category:'MFD',
 description:'MFD 16" Plus com sondador integrado — versão sucessor.',
 power:{voltage:'12-24VDC',watts:55}, ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'Video-BNC',qty:2},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:4},

/* GPSMAP 15x3 — 15" ultrawide */
{id:'gar-gpsmap-15x3', sku:'010-02697-50', family:'GPSMAP 15x3', model:'GPSMAP 15x3 Ultrawide', category:'MFD',
 description:'MFD 15" ultrawide premium · 4K · BlueNet · Wi-Fi 5GHz.',
 power:{voltage:'12-24VDC',watts:55}, ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'Power-12',qty:1}], _verify:true, n2kLen:4},

/* ECHOMAP UHD2 que faltavam */
{id:'gar-echomap-uhd2-64cv', sku:'010-02692-00', family:'ECHOMAP UHD2', model:'ECHOMAP UHD2 64cv', category:'MFD',
 description:'MFD 6" ClearVü.', power:{voltage:'12VDC',watts:9},
 ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:2},
// REMOVIDO 2026-05-03: gar-echomap-uhd2-64sv (SKU 010-02692-01 já em uso pelo gar-echomap-uhd2-93sv em data.js).
//   Pesquisa errou na série UHD2 — confirmar o SKU correto do 64sv no garmin.com antes de re-adicionar.
{id:'gar-echomap-uhd2-74cv', sku:'010-02595-00', family:'ECHOMAP UHD2', model:'ECHOMAP UHD2 74cv', category:'MFD',
 description:'MFD 7" ClearVü+ — sucessor do 73cv.', power:{voltage:'12VDC',watts:14},
 ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:2},
{id:'gar-echomap-uhd2-74sv', sku:'010-02595-01', family:'ECHOMAP UHD2', model:'ECHOMAP UHD2 74sv', category:'MFD',
 description:'MFD 7" SideVü+ — sucessor do 73sv.', power:{voltage:'12VDC',watts:16},
 ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:2},
{id:'gar-echomap-uhd2-94sv', sku:'010-02692-50', family:'ECHOMAP UHD2', model:'ECHOMAP UHD2 94sv', category:'MFD',
 description:'MFD 9" SideVü+ — sucessor do 93sv.', power:{voltage:'12VDC',watts:20},
 ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true, n2kLen:2},

/* STRIKER Vivid (pesca água doce — sem charts, mas é Garmin marine) */
{id:'gar-striker-vivid-7sv', sku:'010-02553-01', family:'STRIKER Vivid', model:'STRIKER Vivid 7sv', category:'MFD',
 description:'Fishfinder 7" entry com SideVü/ClearVü — sem cartografia.',
 power:{voltage:'12VDC',watts:10}, ports:[{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-striker-vivid-9sv', sku:'010-02554-01', family:'STRIKER Vivid', model:'STRIKER Vivid 9sv', category:'MFD',
 description:'Fishfinder 9" entry com SideVü/ClearVü — sem cartografia.',
 power:{voltage:'12VDC',watts:14}, ports:[{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true},

];

/* ========================================================================
   3) RADARES — adicionar Fantom 18 e 24 (40W legacy ainda vendidos)
   ======================================================================== */
const NEW_RADARS = [
{id:'gar-fantom-18', sku:'010-01706-00', family:'Fantom Dome', model:'GMR Fantom 18 (40W)', category:'Radar',
 description:'Radar dome solid-state 40W — versão econômica do 18x. Alcance 24nm.',
 power:{voltage:'12-24VDC',watts:13}, ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-fantom-24', sku:'010-01707-00', family:'Fantom Dome', model:'GMR Fantom 24 (40W)', category:'Radar',
 description:'Radar dome solid-state 40W — versão econômica do 24x. Alcance 48nm.',
 power:{voltage:'12-24VDC',watts:15}, ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}], _verify:true},
];

/* ========================================================================
   4) PANOPTIX — vários modelos que faltavam
   ======================================================================== */
const NEW_PANOPTIX = [
// REMOVIDO 2026-05-03: gar-lvs32 (ID já existe em data.js:207 com SKU 010-12968-00).
//   Extension trazia 010-12784-03 — divergência. Confirmar qual é o SKU oficial do LVS32 transom antes de mexer.
{id:'gar-lvs32-th', sku:'010-12784-04', family:'Panoptix LiveScope', model:'LVS32-TH Transducer (Thru-Hull)', category:'Sonar',
 description:'LiveScope thru-hull mount.', power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-ps21-tr', sku:'010-01749-30', family:'Panoptix', model:'PS21-TR Transducer', category:'Sonar',
 description:'Panoptix Down/Forward LiveVü, conexão direta a MFD compatível (sem GLS 10).',
 power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-ps22-tr', sku:'010-01750-30', family:'Panoptix', model:'PS22-TR Transducer', category:'Sonar',
 description:'Panoptix RealVü 3D Down + Forward, trolling motor mount.',
 power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-ps22-th', sku:'010-01750-21', family:'Panoptix', model:'PS22-TH Transducer (Thru-Hull)', category:'Sonar',
 description:'Panoptix RealVü 3D thru-hull.', power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-ps31', sku:'010-01469-10', family:'Panoptix', model:'PS31 Forward Transducer', category:'Sonar',
 description:'Panoptix FrontVü forward-looking — colisão prevention.', power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-ps51-th', sku:'010-01469-21', family:'Panoptix', model:'PS51-TH FrontVü Thru-Hull', category:'Sonar',
 description:'Panoptix FrontVü thru-hull — preferido pra cruzeiro/yacht.', power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-ps60', sku:'010-01749-50', family:'Panoptix', model:'PS60 RealVü 3D Historical', category:'Sonar',
 description:'Panoptix RealVü 3D Historical view.', power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true},
];

/* ========================================================================
   5) SONDADORES — GSD/GCV adicionais
   ======================================================================== */
const NEW_SONARS = [
{id:'gar-gsd-25', sku:'010-01159-00', family:'GSD', model:'GSD 25 Premium Sonar', category:'Sonar',
 description:'Sondador 1kW dual-channel CHIRP + DownVü/SideVü. Marine Network.',
 power:{voltage:'12-24VDC',watts:35}, ports:[{type:'GarminMarineNet',qty:1},{type:'SonarConn',qty:2},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-gcv-10', sku:'010-01087-00', family:'GCV', model:'GCV 10 SideVü/ClearVü Module', category:'Sonar',
 description:'Sondador scanning legacy SideVü/ClearVü CHIRP — coexiste com GSD 24/26 na rede.',
 power:{voltage:'12VDC',watts:18}, ports:[{type:'GarminMarineNet',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}], _verify:true},
];

/* ========================================================================
   6) TRANSDUCERS GT-series — essenciais
   ======================================================================== */
const NEW_TRANSDUCERS = [
{id:'gar-gt20-tm', sku:'010-01960-01', family:'GT', model:'GT20-TM Transom', category:'Sensor',
 description:'Transdutor transom 8-pin — DownVü 500W + tradicional 500W (77/200kHz). Inclui cabo 6m.',
 ports:[{type:'SonarConn',qty:1}], _verify:true, notes:'Conecta direto em ECHOMAP UHD2 / GPSMAP entry.'},
{id:'gar-gt54uhd-tm', sku:'010-12909-00', family:'GT UHD', model:'GT54UHD-TM Ultra HD Transom', category:'Sensor',
 description:'Transdutor Ultra HD all-in-one CHIRP wide + ClearVü (até 60m) + SideVü 455/1200kHz (150m).',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-gt56uhd-tm', sku:'010-13066-00', family:'GT UHD', model:'GT56UHD-TM Ultra HD Transom', category:'Sensor',
 description:'Sucessor do GT54UHD com mais alcance e clarity.',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-gt56uhd-tr', sku:'010-13066-10', family:'GT UHD', model:'GT56UHD-TR Trolling Motor', category:'Sensor',
 description:'GT56UHD para mount em trolling motor (Force).',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-gt56uhd-ih', sku:'010-13066-20', family:'GT UHD', model:'GT56UHD-IH In-Hull', category:'Sensor',
 description:'GT56UHD in-hull (sem furar casco).',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-gt51m-thp', sku:'010-12404-20', family:'GT THP', model:'GT51M-THP Thru-Hull Pair Mid CHIRP', category:'Sensor',
 description:'Par 12-pin thru-hull · Mid CHIRP 80-160kHz 600W + ClearVü/SideVü 260/455kHz 500W.',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-b265lh', sku:'010-11635-21', family:'Airmar', model:'B-265LH Thru-Hull CHIRP', category:'Sensor',
 description:'Airmar bronze thru-hull, low+high CHIRP 28-60kHz / 130-210kHz, 1kW. Para GSD 26.',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-b275lh', sku:'010-11635-22', family:'Airmar', model:'B-275LH-W Thru-Hull CHIRP', category:'Sensor',
 description:'Airmar bronze low+high CHIRP wide-beam 1kW. Padrão pesca offshore.',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
{id:'gar-b60', sku:'010-10182-21', family:'Airmar', model:'B60 Thru-Hull 12°', category:'Sensor',
 description:'Airmar bronze passante 12° dual-frequency 50/200kHz 600W.',
 ports:[{type:'SonarConn',qty:1}], _verify:true},
];

/* ========================================================================
   7) AUTOPILOTS adicionais (Reactor 40 + drive units)
   ======================================================================== */
const NEW_AUTOPILOT = [
{id:'gar-reactor40-sbw', sku:'010-02794-03', family:'Reactor 40', model:'Reactor 40 Steer-by-Wire + GHC 50', category:'Autopilot',
 description:'Pacote autopilot para sistemas de leme steer-by-wire (Volvo Penta, Yamaha Helm Master EX, Mercury Joystick).',
 power:{voltage:'12VDC',watts:25}, ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-reactor40-smartpump-v2', sku:'010-00705-62', family:'Reactor 40', model:'Reactor 40 SmartPump v2 (componente)', category:'Autopilot',
 description:'Bomba inteligente vazão variável 0-2.4 L/min — substitui CCU+ECU+pump separados.',
 power:{voltage:'12VDC',watts:20}, ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-reactor40-trim-tab', sku:'010-02064-00', family:'Reactor 40', model:'Reactor 40 for Trim Tabs', category:'Autopilot',
 description:'Pacote autopilot integrado a sistema de flaps Garmin/Lenco.',
 power:{voltage:'12VDC',watts:18}, ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-reactor-wireless-remote', sku:'010-12466-00', family:'Reactor', model:'Reactor Wireless Remote', category:'Autopilot',
 description:'Controle remoto wireless ANT+ para autopilot Reactor 40.',
 power:{voltage:'-'}, ports:[], _verify:true, notes:'Bateria interna · pareamento ANT+.'},
{id:'gar-shadow-drive', sku:'010-11052-08', family:'Reactor', model:'Shadow Drive Sensor', category:'Autopilot',
 description:'Sensor que detecta sobrepressão no leme e desativa autopilot temporariamente.',
 power:{voltage:'-'}, ports:[], _verify:true},
];

/* ========================================================================
   8) FORCE TROLLING MOTOR — versões White (saltwater) + 57"/87"
   ======================================================================== */
const NEW_TROLLING = [
{id:'gar-force-kraken-white-48', sku:'010-02835-50', family:'Force Kraken', model:'Force Kraken 48" White (Saltwater)', category:'TrollingMotor',
 description:'Trolling motor saltwater 48" eixo, 100lb thrust.',
 power:{voltage:'24-36VDC',watts:240}, ports:[{type:'N2K-Micro',qty:1},{type:'Power-24',qty:1}], _verify:true},
{id:'gar-force-kraken-white-63', sku:'010-02835-60', family:'Force Kraken', model:'Force Kraken 63" White (Saltwater)', category:'TrollingMotor',
 description:'Versão saltwater 63".', power:{voltage:'24-36VDC',watts:240},
 ports:[{type:'N2K-Micro',qty:1},{type:'Power-24',qty:1}], _verify:true},
{id:'gar-force-kraken-87', sku:'010-02835-30', family:'Force Kraken', model:'Force Kraken 87" Black', category:'TrollingMotor',
 description:'Versão 87" eixo (águas profundas/grandes barcos). 100lb thrust.',
 power:{voltage:'24-36VDC',watts:240}, ports:[{type:'N2K-Micro',qty:1},{type:'Power-24',qty:1}], _verify:true},
];

/* ========================================================================
   9) VHF/AIS adicionais
   ======================================================================== */
const NEW_VHF = [
{id:'gar-vhf-110', sku:'010-02095-00', family:'VHF', model:'VHF 110', category:'VHF',
 description:'VHF DSC fixo entry — sem AIS, sem GPS interno. Microfone fist incluso.',
 power:{voltage:'12VDC',watts:5}, ports:[{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-vhf-115i', sku:'010-02096-10', family:'VHF', model:'VHF 115i (Intercom)', category:'VHF',
 description:'VHF 115 com intercom 2-way (segunda estação).', power:{voltage:'12VDC',watts:7},
 ports:[{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-vhf-215i', sku:'010-02097-10', family:'VHF', model:'VHF 215i (Intercom)', category:'VHF',
 description:'VHF 215 com intercom + N2K + GPS interno.', power:{voltage:'12VDC',watts:8},
 ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-vhf-315-ais', sku:'010-02047-01', family:'VHF', model:'VHF 315 AIS', category:'VHF',
 description:'VHF 315 modular 25W com receptor AIS Classe B integrado.', power:{voltage:'12VDC',watts:10},
 ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}], _verify:true},
{id:'gar-ghs-11', sku:'010-01759-00', family:'VHF Accessory', model:'GHS 11 Wired Handset', category:'VHF',
 description:'Microfone wired remoto para 2ª/3ª estação dos VHF 215/315.',
 ports:[], _verify:true, notes:'Conecta na porta acessório do rádio.'},
{id:'gar-ghs-11i', sku:'010-01759-10', family:'VHF Accessory', model:'GHS 11i Intercom Handset', category:'VHF',
 description:'Microfone wired com intercom para múltiplas estações.',
 ports:[], _verify:true},
];

/* ========================================================================
   10) INSTRUMENTOS adicionais
   ======================================================================== */
const NEW_INSTRUMENTS = [
{id:'gar-gnx-21', sku:'010-01211-30', family:'GNX', model:'GNX 21', category:'Instrument',
 description:'Display 4" mono — perfil reduzido, leitura solar superior.',
 power:{voltage:'12VDC',watts:1.2}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-gnx-wind', sku:'010-01142-00', family:'GNX', model:'GNX Wind Display', category:'Instrument',
 description:'Display dedicado vento + true/apparent direction analog dial.',
 power:{voltage:'12VDC',watts:1.5}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-gnx-sail-pack-43', sku:'010-01536-30', family:'GNX', model:'GNX Wired Sail Pack 43', category:'Instrument',
 description:'Kit completo veleiro: GNX Wind + GNX 20 + gWind Wired + GST 43 + GDT 43 (ambos thru-hull 43mm).',
 power:{voltage:'12VDC',watts:5}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:3,
 notes:'Kit substitui Nexus completo.'},
{id:'gar-gnx-sail-pack-43-wireless', sku:'010-01536-31', family:'GNX', model:'GNX Wireless Sail Pack 43', category:'Instrument',
 description:'Versão wireless do Sail Pack — gWind Wireless + ANT+.',
 power:{voltage:'12VDC',watts:5}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:3},
];

/* ========================================================================
   11) SENSORES adicionais
   ======================================================================== */
const NEW_SENSORS = [
{id:'gar-gst-10', sku:'010-01802-00', family:'GST', model:'GST 10 Speed/Temp Wired (legacy)', category:'Sensor',
 description:'Sensor speed/temp NMEA 0183, conexão antiga.',
 ports:[{type:'NMEA0183',qty:1}], _verify:true},
{id:'gar-gfl-10', sku:'010-11197-00', family:'GFL', model:'GFL 10 Fluid Level Adapter', category:'Sensor',
 description:'Adaptador de sensor de nível de fluído (água, esgoto, óleo) → NMEA 2000.',
 ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-gfs-10', sku:'010-11196-00', family:'GFS', model:'GFS 10 Fuel Sensor', category:'Sensor',
 description:'Sensor de fluxo de combustível — calcula consumo + range. NMEA 2000.',
 ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-gtu-10', sku:'010-11401-00', family:'GTU', model:'GTU 10 Tank Monitor', category:'Sensor',
 description:'Monitor de nível de tanque (combustível, água) ultrasonic. NMEA 2000.',
 ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-gra-10', sku:'010-11400-00', family:'GRA', model:'GRA 10 Rudder Angle Adapter', category:'Sensor',
 description:'Adaptador para sensor analógico de ângulo de leme legacy → NMEA 2000.',
 ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-dst-800', sku:'010-12646-10', family:'Airmar', model:'DST 800 Smart Triducer (Wired)', category:'Sensor',
 description:'Airmar passante velocidade/temp/profundidade NMEA 2000 wired.',
 ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-gwind-race', sku:'010-01616-40', family:'gWind', model:'gWind Race Transducer', category:'Sensor',
 description:'gWind otimizado regata — resposta rápida em ventos leves.',
 power:{voltage:'12VDC',watts:1}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
];

/* ========================================================================
   12) ANTENAS GPS adicionais
   ======================================================================== */
const NEW_ANTENNAS = [
{id:'gar-gps-19x-hvs', sku:'010-01010-20', family:'GPS Antenna', model:'GPS 19x HVS (Heading)', category:'Antenna',
 description:'Antena GPS NMEA 2000 com sensor de heading magnético integrado.',
 power:{voltage:'12VDC',watts:1.5}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
{id:'gar-gps-19x', sku:'010-01010-00', family:'GPS Antenna', model:'GPS 19x NMEA 2000', category:'Antenna',
 description:'Antena GPS NMEA 2000 sem heading.',
 power:{voltage:'12VDC',watts:1}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1},
];

/* ========================================================================
   13) ÁUDIO Fusion adicional
   ======================================================================== */
const NEW_AUDIO = [
{id:'gar-fusion-ra210', sku:'010-02250-00', family:'Apollo', model:'Fusion Apollo MS-RA210 Marine Stereo', category:'Audio',
 description:'Stereo marine entry com display LCD compacto, 4 zonas, NMEA 2000.',
 power:{voltage:'12VDC',watts:35}, ports:[{type:'N2K-Micro',qty:1},{type:'Bluetooth',qty:1},{type:'Audio',qty:8},{type:'Power-12',qty:1}], _verify:true, n2kLen:1},
{id:'gar-fusion-wb670', sku:'010-02163-00', family:'Apollo', model:'Fusion Apollo MS-WB670 Black-box', category:'Audio',
 description:'Black-box wireless stereo (sem display físico) — controle via app/MFD.',
 power:{voltage:'12VDC',watts:30}, ports:[{type:'N2K-Micro',qty:1},{type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'Audio',qty:8},{type:'Power-12',qty:1}], _verify:true, n2kLen:1},
{id:'gar-fusion-amp-ap61800', sku:'010-02307-00', family:'Apollo', model:'Fusion Apollo MS-AP61800 (6ch 1800W)', category:'Audio',
 description:'Amplificador 6 canais 1800W (150W RMS/canal) — exclusivo Fusion DSP.',
 power:{voltage:'12VDC',watts:150}, ports:[{type:'Audio',qty:6},{type:'Power-12',qty:1}], _verify:true},
];

/* ========================================================================
   14) NETWORK / CABOS — adicionais (BlueNet, Marine Net longos)
   ======================================================================== */
const NEW_CABLES = [
{id:'cab-bn-rj45-adapter', sku:'010-12531-01', brand:'Garmin', family:'BlueNet', model:'BlueNet → RJ45 Adapter', category:'Cable',
 description:'Cabo adaptador BlueNet macho ↔ RJ45 fêmea — para conectar GTB 10 ou IP camera.',
 ports:[{type:'BlueNet',qty:1},{type:'GarminMarineNet',qty:1}], _verify:true},
{id:'cab-bn-cam-adapter', sku:'010-12531-02', brand:'Garmin', family:'BlueNet', model:'BlueNet → RJ45 Camera Adapter', category:'Cable',
 description:'Cabo BlueNet → RJ45 com PoE pass-through, para câmera IP marine.',
 ports:[{type:'BlueNet',qty:1},{type:'PoE',qty:1}], _verify:true},
{id:'cab-gmn-30m', sku:'010-10553-10', brand:'Garmin', family:'Marine Network', model:'Cabo Marine Network 30m', category:'Cable',
 description:'Cabo Marine Network RJ45 — 30m (mast cable).',
 ports:[{type:'GarminMarineNet',qty:2}], length:30, _verify:true},
{id:'cab-gmn-27m', sku:'010-10553-20', brand:'Garmin', family:'Marine Network', model:'Cabo Marine Network 27m (90ft)', category:'Cable',
 description:'Cabo Marine Network RJ45 — 27m (run de mastro alto).',
 ports:[{type:'GarminMarineNet',qty:2}], length:27, _verify:true},
{id:'cab-bn-30m', sku:'010-13500-10', brand:'Garmin', family:'BlueNet', model:'Cabo BlueNet 30m', category:'Cable',
 description:'Cabo BlueNet 30m — runs longos.',
 ports:[{type:'BlueNet',qty:2}], length:30, _verify:true},
];

/* ========================================================================
   15) SKUs ADICIONADOS NA PESQUISA TOP-30 (maio 2026 · request Lucas)
   --------------------------------------------------------------------------
   Confirmados via WebSearch contra garmin.com + spec sheets oficiais.
   ======================================================================== */
const NEW_TOP30 = [
  // GMR 18 xHD3 — radar dome MAGNETRON 4kW HD3 (geração 2024). NÃO confundir
  // com Fantom 18x (que é solid-state). Lucas pediu "Fantom 18xHD3" (que não
  // existe) — entendido como xHD3 magnetron novo. Confirmar antes de orçar.
  {id:'gar-radar-18xhd3', sku:'010-02841-00', family:'GMR xHD3', model:'GMR 18 xHD3 Radar Dome', category:'Radar',
   description:'Radome magnetron 18" 4 kW HD3 (geração 2024) · alcance 48 NM · 60 RPM · scan averaging.',
   power:{voltage:'12-24VDC',watts:55}, ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}], _verify:true,
   notes:'Magnetron — preço/peso/consumo maiores que o Fantom 18x solid-state. Considerar Fantom se cliente quer eficiência.'},

  // GSD 28 — sondador black-box xCHIRP, sucessor do GSD 26
  {id:'gar-gsd-28', sku:'010-02797-00', family:'GSD', model:'GSD 28 Sonar Module', category:'Sonar',
   description:'Sondador black-box dual-channel xCHIRP 1-3 kW (25-250 kHz) · 300W-3kW output · sucessor do GSD 26.',
   power:{voltage:'12-24VDC',watts:120}, ports:[{type:'GarminMarineNet',qty:1},{type:'SonarConn',qty:2},{type:'Power-12',qty:1}], _verify:true},

  // Panoptix PS70 — transducer Live Sonar 800W, thru-hull only (não LiveScope)
  {id:'gar-ps70-th', sku:'010-02768-10', family:'Panoptix', model:'PS70-TH Live Sonar Transducer (Thru-Hull)', category:'Sonar',
   description:'Transducer Panoptix Live Sonar thru-hull, 800 W · RapidReturn · até 1000 ft profundidade · 10+ FPS.',
   power:{voltage:'-'}, ports:[{type:'SonarConn',qty:1}], _verify:true,
   notes:'Variante 010-02768-00 inclui fairing block (recomendado pra casco com deadrise). PS70 NÃO é LiveScope — não exige GLS 10. Conecta direto em GSD 28 ou MFD com SonarConn.'},

  // MSC 10 — Marine Satellite Compass, sucessor do SteadyCast
  {id:'gar-msc-10', sku:'010-02407-00', family:'MSC', model:'MSC 10 Marine Satellite Compass', category:'Sensor',
   description:'Compasso satélite multi-GNSS · heading <2° · heave/pitch/roll · NMEA 2000 · sucessor do SteadyCast.',
   power:{voltage:'12VDC',watts:2}, ports:[{type:'N2K-Micro',qty:1}], _verify:true, n2kLen:1,
   notes:'Versão preta: 010-02407-10. Pole mount acessório: 010-11082-10.'},
];

/* ========================================================================
   16) CORREÇÕES IN-PLACE — devices existentes que precisam ajuste de schema
   ======================================================================== */
// GHC 50 — Lucas confirmou que o display tem porta BlueNet além de N2K
// (verificar manual oficial Garmin antes de orçar pra cliente final).
(function fixGhc50(){
  const ghc = CATALOG.find(d=>d.id==='gar-ghc50');
  if(!ghc) return;
  const hasBlueNet = (ghc.ports||[]).some(p=>p.type==='BlueNet');
  if(!hasBlueNet){
    ghc.ports.push({type:'BlueNet', qty:1});
    ghc._schemaUpdatedFromResearch = true;
  }
})();

/* ========================================================================
   APLICAR EXTENSÕES — concatena nas listas globais
   ======================================================================== */
const ALL_NEW = [
  ...NEW_MFDS,
  ...NEW_RADARS,
  ...NEW_PANOPTIX,
  ...NEW_SONARS,
  ...NEW_TRANSDUCERS,
  ...NEW_AUTOPILOT,
  ...NEW_TROLLING,
  ...NEW_VHF,
  ...NEW_INSTRUMENTS,
  ...NEW_SENSORS,
  ...NEW_ANTENNAS,
  ...NEW_AUDIO,
  ...NEW_TOP30
];

// Devices vão pro CATALOG, cabos/adapters vão pro ADAPTERS.
// Guard defensivo: skipa silenciosamente qualquer item com id ou sku já existente
// pra evitar duplicatas (loga no console pra auditoria).
const skipped = [];
function pushUnique(target, item){
  if(!item.brand) item.brand = 'Garmin';
  const dupId  = target.find(x=>x.id===item.id);
  const dupSku = target.find(x=>x.sku===item.sku);
  if(dupId || dupSku){
    skipped.push({id:item.id, sku:item.sku, reason: dupId?'id-dup':'sku-dup',
                  collidesWith: (dupId||dupSku).id});
    return false;
  }
  target.push(item);
  return true;
}

let addedDevices = 0, addedCables = 0;
ALL_NEW.forEach(item=>{ if(pushUnique(CATALOG, item)) addedDevices++; });
NEW_CABLES.forEach(item=>{ if(pushUnique(ADAPTERS, item)) addedCables++; });

// Reexpor pra confirmar (window.GARMIN é populado em data.js:668)
window.GARMIN.CATALOG  = CATALOG;
window.GARMIN.ADAPTERS = ADAPTERS;

console.log('[data-extension] Catálogo Garmin estendido:',
  '\n  CATALOG total:', CATALOG.length, '(+', addedDevices, 'devices)',
  '\n  ADAPTERS total:', ADAPTERS.length, '(+', addedCables, 'cabos)',
  '\n  PNs corrigidos:', Object.keys(PN_FIXES).length,
  '\n  Skipados (dup):', skipped.length, skipped);

})();
