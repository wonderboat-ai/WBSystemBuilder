/* === GARMIN DATA EMBEDDED (sourced from garmin-data.js) === */
/* =========================================================================
   GARMIN SYSTEM BUILDER — DATA
   Catálogo Marine Garmin consolidado de garmin.com/en-US/c/marine/
   Schema: id, sku, family, model, category, ports[{type,qty}], power, _verify
   Regra: campos não confirmados → _verify:true. Nunca inventar SKU/preço/spec.
   --------------------------------------------------------------------------
   Tipos de porta utilizados:
     BlueNet               — Garmin BlueNet (rede nova, 2024+)
     GarminMarineNet       — Garmin Marine Network (legacy RJ45)
     N2K-Micro             — NMEA 2000 Micro-C
     NMEA0183              — Serial 0183
     J1939                 — CAN motor
     HDMI / Video-BNC / USB / WiFi / Bluetooth / PoE
     SonarConn             — Conector proprietário transdutor (LiveScope, Panoptix, GSD/GCV)
     Power-12 / Power-24
     Audio / VHFAntenna / GPSAntenna
   ========================================================================= */

const BRAND = 'Garmin';

const CATALOG = [

/* ============== MFD / Chartplotters — GPSMAP 9000 (flagship BlueNet) ============== */
{id:'gar-gpsmap-9012',sku:'010-02675-50',family:'GPSMAP 9000',model:'GPSMAP 9012',category:'MFD',
 description:'MFD glass-helm 12" 4K touchscreen IPS — BlueNet nativo.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-9016',sku:'010-02675-00',family:'GPSMAP 9000',model:'GPSMAP 9016',category:'MFD',
 description:'MFD glass-helm 16" 4K touchscreen — BlueNet nativo.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-9019',sku:'010-02675-10',family:'GPSMAP 9000',model:'GPSMAP 9019',category:'MFD',
 description:'MFD glass-helm 19" 4K touchscreen — BlueNet nativo.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-9022',sku:'010-02675-20',family:'GPSMAP 9000',model:'GPSMAP 9022',category:'MFD',
 description:'MFD glass-helm 22" 4K touchscreen — BlueNet nativo.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-9024',sku:'010-02675-30',family:'GPSMAP 9000',model:'GPSMAP 9024',category:'MFD',
 description:'MFD glass-helm 24" 4K touchscreen — BlueNet nativo.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-9027',sku:'010-02675-40',family:'GPSMAP 9000',model:'GPSMAP 9027',category:'MFD',
 description:'MFD glass-helm 27" 4K touchscreen — flagship — BlueNet nativo.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'BlueNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:2},{type:'USB',qty:2},
  {type:'Power-12',qty:1}],_verify:true},

/* ============== MFD — GPSMAP 8x00 (premium glass-helm Marine Network legacy) ============== */
{id:'gar-gpsmap-8410',sku:'010-02091-00',family:'GPSMAP 8400',model:'GPSMAP 8410',category:'MFD',
 description:'MFD glass-helm 10" Full HD — Marine Network legacy.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8410xsv',sku:'010-02091-50',family:'GPSMAP 8400',model:'GPSMAP 8410xsv',category:'MFD',
 description:'MFD glass-helm 10" Full HD com sondador integrado.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8412',sku:'010-02092-00',family:'GPSMAP 8400',model:'GPSMAP 8412',category:'MFD',
 description:'MFD glass-helm 12" Full HD touchscreen.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8412xsv',sku:'010-02092-50',family:'GPSMAP 8400',model:'GPSMAP 8412xsv',category:'MFD',
 description:'MFD glass-helm 12" Full HD com sondador integrado.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8416',sku:'010-02093-00',family:'GPSMAP 8400',model:'GPSMAP 8416',category:'MFD',
 description:'MFD glass-helm 16" Full HD touchscreen.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8416xsv',sku:'010-02093-50',family:'GPSMAP 8400',model:'GPSMAP 8416xsv',category:'MFD',
 description:'MFD glass-helm 16" Full HD com sondador integrado.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8612',sku:'010-02092-02',family:'GPSMAP 8600',model:'GPSMAP 8612',category:'MFD',
 description:'MFD 12" all-in-one (display+computador) — Marine Network legacy.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8612xsv',sku:'010-02092-52',family:'GPSMAP 8600',model:'GPSMAP 8612xsv',category:'MFD',
 description:'MFD 12" all-in-one com sondador integrado.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8616',sku:'010-02093-02',family:'GPSMAP 8600',model:'GPSMAP 8616',category:'MFD',
 description:'MFD 16" all-in-one — Marine Network legacy.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-8616xsv',sku:'010-02093-52',family:'GPSMAP 8600',model:'GPSMAP 8616xsv',category:'MFD',
 description:'MFD 16" all-in-one com sondador integrado.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:2},{type:'USB',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== MFD — GPSMAP 1200 series ============== */
{id:'gar-gpsmap-1223',sku:'010-02367-00',family:'GPSMAP 1200',model:'GPSMAP 1223',category:'MFD',
 description:'MFD 12" multifunção — Marine Network + N2K (sem sondador integrado).',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:1},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-1223xsv',sku:'010-02367-02',family:'GPSMAP 1200',model:'GPSMAP 1223xsv',category:'MFD',
 description:'MFD 12" com sondador CHIRP/SideVü/ClearVü integrado.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-1243',sku:'010-02675-60',family:'GPSMAP 1200',model:'GPSMAP 1243',category:'MFD',
 description:'MFD 12" — sucessor do 1223 (sem sondador).',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:1},
  {type:'Power-12',qty:1}],_verify:true},
{id:'gar-gpsmap-1243xsv',sku:'010-02675-62',family:'GPSMAP 1200',model:'GPSMAP 1243xsv',category:'MFD',
 description:'MFD 12" com sondador integrado.',
 power:{voltage:'12-24VDC'},ports:[
  {type:'GarminMarineNet',qty:2},{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},
  {type:'WiFi',qty:1},{type:'HDMI',qty:1},{type:'Video-BNC',qty:1},
  {type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== MFD — ECHOMAP UHD2 (entry/mid) ============== */
{id:'gar-echomap-uhd2-54cv',sku:'010-02690-00',family:'ECHOMAP UHD2',model:'ECHOMAP UHD2 54cv',category:'MFD',
 description:'MFD 5" ClearVü — entry. NMEA 2000.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-echomap-uhd2-72cv',sku:'010-02691-00',family:'ECHOMAP UHD2',model:'ECHOMAP UHD2 72cv',category:'MFD',
 description:'MFD 7" ClearVü.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-echomap-uhd2-73sv',sku:'010-02691-01',family:'ECHOMAP UHD2',model:'ECHOMAP UHD2 73sv',category:'MFD',
 description:'MFD 7" SideVü/ClearVü.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-echomap-uhd2-93sv',sku:'010-02692-01',family:'ECHOMAP UHD2',model:'ECHOMAP UHD2 93sv',category:'MFD',
 description:'MFD 9" SideVü/ClearVü.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-echomap-ultra2-106sv',sku:'010-02880-00',family:'ECHOMAP Ultra 2',model:'ECHOMAP Ultra 2 106sv',category:'MFD',
 description:'MFD 10" SideVü/ClearVü/Panoptix-ready.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-echomap-ultra2-126sv',sku:'010-02882-00',family:'ECHOMAP Ultra 2',model:'ECHOMAP Ultra 2 126sv',category:'MFD',
 description:'MFD 12" Ultra 2 com sondador.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'WiFi',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Radar — Fantom dome (solid-state) ============== */
{id:'gar-fantom-18x',sku:'010-02462-00',family:'Fantom Dome',model:'GMR Fantom 18x',category:'Radar',
 description:'Radar dome solid-state 50W, alcance 48 nm — antena 18".',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-fantom-24x',sku:'010-02463-00',family:'Fantom Dome',model:'GMR Fantom 24x',category:'Radar',
 description:'Radar dome solid-state 50W, alcance 96 nm — antena 24".',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Radar — Fantom open-array (solid-state) ============== */
{id:'gar-fantom-124',sku:'K10-00012-19',family:'Fantom Open Array',model:'GMR Fantom 124',category:'Radar',
 description:'Radar open-array solid-state 4kW, antena 4 pés.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-fantom-126',sku:'010-01366-00',family:'Fantom Open Array',model:'GMR Fantom 126',category:'Radar',
 description:'Radar open-array solid-state 4kW, antena 6 pés.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Radar — GMR xHD3 (magnetron open-array) ============== */
{id:'gar-gmr-434-xhd3',sku:'010-02544-00',family:'GMR xHD3',model:'GMR 434 xHD3 (4ft 4kW)',category:'Radar',
 description:'Radar open-array 4kW, antena 4 pés — alcance 72 nm.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gmr-436-xhd3',sku:'010-02544-10',family:'GMR xHD3',model:'GMR 436 xHD3 (6ft 4kW)',category:'Radar',
 description:'Radar open-array 4kW, antena 6 pés.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gmr-1234-xhd3',sku:'010-02545-00',family:'GMR xHD3',model:'GMR 1234 xHD3 (4ft 12kW)',category:'Radar',
 description:'Radar open-array 12kW, antena 4 pés.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gmr-1236-xhd3',sku:'010-02545-10',family:'GMR xHD3',model:'GMR 1236 xHD3 (6ft 12kW)',category:'Radar',
 description:'Radar open-array 12kW, antena 6 pés — alcance 72 nm.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gmr-2534-xhd3',sku:'010-02546-00',family:'GMR xHD3',model:'GMR 2534 xHD3 (4ft 25kW)',category:'Radar',
 description:'Radar open-array 25kW, antena 4 pés — performance comercial.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gmr-2536-xhd3',sku:'010-02546-10',family:'GMR xHD3',model:'GMR 2536 xHD3 (6ft 25kW)',category:'Radar',
 description:'Radar open-array 25kW, antena 6 pés — flagship.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Sonar — Panoptix LiveScope ============== */
{id:'gar-lvs32',sku:'010-12784-03',family:'Panoptix LiveScope',model:'LVS32 Transducer',category:'Sonar',
 description:'Transdutor LiveScope original (1ª geração) — exige GLS 10.',
 power:{voltage:'-'},ports:[{type:'SonarConn',qty:1}],_verify:true,
 notes:'Conecta no GLS 10 via cabo proprietário.'},
{id:'gar-lvs34',sku:'010-12516-00',family:'Panoptix LiveScope+',model:'LVS34 Transducer',category:'Sonar',
 description:'Transdutor LiveScope Plus — exige GLS 10.',
 power:{voltage:'-'},ports:[{type:'SonarConn',qty:1}],_verify:true},
{id:'gar-lvs62',sku:'010-02719-10',family:'Panoptix LiveScope XR',model:'LVS62 Transducer',category:'Sonar',
 description:'Transdutor LiveScope XR — alcance estendido — exige GLS 10.',
 power:{voltage:'-'},ports:[{type:'SonarConn',qty:1}],_verify:true},
{id:'gar-gls10',sku:'010-02610-00',family:'LiveScope',model:'GLS 10 LiveScope Module',category:'Sonar',
 description:'Black-box do sistema LiveScope/Panoptix — interface entre transdutor e MFD.',
 power:{voltage:'12VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Sonar — black-box ============== */
{id:'gar-gsd-26',sku:'010-01112-00',family:'GSD',model:'GSD 26 CHIRP Module',category:'Sonar',
 description:'Sondador CHIRP profissional 25–210 kHz, 300–3000W, alcance 3000m. Dual-transducer.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'SonarConn',qty:2},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gcv-20',sku:'010-02055-10',family:'GCV',model:'GCV 20 Ultra HD Scanning',category:'Sonar',
 description:'Sondador scanning UHD 800–1200 kHz, 500W. Compartilha imagem em rede.',
 power:{voltage:'12VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'SonarConn',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Autopilot — Reactor 40 ============== */
{id:'gar-reactor40-hyd-corepack',sku:'010-00705-86',family:'Reactor 40',model:'Reactor 40 Hydraulic Corepack + SmartPump v2',category:'Autopilot',
 description:'Pacote hidráulico (CCU + SmartPump v2 + cabos). Adicionar GHC 50 separado.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-reactor40-hyd-1l2',sku:'010-00705-08',family:'Reactor 40',model:'Reactor 40 Hydraulic + 1.2L Pump',category:'Autopilot',
 description:'Pacote hidráulico para sistemas 6–14 cu.in (CCU + ECU + bomba 1.2L).',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-reactor40-mech',sku:'010-00705-89',family:'Reactor 40',model:'Reactor 40 Mechanical Corepack',category:'Autopilot',
 description:'Pacote mecânico (drive direto no leme) — adicionar GHC 50 separado.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-reactor40-compact',sku:'010-00705-06',family:'Reactor 40',model:'Reactor 40 Compact',category:'Autopilot',
 description:'Compact Reactor 40 — barcos pequenos com leme hidráulico.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-reactor40-kicker',sku:'010-00705-95',family:'Reactor 40',model:'Reactor 40 Kicker',category:'Autopilot',
 description:'Autopilot para motor de popa pequeno (gás).',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},

{id:'gar-ccu',sku:'010-11052-67',family:'Reactor 40',model:'CCU Course Computer',category:'Autopilot',
 description:'Componente do Reactor 40 — sensor de heading principal.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-ecu10',sku:'010-11053-02',family:'Reactor 40',model:'ECU 10',category:'Autopilot',
 description:'Componente do Reactor 40 — comanda a bomba a partir do CCU.',
 power:{voltage:'12VDC'},ports:[{type:'Power-12',qty:1}],_verify:true},

{id:'gar-ghc50',sku:'010-02496-00',family:'GHC',model:'GHC 50 Pilot Display',category:'Autopilot',
 description:'Display de controle do autopilot (mais novo, color).',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-ghc20',sku:'010-01141-00',family:'GHC',model:'GHC 20 Pilot Display',category:'Autopilot',
 description:'Display de controle do autopilot (legacy).',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},

/* ============== Trolling motor — Force ============== */
{id:'gar-force-kraken-48',sku:'010-02573-30',family:'Force Kraken',model:'Force Kraken 48" Black',category:'TrollingMotor',
 description:'Trolling motor Kraken 48" eixo — 100 lbs thrust.',
 power:{voltage:'24-36VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-24',qty:1}],_verify:true},
{id:'gar-force-kraken-63',sku:'010-02573-00',family:'Force Kraken',model:'Force Kraken 63" Black',category:'TrollingMotor',
 description:'Trolling motor Kraken 63" — 100 lbs thrust.',
 power:{voltage:'24-36VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-24',qty:1}],_skuConfirmedByLucas:true},
{id:'gar-force-kraken-75',sku:'010-02573-10',family:'Force Kraken',model:'Force Kraken 75" Black',category:'TrollingMotor',
 description:'Trolling motor Kraken 75".',
 power:{voltage:'24-36VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Power-24',qty:1}],_verify:true},

/* ============== VHF / AIS ============== */
{id:'gar-vhf-115',sku:'010-01957-00',family:'VHF',model:'VHF 115',category:'VHF',
 description:'VHF DSC fixo entry, sem AIS, com microfone.',
 power:{voltage:'12VDC'},ports:[{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-vhf-215',sku:'010-01959-00',family:'VHF',model:'VHF 215',category:'VHF',
 description:'VHF DSC fixo com GPS interno e NMEA 2000.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-vhf-215-ais',sku:'010-01959-01',family:'VHF',model:'VHF 215 AIS',category:'VHF',
 description:'VHF DSC com receptor AIS integrado.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-vhf-315',sku:'010-02047-00',family:'VHF',model:'VHF 315',category:'VHF',
 description:'VHF DSC modular 25W com intercom e GPS.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-vhf-315i',sku:'010-02047-01',family:'VHF',model:'VHF 315i (intercom)',category:'VHF',
 description:'VHF 315 com intercom adicional.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}],_verify:true},

{id:'gar-ais-800',sku:'010-02087-00',family:'AIS',model:'AIS 800 Class B SOTDMA',category:'AIS',
 description:'Transponder AIS Classe B/SO 5W com splitter VHF integrado.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'NMEA0183',qty:1},{type:'VHFAntenna',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Instrumentos ============== */
{id:'gar-gmi-20',sku:'010-01140-00',family:'GMI',model:'GMI 20 Marine Instrument',category:'Instrument',
 description:'Display de instrumentação 4" color, 100+ parâmetros NMEA 2000.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-gnx-20',sku:'010-01211-00',family:'GNX',model:'GNX 20',category:'Instrument',
 description:'Display monocromático 4" — 50+ parâmetros.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-gnx-120',sku:'010-01211-10',family:'GNX',model:'GNX 120 (7")',category:'Instrument',
 description:'Display 7" mono backlit — high precision.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-gnx-130',sku:'010-01211-20',family:'GNX',model:'GNX 130 (10")',category:'Instrument',
 description:'Display 10" mono — dígitos 2.75" — visível à distância.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},

/* ============== Network / Power ============== */
{id:'gar-bluenet-20',sku:'010-12345-00',family:'BlueNet',model:'BlueNet 20 Switch',category:'Network',
 description:'Switch BlueNet 5 portas — expansão de rede BlueNet.',
 power:{voltage:'12-24VDC'},ports:[{type:'BlueNet',qty:5},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-bluenet-30',sku:'010-12346-00',family:'BlueNet',model:'BlueNet 30 Gateway',category:'Network',
 description:'Gateway BlueNet ↔ Marine Network legacy. Permite coexistência das duas gerações.',
 power:{voltage:'12-24VDC'},ports:[{type:'BlueNet',qty:1},{type:'GarminMarineNet',qty:2},{type:'Power-12',qty:1}],_verify:true,
 notes:'Crítico para projetos híbridos com MFDs novos (9000) + equipamento legacy (radar, sondador).'},
{id:'gar-gms-10',sku:'010-00351-00',family:'GMS',model:'GMS 10 Network Port Expander',category:'Network',
 description:'Switch Marine Network legacy 6 portas.',
 power:{voltage:'12-24VDC'},ports:[{type:'GarminMarineNet',qty:6},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-gtb-10',sku:'010-02134-00',family:'OnDeck',model:'GTB 10 OnDeck Hub',category:'Network',
 description:'Hub OnDeck — telemetria remota e monitoramento. Conecta direto a MFD BlueNet ou BlueNet 20 switch.',
 power:{voltage:'12VDC'},ports:[{type:'BlueNet',qty:1},{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-poe-coupler',sku:'010-10580-10',family:'Marine Net',model:'PoE Isolation Coupler',category:'Network',
 description:'Acoplador PoE para conectar câmeras térmicas/luzes UW à rede sem danificar.',
 ports:[{type:'GarminMarineNet',qty:1},{type:'PoE',qty:1}],_verify:true,
 notes:'Obrigatório entre dispositivos PoE (FLIR, luzes UW) e switch GMS 10/MFD.'},

/* ============== GPS / Antennas ============== */
{id:'gar-gps-24xd',sku:'010-02315-00',family:'GPS Antenna',model:'GPS 24xd Receiver',category:'Antenna',
 description:'Antena GPS multi-banda (GPS, Galileo, GLONASS, BeiDou) — N2K. IPX7.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-gps-24xd-hvs',sku:'010-02316-10',family:'GPS Antenna',model:'GPS 24xd HVS (heading)',category:'Antenna',
 description:'GPS 24xd com heading sensor integrado.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-ga-38',sku:'010-12017-00',family:'GA Antenna',model:'GA 38 GPS/GLONASS',category:'Antenna',
 description:'Antena GPS/GLONASS para uso em VHF e MFD que precisam de GPS externo.',
 ports:[{type:'GPSAntenna',qty:1}],_verify:true},
{id:'gar-gxm-54',sku:'010-02277-00',family:'GXM',model:'GXM 54 SiriusXM Receiver',category:'Antenna',
 description:'Receptor de tempo SiriusXM (USA) — overlay de clima no MFD.',
 power:{voltage:'12VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Cameras ============== */
{id:'gar-gc-200',sku:'010-02164-00',family:'GC',model:'GC 200 Marine IP Camera',category:'Camera',
 description:'Câmera IP 1920x1080 dome com IR, 30m night vision. PoE — exige PoE Coupler.',
 ports:[{type:'PoE',qty:1}],_verify:true,
 notes:'Conecta no PoE Coupler antes do switch/MFD.'},
{id:'gar-gsv-10',sku:'010-02482-00',family:'GSV',model:'GSV 10 Surround View',category:'Camera',
 description:'Sistema de câmeras surround (até 6 câmeras BC30) — visão panorâmica 360°.',
 power:{voltage:'12VDC'},ports:[{type:'GarminMarineNet',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* ============== Sensores ============== */
{id:'gar-gwind-wired',sku:'010-01616-20',family:'gWind',model:'gWind Wired Transducer',category:'Sensor',
 description:'Transdutor de vento twin-fin com 3 pás — TWS/TWA. NMEA 2000.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-gwind-wireless',sku:'010-01616-00',family:'gWind',model:'gWind Wireless Transducer',category:'Sensor',
 description:'Versão wireless do gWind.',
 ports:[{type:'WiFi',qty:1}],_verify:true},
{id:'gar-gst-43',sku:'010-04284-00',family:'GST',model:'GST 43 Speed/Temp Thru-Hull 43mm',category:'Sensor',
 description:'Transdutor velocidade/temperatura passante 43mm — substitui Nexus TH43.',
 ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-gdt-43',sku:'010-01749-00',family:'GDT',model:'GDT 43 Depth Thru-Hull 43mm',category:'Sensor',
 description:'Transdutor de profundidade 43mm — adapta a NMEA 2000.',
 ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-dst-810',sku:'010-11051-20',family:'Airmar',model:'DST 810 Smart Triducer',category:'Sensor',
 description:'Transdutor Airmar profundidade/velocidade/temperatura wireless via NMEA 2000.',
 ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'gar-grf-10',sku:'010-11399-00',family:'GRF',model:'GRF 10 Rudder Angle',category:'Sensor',
 description:'Sensor de ângulo de leme — N2K. Usado com Reactor 40.',
 ports:[{type:'N2K-Micro',qty:1}],_verify:true},

/* ============== Áudio (Fusion / Garmin) ============== */
{id:'gar-fusion-ra770',sku:'010-01905-00',family:'Apollo',model:'Fusion Apollo MS-RA770',category:'Audio',
 description:'Stereo marine touchscreen com WiFi/AirPlay 2/PartyBus. 4 zonas. NMEA 2000.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'WiFi',qty:1},{type:'Bluetooth',qty:1},{type:'Audio',qty:8},{type:'Power-12',qty:1}],_verify:true},
{id:'gar-fusion-ra670',sku:'010-02138-00',family:'Apollo',model:'Fusion Apollo MS-RA670',category:'Audio',
 description:'Stereo marine compacto com DSP. 3 zonas. NMEA 2000.',
 power:{voltage:'12VDC'},ports:[{type:'N2K-Micro',qty:1},{type:'Bluetooth',qty:1},{type:'Audio',qty:6},{type:'Power-12',qty:1}],_verify:true}

];

/* =========================================================================
   ADAPTERS / CABLES — gateways, terminadores, cabos críticos
   ========================================================================= */
const ADAPTERS = [
/* N2K core */
{id:'adp-n2k-term-m',sku:'010-11080-00',brand:'Garmin',family:'N2K',model:'Terminador N2K Macho 120Ω',category:'Adapter',description:'Terminador macho 120Ω.',ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'adp-n2k-term-f',sku:'010-11081-00',brand:'Garmin',family:'N2K',model:'Terminador N2K Fêmea 120Ω',category:'Adapter',description:'Terminador fêmea 120Ω.',ports:[{type:'N2K-Micro',qty:1}],_verify:true},
{id:'adp-n2k-tee',sku:'010-11078-00',brand:'Garmin',family:'N2K',model:'Tee Conector N2K',category:'Adapter',description:'Tee para drop no backbone.',ports:[{type:'N2K-Micro',qty:3}],_verify:true},
{id:'adp-n2k-power',sku:'010-11079-00',brand:'Garmin',family:'N2K',model:'Cabo Alimentação N2K (fusível 3A)',category:'Adapter',description:'Cabo de alimentação 12 VDC do backbone — fusível inline 3A.',ports:[{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},

/* N2K cabos backbone/drop */
{id:'cab-n2k-2m',sku:'010-11076-00',brand:'Garmin',family:'N2K',model:'Cabo N2K Backbone 2m',category:'Cable',description:'Cabo backbone NMEA 2000 — 2m.',ports:[{type:'N2K-Micro',qty:2}],length:2,_verify:true},
{id:'cab-n2k-6m',sku:'010-11076-01',brand:'Garmin',family:'N2K',model:'Cabo N2K Backbone 6m',category:'Cable',description:'Cabo backbone — 6m.',ports:[{type:'N2K-Micro',qty:2}],length:6,_verify:true},
{id:'cab-n2k-10m',sku:'010-11076-02',brand:'Garmin',family:'N2K',model:'Cabo N2K Backbone 10m',category:'Cable',description:'Cabo backbone — 10m.',ports:[{type:'N2K-Micro',qty:2}],length:10,_verify:true},

/* Marine Network cables */
{id:'cab-gmn-2m',sku:'010-10550-00',brand:'Garmin',family:'Marine Network',model:'Cabo Marine Network 1.8m (6ft)',category:'Cable',description:'Cabo Marine Network RJ45 — 1.8m.',ports:[{type:'GarminMarineNet',qty:2}],length:1.8,_verify:true},
{id:'cab-gmn-6m',sku:'010-10551-00',brand:'Garmin',family:'Marine Network',model:'Cabo Marine Network 6m (20ft)',category:'Cable',description:'Cabo Marine Network RJ45 — 6m.',ports:[{type:'GarminMarineNet',qty:2}],length:6,_verify:true},
{id:'cab-gmn-12m',sku:'010-10552-00',brand:'Garmin',family:'Marine Network',model:'Cabo Marine Network 12m (40ft)',category:'Cable',description:'Cabo Marine Network RJ45 — 12m.',ports:[{type:'GarminMarineNet',qty:2}],length:12,_verify:true},
{id:'cab-gmn-15m',sku:'010-10553-00',brand:'Garmin',family:'Marine Network',model:'Cabo Marine Network 15m (50ft)',category:'Cable',description:'Cabo Marine Network RJ45 — 15m.',ports:[{type:'GarminMarineNet',qty:2}],length:15,_verify:true},

/* BlueNet cables */
{id:'cab-bn-2m',sku:'010-12528-30',brand:'Garmin',family:'BlueNet',model:'Cabo BlueNet 2m (6ft)',category:'Cable',description:'Cabo BlueNet — 2m.',ports:[{type:'BlueNet',qty:2}],length:2,_verify:true},
{id:'cab-bn-6m',sku:'010-12528-31',brand:'Garmin',family:'BlueNet',model:'Cabo BlueNet 6m',category:'Cable',description:'Cabo BlueNet — 6m.',ports:[{type:'BlueNet',qty:2}],length:6,_verify:true},
{id:'cab-bn-15m',sku:'010-12528-03',brand:'Garmin',family:'BlueNet',model:'Cabo BlueNet 15m',category:'Cable',description:'Cabo BlueNet — 15m.',ports:[{type:'BlueNet',qty:2}],length:15,_verify:true},

/* 0183 / J1939 gateways */
{id:'adp-ngw-1',sku:'NGW-1-USB',brand:'Actisense',family:'Gateway',model:'NGW-1 NMEA 0183 ↔ N2K',category:'Adapter',description:'Gateway bidirecional 0183 ↔ NMEA 2000.',power:{voltage:'12VDC'},ports:[{type:'NMEA0183',qty:2},{type:'N2K-Micro',qty:1},{type:'USB',qty:1}],_verify:true},
{id:'adp-j2k100',sku:'J2K100',brand:'Maretron',family:'Gateway',model:'J2K100 J1939 → N2K',category:'Adapter',description:'Gateway motor J1939 → NMEA 2000.',power:{voltage:'12VDC'},ports:[{type:'J1939',qty:1},{type:'N2K-Micro',qty:1},{type:'Power-12',qty:1}],_verify:true},
{id:'adp-ydem-01',sku:'YDEG-04N',brand:'Yacht Devices',family:'Gateway',model:'YDEG-04N J1939/N2K Engine Gateway',category:'Adapter',description:'Gateway compacto J1939 → N2K (conector DeviceNet Micro).',power:{voltage:'12VDC'},ports:[{type:'J1939',qty:1},{type:'N2K-Micro',qty:1}],_verify:true}
];

/* =========================================================================
   ZONAS PADRÃO — agrupamentos visuais usados nos PDFs técnicos do Lucas
   ========================================================================= */
const DEFAULT_ZONES = [
  {name:'LEFT HELM',color:'#1d3557'},
  {name:'RIGHT HELM',color:'#1d3557'},
  {name:'MAST',color:'#2a4d3a'},
  {name:'BOW',color:'#5a3a1d'},
  {name:'STERN',color:'#5a1d3a'},
  {name:'ENGINE ROOM',color:'#3a3a3a'},
  {name:'OPTION',color:'#444'}
];

/* =========================================================================
   PORT_TYPES — definição visual e compatibilidade
   ========================================================================= */
const PORT_TYPES = {
  'BlueNet':           {label:'BlueNet',         color:'#3aa3e0', group:'bluenet',   stroke:'solid'},
  'GarminMarineNet':   {label:'Garmin Network',  color:'#2dbe4d', group:'gmn',       stroke:'solid'},
  'N2K-Micro':         {label:'NMEA 2000',       color:'#1f5dc4', group:'n2k',       stroke:'solid'},
  'NMEA0183':          {label:'NMEA 0183',       color:'#888',    group:'o183',      stroke:'solid'},
  'J1939':             {label:'J1939 Motor',     color:'#ff8c3a', group:'j1939',     stroke:'solid'},
  'SonarConn':         {label:'Sonar (proprietário)',color:'#a86bff',group:'sonar',  stroke:'solid'},
  'HDMI':              {label:'HDMI',            color:'#cc66cc', group:'video',     stroke:'solid'},
  'Video-BNC':         {label:'Vídeo BNC',       color:'#cc66cc', group:'video',     stroke:'solid'},
  'USB':               {label:'USB',             color:'#aaa',    group:'usb',       stroke:'solid'},
  'WiFi':              {label:'Wi-Fi',           color:'#bbb',    group:'wifi',      stroke:'dashed'},
  'Bluetooth':         {label:'Bluetooth',       color:'#bbb',    group:'bt',        stroke:'dashed'},
  'PoE':               {label:'PoE',             color:'#dab600', group:'poe',       stroke:'solid'},
  'Power-12':          {label:'Energia 12V',     color:'#e54545', group:'pwr12',     stroke:'dashed'},
  'Power-24':          {label:'Energia 24V',     color:'#9b1c1c', group:'pwr24',     stroke:'dashed'},
  'Audio':             {label:'Áudio',           color:'#3aa3e0', group:'audio',     stroke:'solid'},
  'VHFAntenna':        {label:'Antena VHF',      color:'#999',    group:'vhfant',    stroke:'solid'},
  'GPSAntenna':        {label:'Antena GPS',      color:'#999',    group:'gpsant',   stroke:'solid'}
};

const COMPAT = {};
['N2K-Micro'].forEach(p=>{COMPAT[p]=['N2K-Micro']});
['BlueNet'].forEach(p=>{COMPAT[p]=['BlueNet']});
['GarminMarineNet'].forEach(p=>{COMPAT[p]=['GarminMarineNet']});
['NMEA0183'].forEach(p=>{COMPAT[p]=['NMEA0183']});
['J1939'].forEach(p=>{COMPAT[p]=['J1939']});
['SonarConn'].forEach(p=>{COMPAT[p]=['SonarConn']});
['HDMI'].forEach(p=>{COMPAT[p]=['HDMI']});
['Video-BNC'].forEach(p=>{COMPAT[p]=['Video-BNC']});
['USB'].forEach(p=>{COMPAT[p]=['USB']});
['Power-12'].forEach(p=>{COMPAT[p]=['Power-12']});
['Power-24'].forEach(p=>{COMPAT[p]=['Power-24']});
['PoE'].forEach(p=>{COMPAT[p]=['PoE','GarminMarineNet']});
['Audio'].forEach(p=>{COMPAT[p]=['Audio']});
['VHFAntenna'].forEach(p=>{COMPAT[p]=['VHFAntenna']});
['GPSAntenna'].forEach(p=>{COMPAT[p]=['GPSAntenna']});

/* =========================================================================
   RULES — validação Garmin
   ========================================================================= */
const RULES = [

{id:'R-N2K-01',name:'Backbone NMEA 2000 deve ter 2 terminadores',severity:'warn',
 check:(project,api)=>{
   const comps=api.getNetworkComponents(e=>api.edgeIsType(e,'n2k'));
   const issues=[];
   comps.forEach(comp=>{
     let terms=0;
     comp.forEach(uid=>{
       const node=project.nodes.find(n=>n.uid===uid);
       const dev=api.getDeviceById(node.deviceId);
       if(dev&&/Terminador/i.test(dev.model)) terms++;
     });
     if(terms<2) issues.push({title:`Backbone N2K com ${terms} terminador(es)`,msg:'NMEA 2000 exige 2 terminadores 120Ω, um em cada extremidade.',fix:'Adicionar terminadores macho/fêmea (Adaptadores → N2K).'});
     else if(terms>2) issues.push({title:`Backbone N2K com ${terms} terminadores (excesso)`,msg:'Mais de 2 terminadores causa atenuação.',fix:'Remover terminadores extras.'});
   });
   return issues;
 }},

{id:'R-N2K-02',name:'Backbone N2K precisa de alimentação',severity:'error',
 check:(project,api)=>{
   const comps=api.getNetworkComponents(e=>api.edgeIsType(e,'n2k'));
   const issues=[];
   comps.forEach(comp=>{
     let pwr=0;
     comp.forEach(uid=>{
       const node=project.nodes.find(n=>n.uid===uid);
       const dev=api.getDeviceById(node.deviceId);
       if(dev&&/Alimenta|Power\s*Tee/i.test(dev.model)) pwr++;
     });
     if(pwr===0) issues.push({title:'Backbone N2K sem alimentação',msg:'NMEA 2000 exige cabo de alimentação 12 VDC com fusível ~3A.',fix:'Adicionar "Cabo Alimentação N2K".'});
     else if(pwr>1) issues.push({title:'Backbone N2K com múltiplas alimentações',msg:`${pwr} pontos de alimentação detectados — só 1 é permitido.`,fix:'Manter 1 cabo de alimentação.'});
   });
   return issues;
 }},

{id:'R-BN-01',name:'BlueNet 30 Gateway exigido para Marine Network legacy',severity:'error',
 check:(project,api)=>{
   const issues=[];
   // verifica se há nodes BlueNet conectados a nodes Marine Network sem passar por gateway
   const bnComps=api.getNetworkComponents(e=>api.edgeIsType(e,'bluenet'));
   const gmnComps=api.getNetworkComponents(e=>api.edgeIsType(e,'gmn'));
   const hasBN=bnComps.length>0;
   const hasGMN=gmnComps.length>0;
   if(hasBN&&hasGMN){
     const hasGateway=project.nodes.some(n=>{const d=api.getDeviceById(n.deviceId);return d&&/BlueNet\s*30/i.test(d.model)});
     if(!hasGateway) issues.push({title:'Coexistência BlueNet + Marine Network sem gateway',msg:'Equipamento BlueNet (GPSMAP 9000) e Marine Network legacy não interoperam diretamente.',fix:'Adicionar BlueNet 30 Gateway entre as duas redes.'});
   }
   return issues;
 }},

{id:'R-PANO-01',name:'Transdutor LiveScope/Panoptix exige GLS 10',severity:'error',
 check:(project,api)=>{
   const issues=[];
   project.nodes.forEach(n=>{
     const d=api.getDeviceById(n.deviceId);
     if(!d) return;
     if(/LVS\d{2}|Panoptix/i.test(d.model)){
       const hasGLS=project.nodes.some(x=>{const xd=api.getDeviceById(x.deviceId);return xd&&/GLS\s*10/i.test(xd.model)});
       if(!hasGLS) issues.push({title:`${d.model} sem GLS 10`,msg:'Transdutor LiveScope/Panoptix exige o módulo black-box GLS 10.',fix:'Adicionar GLS 10 ao projeto.'});
     }
   });
   return issues;
 }},

{id:'R-POE-01',name:'Câmera PoE exige PoE Isolation Coupler',severity:'error',
 check:(project,api)=>{
   const issues=[];
   project.nodes.forEach(n=>{
     const d=api.getDeviceById(n.deviceId);
     if(!d) return;
     const hasPoE=(d.ports||[]).some(p=>p.type==='PoE');
     if(!hasPoE) return;
     // checa se este nó está conectado a um PoE Coupler antes de ir pro switch/MFD
     const directEdges=project.edges.filter(e=>e.fromNode===n.uid||e.toNode===n.uid);
     const hasCoupler=directEdges.some(e=>{
       const otherUid=e.fromNode===n.uid?e.toNode:e.fromNode;
       const o=project.nodes.find(x=>x.uid===otherUid);
       const od=o&&api.getDeviceById(o.deviceId);
       return od&&/PoE\s*Isolation/i.test(od.model);
     });
     if(!hasCoupler) issues.push({title:`Câmera PoE sem coupler: ${d.model}`,msg:'Dispositivos PoE conectados direto à rede Marine Network podem causar danos.',fix:'Inserir PoE Isolation Coupler entre a câmera e o switch/MFD.'});
   });
   return issues;
 }},

{id:'R-RADAR-01',name:'Radar sem MFD compatível na rede',severity:'error',
 check:(project,api)=>{
   const issues=[];
   project.nodes.forEach(n=>{
     const d=api.getDeviceById(n.deviceId);
     if(!d||d.category!=='Radar') return;
     const radarPort=(d.ports||[]).find(p=>['BlueNet','GarminMarineNet'].includes(p.type));
     if(!radarPort) return;
     const groupMap={BlueNet:'bluenet',GarminMarineNet:'gmn'};
     const group=groupMap[radarPort.type];
     const comps=api.getNetworkComponents(e=>api.edgeIsType(e,group));
     const myComp=comps.find(c=>c.includes(n.uid));
     if(!myComp){
       issues.push({title:`Radar isolado: ${d.model}`,msg:`Radar precisa estar na rede ${PORT_TYPES[radarPort.type].label} junto a pelo menos 1 MFD.`,fix:'Conectar o radar ao MFD ou switch (GMS 10 / BlueNet 20).'});
       return;
     }
     const hasMfd=myComp.some(uid=>{const x=project.nodes.find(z=>z.uid===uid);const xd=api.getDeviceById(x.deviceId);return xd?.category==='MFD'});
     if(!hasMfd) issues.push({title:`Radar sem MFD na rede: ${d.model}`,msg:'Radar conectado mas sem MFD compatível no segmento.',fix:`Adicionar MFD à rede ${PORT_TYPES[radarPort.type].label}.`});
   });
   return issues;
 }},

{id:'R-AP-01',name:'Autopilot sem componentes essenciais',severity:'warn',
 check:(project,api)=>{
   const issues=[];
   project.nodes.forEach(n=>{
     const d=api.getDeviceById(n.deviceId);
     if(!d) return;
     if(/Reactor 40 Hydraulic Corepack|Reactor 40 Mechanical Corepack/i.test(d.model)){
       const hasGHC=project.nodes.some(x=>{const xd=api.getDeviceById(x.deviceId);return xd&&/GHC\s*[2-9]0/i.test(xd.model)});
       if(!hasGHC) issues.push({title:`Reactor 40 sem display GHC`,msg:'Corepack do Reactor 40 não inclui display de controle.',fix:'Adicionar GHC 50 (recomendado) ou GHC 20.'});
     }
   });
   return issues;
 }},

{id:'R-VHF-01',name:'VHF DSC sem GPS conectado',severity:'warn',
 check:(project,api)=>{
   const issues=[];
   project.nodes.forEach(n=>{
     const d=api.getDeviceById(n.deviceId);
     if(!d||d.category!=='VHF') return;
     const connected=project.edges.some(e=>e.fromNode===n.uid||e.toNode===n.uid);
     if(!connected) issues.push({title:`VHF DSC isolado: ${d.model}`,msg:'VHF com DSC precisa receber posição GPS para alerta de socorro.',fix:'Conectar ao backbone N2K ou via NMEA 0183 a um receptor GPS.'});
   });
   return issues;
 }},

{id:'R-J1939-01',name:'J1939 deve passar por gateway antes de N2K',severity:'error',
 check:(project,api)=>{
   const issues=[];
   project.nodes.forEach(n=>{
     const d=api.getDeviceById(n.deviceId);
     if(!d) return;
     const hasJ=(d.ports||[]).some(p=>p.type==='J1939');
     if(!hasJ) return;
     const hasN2K=(d.ports||[]).some(p=>p.type==='N2K-Micro');
     if(hasN2K) return;
     const eds=project.edges.filter(e=>e.fromNode===n.uid||e.toNode===n.uid);
     const ok=eds.some(e=>{
       const ouid=e.fromNode===n.uid?e.toNode:e.fromNode;
       const o=project.nodes.find(x=>x.uid===ouid);
       const od=o&&api.getDeviceById(o.deviceId);
       return od&&(od.ports||[]).some(p=>p.type==='J1939')&&(od.ports||[]).some(p=>p.type==='N2K-Micro');
     });
     if(!ok) issues.push({title:`Motor J1939 sem gateway: ${d.model}`,msg:'Conexão J1939↔N2K direta não é permitida.',fix:'Adicionar Maretron J2K100 ou Yacht Devices YDEG-04N.'});
   });
   return issues;
 }},

{id:'R-DUP-01',name:'Porta com múltiplas conexões',severity:'warn',
 check:(project)=>{
   const issues=[];
   const use={};
   project.edges.forEach(e=>{
     [`${e.fromNode}:${e.fromPort}`,`${e.toNode}:${e.toPort}`].forEach(k=>use[k]=(use[k]||0)+1);
   });
   Object.entries(use).forEach(([k,n])=>{
     if(n>1) issues.push({title:`Porta usada ${n}× simultaneamente`,msg:'Mesma porta física com múltiplas conexões.',fix:'Usar Tee N2K ou switch BlueNet/Marine Network.'});
   });
   return issues;
 }},

{id:'R-CABLE-01',name:'Cabos sem comprimento definido',severity:'info',
 check:(project)=>{
   const issues=[];
   const missing=project.edges.filter(e=>!e.length).length;
   if(missing>0) issues.push({title:`${missing} cabo(s) sem comprimento`,msg:'Comprimento dos cabos é necessário para a Lista de Cabos.',fix:'Selecionar cabo no canvas e preencher comprimento no inspetor.'});
   return issues;
 }}

];


/* Watts típicos (estimados de spec sheets públicas; todos _verify) */
[
  ['gar-gpsmap-9012',45],['gar-gpsmap-9016',55],['gar-gpsmap-9019',65],['gar-gpsmap-9022',75],['gar-gpsmap-9024',80],['gar-gpsmap-9027',90],
  ['gar-gpsmap-8410',32],['gar-gpsmap-8410xsv',38],['gar-gpsmap-8412',38],['gar-gpsmap-8412xsv',42],['gar-gpsmap-8416',55],['gar-gpsmap-8416xsv',60],
  ['gar-gpsmap-8612',38],['gar-gpsmap-8612xsv',42],['gar-gpsmap-8616',55],['gar-gpsmap-8616xsv',60],
  ['gar-gpsmap-1223',24],['gar-gpsmap-1223xsv',28],['gar-gpsmap-1243',26],['gar-gpsmap-1243xsv',30],
  ['gar-echomap-uhd2-54cv',8],['gar-echomap-uhd2-72cv',12],['gar-echomap-uhd2-73sv',14],['gar-echomap-uhd2-93sv',18],
  ['gar-echomap-ultra2-106sv',20],['gar-echomap-ultra2-126sv',26],
  ['gar-fantom-18x',16],['gar-fantom-24x',18],['gar-fantom-124',45],['gar-fantom-126',50],
  ['gar-gmr-434-xhd3',60],['gar-gmr-436-xhd3',60],['gar-gmr-1234-xhd3',75],['gar-gmr-1236-xhd3',75],['gar-gmr-2534-xhd3',95],['gar-gmr-2536-xhd3',95],
  ['gar-gls10',20],['gar-gsd-26',60],['gar-gcv-20',24],
  ['gar-reactor40-hyd-corepack',20],['gar-reactor40-hyd-1l2',30],['gar-reactor40-mech',18],['gar-reactor40-compact',18],['gar-reactor40-kicker',12],
  ['gar-ccu',2],['gar-ecu10',8],['gar-ghc50',3],['gar-ghc20',3],
  ['gar-vhf-115',6],['gar-vhf-215',7],['gar-vhf-215-ais',8],['gar-vhf-315',9],['gar-vhf-315i',10],['gar-ais-800',6],
  ['gar-gmi-20',1.5],['gar-gnx-20',1.2],['gar-gnx-120',2.5],['gar-gnx-130',3.5],
  ['gar-bluenet-20',5],['gar-bluenet-30',5],['gar-gms-10',4],['gar-gtb-10',4],
  ['gar-gps-24xd',1],['gar-gps-24xd-hvs',1.5],['gar-gxm-54',5],
  ['gar-gc-200',6],['gar-gsv-10',12],
  ['gar-fusion-ra770',45],['gar-fusion-ra670',40]
].forEach(([id,w])=>{const d=CATALOG.find(x=>x.id===id);if(d){d.power=d.power||{};d.power.watts=w;d._powerVerify=true}});

/* expor catálogo + utilitários */
window.GARMIN = {CATALOG,ADAPTERS,RULES,DEFAULT_ZONES,PORT_TYPES,COMPAT,BRAND};