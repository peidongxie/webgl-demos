interface StateItem<S extends { root: unknown }, K extends keyof S> {
  deps: Exclude<keyof S, K>[];
  value: S[K];
  setValue?: (state: S) => void;
}

type StateStore<S extends { root: unknown }> = {
  [K in keyof S]: StateItem<S, K>;
};

interface StateTree<S extends { root: unknown }> {
  key: keyof S;
  value: StateItem<S, keyof S>;
  children: StateTree<S>[];
}

const buildStateTree = <S extends { root: unknown }>(
  store: StateStore<S>,
  key: keyof S = 'root',
): StateTree<S> => {
  const value = store[key as keyof StateStore<S>];
  const children = (value?.deps || []).map((dep) => buildStateTree(store, dep));
  return {
    key,
    value,
    children,
  };
};

const parseStateTree = <S extends { root: unknown }>(
  tree: StateTree<S>,
  scope: (keyof S)[],
): ((state: S) => void) | null => {
  if (scope.includes(tree.key as keyof S)) {
    return (state: S) => tree.value.setValue?.(state);
  }
  const callbacks = tree.children
    .map((child) => parseStateTree(child, scope))
    .filter((callback) => callback);
  if (tree.key !== 'root' && !callbacks.length) return null;
  return (state: S) => {
    for (const callback of callbacks) callback?.(state);
    tree.value.setValue?.(state);
  };
};

const parseStateStore = <S extends { root: unknown }>(
  store: StateStore<S>,
): ((newState?: Partial<S>) => void) => {
  const tree = buildStateTree<S>(store);
  return (newState) => {
    const callback = parseStateTree<S>(
      tree,
      Reflect.ownKeys(newState || {}) as (keyof S)[],
    );
    for (const [key, value] of Object.entries(newState || {})) {
      store[key as keyof S].value = value;
    }
    const entries = Object.entries(store).map((entry) => [
      entry[0],
      entry[1].value,
    ]);
    callback?.(Object.fromEntries(entries));
  };
};

export { parseStateStore };
