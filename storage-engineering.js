/* Mission 004 — isolated, deterministic storage model. No browser storage mutations. */
(function () {
  'use strict';
  const seed = [
    {id:'demo_001',mode:'annonce',entreprise:'Agence Digitale',posteVise:'Développeur',contrat:'cdi',statut:'envoyee',priorite:'haute',dateCreation:'2026-11-15',sourceAnnonce:'linkedin'},
    {id:'demo_002',mode:'spontanee',entreprise:'Cabinet Growth',posteVise:'QA',contrat:'stage',statut:'a_preparer',priorite:'moyenne',dateCreation:'2026-11-16'}
  ];
  const validContracts = ['alternance','cdd','cdi','stage','freelance'];
  const validStatuses = ['a_preparer','envoyee','relancee','entretien','acceptee','refusee','sans_reponse'];
  const validPriorities = ['haute','moyenne','basse'];
  function isCandidature(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    return typeof value.id === 'string' && typeof value.entreprise === 'string' &&
      typeof value.posteVise === 'string' && typeof value.contrat === 'string' &&
      validContracts.includes(value.contrat) && typeof value.statut === 'string' &&
      validStatuses.includes(value.statut) && typeof value.dateCreation === 'string' &&
      typeof value.priorite === 'string' && validPriorities.includes(value.priorite) &&
      (value.mode === 'annonce' || value.mode === 'spontanee');
  }
  const clone = value => JSON.parse(JSON.stringify(value));
  const scenarioLabels = {
    hydrate:'Premier affichage côté client', save:'Sauvegarde dans cet onglet',
    fail:'Échec de la persistance', remote:'Modification depuis un autre onglet',
    broken:'JSON corrompu', invalid:'Tableau avec une candidature invalide'
  };
  function runScenario(kind = 'hydrate') {
    if (!Object.hasOwn(scenarioLabels, kind)) throw new Error('Scénario inconnu');
    const durableStart = JSON.stringify(seed);
    let durable = durableStart, cache = [], reference = 'E0', hasHydrated = false;
    let notifications = 0, reads = 0, renders = 0, error = null, nextReference = 1;
    const frames = [];
    const snapshot = (title, explanation, code, active) => {
      frames.push({title,explanation,code,active,cache:clone(cache),durable,
        reference,hasHydrated,notifications,reads,renders,error});
    };
    const read = () => {
      reads++;
      if (durable === null) return [];
      try {
        const parsed = JSON.parse(durable);
        if (!Array.isArray(parsed)) {error = 'La racine JSON n’est pas un tableau';return [];}
        return parsed.filter(isCandidature);
      } catch (_) {error = 'JSON.parse a échoué';return [];}
    };
    const getSnapshot = () => {
      if (!hasHydrated) {
        cache = read();
        reference = `R${nextReference++}`;
        hasHydrated = true;
      }
      return reference;
    };
    snapshot('Point de départ', 'Cache EMPTY_CANDIDATURES ; stockage durable fictif déjà rempli. Aucun composant abonné n’a encore été notifié.', 'let cache = EMPTY_CANDIDATURES; let hasHydrated = false;', 'cache');
    snapshot('Snapshot serveur stable', 'getServerCandidaturesSnapshot renvoie toujours la référence E0, sans accéder au stockage du navigateur.', 'return EMPTY_CANDIDATURES;', 'react');
    getSnapshot();
    snapshot('Hydratation du client', 'Premier getSnapshot : lecture, JSON.parse, filter(isCandidature), puis hasHydrated = true.', 'if (!hasHydrated) { cache = readFromLocalStorage(); hasHydrated = true; }', 'read');
    getSnapshot();
    snapshot('Référence inchangée', 'Deuxième getSnapshot : la référence reste identique ; aucune nouvelle lecture.', 'return cache;', 'react');
    if (kind === 'hydrate') {
      snapshot('Bilan', 'La référence stable évite un nouveau snapshot à chaque lecture. Le nombre de rendus réels de React n’est pas mesuré.', 'getCandidaturesSnapshot()', 'react');
      return {kind,frames,final:frames.at(-1)};
    }
    if (kind === 'save' || kind === 'fail') {
      const next = cache.map(c => c.id === 'demo_001' ? {...c,statut:'entretien'} : c);
      cache = next;
      reference = `R${nextReference++}`;
      snapshot('Cache remplacé', 'saveCandidatures reçoit un nouveau tableau et remplace le cache AVANT toute tentative de persistance.', 'cache = next;', 'cache');
      if (kind === 'fail') {
        error = 'QuotaExceededError simulée';
        snapshot('Écriture refusée', 'setItem lance une exception. Le catch journalise l’erreur, mais ne restaure pas le cache.', 'try { localStorage.setItem(...) } catch (error) { console.error(error) }', 'storage');
      } else {
        durable = JSON.stringify(next);
        snapshot('Écriture persistante', 'JSON.stringify transforme la collection, puis setItem réussit dans ce scénario.', 'localStorage.setItem(STORAGE_KEY, JSON.stringify(next));', 'storage');
      }
      notifications++;
      snapshot('Notification locale', 'Le Set de listeners est appelé même après une erreur de persistance. Aucun événement storage natif n’est déclenché dans cet onglet.', 'listeners.forEach(listener => listener());', 'notify');
      renders++;
      snapshot('Nouvelle observation', 'Le composant abonné consulte le snapshot. Le compteur représente une mise à jour modélisée, pas un rendu React mesuré.', 'useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)', 'react');
    } else {
      if (kind === 'remote') durable = JSON.stringify(seed.map(c=>c.id==='demo_002'?{...c,statut:'relancee'}:c));
      if (kind === 'broken') durable = '{JSON cassé';
      if (kind === 'invalid') durable = JSON.stringify([...seed,{id:'intrus',mode:'annonce',entreprise:'Intrus',contrat:'interdit'}]);
      snapshot('Écriture externe simulée', 'Le contenu durable change, mais le cache du premier onglet reste momentanément inchangé.', '/* Un autre onglet modifie la même clé */', 'storage');
      hasHydrated = false;
      notifications++;
      snapshot('Événement storage reçu', 'Pour la clé surveillée, le gestionnaire invalide le cache et prévient ce composant abonné.', 'hasHydrated = false; callback();', 'notify');
      getSnapshot();
      snapshot('Relecture et validation', kind==='broken'?'JSON.parse échoue : readFromLocalStorage retourne [].':kind==='invalid'?'filter(isCandidature) écarte l’entrée incomplète.':'Le contenu externe est relu et filtré ; un nouveau tableau est créé.', 'return parsed.filter(isCandidature);', 'read');
      renders++;
      snapshot('Nouvelle observation', 'Le snapshot porte une nouvelle référence. Le compteur de mise à jour reste pédagogique.', 'useSyncExternalStore(...);', 'react');
    }
    snapshot('Bilan', kind==='fail'?'Attention : cache et stockage divergent malgré la notification.':'Compare la valeur durable, le cache et la stabilité de référence à chaque étape.', '/* Explique ce qui a changé, puis reconstruis */', 'react');
    return {kind,frames,final:frames.at(-1)};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {runScenario,isCandidature,seed};
  if (typeof document === 'undefined') return;
  const h = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pretty = value => h(JSON.stringify(value,null,2));
  const source = 'https://github.com/devmbkm-ay/jobboard/blob/main/src/lib/storage.ts';
  const choices = [
    ['hydrate','Démarrage / hydratation'],['save','Écriture locale'],['fail','Panne de stockage'],
    ['remote','Autre onglet'],['broken','JSON corrompu'],['invalid','Donnée invalide']
  ];
  const answers = {
    hydrate:{notified:'no',equal:'yes'},save:{notified:'yes',equal:'yes'},
    fail:{notified:'yes',equal:'no'},remote:{notified:'yes',equal:'yes'},
    broken:{notified:'yes',equal:'no'},invalid:{notified:'yes',equal:'no'}
  };
  // 'equal' means parsed durable data and cache have equivalent content, not equal references.
  const initialState = () => ({kind:'hydrate',notified:'',equal:'',hypothesis:'',trace:null,step:0});
  let state = initialState();
  const active = () => page === 'sourceLab' && s3tab === 'mission4';
  const btn = (action,label,extra='') => `<button type="button" data-m4="${action}" ${extra}>${label}</button>`;
  const finalContents = frame => {
    if (frame.durable === null) return [];
    try {return JSON.parse(frame.durable);}catch (_) {return 'JSON non analysable';}
  };
  function summary(frame) {
    const durable = finalContents(frame);
    const equal = JSON.stringify(frame.cache) === JSON.stringify(durable);
    return {durable,equal};
  }
  function renderMission() {
    const t=state.trace,frame=t?.frames[state.step],last=t?.final;
    const result=last&&summary(last),answered=t&&state.step===t.frames.length-1;
    const timelineSteps=t?t.frames.map((f,i)=>btn('jump',`${i+1}. ${h(f.title)}`,`data-step="${i}" aria-pressed="${state.step===i}"`)).join(''):'';
    const timelineBody=t?`<div class="m4timeline">${timelineSteps}</div>
      <div class="m4stage" aria-live="polite"><h3>${h(frame.title)}</h3><p>${h(frame.explanation)}</p><pre>${h(frame.code)}</pre></div>
      <div class="m4actions">${btn('prev','← Reculer',state.step===0?'disabled':'')}${btn('next','Avancer →',state.step===t.frames.length-1?'disabled':'')}</div>
      <div class="m4compare"><div><h4>Cache (${h(frame.reference)})</h4><pre>${pretty(frame.cache)}</pre></div>
      <div><h4>Contenu durable (JSON décodé)</h4><pre>${frame.durable===null?'Clé absente':pretty(summary(frame).durable)}</pre></div></div>`
      :'<p class="small3">La chronologie et les données sont masquées jusqu’à ta prédiction.</p>';
    return `<div class="sal3 m4" id="m4-workbench"><div class="labhead"><div><span class="eyebrow">Atelier 09 / V0.4 alpha</span><h1>Mission 004 · Storage Engineering</h1><p>Le circuit du cache à la persistance, puis aux abonnés React</p></div><span class="tag">SIMULATION LOCALE · SANS ÉCRITURE</span></div>
    <div class="subtabs"><button type="button" data-s3="tab" data-tab="mission">Mission 001</button><button type="button" data-s3="tab" data-tab="mission2">Mission 002</button><button type="button" data-s3="tab" data-tab="mission3">Mission 003</button><button type="button" data-s3="tab" data-tab="notes">Carnet</button></div>
    <p class="m4lead">Comme dans un moteur mécanique, distingue les pièces : <strong>cache</strong> (mémoire de travail), <strong>localStorage</strong> (réservoir durable), <strong>listeners</strong> (transmission du signal) et <strong>snapshot</strong> (capteur d'état). Prédis avant d'actionner le mécanisme.</p>
    <div class="m4grid"><section class="spane"><span class="eyebrow">01 / Régler le banc d'essai</span><h3>Choisis une expérience</h3><div class="m4scenarios">${choices.map(([v,l])=>btn('scenario',h(l),`data-kind="${v}" aria-pressed="${state.kind===v}" ${t?'disabled':''}`)).join('')}</div>
    <p class="small3">${h(scenarioLabels[state.kind])}. Les données de démonstration sont isolées de Jobboard et de ton navigateur.</p>
    <label for="m4notified">Un abonné sera-t-il notifié durant ce scénario ?</label><select id="m4notified" ${t?'disabled':''}><option value="">Mon hypothèse…</option><option value="yes" ${state.notified==='yes'?'selected':''}>Oui</option><option value="no" ${state.notified==='no'?'selected':''}>Non</option></select>
    <label for="m4equal">À la fin, cache et contenu durable seront-ils identiques (en valeur) ?</label><select id="m4equal" ${t?'disabled':''}><option value="">Mon hypothèse…</option><option value="yes" ${state.equal==='yes'?'selected':''}>Oui</option><option value="no" ${state.equal==='no'?'selected':''}>Non</option></select>
    <label for="m4hypothesis">Pourquoi ? (facultatif)</label><textarea id="m4hypothesis" rows="3" ${t?'disabled':''} placeholder="Je prédis que…">${h(state.hypothesis)}</textarea>
    <div class="m4actions">${btn('start','Lancer mon expérience',!state.notified||!state.equal||t?'disabled':'')}${btn('reset','Nouvelle expérience')}</div>
    ${answered?`<div class="m4note"><strong>Résultats des prédictions :</strong><p class="${state.notified===answers[state.kind].notified?'m4good':'m4bad'}">Notification : ${state.notified===answers[state.kind].notified?'correcte':'à revoir'}.</p><p class="${state.equal===(result.equal?'yes':'no')?'m4good':'m4bad'}">Accord des contenus : ${state.equal===(result.equal?'yes':'no')?'correct':'à revoir'}.</p></div>`:''}
    </section><section class="spane"><span class="eyebrow">02 / Capteurs en temps réel</span><h3>Tableau d'instrumentation</h3>${frame?`<div class="m4meters">${[['Référence du cache',frame.reference],['hasHydrated',frame.hasHydrated],['Lectures persistantes',frame.reads],['Notifications',frame.notifications],['Mises à jour modélisées',frame.renders],['Erreur',frame.error??'aucune']].map(([k,v])=>`<div class="m4meter"><small>${h(k)}</small><strong>${h(v)}</strong></div>`).join('')}</div>`:'<p class="small3">Les capteurs s’allument après ta prédiction.</p>'}
    <div class="m4flow">${[['cache','Cache'],['storage','Stockage'],['notify','Abonnés'],['read','Lecture'],['react','React']].map(([k,l])=>`<span class="${frame?.active===k?'current':''}">${l}</span>`).join('')}</div>
    <details class="analogy3"><summary>Voir les correspondances mécaniques</summary><p>Cache : volant d’inertie. Stockage : réservoir. Notifications : courroie de transmission. Snapshot : jauge. Ces analogies aident à visualiser le flux, mais ne remplacent pas le comportement exact du code.</p></details>
    <a class="filelink" target="_blank" rel="noreferrer" href="${source}">Lire storage.ts dans Jobboard ↗</a></section></div>
    <section class="spane m4wide"><span class="eyebrow">03 / Ouvrir et observer</span><h3>Timeline du circuit</h3>${timelineBody}</section>
    <section class="spane m4wide"><span class="eyebrow">04 / Expliquer et reconstruire</span>${s3note('mission4:explanation','Mon diagnostic','Pourquoi le cache change-t-il avant setItem ? Quand hasHydrated redevient-il false ? En quoi une valeur égale peut-elle avoir une autre référence ?')}<details><summary>Défi de reverse engineering</summary><p>Sans regarder le modèle, reconstruis un petit store de livres avec getSnapshot(), subscribe() et save(). Simule ensuite un échec de stockage et une donnée JSON invalide. Vérifie que la notification locale ne dépend pas de l’événement storage.</p></details><p class="small3">Modèle pédagogique : ni React, ni de véritables événements inter-onglets, ni le localStorage du navigateur ne sont instrumentés.</p></section></div>`;
  }
  const original = renders.sourceLab;
  renders.sourceLab = function () {
    if (s3tab === 'mission4') return renderMission();
    const rendered=original();
    const entry='<button type="button" data-s3="tab" data-tab="mission4" class="m2entry">07 · Mission 004 — Storage Engineering</button>';
    const anchor='<a class="filelink" style="margin:auto 0 auto auto"';
    return rendered.includes(anchor)?rendered.replace(anchor,entry+anchor):rendered.replace('<div class="subtabs">','<div class="subtabs">'+entry);
  };
  document.addEventListener('input',e => {
    if (!active() || state.trace) return;
    if (e.target.id==='m4hypothesis') state.hypothesis=e.target.value;
  });
  document.addEventListener('change',e => {
    if (!active() || state.trace) return;
    if (e.target.id==='m4notified') state.notified=e.target.value;
    if (e.target.id==='m4equal') state.equal=e.target.value;
    if (e.target.id==='m4notified'||e.target.id==='m4equal') render();
  });
  document.addEventListener('click',e => {
    const b=e.target.closest('[data-m4]');
    if (!b || !active()) return;
    const action=b.dataset.m4;
    if (action==='reset') state=initialState();
    if (action==='scenario' && !state.trace) state={...initialState(),kind:b.dataset.kind};
    if (action==='start' && !state.trace && state.notified && state.equal) {
      state.trace=runScenario(state.kind);state.step=0;
      s3notes['mission4:prediction']=`Scénario ${state.kind}, notifications ${state.notified}, contenus égaux ${state.equal}. ${state.hypothesis}`;
      s3store();
    }
    if (state.trace && action==='next') state.step=Math.min(state.trace.frames.length-1,state.step+1);
    if (state.trace && action==='prev') state.step=Math.max(0,state.step-1);
    if (state.trace && action==='jump') state.step=Math.max(0,Math.min(state.trace.frames.length-1,Number(b.dataset.step)));
    render();
  });
})();
