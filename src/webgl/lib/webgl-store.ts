interface BaseState {
  root: () => void;
}

type StateChangeAction<S extends BaseState> = (
  action?: Partial<S> | ((state: S) => Partial<S>),
) => void;

type StateChangeEffect<S extends BaseState> = (
  state: S,
  index: number,
) => void | boolean;

interface StateItem<S extends BaseState, K extends keyof S> {
  data: S[K];
  onChange?: StateChangeEffect<S>;
}

type StateStore<S extends BaseState> = {
  [K in keyof S]: { deps: Exclude<keyof S, K | 'root'>[] } & StateItem<S, K>;
};

interface StateGraph<S extends BaseState, K extends keyof S> {
  key: K;
  value: StateItem<S, K>;
  children: StateGraph<S, Exclude<keyof S, K | 'root'>>[];
}

const buildStateGraph = <S extends BaseState, K extends keyof S>(
  store: StateStore<S>,
  key: K,
): StateGraph<S, K> => ({
  key,
  value: store[key],
  children: (store[key]?.deps || []).map((dep) => buildStateGraph(store, dep)),
});

const parseStateGraph = <S extends BaseState, K extends keyof S>(
  graph: StateGraph<S, K>,
  scope: (keyof S)[],
): StateChangeEffect<S> | null => {
  if (scope.includes(graph.key)) {
    return (state: S) => {
      graph.value.data = state[graph.key];
    };
  }
  const callbacks = graph.children
    .map((child) => parseStateGraph(child, scope))
    .filter((callback) => callback);
  const nextCallbacks = new Set(callbacks);
  return graph.key === 'root' || callbacks.length
    ? (state: S, index: number) => {
        for (const callback of callbacks) {
          if (!nextCallbacks.has(callback)) continue;
          const next = callback?.(state, index);
          if (!next) nextCallbacks.delete(callback);
        }
        if (typeof graph.value.onChange !== 'function') return false;
        return graph.value.onChange(state, index);
      }
    : null;
};

const parseStateStore = <S extends BaseState>(
  store: StateStore<S>,
): StateChangeAction<S> => {
  const graph = buildStateGraph(store, 'root');
  return (action) => {
    const oldState = Object.fromEntries(
      Object.entries(store).map((entry) => [entry[0], entry[1].data]),
    ) as S;
    const partialState: Partial<S> =
      typeof action === 'function' ? action(oldState) : action || {};
    const newState = {
      ...oldState,
      ...partialState,
    };
    const callback = parseStateGraph(
      graph,
      Reflect.ownKeys(partialState) as (keyof S)[],
    );
    graph.value.data();
    for (let index = 0; callback?.(newState, index); index++) {}
  };
};

export {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
  type StateChangeEffect,
};
