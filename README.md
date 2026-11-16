# Software Anatomy Lab

**Learn software like an engineer learns a machine.**

Observe. Predict. Dissect. Experiment. Rebuild.

Laboratoire personnel d'apprentissage de l'ingénierie logicielle par la dissection, la rétro-ingénierie et l'expérimentation. Jobboard constitue le premier cas d'étude. Ce dépôt est indépendant de Jobboard.

## Démarrage rapide

La V0.3 est déjà construite. Python 3 suffit pour la servir localement :

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrir http://localhost:8000. Le site peut aussi être ouvert directement via `index.html`, mais certains navigateurs restreignent le stockage local en mode fichier.

## Développement

Prérequis pour reconstruire : Node.js, npm et Python 3.

```bash
npm install
npm run check
npm run build
npm run dev
```

TypeScript 5.8.3 est utilisé pour parser les fragments. `npm run build` régénère le catalogue et le HTML, ainsi qu'un HTML autonome contenant la vidéo (ignoré par Git). Le catalogue et `index.html` sont versionnés pour permettre une consultation sans compilation.

## Organisation actuelle

| Fichier | Rôle |
| --- | --- |
| `base-v02.html` | Socle des huit ateliers précédents |
| `addon.css` | Styles de Source & Atomic Lab |
| `addon.js` | Neuvième atelier, parcours, expériences, carnet |
| `build-catalog.cjs` | Extraits pédagogiques et génération des AST |
| `catalog.json` | Catalogue généré |
| `build.py` | Assemblage du site |
| `index.html` | Site construit |
| `jobboard_moteur_logiciel.mp4` | Vidéo pédagogique originale (voix coupée par défaut) |
| `LISEZ-MOI.txt` | Notes de livraison V0.3 et limites de la version |

## Méthode pédagogique

Observer → prédire → disséquer → expérimenter → expliquer → reconstruire.

Mission 001 : du clic sur une ligne à l'affichage du DetailDrawer. Le laboratoire distingue les atomes, expressions, fonctions, composants, interactions et système.

## Provenance et confidentialité

Extraits de Jobboard : [commit 52c5142](https://github.com/devmbkm-ay/jobboard/tree/52c514258a5c2fd433df4c9eddf91fce8f14cca7). Ce catalogue contient des extraits sélectionnés, parfois adaptés pour l'analyse syntaxique ; ce n'est pas un clone complet du dépôt. La timeline est scénarisée, pas une trace React. Les données d'exercice sont isolées. Le laboratoire n'écrit pas dans Jobboard.

Conserver ce dépôt privé tant que le code et les données d'exemple n'ont pas été revus pour publication. Aucune licence de diffusion n'a été choisie à ce stade. Ne pas commiter de secrets ni d'exports personnels du carnet.

## Feuille de route

- V0.3 : Source & Atomic Lab, AST, mission de sélection.
- V0.4 : Predict & Experiment, parcours édition, carnet et rappel actif.
- V0.5 : instrumentation et traces réelles sur une copie de travail.
- V0.6 : éditeur et banc de tests.
- V1.0 : import de projets et plateforme générique.
