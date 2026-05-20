# Project Lazzaretto

## Idee

- Il gioco sarà ambientato nel 1600 negli anni della peste.
- Il protagonista sarà un Medico della Peste.
- Il gioco conterrà grossi riferimenti ai Promessi Sposi.
- Lo stile grafico sarà in pixel art.
- La prospettiva sarà 2.5D.

## Roadmap di sviluppo

Sviluppo a **strati**: validare un livello alla volta prima di passare al successivo.

### Fase 0 — Scaffolding minimo

Obiettivo: vedere un canvas funzionante sulla pagina.

1. `src/pages/index.astro` monta `<Game client:only="vue" />`.
2. `src/components/Game.vue` con una `Scene` e un placeholder (rettangolo o testo).
3. Verifica che `npm run dev` mostri il canvas senza errori.

### Fase 1 — Loop di gioco minimo "giocabile"

Obiettivo: un protagonista che si muove in una stanza vuota. Niente arte, niente trama.

- **Una scena** `MainScene`.
- **Un player**: rettangolo/cerchio controllato da WASD o frecce.
- **Camera** che segue il player.
- **Collisioni** con i bordi.

Questo è il "vertical slice tecnico": conferma che input, fisica e rendering funzionano.

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
  - Le pareti e gli elementi verticali sono disegnati in prospettiva *dentro* lo sprite stesso (alla *EarthBound*, *Pokémon* GBA).
  - Y-sorting opzionale per personaggi/oggetti che passano davanti/dietro a mobili.
  - Implicazione asset: sprite dei muri/edifici realizzati con facciata frontale visibile, tile in 2 strati (pavimento + decor alto).

### Da fissare

1. **Loop primario**: cosa fa il giocatore per il 70% del tempo? (esplora? dialoga? combatte? gestisce?)
2. **Condizione di vittoria/fine** del primo livello/prototipo?
