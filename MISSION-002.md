# Mission 002 — Function Dynamics (V0.4 alpha)

Atelier 09 → 05 · Mission 002. Objectif : comprendre `updateCandidature()` du paramètre à la sauvegarde, en passant par `map`, les références, les callbacks et les effets de bord.

- Source de référence : Jobboard, commit `52c514258a5c2fd433df4c9eddf91fce8f14cca7`, `src/components/ApplicationsDashboard.tsx` (lignes 29–34) et `src/lib/storage.ts` (lignes 104–113).
- Le modèle exécute réellement `map` sur des objets de démonstration réduits et capture les comparaisons. Le rejeu, la pile d'appels, le cache, le stockage et la notification sont pédagogiques ; React et le stockage de Jobboard ne sont pas exécutés.
- Le bouton de la mission est ajouté à l'atelier 09, sans remplacer `addon.js` ou `addon.css`. La note et la prédiction réutilisent le carnet existant.

## Développement

```sh
node --test tests/function-dynamics.test.cjs
node --check function-dynamics.js
python3 build.py
python3 -m http.server 8000 --bind 127.0.0.1
```

Le build réutilise le catalogue existant. Pour une publication, si `public/index.html` est déjà suivi par Git, le synchroniser avec `cp index.html public/index.html`. `vercel.json` est inchangé. La génération de l'HTML autonome conserve le nom V0.3 historique ; la mission est une tranche alpha, pas une release complète.

## Expériences

1. ID valide : une référence remplacée, nouveau tableau, autres références conservées.
2. ID absent : aucune référence remplacée, nouveau tableau et écriture tentée.
3. Double ID : deux positions reçoivent le même objet argument.
4. Échec de stockage : cache modifié avant le try, notification malgré l'erreur.
5. Même statut : nouvelle référence d'objet, contenu éventuellement identique.

## Limites

Le scénario se concentre sur `updateCandidature`, pas sur le cycle d'édition intégral de `ApplicationForm` ou `editCandidature`. Pas d'instrumentation réelle ni de mesure de re-render. La pile est illustrative. Les noms O1, O2… et U ne sont pas des adresses physiques. Aucune écriture dans Jobboard. Aucune mise à niveau des dépendances.
