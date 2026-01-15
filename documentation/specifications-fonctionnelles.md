
# Spécifications Fonctionnelles — Application Suivi de Remplissage des Conteneurs

## 1. Contexte & Objectifs

L’application a pour objectif de permettre le **suivi de l’état de remplissage (vide/plein)** des conteneurs d’une déchèterie.  
Deux profils principaux utilisent la solution :

- **Usagers / Agents sur site** : déclarer l’état « Vide » ou « Plein » d’un conteneur.
- **Gérants de la déchèterie** : administrer les conteneurs, les types de déchets et les informations de la déchèterie.

### Objectifs mesurables

- Temps de mise à jour d’un statut ≤ 2 s (90ᵉ percentile).
- Fiabilité du statut courant ≥ 95 % (mécanismes d’anti-spam, quorum, historisation).
- Traçabilité 100 % des changements (horodatage, auteur, source).

## 2. Portée (In Scope / Out of Scope)

**In scope**

- Gestion multi-déchèteries (option activable).
- Catalogue des **types de déchets** (bois, gravats, carton, DEEE, etc.).
- Gestion des **conteneurs** : création, activation/désactivation, capacité nominale, affectation à une déchèterie.
- **Déclaration d’état** « Vide » / « Plein » par les utilisateurs (authentifiés ou en mode kiosque).
- **Tableau de bord** gérant (taux de conteneurs pleins, alertes, historique).
- **Historique** des changements (journal / timeline).

**Out of scope (v1)**

- Mesure analogique/IoT (ultrasons, LoRa, etc.) — traité en V2.
- Paiement, réservation de créneau, contrôle d’accès physique.
- Gestion fine des stocks de bennes (logistique sortante).

## 3. Rôles & Droits

- **Visiteur (anonyme)** : lecture du statut public si activé, pas de déclaration.
- **Utilisateur authentifié** : lecture + **déclaration Vide/Plein** (par conteneur).
- **Agent** : idem utilisateur + signalement d’anomalies.
- **Gérant** : administration complète (déchèterie, conteneurs, types, utilisateurs).
- **Super‑admin** (option multi‑sites) : gestion de plusieurs déchèteries.

## 4. Parcours Utilisateurs (User Journeys)

### 4.1 Déclarer un conteneur « Plein »

1. L’utilisateur ouvre l’appli (web/mobile responsive).
2. Il sélectionne la déchèterie (ou géolocalisation -> déchèterie la plus proche).
3. Liste des conteneurs → filtre par type de déchet.
4. Sur un conteneur, il clique **« Plein »** → confirmation.
5. La carte/liste se met à jour en temps réel.

### 4.2 Remettre « Vide »

1. Un agent après enlèvement clique **« Vide »**.
2. Une entrée d’historique est créée.

### 4.3 Gérer les conteneurs (Gérant)

1. Accès admin.
2. CRUD des conteneurs (nom, type, capacité, état initial, visibilité publique).
3. Consultation du tableau de bord (KPI, alertes, historiques).

## 5. Règles Métier

- **État binaire obligatoire** : `vide` | `plein`.
- **Statut courant** d’un conteneur = dernier événement **valide** (voir § validation).
- Antibruit : on ignore les bascules multiples du **même utilisateur** sur un conteneur pendant 60 s (fenêtre d’anti‑rebond).
- **Consensus (option)** : statut = **majorité** des N derniers événements (N configurable), utile si ouverture aux déclarations publiques.
- **Verrouillage maintenance** : un conteneur en maintenance ne peut pas recevoir de nouvelles déclarations (sauf gérant).
- **Visibilité publique** (paramètre déchèterie) : si désactivée, seuls les comptes authentifiés voient les statuts.

## 6. Exigences Fonctionnelles Détail

### 6.1 Catalogue « Types de déchets »

- CRUD avec libellé, icône/couleur.
- Association à des conteneurs.

### 6.2 Conteneurs

- Attributs : libellé, type de déchet, capacité (L), état, emplacement (option), actif/inactif.
- Actions : déclarer `vide`/`plein`, passer en maintenance, archiver.

### 6.3 Déchèterie

- Attributs : nom, adresse, horaires, géolocalisation, visibilité publique.
- Actions gérant : CRUD, associer des conteneurs, définir le périmètre d’accès.

### 6.4 Historique

- Liste temporelle des changements (qui, quand, quoi, comment).

### 6.5 Tableau de bord gérant

- KPI : nb conteneurs pleins, taux de rotation, temps moyen de retour à « vide ».
- Filtres (date, type, état, déchèterie).
- Export CSV (v1) / XLSX (v1.1).

## 7. Interfaces (IHM)

- **Accueil** : sélection déchèterie + résumé des états.
- **Liste des conteneurs** : carte + badges (vert = vide, rouge = plein).
- **Fiche conteneur** : détails, historique, actions.
- **Admin** : gestion types, conteneurs, déchèterie, utilisateurs.

## 8. Données & Conformité

- Données personnelles minimales (email, rôle, journal des actions).
- **RGPD** : consentement, droit d’accès/suppression, rétention des journaux (12 mois par défaut, configurable).
- Journal d’audit non modifiable par les rôles non‑admin.

## 9. Critères d’Acceptation (exemples Gherkin)

### 9.1 Déclaration Plein

- **Étant donné** un utilisateur authentifié  
- **Quand** il clique « Plein » sur un conteneur actif  
- **Alors** l’état courant passe à `plein` et l’historique enregistre l’événement.

### 9.2 Anti‑rebond

- **Étant donné** un utilisateur qui vient de déclarer `plein`  
- **Quand** il reclique dans les 60 s  
- **Alors** la seconde action est ignorée et un message d’info s’affiche.

### 9.3 Maintenance

- **Étant donné** un conteneur en maintenance  
- **Quand** un utilisateur non‑gérant tente une déclaration  
- **Alors** l’action est refusée et journalisée.

## 10. Non‑Fonctionnel

- **Disponibilité** cible 99,5 % (v1).
- **Perf** : réponse API ≤ 300 ms P95 sur 200 req/s.
- **Sécurité** : JWT + RBAC, chiffrement TLS, logs d’audit.
- **Accessibilité** : respect WCAG niveau AA.

## 11. Livrables

- Code source (front, API).
- Schémas de données & API (OpenAPI).
- Jeux de tests & rapports.
- Guide d’exploitation & de déploiement.

## 12. Roadmap (évolutif)

- V1.1 : seuil « presque plein », exports XLSX, filtres avancés.
- V2 : capteurs IoT, notifications automatiques, prévisionnel.
