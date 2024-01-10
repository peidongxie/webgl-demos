interface StateItem<S extends Record<'root', unknown>, K extends keyof S> {
  deps: Exclude<keyof S, K | 'root'>[];
  value: S[K];
  setValue?: (state: S) => void;
}

type StateStore<S extends Record<'root', unknown>> = {
  [K in keyof S]: StateItem<S, K>;
};

interface StateTree<S extends Record<'root', unknown>> {
  key: keyof S;
  value: StateItem<S, keyof S>;
  children: StateTree<S>[];
}

type SetState<S extends { root: unknown }> = (
  action?: Partial<S> | ((state: S) => Partial<S>),
) => void;

const buildStateTree = <S extends { root: unknown }>(
  store: StateStore<S>,
  key: keyof S = 'root',
): StateTree<S> => {
  const value = store[key];
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
  if (scope.includes(tree.key)) {
    return (state: S) => (tree.value.value = state[tree.key]);
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
): SetState<S> => {
  const tree = buildStateTree<S>(store);
  return (action) => {
    const oldState = Object.fromEntries(
      Object.entries(store).map((entry) => [entry[0], entry[1].value]),
    ) as S;
    const partialState: Partial<S> =
      typeof action === 'function' ? action(oldState) : action || {};
    const newState = {
      ...oldState,
      ...partialState,
    };
    const callback = parseStateTree<S>(
      tree,
      Reflect.ownKeys(partialState) as (keyof S)[],
    );
    console.log(newState);
    callback?.(newState);
  };
};

export { parseStateStore, type SetState };
