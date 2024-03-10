type StateWithRoot<S extends Record<string, unknown> = Record<string, never>> =
  Omit<S, 'root'> & {
    root: (state: StateWithRoot<S>) => number;
  };

type StateChangeAction<S extends StateWithRoot<S>> = (
  action?: Partial<S> | ((state: S) => Partial<S> | void),
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
  :
      | {
          deps: (keyof S)[];
          type?: 'single' | 'multi' | 'dynamic';
          data: S[K];
          onChange?: StateChangeEffect<S>;
        }
      | {
          deps: [];
          type?: 'single' | 'multi' | 'dynamic';
          data?: S[K];
          onChange?: StateChangeEffect<S>;
        };

type StateGraph<S extends StateWithRoot<S>> = StateItem<S>[];

type StateStore<S extends StateWithRoot<S>> = {
  [K in keyof S]: StateItem<S, K>;
};

const makeStateStore = <S extends StateWithRoot<S>>(
  rawStore: StateStore<S>,
): StateStore<S> => {
  const store = { ...rawStore };
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
    store[key] = { ...store[key], deps: Array.from(new Set(newDeps)) };
    todoList.pop();
    doneList.push(key);
  }
  return store;
};

const makeStateGraph = <S extends StateWithRoot<S>>(
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

const makeStateChangeAction =
  <S extends StateWithRoot<S> = StateWithRoot>(
    store: StateStore<S>,
    graph: StateGraph<S>,
  ): StateChangeAction<S> =>
  (action) => {
    const oldState = Object.fromEntries(
      Object.entries(store).map((entry) => [entry[0], entry[1].data]),
    ) as S;
    const partialState =
      typeof action === 'function' ? action(oldState) : action;
    const newState = {
      ...oldState,
      ...partialState,
    };
    if (!partialState) return;
    for (const [key, value] of Object.entries(partialState)) {
      store[key as keyof S].data = value;
    }
    const round = (store.root.data as (state: S) => number)(newState);
    for (let i = 0; i < round; i++) {
      for (const item of graph) {
        const single =
          i === 0 &&
          (item.type === undefined || item.type === 'single') &&
          item.deps.some((dep) => Reflect.has(partialState, dep));
        const multi =
          item.type === 'multi' &&
          item.deps.some((dep) => Reflect.has(partialState, dep));
        const dynamic = item.type === 'dynamic';
        if (single || multi || dynamic) item.onChange?.(newState, i);
      }
    }
  };

const makeDraw = <S extends StateWithRoot<S> = StateWithRoot>(
  rawStore: StateStore<S>,
): StateChangeAction<S> => {
  const store = makeStateStore(rawStore);
  const graph = makeStateGraph(store);
  return makeStateChangeAction(store, graph);
};

export {
  makeDraw,
  type StateChangeAction,
  type StateChangeEffect,
  type StateStore,
  type StateWithRoot,
};
