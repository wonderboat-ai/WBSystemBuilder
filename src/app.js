/* === Versão do build (bump manual a cada release relevante — sem etapa de build/CI) === */
const APP_VERSION = '2026.08.18';

/* === Boot error catcher (deve rodar primeiro) === */
/* === Captura erros antes de qualquer coisa, exibe visível na tela === */
window.__bootErrors = [];
window.addEventListener('error', function(e){
  window.__bootErrors.push((e.message||'erro')+' @ '+(e.filename||'')+':'+(e.lineno||''));
  showErrPanel();
});
window.addEventListener('unhandledrejection', function(e){
  window.__bootErrors.push('Promise: '+(e.reason?.message||e.reason));
  showErrPanel();
});
function showErrPanel(){
  if(!document.body) return;
  var p = document.getElementById('__err_panel');
  if(!p){
    p = document.createElement('div');
    p.id = '__err_panel';
    p.style.cssText='position:fixed;top:0;left:0;right:0;background:#ff5b6c;color:#000;padding:12px 18px;font-family:monospace;font-size:12px;z-index:99999;border-bottom:3px solid #000;line-height:1.5';
    document.body.appendChild(p);
  }
  p.innerHTML = '<strong>⚠ ERRO NO APP — manda print pro Lucas:</strong><br>' + window.__bootErrors.join('<br>');
}
function showBootOK(catN, adpN){
  var p = document.createElement('div');
  p.style.cssText='position:fixed;bottom:6px;left:6px;background:#3ec78f;color:#000;padding:4px 10px;font-family:monospace;font-size:10px;z-index:99999;border-radius:3px;opacity:.85';
  p.textContent='✓ v'+APP_VERSION+' · '+catN+' equipamentos · '+adpN+' adapters · 11 regras · Item Livre habilitado';
  document.body.appendChild(p);
  setTimeout(function(){p.style.display='none'},6000);
}

/* === App principal === */
/* ===========================================================================
   GARMIN SYSTEM BUILDER — APP
   ===========================================================================
   CATALOG, ADAPTERS, RULES, DEFAULT_ZONES, PORT_TYPES, COMPAT
   já estão no escopo global lexical (declarados no script de dados acima).
   Não redeclaramos aqui — em scripts não-module, redeclarar dá SyntaxError.
*/

function uid(){return 'n'+Math.random().toString(36).slice(2,9)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function getDeviceById(id){
  // free item: id começa com 'free:' — busca no project.freeItems
  if(id && id.indexOf('free:')===0){
    return state.project.freeItems?.find(d=>d.id===id) || null;
  }
  return CATALOG.find(d=>d.id===id)||ADAPTERS.find(d=>d.id===id);
}

// Ponto central de "adicionar device ao projeto" — usado pelo drop no canvas e pela busca global.
// Detecta zona automaticamente e, se for o 1º device N2K do projeto, auto-insere o Cabo
// Alimentação N2K (ver maybeAutoInsertN2kPower).
function addDeviceNode(deviceId, x, y, extra, zonePt){
  const node = Object.assign({uid:uid(), deviceId, x, y}, extra||{});
  // Teste de zona usa o ponto real do cursor (zonePt) quando informado — x/y do node já vêm
  // com o offset de centralização aplicado pelo chamador (ex: drop na vista Tudo), então testar
  // a zona com esse offset em vez do ponto onde o usuário soltou dava falso negativo/positivo.
  const zx = zonePt ? zonePt.x : x, zy = zonePt ? zonePt.y : y;
  state.project.zones.forEach(z=>{
    if(zx>=z.x && zx<=z.x+z.w && zy>=z.y && zy<=z.y+z.h) node.zoneUid = z.uid;
  });
  state.project.nodes.push(node);
  assignSensibleN2kOrder(node);
  maybeAutoInsertN2kPower(deviceId);
  return node;
}

// Atribui um n2kOrder sensato a um node N2K recém-adicionado fora do drop posicional da
// própria vista N2K Backbone (ex: auto-insert do power cable, FIX_HANDLERS) — sem isso, o
// fallback ORD_END em buildN2kBackbone() joga o node pro fim absoluto da lista, inclusive
// depois de um terminador que já tenha ordem explícita (quebra a convenção das 2 pontas).
// Se ninguém no projeto tem ordem ainda, não faz nada — o layout padrão automático
// (terminador/devices/power/devices/terminador) de buildN2kBackbone() cuida disso sozinho.
function assignSensibleN2kOrder(node){
  const dev = getDeviceById(node.deviceId);
  if(!dev) return;
  const hasN2K = (dev.ports||[]).some(p=>p.type==='N2K-Micro'||p.type==='N2K-Mini');
  if(!hasN2K) return;
  const others = state.project.nodes.filter(n=>n!==node && typeof n.n2kOrder==='number');
  if(!others.length) return;
  const lastTerm = others.filter(n=>{const d=getDeviceById(n.deviceId);return d&&/Terminador/i.test(d.model)})
    .sort((a,b)=>b.n2kOrder-a.n2kOrder)[0];
  node.n2kOrder = lastTerm ? lastTerm.n2kOrder-0.5 : Math.max(...others.map(n=>n.n2kOrder))+1;
}

// Se o device recém-adicionado tem porta N2K e é o 1º device N2K do projeto (nenhum outro node
// N2K existia antes dele, e o cabo de alimentação ainda não está no projeto), auto-insere o Cabo
// Alimentação N2K (adp-n2k-power) desconectado, perto do device — poupa a ida manual à aba Adapters.
function maybeAutoInsertN2kPower(justAddedId){
  const dev = getDeviceById(justAddedId);
  if(!dev || dev.id==='adp-n2k-power') return;
  const hasN2K = (dev.ports||[]).some(p=>p.type==='N2K-Micro'||p.type==='N2K-Mini');
  if(!hasN2K) return;
  const n2kNodes = state.project.nodes.filter(n=>{
    const d=getDeviceById(n.deviceId);
    return d && (d.ports||[]).some(p=>p.type==='N2K-Micro'||p.type==='N2K-Mini');
  });
  const alreadyHasPower = n2kNodes.some(n=>n.deviceId==='adp-n2k-power');
  if(n2kNodes.length<=1 && !alreadyHasPower){
    const pwr = ADAPTERS.find(a=>a.id==='adp-n2k-power');
    if(!pwr) return;
    const last = state.project.nodes[state.project.nodes.length-1];
    const pwrNode = {uid:uid(), deviceId:pwr.id, x:(last?last.x:100)+260, y:(last?last.y:100)};
    state.project.nodes.push(pwrNode);
    assignSensibleN2kOrder(pwrNode);
    toast('Cabo Alimentação N2K adicionado automaticamente (1º device N2K do projeto)');
  }
}

const state={
  project:emptyProject(),
  ui:{selectedNode:null,selectedEdge:null,selectedZone:null,
      libraryTab:'devices',libraryFilter:{q:'',category:''},
      pan:{x:0,y:0},zoom:1,
      pendingConnection:null,dragging:null,panning:false,
      mousePos:{x:0,y:0},
      canvasFilter:'all',
      thumbStyle:'silhouette',
      resizing:null,n2kDragging:null,editingFreeId:null,edgeWaypointDragging:null}
};
function emptyProject(){
  return{
    name:'Novo Projeto',client:'',vessel:'',
    date:new Date().toISOString().slice(0,10),
    nodes:[],edges:[],zones:[],freeItems:[],
    notes:'',installer:'Lucas de Araújo Souza',cert:'IN07169',company:'Wonder BOAT | Wonder HUB.AI'
  };
}

/* =================== ENGINE =================== */
function getNetworkComponents(filterFn){
  const adj={};state.project.nodes.forEach(n=>adj[n.uid]=new Set());
  state.project.edges.forEach(e=>{
    if(filterFn(e)&&adj[e.fromNode]&&adj[e.toNode]){adj[e.fromNode].add(e.toNode);adj[e.toNode].add(e.fromNode)}
  });
  const visited=new Set(),comps=[];
  state.project.nodes.forEach(n=>{
    if(visited.has(n.uid))return;
    if(adj[n.uid].size===0)return;
    const c=[],s=[n.uid];
    while(s.length){
      const cur=s.pop();
      if(visited.has(cur))continue;
      visited.add(cur);c.push(cur);
      adj[cur].forEach(x=>s.push(x));
    }
    if(c.length>1) comps.push(c);
  });
  return comps;
}
function edgeIsType(e,group){return PORT_TYPES[e.type]&&PORT_TYPES[e.type].group===group}

function runValidation(){
  const issues=[];
  RULES.forEach(rule=>{
    try{
      const r=rule.check(state.project,{getDeviceById,getNetworkComponents,edgeIsType});
      if(r&&r.length) r.forEach(x=>issues.push({...x,ruleId:rule.id,severity:rule.severity}));
    }catch(e){console.error('Rule failed',rule.id,e)}
  });
  return issues;
}

/* =================== PERSISTENCE =================== */
const LS_KEY='garmin_sb_projects';
function listSaved(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'{}')}catch(e){return{}}}
function saveProject(){
  const all=listSaved();all[state.project.name]=JSON.parse(JSON.stringify(state.project));
  localStorage.setItem(LS_KEY,JSON.stringify(all));
  toast('Projeto salvo: '+state.project.name);
  if(state.ui.libraryTab==='history') renderLibrary();
}
function toast(msg){
  const t=document.createElement('div');
  t.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#3ec78f;color:#000;padding:8px 18px;border-radius:4px;z-index:99999;font-size:12px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.3)';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2500);
}
function loadProject(){
  // Em vez de prompt() (não suportado no preview Cowork), abre o modal de Histórico
  state.ui.libraryTab='history';
  render();
  // scroll a aba pra mostrar
  setTimeout(()=>{document.querySelector('.tabs button[data-tab="history"]')?.scrollIntoView({block:'nearest',inline:'center'})},50);
}
function loadProjectByName(name){
  const all=listSaved();
  if(!all[name]){alert('Projeto não encontrado: '+name);return}
  state.project=JSON.parse(JSON.stringify(all[name]));
  // garante campos novos
  state.project.freeItems=state.project.freeItems||[];
  state.project.zones=state.project.zones||[];
  state.ui.editingFreeId=null;
  resetSelection();render();
}
function deleteProject(name){
  if(!confirm('Excluir projeto "'+name+'"?'))return;
  const all=listSaved();delete all[name];
  localStorage.setItem(LS_KEY,JSON.stringify(all));
  render();
}
function duplicateProject(name){
  const all=listSaved();if(!all[name])return;
  const newName=name+' (cópia)';
  all[newName]=JSON.parse(JSON.stringify(all[name]));
  all[newName].name=newName;
  localStorage.setItem(LS_KEY,JSON.stringify(all));
  render();
}
function exportProjectByName(name){
  const all=listSaved();if(!all[name])return;
  const blob=new Blob([JSON.stringify(all[name],null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name.replace(/[^a-z0-9]/gi,'_')+'.json';a.click();URL.revokeObjectURL(url);
}
function exportJSON(){
  const blob=new Blob([JSON.stringify(state.project,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=(state.project.name||'projeto').replace(/[^a-z0-9]/gi,'_')+'.json';
  a.click();URL.revokeObjectURL(url);
}
function importJSON(){document.getElementById('file-input').click()}
document.getElementById('file-input').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const p=JSON.parse(r.result);
    p.nodes=p.nodes||[];p.edges=p.edges||[];p.zones=p.zones||[];p.freeItems=p.freeItems||[];
    state.project=p;state.ui.editingFreeId=null;resetSelection();render();
  }catch(err){alert('Inválido.')}};
  r.readAsText(f);e.target.value='';
});
function newProject(){
  if(state.project.nodes.length>0 && !confirm('Descartar projeto atual?'))return;
  state.project=emptyProject();state.ui.editingFreeId=null;resetSelection();render();
  // abre wizard automaticamente
  setTimeout(openWizard,100);
}
function resetSelection(){state.ui.selectedNode=null;state.ui.selectedEdge=null;state.ui.selectedZone=null;clearPendingConnection()}
function clearPendingConnection(){
  if(state.ui.pendingConnection){
    state.ui.pendingConnection=null;
    document.getElementById('canvas')?.classList.remove('connecting');
  }
}

/* =================== RENDER =================== */
function render(){renderHeader();renderLibrary();renderCanvas();renderInspector();renderLegend()}

function renderHeader(){
  document.getElementById('project-name').value=state.project.name;
  document.getElementById('project-vessel').value=state.project.vessel||'';
  document.getElementById('project-client').value=state.project.client||'';
  document.getElementById('project-date').value=state.project.date;
}

function renderLegend(){
  const used=new Set();
  state.project.edges.forEach(e=>used.add(e.type));
  // sempre mostra legenda dos principais
  ['BlueNet','GarminMarineNet','N2K-Micro','NMEA0183','J1939','Power-12'].forEach(t=>used.add(t));
  let html='<div style="font-weight:700;color:var(--text-dim);margin-bottom:4px;letter-spacing:.1em;font-size:9px">LEGENDA</div>';
  used.forEach(t=>{
    const p=PORT_TYPES[t];if(!p)return;
    const cls=p.stroke==='dashed'?'lg-swatch dashed':'lg-swatch';
    html+=`<div class="lg-row"><div class="${cls}" style="background:${p.color};color:${p.color}"></div>${p.label}</div>`;
  });
  document.getElementById('canvas-legend').innerHTML=html;
}

/* Thumbnail do device — se d.image (URL ou data-URI) existe, usa <img>;
   senão, fallback pra ícone SVG categórico (estilo pictograma).
   Pra adicionar foto real ao SKU: { ... image: 'assets/photos/gar-xxx.webp' }
   ou direto no data: image: 'data:image/webp;base64,...' */
// Silhuetas categóricas — proporção e detalhes inspirados nos produtos reais
// (sem copiar fotos). Renderizadas em 32x32 viewBox, currentColor = cor família.
// Bezel + tela + detalhes que dão "cara de produto" em vez de pictograma plano.
const CAT_ICONS = {
  // MFD: bezel arredondado, tela escura, botões/touch indicador
  'MFD':         '<rect x="2" y="6" width="28" height="20" rx="2.5" fill="currentColor" opacity="0.15"/><rect x="2" y="6" width="28" height="20" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="4.5" y="8.5" width="23" height="13" rx="0.5" fill="currentColor" opacity="0.35"/><circle cx="6" cy="24" r="0.8" fill="currentColor"/><circle cx="9" cy="24" r="0.8" fill="currentColor"/><circle cx="26" cy="24" r="0.8" fill="currentColor"/>',
  // Radar dome: hemisfério com base, antena interna sugerida
  'Radar':       '<path d="M5 22 C5 13 11 7 16 7 C21 7 27 13 27 22 z" fill="currentColor" opacity="0.18"/><path d="M5 22 C5 13 11 7 16 7 C21 7 27 13 27 22" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="22" width="24" height="3" rx="0.5" fill="currentColor" opacity="0.55"/><path d="M16 9 L23 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/><circle cx="16" cy="22" r="1.2" fill="currentColor"/>',
  // Sonar/black-box: caixa industrial com conectores
  'Sonar':       '<rect x="3" y="9" width="26" height="14" rx="1.5" fill="currentColor" opacity="0.18"/><rect x="3" y="9" width="26" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="6" y="12" width="10" height="3" fill="currentColor" opacity="0.55"/><circle cx="22" cy="14" r="1.5" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="22" cy="19" r="1.5" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="26" cy="14" r="1.5" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="26" cy="19" r="1.5" fill="none" stroke="currentColor" stroke-width="1"/>',
  // Autopilot helm/GHC: mostrador redondo com knob
  'Autopilot':   '<circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.15"/><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="currentColor" opacity="0.3"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/><path d="M16 8 L16 11 M16 21 L16 24 M8 16 L11 16 M21 16 L24 16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  // Trolling motor: corpo vertical com hélice na ponta
  'TrollingMotor':'<rect x="14.5" y="3" width="3" height="14" fill="currentColor" opacity="0.5"/><path d="M11 6 L21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="22" r="6" fill="currentColor" opacity="0.18"/><circle cx="16" cy="22" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M16 17 L11 25 M16 17 L21 25 M11 22 L21 22" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>',
  // VHF rádio: corpo com antena, display, knob
  'VHF':         '<rect x="5" y="11" width="22" height="15" rx="1.5" fill="currentColor" opacity="0.18"/><rect x="5" y="11" width="22" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="7" y="13" width="14" height="6" rx="0.5" fill="currentColor" opacity="0.5"/><circle cx="24" cy="20" r="1.8" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M16 11 L16 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="3.5" r="1" fill="currentColor"/>',
  // AIS: triângulo de embarcação + sinal radial
  'AIS':         '<path d="M6 25 L16 6 L26 25 L16 22 z" fill="currentColor" opacity="0.3"/><path d="M6 25 L16 6 L26 25 L16 22 z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="16" cy="14" r="2" fill="currentColor"/><path d="M9 14 C7 14 7 14 7 18 M23 14 C25 14 25 14 25 18" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5"/>',
  // Instrument display: display redondo com agulha
  'Instrument':  '<circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.15"/><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="16" r="9" fill="currentColor" opacity="0.25"/><path d="M16 16 L22 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><path d="M16 5 L16 7 M27 16 L25 16 M16 27 L16 25 M5 16 L7 16" stroke="currentColor" stroke-width="1"/>',
  // Network switch: caixa horizontal com 4 portas RJ45
  'Network':     '<rect x="2" y="11" width="28" height="11" rx="1.5" fill="currentColor" opacity="0.18"/><rect x="2" y="11" width="28" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="4.5" y="14" width="4" height="5" fill="currentColor" opacity="0.6"/><rect x="10.5" y="14" width="4" height="5" fill="currentColor" opacity="0.6"/><rect x="16.5" y="14" width="4" height="5" fill="currentColor" opacity="0.6"/><rect x="22.5" y="14" width="4" height="5" fill="currentColor" opacity="0.6"/>',
  // Antena GPS: dome arredondado com base
  'Antenna':     '<ellipse cx="16" cy="14" rx="9" ry="7" fill="currentColor" opacity="0.18"/><ellipse cx="16" cy="14" rx="9" ry="7" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="20" width="6" height="3" fill="currentColor" opacity="0.5"/><rect x="14.5" y="23" width="3" height="5" fill="currentColor" opacity="0.7"/><circle cx="16" cy="14" r="2.5" fill="currentColor" opacity="0.4"/>',
  // Câmera marine: corpo cilíndrico com lente frontal
  'Camera':      '<rect x="3" y="9" width="22" height="16" rx="2" fill="currentColor" opacity="0.18"/><rect x="3" y="9" width="22" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="17" r="6" fill="currentColor" opacity="0.4"/><circle cx="14" cy="17" r="6" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="14" cy="17" r="2.5" fill="currentColor"/><rect x="25" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.5"/>',
  // Sensor: ondas concêntricas + ponto central
  'Sensor':      '<circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/><circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><circle cx="16" cy="16" r="6" fill="currentColor" opacity="0.25"/><circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/>',
  // Áudio speaker: cone + woofer
  'Audio':       '<rect x="3" y="6" width="14" height="20" rx="1.5" fill="currentColor" opacity="0.2"/><rect x="3" y="6" width="14" height="20" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="13" r="3" fill="currentColor" opacity="0.45"/><circle cx="10" cy="20" r="2" fill="currentColor" opacity="0.45"/><path d="M21 11 C24 13 24 19 21 21 M24 8 C28 11 28 21 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  // Adapter (Tee/coupler): 2 conectores + linha
  'Adapter':     '<rect x="2" y="12" width="9" height="8" rx="1.2" fill="currentColor" opacity="0.25"/><rect x="2" y="12" width="9" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="21" y="12" width="9" height="8" rx="1.2" fill="currentColor" opacity="0.25"/><rect x="21" y="12" width="9" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 16 L21 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  // Cable: cabo serpenteado + 2 plugs nas pontas
  'Cable':       '<rect x="2" y="14" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.6"/><path d="M6 16 C9 16 11 11 14 11 C17 11 17 21 20 21 C23 21 24 16 26 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><rect x="26" y="14" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.6"/>',
};
// Thumb por SKU. Resolve na ordem: imagem do modo ativo (photo/silhouette
// SKU-específica) → d.image legacy → silhueta categórica SVG. Retorna HTML
// pronto pra embutir no .lib-card .thumb.
function getDeviceThumb(d){
  const mode = (state?.ui?.thumbStyle) || 'silhouette';
  const bank = (window.WB_IMAGES||{})[mode] || {};

  // 1) Foto/silhueta SKU-específica do banco
  const banked = bank[d.id];
  if(banked){
    if(banked.startsWith('<svg')) return banked;          // silhueta SVG inline
    return `<img src="${banked}" alt="${d.model}" loading="lazy"/>`;
  }
  // 2) Campo image legacy no schema do device (URL ou data-URI)
  if(d.image){
    return `<img src="${d.image}" alt="${d.model}" loading="lazy"/>`;
  }
  // 3) Fallback: silhueta categórica (mesma usada antes)
  const icon = CAT_ICONS[d.category] || CAT_ICONS['Sensor'];
  const color = (d.category==='Adapter'||d.category==='Cable') ? '#d4a64a' : '#5b8df6';
  return `<svg viewBox="0 0 32 32" style="color:${color}" xmlns="http://www.w3.org/2000/svg">${icon}</svg>`;
}

function renderLibrary(){
  const tab=state.ui.libraryTab;
  const filters=document.getElementById('filters-panel');
  filters.style.display=tab==='zones'?'none':'flex';
  const list=document.getElementById('library-list');
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));

  if(tab==='zones'){renderZonesPanel(list);return}
  if(tab==='free'){renderFreeItemsPanel(list);return}
  if(tab==='history'){renderHistoryPanel(list);return}

  const items=tab==='devices'?CATALOG:ADAPTERS;
  const f=state.ui.libraryFilter;
  const catSel=document.getElementById('lib-category');
  const cats=[...new Set(items.map(i=>i.category))].sort();
  catSel.innerHTML='<option value="">Todas as categorias</option>'+cats.map(c=>`<option ${f.category===c?'selected':''}>${c}</option>`).join('');
  const filtered=items.filter(i=>{
    if(f.category&&i.category!==f.category)return false;
    if(f.q){
      const q=f.q.toLowerCase();
      if(!(i.model+' '+i.sku+' '+(i.family||'')+' '+(i.description||'')).toLowerCase().includes(q))return false;
    }
    return true;
  });
  list.innerHTML=filtered.map(d=>`
    <div class="lib-card" draggable="true" data-id="${d.id}">
      <div class="thumb">${getDeviceThumb(d)}</div>
      <div class="body">
        <div class="row1">
          <span class="fam">${d.family||d.brand||''}</span>
          <span class="cat">${d.category}</span>
        </div>
        <div class="model">${d.model}</div>
        <div class="sku">${d.sku}</div>
        <div class="desc">${d.description||''}</div>
        ${d._verify?'<span class="verify">VERIFICAR</span>':''}
      </div>
    </div>
  `).join('')||'<div class="empty-state">Nada encontrado.</div>';
  list.querySelectorAll('.lib-card').forEach(card=>{
    card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',card.dataset.id);card.classList.add('dragging')});
    card.addEventListener('dragend',()=>card.classList.remove('dragging'));
  });
}

function renderZonesPanel(list){
  let html='<div class="zone-list">';
  html+='<div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;padding:4px">Zonas agrupam equipamentos por área do barco (helm, mastro, popa, etc.). São renderizadas no diagrama de impressão.</div>';
  state.project.zones.forEach(z=>{
    html+=`<div class="zone-item" data-zone="${z.uid}">
      <div><span style="display:inline-block;width:10px;height:10px;background:${z.color};border-radius:2px;margin-right:6px;vertical-align:middle"></span>${z.name}</div>
      <button class="small danger" data-del-zone="${z.uid}">×</button>
    </div>`;
  });
  html+='<div class="zone-item add-form">';
  html+='<select id="zone-preset" style="width:100%;margin-bottom:6px">';
  DEFAULT_ZONES.forEach(z=>html+=`<option value="${z.name}|${z.color}">${z.name}</option>`);
  html+='<option value="custom">Personalizada...</option></select>';
  html+='<input id="zone-custom-name" placeholder="Nome (se personalizada)" style="width:100%;margin-bottom:6px"/>';
  html+='<button class="primary zone-add-btn" id="btn-add-zone">+ Adicionar Zona</button>';
  html+='</div></div>';
  list.innerHTML=html;
  list.querySelectorAll('[data-del-zone]').forEach(b=>{
    b.addEventListener('click',e=>{
      const z=b.dataset.delZone;
      state.project.zones=state.project.zones.filter(x=>x.uid!==z);
      state.project.nodes.forEach(n=>{if(n.zoneUid===z) delete n.zoneUid});
      render();
    });
  });
  document.getElementById('btn-add-zone').addEventListener('click',()=>{
    const sel=document.getElementById('zone-preset').value;
    let name,color;
    if(sel==='custom'){
      name=document.getElementById('zone-custom-name').value.trim();
      if(!name){toast('Digite o nome da zona personalizada.');return}
      color='#3a3a55';
    }else{
      [name,color]=sel.split('|');
    }
    const z={uid:'z'+Math.random().toString(36).slice(2,9),name,color,x:50,y:50,w:400,h:300};
    state.project.zones.push(z);
    state.ui.selectedZone=z.uid;
    render();
  });
  list.querySelectorAll('.zone-item[data-zone]').forEach(it=>{
    it.addEventListener('click',e=>{
      if(e.target.tagName==='BUTTON')return;
      state.ui.selectedZone=it.dataset.zone;
      state.ui.selectedNode=null;state.ui.selectedEdge=null;
      render();
    });
  });
}


function renderFreeItemsPanel(list){
  const editing = state.ui.editingFreeId && (state.project.freeItems||[]).find(f=>f.id===state.ui.editingFreeId);
  let html='<div class="zone-list">';
  html+='<div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;padding:4px">Itens livres = equipamentos de outras marcas (AIS Icom, antena Shakespeare, motor Volvo, etc.). Escolha as portas e arraste pro canvas.</div>';
  // lista os já criados
  (state.project.freeItems||[]).forEach(fi=>{
    html+=`<div class="zone-item" data-free="${fi.id}">
      <div><span style="display:inline-block;width:10px;height:10px;background:#888;border-radius:2px;margin-right:6px;vertical-align:middle"></span><strong>${fi.model}</strong><br><span style="font-size:10px;color:var(--text-muted)">${(fi.ports||[]).map(p=>(PORT_TYPES[p.type]?.label||p.type)+'×'+(p.qty||1)).join(' · ')||'sem portas'}</span></div>
      <div style="display:flex;gap:4px">
        <button class="small" data-edit-free="${fi.id}">✎</button>
        <button class="small danger" data-del-free="${fi.id}">×</button>
      </div>
    </div>`;
  });
  // formulario — modo criação ou edição (editingFreeId)
  const portTypeOpts = Object.keys(PORT_TYPES).map(t=>`<option value="${t}">${PORT_TYPES[t].label}</option>`).join('');
  const portRow = (type,qty) => `<div class="fi-port-row" style="display:flex;gap:4px;margin-bottom:4px">
        <select class="fi-pt" style="flex:1;font-size:10px">${Object.keys(PORT_TYPES).map(t=>`<option value="${t}" ${t===type?'selected':''}>${PORT_TYPES[t].label}</option>`).join('')}</select>
        <input type="number" class="fi-pq" min="1" value="${qty||1}" style="width:50px;font-size:10px"/>
        <button class="small danger fi-rm">×</button>
      </div>`;
  const initialPortRows = editing && editing.ports && editing.ports.length
    ? editing.ports.map(p=>portRow(p.type,p.qty)).join('')
    : portRow(Object.keys(PORT_TYPES)[0],1);
  html+=`<div class="zone-item add-form">
    ${editing?`<div style="font-size:10px;color:var(--accent);margin-bottom:6px;letter-spacing:.1em;text-transform:uppercase">Editando item livre</div>`:''}
    <input id="fi-model" placeholder="Modelo (ex: Icom IC-M510 EVO)" value="${esc(editing?editing.model:'')}" style="width:100%;margin-bottom:6px"/>
    <input id="fi-brand" placeholder="Marca (ex: ICOM, Volvo Penta)" value="${esc(editing?editing.brand:'')}" style="width:100%;margin-bottom:6px"/>
    <div style="font-size:10px;color:var(--text-muted);margin:4px 0 2px">Portas:</div>
    <div id="fi-ports">${initialPortRows}</div>
    <button class="small" id="fi-add-port" style="margin-bottom:6px">+ porta</button>
    <div style="display:flex;gap:6px">
      <button class="primary zone-add-btn" id="btn-add-free" style="flex:1">${editing?'Salvar alterações':'+ Criar Item Livre'}</button>
      ${editing?`<button class="small" id="btn-cancel-edit-free">Cancelar</button>`:''}
    </div>
  </div></div>`;
  list.innerHTML=html;

  list.querySelectorAll('[data-del-free]').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation();
      const fid=b.dataset.delFree;
      state.project.freeItems=state.project.freeItems.filter(f=>f.id!==fid);
      // remove nodes que usavam esse item
      state.project.edges=state.project.edges.filter(ed=>{
        const fn=state.project.nodes.find(n=>n.uid===ed.fromNode);
        const tn=state.project.nodes.find(n=>n.uid===ed.toNode);
        return (fn?.deviceId!==fid && tn?.deviceId!==fid);
      });
      state.project.nodes=state.project.nodes.filter(n=>n.deviceId!==fid);
      clearPendingConnection();
      if(state.ui.editingFreeId===fid) state.ui.editingFreeId=null;
      render();
    });
  });
  list.querySelectorAll('[data-edit-free]').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation();
      state.ui.editingFreeId=b.dataset.editFree;
      render();
    });
  });
  // drag das cards de free items existentes
  list.querySelectorAll('.zone-item[data-free]').forEach(card=>{
    card.draggable=true;
    card.addEventListener('dragstart',e=>{
      e.dataTransfer.setData('text/plain',card.dataset.free);
    });
    card.style.cursor='grab';
  });
  // form handlers
  const addPortBtn=document.getElementById('fi-add-port');
  if(addPortBtn) addPortBtn.addEventListener('click',()=>{
    const portsDiv=document.getElementById('fi-ports');
    const div=document.createElement('div');
    div.className='fi-port-row';
    div.style.cssText='display:flex;gap:4px;margin-bottom:4px';
    div.innerHTML=`<select class="fi-pt" style="flex:1;font-size:10px">${portTypeOpts}</select><input type="number" class="fi-pq" min="1" value="1" style="width:50px;font-size:10px"/><button class="small danger fi-rm">×</button>`;
    portsDiv.appendChild(div);
    div.querySelector('.fi-rm').addEventListener('click',()=>div.remove());
  });
  list.querySelectorAll('.fi-rm').forEach(b=>b.addEventListener('click',e=>{e.target.closest('.fi-port-row').remove()}));
  const btnCancel=document.getElementById('btn-cancel-edit-free');
  if(btnCancel) btnCancel.addEventListener('click',()=>{state.ui.editingFreeId=null;render()});
  const btnAdd=document.getElementById('btn-add-free');
  if(btnAdd) btnAdd.addEventListener('click',()=>{
    const model=document.getElementById('fi-model').value.trim();
    const brand=document.getElementById('fi-brand').value.trim()||'Outra';
    if(!model){toast('Informe o modelo.');return}
    const ports=[];
    document.querySelectorAll('#fi-ports .fi-port-row').forEach(row=>{
      const pt=row.querySelector('.fi-pt').value;
      const pq=parseInt(row.querySelector('.fi-pq').value)||1;
      ports.push({type:pt,qty:pq});
    });
    if(state.ui.editingFreeId){
      // atualiza in-place — id nunca muda, então nodes/edges que apontam pro deviceId
      // continuam resolvendo o mesmo objeto sem migração
      const fi=state.project.freeItems.find(f=>f.id===state.ui.editingFreeId);
      if(fi){
        // Se a composição de portas mudou (tipo/ordem/qty), o ÍNDICE que edges já
        // conectadas guardam (edge.fromPort/toPort) pode passar a apontar pra uma porta
        // diferente ou deixar de existir — não dá pra migrar automaticamente sem um id
        // estável por porta, então remove essas edges explicitamente e avisa o
        // instalador em vez de deixar a conexão errada/silenciosamente sumida.
        const oldFlat=(fi.ports||[]).flatMap(p=>Array.from({length:p.qty||1},()=>p.type));
        const newFlat=ports.flatMap(p=>Array.from({length:p.qty||1},()=>p.type));
        const portsChanged=oldFlat.length!==newFlat.length||oldFlat.some((t,i)=>t!==newFlat[i]);
        fi.model=model; fi.brand=brand; fi.family=brand; fi.ports=ports;
        let removed=0;
        if(portsChanged){
          const affected=new Set(state.project.nodes.filter(n=>n.deviceId===fi.id).map(n=>n.uid));
          const before=state.project.edges.length;
          state.project.edges=state.project.edges.filter(ed=>!(affected.has(ed.fromNode)||affected.has(ed.toNode)));
          removed=before-state.project.edges.length;
        }
        state.ui.editingFreeId=null;
        toast(removed?`Item Livre atualizado — ${removed} cabo(s) desconectado(s) porque as portas mudaram, reconecte manualmente.`:'Item Livre atualizado.');
      }else{
        // editingFreeId ficou órfão (ex: projeto trocado sem cancelar a edição) — não
        // finge sucesso: preserva o que o instalador digitou criando como item novo
        state.ui.editingFreeId=null;
        const fiNew={
          id:'free:'+Math.random().toString(36).slice(2,9),
          sku:'(item livre)',brand,family:brand,model,
          category:'Item Livre',description:'Item livre adicionado pelo instalador.',
          ports, _verify:false, _free:true
        };
        state.project.freeItems=state.project.freeItems||[];
        state.project.freeItems.push(fiNew);
        toast('Item Livre criado (o item que estava sendo editado não existe mais neste projeto).');
      }
    }else{
      const fi={
        id:'free:'+Math.random().toString(36).slice(2,9),
        sku:'(item livre)',brand,family:brand,model,
        category:'Item Livre',description:'Item livre adicionado pelo instalador.',
        ports, _verify:false, _free:true
      };
      state.project.freeItems=state.project.freeItems||[];
      state.project.freeItems.push(fi);
    }
    render();
  });
}
const NODE_W=220,NODE_HEAD=46,PORT_H=18;

function renderHistoryPanel(list){
  const all=listSaved();
  const names=Object.keys(all).sort();
  let html='<div style="padding:10px 14px;font-size:11px;color:var(--text-dim);border-bottom:1px solid var(--line)">Projetos salvos no navegador (localStorage). Único = por máquina.</div>';
  if(!names.length){
    html+='<div class="empty-state">Nenhum projeto salvo ainda.<br>Clique em <strong>Salvar</strong> no header pra começar.</div>';
  }else{
    names.forEach(name=>{
      const proj=all[name];
      const nNodes=(proj.nodes||[]).length;
      const nEdges=(proj.edges||[]).length;
      const nZones=(proj.zones||[]).length;
      const isCurrent=state.project.name===name;
      html+=`<div style="padding:10px 14px;border-bottom:1px solid var(--line);${isCurrent?'background:var(--bg-3);border-left:3px solid var(--accent)':''}">
        <div style="font-weight:600;font-size:13px;color:var(--text);margin-bottom:3px">${name}${isCurrent?' <span style="font-size:9px;color:var(--accent);letter-spacing:.1em">(ATUAL)</span>':''}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">
          ${proj.vessel?proj.vessel+' · ':''}${proj.client?proj.client+' · ':''}${proj.date||''}
          <br>${nNodes} dispositivos · ${nEdges} cabos · ${nZones} zonas
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="small primary" data-load="${name.replace(/"/g,'&quot;')}">Carregar</button>
          <button class="small" data-dup="${name.replace(/"/g,'&quot;')}">Duplicar</button>
          <button class="small" data-exp="${name.replace(/"/g,'&quot;')}">Exportar</button>
          <button class="small danger" data-del="${name.replace(/"/g,'&quot;')}">Excluir</button>
        </div>
      </div>`;
    });
  }
  list.innerHTML=html;
  list.querySelectorAll('[data-load]').forEach(b=>b.addEventListener('click',()=>loadProjectByName(b.dataset.load)));
  list.querySelectorAll('[data-dup]').forEach(b=>b.addEventListener('click',()=>duplicateProject(b.dataset.dup)));
  list.querySelectorAll('[data-exp]').forEach(b=>b.addEventListener('click',()=>exportProjectByName(b.dataset.exp)));
  list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>deleteProject(b.dataset.del)));
}
function nodeWidth(node){return (node && node.width) || NODE_W}
function nodeHeight(node){
  if(node && node.height) return node.height;
  const dev=getDeviceById(node.deviceId);
  if(!dev)return NODE_HEAD;
  const total=(dev.ports||[]).reduce((s,p)=>s+(p.qty||1),0);
  return NODE_HEAD+Math.max(1,total)*PORT_H+8;
}
function getNodePortPositions(node){
  const dev=getDeviceById(node.deviceId);
  const result=[];if(!dev)return result;
  const ports=[];
  (dev.ports||[]).forEach((p)=>{
    for(let i=0;i<(p.qty||1);i++){
      ports.push({type:p.type,label:`${PORT_TYPES[p.type]?.label||p.type}${(p.qty||1)>1?' '+(i+1):''}`});
    }
  });
  const w=node.width||NODE_W;
  ports.forEach((p,i)=>{
    const side=i%2===0?'left':'right';
    const sIdx=Math.floor(i/2);
    const y=NODE_HEAD+sIdx*PORT_H+PORT_H/2;
    const x=side==='left'?0:w;
    result.push({...p,side,x,y,idx:i});
  });
  return result;
}// Roteamento de edges na vista "Tudo" — desvia automaticamente de blocos de dispositivo no
// caminho e permite ajuste manual (waypoint arrastável, ver bindCanvas()/bindGlobal()).
function segsIntersect(ax1,ay1,ax2,ay2,bx1,by1,bx2,by2){
  const d=(ax2-ax1)*(by2-by1)-(ay2-ay1)*(bx2-bx1);
  if(d===0)return false;
  const t=((bx1-ax1)*(by2-by1)-(by1-ay1)*(bx2-bx1))/d;
  const u=((bx1-ax1)*(ay2-ay1)-(by1-ay1)*(ax2-ax1))/d;
  return t>0&&t<1&&u>0&&u<1;
}
// Testa só cruzamento com as 4 arestas do bbox (não containment dos próprios endpoints) —
// um endpoint pode legitimamente tocar a borda de um vizinho encostado (porta sai bem na
// borda do card, ver getNodePortPositions) sem que a linha de fato atravesse esse vizinho.
function segmentHitsNodeBbox(x1,y1,x2,y2,node,margin){
  margin = margin||10;
  const rx=node.x-margin, ry=node.y-margin;
  const rw=nodeWidth(node)+margin*2, rh=nodeHeight(node)+margin*2;
  const edges=[[rx,ry,rx+rw,ry],[rx+rw,ry,rx+rw,ry+rh],[rx+rw,ry+rh,rx,ry+rh],[rx,ry+rh,rx,ry]];
  return edges.some(([ex1,ey1,ex2,ey2])=>segsIntersect(x1,y1,x2,y2,ex1,ey1,ex2,ey2));
}
function findBlockingNode(x1,y1,x2,y2,excludeUids){
  return state.project.nodes.find(n=>!excludeUids.includes(n.uid)&&segmentHitsNodeBbox(x1,y1,x2,y2,n));
}



/* =================== N2K BACKBONE VIEW ESTRUTURADA =================== */
function buildN2kBackbone(){
  // pega devices N2K do projeto
  const all = state.project.nodes.map(n=>{
    const dev = getDeviceById(n.deviceId);
    if(!dev) return null;
    const hasN2K = (dev.ports||[]).some(p=>p.type==='N2K-Micro'||p.type==='N2K-Mini');
    if(!hasN2K) return null;
    const isTerm = /Terminador/i.test(dev.model);
    const isPower = /Alimenta|Power\s*Tee/i.test(dev.model);
    const isTee = /Tee.*N2K|N2K.*Tee/i.test(dev.model);
    const lenContrib = isTerm||isPower||isTee ? 0 : (dev.n2kLen || (dev.category==='MFD'?4:dev.category==='VHF'?3:dev.category==='AIS'?3:dev.category==='Autopilot'?3:dev.category==='Instrument'?1:dev.category==='Sensor'?1:dev.category==='Antenna'?1:2));
    return {node:n,dev,isTerm,isPower,isTee,len:lenContrib,dropM:n.n2kDrop||0.6};
  }).filter(x=>x);

  // ordem: terminadores no topo/fundo, power no meio, devices no entre.
  // Node sem n2kOrder definido (recém-adicionado) cai no FIM por padrão, não no topo —
  // ||0 empataria com quem já tem n2kOrder:0 e, por Array.sort ser stable, "saltaria" pro topo.
  const ORD_END = 1e9;
  all.sort((a,b)=>(a.node.n2kOrder??ORD_END)-(b.node.n2kOrder??ORD_END));

  // ordem inicial padrão: term(top), devices, power, devices, term(bottom)
  if(!all.some(d=>d.node.n2kOrder!==undefined)){
    const terms = all.filter(d=>d.isTerm);
    const power = all.filter(d=>d.isPower);
    const devs = all.filter(d=>!d.isTerm && !d.isPower);
    const half = Math.ceil(devs.length/2);
    const ordered = [];
    if(terms[0]) ordered.push(terms[0]);
    devs.slice(0,half).forEach(d=>ordered.push(d));
    if(power[0]) ordered.push(power[0]);
    devs.slice(half).forEach(d=>ordered.push(d));
    if(terms[1]) ordered.push(terms[1]);
    return ordered;
  }
  return all;
}

function calcN2kVoltagesPerNode(){
  // Calcula tensão em cada nó do backbone N2K usando fórmula Garmin
  // V_node[i] = 12 - sum(R × L_section × I_section)
  // I_section = somatório dos LENs além daquele ponto
  const ordered = buildN2kBackbone();
  if(!ordered.length) return [];
  const powerIdx = ordered.findIndex(d=>d.isPower);
  // Quando há power tap, calcula em ambas direções a partir dele
  // MVP: assume power injection no centro (ou primeiro power encontrado, ou meio do array)
  const pIdx = powerIdx >= 0 ? powerIdx : Math.floor(ordered.length/2);
  // Tensão de alimentação do power tap — ajustável pelo instalador (12 a 14.5V, ex: carregador/
  // alternador ativo rodando acima do nominal de bateria). Default 12V quando não ajustado.
  const baseV = (ordered[pIdx] && ordered[pIdx].node.n2kPowerV) || 12;
  // Para cada nó, calcula distância acumulada e LEN acumulado a partir do power
  const result = ordered.map((d,i)=>({...d,V:baseV,vDrop:0,distance:0,segLen:0}));
  // Direção UP (i < pIdx)
  let cumLen=0, cumLENPath=0;
  for(let i=pIdx-1; i>=0; i--){
    const segLen = ordered[i].dropM;
    cumLen += segLen;
    // a corrente passando neste segmento = somatório dos LENs além deste ponto (em direção up)
    let lenAcum = 0;
    for(let j=i; j>=0; j--) lenAcum += ordered[j].len;
    const I = lenAcum * 0.05;
    const vSeg = 0.053 * segLen * I * 2; // round trip
    cumLENPath += vSeg;
    result[i].V = baseV - cumLENPath;
    result[i].vDrop = cumLENPath;
    result[i].distance = cumLen;
  }
  // Direção DOWN (i > pIdx)
  cumLen=0; cumLENPath=0;
  for(let i=pIdx+1; i<ordered.length; i++){
    const segLen = ordered[i].dropM;
    cumLen += segLen;
    let lenAcum = 0;
    for(let j=i; j<ordered.length; j++) lenAcum += ordered[j].len;
    const I = lenAcum * 0.05;
    const vSeg = 0.053 * segLen * I * 2;
    cumLENPath += vSeg;
    result[i].V = baseV - cumLENPath;
    result[i].vDrop = cumLENPath;
    result[i].distance = cumLen;
  }
  // Power tap node = tensão de alimentação ajustada
  result[pIdx].V = baseV;
  return result;
}

// Quando o power tap não está num extremo do backbone, o cabo físico se divide em 2 trechos
// que saem em direções opostas a partir do ponto de inserção de energia (Branch A = nós antes
// do power no array ordenado, Branch B = nós depois). Se o power está no extremo (ou não há
// power/backbone tem 1 nó só), não há split — é um único trecho, como sempre foi.
function n2kBranchSplit(nodes){
  const pIdx = nodes.findIndex(d=>d.isPower);
  const hasSplit = pIdx>0 && pIdx<nodes.length-1;
  if(!hasSplit) return {pIdx, hasSplit};
  const branchA = nodes.slice(0,pIdx);
  const branchB = nodes.slice(pIdx+1);
  const stat = arr=>{
    const real = arr.filter(d=>!d.isTerm && !d.isPower);
    return {count:real.length, sumLen:real.reduce((s,d)=>s+d.len,0), minV:Math.min(...arr.map(d=>d.V))};
  };
  const statsA = stat(branchA); statsA.runLen = branchA[0].distance;
  const statsB = stat(branchB); statsB.runLen = branchB[branchB.length-1].distance;
  return {pIdx, hasSplit, branchA, branchB, statsA, statsB};
}

// Versão "print-safe" do backbone N2K estruturado, pra página N2K BACKBONE do PDF A3 Técnico
// (ver renderA3Mode()). Reaproveita o cálculo puro (calcN2kVoltagesPerNode/n2kBranchSplit) mas
// tem sua PRÓPRIA montagem de string SVG — deliberadamente separada de renderN2kBackboneView()
// em vez de fatorada em conjunto: a versão on-screen usa var(--bg)/var(--text)/etc. (herda o
// tema ativo do app), o que vazaria a cor do tema claro/escuro pro papel branco do PDF; aqui as
// cores são fixas (mesmo padrão de buildSchematicSvg) e não há listeners/atributos interativos.
function buildN2kBackboneSvg(width){
  const nodes = calcN2kVoltagesPerNode();
  if(!nodes.length){
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="120"><text x="50%" y="60" text-anchor="middle" fill="#666" font-size="13">Nenhum dispositivo N2K no projeto.</text></svg>`;
  }
  const split = n2kBranchSplit(nodes);
  const hasSplit = split.hasSplit;
  const startX = 80, rowH = 64, leftCol = 280, vCol = 820;
  const topPad = hasSplit ? 58 : 40, botPad = hasSplit ? 58 : 40;
  const lineTop = topPad, lineBottom = nodes.length*rowH + topPad;
  const totalH = lineBottom + botPad;
  const bg='#fff', text='#222', textDim='#666', bg2='#f4f4f4', bg3='#eee', accent='#d4a64a', garminAccent='#1f5dc4';

  let svgInner = `<rect width="${width}" height="${totalH}" fill="${bg}"/>`;
  if(hasSplit){
    const yPower = topPad + split.pIdx*rowH + rowH/2;
    const gap = 20;
    const colA = '#5b8df6', colB = '#d4a64a';
    svgInner += `<line x1="${startX}" y1="${lineTop}" x2="${startX}" y2="${yPower-gap}" stroke="${colA}" stroke-width="3"/>`;
    svgInner += `<line x1="${startX}" y1="${yPower+gap}" x2="${startX}" y2="${lineBottom}" stroke="${colB}" stroke-width="3"/>`;
    const vColorA = split.statsA.minV<10.33?'#ff5b6c':split.statsA.minV<11?'#f0b441':colA;
    const vColorB = split.statsB.minV<10.33?'#ff5b6c':split.statsB.minV<11?'#f0b441':colB;
    svgInner += `<text x="${leftCol+165}" y="18" text-anchor="middle" fill="${colA}" font-size="11" font-weight="700" letter-spacing="0.5">RAMAL A</text>`;
    svgInner += `<text x="${leftCol+165}" y="32" text-anchor="middle" fill="${textDim}" font-size="9">${split.statsA.count} disp. · ΣLEN ${split.statsA.sumLen} · ${split.statsA.runLen.toFixed(1)}m · <tspan fill="${vColorA}" font-weight="700">min ${split.statsA.minV.toFixed(2)}V</tspan></text>`;
    svgInner += `<text x="${leftCol+165}" y="${totalH-22}" text-anchor="middle" fill="${colB}" font-size="11" font-weight="700" letter-spacing="0.5">RAMAL B</text>`;
    svgInner += `<text x="${leftCol+165}" y="${totalH-8}" text-anchor="middle" fill="${textDim}" font-size="9">${split.statsB.count} disp. · ΣLEN ${split.statsB.sumLen} · ${split.statsB.runLen.toFixed(1)}m · <tspan fill="${vColorB}" font-weight="700">min ${split.statsB.minV.toFixed(2)}V</tspan></text>`;
  } else {
    svgInner += `<line x1="${startX}" y1="${lineTop}" x2="${startX}" y2="${lineBottom}" stroke="#888" stroke-width="3"/>`;
  }

  nodes.forEach((d,i)=>{
    const y = topPad + i*rowH + rowH/2;
    svgInner += `<g>`;
    const status = d.isPower?'pwr': d.isTerm?'term':
      d.V<10.33 ? 'err' : d.V<11 ? 'warn' : 'ok';
    const color = status==='err' ? '#ff5b6c' : status==='warn' ? '#f0b441' : status==='pwr' ? '#5fa8ff' : status==='term' ? '#ff5b6c' : '#3ec78f';

    if(d.isTerm){
      svgInner += `<g><circle cx="${startX}" cy="${y}" r="14" fill="#ff5b6c" stroke="#000" stroke-width="1"/>
        <text x="${startX}" y="${y+5}" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">⊥</text>
        <text x="${startX-25}" y="${y+5}" text-anchor="end" fill="${textDim}" font-size="10">Terminador</text></g>`;
    } else if(d.isPower){
      svgInner += `<g><rect x="${startX-12}" y="${y-12}" width="24" height="24" fill="#5fa8ff" stroke="#000" stroke-width="1" rx="3"/>
        <text x="${startX}" y="${y+5}" text-anchor="middle" fill="#000" font-size="11" font-weight="700">⚡</text>
        <text x="${startX-25}" y="${y+5}" text-anchor="end" fill="${textDim}" font-size="10">Alimentação</text></g>`;
    } else {
      svgInner += `<g><circle cx="${startX}" cy="${y}" r="6" fill="#888" stroke="#000" stroke-width="0.5"/>
        <text x="${startX-25}" y="${y+5}" text-anchor="end" fill="${textDim}" font-size="9">Conector T</text></g>`;
    }

    if(!d.isTerm && !d.isPower){
      const lineColor = '#3ec78f';
      svgInner += `<line x1="${startX+8}" y1="${y}" x2="${leftCol+25}" y2="${y}" stroke="${lineColor}" stroke-width="2"/>`;
      const dropLabel = `${d.dropM}m / ${(d.dropM*3.28084).toFixed(1)}ft`;
      svgInner += `<rect x="${startX+30}" y="${y-13}" width="100" height="20" rx="3" fill="${bg2}" stroke="${lineColor}" stroke-width="0.5"/>`;
      svgInner += `<text x="${startX+80}" y="${y+3}" text-anchor="middle" fill="${text}" font-size="10">${dropLabel}</text>`;
      svgInner += `<text x="${startX+150}" y="${y-2}" fill="${textDim}" font-size="9">LEN</text>`;
      svgInner += `<text x="${startX+150}" y="${y+10}" fill="${accent}" font-size="11" font-weight="700">${d.len}</text>`;
      svgInner += `<g>
        <rect x="${leftCol+25}" y="${y-22}" width="280" height="44" rx="3" fill="${bg3}" stroke="${color}" stroke-width="1"/>
        <text x="${leftCol+35}" y="${y-7}" fill="${garminAccent}" font-size="9" font-weight="700" letter-spacing="1">${(d.dev.family||d.dev.brand||'').toUpperCase()}</text>
        <text x="${leftCol+35}" y="${y+8}" fill="${text}" font-size="11" font-weight="700">${d.dev.model}</text>
        <text x="${leftCol+35}" y="${y+19}" fill="${textDim}" font-size="8" font-family="monospace">${d.dev.sku}</text>
      </g>`;
      svgInner += `<rect x="${vCol}" y="${y-13}" width="70" height="26" rx="3" fill="${color}" opacity="0.9"/>`;
      svgInner += `<text x="${vCol+35}" y="${y+5}" text-anchor="middle" fill="#000" font-size="13" font-weight="700">${d.V.toFixed(2)} V</text>`;
      if(status==='warn'||status==='err'){
        svgInner += `<text x="${vCol+85}" y="${y+5}" font-size="14">⚠</text>`;
      }
    } else if(d.isPower){
      svgInner += `<line x1="${startX+8}" y1="${y}" x2="${leftCol+200}" y2="${y}" stroke="#ff5b6c" stroke-width="2"/>`;
      svgInner += `<text x="${startX+150}" y="${y+5}" text-anchor="middle" fill="${text}" font-size="11" font-weight="700">Cabo Alimentação N2K</text>`;
      svgInner += `<rect x="${leftCol+200}" y="${y-15}" width="100" height="30" rx="3" fill="#5fa8ff" opacity="0.9"/>`;
      svgInner += `<text x="${leftCol+250}" y="${y+5}" text-anchor="middle" fill="#000" font-size="13" font-weight="700">${(d.node.n2kPowerV||12).toFixed(1)} VDC</text>`;
    }
    svgInner += `</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH+40}" viewBox="0 0 ${width} ${totalH+40}">${svgInner}</svg>`;
}

function renderN2kBackboneView(){
  const svg = document.getElementById('canvas');
  const content = document.getElementById('canvas-content');
  document.getElementById('canvas-empty').style.display = 'none';
  content.setAttribute('transform','');

  let nodes = calcN2kVoltagesPerNode();
  if(!nodes.length){
    content.innerHTML = `<text x="50%" y="200" text-anchor="middle" fill="var(--text-dim)" font-size="14">
      Nenhum dispositivo N2K no projeto.
      </text>
      <text x="50%" y="225" text-anchor="middle" fill="var(--text-muted)" font-size="11">
      Adicione MFDs, VHF/AIS, instrumentos pra montar o backbone.
      </text>`;
    return;
  }

  // Preview de reordenação em tempo real durante o arrasto (não mexe no state.project
  // até soltar — soltar acontece no mouseup global, ver bindGlobal()).
  const drag = state.ui.n2kDragging;
  if(drag){
    const fromIdx = nodes.findIndex(d=>d.node.uid===drag.uid);
    if(fromIdx>=0){
      const toIdx = Math.max(0, Math.min(nodes.length-1, drag.overIndex));
      if(toIdx!==fromIdx){
        const arr = nodes.slice();
        const [moved] = arr.splice(fromIdx,1);
        arr.splice(toIdx,0,moved);
        nodes = arr;
      }
    }
  }

  const split = n2kBranchSplit(nodes);
  const hasSplit = split.hasSplit;
  const W=document.getElementById('canvas').clientWidth || 1200;
  const startX = 80, rowH = 64, leftCol = 280, dropEnd = 700, vCol = 820;
  // Com split, reserva uma faixa extra no topo/fundo pros rótulos "RAMAL A"/"RAMAL B"
  const topPad = hasSplit ? 58 : 40, botPad = hasSplit ? 58 : 40;
  const lineTop = topPad, lineBottom = nodes.length*rowH + topPad;
  const totalH = lineBottom + botPad;

  let svgInner = `<rect width="${W}" height="${totalH}" fill="var(--bg)"/>`;
  if(hasSplit){
    // Power tap fora do extremo: o trunk físico se divide em 2 trechos que saem em direções
    // opostas a partir do ponto de inserção — desenha como 2 segmentos com uma folga visual
    // no meio (onde fica o ícone do power tap) e cores/rótulos distintos por ramal.
    const yPower = topPad + split.pIdx*rowH + rowH/2;
    const gap = 20;
    const colA = '#5b8df6', colB = '#d4a64a';
    svgInner += `<line x1="${startX}" y1="${lineTop}" x2="${startX}" y2="${yPower-gap}" stroke="${colA}" stroke-width="3"/>`;
    svgInner += `<line x1="${startX}" y1="${yPower+gap}" x2="${startX}" y2="${lineBottom}" stroke="${colB}" stroke-width="3"/>`;
    const vColorA = split.statsA.minV<10.33?'#ff5b6c':split.statsA.minV<11?'#f0b441':colA;
    const vColorB = split.statsB.minV<10.33?'#ff5b6c':split.statsB.minV<11?'#f0b441':colB;
    svgInner += `<text x="${leftCol+165}" y="18" text-anchor="middle" fill="${colA}" font-size="11" font-weight="700" letter-spacing="0.5">RAMAL A</text>`;
    svgInner += `<text x="${leftCol+165}" y="32" text-anchor="middle" fill="var(--text-dim)" font-size="9">${split.statsA.count} disp. · ΣLEN ${split.statsA.sumLen} · ${split.statsA.runLen.toFixed(1)}m · <tspan fill="${vColorA}" font-weight="700">min ${split.statsA.minV.toFixed(2)}V</tspan></text>`;
    svgInner += `<text x="${leftCol+165}" y="${totalH-22}" text-anchor="middle" fill="${colB}" font-size="11" font-weight="700" letter-spacing="0.5">RAMAL B</text>`;
    svgInner += `<text x="${leftCol+165}" y="${totalH-8}" text-anchor="middle" fill="var(--text-dim)" font-size="9">${split.statsB.count} disp. · ΣLEN ${split.statsB.sumLen} · ${split.statsB.runLen.toFixed(1)}m · <tspan fill="${vColorB}" font-weight="700">min ${split.statsB.minV.toFixed(2)}V</tspan></text>`;
  } else {
    // Backbone vertical único (linha cinza grossa à esquerda) — power tap no extremo ou ausente
    svgInner += `<line x1="${startX}" y1="${lineTop}" x2="${startX}" y2="${lineBottom}" stroke="#888" stroke-width="3"/>`;
  }

  nodes.forEach((d,i)=>{
    const y = topPad + i*rowH + rowH/2;
    const isDragging = drag && drag.uid===d.node.uid;
    svgInner += `<g${isDragging?' opacity="0.55"':''}>`;

    // Handle de arrasto — reordena o nó no backbone (reflete a posição física real a bordo)
    svgInner += `<g data-n2k-drag="${d.node.uid}" style="cursor:${isDragging?'grabbing':'grab'}">
      <rect x="2" y="${y-rowH/2+2}" width="26" height="${rowH-4}" fill="transparent"/>
      <text x="15" y="${y+5}" text-anchor="middle" fill="var(--text-dim)" font-size="15" style="user-select:none">⠿</text>
    </g>`;

    const status = d.isPower?'pwr': d.isTerm?'term':
      d.V<10.33 ? 'err' : d.V<11 ? 'warn' : 'ok';
    const color = status==='err' ? '#ff5b6c' : status==='warn' ? '#f0b441' : status==='pwr' ? '#5fa8ff' : status==='term' ? '#ff5b6c' : '#3ec78f';

    // Connected/Tee badge
    if(d.isTerm){
      svgInner += `<g><circle cx="${startX}" cy="${y}" r="14" fill="#ff5b6c" stroke="#000" stroke-width="1"/>
        <text x="${startX}" y="${y+5}" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">⊥</text>
        <text x="${startX-25}" y="${y+5}" text-anchor="end" fill="var(--text-dim)" font-size="10">Terminador</text></g>`;
    } else if(d.isPower){
      svgInner += `<g><rect x="${startX-12}" y="${y-12}" width="24" height="24" fill="#5fa8ff" stroke="#000" stroke-width="1" rx="3"/>
        <text x="${startX}" y="${y+5}" text-anchor="middle" fill="#000" font-size="11" font-weight="700">⚡</text>
        <text x="${startX-25}" y="${y+5}" text-anchor="end" fill="var(--text-dim)" font-size="10">Alimentação</text></g>`;
    } else {
      // T-Joiner
      svgInner += `<g><circle cx="${startX}" cy="${y}" r="6" fill="#888" stroke="#000" stroke-width="0.5"/>
        <text x="${startX-25}" y="${y+5}" text-anchor="end" fill="var(--text-dim)" font-size="9">Conector T</text></g>`;
    }

    if(!d.isTerm && !d.isPower){
      // Drop horizontal
      const lineColor = '#3ec78f';
      svgInner += `<line x1="${startX+8}" y1="${y}" x2="${leftCol+25}" y2="${y}" stroke="${lineColor}" stroke-width="2"/>`;
      // Label do drop
      const dropLabel = `${d.dropM}m / ${(d.dropM*3.28084).toFixed(1)}ft`;
      svgInner += `<rect x="${startX+30}" y="${y-13}" width="100" height="20" rx="3" fill="var(--bg-2)" stroke="${lineColor}" stroke-width="0.5" class="drop-label" data-edit-drop="${d.node.uid}" style="cursor:pointer"/>`;
      svgInner += `<text x="${startX+80}" y="${y+3}" text-anchor="middle" fill="var(--text)" font-size="10" pointer-events="none">${dropLabel}</text>`;
      // LEN
      svgInner += `<text x="${startX+150}" y="${y-2}" fill="var(--text-dim)" font-size="9">LEN</text>`;
      svgInner += `<text x="${startX+150}" y="${y+10}" fill="var(--accent)" font-size="11" font-weight="700">${d.len}</text>`;
      // Device card
      svgInner += `<g class="n2k-device" data-node="${d.node.uid}" style="cursor:pointer">
        <rect x="${leftCol+25}" y="${y-22}" width="280" height="44" rx="3" fill="var(--bg-3)" stroke="${color}" stroke-width="${state.ui.selectedNode===d.node.uid?2:1}"/>
        <text x="${leftCol+35}" y="${y-7}" fill="var(--garmin-accent)" font-size="9" font-weight="700" letter-spacing="1">${(d.dev.family||d.dev.brand||'').toUpperCase()}</text>
        <text x="${leftCol+35}" y="${y+8}" fill="var(--text)" font-size="11" font-weight="700">${d.dev.model}</text>
        <text x="${leftCol+35}" y="${y+19}" fill="var(--text-dim)" font-size="8" font-family="monospace">${d.dev.sku}</text>
      </g>`;
      // Voltage badge
      svgInner += `<rect x="${vCol}" y="${y-13}" width="70" height="26" rx="3" fill="${color}" opacity="0.9"/>`;
      svgInner += `<text x="${vCol+35}" y="${y+5}" text-anchor="middle" fill="#000" font-size="13" font-weight="700">${d.V.toFixed(2)} V</text>`;
      // Warning icon if status not ok
      if(status==='warn'||status==='err'){
        svgInner += `<text x="${vCol+85}" y="${y+5}" font-size="14">⚠</text>`;
      }
    } else if(d.isPower){
      // Power cable representation — clique na badge ajusta a tensão de alimentação (12-14.5V)
      svgInner += `<line x1="${startX+8}" y1="${y}" x2="${leftCol+200}" y2="${y}" stroke="#ff5b6c" stroke-width="2"/>`;
      svgInner += `<text x="${startX+150}" y="${y+5}" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Cabo Alimentação N2K</text>`;
      svgInner += `<rect x="${leftCol+200}" y="${y-15}" width="100" height="30" rx="3" fill="#5fa8ff" opacity="0.9" data-edit-power-v="${d.node.uid}" style="cursor:pointer"/>`;
      svgInner += `<text x="${leftCol+250}" y="${y+5}" text-anchor="middle" fill="#000" font-size="13" font-weight="700" pointer-events="none">${(d.node.n2kPowerV||12).toFixed(1)} VDC</text>`;
    } else if(d.isTerm){
      // termination only — already rendered the terminator badge
    }
    svgInner += `</g>`;
  });

  // SVG size
  document.getElementById('canvas').setAttribute('viewBox',`0 0 ${W} ${totalH+40}`);
  content.innerHTML = svgInner;

  // Bind: click no drop label edita o comprimento
  content.querySelectorAll('[data-edit-drop]').forEach(el=>{
    el.addEventListener('click',e=>{
      const uid = el.dataset.editDrop;
      const node = state.project.nodes.find(n=>n.uid===uid);
      if(!node) return;
      const cur = node.n2kDrop || 0.6;
      // simples: prompt-like usando inline modal (já que o real prompt() não funciona)
      _openInlineEditor(uid, cur);
    });
  });
  // Bind: click na badge do power tap ajusta a tensão de alimentação (12-14.5V)
  content.querySelectorAll('[data-edit-power-v]').forEach(el=>{
    el.addEventListener('click',()=>{
      const uid = el.dataset.editPowerV;
      const node = state.project.nodes.find(n=>n.uid===uid);
      if(!node) return;
      _openPowerVEditor(uid, node.n2kPowerV || 12);
    });
  });
  // Bind: click no device seleciona
  content.querySelectorAll('.n2k-device').forEach(el=>{
    el.addEventListener('click',()=>{
      state.ui.selectedNode = el.dataset.node;
      state.ui.selectedEdge = null;
      state.ui.selectedZone = null;
      render();
    });
  });
  // Bind: mousedown no handle ⠿ inicia o arrasto pra reordenar o nó no backbone
  // (posição física real a bordo) — mousemove/mouseup globais em bindGlobal() cuidam do resto.
  content.querySelectorAll('[data-n2k-drag]').forEach(el=>{
    el.addEventListener('mousedown',e=>{
      e.stopPropagation();
      e.preventDefault();
      const uid = el.dataset.n2kDrag;
      const idx = nodes.findIndex(d=>d.node.uid===uid);
      if(idx<0) return;
      state.ui.n2kDragging = {uid, overIndex:idx, count:nodes.length};
    });
  });
}

function _openInlineEditor(uid, current){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9500;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:var(--bg-2);border:1px solid var(--line);border-radius:6px;padding:18px 24px;width:320px;box-shadow:0 8px 32px var(--shadow)">
    <h3 style="margin:0 0 10px;color:var(--accent);font-size:11px;letter-spacing:.18em;text-transform:uppercase">Comprimento do Drop N2K</h3>
    <p style="font-size:11px;color:var(--text-dim);margin:0 0 12px">Limite oficial NMEA 2000: drop ≤ 6m. Padrão: 0.6m.</p>
    <input id="_drop_inp" type="number" min="0.1" max="6" step="0.1" value="${current}" style="width:100%;font-size:14px;padding:8px"/>
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
      <button id="_drop_cancel">Cancelar</button>
      <button class="primary" id="_drop_save">Salvar</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  const inp = document.getElementById('_drop_inp');
  inp.focus();inp.select();
  document.getElementById('_drop_cancel').addEventListener('click',()=>overlay.remove());
  document.getElementById('_drop_save').addEventListener('click',()=>{
    const v = parseFloat(inp.value);
    if(v>0 && v<=6){
      const n = state.project.nodes.find(x=>x.uid===uid);
      if(n){ n.n2kDrop = v; }
      overlay.remove();
      render();
    }else{toast('Drop deve ser 0.1 a 6m')}
  });
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter') document.getElementById('_drop_save').click();
    if(e.key==='Escape') overlay.remove();
  });
}

function _openPowerVEditor(uid, current){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9500;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:var(--bg-2);border:1px solid var(--line);border-radius:6px;padding:18px 24px;width:320px;box-shadow:0 8px 32px var(--shadow)">
    <h3 style="margin:0 0 10px;color:var(--accent);font-size:11px;letter-spacing:.18em;text-transform:uppercase">Tensão de Alimentação N2K</h3>
    <p style="font-size:11px;color:var(--text-dim);margin:0 0 12px">Ajuste pra refletir o estado real da bateria/carregador (12 a 14.5V). Padrão: 12V (pior caso, bateria descarregada).</p>
    <input id="_pv_inp" type="number" min="12" max="14.5" step="0.1" value="${current}" style="width:100%;font-size:14px;padding:8px"/>
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
      <button id="_pv_cancel">Cancelar</button>
      <button class="primary" id="_pv_save">Salvar</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  const inp = document.getElementById('_pv_inp');
  inp.focus();inp.select();
  document.getElementById('_pv_cancel').addEventListener('click',()=>overlay.remove());
  document.getElementById('_pv_save').addEventListener('click',()=>{
    const v = parseFloat(inp.value);
    if(v>=12 && v<=14.5){
      const n = state.project.nodes.find(x=>x.uid===uid);
      if(n){ n.n2kPowerV = v; }
      overlay.remove();
      render();
    }else{toast('Tensão deve ser 12 a 14.5V')}
  });
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter') document.getElementById('_pv_save').click();
    if(e.key==='Escape') overlay.remove();
  });
}

function _openInlineCableEditor(edgeUid, current){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9500;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:var(--bg-2);border:1px solid var(--line);border-radius:6px;padding:18px 24px;width:320px;box-shadow:0 8px 32px var(--shadow)">
    <h3 style="margin:0 0 10px;color:var(--accent);font-size:11px;letter-spacing:.18em;text-transform:uppercase">Comprimento do Cabo Ethernet</h3>
    <p style="font-size:11px;color:var(--text-dim);margin:0 0 12px">Comprimento em metros do cabo BlueNet/Marine Network.</p>
    <input id="_cab_inp" type="number" min="0.1" step="0.1" value="${current}" style="width:100%;font-size:14px;padding:8px"/>
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
      <button id="_cab_cancel">Cancelar</button>
      <button class="primary" id="_cab_save">Salvar</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  const inp = document.getElementById('_cab_inp');
  inp.focus();inp.select();
  document.getElementById('_cab_cancel').addEventListener('click',()=>overlay.remove());
  document.getElementById('_cab_save').addEventListener('click',()=>{
    const v = parseFloat(inp.value);
    if(v>0){
      const e = state.project.edges.find(x=>x.uid===edgeUid);
      if(e){ e.length = v; }
      overlay.remove();
      render();
    }else{toast('Comprimento deve ser maior que 0')}
  });
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter') document.getElementById('_cab_save').click();
    if(e.key==='Escape') overlay.remove();
  });
}

/* =================== ETHERNET VIEW ESTRUTURADA ===================
   Vista hub-and-spoke: identifica switch(es) central(is), distribui devices
   Ethernet ao redor com cabos rotulados (PN + comprimento). Inclui cabling
   list lateral. Análoga à renderN2kBackboneView mas sem voltage drop / LEN.
*/
function buildEthernetTopology(){
  // Devices Ethernet do projeto (BlueNet / GarminMarineNet / PoE)
  const ethDevs = state.project.nodes.map(n=>{
    const dev = getDeviceById(n.deviceId);
    if(!dev) return null;
    const ports = dev.ports||[];
    const hasBluenet = ports.some(p=>p.type==='BlueNet');
    const hasMarineNet = ports.some(p=>p.type==='GarminMarineNet');
    const hasPoE = ports.some(p=>p.type==='PoE');
    if(!hasBluenet && !hasMarineNet && !hasPoE) return null;
    return {node:n, dev, hasBluenet, hasMarineNet, hasPoE};
  }).filter(x=>x);

  // Identifica switches (devices cuja função primária é distribuir Ethernet).
  // Heurística: nome contém "Switch", "Hub", "Expander", "Gateway".
  const isSwitch = d=>/Switch|Hub|Expander|Gateway/i.test(d.dev.model);
  const switches = ethDevs.filter(isSwitch);
  const endpoints = ethDevs.filter(d=>!isSwitch(d));

  // Mapeia cada endpoint pro switch a que está de fato cabeado (edge Ethernet real do
  // projeto) — usado pra desenhar o endpoint sob o switch correto quando há 2+ switches.
  const switchUids = new Set(switches.map(s=>s.node.uid));
  const switchOf = {};
  state.project.edges.forEach(e=>{
    if(!['BlueNet','GarminMarineNet'].includes(e.type)) return;
    if(switchUids.has(e.fromNode) && !switchUids.has(e.toNode)) switchOf[e.toNode]=e.fromNode;
    else if(switchUids.has(e.toNode) && !switchUids.has(e.fromNode)) switchOf[e.fromNode]=e.toNode;
  });

  return {ethDevs, switches, endpoints, switchOf};
}

function renderEthernetView(){
  const svg = document.getElementById('canvas');
  const content = document.getElementById('canvas-content');
  const empty = document.getElementById('canvas-empty');
  if(empty) empty.style.display = 'none';
  content.setAttribute('transform','');

  const {ethDevs, switches, endpoints, switchOf} = buildEthernetTopology();

  if(!ethDevs.length){
    svg.removeAttribute('viewBox');
    content.innerHTML = `<text x="50%" y="180" text-anchor="middle" fill="var(--text-dim)" font-size="14">
      Nenhum dispositivo Ethernet no projeto.
      </text>
      <text x="50%" y="205" text-anchor="middle" fill="var(--text-muted)" font-size="11">
      Adicione MFDs, radares, switches Garmin Network ou BlueNet.
      </text>`;
    return;
  }

  const W = svg.clientWidth || 1400;
  const padX = 40, padY = 40;
  const listColW = 240;          // Cabling list à esquerda
  const hubX = padX + listColW + 80;
  const hubW = 200;
  const endpointX = hubX + hubW + 220;
  const endpointW = 240;
  const endpointH = 50;
  const endpointGap = 16;

  // Layout: empilha switches verticalmente; pra cada switch, distribui endpoints
  // que se conectam a ele. MVP: distribuição equilibrada — cada endpoint
  // associado ao primeiro switch (ou direto se não houver switch).
  // Caso 0 switches: endpoints viram nodes diretos sem hub central.
  // Caso 1+ switches: cada switch é um hub.

  // Mapeia endpoint→switch (MVP: todos no primeiro switch ou primeiro MFD)
  let hubs = switches.length ? switches : endpoints.slice(0,1);
  let leaves = switches.length ? endpoints : endpoints.slice(1);
  // Remove o hub-substituto da lista de leaves (caso fallback)
  if(!switches.length && hubs.length){
    leaves = endpoints.filter(e=>e.node.uid!==hubs[0].node.uid);
  }

  let svgInner = '';
  const colorOf = d => d.hasBluenet ? '#5fb1f7' : '#3ec78f'; // BlueNet azul claro / Marine Net verde
  const truncModel = (m,max) => m && m.length>max ? m.substring(0,max-1)+'…' : (m||'');

  // Lista os cabos Ethernet do projeto (edges ou adapters do tipo) — calculado antes do totalH
  // pra a altura do painel Cabling List entrar na conta (evita transbordo, ver item 6b-4).
  const ethEdges = state.project.edges.filter(e=>['BlueNet','GarminMarineNet'].includes(e.type));

  // Calcula altura total — cada endpoint vai sob o switch a que está de fato cabeado
  // (switchOf); endpoints ainda sem cabo definido caem no 1º switch como fallback visível.
  let cursorY = padY + 30;
  const hubLayouts = hubs.map(hub=>{
    const hubLeaves = switches.length
      ? leaves.filter(l => (switchOf[l.node.uid] || hubs[0].node.uid) === hub.node.uid)
      : (hub === hubs[0] ? leaves : []);
    const groupH = Math.max(120, hubLeaves.length * (endpointH+endpointGap) + 30);
    const layout = {hub, leaves: hubLeaves, y: cursorY, h: groupH};
    cursorY += groupH + 30;
    return layout;
  });
  const listContentH = 46 + ethEdges.length*36 + 14;
  const totalH = Math.max(cursorY + padY, listContentH + padY*2, 400);

  // Background grid sutil
  svgInner += `<rect width="${W}" height="${totalH}" fill="var(--bg)"/>`;

  // ─── CABLING LIST (coluna esquerda) ───
  svgInner += `<g class="cabling-list">`;
  svgInner += `<rect x="${padX}" y="${padY}" width="${listColW}" height="${totalH-padY*2}" rx="4" fill="var(--bg-2)" stroke="var(--line)" stroke-width="1"/>`;
  svgInner += `<text x="${padX+12}" y="${padY+22}" fill="var(--accent)" font-size="10" font-weight="700" letter-spacing="2">CABLING LIST</text>`;
  let listY = padY + 46;
  if(!ethEdges.length){
    svgInner += `<text x="${padX+12}" y="${listY}" fill="var(--text-muted)" font-size="10">Nenhum cabo Ethernet conectado.</text>`;
    svgInner += `<text x="${padX+12}" y="${listY+15}" fill="var(--text-muted)" font-size="9">Conecte os devices via portas BlueNet ou Marine Network.</text>`;
  } else {
    ethEdges.forEach((e,i)=>{
      const fn = state.project.nodes.find(n=>n.uid===e.fromNode);
      const tn = state.project.nodes.find(n=>n.uid===e.toNode);
      const fd = fn ? getDeviceById(fn.deviceId) : null;
      const td = tn ? getDeviceById(tn.deviceId) : null;
      const lab = `${fd?.model||'?'} ↔ ${td?.model||'?'}`;
      const lenLab = e.length ? `${e.length}m / ${(e.length*3.28084).toFixed(1)}ft` : '— sem L';
      const c = e.type==='BlueNet' ? '#5fb1f7' : '#3ec78f';
      svgInner += `<rect x="${padX+8}" y="${listY-12}" width="4" height="24" fill="${c}"/>`;
      svgInner += `<text x="${padX+18}" y="${listY-2}" fill="var(--text)" font-size="10" font-weight="600">${(lab.length>30?lab.substring(0,29)+'…':lab)}</text>`;
      svgInner += `<text x="${padX+18}" y="${listY+10}" fill="var(--text-dim)" font-size="9" font-family="monospace">${e.type} · ${lenLab}</text>`;
      listY += 36;
    });
  }
  svgInner += `</g>`;

  // ─── HUBS + ENDPOINTS ───
  hubLayouts.forEach((layout, idx)=>{
    const {hub, leaves: hubLeaves, y, h: groupH} = layout;
    const hubY = y + groupH/2 - 30;

    // Hub box (centro)
    const hubColor = colorOf(hub);
    svgInner += `<g class="eth-hub" data-node="${hub.node.uid}" style="cursor:pointer">
      <rect x="${hubX}" y="${hubY}" width="${hubW}" height="60" rx="4" fill="var(--bg-3)" stroke="${hubColor}" stroke-width="${state.ui.selectedNode===hub.node.uid?2.5:1.5}"/>
      <text x="${hubX+hubW/2}" y="${hubY+15}" text-anchor="middle" fill="${hubColor}" font-size="9" font-weight="700" letter-spacing="1">${(hub.dev.family||'').toUpperCase()}</text>
      <text x="${hubX+hubW/2}" y="${hubY+33}" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">${truncModel(hub.dev.model,22)}</text>
      <text x="${hubX+hubW/2}" y="${hubY+48}" text-anchor="middle" fill="var(--text-dim)" font-size="9" font-family="monospace">${hub.dev.sku}</text>
    </g>`;

    // Endpoints à direita do hub, conectados por curvas Bézier
    hubLeaves.forEach((leaf,i)=>{
      const eY = y + 12 + i*(endpointH+endpointGap);
      const leafColor = colorOf(leaf);
      // Encontra cabo entre hub e leaf (se existir) pra puxar PN/length
      const cable = state.project.edges.find(e=>
        ['BlueNet','GarminMarineNet'].includes(e.type) &&
        ((e.fromNode===hub.node.uid && e.toNode===leaf.node.uid) ||
         (e.fromNode===leaf.node.uid && e.toNode===hub.node.uid))
      );
      const lenLab = cable?.length ? `${cable.length}m` : '?';
      const cableType = cable?.type || (leaf.hasBluenet && hub.hasBluenet ? 'BlueNet' : 'GarminMarineNet');
      const cColor = cableType==='BlueNet' ? '#5fb1f7' : '#3ec78f';
      // Curva Bézier hub → leaf
      const x1 = hubX + hubW;
      const y1 = hubY + 30;
      const x2 = endpointX;
      const y2 = eY + endpointH/2;
      const stretch = Math.abs(x2-x1)*0.45;
      svgInner += `<path d="M${x1},${y1} C${x1+stretch},${y1} ${x2-stretch},${y2} ${x2},${y2}" stroke="${cColor}" stroke-width="2" fill="none"/>`;
      // Label do cabo no meio — clicável (quando existe edge real) pra editar o comprimento
      const labX = (x1+x2)/2;
      const labY = (y1+y2)/2 - 8;
      const labW = lenLab.length*6 + 16;
      svgInner += `<rect x="${labX-labW/2}" y="${labY-9}" width="${labW}" height="14" rx="3" fill="var(--bg-2)" stroke="${cColor}" stroke-width="0.5"${cable?` data-edit-cable="${cable.uid}" style="cursor:pointer"`:''}/>`;
      svgInner += `<text x="${labX}" y="${labY+2}" text-anchor="middle" fill="var(--text)" font-size="10" pointer-events="none">${lenLab}</text>`;
      // Endpoint card
      svgInner += `<g class="eth-endpoint" data-node="${leaf.node.uid}" style="cursor:pointer">
        <rect x="${endpointX}" y="${eY}" width="${endpointW}" height="${endpointH}" rx="3" fill="var(--bg-3)" stroke="${leafColor}" stroke-width="${state.ui.selectedNode===leaf.node.uid?2.5:1}"/>
        <text x="${endpointX+10}" y="${eY+15}" fill="${leafColor}" font-size="9" font-weight="700" letter-spacing="1">${(leaf.dev.family||'').toUpperCase()}</text>
        <text x="${endpointX+10}" y="${eY+30}" fill="var(--text)" font-size="11" font-weight="700">${truncModel(leaf.dev.model,26)}</text>
        <text x="${endpointX+10}" y="${eY+43}" fill="var(--text-dim)" font-size="8" font-family="monospace">${leaf.dev.sku}</text>
      </g>`;
    });
  });

  // ─── UPLINK SWITCH-A-SWITCH ───
  // Cabo entre 2 switches (ex: 2 hubs Garmin Network interligados) não é hub→leaf — nenhum dos
  // dois lados é "endpoint" — desenha como uma linha vertical tracejada entre os 2 hub boxes.
  const switchNodeUids = new Set(switches.map(s=>s.node.uid));
  const uplinkEdges = state.project.edges.filter(e=>
    ['BlueNet','GarminMarineNet'].includes(e.type) &&
    switchNodeUids.has(e.fromNode) && switchNodeUids.has(e.toNode) && e.fromNode!==e.toNode
  );
  uplinkEdges.forEach(e=>{
    const layoutA = hubLayouts.find(l=>l.hub.node.uid===e.fromNode);
    const layoutB = hubLayouts.find(l=>l.hub.node.uid===e.toNode);
    if(!layoutA||!layoutB) return;
    const yA = layoutA.y + layoutA.h/2;
    const yB = layoutB.y + layoutB.h/2;
    const x = hubX + hubW/2;
    const lenLab = e.length ? `${e.length}m` : '?';
    svgInner += `<path d="M${x},${yA} L${x},${yB}" stroke="#999" stroke-width="2" stroke-dasharray="5,3" fill="none"/>`;
    svgInner += `<rect x="${x-24}" y="${(yA+yB)/2-9}" width="48" height="14" rx="3" fill="var(--bg-2)" stroke="#999" stroke-width="0.5" data-edit-cable="${e.uid}" style="cursor:pointer"/>`;
    svgInner += `<text x="${x}" y="${(yA+yB)/2+2}" text-anchor="middle" fill="var(--text)" font-size="10" pointer-events="none">${lenLab}</text>`;
  });

  // ─── LEGENDA E POWER USE ───
  const legendX = endpointX + endpointW + 40;
  svgInner += `<g class="eth-legend">
    <rect x="${legendX}" y="${padY}" width="200" height="120" rx="4" fill="var(--bg-2)" stroke="var(--line)"/>
    <text x="${legendX+12}" y="${padY+20}" fill="var(--accent)" font-size="10" font-weight="700" letter-spacing="2">REDES ETHERNET</text>
    <line x1="${legendX+12}" y1="${padY+38}" x2="${legendX+32}" y2="${padY+38}" stroke="#5fb1f7" stroke-width="3"/>
    <text x="${legendX+38}" y="${padY+42}" fill="var(--text)" font-size="11">BlueNet (nova)</text>
    <line x1="${legendX+12}" y1="${padY+58}" x2="${legendX+32}" y2="${padY+58}" stroke="#3ec78f" stroke-width="3"/>
    <text x="${legendX+38}" y="${padY+62}" fill="var(--text)" font-size="11">Marine Network</text>
    <text x="${legendX+12}" y="${padY+88}" fill="var(--text-dim)" font-size="9">Switches / Hubs centrais</text>
    <text x="${legendX+12}" y="${padY+102}" fill="var(--text-dim)" font-size="9">→ devices ao redor</text>
  </g>`;

  // Power Use box embaixo da legenda
  const totalW = ethDevs.reduce((s,d)=>s+(d.dev.power?.watts||0),0);
  svgInner += `<g class="eth-power">
    <rect x="${legendX}" y="${padY+140}" width="200" height="80" rx="4" fill="var(--bg-2)" stroke="var(--line)"/>
    <text x="${legendX+12}" y="${padY+160}" fill="var(--accent)" font-size="10" font-weight="700" letter-spacing="2">POWER USE (ETH)</text>
    <text x="${legendX+12}" y="${padY+184}" fill="var(--text)" font-size="14" font-weight="700">${totalW.toFixed(0)} W</text>
    <text x="${legendX+12}" y="${padY+200}" fill="var(--text-dim)" font-size="9">${ethDevs.length} devices Ethernet</text>
    <text x="${legendX+12}" y="${padY+212}" fill="var(--text-dim)" font-size="9">${(totalW/12).toFixed(1)} A @ 12 VDC</text>
  </g>`;

  // Ajusta viewBox e injeta
  const viewW = legendX + 240;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${totalH}`);
  content.innerHTML = svgInner;

  // Bind: click em hub/endpoint seleciona o nó (refresh inspector)
  content.querySelectorAll('[data-node]').forEach(el=>{
    el.addEventListener('click',()=>{
      state.ui.selectedNode = el.dataset.node;
      state.ui.selectedEdge = null;
      state.ui.selectedZone = null;
      render();
    });
  });
  // Bind: click no label de comprimento do cabo edita e.length (mesmo padrão do drop N2K)
  content.querySelectorAll('[data-edit-cable]').forEach(el=>{
    el.addEventListener('click',()=>{
      const edgeUid = el.dataset.editCable;
      const edge = state.project.edges.find(x=>x.uid===edgeUid);
      if(!edge) return;
      _openInlineCableEditor(edgeUid, edge.length||0);
    });
  });
}

/* =================== FILTRO DE RELEVÂNCIA POR VIEW ===================
   Define se um device participa de determinada view. Usado pra dim/hide
   nós irrelevantes em cada vista (Ethernet/Energia/N2K).
   - 'all'      → sempre relevante
   - 'ethernet' → tem porta BlueNet ou GarminMarineNet
   - 'n2k'      → tem porta N2K (mas N2K usa vista estruturada separada)
   - 'power'    → consome energia (watts > 0) ou é fonte/cabo de alimentação
*/
function nodeMatchesFilter(dev, filter){
  if(!dev || filter==='all') return true;
  const ports = dev.ports||[];
  if(filter==='ethernet'){
    return ports.some(p=>p.type==='BlueNet' || p.type==='GarminMarineNet' || p.type==='PoE');
  }
  if(filter==='n2k'){
    return ports.some(p=>p.type==='N2K-Micro' || p.type==='N2K-Mini');
  }
  // filter==='power': inalcançável — renderCanvas() retorna cedo pra renderPowerTableView()
  // antes de chegar aqui (a vista Energia virou tabela, não canvas SVG com dim/hide)
  return true;
}
// Devices "puro N2K" (Tee/Terminador/cabo de alimentação N2K) não fazem
// sentido fora da vista N2K — escondemos completamente em vez de dim.
function isN2kInfraOnly(dev){
  if(!dev) return false;
  return /Tee.*N2K|N2K.*Tee|Terminador|Cabo Alimenta/i.test(dev.model||'');
}

/* =================== VISTA ENERGIA — TABELA DE CONSUMO + DIMENSIONAMENTO ===================
   Lista cada device com consumo próprio (A/V/W) e sugere a bitola de cabo (AWG) do circuito
   de alimentação, baseada no comprimento do cabo Power-12/24 já cadastrado no projeto e numa
   queda de tensão alvo de 3% (ABYC E-11, circuito crítico — ver nota de confiança na tabela
   AWG_TABLE em data.js). Substitui o canvas SVG por uma tabela HTML enquanto essa vista
   estiver ativa (ver toggle de display em renderCanvas()).
*/
function renderPowerTableView(){
  const wrap=document.getElementById('canvas-table-view');
  const rows=computePowerRows();
  const power=computePowerUse();
  const activeRows=rows.filter(r=>r.amps>0);
  const missingLen=activeRows.filter(r=>!r.hasLen).length;
  let html=`<div class="summary-bar">
    <div class="summary-item"><div class="label">12V Battery</div><div class="value">${power.batt12W.toFixed(0)} W · ${power.batt12A.toFixed(1)} A</div></div>
    <div class="summary-item"><div class="label">12V Max (1.3×)</div><div class="value">${power.max12W.toFixed(0)} W · ${power.max12A.toFixed(1)} A</div></div>
    <div class="summary-item"><div class="label">24V Battery</div><div class="value">${power.batt24W.toFixed(0)} W · ${power.batt24A.toFixed(1)} A</div></div>
    <div class="summary-item"><div class="label">24V Max (1.3×)</div><div class="value">${power.max24W.toFixed(0)} W · ${power.max24A.toFixed(1)} A</div></div>
    <div class="summary-item"><div class="label">Circuitos sem comprimento</div><div class="value" style="${missingLen?'color:var(--warn)':''}">${missingLen} / ${activeRows.length}</div></div>
  </div>`;
  if(!rows.length){
    html+='<div class="empty-state">Nenhum dispositivo com especificação de energia no projeto.</div>';
  } else {
    html+='<table><thead><tr><th>Dispositivo</th><th>SKU</th><th>Categoria</th><th class="num">Tensão</th><th class="num">Potência (W)</th><th class="num">Corrente (A)</th><th class="num">Cabo</th><th>Bitola sugerida (≤3% queda)</th></tr></thead><tbody>';
    rows.forEach(r=>{
      const label=r.node.customLabel?`${esc(r.dev.model)} · ${esc(r.node.customLabel)}`:esc(r.dev.model);
      const lenCell=r.hasLen?`${r.lenM.toFixed(1)} m`:'<span class="muted">sem comprimento</span>';
      let awgCell='<span class="muted">—</span>';
      if(r.amps<=0) awgCell='<span class="muted">sem consumo confirmado</span>';
      else if(!r.hasLen) awgCell='<span class="muted">sem comprimento</span>';
      else if(r.awg) awgCell=`<span class="awg-pill" style="background:${r.awg.sufficient?'var(--ok)':'var(--err)'}">${r.awg.awg} AWG</span> <span class="muted">(${r.awg.dropV.toFixed(2)}V)</span>`;
      html+=`<tr data-node="${r.node.uid}"><td>${label}</td><td class="num" style="font-family:monospace">${r.dev.sku||'—'}</td><td>${r.dev.category||'—'}</td><td class="num">${r.vNom}V</td><td class="num">${r.watts||'—'}</td><td class="num">${r.amps?r.amps.toFixed(2):'—'}</td><td class="num">${lenCell}</td><td>${awgCell}</td></tr>`;
    });
    html+='</tbody></table>';
  }
  html+=`<div style="font-size:10px;color:var(--text-muted);margin-top:14px;line-height:1.6">
    Bitola calculada pra queda de tensão ≤ 3% (ABYC E-11, circuito crítico/eletrônica de navegação), fórmula V = R(Ω/1000ft) × 2 × L(ft) × I / 1000.<br>
    Tabela de resistência por AWG é referência de engenharia padrão (cobre sólido, 20°C) — confirmar contra a tabela oficial ABYC E-11 antes de tratar como spec certificada.<br>
    Comprimento do cabo de energia vem da edge Power-12/24 conectada ao device — edite selecionando o cabo na vista "Tudo".
  </div>`;
  wrap.innerHTML=html;
  wrap.querySelectorAll('tr[data-node]').forEach(tr=>{
    tr.addEventListener('click',()=>{
      state.ui.selectedNode=tr.dataset.node; state.ui.selectedEdge=null; state.ui.selectedZone=null;
      renderInspector();
    });
  });
}

function renderCanvas(){
  const svg=document.getElementById('canvas');
  const tableView=document.getElementById('canvas-table-view');
  const isPowerTable = state.ui.canvasFilter === 'power';
  tableView.style.display = isPowerTable ? 'block' : 'none';
  svg.style.display = isPowerTable ? 'none' : '';
  const controlsEl=document.querySelector('.canvas-controls'); if(controlsEl) controlsEl.style.display = isPowerTable ? 'none' : '';
  const legendEl=document.getElementById('canvas-legend'); if(legendEl) legendEl.style.display = isPowerTable ? 'none' : '';
  if(isPowerTable){
    renderPowerTableView();
    return;
  }
  // Se filtro é N2K, usa vista estruturada dedicada
  if(state.ui.canvasFilter === 'n2k'){
    renderN2kBackboneView();
    return;
  }
  // Se filtro é Ethernet, usa vista hub-and-spoke estruturada
  if(state.ui.canvasFilter === 'ethernet'){
    renderEthernetView();
    return;
  }
  // restore viewBox livre
  svg.removeAttribute('viewBox');
  const content=document.getElementById('canvas-content');
  document.getElementById('canvas-empty').style.display=(state.project.nodes.length||state.project.zones.length)?'none':'block';
  content.setAttribute('transform',`translate(${state.ui.pan.x},${state.ui.pan.y}) scale(${state.ui.zoom})`);
  const nodeStatusMap = computeNodeStatus();

  // ZONES (atrás)
  let zonesSvg='';
  state.project.zones.forEach(z=>{
    const sel=state.ui.selectedZone===z.uid?' selected':'';
    zonesSvg+=`<g class="zone" data-zone="${z.uid}">
      <rect class="zone-rect${sel}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6" fill="${z.color}" stroke="${z.color}"/>
      <text class="zone-label" x="${z.x+10}" y="${z.y+18}">${esc(z.name)}</text>
      ${state.ui.selectedZone===z.uid?'<rect class="resize-handle" x="'+(z.x+z.w-9)+'" y="'+(z.y+z.h-9)+'" width="9" height="9" fill="'+z.color+'" stroke="#fff" stroke-width="1" data-resize-zone="'+z.uid+'" style="cursor:nwse-resize"/>':''}
    </g>`;
  });

  // EDGES (com filtro de visualização)
  const filterFn = (() => {
    const f = state.ui.canvasFilter;
    if(f==='all') return ()=>true;
    if(f==='ethernet') return e=>['gmn','bluenet','eth-generic','eth-ray','eth-furuno'].includes(PORT_TYPES[e.type]?.group);
    if(f==='n2k') return e=>edgeIsType(e,'n2k');
    // f==='power': inalcançável — renderCanvas() já retornou cedo pra renderPowerTableView()
    return ()=>true;
  })();
  let edgesSvg='';
  state.project.edges.forEach(edge=>{
    if(!filterFn(edge)){return}
    const fn=state.project.nodes.find(n=>n.uid===edge.fromNode);
    const tn=state.project.nodes.find(n=>n.uid===edge.toNode);
    if(!fn||!tn)return;
    const fp=getNodePortPositions(fn)[edge.fromPort];
    const tp=getNodePortPositions(tn)[edge.toPort];
    if(!fp||!tp)return;
    const x1=fn.x+fp.x,y1=fn.y+fp.y,x2=tn.x+tp.x,y2=tn.y+tp.y;
    // Roteamento melhorado: quanto maior dx, mais reta a curva; se nodes invertidos, faz contorno
    const dirA = fp.side==='right'?1:-1;
    const dirB = tp.side==='left'?-1:1;
    const dx = x2-x1;
    const dy = y2-y1;

    // Waypoint manual (arrastado pelo usuário, ver bindCanvas/bindGlobal) ou preview ao vivo
    // durante o arrasto — tem prioridade sobre o roteamento automático.
    const wDrag = state.ui.edgeWaypointDragging;
    const liveWp = (wDrag && wDrag.edgeUid===edge.uid) ? wDrag.point : null;
    const manualWp = (edge.waypoints && edge.waypoints[0]) || null;
    let wp = liveWp || manualWp;

    // Sem waypoint manual: verifica se a corda reta entre as 2 portas atravessa o bloco de
    // outro device no caminho — se sim, desvia automaticamente por cima ou por baixo dele.
    if(!wp){
      const blocker = findBlockingNode(x1,y1,x2,y2,[fn.uid,tn.uid]);
      if(blocker){
        const bh = nodeHeight(blocker), bw = nodeWidth(blocker);
        const midy = (y1+y2)/2;
        const bTop = blocker.y-16, bBottom = blocker.y+bh+16;
        const detourY = Math.abs(midy-bTop) <= Math.abs(bBottom-midy) ? bTop : bBottom;
        const midx = Math.max(blocker.x-20, Math.min(blocker.x+bw+20, (x1+x2)/2));
        wp = {x:midx, y:detourY};
      }
    }

    let path;
    if(wp){
      // Curva quadrática puxada pro waypoint (manual ou desvio automático) — contorna o
      // obstáculo/reflete o ajuste do usuário sem precisar de múltiplos segmentos.
      path = `M${x1},${y1} Q${wp.x},${wp.y} ${x2},${y2}`;
    } else if(fp.side==='right' && tp.side==='left' && dx>40){
      // Se from sai pra direita e to entra pela esquerda (caso comum) → curva normal
      const stretch = Math.max(40, Math.min(120, Math.abs(dx)*0.45));
      path = `M${x1},${y1} C${x1+stretch},${y1} ${x2-stretch},${y2} ${x2},${y2}`;
    } else if(fp.side==='left' && tp.side==='right' && dx<-40){
      const stretch = Math.max(40, Math.min(120, Math.abs(dx)*0.45));
      path = `M${x1},${y1} C${x1-stretch},${y1} ${x2+stretch},${y2} ${x2},${y2}`;
    } else {
      // Caso "U-turn": faz curva contornando por cima ou por baixo
      const offset = 60;
      const cx1 = x1 + dirA*offset;
      const cx2 = x2 + dirB*offset;
      // escolhe contornar por cima (y menor) ou por baixo
      const detour = Math.abs(dy)<60 ? -60 : 0;
      path = `M${x1},${y1} C${cx1},${y1+detour} ${cx2},${y2+detour} ${x2},${y2}`;
    }
    const pt=PORT_TYPES[edge.type];
    const color=pt?.color||'#888';
    const dashed=pt?.stroke==='dashed'?' dashed':'';
    const isSel=state.ui.selectedEdge===edge.uid;
    const sel=isSel?' selected':'';
    edgesSvg+=`<path class="edge-halo" d="${path}" stroke="var(--bg)" stroke-width="5" fill="none" pointer-events="none"/>`;
    edgesSvg+=`<path class="edge${dashed}${sel}" d="${path}" stroke="${color}" data-edge="${edge.uid}"/>`;
    if(edge.length){
      const lx=(x1+x2)/2,ly=(y1+y2)/2-4;
      const lab=`${edge.length}m / ${(edge.length*3.28084).toFixed(1)}ft`;
      const labW = lab.length*5.2 + 10;
      edgesSvg+=`<rect class="edge-label-bg" x="${lx-labW/2}" y="${ly-10}" width="${labW}" height="14" rx="3"/>`;
      edgesSvg+=`<text class="edge-label" x="${lx}" y="${ly+1}" text-anchor="middle">${lab}</text>`;
    }
    // Grip de ajuste manual — só na edge selecionada, pra não poluir a vista. Arrastar define
    // edge.waypoints; duplo-clique remove o waypoint manual e volta pro roteamento automático.
    if(isSel){
      const gx = wp ? wp.x : (x1+x2)/2, gy = wp ? wp.y : (y1+y2)/2;
      edgesSvg+=`<circle class="edge-waypoint-grip" data-edge-grip="${edge.uid}" cx="${gx}" cy="${gy}" r="6" fill="${color}" stroke="#fff" stroke-width="1.5" style="cursor:grab"/>`;
    }
  });

  // PENDING
  let pending='';
  if(state.ui.pendingConnection){
    const node=state.project.nodes.find(n=>n.uid===state.ui.pendingConnection.nodeUid);
    if(node){
      const p=getNodePortPositions(node)[state.ui.pendingConnection.portIdx];
      if(p){
        const x1=node.x+p.x,y1=node.y+p.y;
        const x2=(state.ui.mousePos.x-state.ui.pan.x)/state.ui.zoom;
        const y2=(state.ui.mousePos.y-state.ui.pan.y)/state.ui.zoom;
        pending=`<path class="edge-pending" d="M${x1},${y1} L${x2},${y2}"/>`;
      }
    }
  }

  // NODES (com filtro de relevância por view)
  const filter = state.ui.canvasFilter;
  let nodesSvg='';
  state.project.nodes.forEach(node=>{
    const dev=getDeviceById(node.deviceId);if(!dev)return;
    // Esconde infra puro-N2K (Tees, terminadores, cabo alim N2K) fora da vista N2K
    if(filter !== 'all' && filter !== 'n2k' && isN2kInfraOnly(dev)) return;
    // Dim em quem não pertence ao filtro ativo
    const matches = nodeMatchesFilter(dev, filter);
    const dimStyle = matches ? '' : 'opacity:0.18';
    const h=nodeHeight(node);
    const sel=state.ui.selectedNode===node.uid?' selected':'';
    let portsSvg='';
    getNodePortPositions(node).forEach((p,idx)=>{
      const color=PORT_TYPES[p.type]?.color||'#888';
      const tx=p.side==='left'?10:NODE_W-10;
      const anchor=p.side==='left'?'start':'end';
      portsSvg+=`<g class="port" data-node="${node.uid}" data-port="${idx}">
        <circle class="port-circle" cx="${p.x}" cy="${p.y}" r="5" fill="${color}"/>
        <text class="port-label" x="${tx}" y="${p.y+3}" text-anchor="${anchor}">${p.label}</text>
      </g>`;
    });
    const customLabel=node.customLabel?` · ${node.customLabel}`:'';
    const nW = node.width || NODE_W;
    const nH = node.height || h;
    // Trunca modelo se não couber (overflow visual)
    const modelText = (dev.model + customLabel);
    const maxModelLen = Math.floor((nW-20) / 6.2);
    const modelDisplay = modelText.length > maxModelLen ? modelText.substring(0, maxModelLen-1)+'…' : modelText;
    const nStatus = nodeStatusMap[node.uid] || 'ok';
    const stColor = nStatus==='err' ? '#ff5b6c' : nStatus==='warn' ? '#f0b441' : '#3ec78f';
    const stShadow = nStatus!=='ok' ? `filter:drop-shadow(0 0 6px ${stColor})` : '';
    nodesSvg+=`<g class="node${sel}" data-node="${node.uid}" transform="translate(${node.x},${node.y})" style="${dimStyle}">
      <rect class="node-rect" width="${nW}" height="${nH}" rx="4" stroke="${stColor}" stroke-width="${nStatus!=='ok'?2:1.5}" style="${stShadow}"/>
      <circle cx="${nW-8}" cy="8" r="4" fill="${stColor}" stroke="#000" stroke-width="0.5"/>
      <text class="node-fam" x="${nW/2}" y="14" text-anchor="middle">${(dev.family||dev.brand||'').toUpperCase()}</text>
      <text class="node-title" x="${nW/2}" y="28" text-anchor="middle">${esc(modelDisplay)}</text>
      <text class="node-sub" x="${nW/2}" y="40" text-anchor="middle">${dev.sku}</text>
      ${portsSvg}
      ${state.ui.selectedNode===node.uid?'<rect class="resize-handle" x="'+(nW-10)+'" y="'+(nH-10)+'" width="10" height="10" rx="1" fill="var(--accent)" data-resize-node="'+node.uid+'" style="cursor:nwse-resize"/>':''}
    </g>`;
  });

  content.innerHTML=zonesSvg+edgesSvg+pending+nodesSvg;
  bindCanvas();
}

function renderInspector(){
  const ins=document.getElementById('inspector');
  const issues=runValidation();
  let html='';

  // Selected zone
  if(state.ui.selectedZone){
    const z=state.project.zones.find(x=>x.uid===state.ui.selectedZone);
    if(z){
      html+=`<div class="inspector-section"><h4>Zona Selecionada</h4>
        <div class="inspector-row"><label>Nome</label><input id="z-name" value="${esc(z.name)}"/></div>
        <div class="inspector-row"><label>Cor</label><input id="z-color" type="color" value="${z.color}" style="width:60px;height:24px;padding:0"/></div>
        <div class="inspector-row"><label>Largura</label><input id="z-w" type="number" value="${z.w}" min="100"/></div>
        <div class="inspector-row"><label>Altura</label><input id="z-h" type="number" value="${z.h}" min="100"/></div>
        <div class="inspector-row"><label>Pos X</label><input id="z-x" type="number" value="${z.x}"/></div>
        <div class="inspector-row"><label>Pos Y</label><input id="z-y" type="number" value="${z.y}"/></div>
        <div style="margin-top:10px"><button class="danger small" id="btn-del-zone">Remover zona</button></div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:8px">Dica: itens dentro da zona ficam agrupados na impressão.</div>
      </div>`;
    }
  }

  // Selected node
  if(state.ui.selectedNode){
    const node=state.project.nodes.find(n=>n.uid===state.ui.selectedNode);
    if(node && !getDeviceById(node.deviceId)){
      html+=`<div class="inspector-section"><h4>Item Selecionado</h4>
        <div style="padding:8px 10px;background:#3a1a1a;border-left:2px solid #e05a5a;font-size:11px;color:#e0a0a0">
          Dispositivo (id: <code>${node.deviceId}</code>) não existe mais no catálogo — provavelmente veio de um projeto salvo antes de uma correção de SKU. Remova este item e adicione a versão atual.
        </div>
        <div style="margin-top:10px"><button class="danger small" id="btn-del-node">Remover do projeto</button></div>
      </div>`;
    }else if(node){
      const dev=getDeviceById(node.deviceId);
      const zoneOpts='<option value="">— sem zona —</option>'+state.project.zones.map(z=>`<option value="${z.uid}" ${node.zoneUid===z.uid?'selected':''}>${z.name}</option>`).join('');
      html+=`<div class="inspector-section"><h4>Item Selecionado</h4>
        <div class="inspector-row"><label>Família</label><span>${dev.family||dev.brand||'-'}</span></div>
        <div class="inspector-row"><label>Modelo</label><span>${dev.model}</span></div>
        <div class="inspector-row"><label>SKU</label><span style="font-family:monospace">${dev.sku}</span></div>
        <div class="inspector-row"><label>Categoria</label><span>${dev.category}</span></div>
        ${dev.power?.voltage?`<div class="inspector-row"><label>Tensão</label><span>${dev.power.voltage}</span></div>`:''}
        ${(()=>{const v=(dev.power?.voltage||'').toString();const dual=/12/.test(v)&&/24/.test(v);
          return dual?`<div class="inspector-row"><label>Barramento</label><select id="n-bus">
            <option value="" ${!node.busOverride?'selected':''}>Auto (12V)</option>
            <option value="12V" ${node.busOverride==='12V'?'selected':''}>12V</option>
            <option value="24V" ${node.busOverride==='24V'?'selected':''}>24V</option>
          </select></div>`:'';})()}
        <div class="inspector-row"><label>Zona</label><select id="n-zone">${zoneOpts}</select></div>
        <div class="inspector-row"><label>Rótulo extra</label><input id="n-label" value="${esc(node.customLabel)}" placeholder="ex: PROA"/></div>
        <div class="inspector-row"><label>Consumo (W) override</label><input id="n-watts" type="number" step="0.1" min="0" value="${node.wattsOverride||''}" placeholder="${dev.power?.watts||'-'}"/></div>
        <div style="margin-top:10px;display:flex;gap:6px">
          ${dev._free?`<button class="small" id="btn-edit-free">✎ Editar Item Livre</button>`:''}
          <button class="danger small" id="btn-del-node">Remover do projeto</button>
        </div>
        ${dev._verify?'<div style="margin-top:8px;padding:6px 8px;background:#3a2a10;border-left:2px solid var(--warn);font-size:10px;color:var(--warn)">Dados marcados como _verify — confirmar contra fonte oficial Garmin.</div>':''}
      </div>`;
    }
  }

  // Selected edge
  if(state.ui.selectedEdge){
    const edge=state.project.edges.find(e=>e.uid===state.ui.selectedEdge);
    if(edge){
      // sugerir cabos compatíveis do catálogo
      const portMap = {
        'N2K-Micro':'N2K-Micro','BlueNet':'BlueNet','GarminMarineNet':'GarminMarineNet',
        'NMEA0183':'NMEA0183','J1939':'J1939'
      };
      const wantPort = portMap[edge.type];
      const compat = (wantPort? ADAPTERS.filter(a=>a.category==='Cable' && (a.ports||[]).some(p=>p.type===wantPort)): []).sort((a,b)=>(a.length||0)-(b.length||0));
      let cableOpts = '<option value="">— escolher cabo —</option>';
      compat.forEach(c=>{
        cableOpts += `<option value="${c.id}" ${edge.cableSku===c.id?'selected':''}>${c.model} · ${c.sku}</option>`;
      });
      html+=`<div class="inspector-section"><h4>Cabo Selecionado</h4>
        <div class="inspector-row"><label>Tipo</label><span style="color:${PORT_TYPES[edge.type]?.color}">${PORT_TYPES[edge.type]?.label||edge.type}</span></div>
        ${compat.length?`<div class="inspector-row"><label>Cabo (PN)</label><select id="e-cable" style="font-size:10px">${cableOpts}</select></div>`:''}
        <div class="inspector-row"><label>Comprimento (m)</label><input id="e-len" type="number" min="0" step="0.1" value="${edge.length||''}" placeholder="ex: 6"/></div>
        <div class="inspector-row"><label>Etiqueta</label><input id="e-tag" value="${edge.tag||''}" placeholder="ex: Backbone"/></div>
        ${edge.length?`<div style="font-size:10px;color:var(--text-muted);margin-top:4px">${edge.length}m / ${(edge.length*3.28084).toFixed(1)}ft</div>`:''}
        <div style="margin-top:10px"><button class="danger small" id="btn-del-edge">Remover cabo</button></div>
      </div>`;
    }
  }

  // Validation
  html+=`<div class="inspector-section"><h4>Validação <span style="float:right;color:var(--text-muted);font-weight:400;letter-spacing:0">${issues.length} ${issues.length===1?'item':'itens'}</span></h4>`;
  if(issues.length===0){
    html+='<div style="padding:8px 0;color:var(--ok);font-size:11px">✓ Nenhum problema detectado.</div></div>';
  }else{
    html+='</div>';
    issues.forEach(i=>{
      const hasFix = !!FIX_HANDLERS[i.ruleId];
      html+=`<div class="issue ${i.severity}">
        <div class="head"><span class="rule-id">${i.ruleId}</span> ${i.title}</div>
        <div class="msg">${i.msg||''}</div>
        ${i.fix?`<div class="fix">↳ ${i.fix}</div>`:''}
        ${hasFix?`<button class="small primary" data-fix="${i.ruleId}" style="margin-top:6px">Resolver automaticamente</button>`:''}
      </div>`;
    });
  }

  // Power Use
  const power=computePowerUse();
  if(power.combinedW>0 || state.project.nodes.length>0){
    html+=`<div class="inspector-section"><h4>Power Use</h4>
      <div class="inspector-row"><label>12V Battery</label><span style="font-family:monospace">${power.batt12W.toFixed(0)} W · ${power.batt12A.toFixed(1)} A</span></div>
      <div class="inspector-row"><label>12V Max (1.3×)</label><span style="font-family:monospace">${power.max12W.toFixed(0)} W · ${power.max12A.toFixed(1)} A</span></div>
      <div class="inspector-row"><label>24V Battery</label><span style="font-family:monospace">${power.batt24W.toFixed(0)} W · ${power.batt24A.toFixed(1)} A</span></div>
      <div class="inspector-row"><label>24V Max (1.3×)</label><span style="font-family:monospace">${power.max24W.toFixed(0)} W · ${power.max24A.toFixed(1)} A</span></div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:6px">Watts não confirmados aparecem como 0. Selecione um item e preencha "Consumo (W)" se faltar.</div>
    </div>`;
  }
  // Network LEN com Voltage Drop e semáforo
  const lens=computeNetworkLen();
  // N2K Backbone Summary detalhado
  if(state.ui.canvasFilter==='n2k'){
    const nodes = calcN2kVoltagesPerNode();
    if(nodes.length){
      const realDevs = nodes.filter(d=>!d.isTerm && !d.isPower);
      const totalLen = realDevs.reduce((s,d)=>s+d.len,0);
      const totalDropL = realDevs.reduce((s,d)=>s+d.dropM,0);
      const vMin = nodes.reduce((min,d)=>(d.V<min?d.V:min),12);
      const totalI = totalLen*0.05;
      const status = totalLen>50||vMin<10.33?'err':totalLen>40||vMin<11?'warn':'ok';
      const dot = status==='err'?'#ff5b6c':status==='warn'?'#f0b441':'#3ec78f';
      const split = n2kBranchSplit(nodes);
      const branchRows = split.hasSplit ? `
        <div class="inspector-row"><label style="color:#5b8df6">● Branch A</label><span style="font-family:monospace">${split.statsA.count} disp · ${split.statsA.sumLen} LEN · ${split.statsA.minV.toFixed(2)}V min</span></div>
        <div class="inspector-row"><label style="color:#d4a64a">● Branch B</label><span style="font-family:monospace">${split.statsB.count} disp · ${split.statsB.sumLen} LEN · ${split.statsB.minV.toFixed(2)}V min</span></div>` : '';
      html+=`<div class="inspector-section" style="border-left:3px solid ${dot}">
        <h4>N2K Summary <span style="float:right;color:${dot}">●</span></h4>
        <div class="inspector-row"><label>Units</label><span>${realDevs.length}</span></div>
        <div class="inspector-row"><label>Network load</label><span style="font-family:monospace;color:${totalLen>50?'var(--err)':totalLen>40?'var(--warn)':'inherit'}">${totalLen} LEN / 50</span></div>
        <div class="inspector-row"><label>Total drop length</label><span style="font-family:monospace">${totalDropL.toFixed(1)} m / ${(totalDropL*3.28084).toFixed(1)} ft</span></div>
        <div class="inspector-row"><label>Minimum voltage</label><span style="font-family:monospace;color:${vMin<10.33?'var(--err)':vMin<11?'var(--warn)':'inherit'}">${vMin.toFixed(2)} V</span></div>
        <div class="inspector-row"><label>Current</label><span style="font-family:monospace">${totalI.toFixed(2)} A / ${(totalLen*50).toFixed(0)} mA</span></div>
        ${branchRows}
        <div style="font-size:10px;color:var(--text-muted);margin-top:8px">Fórmula Garmin oficial: V_drop = 0.053 × L × LEN × 0.1 (round trip).<br/>Limite: drop ≤ 1.67V · ΣLEN ≤ 50.${split.hasSplit?' Power tap fora do extremo — trunk dividido em 2 ramais (ver vista).':''}</div>
      </div>`;
    } else {
      html+=`<div class="inspector-section"><h4>N2K Summary</h4><div style="font-size:11px;color:var(--text-muted);padding:6px 0">Adicione dispositivos N2K ao projeto pra visualizar o backbone.</div></div>`;
    }
  }
  if(lens.length && state.ui.canvasFilter!=='n2k'){
    let lenHtml='<table class="bom-table" style="width:100%;font-size:10px"><thead><tr><th>Branch</th><th class="qty">Disp.</th><th class="qty">LEN</th><th class="qty">L (m)</th><th class="qty">V_min</th><th class="qty">●</th></tr></thead><tbody>';
    lens.forEach(l=>{
      const dot = l.status==='err'?'#ff5b6c':l.status==='warn'?'#f0b441':'#3ec78f';
      lenHtml+=`<tr><td>${l.branch}</td><td class="qty">${l.devices}</td><td class="qty">${l.len}/50</td><td class="qty">${l.totalLen_m.toFixed(0)}</td><td class="qty">${l.vMin.toFixed(1)}V</td><td class="qty"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${dot}"></span></td></tr>`;
    });
    lenHtml+='</tbody></table>';
    const worstStatus = lens.some(l=>l.status==='err')?'err':lens.some(l=>l.status==='warn')?'warn':'ok';
    const statusMsgs = lens.filter(l=>l.statusMsg).map(l=>`<div style="font-size:10px;color:${l.status==='err'?'var(--err)':'var(--warn)'};margin-top:4px"><strong>${l.branch}:</strong> ${l.statusMsg}</div>`).join('');
    html+=`<div class="inspector-section"><h4>NMEA 2000 — Status por Backbone</h4>${lenHtml}${statusMsgs}<div style="font-size:10px;color:var(--text-muted);margin-top:6px">V_min = 12V − queda (R≈0.08Ω/m × L × I). Limite: ΣLEN ≤ 50 · V ≥ 9V.</div></div>`;
  }
  // Resumo cabos
  const cables=state.project.edges.filter(e=>e.length);
  if(cables.length){
    const totalM=cables.reduce((s,e)=>s+(e.length||0),0);
    html+=`<div class="inspector-section"><h4>Cabos (Resumo)</h4>
      <div class="inspector-row"><label>Cabos com comprimento</label><span>${cables.length} / ${state.project.edges.length}</span></div>
      <div class="inspector-row"><label>Metragem total</label><span>${totalM.toFixed(1)} m</span></div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:6px">Lista detalhada na exportação "Lista de Cabos (A4)".</div>
    </div>`;
  }

  // Notes
  html+=`<div class="inspector-section"><h4>Notas Técnicas</h4>
    <textarea id="p-notes" style="width:100%;min-height:60px;font-size:11px" placeholder="Observações que aparecem nas impressões...">${state.project.notes||''}</textarea>
  </div>`;

  ins.innerHTML=html;
  bindInspector();
  ins.querySelectorAll('[data-fix]').forEach(b=>b.addEventListener('click',()=>_applyFix(b.dataset.fix)));
}

/* =================== EVENT BINDINGS =================== */
function bindInspector(){
  const g=id=>document.getElementById(id);
  // zone
  if(state.ui.selectedZone){
    const z=state.project.zones.find(x=>x.uid===state.ui.selectedZone);
    if(z){
      ['z-name','z-color','z-w','z-h','z-x','z-y'].forEach(f=>{
        g(f)?.addEventListener('change',e=>{
          const v=f==='z-color'||f==='z-name'?e.target.value:parseFloat(e.target.value)||0;
          z[f.split('-')[1]]=v;
          if(f==='z-name'&&!v.trim())z.name='Zona';
          render();
        });
      });
      g('btn-del-zone')?.addEventListener('click',()=>{
        state.project.zones=state.project.zones.filter(x=>x.uid!==z.uid);
        state.project.nodes.forEach(n=>{if(n.zoneUid===z.uid)delete n.zoneUid});
        state.ui.selectedZone=null;render();
      });
    }
  }
  // node
  if(state.ui.selectedNode){
    const n=state.project.nodes.find(x=>x.uid===state.ui.selectedNode);
    if(n){
      g('n-zone')?.addEventListener('change',e=>{n.zoneUid=e.target.value||undefined;render()});
      g('n-label')?.addEventListener('change',e=>{n.customLabel=e.target.value;render()});
      g('n-watts')?.addEventListener('change',e=>{n.wattsOverride=parseFloat(e.target.value)||0;if(!n.wattsOverride)delete n.wattsOverride;render()});
      g('n-bus')?.addEventListener('change',e=>{n.busOverride=e.target.value||undefined;if(!n.busOverride)delete n.busOverride;render()});
      g('btn-edit-free')?.addEventListener('click',()=>{
        state.ui.editingFreeId=n.deviceId;
        state.ui.libraryTab='free';
        state.ui.libraryFilter={q:'',category:''};
        render();
      });
      g('btn-del-node')?.addEventListener('click',()=>{
        state.project.edges=state.project.edges.filter(ed=>ed.fromNode!==n.uid&&ed.toNode!==n.uid);
        state.project.nodes=state.project.nodes.filter(x=>x.uid!==n.uid);
        clearPendingConnection();
        state.ui.selectedNode=null;render();
      });
    }
  }
  // edge
  if(state.ui.selectedEdge){
    const e=state.project.edges.find(x=>x.uid===state.ui.selectedEdge);
    if(e){
      g('e-len')?.addEventListener('change',ev=>{e.length=parseFloat(ev.target.value)||0;render()});
      g('e-cable')?.addEventListener('change',ev=>{
        const id=ev.target.value;
        if(id){
          const c=ADAPTERS.find(x=>x.id===id);
          if(c){e.cableSku=id; if(c.length) e.length=c.length;}
        } else { delete e.cableSku }
        render();
      });
      g('e-tag')?.addEventListener('change',ev=>{e.tag=ev.target.value;render()});
      g('btn-del-edge')?.addEventListener('click',()=>{
        state.project.edges=state.project.edges.filter(x=>x.uid!==e.uid);
        state.ui.selectedEdge=null;render();
      });
    }
  }
  g('p-notes')?.addEventListener('change',e=>{state.project.notes=e.target.value});
}

function bindCanvas(){
  const svg=document.getElementById('canvas');
  // Zone select & drag
  svg.querySelectorAll('.zone').forEach(g=>{
    const zid=g.dataset.zone;
    g.addEventListener('mousedown',e=>{
      if(e.target.closest('.node')||e.target.closest('.port'))return;
      const z=state.project.zones.find(x=>x.uid===zid);if(!z)return;
      const pt=svgPoint(e);
      state.ui.dragging={kind:'zone',uid:zid,dx:pt.x-z.x,dy:pt.y-z.y};
      state.ui.selectedZone=zid;state.ui.selectedNode=null;state.ui.selectedEdge=null;
      render();e.stopPropagation();
    });
  });
  // Nodes
  svg.querySelectorAll('.node').forEach(g=>{
    const nid=g.dataset.node;
    g.addEventListener('mousedown',e=>{
      if(e.target.closest('.port'))return;
      const node=state.project.nodes.find(n=>n.uid===nid);if(!node)return;
      const pt=svgPoint(e);
      state.ui.dragging={kind:'node',uid:nid,dx:pt.x-node.x,dy:pt.y-node.y};
      state.ui.selectedNode=nid;state.ui.selectedEdge=null;state.ui.selectedZone=null;
      render();e.stopPropagation();
    });
  });
  // Ports
  svg.querySelectorAll('.port').forEach(p=>{
    p.addEventListener('mousedown',e=>{
      const nUid=p.dataset.node,pIdx=parseInt(p.dataset.port);
      if(!state.ui.pendingConnection){
        state.ui.pendingConnection={nodeUid:nUid,portIdx:pIdx};
        svg.classList.add('connecting');
      }else{
        const a=state.ui.pendingConnection;
        if(a.nodeUid===nUid&&a.portIdx===pIdx){state.ui.pendingConnection=null;svg.classList.remove('connecting');render();return}
        const aNode=state.project.nodes.find(n=>n.uid===a.nodeUid);
        const bNode=state.project.nodes.find(n=>n.uid===nUid);
        if(!aNode||!bNode){clearPendingConnection();render();return;}
        const aP=getNodePortPositions(aNode)[a.portIdx];
        const bP=getNodePortPositions(bNode)[pIdx];
        const compat=COMPAT[aP.type]&&COMPAT[aP.type].includes(bP.type);
        if(!compat){
          toast(`Portas incompatíveis:  ${PORT_TYPES[aP.type]?.label} ↔ ${PORT_TYPES[bP.type]?.label} — use adaptador/gateway`);
          state.ui.pendingConnection=null;svg.classList.remove('connecting');render();return;
        }
        state.project.edges.push({uid:uid(),fromNode:a.nodeUid,fromPort:a.portIdx,toNode:nUid,toPort:pIdx,type:aP.type});
        state.ui.pendingConnection=null;svg.classList.remove('connecting');render();
      }
      e.stopPropagation();
    });
  });
  // Resize handle do node
  svg.querySelectorAll('[data-resize-node]').forEach(h=>{
    h.addEventListener('mousedown',e=>{
      e.stopPropagation();
      const nuid=h.dataset.resizeNode;
      const node=state.project.nodes.find(n=>n.uid===nuid);if(!node)return;
      const pt=svgPoint(e);
      state.ui.resizing={kind:'node',uid:nuid,sx:pt.x,sy:pt.y,ow:nodeWidth(node),oh:nodeHeight(node)};
    });
  });
  // Resize handle de zona
  svg.querySelectorAll('[data-resize-zone]').forEach(h=>{
    h.addEventListener('mousedown',e=>{
      e.stopPropagation();
      const zid=h.dataset.resizeZone;
      const z=state.project.zones.find(x=>x.uid===zid);if(!z)return;
      const pt=svgPoint(e);
      state.ui.resizing={kind:'zone',uid:zid,sx:pt.x,sy:pt.y,ow:z.w,oh:z.h};
    });
  });
  // Edges
  svg.querySelectorAll('.edge').forEach(p=>{
    p.addEventListener('mousedown',e=>{
      state.ui.selectedEdge=p.dataset.edge;state.ui.selectedNode=null;state.ui.selectedZone=null;
      render();e.stopPropagation();
    });
  });
  // Grip de ajuste manual da rota da edge selecionada (arrastar) — mousemove/mouseup globais
  // em bindGlobal() cuidam do resto, mesmo padrão do drag-to-reorder do N2K Backbone.
  svg.querySelectorAll('[data-edge-grip]').forEach(g=>{
    g.addEventListener('mousedown',e=>{
      e.stopPropagation();e.preventDefault();
      const edgeUid=g.dataset.edgeGrip;
      state.ui.edgeWaypointDragging={edgeUid, point:{x:parseFloat(g.getAttribute('cx')),y:parseFloat(g.getAttribute('cy'))}};
    });
    g.addEventListener('dblclick',e=>{
      e.stopPropagation();
      const edge=state.project.edges.find(x=>x.uid===g.dataset.edgeGrip);
      if(edge) delete edge.waypoints;
      render();
    });
  });
}

function svgPoint(evt){
  const svg=document.getElementById('canvas');
  const r=svg.getBoundingClientRect();
  return{x:(evt.clientX-r.left-state.ui.pan.x)/state.ui.zoom,y:(evt.clientY-r.top-state.ui.pan.y)/state.ui.zoom};
}

// Converte coordenada de tela pra espaço interno do viewBox do SVG — usa a CTM real
// em vez de pan/zoom do state, porque vistas estruturadas (N2K Backbone) têm viewBox
// próprio (altura = totalH, não bate com pan/zoom da vista "Tudo").
function svgViewBoxPoint(evt){
  const svg=document.getElementById('canvas');
  const ctm=svg.getScreenCTM();
  if(!ctm) return {x:evt.clientX,y:evt.clientY};
  const pt=svg.createSVGPoint();
  pt.x=evt.clientX;pt.y=evt.clientY;
  const loc=pt.matrixTransform(ctm.inverse());
  return {x:loc.x,y:loc.y};
}

function bindGlobal(){
  const svg=document.getElementById('canvas');
  svg.addEventListener('dragover',e=>e.preventDefault());
  svg.addEventListener('drop',e=>{
    e.preventDefault();
    const id=e.dataTransfer.getData('text/plain');
    const dev=getDeviceById(id);if(!dev)return;
    const isN2kDevice=(dev.ports||[]).some(p=>p.type==='N2K-Micro'||p.type==='N2K-Mini');
    if(state.ui.canvasFilter==='n2k' && isN2kDevice){
      // Solto em cima da vista N2K Backbone estruturada: insere na posição vertical exata onde
      // o instalador soltou (T-Joiner naquele ponto do trunk), refletindo a ordem física real —
      // em vez de cair sempre no topo (ver fallback ORD_END em buildN2kBackbone).
      const existing=calcN2kVoltagesPerNode();
      const rowH=64;
      const topPad = n2kBranchSplit(existing).hasSplit ? 58 : 40;
      const pt=svgViewBoxPoint(e);
      const insertIdx=Math.round((pt.y-topPad)/rowH);
      // x/y não têm efeito na vista N2K (posição é só n2kOrder/rowH), mas sobrevivem ao
      // trocar pra vista "Tudo"/PDF — nunca deixar em (0,0), senão múltiplos devices soltos
      // aqui ficam todos empilhados exatamente na origem do canvas fora desta vista.
      const lastN = state.project.nodes[state.project.nodes.length-1];
      const node=addDeviceNode(id, (lastN?lastN.x:100)+260, lastN?lastN.y:100);
      const arr=existing.map(d=>d.node);
      arr.splice(Math.max(0,Math.min(arr.length,insertIdx)),0,node);
      arr.forEach((n,i)=>{n.n2kOrder=i});
      state.ui.selectedNode=node.uid;render();
      return;
    }
    const pt=svgPoint(e);
    const node=addDeviceNode(id, pt.x-NODE_W/2, pt.y-30, null, pt);
    state.ui.selectedNode=node.uid;render();
  });
  svg.addEventListener('mousedown',e=>{
    if(e.target===svg||e.target.id==='canvas-bg'){
      state.ui.panning={px:e.clientX,py:e.clientY,sx:state.ui.pan.x,sy:state.ui.pan.y};
      resetSelection();svg.classList.add('panning');
      if(state.ui.pendingConnection){state.ui.pendingConnection=null;svg.classList.remove('connecting')}
      render();
    }
  });
  svg.addEventListener('mousemove',e=>{
    state.ui.mousePos={x:e.clientX-svg.getBoundingClientRect().left,y:e.clientY-svg.getBoundingClientRect().top};
    if(state.ui.n2kDragging){
      const rowH=64, topY=40;
      const pt=svgViewBoxPoint(e);
      let idx=Math.floor((pt.y-topY)/rowH);
      idx=Math.max(0,Math.min(state.ui.n2kDragging.count-1,idx));
      if(state.ui.n2kDragging.overIndex!==idx){
        state.ui.n2kDragging.overIndex=idx;
        renderN2kBackboneView();
      }
      return;
    }
    if(state.ui.edgeWaypointDragging){
      state.ui.edgeWaypointDragging.point=svgPoint(e);
      renderCanvas();
      return;
    }
    if(state.ui.resizing){
      const r=state.ui.resizing;
      const pt=svgPoint(e);
      if(r.kind==='node'){
        const node=state.project.nodes.find(n=>n.uid===r.uid);if(node){
          node.width=Math.max(140,r.ow+(pt.x-r.sx));
          node.height=Math.max(70,r.oh+(pt.y-r.sy));
          render();
        }
      } else if(r.kind==='zone'){
        const z=state.project.zones.find(x=>x.uid===r.uid);if(z){
          z.w=Math.max(150,r.ow+(pt.x-r.sx));
          z.h=Math.max(100,r.oh+(pt.y-r.sy));
          render();
        }
      }
      return;
    }
    if(state.ui.dragging){
      const pt=svgPoint(e);
      const d=state.ui.dragging;
      if(d.kind==='node'){
        const n=state.project.nodes.find(x=>x.uid===d.uid);
        if(n){n.x=pt.x-d.dx;n.y=pt.y-d.dy;
          // update zone assignment
          n.zoneUid=undefined;
          state.project.zones.forEach(z=>{
            const cx=n.x+nodeWidth(n)/2,cy=n.y+nodeHeight(n)/2;
            if(cx>=z.x&&cx<=z.x+z.w&&cy>=z.y&&cy<=z.y+z.h) n.zoneUid=z.uid;
          });
          render();
        }
      }else if(d.kind==='zone'){
        const z=state.project.zones.find(x=>x.uid===d.uid);
        if(z){const oldX=z.x,oldY=z.y;z.x=pt.x-d.dx;z.y=pt.y-d.dy;
          // arrasta nodes da zona junto
          state.project.nodes.forEach(n=>{if(n.zoneUid===z.uid){n.x+=z.x-oldX;n.y+=z.y-oldY}});
          render();
        }
      }
    }else if(state.ui.panning){
      state.ui.pan.x=state.ui.panning.sx+(e.clientX-state.ui.panning.px);
      state.ui.pan.y=state.ui.panning.sy+(e.clientY-state.ui.panning.py);
      renderCanvas();
    }else if(state.ui.pendingConnection){renderCanvas()}
  });
  window.addEventListener('mouseup',()=>{
    if(state.ui.edgeWaypointDragging){
      const wd=state.ui.edgeWaypointDragging;
      const edge=state.project.edges.find(x=>x.uid===wd.edgeUid);
      if(edge) edge.waypoints=[wd.point];
      state.ui.edgeWaypointDragging=null;
      render();
      return;
    }
    if(state.ui.n2kDragging){
      const drag=state.ui.n2kDragging;
      const nodes=calcN2kVoltagesPerNode();
      const fromIdx=nodes.findIndex(d=>d.node.uid===drag.uid);
      if(fromIdx>=0){
        const toIdx=Math.max(0,Math.min(nodes.length-1,drag.overIndex));
        if(toIdx!==fromIdx){
          const arr=nodes.slice();
          const [moved]=arr.splice(fromIdx,1);
          arr.splice(toIdx,0,moved);
          arr.forEach((d,i)=>{d.node.n2kOrder=i});
        }
      }
      state.ui.n2kDragging=null;
      render();
    }
    state.ui.dragging=null;state.ui.panning=false;state.ui.resizing=null;svg.classList.remove('panning');
  });
  svg.addEventListener('wheel',e=>{
    e.preventDefault();
    const d=e.deltaY>0?0.9:1.1;
    const nz=Math.max(0.3,Math.min(3,state.ui.zoom*d));
    const r=svg.getBoundingClientRect();
    const mx=e.clientX-r.left,my=e.clientY-r.top;
    state.ui.pan.x=mx-(mx-state.ui.pan.x)*(nz/state.ui.zoom);
    state.ui.pan.y=my-(my-state.ui.pan.y)*(nz/state.ui.zoom);
    state.ui.zoom=nz;renderCanvas();
  },{passive:false});
  document.getElementById('zoom-in').addEventListener('click',()=>{state.ui.zoom=Math.min(3,state.ui.zoom*1.2);renderCanvas()});
  document.getElementById('zoom-out').addEventListener('click',()=>{state.ui.zoom=Math.max(0.3,state.ui.zoom/1.2);renderCanvas()});
  document.getElementById('zoom-reset').addEventListener('click',()=>{state.ui.zoom=1;state.ui.pan={x:0,y:0};renderCanvas()});

  document.querySelectorAll('.canvas-filter-bar button').forEach(b=>{
    b.addEventListener('click',()=>{
      state.ui.canvasFilter=b.dataset.filter;
      document.querySelectorAll('.canvas-filter-bar button').forEach(x=>x.classList.toggle('active',x===b));
      renderCanvas();
    });
  });
  document.querySelectorAll('.tabs button').forEach(b=>{
    b.addEventListener('click',()=>{state.ui.libraryTab=b.dataset.tab;state.ui.libraryFilter={q:'',category:''};render()});
  });
  document.getElementById('lib-search').addEventListener('input',e=>{state.ui.libraryFilter.q=e.target.value;renderLibrary()});
  document.getElementById('lib-category').addEventListener('change',e=>{state.ui.libraryFilter.category=e.target.value;renderLibrary()});

  // Header inputs
  document.getElementById('project-name').addEventListener('change',e=>{state.project.name=e.target.value});
  document.getElementById('project-vessel').addEventListener('change',e=>{state.project.vessel=e.target.value});
  document.getElementById('project-client').addEventListener('change',e=>{state.project.client=e.target.value});
  document.getElementById('project-date').addEventListener('change',e=>{state.project.date=e.target.value});

  document.getElementById('btn-new').addEventListener('click',newProject);
  document.getElementById('btn-wizard').addEventListener('click',openWizard);
  document.getElementById('btn-save').addEventListener('click',saveProject);
  document.getElementById('btn-load').addEventListener('click',loadProject);
  document.getElementById('btn-export').addEventListener('click',exportJSON);
  document.getElementById('btn-import').addEventListener('click',importJSON);

  // Tema claro / escuro
  const THEME_KEY='garmin_sb_theme';
  const applyTheme=t=>{
    document.body.classList.toggle('theme-light',t==='light');
    const btn=document.getElementById('btn-theme');
    if(btn) btn.textContent=t==='light'?'☀️ Tema':'🌙 Tema';
    localStorage.setItem(THEME_KEY,t);
  };
  applyTheme(localStorage.getItem(THEME_KEY)||'dark');
  document.getElementById('btn-search').addEventListener('click',openSearch);
  document.getElementById('btn-theme').addEventListener('click',()=>{
    const cur=localStorage.getItem(THEME_KEY)||'dark';
    applyTheme(cur==='light'?'dark':'light');
  });

  // Toggle estilo do thumb (foto Garmin oficial vs silhueta Wonder BOAT)
  const THUMB_KEY='garmin_sb_thumb_style';
  const applyThumbStyle=t=>{
    state.ui.thumbStyle = t;
    const lab=document.getElementById('thumb-style-label');
    if(lab) lab.textContent = t==='photo' ? 'Foto' : 'Silhueta';
    localStorage.setItem(THUMB_KEY,t);
    // Re-renderiza biblioteca pra trocar os thumbs
    if(typeof renderLibrary==='function') renderLibrary();
  };
  applyThumbStyle(localStorage.getItem(THUMB_KEY)||'silhouette');
  document.getElementById('btn-thumb-style').addEventListener('click',()=>{
    applyThumbStyle(state.ui.thumbStyle==='photo'?'silhouette':'photo');
    toast(state.ui.thumbStyle==='photo'?'Mostrando fotos oficiais Garmin':'Mostrando silhuetas Wonder BOAT');
  });

  // Print dropdown
  const dd=document.getElementById('print-dd');
  document.getElementById('btn-print-toggle').addEventListener('click',e=>{e.stopPropagation();dd.classList.toggle('open')});
  document.addEventListener('click',()=>dd.classList.remove('open'));
  dd.querySelectorAll('[data-print]').forEach(b=>{
    b.addEventListener('click',e=>{e.stopPropagation();dd.classList.remove('open');doPrint(b.dataset.print)});
  });

  // Search Ctrl+K
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();return}
    if(e.key==='Escape'&&document.getElementById('search-overlay').style.display==='flex'){closeSearch();return}
  });
  document.getElementById('search-input').addEventListener('input',ev=>renderSearchResults(ev.target.value));
  document.getElementById('search-overlay').addEventListener('click',ev=>{if(ev.target.id==='search-overlay')closeSearch()});

  // Delete / Esc
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
    if(e.key==='Delete'||e.key==='Backspace'){
      if(state.ui.selectedNode){
        state.project.edges=state.project.edges.filter(ed=>ed.fromNode!==state.ui.selectedNode&&ed.toNode!==state.ui.selectedNode);
        state.project.nodes=state.project.nodes.filter(n=>n.uid!==state.ui.selectedNode);
        clearPendingConnection();
        state.ui.selectedNode=null;render();
      }else if(state.ui.selectedEdge){
        state.project.edges=state.project.edges.filter(ed=>ed.uid!==state.ui.selectedEdge);
        state.ui.selectedEdge=null;render();
      }else if(state.ui.selectedZone){
        const zid=state.ui.selectedZone;
        state.project.zones=state.project.zones.filter(z=>z.uid!==zid);
        state.project.nodes.forEach(n=>{if(n.zoneUid===zid) delete n.zoneUid});
        state.ui.selectedZone=null;render();
      }
    }else if(e.key==='Escape'){
      state.ui.pendingConnection=null;resetSelection();
      document.getElementById('canvas').classList.remove('connecting');render();
    }
  });
}

/* =================== PRINT =================== */


/* =================== AUTO-FIXES PARA REGRAS =================== */
function _applyFix(ruleId){
  if(!FIX_HANDLERS[ruleId]){toast('Sem auto-fix para essa regra');return}
  FIX_HANDLERS[ruleId]();
  render();
  toast('Aplicado: '+ruleId);
}

const FIX_HANDLERS = {
  'R-N2K-01': function(){
    // Adiciona 2 terminadores (Macho + Fêmea) próximos do canvas, desconectados
    const term_m = ADAPTERS.find(a=>/Terminador.*Macho/i.test(a.model));
    const term_f = ADAPTERS.find(a=>/Terminador.*F[êe]mea/i.test(a.model));
    if(!term_m||!term_f){toast('Terminadores não encontrados no catálogo');return}
    const cx = (state.ui.mousePos.x-state.ui.pan.x)/state.ui.zoom || 100;
    const cy = (state.ui.mousePos.y-state.ui.pan.y)/state.ui.zoom || 100;
    const tm={uid:uid(),deviceId:term_m.id,x:cx,y:cy}, tf={uid:uid(),deviceId:term_f.id,x:cx+250,y:cy};
    state.project.nodes.push(tm,tf);
    assignSensibleN2kOrder(tm); assignSensibleN2kOrder(tf);
  },
  'R-N2K-02': function(){
    const pwr = ADAPTERS.find(a=>/Cabo Alimenta/i.test(a.model));
    if(!pwr){toast('Cabo de alimentação não encontrado');return}
    const cx = (state.ui.mousePos.x-state.ui.pan.x)/state.ui.zoom || 200;
    const cy = (state.ui.mousePos.y-state.ui.pan.y)/state.ui.zoom || 200;
    const n={uid:uid(),deviceId:pwr.id,x:cx,y:cy};
    state.project.nodes.push(n);
    assignSensibleN2kOrder(n);
  },
  'R-PANO-01': function(){
    const gls = CATALOG.find(d=>/GLS\s*10/i.test(d.model));
    if(!gls){toast('GLS 10 não encontrado');return}
    const cx = (state.ui.mousePos.x-state.ui.pan.x)/state.ui.zoom || 300;
    const cy = (state.ui.mousePos.y-state.ui.pan.y)/state.ui.zoom || 300;
    const n={uid:uid(),deviceId:gls.id,x:cx,y:cy};
    state.project.nodes.push(n);
    assignSensibleN2kOrder(n);
  },
  'R-AP-01': function(){
    const ghc = CATALOG.find(d=>/GHC\s*50/i.test(d.model));
    if(!ghc){toast('GHC 50 não encontrado');return}
    const cx = (state.ui.mousePos.x-state.ui.pan.x)/state.ui.zoom || 400;
    const cy = (state.ui.mousePos.y-state.ui.pan.y)/state.ui.zoom || 400;
    const n={uid:uid(),deviceId:ghc.id,x:cx,y:cy};
    state.project.nodes.push(n);
    assignSensibleN2kOrder(n);
  }
};

function doPrint(mode){
  // Instrução de paper size pra Chrome (uma vez por sessão)
  if(!window.__printedHint){
    window.__printedHint=true;
    setTimeout(()=>{
      const hints={cliente:'A4 Paisagem · Margens "Nenhum"',a3:'A3 Paisagem · Margens "Nenhum"',cabos:'A4 Retrato · Margens "Padrão"'};
      const hint=hints[mode];
      const el=document.createElement('div');
      el.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#0a3d8a;color:#fff;padding:8px 18px;border-radius:4px;z-index:99999;font-size:12px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3)';
      el.innerHTML='💡 No diálogo de impressão escolha: <strong>'+hint+'</strong>';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),5000);
    },10);
  }
  document.body.classList.remove('print-mode-cliente','print-mode-a3','print-mode-cabos');
  if(mode==='cliente') renderClienteMode();
  else if(mode==='a3') renderA3Mode();
  else renderCabosMode();
  document.body.classList.add('print-mode-'+mode);
  setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove('print-mode-'+mode),500)},80);
}

/* =================== HELPERS DE PRINT =================== */
function mToFt(m){return (m*3.28084).toFixed(1)}
function dualLen(m){return m+'m / '+mToFt(m)+'ft'}

function computePowerUse(){
  const r={batt12W:0,batt12A:0,max12W:0,max12A:0,batt24W:0,batt24A:0,max24W:0,max24A:0,
           combinedW:0,combinedMaxW:0};
  state.project.nodes.forEach(n=>{
    const dev=getDeviceById(n.deviceId);
    if(!dev) return;
    const w=(typeof n.wattsOverride==='number'?n.wattsOverride:dev.power?.watts)||0;
    if(!w) return;
    const v=(dev.power?.voltage||'').toString();
    const has12=/12/.test(v), has24=/24/.test(v);
    // devices dual-voltage (12-24VDC — a maioria do catálogo) precisam que o instalador escolha
    // em qual barramento o device está de fato ligado NESSE barco; sem escolha, mantém o default
    // histórico (12V) pra não quebrar projetos salvos antes desse campo existir
    const is24=n.busOverride==='24V' ? true : n.busOverride==='12V' ? false : (has24 && !has12);
    if(is24){r.batt24W+=w}else{r.batt12W+=w}
  });
  r.max12W=r.batt12W*1.3; r.max24W=r.batt24W*1.3;
  r.batt12A=r.batt12W/12; r.max12A=r.max12W/12;
  r.batt24A=r.batt24W/24; r.max24A=r.max24W/24;
  r.combinedW=r.batt12W+r.batt24W; r.combinedMaxW=r.max12W+r.max24W;
  return r;
}

// V_drop = R(Ω/1000ft) × 2 (ida+volta) × L_ft × I / 1000 — fórmula padrão de queda de
// tensão em corrente contínua. Percorre AWG_TABLE do mais fino pro mais grosso e retorna
// o primeiro que fica dentro do alvo (ou o maior da tabela, marcado insuficiente).
function awgForCurrent(amps, lenM, targetDropV){
  if(!amps || !lenM) return null;
  const lenFt = lenM * 3.28084;
  for(const row of AWG_TABLE){
    const drop = row.ohmsPer1000ft * 2 * lenFt * amps / 1000;
    if(drop <= targetDropV) return {...row, dropV:drop, sufficient:true};
  }
  const last = AWG_TABLE[AWG_TABLE.length-1];
  const drop = last.ohmsPer1000ft * 2 * lenFt * amps / 1000;
  return {...last, dropV:drop, sufficient:false};
}

// Quebra por-device pra vista Energia (tabela) — mesma resolução de watts/voltage que
// computePowerUse() (consistência com os totais já mostrados), mas devolve 1 linha por node.
function computePowerRows(){
  return state.project.nodes.map(n=>{
    const dev=getDeviceById(n.deviceId);
    if(!dev || isN2kInfraOnly(dev)) return null; // Tee/Terminador/Cabo Alim. N2K não têm circuito próprio
    if(!dev.power) return null; // sem spec de energia (antena, adapter passivo, Item Livre) — não inventar
    const vRaw=(dev.power.voltage||'').toString();
    const has12=/12/.test(vRaw), has24=/24/.test(vRaw);
    const is24=n.busOverride==='24V' ? true : n.busOverride==='12V' ? false : (has24 && !has12);
    const vNom=is24?24:12;
    const w=(typeof n.wattsOverride==='number'?n.wattsOverride:dev.power.watts)||0;
    const amps=w?w/vNom:0;
    const group=is24?'pwr24':'pwr12';
    const edge=state.project.edges.find(e=>PORT_TYPES[e.type]?.group===group && (e.fromNode===n.uid||e.toNode===n.uid));
    const hasLen=!!(edge && edge.length);
    const lenM=hasLen?edge.length:0;
    const awg=(hasLen && amps>0) ? awgForCurrent(amps, lenM, vNom*POWER_TARGET_DROP_PCT) : null;
    return {node:n, dev, vRaw, vNom, is24, watts:w, amps, hasLen, lenM, awg};
  }).filter(Boolean).sort((a,b)=>b.amps-a.amps); // maior consumo primeiro (mais acionável pro instalador)
}

// Versão HTML "print-safe" da tabela de energia — página ENERGIA do PDF A3 Técnico (ver
// renderA3Mode()), reaproveita a mesma lógica de computePowerRows() da vista on-screen.
function buildEnergiaTableHtml(){
  const rows = computePowerRows();
  const power = computePowerUse();
  if(!rows.length) return `<div style="padding:20pt;text-align:center;color:#666;font-size:9pt">Nenhum dispositivo com especificação de energia no projeto.</div>`;
  let html = `<div style="display:flex;gap:14pt;margin-bottom:8pt;font-family:Menlo,Consolas,monospace;font-size:8pt;color:#444">
    <div><strong>12V</strong> ${power.batt12W.toFixed(0)}W · ${power.batt12A.toFixed(1)}A (batt) · ${power.max12A.toFixed(1)}A (max)</div>
    <div><strong>24V</strong> ${power.batt24W.toFixed(0)}W · ${power.batt24A.toFixed(1)}A (batt) · ${power.max24A.toFixed(1)}A (max)</div>
  </div>`;
  html += `<table><thead><tr><th>Dispositivo</th><th>SKU</th><th class="num">Tensão</th><th class="num">W</th><th class="num">A</th><th class="num">Cabo</th><th>Bitola (≤3%)</th></tr></thead><tbody>`;
  rows.forEach(r=>{
    const label = r.node.customLabel ? `${esc(r.dev.model)} · ${esc(r.node.customLabel)}` : esc(r.dev.model);
    const lenCell = r.hasLen ? `${r.lenM.toFixed(1)}m` : '—';
    let awgCell = '—';
    if(r.amps>0 && r.hasLen && r.awg) awgCell = `${r.awg.awg} AWG (${r.awg.dropV.toFixed(2)}V)${r.awg.sufficient?'':' ⚠'}`;
    else if(r.amps>0 && !r.hasLen) awgCell = 'sem comprimento';
    html += `<tr><td>${label}</td><td style="font-family:Menlo,Consolas,monospace">${r.dev.sku||'—'}</td><td class="num">${r.vNom}V</td><td class="num">${r.watts||'—'}</td><td class="num">${r.amps?r.amps.toFixed(2):'—'}</td><td class="num">${lenCell}</td><td>${awgCell}</td></tr>`;
  });
  html += `</tbody></table>
  <div style="font-size:7.5pt;color:#888;margin-top:6pt">Bitola calculada pra queda de tensão ≤ 3% (ABYC E-11, circuito crítico). Tabela AWG é referência de engenharia — confirmar contra o documento oficial ABYC E-11.</div>`;
  return html;
}


function computeNodeStatus(){
  // retorna {[nodeUid]: 'ok'|'warn'|'err'} baseado nas regras
  const map={};
  state.project.nodes.forEach(n=>map[n.uid]='ok');
  const issues=runValidation();
  issues.forEach(iss=>{
    // tenta inferir nodes afetados por palavras-chave no título
    state.project.nodes.forEach(n=>{
      const dev=getDeviceById(n.deviceId);
      if(!dev) return;
      if(iss.title && iss.title.includes(dev.model)){
        if(iss.severity==='error'||map[n.uid]!=='err') map[n.uid]=iss.severity==='error'?'err':iss.severity==='warn'?(map[n.uid]==='err'?'err':'warn'):map[n.uid];
      }
    });
  });
  // Status N2K backbones afeta nodes nesses backbones
  computeNetworkLen().forEach(br=>{
    if(br.status==='err'||br.status==='warn'){
      br.nodes.forEach(uid=>{
        if(br.status==='err'||map[uid]!=='err') map[uid]=br.status;
      });
    }
  });
  return map;
}

function computeNetworkLen(){
  const comps=getNetworkComponents(e=>edgeIsType(e,'n2k'));
  return comps.map((comp,i)=>{
    let len=0,devs=0,totalLen_m=0;
    let hasTerm=0,hasPower=0;
    comp.forEach(uid=>{
      const node=state.project.nodes.find(n=>n.uid===uid);
      if(!node)return;
      const dev=getDeviceById(node.deviceId);
      if(!dev)return;
      devs++;
      if(/Terminador/i.test(dev.model)) hasTerm++;
      if(/Alimenta|Power\s*Tee/i.test(dev.model)) hasPower++;
      const lenContrib = dev.n2kLen || (dev.category==='MFD'?4:dev.category==='VHF'?3:dev.category==='AIS'?3:dev.category==='Autopilot'?3:dev.category==='Instrument'?1:dev.category==='Sensor'?1:dev.category==='Antenna'?1:dev.category==='Adapter'?0:2);
      len+=lenContrib;
    });
    // Soma comprimento dos cabos N2K desta branch
    state.project.edges.forEach(e=>{
      if(!edgeIsType(e,'n2k')) return;
      if(comp.includes(e.fromNode) && comp.includes(e.toNode) && e.length){
        totalLen_m += e.length;
      }
    });
    // Voltage drop OFICIAL Garmin: R = 0.053 Ω/m, I = LEN × 50mA, 2× round trip
    // V_drop = 0.053 × L_total × LEN × 0.1
    // Max permitido = 1.67 Vdc do power tap até device mais distante
    const I = len*0.05;
    const vDrop = 0.053 * totalLen_m * len * 0.1;
    const vMin = Math.max(0, 12 - vDrop);
    // Status
    let status='ok',statusMsg='';
    if(len>50){status='err';statusMsg='ΣLEN excede limite NMEA 2000 (50)'}
    else if(len>40){status='warn';statusMsg='ΣLEN próximo do limite (>40)'}
    else if(vDrop>1.67){status='err';statusMsg=`Drop excede 1.67V (norma Garmin): ${vDrop.toFixed(2)}V`}
    else if(vDrop>1.4){status='warn';statusMsg=`Drop alto: ${vDrop.toFixed(2)}V (limite 1.67V)`}
    else if(hasTerm<2){status='warn';statusMsg=`Apenas ${hasTerm} terminador(es)`}
    else if(hasPower<1){status='err';statusMsg='Sem alimentação'}
    return {branch:String.fromCharCode(65+i),len,devices:devs,totalLen_m,vDrop,vMin,status,statusMsg,nodes:comp};
  });
}

/* =================== SCHEMATIC SVG =================== */
function buildSchematicSvg(width,height,opts){
  opts=opts||{};
  const proj=state.project;
  const padding=opts.padding||30;
  const filterEdge=opts.filterEdge||(()=>true);
  const showLabels=opts.showLabels!==false;
  const dual=opts.dual!==false;
  const includeWatermark=opts.watermark||false;

  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  proj.zones.forEach(z=>{minX=Math.min(minX,z.x);minY=Math.min(minY,z.y);maxX=Math.max(maxX,z.x+z.w);maxY=Math.max(maxY,z.y+z.h)});
  proj.nodes.forEach(n=>{const h=nodeHeight(n);const w=nodeWidth(n);minX=Math.min(minX,n.x);minY=Math.min(minY,n.y);maxX=Math.max(maxX,n.x+w);maxY=Math.max(maxY,n.y+h)});
  if(!isFinite(minX)){minX=0;minY=0;maxX=800;maxY=400}
  const bw=maxX-minX+padding*2,bh=maxY-minY+padding*2;
  const scale=Math.min(width/bw,height/bh);
  const tx=(width-bw*scale)/2-(minX-padding)*scale;
  const ty=(height-bh*scale)/2-(minY-padding)*scale;

  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="font-family:Helvetica,Arial,sans-serif">`;
  if(includeWatermark){
    svg+=`<g opacity="0.05" transform="translate(${width/2},${height/2})">`;
    svg+=`<text text-anchor="middle" font-size="${Math.min(width,height)*0.13}" font-weight="700" letter-spacing="6" fill="#000" font-family="Helvetica,Arial,sans-serif">WONDER BOAT</text>`;
    svg+=`<text text-anchor="middle" font-size="${Math.min(width,height)*0.025}" letter-spacing="6" fill="#000" font-family="Helvetica,Arial,sans-serif" y="${Math.min(width,height)*0.06}">SYSTEM BUILDER</text>`;
    svg+=`</g>`;
  }
  svg+=`<g transform="translate(${tx},${ty}) scale(${scale})">`;

  proj.zones.forEach(z=>{
    svg+=`<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6" fill="${z.color}" fill-opacity="0.05" stroke="${z.color}" stroke-width="1" stroke-dasharray="5 4"/>`;
    svg+=`<text x="${z.x+12}" y="${z.y+22}" font-size="13" font-weight="700" fill="#222" letter-spacing="3">${esc(z.name)}</text>`;
  });

  proj.edges.forEach(edge=>{
    if(!filterEdge(edge)) return;
    const fn=proj.nodes.find(n=>n.uid===edge.fromNode);
    const tn=proj.nodes.find(n=>n.uid===edge.toNode);
    if(!fn||!tn)return;
    const fp=getNodePortPositions(fn)[edge.fromPort];
    const tp=getNodePortPositions(tn)[edge.toPort];
    if(!fp||!tp)return;
    const x1=fn.x+fp.x,y1=fn.y+fp.y,x2=tn.x+tp.x,y2=tn.y+tp.y;
    const cx=(x1+x2)/2;
    const path=`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
    const pt=PORT_TYPES[edge.type];
    const color=pt?.color||'#888';
    const dash=pt?.stroke==='dashed'?'stroke-dasharray="6 4"':'';
    svg+=`<path d="${path}" stroke="${color}" stroke-width="2" fill="none" ${dash}/>`;
    if(edge.length && showLabels){
      const lx=(x1+x2)/2,ly=(y1+y2)/2;
      const txt = dual?dualLen(edge.length):(edge.length+'m');
      const w = txt.length*5.5+8;
      svg+=`<rect x="${lx-w/2}" y="${ly-9}" width="${w}" height="14" rx="2" fill="#fff" stroke="${color}" stroke-width="0.7"/>`;
      svg+=`<text x="${lx}" y="${ly+1}" font-size="9" font-weight="700" text-anchor="middle" fill="${color}" font-family="Menlo,Consolas,monospace">${txt}</text>`;
    }
  });

  proj.nodes.forEach(node=>{
    const dev=getDeviceById(node.deviceId);if(!dev)return;
    const h=nodeHeight(node);
    const w=nodeWidth(node);
    svg+=`<g transform="translate(${node.x},${node.y})">`;
    svg+=`<rect width="${w}" height="${h}" rx="4" fill="#fff" stroke="#222" stroke-width="0.8"/>`;
    svg+=`<text x="${w/2}" y="14" font-size="9" font-weight="700" fill="#0a3d8a" letter-spacing="1.5" text-anchor="middle">${(dev.family||dev.brand||'').toUpperCase()}</text>`;
    svg+=`<text x="${w/2}" y="28" font-size="11" font-weight="700" fill="#000" text-anchor="middle">${esc(dev.model)}${node.customLabel?' · '+esc(node.customLabel):''}</text>`;
    svg+=`<text x="${w/2}" y="40" font-size="9" fill="#666" font-family="Menlo,Consolas,monospace" text-anchor="middle">${dev.sku}</text>`;
    getNodePortPositions(node).forEach((p)=>{
      const color=PORT_TYPES[p.type]?.color||'#888';
      const txa=p.side==='left'?10:NODE_W-10;
      const anchor=p.side==='left'?'start':'end';
      svg+=`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${color}" stroke="#fff" stroke-width="1"/>`;
      svg+=`<text x="${txa}" y="${p.y+3}" font-size="7" fill="#666" text-anchor="${anchor}">${p.label}</text>`;
    });
    svg+=`</g>`;
  });

  svg+=`</g></svg>`;
  return svg;
}

/* =================== RENDER PRINT — CLIENTE (A4 paisagem) =================== */
function renderClienteMode(){
  const proj=state.project;
  const dateFmt=new Date(proj.date).toLocaleDateString('pt-BR');
  const subtitle=`GARMIN${proj.vessel?' · '+esc(proj.vessel.toUpperCase()):''}${proj.name?' — '+esc(proj.name.toUpperCase()):''}`;

  const slide=(svgInner,viewLabel)=>`
    <div class="slide">
      <img class="wb-logo-mark" src="logo.png" alt="">
      <div class="slide-brand-tl"><img class="print-head-logo" src="logo.png" alt=""><span>WONDER BOAT<small>SYSTEM BUILDER · GARMIN</small></span></div>
      ${viewLabel?`<div class="view-tag">${viewLabel}</div>`:''}
      <div class="slide-canvas">${svgInner}</div>
      <div class="slide-info">
        <div class="seal"><span class="seal-inner">WONDER<br>BOAT<br>·IN07169·</span></div>
        <div class="info-block">
          <div class="info-tag">SISTEMA ELETRÔNICO DE NAVEGAÇÃO</div>
          <div class="info-title">${subtitle}</div>
          <div class="info-client">Cliente<strong>${esc(proj.client)||'—'}</strong></div>
          <div class="info-sig"><span class="info-sig-name"><img class="info-sig-logo" src="logo.png" alt="">Projetista <strong>${esc(proj.installer)||'Lucas de Araújo Souza'}</strong></span><span>${dateFmt}</span></div>
        </div>
      </div>
    </div>
  `;

  // Página 1: Layout completo (todas as redes)
  const svg1 = buildSchematicSvg(1100, 620, {padding:60, watermark:false});
  // Página 2: só ETHERNET (Garmin Net + BlueNet)
  const svg2 = buildSchematicSvg(1100, 620, {padding:60, watermark:false,
    filterEdge:e=>['gmn','bluenet','eth-generic','eth-ray','eth-furuno'].includes(PORT_TYPES[e.type]?.group)});
  // Página 3: só N2K
  const svg3 = buildSchematicSvg(1100, 620, {padding:60, watermark:false,
    filterEdge:e=>edgeIsType(e,'n2k')});

  let pages = slide(svg1, 'LAYOUT GERAL') + slide(svg2, 'ETHERNET') + slide(svg3, 'NMEA 2000');
  document.getElementById('print-cliente').innerHTML = pages;
}

/* =================== RENDER PRINT — A3 TÉCNICO =================== */
function renderA3Mode(){
  const proj=state.project;
  const dateFmt=new Date(proj.date).toLocaleDateString('pt-BR');
  const power=computePowerUse();
  const lens=computeNetworkLen();

  const legend=['BlueNet','GarminMarineNet','N2K-Micro','NMEA0183','J1939','Power-12','PoE'].map(t=>{
    const p=PORT_TYPES[t];if(!p)return'';
    const cls=p.stroke==='dashed'?'sw dashed':'sw';
    return `<div class="lg" style="color:${p.color}"><div class="${cls}" style="background:${p.color}"></div>${p.label}</div>`;
  }).join('');

  let lenTable = '';
  if(lens.length){
    lenTable = '<table style="margin-top:2mm"><tr><th>Branch</th><th>Disp.</th><th>LEN</th></tr>';
    let totalLen=0,totalDev=0;
    lens.forEach(l=>{lenTable+=`<tr><td>${l.branch}</td><td>${l.devices}</td><td>${l.len}</td></tr>`;totalLen+=l.len;totalDev+=l.devices});
    if(lens.length>1) lenTable+=`<tr style="font-weight:700;border-top:.5pt solid #999"><td>Total</td><td>${totalDev}</td><td>${totalLen}/50</td></tr>`;
    lenTable += '</table>';
  }

  const a3 = (svg, viewLabel) => `
    <div class="a3">
      <div class="a3-watermark">WONDER BOAT</div>
      <div class="a3-head">
        <div class="left"><img class="print-head-logo" src="logo.png" alt=""><span>WONDER BOAT<small>SYSTEM BUILDER · GARMIN${viewLabel?' — '+viewLabel:''}</small></span></div>
        <div style="display:flex;align-items:center">
          <div class="right">
            <strong>${esc(proj.name)||'Projeto sem nome'}</strong><br>
            ${esc(proj.vessel)}${proj.vessel&&proj.client?' · ':''}${esc(proj.client)}<br>
            ${dateFmt} · ${esc(proj.installer)} · ${esc(proj.cert)}
          </div>
          <div class="seal">WONDER<br>BOAT<br>·IN07169·</div>
        </div>
      </div>
      <div class="a3-canvas">${svg}</div>
      <div class="a3-foot">
        <div style="flex:1">
          <div class="a3-legend">${legend}</div>
          <div style="margin-top:3mm;font-size:8pt;color:#666">
            ${proj.notes?esc(proj.notes).replace(/\n/g,'<br>')+'<br>':''}
            Projeto técnico · ABYC E-11 · ISO 13297 · ISO 10133<br>
            ${esc(proj.installer)||'Lucas de Araújo Souza'} · ${esc(proj.cert)||'IN07169'} · ${esc(proj.company)||'Wonder BOAT | Wonder HUB.AI'}
          </div>
        </div>
        <div class="a3-power">
          <h5>Power Use</h5>
          <table>
            <tr><th></th><th>Batt.</th><th>Max.</th></tr>
            <tr><td>12V</td><td>${power.batt12W.toFixed(0)}W / ${power.batt12A.toFixed(1)}A</td><td>${power.max12W.toFixed(0)}W / ${power.max12A.toFixed(1)}A</td></tr>
            <tr><td>24V</td><td>${power.batt24W.toFixed(0)}W / ${power.batt24A.toFixed(1)}A</td><td>${power.max24W.toFixed(0)}W / ${power.max24A.toFixed(1)}A</td></tr>
          </table>
          ${lenTable?'<h5 style="margin-top:3mm">N2K Network LEN</h5>'+lenTable:''}
        </div>
      </div>
    </div>
  `;

  // Página 1: Tudo, Página 2: Ethernet, Página 3: N2K Backbone (vista estruturada, igual à
  // tela — não o schematic livre filtrado), Página 4: Energia (tabela de consumo/dimensionamento)
  const sLayout = buildSchematicSvg(1450, 800, {padding:40, watermark:false});
  const sEth = buildSchematicSvg(1450, 800, {padding:40, watermark:false,
    filterEdge:e=>['gmn','bluenet','eth-generic','eth-ray','eth-furuno'].includes(PORT_TYPES[e.type]?.group)});
  const sN2K = buildN2kBackboneSvg(1350);
  const sEnergia = buildEnergiaTableHtml();

  document.getElementById('print-a3').innerHTML = a3(sLayout,'TUDO') + a3(sEth,'ETHERNET') + a3(sN2K,'N2K BACKBONE') + a3(sEnergia,'ENERGIA');
}

/* =================== RENDER PRINT — LISTA DE CABOS =================== */
function renderCabosMode(){
  const proj=state.project;
  const dateFmt=new Date(proj.date).toLocaleDateString('pt-BR');
  const byKey={};
  proj.edges.forEach(e=>{
    if(!e.length)return;
    const k=`${e.type}|${e.length}`;
    if(!byKey[k]) byKey[k]={type:e.type,length:e.length,qty:0,tags:new Set()};
    byKey[k].qty++;
    if(e.tag) byKey[k].tags.add(e.tag);
  });
  const rows=Object.values(byKey).sort((a,b)=>a.type.localeCompare(b.type)||a.length-b.length);
  let totalM=0;rows.forEach(r=>totalM+=r.length*r.qty);
  let table='';
  if(rows.length===0){
    table='<p style="color:#999;font-style:italic;text-align:center;padding:30pt">Nenhum cabo com comprimento informado.<br>Selecione cabos no canvas e preencha o campo "Comprimento (m)".</p>';
  }else{
    table=`<table><thead><tr><th class="num">#</th><th>Tipo</th><th>Etiqueta</th><th class="qty">Qtd</th><th class="len">Unit. (m/ft)</th><th class="len">Total (m)</th></tr></thead><tbody>`;
    rows.forEach((r,i)=>{
      table+=`<tr><td class="num">${i+1}</td><td><strong>${PORT_TYPES[r.type]?.label||r.type}</strong></td><td>${[...r.tags].join(', ')||'—'}</td><td class="qty">${r.qty}</td><td class="len">${r.length} / ${mToFt(r.length)} ft</td><td class="len">${(r.length*r.qty).toFixed(1)} m</td></tr>`;
    });
    table+=`<tr style="background:#f4f0e6;font-weight:700"><td colspan="5" style="text-align:right">METRAGEM TOTAL</td><td class="len">${totalM.toFixed(1)} m / ${mToFt(totalM)} ft</td></tr>`;
    table+='</tbody></table>';
  }
  const power=computePowerUse();
  const powerBlock = (power.combinedW>0)?`
    <div style="margin-top:18pt;padding:6pt 10pt;border-left:3pt solid #d63a48;background:#fff5f5">
      <strong style="color:#d63a48;font-size:9pt;letter-spacing:.1em;text-transform:uppercase">Power Use</strong>
      <table style="width:100%;font-size:9pt;margin-top:4pt;font-family:Menlo,Consolas,monospace">
        <tr><td><strong>12V</strong></td><td>${power.batt12W.toFixed(0)} W</td><td>${power.batt12A.toFixed(1)} A (continuo)</td><td>${power.max12A.toFixed(1)} A (max)</td></tr>
        <tr><td><strong>24V</strong></td><td>${power.batt24W.toFixed(0)} W</td><td>${power.batt24A.toFixed(1)} A (continuo)</td><td>${power.max24A.toFixed(1)} A (max)</td></tr>
      </table>
    </div>`:'';

  document.getElementById('print-cabos').innerHTML=`
    <div class="cabos-page-inner">
      <h1><img class="print-head-logo" src="logo.png" alt=""><span>Lista de Cabos<small>Wonder BOAT · System Builder · Garmin</small></span></h1>
      <div class="meta-block">
        <strong>Projeto</strong> ${esc(proj.name)||'—'}<br>
        <strong>Embarcação</strong> ${esc(proj.vessel)||'—'}<br>
        <strong>Cliente</strong> ${esc(proj.client)||'—'}<br>
        <strong>Data</strong> ${dateFmt}
      </div>
      ${table}
      ${powerBlock}
      <div class="footer">
        ${proj.notes?'<strong>Notas:</strong> '+esc(proj.notes).replace(/\n/g,'<br>')+'<br><br>':''}
        Projeto técnico segundo normas ABYC E-11, ISO 13297 e ISO 10133.<br>
        Confirmar SKU/medida antes da compra junto à fonte oficial Garmin.
      </div>
      <div class="signature"><span class="seal">WONDER<br>BOAT<br>·IN07169·</span>${esc(proj.installer)||'Lucas de Araújo Souza'} · ${esc(proj.cert)||'IN07169'} · ${esc(proj.company)||'Wonder BOAT | Wonder HUB.AI'}</div>
    </div>
  `;
}


/* =================== BUSCA GLOBAL =================== */
function openSearch(){
  document.getElementById('search-overlay').style.display='flex';
  setTimeout(()=>{const i=document.getElementById('search-input');i.value='';i.focus();renderSearchResults('')},10);
}
function closeSearch(){document.getElementById('search-overlay').style.display='none'}
function renderSearchResults(q){
  q=(q||'').toLowerCase().trim();
  const all=[...CATALOG,...ADAPTERS];
  const matches = q ? all.filter(d=>(d.model+' '+d.sku+' '+(d.family||'')+' '+(d.description||'')+' '+(d.brand||'')).toLowerCase().includes(q)).slice(0,30) : all.slice(0,15);
  const html = matches.length===0?'<div style="padding:20px;text-align:center;color:var(--text-muted)">Nada encontrado.</div>':matches.map(d=>`
    <div class="search-item" data-id="${d.id}" style="padding:10px 18px;border-bottom:1px solid var(--line);cursor:pointer">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:9px;color:var(--garmin-accent);letter-spacing:.15em;font-weight:700">${(d.family||d.brand||'').toUpperCase()} · ${d.category}</div>
          <div style="font-weight:600;color:var(--text);margin-top:2px">${d.model}</div>
          <div style="font-size:10px;color:var(--text-dim);font-family:monospace;margin-top:1px">${d.sku}</div>
        </div>
        <button class="small primary" data-add="${d.id}">+ canvas</button>
      </div>
    </div>
  `).join('');
  document.getElementById('search-results').innerHTML=html;
  document.querySelectorAll('.search-item').forEach(item=>{
    item.addEventListener('click',e=>{
      if(e.target.tagName==='BUTTON') return;
      // adiciona no centro do canvas atual
      const id=item.dataset.id;
      const cx=(window.innerWidth/2-state.ui.pan.x)/state.ui.zoom;
      const cy=(window.innerHeight/2-state.ui.pan.y)/state.ui.zoom;
      addDeviceNode(id, cx-110, cy-30);
      closeSearch();render();
    });
  });
  document.querySelectorAll('[data-add]').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation();
      const id=b.dataset.add;
      const cx=(window.innerWidth/2-state.ui.pan.x)/state.ui.zoom;
      const cy=(window.innerHeight/2-state.ui.pan.y)/state.ui.zoom;
      addDeviceNode(id, cx-110, cy-30);
      closeSearch();render();
    });
  });
}



/* =================== WIZARD =================== */
function openWizard(){document.getElementById('wizard-overlay').style.display='flex'}
function closeWizard(){document.getElementById('wizard-overlay').style.display='none'}

function applyWizardPreset(){
  const t=document.getElementById('wz-type').value;
  const len=document.getElementById('wz-length').value;
  const focus=document.getElementById('wz-focus').value;
  // Limpa projeto atual (mantém metadata)
  state.project.nodes=[];state.project.edges=[];state.project.zones=[];
  // Helm padrão (zona)
  state.project.zones.push({uid:'z'+Math.random().toString(36).slice(2,9),name:'HELM PRINCIPAL',color:'#1d3557',x:120,y:120,w:560,h:380});

  // Define MFD principal por comprimento
  const mfdMap = {small:'gar-echomap-uhd2-93sv', mid:'gar-gpsmap-1243xsv', large:'gar-gpsmap-8612xsv', megayacht:'gar-gpsmap-9019'};
  const mfdId = mfdMap[len];
  const mfd2Id = (focus==='offshore'||focus==='full') && (len==='mid'||len==='large') ? mfdId : null; // 2 helms

  let x=180,y=180;
  const addN=(deviceId,zone)=>{const n={uid:uid(),deviceId,x:x,y:y,zoneUid:zone};state.project.nodes.push(n);x+=240;if(x>900){x=180;y+=180}return n};
  const helmZone=state.project.zones[0].uid;

  // GHC e MFD primário
  if(focus!=='basic') addN('gar-ghc50',helmZone);
  const mfd1=addN(mfdId,helmZone);
  if(mfd2Id){addN(mfd2Id,helmZone)}

  // Radar conforme focus/comprimento
  if(focus==='full'||focus==='offshore'){
    let radarId='gar-fantom-18x';
    if(len==='large') radarId='gar-fantom-24x';
    if(len==='megayacht'||focus==='offshore') radarId='gar-fantom-126';
    addN(radarId);
  }

  // VHF + AIS
  if(focus==='basic'){addN('gar-vhf-215')}
  else {addN('gar-vhf-215-ais');addN('gar-ais-800')}

  // Sondador / Pesca
  if(focus==='fishing'){
    addN('gar-gls10');
    addN('gar-lvs34');
    if(len==='large'||len==='megayacht') addN('gar-gsd-26');
  } else if(focus==='offshore'&&(len==='large'||len==='megayacht')){
    addN('gar-gsd-26');
  }

  // Autopilot
  if(focus==='offshore'||focus==='full'){
    if(len==='small') addN('gar-reactor40-compact');
    else if(t==='sportfishing'||t==='cruiser') addN('gar-reactor40-hyd-1l2');
    else addN('gar-reactor40-hyd-corepack');
  }

  // GPS antena (sempre) — gar-gps-24xd (variante sem HVS) foi removido do catálogo em
  // 2026-08-18 por ser produto fantasma (todo GPS 24xd real já vem com heading sensor);
  // gar-gps-24xd-hvs é o SKU real que sobrou
  addN('gar-gps-24xd-hvs');

  // Network switch se mais de 1 MFD ou radar
  if(mfd2Id || focus==='offshore'){addN('gar-gms-10')}

  // Backbone N2K mínimo: 2 terminadores + 1 alimentação
  const term_m = ADAPTERS.find(a=>/Terminador.*Macho/i.test(a.model));
  const term_f = ADAPTERS.find(a=>/Terminador.*F[êe]mea/i.test(a.model));
  const pwr = ADAPTERS.find(a=>/Cabo Alimenta/i.test(a.model));
  if(term_m){addN(term_m.id)}
  if(term_f){addN(term_f.id)}
  if(pwr){addN(pwr.id)}

  closeWizard();render();
  toast('Projeto base montado · Tipo: '+t+' · '+len+' · '+focus);
}

/* =================== INIT =================== */
function bindWizard(){
  document.getElementById('wz-cancel').addEventListener('click',closeWizard);
  document.getElementById('wz-blank').addEventListener('click',()=>{closeWizard()});
  document.getElementById('wz-confirm').addEventListener('click',applyWizardPreset);
  document.getElementById('wizard-overlay').addEventListener('click',ev=>{if(ev.target.id==='wizard-overlay')closeWizard()});
}
function init(){
  try {
    if(!window.GARMIN || !window.GARMIN.CATALOG){
      window.__bootErrors.push('window.GARMIN nao foi populado - script de dados nao rodou');
      showErrPanel();
      return;
    }
    bindGlobal();
    bindWizard();
    render();
    var vtag = document.getElementById('app-version-tag');
    if(vtag) vtag.textContent = 'v'+APP_VERSION;
    if(typeof showBootOK==='function') showBootOK(CATALOG.length, ADAPTERS.length);
  } catch(e) {
    window.__bootErrors.push('init() falhou: ' + e.message + ' @ ' + (e.stack||'').split('\n')[1]);
    showErrPanel();
    console.error(e);
  }
}
if(document.readyState==='loading') window.addEventListener('DOMContentLoaded',init);
else init();