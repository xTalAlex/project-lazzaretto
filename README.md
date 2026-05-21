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

- `PreloadScene` che carica una spritesheet di test.
- Sostituire il rettangolo del player con uno sprite animato (idle + walk).
- Caricare una **tilemap** semplice fatta con [Tiled](https://www.mapeditor.org/) (anche 20×20 tile placeholder).
- Layer di collisione dalla tilemap.

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
