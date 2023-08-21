import ColorPicker from '@thednp/color-picker';

const { colorPickerLabels, colorNames } = ColorPicker;

export type ColorPickerProps = {
  id?: string;
  label?: string;
  value?: string;
  format?: string;
  className?: string;
  placeholder?: string;
  onChange?: (color: string) => void;
  colorPickerLabels?: typeof colorPickerLabels;
  colorNames?: typeof colorNames;
};
