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

### Fase 2 — Asset pipeline

Obiettivo: capire come caricare e usare sprite/tilemap **prima** di disegnare contenuti veri.

Spezzata in mini-step incrementali; ognuno è un vertical slice tecnico verificabile a schermo prima di passare al successivo.

#### Mini-step 2.1 — Sprite statico del player

- Asset PNG **32×48** in `public/assets/player.png` (placeholder qualsiasi).
- In `MainScene.vue` aggiungere handler `@preload` su `<Scene>` che chiama `scene.load.image('player', '/assets/player.png')`. NON serve una `PreloadScene` separata: phavuer espone `@preload` come evento su qualsiasi `<Scene>` (sorgente: `node_modules/phavuer/src/components/Scene.vue`). PreloadScene avrà senso solo quando gli asset cresceranno e servirà una progress bar.
- In `Player.vue` sostituire `<Rectangle>` con `<Sprite :texture="'player'" :x="640" :y="360" @create="onCreate">`. Togliere `width/height/fillColor` (lo Sprite prende dimensione dalla texture).
- Aggiornare il tipo del callback `onCreate` da `GameObjects.Rectangle` a `GameObjects.Sprite`. Tutta la logica esistente (`startFollow`, collider con `ObstacleGroup`) resta identica.
- Su `<Body>` passare esplicitamente `:width="32" :height="48"` per robustezza (non dipendere dall'inferenza dalla texture).
- Vincoli: URL servito da Astro (`/assets/...`, non `/public/...`); `load.image` solo dentro `@preload`; non usare `import` bundler per l'asset.
- Verifica: il player è una PNG, si muove, collide con i bordi del mondo e con gli ostacoli marroni.

#### Mini-step 2.2 — Animazioni idle + walk

- Spritesheet (es. 4 direzioni × N frame) in `public/assets/player.png` caricato con `scene.load.spritesheet('player', url, { frameWidth: 32, frameHeight: 48 })`.
- Definire animazioni Phaser in `@create` della scena con `scene.anims.create({ key, frames, frameRate, repeat })` (es. `idle-down`, `walk-down`, ecc.).
- In `Player.vue` selezionare animazione in base a velocità+direzione (computed o effect su `velocityX/Y`) e usarla via prop `:play="animKey"` di `<Sprite>`.
- Vincoli: registrare animazioni in `scene.anims` (globali), non sull'oggetto Sprite. La prop `play` di phavuer è reattiva.

#### Mini-step 2.3 — Tilemap statica (no collisioni)

- Mappa fatta in [Tiled](https://www.mapeditor.org/), esportata come JSON in `public/assets/maps/test.json` + tileset PNG in `public/assets/tilesets/`.
- In `@preload`: `scene.load.tilemapTiledJSON('map', '/assets/maps/test.json')` + `scene.load.image('tileset', '/assets/tilesets/x.png')`.
- In `@create` (imperativo, fallback Phaser puro — phavuer ha `<TilemapLayer>` ma il `Tilemap` stesso si crea via `scene.make.tilemap`): `const map = scene.make.tilemap({ key: 'map' }); const ts = map.addTilesetImage('nome-in-tiled', 'tileset'); const ground = map.createLayer('Ground', ts, 0, 0)`.
- Aggiornare `WORLD_W/H` per matchare la dimensione della mappa (`map.widthInPixels`, `map.heightInPixels`) e usare quelli per world/camera bounds.
- Rimuovere i 5 `<Rectangle>` landmark di placeholder dalla scena.

#### Mini-step 2.4 — Collision layer dalla tilemap

- In Tiled: layer "Walls" o property `collides: true` sui tile dei muri.
- In `@create`: `wallsLayer.setCollisionByProperty({ collides: true })` (o per layer dedicato).
- Collider: `scene.physics.add.collider(playerRect, wallsLayer)`. Decidere se mantenere anche l'`ObstacleGroup` per ostacoli dinamici o eliminarlo (per ora la tilemap copre il 100% del caso → eliminare gli ostacoli `<Rectangle><StaticBody/></Rectangle>` dummy di Fase 1).
- Verifica: il player non attraversa i muri della tilemap.

A questo punto si possono aggiungere contenuti senza rifare l'architettura.

### Fase 3 — Prima "stanza" tematica

Obiettivo: tradurre l'idea (Milano 1600, peste) in un primo ambiente giocabile.

- Una piazza/vicolo come tilemap (placeholder grafici anche da [Kenney.nl](https://kenney.nl/assets) free).
- Il Medico della Peste come player sprite (anche solo silhouette con maschera a becco).
- 1–2 NPC fermi con cui interagire premendo un tasto → trigger evento.

### Fase 4 — Sistema di dialoghi (UI Vue)

Obiettivo: integrare UI Vue con la scena Phaser. Punto in cui Phavuer dà il massimo.

- Event bus: la scena emette `dialogue:start` con un payload.
- Componente Vue `<DialogueBox>` nel HUD che ascolta e mostra il testo.
- Dati dialoghi in `src/game/data/dialogues.ts` (JSON tipizzato).
- Citazioni dai Promessi Sposi per sceneggiare scene memorabili (l'incontro coi bravi, la madre di Cecilia, ecc.).

### Fase 5 — Meccaniche di core gameplay

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
  - Sprite personaggio alti ~3 tile (player ~32×48 px su tile 16×16).
  - Atmosfere notturne, illuminazione localizzata, profondità tramite Y-sorting.

- **Risoluzione logica**: **640×360** (16:9, ×3 = 1920×1080 pixel-perfect).
- **Tile size**: **16×16** px.
- **Player size (placeholder e finale)**: **32×48** px.
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
