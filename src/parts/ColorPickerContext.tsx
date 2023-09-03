import Color from '@thednp/color';
import React from 'react';
import { createContext, useContext } from 'react';
import type { LanguagePack, SupportedFormat, Accessor } from '../types/types';
import initialControlPositions from '../util/initialControlPositions';

export const PickerContext = createContext({
  format: 'rgb' as SupportedFormat,
  color: new Color('red'),
  setColor: (() => {}) as React.Dispatch<React.SetStateAction<Color>>,
  value: 'red',
  setValue: (() => {}) as React.Dispatch<React.SetStateAction<string>>,
  setInputValue: (() => {}) as React.Dispatch<React.SetStateAction<string>>,
  locale: (() => {}) as Accessor<LanguagePack>,
  drag: null as HTMLElement | null,
  setDrag: (() => {}) as React.Dispatch<React.SetStateAction<HTMLElement | null>>,
  controlPositions: initialControlPositions,
  setControlPositions: (() => {}) as React.Dispatch<React.SetStateAction<typeof initialControlPositions>>,
  update: (_color: Color) => {},
  updateControlPositions: () => {},
});

export const usePickerContext = () => useContext(PickerContext);
