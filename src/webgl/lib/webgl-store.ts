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

interface StateTree<S extends BaseState, K extends keyof S> {
  key: K;
  value: StateItem<S, K>;
  children: StateTree<S, Exclude<keyof S, K | 'root'>>[];
}

const buildStateTree = <S extends BaseState, K extends keyof S>(
  store: StateStore<S>,
  key: K,
): StateTree<S, K> => ({
  key,
  value: store[key],
  children: (store[key]?.deps || []).map((dep) => buildStateTree(store, dep)),
});

const parseStateTree = <S extends BaseState, K extends keyof S>(
  tree: StateTree<S, K>,
  scope: (keyof S)[],
): StateChangeEffect<S> | null => {
  if (scope.includes(tree.key)) {
    return (state: S) => {
      tree.value.data = state[tree.key];
    };
  }
  const callbacks = tree.children
    .map((child) => parseStateTree(child, scope))
    .filter((callback) => callback);
  const nextCallbacks = new Set(callbacks);
  return tree.key === 'root' || callbacks.length
    ? (state: S, index: number) => {
        for (const callback of callbacks) {
          if (!nextCallbacks.has(callback)) continue;
          const next = callback?.(state, index);
          if (!next) nextCallbacks.delete(callback);
        }
        if (typeof tree.value.onChange !== 'function') return false;
        return tree.value.onChange(state, index);
      }
    : null;
};

const parseStateStore = <S extends BaseState>(
  store: StateStore<S>,
): StateChangeAction<S> => {
  const tree = buildStateTree(store, 'root');
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
    const callback = parseStateTree(
      tree,
      Reflect.ownKeys(partialState) as (keyof S)[],
    );
    tree.value.data();
    for (let index = 0; callback?.(newState, index); index++) {}
  };
};

export {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
  type StateChangeEffect,
};
