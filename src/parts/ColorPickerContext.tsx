import Color from "@thednp/color";
import { createContext, useContext } from "react";
import type {
  Accessor,
  LanguagePack,
  Setter,
  SupportedFormat,
} from "../types/types";
import initialControlPositions from "../util/initialControlPositions";

export type ColorPickerContext = {
  format: SupportedFormat;
  color: Color;
  setColor: Setter<Color>;
  locale: Accessor<LanguagePack>;
  drag: HTMLElement | undefined | null;
  setDrag: Setter<HTMLElement | undefined | null>;
  value: string;
  setValue: Setter<string>;
  setInputValue: Setter<string>;
  controlPositions: typeof initialControlPositions;
  setControlPositions: Setter<typeof initialControlPositions>;
  updateControlPositions: (newColor: Color) => void;
};

export const PickerContext = createContext({} as ColorPickerContext);

export const usePickerContext = () => useContext(PickerContext);
