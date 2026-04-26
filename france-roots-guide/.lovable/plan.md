## Objectifs

Refonte profonde de plusieurs pages pour rendre l'app plus interactive, visuelle et cohérente avec la DA. Aucune nouvelle dépendance backend (tout reste dans le store Zustand local).

## 1. Dashboard interactif (`src/routes/dashboard.tsx`)

Refonte visuelle complète avec graphiques SVG natifs (zéro lib externe pour rester léger):
- **Hero "Solde total"** : grand nombre + mini sparkline SVG animée (12 derniers mois fictifs) en dégradé lemon→lilac.
- **Donut SVG Revenus / Dépenses / Épargne** (3 segments, animé via `stroke-dasharray`), centre = solde net.
- **Bar chart vertical** "Dépenses par catégorie" (5 barres animées, hauteur en %).
- **Ring de progression XP** : cercle SVG avec % vers prochain niveau.
- **Carte "Avantages actifs"** : grille de chips affichant `userBenefits` du store (ce qui répond au point précédent demandé).
- **Tuile suggestion Cleo** conservée.

Toutes les formes utilisent les couleurs du design system (lemon, lilac, vivid-purple, vivid-orange, vivid-green) et apparaissent avec `animate-fade-in` séquencé.

## 2. Timeline progression avec icônes

Remplacer la grille 4 colonnes actuelle par une **vraie timeline horizontale scrollable** :
- Une ligne pointillée traverse les bâtiments.
- Chaque étape = cercle avec icône SVG (avion, banque ⚖, impôts %, logement 🏠, assurance 🛡, transport 🚇, travail 💼, retraite ⏳, enfants 👶, aides 🎁) — réutilise/étend `BuildingSVG` ou crée des mini-icônes inline.
- Cases cochées = remplies couleur du bâtiment + ✓.
- Cases verrouillées = grisées + cadenas.

## 3. Calendrier visuel échéances (`src/routes/deadlines.tsx`)

Garder la liste d'échéances actuelle en haut, **ajouter en bas un mini-calendrier mensuel** :
- Grille 7×N (semaines/jours) sur le mois en cours.
- Jours avec échéance = pastille couleur du bâtiment concerné, taille proportionnelle à l'urgence.
- Tap sur un jour → toast/scroll vers l'échéance correspondante.
- Navigation mois précédent / suivant via flèches.

## 4. Marteau de déblocage (`src/routes/city.tsx` + `src/lib/buildings.ts`)

Mécanique: chaque bâtiment déclare ses `requiredDocs: string[]` (mappés aux noms de documents). Si tous les docs requis sont présents dans `uploadedDocuments`, un **icône marteau 🔨 animé apparaît à droite du bâtiment** même si l'étape précédente n'est pas validée. Tap sur le marteau → marque le bâtiment comme `unlocked` (ajoute en `completedBuildings` les étapes manquantes en amont, ou nouveau flag `manuallyUnlocked`).
- Mapping initial : Banque → "RIB français", Impôts → "Numéro fiscal (SPI)", Logement → "Justificatif de domicile", Travail → "Attestation employeur", etc.
- Le marteau pulse en lemon pour attirer l'œil.

## 5. Chemins pointillés entre tous les bâtiments (`src/routes/city.tsx`)

Le path de base est déjà en pointillés mais les segments complétés sont en trait plein. **Changement :** garder TOUTES les courbes en pointillés, et différencier par couleur uniquement (lemon plein-pointillé pour complété, blanc 8% pour à faire, gradient lemon→lilac animé pour la prochaine étape active).

## 6. Map France régions (`src/routes/onboarding.tsx` Step3)

Remplacer le bloc "Paris, France" par une **vraie carte SVG monochrome de la France** avec les 13 régions cliquables :
- SVG inline avec un `<path>` par région (chemins simplifiés intégrés dans le composant).
- Région survolée/active → fill lemon, autres → bg-surface.
- Au tap : la région choisie remplit `country_moving_to` et un sélecteur de villes correspondantes apparaît (Île-de-France → Paris, Versailles ; PACA → Marseille, Nice, etc.).
- Sortie store : `country_moving_to` (FR) + nouveau champ `region` + champ `city`.

## 7. "Je suis là" + logo mobile (`src/routes/city.tsx`)

- À la place du bâtiment "avion" qui sert juste de point de départ, afficher une **petite tablette/panneau "Je suis là"** avec le logo Concierge et la mascotte Cléo.
- Le logo se déplace le long du chemin : sa position absolue est calculée à partir du dernier bâtiment complété (sur le node correspondant). Animation de translation à chaque déblocage.

## 8. Bouton "Comparer" + tableau comparatif (`src/routes/building.$id.tsx`)

Pour chaque bâtiment qui a des `recos`, ajouter un bouton **"Comparer"** à côté du résultat IA. Click → ouvre une `BottomSheet` avec :
- Liste de toutes les options du `brands` + recos (~5-8 par bâtiment, on enrichit `BUILDING_CONTENT` avec un nouveau champ `comparables`).
- Checkbox sur chaque ligne, sélection multiple.
- Tableau scrollable horizontalement : colonnes = options sélectionnées, lignes = critères (Prix, Délai, Note, Frais, etc.).
- Lemon highlight sur la "meilleure" valeur par ligne.

## 9. Impôts : étapes et prédiction (`src/routes/building.$id.tsx`)

Section dédiée quand `buildingId === "taxes"` : `TaxesPredictionSection` (nouveau dans `src/features/`).
- Lit `payslips` du store.
- Calcule revenu annuel net cumulé, estime brut (× 1.28), estime impôt selon barème 2024 simplifié (tranches 11k/28k/78k/168k → 0/11/30/41/45%).
- Affiche : "Revenu estimé annuel", "Impôt estimé", "Taux moyen", "Taux marginal".
- Liste des étapes officielles (déjà dans `guide`) + alerte si déclaration approche.

## 10. Réordonnancement Aides (`src/lib/theme.ts` + `src/lib/buildings.ts`)

Modifier `buildingOrder` : `["airport", "bank", "aids", "taxes", "housing", "insurance", "transport", "work", "retirement", "children"]`. La logique de déblocage en chaîne suit ce nouvel ordre.

## 11. Profil interactif (`src/routes/profile.tsx`)

Refonte de la BottomSheet "Modifier le profil" en **vrai formulaire UX** :
- Champs édités : prénom, nom, date de naissance, nationalité (chips), région (lien vers map), statut emploi (toggle: Salarié·e / Freelance / Étudiant·e / **Recherche d'emploi**), tranche revenus.
- Sauvegarde via `setOnboarding`.
- **Si statut = "Recherche d'emploi"** : on ajoute un flag `onboarding.is_job_seeking = true` et `PayslipsSection` cesse de demander un upload pour le mois en cours (affiche "Pas d'activité ce mois — tu n'as rien à uploader" + CTA "Je travaille à nouveau").

## Fichiers touchés

```text
src/lib/theme.ts                        # réordonner aides
src/lib/buildings.ts                    # +requiredDocs, +comparables, ordre
src/lib/store.ts                        # +region, +city, +is_job_seeking, +manuallyUnlocked
src/routes/city.tsx                     # pointillés partout, marteau, "Je suis là", logo mobile
src/routes/dashboard.tsx                # refonte complète graphs SVG + timeline icônes
src/routes/deadlines.tsx                # +calendrier mensuel
src/routes/onboarding.tsx               # Step3 = map France SVG
src/routes/building.$id.tsx             # bouton Comparer + section TaxesPrediction
src/routes/profile.tsx                  # form édition interactif
src/features/TaxesPredictionSection.tsx # NEW
src/features/ComparatorSheet.tsx        # NEW
src/features/PayslipsSection.tsx        # respecte is_job_seeking
src/components/FranceMap.tsx            # NEW – SVG régions
src/components/BuildingIcon.tsx         # NEW – mini icônes pour timeline
src/styles.css                          # éventuelles keyframes
```

## Notes techniques

- Aucune dépendance npm ajoutée (SVG inline pour map France et tous les graphs).
- Tout reste compatible TanStack Start strict mode (pas de window.* hors `useEffect`).
- L'état persistant Zustand reste rétrocompatible (nouveaux champs optionnels).
- TypeScript `noEmit` vérifié à la fin.
