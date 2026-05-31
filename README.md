# Project Lazzaretto

## Idee

- Il gioco sarà ambientato nel 1600 negli anni della peste.
- Il protagonista sarà un Medico della Peste.
- Il gioco conterrà grossi riferimenti ai Promessi Sposi.
- Lo stile grafico sarà in pixel art.
- La prospettiva sarà 2.5D.

## Roadmap di sviluppo

Sviluppo a **strati**: validare un livello alla volta prima di passare al successivo.

### ~~Fase 0 — Scaffolding minimo~~ ✅

~~Canvas Phaser montato in pagina via `<Game client:only="vue" />` + `src/components/Game.vue`.~~

### ~~Fase 1 — Loop di gioco minimo "giocabile"~~ ✅

~~`MainScene` con player rettangolare, movimento WASD/frecce, fisica Arcade, world 1280×720, camera che segue, collisione con i bordi. Vertical slice tecnico completato.~~

### Fase 2 — Asset pipeline ✅

Obiettivo: capire come caricare e usare sprite/tilemap **prima** di disegnare contenuti veri.

Spezzata in mini-step incrementali; ognuno è un vertical slice tecnico verificabile a schermo prima di passare al successivo.

**Dove cercare asset** (pixel art, top-down, free o paid):

- [itch.io / Game Assets](https://itch.io/game-assets) — marketplace, molto free + "name your price".
- [OpenGameArt.org](https://opengameart.org/) — tutto free, licenze CC, qualità variabile.

#### ~~Mini-step 2.1 — Sprite statico del player~~ ✅

- Asset PNG **48×64** in `public/assets/player.png` (placeholder qualsiasi, anche un frame ritagliato da uno spritesheet).
- In `MainScene.vue` aggiungere handler `@preload` su `<Scene>` che chiama `scene.load.image('player', '/assets/player.png')`. NON serve una `PreloadScene` separata: phavuer espone `@preload` come evento su qualsiasi `<Scene>` (sorgente: `node_modules/phavuer/src/components/Scene.vue`). PreloadScene avrà senso solo quando gli asset cresceranno e servirà una progress bar.
- In `Player.vue` sostituire `<Rectangle>` con `<Sprite :texture="'player'" :x="480" :y="270" @create="onCreate">` (centro del canvas all'epoca 480×270; nota: dal 2.3 il regime è 960×540 → spawn a 960×540).
- Aggiornare il tipo del callback `onCreate` da `GameObjects.Rectangle` a `GameObjects.Sprite`. Tutta la logica esistente (`startFollow`, collider con `ObstacleGroup`) resta identica.
- Su `<Body>` passare esplicitamente `:width="32" :height="24"` con `:offsetY="40"` per avere il body fisico sui piedi (32×24 invece di 48×64). Pattern standard per top-down 2.5D: la collisione è il "basamento" del personaggio, non tutto il suo ingombro visivo.
- Vincoli: URL servito da Astro (`/assets/...`, non `/public/...`); `load.image` solo dentro `@preload`; non usare `import` bundler per l'asset.
- Verifica: il player è una PNG, si muove, collide con i bordi del mondo e con gli ostacoli marroni.

#### ~~Mini-step 2.2 — Animazioni idle + walk~~ ✅

- Spritesheet (es. 4 direzioni × N frame) in `public/assets/player.png` caricato con `scene.load.spritesheet('player', url, { frameWidth: 48, frameHeight: 64 })`.
- Definire animazioni Phaser in `@create` della scena con `scene.anims.create({ key, frames, frameRate, repeat })` (es. `idle-down`, `walk-down`, ecc.).
- In `Player.vue` selezionare animazione in base a velocità+direzione (computed o effect su `velocityX/Y`) e usarla via prop `:play="animKey"` di `<Sprite>`.
- Vincoli: registrare animazioni in `scene.anims` (globali), non sull'oggetto Sprite. La prop `play` di phavuer è reattiva.

#### ~~Mini-step 2.3 — Tilemap statica (no collisioni)~~ ✅

- **Cambio di regime**: con tileset 48×48 (asset di `public/assets/v0/medieval-village/`) si è passati da 480×270/tile 24 a **960×540/tile 48**. `WORLD_W/H` resta `gameConfig × 2 = 1920×1080`. Speed player 130 → 250 px/s per coerenza percettiva.
- Mappa fatta in [Tiled](https://www.mapeditor.org/), esportata come JSON in `public/assets/v0/maps/test.tmj` + tileset PNG già in `public/assets/v0/medieval-village/`.
- In `@preload`: `scene.load.tilemapTiledJSON('map', assetUrl('maps/test.tmj'))` + `scene.load.image('tileset-ground', assetUrl('medieval-village/ground.png'))` (uno per ogni tileset usato).
- In `@create` (imperativo, fallback Phaser puro — phavuer ha `<TilemapLayer>` ma il `Tilemap` stesso si crea via `scene.make.tilemap`): `const map = scene.make.tilemap({ key: 'map' }); const ts = map.addTilesetImage('nome-in-tiled', 'tileset-ground'); const ground = map.createLayer('Ground', ts, 0, 0)`.
- Aggiornare `WORLD_W/H` per matchare la dimensione della mappa (`map.widthInPixels`, `map.heightInPixels`) e usare quelli per world/camera bounds.
- Rimuovere i 3 `<Rectangle>` ostacoli placeholder dalla scena.

**Gotcha imparato in Fase 2.2** (ordine di mount Phavuer): i `@create` dei figli `<Scene>` scattano **prima** del `@create` della scena (regola Vue: child `onMounted` precede parent `onMounted`). Conseguenza: stato condiviso che i figli usano nel loro `@create` (es. `Group` per collider, `provide` di gruppi/refs) DEVE essere inizializzato nell'handler `@preload` della scena, non in `@create`. Sintomo classico se sbagli: `group.getLength() === 0` benché ci siano figli che fanno `group.add(rect)` al `@create`.

**Corollario imparato in Fase 2.4** (mount tra fratelli template): anche dentro un singolo entity SFC, il `@create` del parent GameObject (es. `<Sprite>`) scatta **prima** del mount dei figli `<Body>`. Quindi `sprite.body` è `null` dentro l'handler `@create` dello Sprite. Soluzione idiomatica: usare `@create` direttamente sul `<Body>` per le cose che richiedono il body (es. `physics.add.collider`). Lo Sprite si tiene in una var di modulo (`playerSprite`) per riferirlo dal callback del body.

#### ~~Mini-step 2.4 — Collision layer dalla tilemap~~ ✅

- In Tiled: layer "Walls" dedicato. **Phaser 4 NON supporta tileset esterni `.tsx`** → Tiled deve esportare con tileset embedded (menu Map → Convert / oppure right-click tileset → "Embed Tileset").
- In `@create`: `wallsLayer.setCollisionByExclusion([-1])` (tutti i tile presenti collidono).
- Collider: `scene.physics.add.collider(sprite, wallsLayer)` registrato **dentro il `@create` del `<Body>`** (vedi corollario sopra). Lo si fa con un `provide`/`inject` del `wallsLayer` dalla scena al Player via `InjectionKey` tipizzato.
- **Tipi**: `map.createLayer()` ritorna `TilemapLayer | TilemapGPULayer | null`. Per il narrowing TS: `const layer = map.createLayer(...); if (layer) { ... }` (TypeScript non restringe `.value` di un `ShallowRef`).
- **Attenzione**: un `TilemapLayer` NON funziona se messo in un `physics.add.collider(sprite, group)` insieme ad altri sprite — il group itera i `body` dei membri, ma `TilemapLayer` non ha `body` (collide per-tile). Va passato DIRETTAMENTE al collider come secondo argomento.
- **Movimento + collisioni**: NON usare le prop reattive `:velocityX/Y` di Phavuer. Il watch fa fire solo quando il ref cambia valore; se il body viene azzerato da una collisione ma il ref resta uguale (es. tasto premuto contro un muro su un asse, libero sull'altro → diagonale rotta), il watch non rifire. Soluzione: in `onPreUpdate` chiamare direttamente `body.setVelocity(vx, vy)` ogni frame.
- Verifica: il player non attraversa i muri della tilemap, il movimento diagonale lungo un muro funziona.

A questo punto si possono aggiungere contenuti senza rifare l'architettura.

### Fase 3 — Prima "stanza" tematica

Obiettivo: tradurre l'idea (Milano 1600, peste) in un primo ambiente giocabile. Spezzata in mini-step incrementali, ognuno verificabile a schermo.

#### Mini-step 3.1 — Mappa "village" v0 ✅

Mappa Tiled in `public/assets/v0/maps/map0.tmj` con due layer: `Ground` (pavimento, no collision) e `Walls` (muri/edifici, collision). Tileset embedded da `tilesets/village/{ground,wall}.png`.

#### Mini-step 3.2 — Layer di decorazioni / props ✅

Convenzione **fissata**: ogni mappa ha lo stesso set di **5 tile layer** (e in futuro N object layer). La struttura non cambia mappa per mappa, cambia solo il contenuto.

| Layer Tiled | Tileset  | Collision | Depth render                | Cosa ci va                                |
| ----------- | -------- | --------- | --------------------------- | ----------------------------------------- |
| `Ground`    | `ground` | no        | 0 (sotto entità)            | terreno, sentieri, tappeti                |
| `Walls`     | `wall`   | **sì**    | 0                           | pareti frontali, recinti, perimetro mondo |
| `PropsLow`  | `props`  | **sì**    | 0                           | basi alberi, casse, barili, lampione base |
| `PropsHigh` | `props`  | no        | `HIGH_DEPTH` (sopra entità) | chioma alberi, cima lampione, sconces     |
| `Roofs`     | `roofs`  | no        | `HIGH_DEPTH`                | tetti (player ci passa sotto)             |

**Principio**: collision e depth sono **dimensioni indipendenti**. Un albero alto 96px → tronco in `PropsLow` (collidi, sotto), chioma in `PropsHigh` (no collisione, sopra). Il player con `depth = y` si infila in mezzo e il y-sorting fa il resto.

**Architettura codice** (refactor centrato su `MainScene.vue`):

- Array `TILE_LAYERS` dichiarativo: `{ name, tileset, collides, depth }` per ognuno dei 5 layer. Aggiungere/rimuovere un layer = modificare l'array, niente blocchi `if` ripetuti.
- Loader tileset deduplicato (es. `props.png` usato sia da `PropsLow` che `PropsHigh`, caricato una volta).
- Scene popola `solidLayers` (un singolo `ShallowRef<TilemapLayer[]>` provided via `SolidLayersKey`), che raccoglie tutti i layer collidibili. Le entità iterano e registrano un collider per layer.
- Sostituisce il pattern precedente "un `InjectionKey` per layer" (era `WallsLayerKey + PropsLayerKey + …`) che non scalava.
- Warning in console se un layer dichiarato non esiste nella `.tmj` (utile quando si crea una mappa nuova e si dimentica un layer).

**Layer object** (`Triggers`, `Spawns`) verranno aggiunti in Fase 3.4+ per porte e spawn point, come **object layer Tiled** (non tile layer), letti con `map.getObjectLayer(...)`. Non interferiscono con depth/collision dei tile layer.

#### Mini-step 3.3 — Primi NPC fermi ✅

- Componente `src/game/entities/NPC.vue`: `<Sprite>` + `<StaticBody>` (immobile), props `{ texture, x, y, facing }`.
- `NpcGroupKey` (`InjectionKey<ShallowRef<GameObjects.Group | null>>`) in `src/game/types.ts`: la scena crea il group nel `@preload` e lo `provide`, ogni NPC vi si auto-aggiunge nel proprio `@create`.
- Caricamento spritesheet parametrico nella scena: array `CHARACTERS = ["player", "chef", "archrat"]`, ciclo su `scene.load.spritesheet`.
- Registrazione animazioni parametrica: helper `registerCharacterAnims(scene, textureKey)` con chiavi `idle-${textureKey}-${dir}` / `walk-${textureKey}-${dir}`. Player aggiornato a `${state}-player-${facing}`.
- Collider unico Player↔Group: `scene.physics.add.collider(playerSprite, npcGroup.value)` accetta un Group e collide con tutti i membri presenti e futuri — niente lista da mantenere.
- **Y-sorting**: in vista top-down 2.5D Phaser non ordina automaticamente per profondità. Convenzione: `sprite.setDepth(sprite.y)`. Per il player ogni frame in `onPreUpdate`, per gli NPC una volta in `@create`. Tile layer "bassi" restano a depth 0, tile layer "alti" (Roofs, PropsHigh) a `HIGH_DEPTH = 10000`.
- **Bordo mappa**: NON usare `collideWorldBounds` come confine visivo. Il body è sui piedi (offsetY=40) → sui bordi superiori la "testa" esce dal mondo. Soluzione: dipingere muri sul perimetro della mappa in `Walls`.

#### Mini-step 3.4 — Interazione "premi E" sugli NPC ✅

- Tasto azione **configurabile** via `KEYBINDINGS` in `src/game/input.ts` (default `E`). Helper `getActionKey(scene, action)` astrae il lookup → call site non hardcodano nomi tasto. Aggancio futuro per menu opzioni / rebind (Fase 8).
- Composable `src/game/composables/useInteraction.ts`:
  - inietta `NpcGroupKey`, registra il key con `getActionKey`.
  - in `onPreUpdate`, su `Phaser.Input.Keyboard.JustDown(key)` (edge-trigger, no spam a 60fps), trova lo sprite NPC più vicino entro `INTERACTION_RANGE = 48`px e logga `[interact] <texture.key>`.
  - API: `useInteraction(getPlayerPos: () => {x,y})`. La **callback** (non un valore) permette di leggere la posizione _attuale_ del player ogni frame, mantenendo il composable agnostico rispetto al tipo concreto (Sprite, Container, ecc.) → interface segregation: dipendi dal contratto minimo.
- Player aggancia il composable a livello top dello `<script setup>` (regola Vue: composables vanno sincroni nel setup, mai dentro handler async).
- Sarà il gancio per il sistema di dialoghi di Fase 4 (event bus `dialogue:start`).

### Fase 4 — Sistema di dialoghi (UI Vue)

Obiettivo: integrare UI Vue con la scena Phaser. Punto in cui Phavuer dà il massimo.

- Event bus: la scena emette `dialogue:start` con un payload.
- Componente Vue `<DialogueBox>` nel HUD che ascolta e mostra il testo.
- Dati dialoghi gestiti via **vue-i18n** in `src/game/i18n/<locale>/dialogues.ts` (Modello A: namespace `game` + `site` separati, mergiati in unico `createI18n`).
- Citazioni dai Promessi Sposi per sceneggiare scene memorabili (l'incontro coi bravi, la madre di Cecilia, ecc.).

**Polish (dopo MVP funzionante):**

- **NPC si gira verso il player quando parla**: salvare `facing` originale all'inizio del dialogo, calcolare la direzione opposta al vettore NPC→Player, ripristinare `facing` originale a `dialogue:end`. L'NPC espone un'API reattiva su `facing` (già prop, va promosso a stato interno).
- **Indicatore "parlami"**: piccolo sprite/icona (es. "E" in cerchio, o `…` lampeggiante) sopra la testa dell'NPC quando il player è entro `INTERACTION_RANGE`. Renderizzato come figlio dell'NPC con offset `y - 40`, visibilità reattiva. Probabilmente conviene un composable `useInteractionHint` che traccia il player più vicino.
- **Indicatore "sta parlando questo NPC"**: piccola freccia/triangolo sopra l'NPC attivo durante il dialogo. **Non un fumetto** perché (1) il box bottom è già nostro contenitore principale, leggibile e stabile (lo speaker è chiaro dal nome), (2) i fumetti costringono il testo a inseguire l'NPC in pan/zoom della camera, problema di leggibilità, (3) i fumetti richiedono layout dinamico per evitare overlap con muri/altri NPC. La freccia è ancoraggio leggero senza i contro.

### Fase 5 — Movimento NPC

Obiettivo: rendere il mondo vivo. NPC che camminano per la mappa.

- Object layer Tiled `Spawns` con waypoint per ogni NPC (`patrol: Vec2[]`).
- NPC passa da `StaticBody` a `DynamicBody`; aggiunto collider NPC↔`solidLayers` e NPC↔NPC.
- Stato interno: `idle | walking | talking`. Durante `talking` si ferma e guarda il player.
- `onPreUpdate` interno all'NPC: muove verso il prossimo waypoint, aggiorna `facing` e `animKey` come il player, fa `setDepth(sprite.y)` ogni frame.
- Sblocca il **monatto** errante (prerequisito audio spaziale dei campanacci, Fase 6).

### Fase 6 — Audio (pipeline + ambient + SFX)

Obiettivo: introdurre l'audio nel gioco, sia ambient che reattivo.

- Pipeline audio in `MainScene.onScenePreload`: `scene.load.audio(key, [...])`.
- **Passi del player**: timer 350ms in `onPreUpdate` quando `moving === true`, alterna `step1.wav`/`step2.wav`. Variante: leggere la tile sotto i piedi (`groundLayer.getTileAtWorldXY`) per scegliere il sample (grass/stone/wood).
- **Musica ambient**: track barocca / canti gregoriani in loop a volume basso (~0.3). Asset da fonti CC0/CC-BY (Musopen per barocco di pubblico dominio, archive.org per gregoriani).
- **Campanacci dei monatti**: suono spaziale legato all'NPC monatto in movimento. Volume modulato dalla distanza player↔monatto (oppure `WebAudio PannerNode` per stereo posizionale). Effetto atmosferico chiave.

### Fase 7 — Ciclo giorno/notte + gargoyle attivo

Obiettivo: introdurre tempo di gioco come dimensione, con effetti su rendering e gameplay.

- Variabile globale `timeOfDay` (0–24h) avanza con `scene.time` (es. 1 minuto reale = 1 ora di gioco).
- Overlay grafico full-screen con tint blu notte modulato da `timeOfDay`.
- Lampade/lanterne come sprite con sorgenti di luce additive di notte.
- **Gargoyle**: statua immobile di giorno (sprite `gargoyle.png`, NPC con `interactable: false`), di notte diventa NPC parlante (`facing` animato, dialogo attivo). Lega Fase 4 + Fase 5 + ciclo giorno/notte.

### Fase 8 — Meccaniche di core gameplay

Qui si decide **che tipo di gioco** è. Opzioni coerenti col tema:

- **Avventura narrativa 2D** (stile Night in the Woods): esplorazione + dialoghi + scelte.
- **Action-adventure top-down** (stile Zelda 2D): combattimento contro "untori"/ratti, inventario di rimedi.
- **Stealth/sopravvivenza**: evitare zone contagiate, gestire risorse (erbe, aceto dei quattro ladri, ecc.).
- **Gestionale leggero**: curare pazienti, gestire il lazzaretto.

Sceglierne **una** e tenerla piccola: il primo prototipo deve essere completabile in 5 minuti.

## Decisioni di design

### Fissate

- **Prospettiva**: **Obliquo / "fake 3D"**.
  - Vista top-down sul piano logico (X/Y cartesiano, fisica Arcade invariata).
  - Le pareti e gli elementi verticali sono disegnati in prospettiva _dentro_ lo sprite stesso (alla _EarthBound_, _Pokémon_ GBA, _Eastward_).
  - Y-sorting per personaggi/oggetti che passano davanti/dietro a mobili.
  - Implicazione asset: sprite dei muri/edifici realizzati con facciata frontale visibile, tile in 2 strati (pavimento + decor alto).

- **Riferimento estetico principale**: **Eastward** (Pixpil, 2021).
  - Pixel art ad alto dettaglio, palette ricca (non limitata stile NES), shading "painterly".
  - Sprite personaggio alti ~1.3 tile (player **48×64** px su tile **48×48**). Visivamente più piccolo che in Eastward — tradeoff accettato per avere più tile visibili a schermo.
  - Atmosfere notturne, illuminazione localizzata, profondità tramite Y-sorting.

- **Risoluzione logica**: **960×540** (16:9, ×2 = 1920×1080 pixel-perfect; ×1 = 960×540 finestra piccola, ×3 = 2880×1620 4K-ish). Scelta dopo aver adottato tileset 48×48 (cambio regime in Fase 2.3): a 480×270 si vedevano solo 10×5.6 tile, troppo stretto; a 960×540 si vedono 20×11.25 tile, comodo per esplorazione tipo Stardew/RPG classico. NON è più allineato a Eastward (che usa 480×270 con tile 16); è più vicino al regime di Stardew Valley.
- **Tile size**: **48×48** px (aderente agli asset reali di `public/assets/v0/medieval-village/`). Prima era 24×24, cambiato con il regime.
- **Player size (placeholder e finale)**: **48×64** px.
- **Pixel art rendering**: `pixelArt: true` in Phaser, nessun antialiasing.

- **Target piattaforma**: **desktop only** (viewport ≥ 1024×600).
  - Mobile non supportato. In futuro: pagina-fallback "apri da desktop per giocare" sotto la soglia.
  - Il canvas è sempre interamente visibile dentro il viewport desktop, mantenendo 16:9 con `Phaser.Scale.FIT` + `CENTER_BOTH`.

### Architettura tecnica

- **Astro** come framework della pagina; **Phavuer** come layer Vue per Phaser; **Phaser 4** come motore.
- **Approccio Phavuer-first**: scene ed entità si scrivono come **componenti Vue** (SFC) con template dichiarativi e composable per la logica. Niente classi `extends Phaser.Scene`.
- **Phaser puro come fallback chirurgico**: quando Phavuer non copre un'API (es. tilemap, particles, shader) si scende all'API imperativa Phaser **dentro un composable** via `useScene()`. Non si espone mai Phaser puro al template.
- Struttura cartelle:
  - `src/game/` → mondo di gioco. Tutto ciò che esiste **per il gioco**, indipendentemente dalla tecnologia di rendering (canvas Phaser **o** HTML overlay).
    - `src/game/config.ts` → `gameConfig` Phaser (solo dati).
    - `src/game/scenes/*.vue` → scene Phavuer (`MainScene.vue`, `PreloadScene.vue`, ecc.).
    - `src/game/entities/*.vue` → entità riusabili (`Player.vue`, `NPC.vue`).
    - `src/game/ui/*.vue` → UI di gioco renderizzata in HTML/Tailwind sopra al canvas (`HUD.vue`, `DialogueBox.vue`, `PauseMenu.vue`) — Fase 4+.
    - `src/game/composables/*.ts` → logica di gioco condivisa (input, movement, camera, audio, tilemap, dialoghi).
    - `src/game/data/*.ts` → dati statici (dialoghi, mappe, item) — Fase 4+.
    - `src/game/events.ts` → event bus tipizzato Scena ↔ UI — Fase 4.
  - `src/components/` → componenti della **pagina che ospita il gioco**. Esisterebbero anche se sostituissi il gioco con altro.
    - `src/components/Game.vue` → wrapper che monta il gioco nella pagina.
    - `src/components/DesktopOnly.vue` → fallback per viewport sotto soglia desktop (futuro).
- Regola: la separazione `game/` vs `components/` segue il **dominio**, non la **tecnologia**. Un `DialogueBox` Tailwind è dominio di gioco e sta in `src/game/ui/`, non in `src/components/`.
- Test mentale: "se domani buttassi via Astro e mettessi il gioco dentro Electron o un iframe, cosa porterei con me?" → tutto `src/game/` viaggia, `src/components/` no.

### Asset pipeline & cache busting

- **Asset di gioco** (sprite, tilemap, audio, atlas) stanno in `public/assets/<VERSION>/...`, serviti staticamente da Astro. URL pubblico: `/assets/<VERSION>/<file>`.
- **Perché `public/` e non `import` Vite**: tilemap JSON e texture atlas multi-file referenziano asset accoppiati per path relativo; il bundler hasherebbe i file separatamente rompendo i riferimenti. Inoltre la compressione bundler può alterare colori della pixel art.
- **Cache busting via versioning di cartella**:
  - Tutti gli URL passano per `assetUrl(path)` in `src/game/assets.ts`, che prefissa `/assets/<ASSETS_VERSION>/`.
  - Quando un deploy modifica asset, si **bumpa `ASSETS_VERSION`** (`v1` → `v2`) e si copia la cartella sotto il nuovo nome.
  - Vantaggi: path stabili dentro una release (atlas/tilemap coerenti), cache busting per definizione, vecchie versioni servite finché esistono in repo (utenti con pagina aperta non vedono asset rotti durante un deploy).
  - Politica: tenere le ultime 2-3 versioni, eliminare le più vecchie a intervalli.
- **Single source of truth**: nessuna stringa `/assets/...` hardcoded nel codice. Sempre `assetUrl('player.png')`. Se in futuro cambieremo strategia (hash al build, CDN dedicata, ecc.) si tocca solo `assets.ts`.
- **In sviluppo**: HMR di Vite/Astro ricarica gli asset al volo, non serve bumpare versione localmente.

### Input — schema ibrido (da implementare dopo Fase 1 / camera follow)

- **Tastiera (WASD + frecce)**: controllo diretto, sempre disponibile.
- **Click-to-move**: clic su un punto del mondo → il player ci cammina da solo (usa `pointer.worldX/Y`, coerente con la camera).
- **Regola di precedenza**: input da tastiera **annulla** il target del click in corso. Il click imposta un nuovo target solo se la tastiera è rilasciata.
- **Riferimenti** per questo schema ibrido in 2D/2.5D narrativo:
  - _Pentiment_ (Obsidian, 2022) — ambientazione storica, click + WASD.
  - _Disco Elysium_ — click-to-move principale, WASD aggiunto in patch.
  - _Diablo_ / _Path of Exile_ moderni — stesso pattern.
- Click-to-move ha senso solo dopo che esiste la **camera follow** (Fase 1 / Step 5), perché `pointer.worldX` ha significato solo con coordinate-mondo separate da coordinate-schermo.

### Da fissare

1. **Loop primario**: cosa fa il giocatore per il 70% del tempo? (esplora? dialoga? combatte? gestisce?)
2. **Condizione di vittoria/fine** del primo livello/prototipo?
3. **Font dei dialoghi**: pixel art dentro al canvas (stile Eastward) oppure HTML overlay Vue (più leggibile, meno coerente). Decisione da prendere in Fase 4.
