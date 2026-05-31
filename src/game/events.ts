type EventMap = {
  "dialogue:start": { npcId: string };
  "dialogue:advance": void;
  "dialogue:end": void;
};

type Listener<T> = T extends void ? () => void : (payload: T) => void;

type EmitArgs<T> = T extends void ? [payload?: undefined] : [payload: T];

function createBus<M extends Record<string, unknown>>() {
  const listeners = new Map<keyof M, Set<Listener<unknown>>>();

  return {
    on<K extends keyof M>(event: K, listener: Listener<M[K]>) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(listener as Listener<unknown>);
      return () => listeners.get(event)?.delete(listener as Listener<unknown>);
    },

    off<K extends keyof M>(event: K, listener: Listener<M[K]>) {
      listeners.get(event)?.delete(listener as Listener<unknown>);
    },

    emit<K extends keyof M>(event: K, ...args: EmitArgs<M[K]>) {
      const payload = args[0];
      listeners
        .get(event)
        ?.forEach((listener) => (listener as Listener<M[K]>)(payload as never));
    },
  };
}

export const bus = createBus<EventMap>();
