# Mission 003 — Form Engineering (V0.4 alpha)

Atelier 09 → 06 · Mission 003. Étudier le passage du formulaire au modèle métier, après la sélection (Mission 001) et la mise à jour immuable (Mission 002).

## Parcours

1. Choisir création ou édition et observer `createInitialFormState`.
2. Modifier un champ : inspecter l'événement, `name`, `value`, `prev`, le spread, la clé calculée et l'identité du nouvel objet.
3. Basculer entre annonce et spontanée : vérifier que les valeurs masquées restent dans `FormState`.
4. Prédire la conservation de l'ID et l'exclusion des champs de l'autre branche. Soumettre et rejouer cinq étapes de composition.
5. Examiner la destination du callback et comparer l'objet initial et l'objet soumis. En édition, `dateReponse` n'est pas reprise dans le code de référence. Consigner une explication et reconstruire un formulaire de livres.

## Source et limites

Jobboard, commit `52c514258a5c2fd433df4c9eddf91fce8f14cca7`, `src/components/ApplicationForm.tsx` et `src/components/ApplicationsDashboard.tsx`. Le modèle JavaScript reproduit les transformations et calcule leurs résultats sur des données fictives. L'événement DOM vient du formulaire HTML ; le runtime React, les setters React, le store et l'appel de la fonction originale ne sont pas exécutés. Le déroulé est rejoué, non instrumenté. Les dates par défaut utilisent UTC comme dans la source ; les assertions TypeScript sont absentes du modèle JS. Le modèle ne remplace pas la validation métier. Les contrôles HTML du laboratoire peuvent être plus restrictifs que le code source. Le résultat est affiché, pas enregistré dans Jobboard.

Le patch cumulatif ajoute les missions 002 et 003. Il n'écrase ni addon.js, ni addon.css, ni les dernières évolutions du parcours 001. Le fichier build.py est étendu pour intégrer les deux modules. Aucun changement à Vercel ni au dépôt Jobboard.

## Tests et reconstruction

```sh
node --check form-engineering.js
node --test tests/*.test.cjs
python3 build.py
cp index.html public/index.html # si public/index.html est déjà suivi
npm run dev
```

La démo autonome est issue de la V0.3 initiale. Vérifier les interactions sur la branche contenant les commits récents avant déploiement. Le build historique conserve l'étiquette globale V0.3 ; les missions portent l'étiquette alpha V0.4.
