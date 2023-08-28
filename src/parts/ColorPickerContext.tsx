import Color from '@thednp/color';
import React from 'react';
import { createContext, useContext } from 'react';
import type { LanguagePack, SupportedFormat, Accessor } from '../types/types';
import initialControlPositions from '../util/initialControlPositions';

export const PickerContext = createContext({
  format: (() => 'rgb') as Accessor<SupportedFormat>,
  color: {} as Color,
  setColor: (() => {}) as React.Dispatch<React.SetStateAction<Color>>,
  locale: (() => {}) as Accessor<LanguagePack>,
  drag: null as HTMLElement | null,
  setDrag: (() => {}) as React.Dispatch<React.SetStateAction<HTMLElement | null>>,
  value: '',
  setValue: (() => {}) as React.Dispatch<React.SetStateAction<string>>,
  visuals: (() => []) as Accessor<HTMLElement[]>,
  knobs: (() => []) as Accessor<HTMLElement[]>,
  inputs: (() => []) as Accessor<HTMLElement[]>,
  appearance: (() => '') as Accessor<string>,
  controlPositions: initialControlPositions,
  setControlPositions: (() => []) as React.Dispatch<React.SetStateAction<typeof initialControlPositions>>,
  update: (_color: Color) => {},
  updateControlPositions: () => {},
  hue: (() => 0) as Accessor<number>,
  saturation: (() => 0) as Accessor<number>,
  lightness: (() => 0) as Accessor<number>,
  alpha: (() => 0) as Accessor<number>,
  fill: (() => {}) as Accessor<Color>,
  fillGradient: (() => '') as Accessor<string>,
});

export const usePickerContext = () => useContext(PickerContext);
