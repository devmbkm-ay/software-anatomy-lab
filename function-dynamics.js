/* Mission 002: actual JS transformations, replayed trace, isolated store model. */
(function () {
  'use strict';
  const seed = [
    { id: 'demo_001', entreprise: 'Groupe Atlantique', posteVise: 'Développeur Fullstack', statut: 'a_preparer' },
    { id: 'demo_002', entreprise: 'Maintenance digitale', posteVise: 'QA', statut: 'acceptee' },
    { id: 'demo_003', entreprise: 'Webcom', posteVise: 'Marketing Digital', statut: 'a_preparer' }
  ];
  const labels = { a_preparer: 'À préparer', envoyee: 'Envoyée', relancee: 'Relancée', entretien: 'Entretien', acceptee: 'Acceptée', refusee: 'Refusée', sans_reponse: 'Sans réponse' };
  // Reduced records deliberately model only fields used in this exercise.
  function experiment(id, statut, fail = false, duplicate = false) {
    const before = seed.map(c => ({ ...c }));
    if (duplicate) before.push({ ...before[1], entreprise: 'Doublon de test' });
    const old = before.find(c => c.id === id);
    const argument = { ...(old || { id, entreprise: 'Test externe', posteVise: 'Test' }), statut };
    const comparisons = [];
    const next = before.map(candidature => {
      const equal = candidature.id === argument.id;
      const result = equal ? argument : candidature;
      comparisons.push({ candidature, equal, result });
      return result;
    });
    // Emulate saveCandidatures order: cache first, storage attempt, notification even on failure.
    let cache = before, persisted = JSON.stringify(before), notifications = 0, error = null;
    cache = next;
    try {
      if (fail) throw new Error('Échec de sauvegarde simulé');
      persisted = JSON.stringify(next);
    } catch (e) { error = e.message; }
    notifications++;
    return { before, argument, comparisons, next, cache, persisted: JSON.parse(persisted), notifications, error,
      replaced: comparisons.filter(x => x.equal).length,
      newArray: !Object.is(before, next) };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { experiment };
  if (typeof document === 'undefined') return;
  const esc2 = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const j = v => esc2(JSON.stringify(v));
  const reference = 'https://github.com/devmbkm-ay/jobboard/blob/52c514258a5c2fd433df4c9eddf91fce8f14cca7/src/';
  const fresh = () => ({ id:'demo_002', statut:'entretien', fail:false, duplicate:false, prediction:'', durable:'', note:'', trace:null, step:-1, playing:false });
  let state = fresh(), timer = null;
  const renderMission = () => { if (page === 'sourceLab' && s3tab === 'mission2') render(); };
  const stop = () => { if (timer !== null) clearInterval(timer); timer=null; state.playing=false; };
  function stages(t) {
    return [
      { title:'Appel de la fonction', line:0, stack:['updateCandidature'], desc:'L’argument objet est lié au paramètre updatedCandidature. La collection candidatures vient de la portée du Dashboard.' },
      ...t.comparisons.map((c,i) => ({title:`Comparaison ${i+1}/${t.before.length}`, line:2, stack:['updateCandidature','Array.map','callback'], index:i, desc:`${c.candidature.id} === ${t.argument.id} donne ${c.equal}. Le ternaire renvoie ${c.equal?'l’objet argument':'l’objet original'}, sans modifier cet objet.`})),
      {title:'Résultat de map',line:1,stack:['updateCandidature'],desc:'map renvoie un nouveau tableau, même sans correspondance. Les objets non ciblés gardent leur identité.'},
      {title:'Transmission au cache',line:4,stack:['updateCandidature','saveCandidatures'],desc:'Le store reçoit le tableau B. cache = next change sa référence avant l’écriture persistante.'},
      {title:'Tentative de persistance',line:4,stack:['updateCandidature','saveCandidatures'],desc:t.error?'setItem échoue : le catch journalise l’erreur, sans annuler le cache.':'JSON.stringify puis setItem réussissent dans le modèle isolé.'},
      {title:'Notification',line:4,stack:['updateCandidature','saveCandidatures','listener'],desc:'Le store appelle son abonné simulé, même si la persistance a échoué. React pourrait ensuite comparer le snapshot ; aucune mesure de rendu n’est faite ici.'},
      {title:'Retour et actualisation simulée',line:-1,stack:[],desc:'La fonction renvoie undefined (void). La lecture après actualisation utilise la copie persistée, pas l’ancien cache.'}
    ];
  }
  const source = [
    'const updateCandidature = (updatedCandidature: Candidature) => {',
    '    const updatedCandidatures = candidatures.map(candidature =>',
    '        candidature.id === updatedCandidature.id ? updatedCandidature : candidature',
    '    );',
    '    saveCandidatures(updatedCandidatures);',
    '};'
  ];
  const btn = (a,txt,disabled=false,cls='') => `<button type="button" data-m2="${a}" class="${cls}" ${disabled?'disabled':''}>${txt}</button>`;
  const opt = (value,label,selected) => `<option value="${esc2(value)}" ${selected===value?'selected':''}>${esc2(label)}</option>`;
  const gear = (x,y,angle,color) => `<g transform="translate(${x} ${y}) rotate(${angle})">${Array.from({length:12},(_,i)=>`<rect x="-4" y="-29" width="8" height="9" rx="1" fill="${color}" transform="rotate(${i*30})"/>`).join('')}<circle r="22" fill="#182a32" stroke="${color}" stroke-width="2"/><circle r="14" fill="none" stroke="${color}" stroke-opacity=".5"/></g><text x="${x}" y="${y+5}" text-anchor="middle" font-size="14" fill="#e4edeb">===</text>`;
  function diagram(t, examined, assembled) {
    const list=t?.before || (state.duplicate?[...seed,{...seed[1],entreprise:'Doublon de test'}]:seed);
    const w=680, dx=160, offset=(w-list.length*dx)/2;
    return `<svg viewBox="0 0 680 250" role="img" aria-label="Comparateurs successifs et références avant après" class="m2diagram"><text x="14" y="18" class="m2svgtext">TABLEAU A · original</text>${list.map((c,i)=>{const x=offset+i*dx+80, passed=i<examined, match=passed&&t.comparisons[i].equal,col=!passed?'#52666e':match?'#64dac4':'#8eabb5',fromRef='O'+(i+1),toRef=match?'U':fromRef;return `<rect x="${x-70}" y="30" width="140" height="48" rx="7" fill="#20343d" stroke="#52666e"/><text x="${x}" y="49" class="m2svgtext" text-anchor="middle">${esc2(c.entreprise.length>21?c.entreprise.slice(0,19)+'…':c.entreprise)}</text><text x="${x}" y="65" class="m2svgmuted" text-anchor="middle">${fromRef} · ${esc2(c.id)}</text><path d="M${x} 78 V99 M${x} 157 V181" stroke="${col}" stroke-width="${passed?3:1}" stroke-dasharray="${passed?'0':'4 4'}"/>${gear(x,128,passed?examined*25:0,col)}<rect x="${x-70}" y="182" width="140" height="42" rx="7" fill="${match?'#214940':'#20343d'}" stroke="${col}"/><text x="${x}" y="199" text-anchor="middle" class="m2svgtext">${passed?(match?'true → U':'false → '+toRef):'En attente'}</text><text x="${x}" y="215" text-anchor="middle" class="m2svgmuted">${passed?esc2(labels[t.comparisons[i].result.statut]):'—'}</text>`}).join('')}<text x="14" y="244" class="m2svgtext">${assembled?'TABLEAU B · nouvelle référence':'SORTIES DU CALLBACK · en construction'}</text></svg>`;
  }
  function table(list, title, refs) {return `<div class="m2tablebox"><h4>${title}</h4><table><thead><tr><th>Objet</th><th>Entreprise</th><th>Statut</th></tr></thead><tbody>${list.map((c,i)=>`<tr><td><code>${refs[i]}</code></td><td>${esc2(c.entreprise)}</td><td>${esc2(labels[c.statut]||c.statut)}</td></tr>`).join('')}</tbody></table></div>`;}
  function mission() {
    const t=state.trace, all=t?stages(t):[], current=t?all[state.step]:null, n=t?.before.length||0;
    const examined=t?Math.min(n,Math.max(0,state.step)):0, assembled=t&&state.step>=n+1, cacheOn=t&&state.step>=n+2, persistedOn=t&&state.step>=n+3, notified=t&&state.step>=n+4, finished=t&&state.step===all.length-1;
    const base=t?.before||seed, ids=base.map((_,i)=>'O'+(i+1));
    const mem=t&&assembled?table(t.next,'Tableau B · résultat',t.next.map((c,i)=>Object.is(c,t.argument)?'U':ids[i])):'<div class="m2empty">Résultat masqué jusqu’à la fin de map.</div>';
    const stack=current?.stack||[];
    return `<div class="sal3 m2" id="m2-workbench"><div class="labhead"><div><span class="eyebrow">Atelier 09 / V0.4 en développement</span><h1>Mission 002 · Function Dynamics</h1><p>De l’argument à la persistance — updateCandidature()</p></div><span class="tag">JS EXÉCUTÉ · REPLAY PÉDAGOGIQUE</span></div><div class="subtabs"><button type="button" data-s3="tab" data-tab="mission">← Mission 001</button><button type="button" data-s3="unit" data-id="update">Sources & AST ↗</button><button type="button" data-s3="tab" data-tab="notes">Carnet ↗</button></div><p class="m2intro">Le modèle exécute réellement <code>map</code> en JavaScript puis rejoue une trace capturée. Les données sont fictives et réduites ; cache, stockage et notification sont simulés, pas le runtime React. Aucun accès au storage de Jobboard.</p>
    <div class="m2grid"><section class="spane"><span class="eyebrow">01 / Préparer</span><h3>Injecte un argument</h3><label for="m2id">Identifiant cible</label><select id="m2id" ${t?'disabled':''}>${[...seed.map(c=>[c.id,c.entreprise+' · '+c.id]),['missing','ID absent · missing']].map(([v,l])=>opt(v,l,state.id)).join('')}</select><label for="m2statut">Nouveau statut</label><select id="m2statut" ${t?'disabled':''}>${Object.entries(labels).map(([v,l])=>opt(v,l,state.statut)).join('')}</select><label class="m2check"><input id="m2fail" type="checkbox" ${state.fail?'checked':''} ${t?'disabled':''}> Simuler un échec de setItem</label><label class="m2check"><input id="m2duplicate" type="checkbox" ${state.duplicate?'checked':''} ${t?'disabled':''}> Injecter un doublon de demo_002</label><div class="m2prediction"><h4>Prédire avant de lancer</h4><label for="m2prediction">Combien d’objets map remplacera-t-il ?</label><select id="m2prediction" ${t?'disabled':''}>${[['','Choisir'],['0','0'],['1','1'],['2','2'],['3','3'],['4','4']].map(([v,l])=>opt(v,l,state.prediction)).join('')}</select><label for="m2durable">Après la sauvegarde, cache et stockage auront-ils le même contenu ?</label><select id="m2durable" ${t?'disabled':''}>${[['','Choisir'],['yes','Oui'],['no','Non']].map(([v,l])=>opt(v,l,state.durable)).join('')}</select><label for="m2note">Pourquoi ? (facultatif)</label><textarea id="m2note" rows="2" ${t?'disabled':''} placeholder="Mon hypothèse…">${esc2(state.note)}</textarea></div><div class="controls3">${btn('start','Lancer l’expérience',!!t,'primary')}${btn('reset','Nouvelle expérience',false,'ghost')}</div><p id="m2hint" role="status" class="small3">${t?'Trace prête. Avance ou utilise la lecture automatique.':'Deux prédictions sont nécessaires.'}</p></section>
    <section class="spane"><span class="eyebrow">02 / Disséquer</span><h3>Source Code</h3><a class="filelink" href="${reference}components/ApplicationsDashboard.tsx#L29-L34" target="_blank" rel="noreferrer">Jobboard · commit 52c5142 · lignes 29–34 ↗</a><div class="m2code">${source.map((l,i)=>`<div class="${current?.line===i?'m2active':''}"><span>${29+i}</span><code>${esc2(l)}</code></div>`).join('')}</div><details class="analogy3"><summary>Les petites unités</summary><dl><dt>updatedCandidature</dt><dd>Paramètre formel, lié à l’objet fourni lors de l’appel.</dd><dt>candidatures</dt><dd>Variable de la portée englobante, utilisée par cette fonction (fermeture).</dd><dt>candidature</dt><dd>Paramètre du callback, lié à chaque objet parcouru.</dd><dt>===</dt><dd>Comparaison stricte des identifiants, résultat booléen.</dd><dt>? :</dt><dd>Expression conditionnelle : choisit une référence.</dd><dt>saveCandidatures(...)</dt><dd>Appel qui produit des effets de bord, sans valeur de retour utile.</dd></dl></details><h4>Argument de l’appel</h4>${t?`<pre>${esc2(JSON.stringify(t.argument,null,2))}</pre>`:'<div class="m2empty">Visible dès le lancement.</div>'}<h4>Pile d’appels <small>illustrative</small></h4><div class="m2stack">${stack.length?stack.slice().reverse().map((s,i)=>`<div class="${i===0?'active':''}">${esc2(s)}</div>`).join(''):'<div class="m2empty">Pile vide pour ce scénario</div>'}</div></section></div>
    <section class="spane m2wide"><div class="tokenhead"><div><span class="eyebrow">03 / Mécanisme</span><h3>Transmission et comparaison</h3></div><span class="pill3">${examined}/${t?n:base.length} comparaisons</span></div><div class="m2timeline" aria-label="Étapes de la mission">${(t?all:[{title:'Appel'},{title:'Comparaisons'},{title:'Assemblage'},{title:'Cache'},{title:'Persistance'},{title:'Notification'}]).map((s,i)=>`<button type="button" data-m2="jump" data-step="${i}" ${!t?'disabled':''} aria-pressed="${state.step===i}" class="${t&&i<state.step?'past':''}">${i+1}. ${esc2(s.title)}</button>`).join('')}</div><div class="m2controls">${btn('prev','← Précédent',!t||state.step===0)}${btn('next','Étape suivante →',!t||finished,'primary')}${btn('play',state.playing?'Pause':'Lecture automatique',!t||finished,'ghost')}</div><div class="m2stage" aria-live="polite"><strong>${current?esc2(current.title):'Mécanisme à l’arrêt'}</strong><p>${current?esc2(current.desc):'Choisis un scénario et inscris tes prédictions.'}</p>${current?.index!==undefined?`<code>${j(t.comparisons[current.index].candidature.id)} === ${j(t.argument.id)} → ${t.comparisons[current.index].equal}</code>`:''}</div><details class="analogy3" open><summary>Vue mécanique · comparateurs et transmission</summary>${diagram(t,examined,assembled)}<p class="small3">O1, O2… et U sont des identifiants pédagogiques, pas des adresses mémoire.</p></details></section>
    <section class="spane m2wide"><span class="eyebrow">04 / Références et effets</span><h3>Memory View</h3><div class="m2grid">${table(base,'Tableau A · original',ids)}${mem}</div><div class="m2metrics"><div><small>Object.is(A, B)</small><strong>${assembled?String(Object.is(t.before,t.next)):'—'}</strong></div><div><small>Objets remplacés</small><strong>${assembled?t.replaced:'—'}</strong></div><div><small>Cache</small><strong>${cacheOn?'B':'A'}</strong></div><div><small>Écriture storage</small><strong>${persistedOn?(t.error?'Échec':'Réussie'):'En attente'}</strong></div><div><small>Notifications (modèle)</small><strong>${notified?t.notifications:0}</strong></div><div><small>Valeur de retour</small><strong>${finished?'undefined':'—'}</strong></div></div>${persistedOn?`<div class="m2grid">${table(t.cache,'Contenu en mémoire',t.cache.map((c,i)=>Object.is(c,t.argument)?'U':ids[i]))}${table(t.persisted,'Contenu durable après relecture',t.persisted.map(()=> 'copie'))}</div><p class="m2stage">${t.error?'Le cache conserve B ; le stockage garde A. Une actualisation peut faire disparaître les modifications.':'Les contenus concordent ; une nouvelle lecture JSON recrée les références.'} ${t.replaced===0?'Aucun objet n’a été remplacé, mais une sauvegarde a tout de même été tentée.':''}</p>`:''}${assembled?`<p class="m2feedback ${Number(state.prediction)===t.replaced?'good':'bad'}">Prédiction des remplacements : ${Number(state.prediction)===t.replaced?'correcte':'à revoir'} (${t.replaced}).</p>`:''}${persistedOn?`<p class="m2feedback ${(state.durable==='yes')===(JSON.stringify(t.cache)===JSON.stringify(t.persisted))?'good':'bad'}">Prédiction cache / contenu durable : ${(state.durable==='yes')===(JSON.stringify(t.cache)===JSON.stringify(t.persisted))?'correcte':'à revoir'}. Les contenus ${JSON.stringify(t.cache)===JSON.stringify(t.persisted)?'concordent':'diffèrent'} même si les références sont distinctes.</p>`:''}<a class="filelink" href="${reference}lib/storage.ts#L104-L113" target="_blank" rel="noreferrer">Source : saveCandidatures ↗</a></section>
    ${finished?`<section class="spane m2wide"><span class="eyebrow">05 / Restituer</span><h3>Explique puis reconstruis</h3>${s3note('mission2:explanation','Mon explication','Pourquoi map crée-t-il B même si aucun ID ne correspond ? Pourquoi le cache peut-il diverger du stockage ?')}<details class="analogy3"><summary>Défi de reconstruction (sans solution)</summary><p>Écris une fonction de mise à jour d’un livre par ID, puis une version qui renvoie aussi le nombre d’objets remplacés. Teste un ID absent, un doublon et la conservation des références. Sépare ensuite transformation pure et persistance.</p></details><div class="controls3"><button type="button" data-s3="tab" data-tab="notes">Ouvrir le carnet</button></div></section>`:''}<p class="small3">La mission isole updateCandidature ; les setters du formulaire et le rendu réel de React seront étudiés séparément. Les objets en entrée ne représentent pas le modèle Candidature complet.</p></div>`;
  }
  const original = renders.sourceLab;
  renders.sourceLab = function () {
    if (s3tab === 'mission2') return mission();
    return original().replace('<a class="filelink" style="margin:auto 0 auto auto"','<button type="button" data-s3="tab" data-tab="mission2" class="m2entry">05 · Mission 002 — Function Dynamics</button><a class="filelink" style="margin:auto 0 auto auto"');
  };
  document.addEventListener('change', e => {
    if (state.trace) return;
    const el=e.target;
    const keys={m2id:'id',m2statut:'statut',m2fail:'fail',m2duplicate:'duplicate',m2prediction:'prediction',m2durable:'durable'};
    if (keys[el.id]) state[keys[el.id]]=el.type==='checkbox'?el.checked:el.value;
  });
  document.addEventListener('input', e => { if(e.target.id==='m2note'&&!state.trace)state.note=e.target.value; });
  document.addEventListener('click', e=>{
    const control=e.target.closest('[data-m2]');
    if (!control) { if (state.playing) stop(); return; }
    const action=control.dataset.m2;
    if(action==='start'){
      if(!state.prediction||!state.durable){document.getElementById('m2hint').textContent='Choisis les deux prédictions avant d’exécuter.';return;}
      stop();state.trace=experiment(state.id,state.statut,state.fail,state.duplicate);state.step=0;
      s3notes['mission2:prediction']=`ID ${state.id}, statut ${state.statut}, échec ${state.fail}, doublon ${state.duplicate} : ${state.prediction} remplacement(s), contenus identiques : ${state.durable==='yes'?'oui':'non'}. ${state.note}`;s3store();
    } else if(action==='reset'){stop();state=fresh();}
    else if(!state.trace)return;
    else if(action==='play'){
      if(state.playing){stop();}else{state.playing=true;timer=setInterval(()=>{if(page!=='sourceLab'||s3tab!=='mission2'){stop();return;}state.step=Math.min(stages(state.trace).length-1,state.step+1);if(state.step===stages(state.trace).length-1)stop();renderMission();},1000);}
    }else{stop();const end=stages(state.trace).length-1;state.step=action==='next'?Math.min(end,state.step+1):action==='prev'?Math.max(0,state.step-1):action==='jump'?Math.max(0,Math.min(end,Number(control.dataset.step))):state.step;}
    renderMission();
  });
})();
