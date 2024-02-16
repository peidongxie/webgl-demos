type StateWithRoot<S extends Record<string, unknown> = Record<string, never>> =
  Omit<S, 'root'> & {
    root: (state: StateWithRoot<S>) => number;
  };

type StateChangeAction<S extends StateWithRoot<S>> = (
  action?: Partial<S> | ((state: S) => Partial<S>),
) => void;

type StateChangeEffect<S extends StateWithRoot<S>> = (
  state: S,
  index: number,
) => void;

type StateItem<
  S extends StateWithRoot<S>,
  K extends keyof S = keyof S,
> = K extends never
  ? never
  : {
      deps: (keyof S)[];
      data: S[K];
      onChange?: StateChangeEffect<S>;
    };

type StateGraph<S extends StateWithRoot<S>> = StateItem<S>[];

type StateStore<S extends StateWithRoot<S>> = {
  [K in keyof S]: StateItem<S, K>;
};

const resetStateDeps = <S extends StateWithRoot<S>>(
  store: StateStore<S>,
): void => {
  const todoList: (keyof S)[] = ['root'];
  const doneList: (keyof S)[] = [];
  while (todoList.length > 0) {
    const key = todoList[todoList.length - 1]!;
    const { deps } = store[key];
    const todoDeps = deps.filter(
      (dep) => !doneList.includes(dep) && dep !== key,
    );
    if (todoDeps.length) {
      todoList.push(...todoDeps);
      continue;
    }
    const newDeps = deps.map((dep) => store[dep].deps).flat();
    newDeps.unshift(key);
    store[key].deps = Array.from(new Set(newDeps));
    todoList.pop();
    doneList.push(key);
  }
};

const buildStateGraph = <S extends StateWithRoot<S>>(
  store: StateStore<S>,
): StateGraph<S> => {
  const graph: StateGraph<S> = [];
  for (const [key, value] of Object.entries(store)) {
    const item = store[key as keyof S];
    const items = (value as StateItem<S>).deps.map((dep) => store[dep]);
    const index = graph.findIndex((item) => items.includes(item));
    if (index < 0) {
      graph.push(item);
    } else {
      graph.splice(index, 0, item);
    }
  }
  return graph.reverse();
};

const parseStateStore = <S extends StateWithRoot<S> = StateWithRoot>(
  store: StateStore<S>,
): StateChangeAction<S> => {
  resetStateDeps(store);
  const graph = buildStateGraph(store);
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
    for (const [key, value] of Object.entries(partialState)) {
      store[key as keyof S].data = value;
    }
    const round = (store.root.data as (state: S) => number)(newState);
    const callbacks = graph
      .filter((item) => item.deps.some((dep) => Reflect.has(partialState, dep)))
      .map((item) => item.onChange);
    for (let index = 0; index < round; index++) {
      for (const callback of callbacks) {
        callback?.(newState, index);
      }
    }
  };
};

export {
  parseStateStore,
  type StateChangeAction,
  type StateChangeEffect,
  type StateWithRoot,
};
