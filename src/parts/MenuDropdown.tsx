import Color from "@thednp/color";
import ColorPicker from "@thednp/color-picker";
import {
  type CSSProperties,
  ForwardedRef,
  forwardRef,
  type KeyboardEvent,
  useId,
} from "react";
import type { KeyProps, MenuProps, PresetsProps } from "../types/types";
import { usePickerContext } from "./ColorPickerContext";
import {
  focus,
  getElementStyle,
  hasClass,
  keyArrowDown,
  keyArrowLeft,
  keyArrowRight,
  keyArrowUp,
  keyEnter,
  keySpace,
  ObjectEntries,
} from "@thednp/shorty";

const { ColorPalette } = ColorPicker;

const PresetsMenu = (props: PresetsProps) => {
  const {
    locale,
    value,
    setColor,
    format,
    setValue,
    setInputValue,
    updateControlPositions,
  } = usePickerContext();
  const { colorPresets, keyHandler } = props;
  const colors = () =>
    new ColorPalette(
      colorPresets.hue,
      colorPresets.hueSteps,
      colorPresets.lightSteps,
      colorPresets.saturation,
    ).colors;
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
    (isMultiLine() && colorsCount() > rowCount() * fit() ? " scrollable" : "") +
    (isMultiLine() ? " multiline" : "");

  const style = () => {
    const gap = isMultiLine() ? "1px" : "0.25rem";
    const optionSize = fit() > 5 && isMultiLine()
      ? 1.5
      : isMultiLine()
      ? 1.75
      : 2;
    const menuHeight = `${rowCount() * optionSize}rem`;
    const menuHeightHover = `calc(${rowCountHover()} * ${optionSize}rem + ${
      rowCountHover() - 1
    } * ${gap})`;

    return {
      "--grid-item-size": `${optionSize}rem`,
      "--grid-fit": fit(),
      "--grid-gap": gap,
      "--grid-height": menuHeight,
      "--grid-hover-height": menuHeightHover,
    };
  };

  return (
    <ul
      className={finalClass()}
      role="listbox"
      aria-label={locale().presetsLabel}
      style={style() as CSSProperties}
      onKeyDown={keyHandler}
    >
      {colors().map((color) => {
        const newColor = () => new Color(color, format);
        const newValue = () => newColor().toString();
        const isActive = () => newValue() === value;
        const getClass = () => `color-option${isActive() ? " active" : ""}`;
        const clickHandler = () => {
          setColor(newColor());
          setInputValue(newValue());
          setValue(newValue());
          updateControlPositions(newColor());
        };
        return (
          <li
            key={newValue()}
            tabIndex={0}
            role="option"
            aria-selected={isActive()}
            className={getClass()}
            data-value={newValue()}
            onClick={clickHandler}
            style={{ backgroundColor: color.toRgbString() }}
          >
            {newValue()}
          </li>
        );
      })}
    </ul>
  );
};

const KeywordsMenu = (props: KeyProps) => {
  const { colorKeywords, keyHandler } = props;
  const {
    locale,
    value,
    setColor,
    format,
    setValue,
    setInputValue,
    updateControlPositions,
  } = usePickerContext();

  return (
    <ul
      className="color-defaults"
      role="listbox"
      aria-label={locale().defaultsLabel}
      onKeyDown={keyHandler}
    >
      {colorKeywords.map((key) => {
        const [label, val] = typeof key === "string"
          ? [key, key]
          : (ObjectEntries(key)[0] as [string, string]);
        const newColor = () => new Color(val, format);
        const newValue = () => newColor().toString();
        const isActive = () => newColor().toString() === value;
        const className = () => `color-option${isActive() ? " active" : ""}`;
        const clickHandler = () => {
          setColor(newColor());
          setInputValue(newValue());
          setValue(newValue());
          updateControlPositions(newColor());
        };
        return (
          <li
            key={label}
            className={className()}
            onClick={clickHandler}
            tabIndex={0}
            role="option"
            data-value={val}
            aria-selected={isActive()}
          >
            {label}
          </li>
        );
      })}
    </ul>
  );
};

const MenuDropdown = forwardRef(
  (props: MenuProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      colorKeywords,
      colorPresets,
      className,
      toggleMenu,
      pickerShown,
      menuShown,
    } = props;
    const { locale } = usePickerContext();
    const id = () => `${useId()}menu`;
    const menuClass = () => `color-dropdown menu${className}`;
    const keyHandler = (e: KeyboardEvent<HTMLElement>) => {
      const { target, currentTarget, key } = e;
      const { previousElementSibling, nextElementSibling, parentElement } =
        target as HTMLElement & {
          previousElementSibling: HTMLElement | undefined;
          nextElementSibling: HTMLElement | undefined;
          parentElement: HTMLElement;
        };
      const isColorOptionsMenu = hasClass(currentTarget, "color-options");
      const allSiblings = [...parentElement.children] as HTMLElement[];
      const columnsCount = (isColorOptionsMenu &&
        Number(getElementStyle(parentElement, "--grid-fit") || 0)) || 0;
      const currentIndex = allSiblings.indexOf(target as HTMLElement);
      const previousElement = currentIndex > -1 && columnsCount &&
        allSiblings[currentIndex - columnsCount];
      const nextElement = currentIndex > -1 && columnsCount &&
        allSiblings[currentIndex + columnsCount];
      // istanbul ignore else @preserve
      if ([keyArrowDown, keyArrowUp, keySpace].includes(key)) {
        // prevent scroll when navigating the menu via arrow keys / Space
        e.preventDefault();
      }
      // istanbul ignore else @preserve
      if (isColorOptionsMenu) {
        // istanbul ignore else @preserve
        if (previousElement && key === keyArrowUp) {
          focus(previousElement);
        } else if (nextElement && key === keyArrowDown) {
          focus(nextElement);
        } else if (
          typeof previousElementSibling !== "undefined" && key === keyArrowLeft
        ) {
          focus(previousElementSibling as HTMLElement);
        } else if (
          typeof nextElementSibling !== "undefined" && key === keyArrowRight
        ) {
          focus(nextElementSibling as HTMLElement);
        }
      } else if (
        typeof previousElementSibling !== "undefined" &&
        [keyArrowLeft, keyArrowUp].includes(key)
      ) {
        focus(previousElementSibling as HTMLElement);
      } else if (
        typeof nextElementSibling !== "undefined" &&
        [keyArrowRight, keyArrowDown].includes(key)
      ) {
        focus(nextElementSibling as HTMLElement);
      }

      // istanbul ignore else @preserve
      if ([keyEnter, keySpace].includes(key)) {
        (target as HTMLElement).click();
      }
    };

    return (
      <>
        {(typeof colorKeywords !== "undefined" && colorKeywords.length) ||
            typeof colorPresets === "object"
          ? (
            <>
              <button
                type="button"
                className="menu-toggle btn-appearance"
                tabIndex={menuShown || pickerShown ? 0 : -1}
                aria-expanded={menuShown}
                aria-haspopup={true}
                onClick={toggleMenu}
              >
                <span className="v-hidden">{locale().toggleLabel}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  aria-hidden="true"
                >
                  <path
                    d="M98,158l157,156L411,158l27,27L255,368L71,185L98,158z"
                    fill="#fff"
                  >
                  </path>
                </svg>
              </button>
              <div id={id()} ref={ref} className={menuClass()}>
                {typeof colorPresets === "object"
                  ? (
                    <PresetsMenu
                      {...({ ...props, keyHandler } as PresetsProps)}
                    />
                  )
                  : null}
                {typeof colorKeywords !== "undefined" && colorKeywords.length
                  ? <KeywordsMenu {...({ ...props, keyHandler } as KeyProps)} />
                  : null}
              </div>
            </>
          )
          : null}
      </>
    );
  },
);

export default MenuDropdown;
