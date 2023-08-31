import Color from '@thednp/color';
import { addListener, removeListener } from '@thednp/event-listener';
import {
  getWindow,
  getDocumentElement,
  getBoundingClientRect,
  reflow,
  emulateTransitionEnd,
  getDocument,
  keyArrowUp,
  keyArrowDown,
  keyArrowLeft,
  keyArrowRight,
  keySpace,
  keyEnter,
  getElementStyle,
  focus,
  ObjectAssign,
  ObjectKeys,
} from '@thednp/shorty';

import { useState, useEffect, startTransition, useMemo, useRef, ChangeEvent, useId, Suspense } from 'react';
import type { ColorPickerProps } from '../types/types';
import { PickerContext } from '../parts/ColorPickerContext';
import initialControlPositions from '../util/initialControlPositions';
import { languagePacks, getLanguageStrings } from '../locales/getLanguageStrings';
import Arrow from '../assets/Arrow';

import PickerDropdown from '../parts/PickerDropdown';
import MenuDropdown from '../parts/MenuDropdown';

// import default color picker style
import './color-picker.css';

const { roundPart } = Color;

const DefaultColorPicker = (props: ColorPickerProps) => {
  // const { value, setValue, color, setColor } = usePickerContext();
  const id = () => props.id || `color:picker${useId()}`;
  const lang = () => props.lang || 'en';
  const theme = () => props.theme || 'dark';
  const format = () => props.format || 'rgb';
  const initValue = () => props.value || 'red';
  const locale = () => {
    if (props.lang && 'en' !== props.lang && ObjectKeys(languagePacks).includes(props.lang)) {
      return getLanguageStrings(props.lang);
    }
    const langPack = getLanguageStrings(lang());

    if (props.locale && ObjectKeys(props.locale).length === 35) {
      ObjectAssign(langPack, props.locale);
    }

    return langPack;
  };
  const colorPresets = () => props.colorPresets;
  const colorKeywords = () => props.colorKeywords;
  const placeholder = () =>
    props.placeholder ? props.placeholder : locale().placeholder.replace(/%/g, format().toUpperCase());
  const offsetHeight = () => (window.innerWidth >= 980 ? 300 : 230);
  const offsetWidth = () => (window.innerWidth >= 980 ? 300 : 230);

  const [value, setValue] = useState<string>(initValue());
  const [color, setColor] = useState<Color>(new Color(value, format()));
  const [open, setOpen] = useState<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<HTMLElement | null>(null);
  const [pickerShown, setPickerShown] = useState<boolean>(false);
  const [menuShown, setMenuShown] = useState<boolean>(false);
  const [position, setPosition] = useState<string>('');
  const [controlPositions, setControlPositions] = useState<typeof initialControlPositions>(initialControlPositions);
  // allow this to be readily available on typing on inputs
  const isDark = () => {
    const temp = new Color(value);
    return temp.isDark && temp.a > 0.33;
  };
  const className = () =>
    [
      'color-picker',
      ...[props.className ? props.className.split(/\s/) : ''],
      isDark() ? 'txt-dark' : 'txt-light',
      theme() === 'light' ? ' light' : '',
      open ? 'open' : '',
    ]
      .filter(c => c)
      .join(' ');

  const mainRef = useRef<HTMLDivElement>(null);
  const pickerDropdown = useRef<HTMLDivElement>(null);
  const menuDropdown = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const hue = () => controlPositions.c2y / offsetHeight();
  const lightness = () => roundPart(color.toHsv().v * 100);
  const saturation = () => roundPart(color.toHsv().s * 100);
  const alpha = () => 1 - controlPositions.c3y / offsetHeight();
  const fill = () => {
    return new Color({
      h: hue(),
      s: 1,
      l: 0.5,
      a: alpha(),
    });
  };
  const fillGradient = () => {
    const roundA = roundPart(alpha() * 100) / 100;

    return `linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,${roundA}) 100%),
          linear-gradient(to right, rgba(255,255,255,${roundA}) 0%, ${fill().toRgbString()} 100%), 
          linear-gradient(rgb(255,255,255) 0%, rgb(255,255,255) 100%)`;
  };

  const updateDropdownPosition = () => {
    const elRect = getBoundingClientRect(input.current as HTMLInputElement);
    const { top, bottom } = elRect;
    const { offsetHeight: elHeight } = input.current as HTMLInputElement;
    const windowHeight = getDocumentElement(input.current as HTMLInputElement).clientHeight;
    const dropdown = open;
    if (!dropdown) return;
    const { offsetHeight: dropHeight } = dropdown;
    const distanceBottom = windowHeight - bottom;
    const distanceTop = top;
    const bottomExceed = top + dropHeight + elHeight > windowHeight; // show
    const topExceed = top - dropHeight < 0; // show-top

    if ((dropdown === pickerDropdown.current || !topExceed) && distanceBottom < distanceTop && bottomExceed) {
      setPosition('top');
    } else {
      setPosition('bottom');
    }
  };
  const pickerClass = () => {
    return `${open === pickerDropdown.current ? ' ' + position : ''}${pickerShown ? ' show' : ''}`;
  };
  const menuClass = () => {
    return `${open === menuDropdown.current ? ' ' + position : ''}${menuShown ? ' show' : ''}`;
  };

  const appearance = () => {
    const hsl = color.toHsl();
    const hsv = color.toHsv();
    const hue = roundPart(hsl.h * 360);
    const saturationSource = format() === 'hsl' ? hsl.s : hsv.s;
    const saturation = roundPart(saturationSource * 100);
    const lightness = roundPart(hsl.l * 100);
    const hsvl = hsv.v * 100;

    let colorName = 'black';

    // determine color appearance
    /* istanbul ignore else */
    if (lightness === 100 && saturation === 0) {
      colorName = locale().white;
    } else if (lightness === 0) {
      colorName = locale().black;
    } else if (saturation === 0) {
      colorName = locale().grey;
    } else if (hue < 15 || hue >= 345) {
      colorName = locale().red;
    } else if (hue >= 15 && hue < 45) {
      colorName = hsvl > 80 && saturation > 80 ? locale().orange : locale().brown;
    } else if (hue >= 45 && hue < 75) {
      const isGold = hue > 46 && hue < 54 && hsvl < 80 && saturation > 90;
      const isOlive = hue >= 54 && hue < 75 && hsvl < 80;
      colorName = isGold ? locale().gold : locale().yellow;
      colorName = isOlive ? locale().olive : colorName;
    } else if (hue >= 75 && hue < 155) {
      colorName = hsvl < 68 ? locale().green : locale().lime;
    } else if (hue >= 155 && hue < 175) {
      colorName = locale().teal;
    } else if (hue >= 175 && hue < 195) {
      colorName = locale().cyan;
    } else if (hue >= 195 && hue < 255) {
      colorName = locale().blue;
    } else if (hue >= 255 && hue < 270) {
      colorName = locale().violet;
    } else if (hue >= 270 && hue < 295) {
      colorName = locale().magenta;
    } else if (hue >= 295 && hue < 345) {
      colorName = locale().pink;
    }
    return colorName;
  };

  const updateControlPositions = () => {
    const hsv = color.toHsv();
    const alpha = color.a;
    const hue = hsv.h;
    const saturation = hsv.s;
    const lightness = hsv.v;
    setControlPositions({
      c1x: saturation * offsetWidth(),
      c1y: (1 - lightness) * offsetHeight(),
      c2y: hue * offsetHeight(),
      c3y: (1 - alpha) * offsetHeight(),
    });
  };
  const hideDropdown = () => {
    if (pickerShown) hidePicker();
    else if (menuShown) hideMenu();
  };

  /** Event Listeners */
  // handleBlur must be function to allow accessing THIS
  function handleBlur(this: HTMLElement, { relatedTarget }: FocusEvent) {
    if (relatedTarget && !this.contains(relatedTarget as HTMLElement)) {
      hideDropdown();
    }
  }
  const menuKeyHandler = (e: KeyboardEvent & { target: HTMLElement; code: string }) => {
    const { target, code } = e;
    const { previousElementSibling, nextElementSibling, parentElement } = target;
    const isColorOptionsMenu =
      typeof menuDropdown !== 'undefined' &&
      parentElement &&
      (menuDropdown.current as HTMLDivElement).contains(parentElement);
    const allSiblings = parentElement ? [...parentElement.children] : [];
    const columnsCount =
      isColorOptionsMenu && getElementStyle(parentElement, 'grid-template-columns').split(' ').length;
    const currentIndex = allSiblings.indexOf(target);
    const previousElement = currentIndex > -1 && columnsCount && allSiblings[currentIndex - columnsCount];
    const nextElement = currentIndex > -1 && columnsCount && allSiblings[currentIndex + columnsCount];

    if ([keyArrowDown, keyArrowUp, keySpace].includes(code)) {
      // prevent scroll when navigating the menu via arrow keys / Space
      e.preventDefault();
    }
    if (isColorOptionsMenu) {
      if (previousElement && code === keyArrowUp) {
        focus(previousElement as HTMLElement);
      } else if (nextElement && code === keyArrowDown) {
        focus(nextElement as HTMLElement);
      } else if (previousElementSibling && code === keyArrowLeft) {
        focus(previousElementSibling as HTMLElement);
      } else if (nextElementSibling && code === keyArrowRight) {
        focus(nextElementSibling as HTMLElement);
      }
    } else if (previousElementSibling && [keyArrowLeft, keyArrowUp].includes(code)) {
      focus(previousElementSibling as HTMLElement);
    } else if (nextElementSibling && [keyArrowRight, keyArrowDown].includes(code)) {
      focus(nextElementSibling as HTMLElement);
    }

    if ([keyEnter, keySpace].includes(code)) {
      target.click();
    }
  };
  const handleDismiss = (e: KeyboardEvent) => {
    if (open && e.code === 'Escape') hideDropdown();
  };
  const pointerUp = (e: PointerEvent) => {
    const doc = getDocument(e.target as Node);
    const selection = doc.getSelection();

    if (
      !drag &&
      (!selection || !selection.toString().length) &&
      (!mainRef.current || !mainRef.current.contains(e.target as Node))
    ) {
      hideDropdown();
    }

    setDrag(null);
  };

  const toggleGlobalEvents = (add?: boolean) => {
    const action = add ? addListener : removeListener;
    const win = getWindow(input.current as HTMLElement);
    const doc = win.document;
    action(win, 'scroll', updateControlPositions);
    action(win, 'resize', handleResize);
    action(doc, 'keyup', handleDismiss as EventListener);
    action(doc, 'pointerup', pointerUp as EventListener);
    if (typeof mainRef.current !== 'undefined')
      action(mainRef.current as HTMLElement, 'focusout', handleBlur as EventListener);
    // when no presets/keywords, the menu won't be rendered
    if (typeof menuDropdown.current !== 'undefined')
      action(menuDropdown.current as HTMLElement, 'keydown', menuKeyHandler as EventListener);
  };

  const hideTransitionEnd = () => {
    setPosition('');
    setOpen(null);
    // reset value if not changed
    setValue(color.toString());
  };
  const showMenu = () => {
    setOpen(menuDropdown.current as HTMLDivElement);
    setPosition('bottom');
    reflow(menuDropdown.current as HTMLElement);
    startTransition(() => {
      updateDropdownPosition();
      setMenuShown(true);
      setPickerShown(false);
    });
  };
  const hideMenu = () => {
    setMenuShown(false);
    reflow(menuDropdown.current as HTMLElement);
    emulateTransitionEnd(menuDropdown.current as HTMLElement, hideTransitionEnd);
  };
  const toggleMenu = () => {
    if (open !== menuDropdown.current) {
      showMenu();
    } else {
      hideMenu();
    }
  };
  const showPicker = () => {
    setOpen(pickerDropdown.current as HTMLDivElement);
    setPosition('bottom');
    reflow(pickerDropdown.current as HTMLElement);
    // update control positions
    handleResize();
    startTransition(() => {
      updateDropdownPosition();
      setPickerShown(true);
      setMenuShown(false);
      (input.current as HTMLInputElement).focus();
    });
  };
  const hidePicker = () => {
    setPickerShown(false);
    reflow(pickerDropdown.current as HTMLDivElement);
    emulateTransitionEnd(pickerDropdown.current as HTMLDivElement, hideTransitionEnd);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newColor = new Color(newValue, format());
    if (newValue && newValue.length && newColor.isValid) {
      update(newColor);
    }
  };
  const handleResize = () => startTransition(updateControlPositions);
  const update = (newColor: Color) => {
    startTransition(() => {
      const { r, g, b, a } = newColor;
      setColor(prev => ObjectAssign(prev, { r, g, b, a }));
      // setColor(newColor);
      setValue(newColor.toString());
      updateControlPositions();
    });
  };

  useEffect(() => {
    if (pickerShown || menuShown) {
      toggleGlobalEvents(true);
    } else {
      toggleGlobalEvents();
    }

    return toggleGlobalEvents;
  });

  useMemo(() => {
    if (typeof props.onChange === 'function') {
      props.onChange(value);
    }
  }, [value]);

  useMemo(() => {
    update(new Color(value, format()));
  }, [format()]);

  return (
    <PickerContext.Provider
      value={{
        format,
        locale,
        value,
        setValue,
        color,
        setColor,
        drag,
        setDrag,
        controlPositions,
        setControlPositions,
        updateControlPositions,
        offsetWidth,
        offsetHeight,
        appearance,
        update,
        hue,
        saturation,
        lightness,
        alpha,
        fill,
        fillGradient,
      }}
    >
      <Suspense>
        <div className={className()} lang={lang()} ref={mainRef}>
          <button
            className="picker-toggle btn-appearance"
            aria-expanded={pickerShown}
            aria-haspopup={true}
            onClick={showPicker}
          >
            <span className="v-hidden">{`${locale().pickerLabel}. ${
              locale().formatLabel
            }: ${format().toUpperCase()}`}</span>
          </button>
          <input
            ref={input}
            type="text"
            name={id()}
            id={id()}
            className="color-preview btn-appearance"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder()}
            value={value}
            tabIndex={-1}
            style={{ backgroundColor: value }}
            onFocus={showPicker}
            onChange={handleChange}
            // onSubmit={(e) => console.log(e)}
            // onInput={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          />
          <PickerDropdown className={pickerClass()} ref={pickerDropdown} />

          <MenuDropdown
            className={menuClass()}
            ref={menuDropdown}
            colorPresets={colorPresets()}
            colorKeywords={colorKeywords()}
          >
            <button
              className="menu-toggle btn-appearance"
              tabIndex={menuShown || pickerShown ? 0 : -1}
              aria-expanded={menuShown}
              aria-haspopup={true}
              onClick={toggleMenu}
            >
              <span className="v-hidden">{locale().toggleLabel}</span>
              <Arrow />
            </button>
          </MenuDropdown>
        </div>
      </Suspense>
    </PickerContext.Provider>
  );
};

export default DefaultColorPicker;
