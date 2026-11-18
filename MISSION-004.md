# Mission 004 — Storage Engineering (V0.4 alpha)

Atelier 09 → 07. Dissèque le lien entre `saveCandidatures`, `localStorage`, les snapshots stables et `useSyncExternalStore`.

## Parcours

1. Choisir un incident à explorer : hydratation, sauvegarde locale, échec d'écriture, autre onglet, JSON corrompu ou filtration de données invalides.
2. Prédire les notifications et le contenu durable avant de lancer l'expérience.
3. Rejouer le scénario étape par étape ; comparer le cache, la copie persistée, l'état `hasHydrated` et les références.
4. Revenir au vrai code de `storage.ts`, expliquer le mécanisme et reconstruire un store minimal.

## Limites pédagogiques

- Le modèle exécute réellement `JSON.parse`, `JSON.stringify`, `filter`, des affectations et les conditions essentielles, **sans accéder au vrai `localStorage`**.
- Les notifications et le comportement du composant React sont des événements **modélisés**, pas des traces de React ni de plusieurs onglets réels.
- La validation reproduit les tests de champs exigés dans le `storage.ts` de référence, sans imposer les champs propres au mode `annonce` que cette fonction ne valide pas elle-même.
- L'événement natif `storage` ne se déclenche pas dans l'onglet qui effectue son propre `setItem` ; `saveCandidatures` notifie directement ses abonnés.
- Une sauvegarde peut échouer tout en ayant modifié le cache et averti les abonnés. Le contenu durable peut alors diverger du cache.

## Vérification

```bash
node --test tests/*.test.cjs
node --check storage-engineering.js
python3 build.py
cp index.html public/index.html
python3 -m http.server 8000 --bind 127.0.0.1
```

La mission est un ajout autonome aux Missions 001–003. Aucune écriture dans Jobboard. Le code source de référence est accessible depuis l'interface.
