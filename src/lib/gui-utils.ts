import { GUI } from 'lil-gui';
import { useEffect, useRef } from 'react';

interface BooleanSchema {
  type: 'boolean';
  name: string;
  initialValue: boolean;
  onChange?: (value: boolean) => void;
  onFinishChange?: (value: boolean) => void;
}

interface NumberSchema {
  type: 'number';
  name: string;
  initialValue: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onFinishChange?: (value: number) => void;
}

interface StringSchema {
  type: 'string';
  name: string;
  initialValue: string;
  onChange?: (value: string) => void;
  onFinishChange?: (value: string) => void;
}

interface DropdownBooleanSchema {
  type: 'dropdown';
  name: string;
  initialValue: boolean;
  options: boolean[] | Record<string, boolean>;
  onChange?: (value: boolean) => void;
  onFinishChange?: (value: boolean) => void;
}

interface DropdownNumberSchema {
  type: 'dropdown';
  name: string;
  initialValue: number;
  options: number[] | Record<string, number>;
  onChange?: (value: number) => void;
  onFinishChange?: (value: number) => void;
}

interface DropdownStringSchema {
  type: 'dropdown';
  name: string;
  initialValue: string;
  options: string[] | Record<string, string>;
  onChange?: (value: string) => void;
  onFinishChange?: (value: string) => void;
}

interface ColorStringSchema {
  type: 'color';
  name: string;
  initialValue: string;
  rgbScale?: 1 | 255;
  onChange?: (value: string) => void;
  onFinishChange?: (value: string) => void;
}

interface ColorObjectSchema {
  type: 'color';
  name: string;
  initialValue: Record<'r' | 'g' | 'b', number>;
  rgbScale?: 1 | 255;
  onChange?: (value: Record<'r' | 'g' | 'b', number>) => void;
  onFinishChange?: (value: Record<'r' | 'g' | 'b', number>) => void;
}

interface ColorArraySchema {
  type: 'color';
  name: string;
  initialValue: [number, number, number];
  rgbScale?: 1 | 255;
  onChange?: (value: [number, number, number]) => void;
  onFinishChange?: (value: [number, number, number]) => void;
}

interface FunctionSchema {
  type: 'function';
  name: string;
  initialValue: () => void;
}

interface FolderSchema {
  type: 'folder';
  name: string;
  children: GuiSchema[];
}

type GuiSchema =
  | BooleanSchema
  | NumberSchema
  | StringSchema
  | DropdownBooleanSchema
  | DropdownNumberSchema
  | DropdownStringSchema
  | ColorStringSchema
  | ColorObjectSchema
  | ColorArraySchema
  | FunctionSchema
  | FolderSchema;

interface GuiOptions {
  container: string;
  autoPlace?: boolean;
  width?: number;
  title?: string;
  closeFolders?: boolean;
  injectStyles?: boolean;
  touchStyles?: number;
}

const addSchema = (gui: GUI, schema: GuiSchema): void => {
  switch (schema.type) {
    case 'boolean': {
      const { name, initialValue, onChange, onFinishChange } = schema;
      const controller = gui.add({ initialValue }, 'initialValue').name(name);
      onChange && controller.onChange(onChange);
      onFinishChange && controller.onChange(onFinishChange);
      return;
    }
    case 'number': {
      const { name, initialValue, min, max, step, onChange, onFinishChange } =
        schema;
      const controller = gui.add({ initialValue }, 'initialValue').name(name);
      min && controller.min(min);
      max && controller.max(max);
      step && controller.step(step);
      onChange && controller.onChange(onChange);
      onFinishChange && controller.onChange(onFinishChange);
      return;
    }
    case 'string': {
      const { name, initialValue, onChange, onFinishChange } = schema;
      const controller = gui.add({ initialValue }, 'initialValue').name(name);
      onChange && controller.onChange(onChange);
      onFinishChange && controller.onChange(onFinishChange);
      return;
    }
    case 'dropdown': {
      const { name, initialValue, options, onChange, onFinishChange } = schema;
      const controller = gui
        .add({ initialValue }, 'initialValue', options)
        .name(name);
      onChange && controller.onChange(onChange);
      onFinishChange && controller.onChange(onFinishChange);
      return;
    }
    case 'color': {
      const { name, initialValue, rgbScale, onChange, onFinishChange } = schema;
      const controller = gui
        .addColor({ initialValue }, 'initialValue', rgbScale)
        .name(name);
      onChange && controller.onChange(onChange);
      onFinishChange && controller.onChange(onFinishChange);
      return;
    }
    case 'function': {
      const { name, initialValue } = schema;
      gui.add({ initialValue }, 'initialValue').name(name);
      return;
    }
    case 'folder': {
      const { name, children } = schema;
      const subGui = gui.addFolder(name);
      for (const subSchema of children) {
        addSchema(subGui, subSchema);
      }
      return;
    }
    default:
      return;
  }
};

const useGui = (schemas: GuiSchema[], options: GuiOptions): void => {
  const guiRef = useRef<GUI | null>(null);

  useEffect(() => {
    const gui = new GUI({
      ...options,
      container: document.querySelector<HTMLElement>(options.container)!,
    });
    for (const schema of schemas) {
      addSchema(gui, schema);
    }
    guiRef.current = gui;
    return () => {
      guiRef.current?.destroy();
      guiRef.current = null;
    };
  }, [schemas, options]);
};

export { useGui, type GuiOptions, type GuiSchema };
