let glEnums: Record<number, string> | null = null;

const init = (ctx: WebGLRenderingContext): void => {
  if (glEnums === null) {
    glEnums = {};
    for (const key in ctx) {
      if (key !== key.toUpperCase()) continue;
      const value = ctx[key as keyof WebGLRenderingContext];
      if (typeof value !== 'number') continue;
      glEnums[value] = key;
    }
  }
};

const checkInit = (): void => {
  if (glEnums === null) throw 'WebGLDebugUtils.init(ctx) not called';
};

const mightBeEnum = (value: number): boolean => {
  checkInit();
  return !!glEnums?.[value];
};

const glEnumToString = (value: number): string => {
  checkInit();
  return (
    glEnums?.[value] || '*UNKNOWN WebGL ENUM (0x' + value.toString(16) + ')'
  );
};

export { init, mightBeEnum, glEnumToString };
