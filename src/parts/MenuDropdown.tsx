import Color from '@thednp/color';
import ColorPicker from '@thednp/color-picker';
import { type CSSProperties, type RefObject, forwardRef, Suspense } from 'react';
import type { KeyProps, MenuProps, PresetsProps } from '../types/types';
import { usePickerContext } from './ColorPickerContext';
import { ObjectEntries } from '@thednp/shorty';

const { ColorPalette } = ColorPicker;

const PresetsMenu = (props: PresetsProps) => {
  const { locale, value, update, format } = usePickerContext();
  const { colorPresets } = props;
  const colors = () =>
    new ColorPalette(colorPresets.hue, colorPresets.hueSteps, colorPresets.lightSteps, colorPresets.saturation).colors;
  const colorsCount = () => colors().length;
  const fit = () => colorPresets.lightSteps;
  const isMultiLine = () => colorsCount() > fit();
  const rowCountHover = () => {
    if (isMultiLine() && colorsCount() > fit() * 4) return 5;
    if (isMultiLine() && colorsCount() > fit() * 3) return 4;
    if (isMultiLine() && colorsCount() > fit() * 2) return 3;
    return 2;
  };
  const rowCount = () => rowCountHover() - (colorsCount() <= fit() * 3 ? 1 : 2);
  const finalClass = () =>
    `color-options` +
    (isMultiLine() && colorsCount() > rowCount() * fit() ? ' scrollable' : '') +
    (isMultiLine() ? ' multiline' : '');

  const style = () => {
    const gap = isMultiLine() ? '1px' : '0.25rem';
    const optionSize = fit() > 5 && isMultiLine() ? 1.5 : isMultiLine() ? 1.75 : 2;
    const menuHeight = `${rowCount() * optionSize}rem`;
    const menuHeightHover = `calc(${rowCountHover()} * ${optionSize}rem + ${rowCountHover() - 1} * ${gap})`;

    return {
      '--grid-item-size': `${optionSize}rem`,
      '--grid-fit': fit(),
      '--grid-gap': gap,
      '--grid-height': menuHeight,
      '--grid-hover-height': menuHeightHover,
    };
  };

  return (
    <Suspense>
      <ul className={finalClass()} role="listbox" aria-label={locale().presetsLabel} style={style() as CSSProperties}>
        {colors().map(color => {
          const newColor = () => new Color(color, format);
          const newValue = () => newColor().toString();
          const isActive = () => newValue() === value;
          const getClass = () => `color-option${isActive() ? ' active' : ''}`;
          return (
            <li
              key={newValue()}
              tabIndex={0}
              role="option"
              aria-selected={isActive()}
              className={getClass()}
              onClick={() => update(newColor())}
              style={{ backgroundColor: color.toRgbString() }}
            >
              {newValue()}
            </li>
          );
        })}
      </ul>
    </Suspense>
  );
};

const KeywordsMenu = (props: KeyProps) => {
  const { colorKeywords } = props;
  const { locale, value, update, format } = usePickerContext();

  return (
    <Suspense>
      <ul className="color-defaults" role="listbox" aria-label={locale().defaultsLabel}>
        {colorKeywords.map(key => {
          const [label, val] = typeof key === 'string' ? [key, key] : (ObjectEntries(key)[0] as [string, string]);
          const isActive = () => val === value;
          const className = () => `color-option${isActive() ? ' active' : ''}`;
          return (
            <li
              key={label}
              className={className()}
              onClick={() => update(new Color(val, format))}
              tabIndex={0}
              role="option"
              aria-selected={isActive()}
            >
              {label}
            </li>
          );
        })}
      </ul>
    </Suspense>
  );
};

const MenuDropdown = forwardRef((props: MenuProps, ref: RefObject<HTMLDivElement>) => {
  const { colorKeywords, colorPresets, className } = props;
  const id = () => `${props.id}-menu`;
  const menuClass = () => `color-dropdown menu${className}`;
  return (
    <>
      {(typeof colorKeywords !== 'undefined' && colorKeywords) ||
      (typeof colorPresets !== 'undefined' && colorPresets) ? (
        <>
          {props.children}
          <div id={id()} ref={ref} className={menuClass()}>
            {typeof colorPresets !== 'undefined' && colorPresets ? <PresetsMenu {...(props as PresetsProps)} /> : null}
            {typeof colorKeywords !== 'undefined' && colorKeywords ? <KeywordsMenu {...(props as KeyProps)} /> : null}
          </div>
        </>
      ) : null}
    </>
  );
});

export default MenuDropdown;
