import Color from '@thednp/color';
import ColorPicker from '@thednp/color-picker';
import { type CSSProperties, type KeyboardEvent, forwardRef, Suspense, ForwardedRef, useId } from 'react';
import type { KeyProps, MenuProps, PresetsProps } from '../types/types';
import { usePickerContext } from './ColorPickerContext';
import {
  ObjectEntries,
  hasClass,
  keyArrowDown,
  keyArrowUp,
  keySpace,
  keyEnter,
  keyNumpadEnter,
  keyArrowLeft,
  keyArrowRight,
  getElementStyle,
  focus,
} from '@thednp/shorty';

const { ColorPalette } = ColorPicker;

const PresetsMenu = (props: PresetsProps) => {
  const { locale, value, update, format } = usePickerContext();
  const { colorPresets, keyHandler } = props;
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
      <ul
        className={finalClass()}
        role="listbox"
        aria-label={locale().presetsLabel}
        style={style() as CSSProperties}
        onKeyDown={keyHandler}
      >
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
  const { colorKeywords, keyHandler } = props;
  const { locale, value, update, format } = usePickerContext();

  return (
    <Suspense>
      <ul className="color-defaults" role="listbox" aria-label={locale().defaultsLabel} onKeyDown={keyHandler}>
        {colorKeywords.map(key => {
          const [label, val] = typeof key === 'string' ? [key, key] : (ObjectEntries(key)[0] as [string, string]);
          const newColor = () => new Color(val, format);
          const isActive = () => newColor().toString() === value;
          const className = () => `color-option${isActive() ? ' active' : ''}`;
          return (
            <li
              key={label}
              className={className()}
              onClick={() => update(newColor())}
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

const MenuDropdown = forwardRef((props: MenuProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { colorKeywords, colorPresets, className } = props;
  const id = () => `${useId()}menu`;
  const menuClass = () => `color-dropdown menu${className}`;
  const keyHandler = (e: KeyboardEvent<HTMLElement>) => {
    const { target, currentTarget, code } = e;
    const { previousElementSibling, nextElementSibling, parentElement } = target as HTMLElement & {
      previousElementSibling: HTMLElement | undefined;
      nextElementSibling: HTMLElement | undefined;
      parentElement: HTMLElement;
    };
    const isColorOptionsMenu = hasClass(currentTarget, 'color-options');
    const allSiblings = [...parentElement.children] as HTMLElement[];
    const columnsCount =
      isColorOptionsMenu && getElementStyle(parentElement, 'grid-template-columns').split(' ').length;
    const currentIndex = allSiblings.indexOf(target as HTMLElement);
    const previousElement = currentIndex > -1 && columnsCount && allSiblings[currentIndex - columnsCount];
    const nextElement = currentIndex > -1 && columnsCount && allSiblings[currentIndex + columnsCount];

    if ([keyArrowDown, keyArrowUp, keySpace].includes(code)) {
      // prevent scroll when navigating the menu via arrow keys / Space
      e.preventDefault();
    }
    if (isColorOptionsMenu) {
      if (previousElement && code === keyArrowUp) {
        focus(previousElement);
      } else if (nextElement && code === keyArrowDown) {
        focus(nextElement);
      } else if (typeof previousElementSibling !== 'undefined' && code === keyArrowLeft) {
        focus(previousElementSibling as HTMLElement);
      } else if (typeof nextElementSibling !== 'undefined' && code === keyArrowRight) {
        focus(nextElementSibling as HTMLElement);
      }
    } else if (typeof previousElementSibling !== 'undefined' && [keyArrowLeft, keyArrowUp].includes(code)) {
      focus(previousElementSibling as HTMLElement);
    } else if (typeof nextElementSibling !== 'undefined' && [keyArrowRight, keyArrowDown].includes(code)) {
      focus(nextElementSibling as HTMLElement);
    }

    if ([keyEnter, keySpace, keyNumpadEnter].includes(code)) {
      (target as HTMLElement).click();
    }
  };

  return (
    <>
      {(typeof colorKeywords !== 'undefined' && colorKeywords.length) || typeof colorPresets === 'object' ? (
        <>
          {props.children}
          <div id={id()} ref={ref} className={menuClass()}>
            {typeof colorPresets === 'object' ? <PresetsMenu {...({ ...props, keyHandler } as PresetsProps)} /> : null}
            {typeof colorKeywords !== 'undefined' && colorKeywords.length ? (
              <KeywordsMenu {...({ ...props, keyHandler } as KeyProps)} />
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
});

export default MenuDropdown;
