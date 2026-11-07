# Le réseau de Mila : storyboard (séquence 2, 5e)

Animation 3D en 8 chapitres pour la séquence 2 « Organiser un réseau numérique ».
Situation problème : **Comment créer un réseau de données ?**

Sources de contenu : le Google Doc « Séquence 2 » (onglets Activité, Corrigé de l'activité, Synthèse, modifié le 2026-11-07). Chaque texte affiché reprend une réponse du corrigé ou un terme de la synthèse ; la colonne « Corrigé » de chaque chapitre dit lesquels.

---

## 1. Ce que je retiens de la vidéo de référence

Source : `enquete_4eme_presentation.mp4` (180 s, 1920×1080) et ses sources Three.js 0.169.

- **Palette** : deux mondes. Le monde réel est chaud et ensoleillé (ciel bleu clair, herbe verte, murs crème, mobilier bois). Le monde des données est un espace bleu nuit (#0b1d3a à #16264d) où les flux brillent avec un halo (bloom). Accent jaune doré (#ffc94a) sur les étiquettes et les titres.
- **Personnages** : silhouettes rondes, low poly, sans visage, couleurs de tee-shirt franches, ombres douces.
- **Typographie** : Segoe UI Variable Display en gras, blanc avec ombre portée. Texte sur deux lignes au plus : la première en blanc, la seconde en jaune. Les mots apparaissent un par un.
- **Étiquettes 3D** : cartouches bleu nuit à liseré jaune, accrochés aux objets.
- **Éclairage** : tone mapping neutre, lumière de studio douce, vignettage léger sur les bords.
- **Caméra** : trajectoires lissées (accélération et freinage doux) : survol, descente vers un bâtiment, travelling latéral lent, zoom sur un écran.
- **Rythme** : plans de 15 à 25 s, une idée par plan, fondus enchaînés d'environ 0,8 s, texte qui tombe au moment où l'action se termine.

**Ce que je reprends** : les deux mondes (le café de Mila au chaud, la vue schématique « données » en bleu nuit), le halo sur les flux, les cartouches à liseré jaune, la typographie et les fondus.
**Ce que j'adapte** : pas de photos ni de visages (RGPD, personnages fictifs) ; Mila est une silhouette du même style, reconnaissable à son tablier et à son chignon. Les flux cyan deviennent des **colis orange**, pour respecter le code couleur ci-dessous.

---

## 2. Code couleur (légende au début du chapitre 1, rappel par la touche L)

| Couleur | Signification | Exemples |
|---|---|---|
| 🟧 Orange | **Données** | colis qui circulent sur les câbles et dans les ondes |
| 🟦 Bleu | **Réseau local** | câbles Ethernet, commutateur, borne Wi-Fi et ondes, serveur |
| ⬜ Gris | **Internet** | ligne de l'opérateur, modem, routeur, « réseau des réseaux » |
| 🟥 Rouge | **Sécurité** | passerelle, pare-feu, antivirus, menaces |
| 🟨 Jaune (clignotant) | **Panne** | appareil éteint, câble coupé, signal perdu |

Chaque matériel garde **le même symbole et la même couleur** dans le café, au collège et à la maison.

---

## 3. Fonctionnement des fichiers livrés

- Un fichier HTML autonome par chapitre : Three.js et le logo sont intégrés au fichier. Il s'ouvre par **double-clic**, sans installation ni réseau, et fonctionne derrière le filtre du collège.
- Chaque chapitre est découpé en **plans**. Un plan joue son animation, puis reste figé sur l'image finale. On passe au suivant au **clic**, avec **→** ou **Espace**. **←** revient au plan précédent, **R** rejoue le plan, **F** passe en plein écran, **L** affiche la légende. Des points de progression en bas de l'écran situent le plan.
- Les plans « Qu'en pensez-vous ? » (pannes, diagnostics) s'arrêtent **avant** la réponse : le professeur fait réfléchir la classe, puis un clic révèle la solution.
- **Voix off** : chaque plan a son commentaire (texte au §4 bis), lu par une voix de synthèse française locale (Piper, voix SIWIS, 0 €), intégré au fichier. L'animation est calée sur la voix, phrase par phrase : les durées du §4 seront ajustées à la durée réelle de chaque phrase. **M** coupe ou rétablit la voix ; le texte à l'écran reste lisible seul. Un clic pendant la voix passe au plan suivant. Le navigateur n'autorise le son qu'après un premier geste : l'écran titre attend donc un clic sur « Commencer ».
- Pas de musique pour l'instant ; elle reste possible plus tard (licence CC0 ou CC BY uniquement).
- `index.html` : le logo du collège, le titre, les 8 chapitres en cartes numérotées, et un bouton « Chapitre suivant » à la fin de chaque chapitre.
- Le collège est rappelé dans une **vignette 3D « Au collège »** en coin d'écran (deuxième caméra), avec le même symbole que dans le café.

Durées indiquées : temps d'animation, sans les pauses de discussion.

---

## 4. Chapitres

### Chapitre 1 : Le besoin (≈ 1 min 25)

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 1.0 | 6 s | Écran titre : vue aérienne du village au matin, la boulangerie-café « Chez Mila ». Logo du collège en haut à gauche ; « Romain Blanchard, professeur de Technologie » en petit en bas à droite. | **Le réseau de Mila** / Chapitre 1 · Le besoin | |
| 1.1 | 8 s | Légende : les 5 couleurs apparaissent une par une, chacune avec son objet (colis, câble, nuage, bouclier, éclair). | Le code couleur | |
| 1.2 | 12 s | La caméra descend et entre dans le café, dont le toit devient transparent. Mila derrière le comptoir. Six appareils s'allument un par un avec leur étiquette : caisse, ordinateur de gestion, imprimante à tickets, imprimante de cuisine, écran du menu, terminal de paiement. Un colis orange quitte la caisse pour l'imprimante à tickets… et tombe au sol : il n'existe aucun chemin. | 6 appareils… / qui ne se parlent pas. | |
| 1.3 | 6 s | Les appareils s'envolent au-dessus du café et se posent sur un plateau bleu nuit (vue schéma). | Comment relier les appareils de Mila ? | |
| 1.4 | 12 s | **Anneau** : 6 câbles se dessinent en boucle (compteur « 6 câbles »), le plateau tourne lentement. Un colis fait le tour dans un seul sens. Un câble se coupe (étincelle jaune) : tous les colis s'arrêtent, tout le plateau devient gris. | En anneau : une seule coupure… / et TOUT le réseau est bloqué. | |
| 1.5 | 14 s | **Maillé** : chaque appareil est relié à tous les autres ; le compteur monte de 1 à **15 câbles**. Un câble se coupe : le colis prend un autre chemin, surligné. Puis un appareil tombe en panne : les autres continuent. | Maillé : toujours un chemin de secours. / Mais 15 câbles pour 6 appareils ! | |
| 1.6 | 14 s | **Étoile** : un commutateur bleu apparaît au centre, avec 6 câbles (compteur « 6 câbles »). Les colis passent tous par le centre. L'imprimante de cuisine tombe en panne et son câble est débranché : seul cet appareil est isolé, les 5 autres continuent. | En étoile : chaque appareil a son propre câble. / Un appareil en panne n'arrête pas les autres. | Vignette : salle De Vinci du collège, 16 postes en étoile. |
| 1.7 | 12 s | Les trois plateaux côte à côte tournent ensemble. Sous chacun : nombre de câbles (6 / 15 / 6) et effet d'une panne (tout bloqué / chemin de secours / seul l'appareil isolé). L'étoile s'illumine. | L'étoile : la plus utilisée / au collège et à la maison. | Pictos collège et maison sous l'étoile. |
| 1.8 | fixe | Mila devant son plateau en étoile ; le centre clignote, vide. | **Question** : Mila choisit l'étoile. Quel matériel doit-elle placer au centre ? | |

Corrigé, partie 1 : anneau (« une seule liaison coupée, tout est bloqué » ; le message tourne dans un seul sens) ; étoile (équipement central, le plus utilisé au collège et à la maison, un ordinateur en panne n'arrête pas les autres) ; maillé (autre chemin, très coûteux : 15 câbles contre 6). Ligne 6 : l'étoile est mise en avant et le maillé est montré lui aussi « continue de fonctionner » (accepté par le corrigé). Synthèse : « 1 appareil = 1 câble », « ajouter un matériel supplémentaire ».

### Chapitre 2 : Relier les appareils (≈ 1 min 25)

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 2.0 | 5 s | Titre du chapitre. | Chapitre 2 · Relier les appareils | |
| 2.1 | 12 s | Mila glisse un commutateur sous le comptoir. Les câbles bleus se branchent un à un (clic) et les voyants clignotent. Les colis filent, réguliers. | **Commutateur (switch)** / Il relie les appareils par des câbles Ethernet. | |
| 2.2 | 14 s | Zoom sur un câble, puis **coupe** : la gaine s'ouvre sur les 4 paires torsadées. La prise RJ45 devient transparente et montre ses 8 contacts dorés. Les colis filent dans les fils, vite et en ligne droite. | Liaison filaire par câble RJ45. / Rapide, stable et sécurisée. | |
| 2.3 | 8 s | Mila perce le mur ; les câbles longent les plinthes jusqu'à l'arrière-boutique. | Inconvénient : / il faut installer des câbles. | |
| 2.4 | 12 s | Mila veut prendre les commandes en terrasse avec la tablette. Une borne Wi-Fi au plafond émet un **cône d'ondes** bleu clair. Mila se promène, la tablette reste connectée et reçoit les colis. | **Borne Wi-Fi** / Liaison sans fil par ondes radio : grande liberté de déplacement. | |
| 2.5 | 12 s | La tablette s'éloigne sur la place. Le cône se rétrécit et pâlit, l'indicateur de débit passe de 4 à 1 barre, les colis ralentissent puis la tablette décroche (éclair jaune). | Plus on s'éloigne… / plus le débit baisse. | |
| 2.6 | 10 s | Vue en coupe d'un mur de pierre : l'onde le traverse et ressort affaiblie (anneaux plus fins, moins de colis). | Les obstacles atténuent le signal. | |
| 2.7 | 10 s | Deux cartes côte à côte (commutateur / borne Wi-Fi) : liaison, avantage, inconvénient. | Câble : rapide, stable, sécurisé, mais à installer. / Wi-Fi : libre, mais débit variable et sensible aux obstacles. | Vignette : postes des salles De Vinci (16) et Pesquet (12) en filaire sur le commutateur, borne Wi-Fi pour les smartphones, les tablettes des élèves à besoins particuliers et l'imprimante 3D Bambu Lab A1. |
| 2.8 | fixe | L'ordinateur de gestion, posé sur son bureau. | **Question** : Pour l'ordinateur de gestion, qui ne bouge jamais : câble ou Wi-Fi ? Pourquoi ? | |

Corrigé, partie 2 : switch → filaire RJ45 / rapide, stable, sécurisée / installer des câbles ; borne Wi-Fi → sans fil radio / liberté de déplacement / débit variable et sensible aux obstacles. Synthèse : « câbles Ethernet », « ondes radios ».

### Chapitre 3 : Le serveur (≈ 1 min 15)

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 3.0 | 5 s | Titre du chapitre. | Chapitre 3 · Le serveur | |
| 3.1 | 10 s | Mila embauche Hugo et Inès (personnages fictifs). Le fichier « Commandes du jour » est sur l'ordinateur de gestion ; Hugo, à la caisse, ne le trouve pas (dossier vide). | Les fichiers sont coincés / sur un seul ordinateur. | |
| 3.2 | 10 s | Le serveur arrive dans l'arrière-boutique : une armoire bleue au voyant toujours allumé. Le soleil et la lune passent à la fenêtre, le voyant ne s'éteint jamais. | **Serveur** / Un ordinateur allumé en permanence. | |
| 3.3 | 14 s | **Le gardien** : Inès tape son identifiant et son mot de passe sur la caisse. Un colis-badge part vers le serveur, où un gardien le compare à sa liste : coche verte, la session s'ouvre. Deuxième essai avec un mauvais mot de passe : croix, accès refusé. | Il vérifie l'identité : / identifiant + mot de passe (authentification). | |
| 3.4 | 14 s | **L'armoire** : Mila enregistre « Commandes du jour » : le fichier va dans le tiroir « Mila » (espace personnel). Puis « Recettes » va dans le tiroir « Commun » (espace commun, consultable par Hugo et Inès, utilisateurs reconnus et autorisés). | Il stocke les fichiers / de façon centralisée. | |
| 3.5 | 10 s | Mila va à la caisse et se connecte : son fichier ressort de son tiroir et s'affiche sur la caisse. | Mes fichiers me suivent / sur n'importe quel poste. | |
| 3.6 | 6 s | Un câble électrique qui va du serveur aux postes est barré. | Le serveur ne fournit pas l'électricité. | |
| 3.7 | 13 s | Le collège : le serveur est dans le bureau de la responsable informatique, relié par câble à la salle De Vinci. Un élève fictif se connecte sur un poste, puis sur un autre : il retrouve son espace personnel. | Ta session : identifiant + mot de passe. / Ton espace personnel, sur n'importe quel poste. | Collège en plein écran. |
| 3.8 | fixe | | **Question** : Au collège, pourquoi retrouves-tu ton dossier sur n'importe quel ordinateur de la salle ? | |

Corrigé, partie 3 : « vérifie l'identité de l'utilisateur (authentification), contrôle identifiant et mot de passe, autorise ou refuse » ; « stocke les fichiers de façon centralisée, espace personnel sur le serveur, accessible depuis tous les postes ». Synthèse : « ordinateur allumé en permanence », « stocker et partager les données, gérer les accès ».

### Chapitre 4 : Pannes au café et au collège (≈ 1 min 30, plus les pauses)

Chaque panne se joue en deux plans : **symptôme**, puis **pause « Qu'en pensez-vous ? »**, puis **explication**. Le café et le collège sont montrés côte à côte en écran partagé.

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 4.0 | 5 s | Titre du chapitre. | Chapitre 4 · Pannes ! | |
| 4.A1 | 10 s | Café : le câble de l'imprimante de cuisine se débranche (éclair jaune). Collège : un poste de la rangée A s'éteint, câble débranché. | **Panne A** : un appareil débranché. Que se passe-t-il ? | écran partagé |
| 4.A2 | 10 s | Les colis continuent partout ailleurs. Compteur collège : « 23 postes sur 24 fonctionnent ». | Seul cet appareil ne fonctionne plus. / En étoile, chacun a son propre câble. | |
| 4.B1 | 10 s | La prise du commutateur est arrachée du secteur, ses voyants s'éteignent. | **Panne B** : le commutateur est débranché. | |
| 4.B2 | 10 s | Tous les colis filaires s'arrêtent et tous les postes fixes passent au gris. | Tous les ordinateurs fixes perdent le réseau. / Le commutateur est le point central. | |
| 4.C1 | 10 s | Café : la tablette s'éloigne au bout de la place. Collège : des tablettes dans la cour, loin du bâtiment. Une icône de chargement tourne, puis s'éteint. | **Panne C** : les tablettes rament puis décrochent. Pourquoi ? | |
| 4.C2 | 10 s | Le cône d'onde se rétrécit et les murs s'interposent en surbrillance. | La portée de la borne Wi-Fi est limitée / et les obstacles atténuent le signal. | |
| 4.D1 | 10 s | Le serveur s'éteint (voyant éteint, fumée légère). | **Panne D** : le serveur tombe en panne. | |
| 4.D2 | 14 s | Les écrans restent allumés et une page web s'affiche encore, mais l'écran de connexion répond « session impossible » et le tiroir de l'espace personnel est verrouillé. Les voyants électriques restent verts. | On peut encore naviguer… / mais plus de session ni d'espace personnel. | |
| 4.9 | fixe | Les quatre pannes en petites cartes. | **Question** : Dans un réseau en étoile, quelle panne est la plus grave ? Pourquoi ? | |

Corrigé, partie 4 : A « seul cet ordinateur, les 23 autres marchent » ; B « tous les ordinateurs fixes de la salle perdent l'accès » ; C « portée limitée et obstacles » ; D « naviguer oui, session et espace personnel non ; pas d'alimentation électrique ».

### Chapitre 5 : Vers Internet (≈ 1 min 20)

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 5.0 | 5 s | Titre du chapitre. | Chapitre 5 · Vers Internet | |
| 5.1 | 10 s | Mila veut recevoir des commandes en ligne. Dézoom : le réseau du café n'est qu'un petit plateau parmi des dizaines d'autres reliés en gris. | Internet : / le réseau des réseaux. | |
| 5.2 | 6 s | La ligne grise de l'opérateur arrive de la rue jusqu'au mur du café. | Mais la ligne ne parle pas « colis »… | |
| 5.3 | 14 s | **Le modem, le traducteur** : vue en coupe. Côté ligne, un signal ondulé gris entre ; dans le modem, il se transforme en colis orange. Dans l'autre sens, les colis redeviennent signal. | **Modem** / Il convertit le signal de la ligne en données numériques. | |
| 5.4 | 14 s | **Le routeur, l'aiguilleur** : un carrefour avec des aiguillages. Chaque colis porte une étiquette d'adresse ; le routeur la lit et oriente le colis vers Internet ou vers le bon appareil du café. | **Routeur** / Il oriente les paquets de données entre le réseau local et Internet. | |
| 5.5 | 16 s | **Zoom sur le trajet d'un paquet**, avec un compteur d'étapes. Trajet 1 : un fichier de l'ordinateur pour la caisse ne passe que par le commutateur (3 étapes). Trajet 2 : une page web passe par commutateur → routeur → modem → ligne (5 étapes). | Un fichier local reste dans le café. / Une page web traverse le routeur et le modem. | |
| 5.6 | 6 s | Un globe enfermé dans le modem, barré ; un éclair électrique sortant du routeur, barré. | Ils ne stockent pas les sites web / et ne produisent pas d'électricité. | |
| 5.7 | 8 s | Vignette : baie technique du collège, arrivée de la ligne, modem et routeur. | Au collège : même chemin. | Collège |
| 5.8 | fixe | | **Question** : Le modem ou le routeur : lequel lit l'adresse d'un paquet ? | |

Corrigé, partie 5 : modem « convertit le signal de la ligne en données numériques utilisables par le réseau » ; routeur « oriente les paquets de données entre le réseau local et Internet » ; les deux distracteurs sont réfutés à l'écran ; trajet local en 3 étapes, page web en 5 étapes.

### Chapitre 6 : Se protéger (≈ 1 min 30)

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 6.0 | 5 s | Titre du chapitre. | Chapitre 6 · Se protéger | |
| 6.1 | 8 s | Le côté Internet s'assombrit et des colis suspects (rouges, cornus) rôdent autour du café. | Ouvert sur Internet… / le réseau doit être protégé. | |
| 6.2 | 10 s | **Passerelle** : une barrière physique rouge entre le café et la ligne. Tous les colis entrent et sortent par cette seule porte. | **Passerelle** (protection physique) / Le point de passage unique entre l'intérieur et l'extérieur. | |
| 6.3 | 16 s | **Menace 1 : le pirate à distance.** Un colis pirate vise une porte numérotée restée ouverte (un port). Le **pare-feu**, un portique de contrôle, scanne chaque colis selon sa liste de règles : les colis normaux passent (coche), le pirate est rejeté (croix rouge). | **Pare-feu** (logiciel) / Il analyse le trafic et bloque les intrusions selon des règles. | |
| 6.4 | 16 s | **Menace 2 : la clé USB infectée.** Hugo branche une clé sur l'ordinateur ; le pare-feu, resté à l'entrée, ne voit rien. Un logiciel malveillant commence à tacher le disque, montré en coupe. L'**antivirus** balaie le disque, détecte la tache, l'enferme et la supprime. | **Antivirus** (logiciel) / Il détecte, neutralise et supprime les logiciels malveillants sur la machine. | |
| 6.5 | 14 s | **Menace 3 : l'intrus sur place.** Un inconnu entre dans la réserve et branche son ordinateur directement sur le commutateur : son chemin évite la passerelle, en pointillés rouges. Alarme. | Il contourne la passerelle, / seul point d'entrée officiel du réseau. | |
| 6.6 | 8 s | Le pare-feu et l'antivirus reçoivent une mise à jour (nouvelle règle, nouvelle fiche de virus). | Pour être efficaces, / pare-feu et antivirus doivent être mis à jour. | |
| 6.7 | 8 s | Vignette : baie du collège avec passerelle et pare-feu ; antivirus sur chaque poste. | Au collège : les trois protections. | Collège |
| 6.8 | fixe | | **Question** : Un élève branche une clé USB inconnue : quelle protection agit ? Pourquoi pas le pare-feu ? | |

Corrigé, parties 6 et 7.2 : passerelle « barrière physique et point de passage unique » ; pare-feu « analyse le trafic et bloque les intrusions selon des règles » ; antivirus « détecte, neutralise et supprime les fichiers malveillants » ; situation 1 → pare-feu, 2 → antivirus, 3 → passerelle (contournée). Synthèse : « doivent être mis à jour ».

### Chapitre 7 : Mission maintenance (≈ 1 min 15, plus les pauses)

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 7.0 | 5 s | Titre du chapitre. Mila téléphone : « Au secours, technicien ! » | Chapitre 7 · Mission maintenance | |
| 7.1 | 14 s | **Symptôme 1** : dans le café, les colis circulent bien entre les appareils (le réseau local est bleu et vivant), mais les colis vers Internet s'entassent devant la ligne. Même chose au collège, en écran partagé. | Le réseau local fonctionne… / mais rien ne sort vers l'extérieur. **Modem ou routeur ?** | écran partagé |
| 7.2 | 12 s | Coupe du modem : les colis entrent mais ne sont plus traduits en signal ; la ligne reste plate. | **Le modem** : la traduction ne se fait plus. | |
| 7.3 | 14 s | **Symptôme 2** : la ligne fonctionne et les pages arrivent, mais au hasard : la commande en ligne sort à l'imprimante de cuisine au lieu de la caisse. Au collège, la page de la vie scolaire arrive en salle de technologie ou au CDI. | Les paquets arrivent au mauvais endroit. **Modem ou routeur ?** | écran partagé |
| 7.4 | 12 s | Coupe du routeur : les étiquettes d'adresse sont illisibles et les aiguillages tournent au hasard. | **Le routeur** : les adresses ne sont plus lues, / l'aiguillage ne se fait plus. | |
| 7.5 | 10 s | Tableau qui se construit : symptôme → matériel. | Rien ne sort → modem. / Mauvais endroit → routeur. | |
| 7.6 | fixe | Tous les appareils du café sont gris, même entre eux. | **Question** : Plus aucun appareil ne communique, même dans le café. Modem, routeur… ou un autre matériel ? | |

Corrigé, partie 7.1 : panne A → modem (le réseau local fonctionne, la traduction ligne ↔ données ne se fait plus) ; panne B → routeur (les adresses IP ne sont plus lues, l'aiguillage ne se fait plus). La question finale renvoie à la panne B du chapitre 4 (le commutateur).

### Chapitre 8 : Du collège à la maison (≈ 1 min 30)

| # | Durée | Ce qu'on voit | Texte affiché | Collège / maison |
|---|---|---|---|---|
| 8.0 | 5 s | Titre du chapitre. | Chapitre 8 · Du collège à la maison | |
| 8.1 | 14 s | Trois plans côte à côte, café, collège et maison, avec les mêmes symboles et les mêmes couleurs. Les éléments équivalents s'allument ensemble, un par un. | Trois réseaux, / les mêmes éléments. | les trois |
| 8.2 | 16 s | Zoom sur la box de la maison, qui s'ouvre en **vue éclatée** : 5 modules en sortent, chacun avec son symbole (commutateur, borne Wi-Fi, modem, routeur, passerelle). | **Box Internet** = / commutateur + borne Wi-Fi + modem + routeur + passerelle | |
| 8.3 | 10 s | Des traits relient chaque module de la box à son équivalent séparé dans la baie du collège. | Au collège, ils sont séparés. / À la maison, ils sont réunis. | |
| 8.4 | 14 s | La maison se remplit d'objets connectés : ampoule, thermostat, volets, enceinte, montre. Au café : vitrine réfrigérée connectée et four programmable. | **Réseau numérique** / Il relie aussi les objets connectés et la domotique. | |
| 8.5 | 14 s | Récapitulatif en 4 étages qui se construisent : relier (commutateur, Wi-Fi), gérer (serveur), s'ouvrir sur Internet (modem, routeur), se protéger (passerelle, pare-feu, antivirus). | Comment créer un réseau de données ? | |
| 8.6 | fixe | | **Question** : Chez toi, quels appareils sont reliés à la box ? Lesquels par câble, lesquels en Wi-Fi ? | |
| 8.7 | 8 s | Générique : le café au crépuscule, Mila ferme la porte. Logo du collège ; en bas, en petit : « Romain Blanchard, professeur de Technologie ». | Fin | |

Corrigé, partie 9 : « la box Internet de l'opérateur regroupe modem, routeur, passerelle, commutateur et borne Wi-Fi » ; « réseau numérique : objets connectés et domotique ». Synthèse : « Box Internet = commutateur + borne WiFi + modem + routeur + passerelle ».

---

## 4 bis. Voix off (texte lu, plan par plan)

La voix s'adresse à chaque élève (« tu ») et à la classe pour les questions (« À vous »). Le texte lu reprend les phrases du corrigé ; ce qui est écrit à l'écran en reste la version courte. Les nombres sont écrits en lettres et certains mots sont réécrits pour la prononciation (« R J quarante-cinq », « wifi », « I P »).

**Chapitre 1**
- 1.0 Le réseau de Mila. Chapitre un : le besoin.
- 1.1 Avant de commencer, retiens le code couleur. En orange, les données. En bleu, le réseau local. En gris, Internet. En rouge, la sécurité. Et en jaune, les pannes.
- 1.2 Voici Mila. Elle ouvre une boulangerie-café dans son village. Six appareils : caisse, ordinateur, imprimantes, écran du menu, terminal de paiement. Mais la caisse ne peut rien envoyer à l'imprimante : les appareils ne se parlent pas.
- 1.3 Comment relier les appareils de Mila ? Il existe trois façons de les organiser : on les appelle des topologies.
- 1.4 Première idée : le réseau en anneau. Six câbles, en boucle. Le message tourne dans un seul sens, d'appareil en appareil. Mais si une seule liaison est coupée… tout le réseau est bloqué.
- 1.5 Deuxième idée : le réseau maillé. Chaque appareil est relié à plusieurs autres. Un câble coupé ? L'information emprunte un autre chemin. Mais il faut quinze câbles pour six appareils : c'est très coûteux.
- 1.6 Troisième idée : le réseau en étoile. Au centre, un matériel supplémentaire. Un appareil, un câble : six câbles en tout. Si l'imprimante de cuisine tombe en panne, elle seule est isolée. Le reste du réseau continue de fonctionner.
- 1.7 Comparons. L'anneau : une coupure bloque tout. Le maillé : toujours un chemin de secours, mais quinze câbles. L'étoile : six câbles, et une panne n'arrête pas les autres. C'est le réseau le plus utilisé : à la maison, et au collège. En technologie, les seize postes élèves de la salle De Vinci et les douze postes de la salle Pesquet, mais aussi les postes des professeurs et les imprimantes, sont reliés en étoile.
- 1.8 Mila choisit l'étoile. À vous : quel matériel doit-elle placer au centre ?

**Chapitre 2**
- 2.0 Chapitre deux : relier les appareils.
- 2.1 Au centre de l'étoile, Mila installe un commutateur, en anglais un switch. Il relie les appareils entre eux grâce à des câbles Ethernet.
- 2.2 Regardons à l'intérieur d'un câble. Sous la gaine, huit petits fils torsadés deux par deux. Au bout, la prise R J quarante-cinq. C'est une liaison filaire : très rapide, stable et sécurisée.
- 2.3 Son inconvénient : il faut installer les câbles. Percer les murs, les faire passer partout.
- 2.4 Mais Mila veut prendre les commandes en terrasse, avec sa tablette. Pour cela : une borne wifi. Elle transmet les données sans fil, par ondes radio. Grande liberté de déplacement !
- 2.5 Attention : plus la tablette s'éloigne de la borne, plus le signal faiblit. Le débit baisse… jusqu'à la déconnexion.
- 2.6 Et les obstacles, comme ce mur de pierre, atténuent le signal. Le débit du wifi est variable.
- 2.7 Résumons. Le câble : rapide, stable et sécurisé, mais il faut l'installer. Le wifi : grande liberté de déplacement, mais un débit sensible aux obstacles et à la distance. Au collège, c'est pareil : les postes des salles De Vinci et Pesquet sont câblés au commutateur, et la borne wifi relie les smartphones, les tablettes des élèves à besoins particuliers et l'imprimante 3D Bambu Lab A1.
- 2.8 À vous : l'ordinateur de gestion ne bouge jamais de son bureau. Câble ou wifi ? Pourquoi ?

**Chapitre 3**
- 3.0 Chapitre trois : le serveur.
- 3.1 Mila embauche Hugo et Inès. Problème : le fichier des commandes est enregistré sur l'ordinateur de gestion. Depuis la caisse, Hugo ne le trouve pas.
- 3.2 La solution : un serveur. C'est un ordinateur spécialisé, allumé en permanence, jour et nuit.
- 3.3 Premier rôle : le gardien. Inès tape son identifiant et son mot de passe. Le serveur vérifie son identité : c'est l'authentification. Accès autorisé. Avec un mauvais mot de passe… accès refusé.
- 3.4 Deuxième rôle : l'armoire. Quand Mila enregistre un fichier, il est stocké sur le serveur, dans son espace personnel. Elle peut aussi le placer dans l'espace commun, consultable par tous les utilisateurs reconnus du réseau, s'ils sont autorisés. Les fichiers sont centralisés.
- 3.5 Mila passe à la caisse et se connecte : son fichier est là. Elle le retrouve depuis n'importe quel poste du réseau.
- 3.6 Attention : le serveur ne fournit pas l'électricité aux appareils. Il gère les accès et stocke les données.
- 3.7 Au collège, c'est exactement pareil. Le serveur se trouve dans le bureau de la responsable informatique. Quand tu te connectes, il vérifie ton identifiant et ton mot de passe, puis il te rend ton espace personnel, quel que soit l'ordinateur.
- 3.8 À vous : pourquoi retrouves-tu ton dossier sur n'importe quel ordinateur de la salle ?

**Chapitre 4**
- 4.0 Chapitre quatre : pannes ! À gauche, le café de Mila. À droite, le collège.
- 4.A1 Panne A : le câble de l'imprimante de cuisine est débranché. Au collège, un ordinateur de la rangée A ne s'allume plus, et son câble est débranché. Que se passe-t-il ?
- 4.A2 Seul cet appareil ne fonctionne plus. Les vingt-trois autres ordinateurs marchent normalement. En étoile, chaque poste a son propre câble vers le commutateur.
- 4.B1 Panne B : le commutateur est débranché du secteur. Que se passe-t-il ?
- 4.B2 Tous les ordinateurs fixes perdent instantanément l'accès au réseau. Le commutateur est le point central : sans lui, plus aucune liaison filaire.
- 4.C1 Panne C : les tablettes s'éloignent très loin du bâtiment. Elles rament, puis se déconnectent. Pourquoi ?
- 4.C2 La portée des ondes de la borne wifi est limitée, et les obstacles atténuent le signal.
- 4.D1 Panne D : le serveur tombe en panne en pleine séance. Que se passe-t-il ?
- 4.D2 Les ordinateurs restent allumés : on peut encore naviguer. Mais impossible d'ouvrir sa session ou d'accéder à son espace personnel. Le serveur gère l'authentification et le stockage, pas l'électricité.
- 4.9 À vous : dans un réseau en étoile, quelle panne est la plus grave ? Pourquoi ?

**Chapitre 5**
- 5.0 Chapitre cinq : vers Internet.
- 5.1 Mila veut maintenant recevoir des commandes en ligne. Il faut relier son réseau à Internet, le réseau des réseaux.
- 5.2 La ligne de l'opérateur arrive jusqu'au café. Mais sur cette ligne, le signal n'a pas la même forme que les données du réseau.
- 5.3 Le modem est le traducteur. Il convertit le signal de la ligne en données numériques utilisables par le réseau. Et dans l'autre sens aussi.
- 5.4 Le routeur est l'aiguilleur. Il lit l'adresse de chaque paquet de données et l'oriente entre le réseau local et Internet.
- 5.5 Suivons deux paquets. Un fichier envoyé de l'ordinateur à la caisse passe seulement par le commutateur : il reste dans le café. Une page web, elle, passe par le commutateur, le routeur, le modem, puis la ligne de l'opérateur.
- 5.6 Attention aux pièges : le modem et le routeur ne stockent pas les sites web, et ne produisent pas d'électricité.
- 5.7 Au collège, la ligne arrive dans la baie technique, avec un modem et un routeur : le même chemin.
- 5.8 À vous : le modem ou le routeur, lequel lit l'adresse d'un paquet ?

**Chapitre 6**
- 6.0 Chapitre six : se protéger.
- 6.1 En s'ouvrant sur Internet, le réseau de Mila s'expose aussi aux menaces. Il doit être protégé, par du matériel et par des logiciels.
- 6.2 La passerelle est une protection physique : une barrière, le point de passage unique entre le réseau interne et l'extérieur.
- 6.3 Première menace : un pirate, à l'autre bout du monde, tente d'entrer par un port de connexion ouvert. Le pare-feu analyse le trafic et bloque les intrusions selon des règles précises.
- 6.4 Deuxième menace : Hugo branche une clé USB infectée. Elle ne passe pas par Internet : le pare-feu ne la voit pas. Le logiciel malveillant attaque le disque. C'est l'antivirus qui le détecte, le neutralise et le supprime.
- 6.5 Troisième menace : un inconnu entre dans la réserve et branche son ordinateur directement sur le commutateur. Il contourne la passerelle, le seul point d'entrée officiel du réseau.
- 6.6 Pour rester efficaces, le pare-feu et l'antivirus doivent être mis à jour.
- 6.7 Au collège, une passerelle et un pare-feu protègent l'entrée du réseau, et un antivirus surveille chaque poste.
- 6.8 À vous : un élève branche une clé USB inconnue. Quelle protection agit ? Et pourquoi pas le pare-feu ?

**Chapitre 7**
- 7.0 Chapitre sept : mission maintenance. Aujourd'hui, le technicien, c'est toi.
- 7.1 Premier appel. Au café comme au collège, les ordinateurs s'échangent des fichiers sans problème. Mais impossible d'envoyer ou de recevoir quoi que ce soit depuis l'extérieur. Modem ou routeur ?
- 7.2 C'est le modem. Le réseau local fonctionne, mais rien ne passe sur la ligne de l'opérateur : la traduction entre le signal de la ligne et les données numériques ne se fait plus.
- 7.3 Deuxième appel. La ligne extérieure fonctionne, mais les pages arrivent au hasard : la commande en ligne sort en cuisine au lieu de la caisse. Au collège, la page de la vie scolaire arrive en salle de technologie ou au CDI. Modem ou routeur ?
- 7.4 C'est le routeur. Les adresses I P ne sont plus lues : l'aiguillage des paquets ne se fait plus.
- 7.5 Retiens : rien ne sort, c'est le modem. Les paquets arrivent au mauvais endroit, c'est le routeur.
- 7.6 Dernier appel : plus aucun appareil ne communique, même à l'intérieur du café. Modem, routeur… ou un autre matériel ? À vous !

**Chapitre 8**
- 8.0 Chapitre huit : du collège à la maison.
- 8.1 Le café de Mila, le collège, ta maison : trois réseaux différents, mais les mêmes éléments.
- 8.2 À la maison, un seul boîtier fait presque tout : la box Internet. Ouvrons-la. Elle regroupe un commutateur, une borne wifi, un modem, un routeur et une passerelle.
- 8.3 Au collège, ces éléments sont séparés dans la baie technique. À la maison, ils sont réunis dans la box.
- 8.4 Aujourd'hui, on ne relie plus seulement des ordinateurs : ampoules, thermostat, volets, enceintes, montres… Avec les objets connectés et la domotique, on parle de réseau numérique.
- 8.5 Alors, comment créer un réseau de données ? On relie les appareils avec un commutateur et une borne wifi. On gère les données et les utilisateurs avec un serveur. On s'ouvre sur Internet avec un modem et un routeur. Et on se protège avec une passerelle, un pare-feu et un antivirus.
- 8.6 À vous : chez toi, quels appareils sont reliés à la box ? Lesquels par câble, lesquels en wifi ?
- 8.7 *(générique, sans voix)*

---

## 5. Points à valider

1. **Le corrigé et la synthèse ne disent pas tout à fait la même chose.** Pour le modem, la synthèse écrit « permettre à chaque appareil d'échanger des données avec Internet », le corrigé « convertit le signal ». Pour le pare-feu, la synthèse écrit « empêcher les logiciels malveillants d'entrer », le corrigé « analyse le trafic et bloque les intrusions ». **Je propose** : les phrases du corrigé à l'écran (ce sont celles que l'élève relie dans l'activité) et les termes de la synthèse partout ailleurs (« câbles Ethernet », « ondes radio », « ordinateur allumé en permanence », « mis à jour »).
2. **Six appareils dans le café, au lieu des quatre du brief.** Il en faut six pour retrouver les « 15 câbles contre 6 » du corrigé. J'ajoute l'imprimante de cuisine, l'écran du menu et le terminal de paiement ; la tablette, sans fil, n'arrive qu'au chapitre 2.
3. **Crédit de la voix.** La voix SIWIS est sous licence CC BY : la règle du projet (`LICENCES-MEDIAS.md`) impose de la créditer. Je propose une ligne discrète dans le générique de fin et sur la page d'index : « Voix : SIWIS (CC BY 4.0) ». C'est un crédit de licence, pas un crédit d'outil : ni « Piper » ni « synthèse » n'y figurent.
4. **Durée du chapitre 1.** Avec la voix off (environ 2,6 mots par seconde, mesuré sur l'échantillon), les chapitres 2 à 8 tiennent entre 1 min 10 et 1 min 30. Le chapitre 1 fait environ 1 min 50, à cause de ses trois topologies et de la légende. Je propose de l'accepter tel quel ; une autre option est de couper le chapitre en deux (le café et la légende, puis les topologies).
5. **Livraison** dans `livrables/reseau-mila/` (index.html et chapitre-1.html à chapitre-8.html). Les sources sont dans `pieces/reseau-mila/`.

## 6. Vérification de chaque chapitre avant livraison

- Chaque texte affiché est comparé au corrigé (la colonne « Corrigé » ci-dessus) ; aucun distracteur de l'activité n'est présenté comme vrai.
- Capture de l'image finale de chaque plan à 1920×1080 et à 1280×720 (vidéoprojecteur), avec relecture des captures.
- Ouverture par double-clic (`file://`), réseau bloqué et journalisé : aucune requête externe.
- Clavier et clic : avancer, reculer, rejouer, plein écran ; aucun plan sans issue.
- Aucune mention d'outil ni de génération, que ce soit à l'écran, dans le code source ou dans les noms de fichiers.
