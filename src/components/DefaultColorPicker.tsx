import Color from '@thednp/color';
import { addListener, removeListener } from '@thednp/event-listener';
import {
  getWindow,
  getElementsByClassName,
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

  const [value, setValue] = useState(initValue());
  const [color, setColor] = useState(new Color(value, format()));
  const [open, setOpen] = useState(null as HTMLDivElement | null);
  const [drag, setDrag] = useState<HTMLElement | null>(null);
  const [pickerShown, setPickerShown] = useState(false);
  const [menuShown, setMenuShown] = useState(false);
  const [position, setPosition] = useState('');
  const [controlPositions, setControlPositions] = useState(initialControlPositions);
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

  const controls = () => {
    return [...getElementsByClassName('color-control', pickerDropdown.current as ParentNode)] as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
  };

  const visuals = () => {
    return [...getElementsByClassName('visual-control', pickerDropdown.current as ParentNode)] as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
  };

  const knobs = () => {
    return [
      ...getElementsByClassName('color-pointer', pickerDropdown.current as ParentNode),
      ...getElementsByClassName('color-slider', pickerDropdown.current as ParentNode),
    ] as [HTMLElement, HTMLElement, HTMLElement];
  };

  const inputs = () => {
    return [...getElementsByClassName('color-input', pickerDropdown.current as ParentNode)] as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
  };
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
  const handleScroll = (e: Event) => {
    const { activeElement } = getDocument(e.target as HTMLElement);

    updateDropdownPosition();

    /* istanbul ignore next */
    if (
      (['pointermove', 'touchmove'].includes(e.type) && drag) ||
      (activeElement && [...knobs()].includes(activeElement as HTMLElement))
    ) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
  const handleDismiss = (e: KeyboardEvent) => {
    if (open && e.code === 'Escape') hideDropdown();
  };
  const pointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const { currentTarget, target, pageX, pageY } = e;
    const controlWrappers = [...controls()];
    const idx = controlWrappers.indexOf(currentTarget as HTMLElement);
    const [v1, v2, v3] = visuals();
    const [k1, k2, k3] = knobs();
    const visual = visuals()[idx];
    const { left, top } = getBoundingClientRect(visual as HTMLDivElement);
    const html = getDocumentElement(v1);
    const offsetX = pageX - html.scrollLeft - left;
    const offsetY = pageY - html.scrollTop - top;

    /* istanbul ignore else */
    if (visual === v1 || target === k1) {
      setDrag(visual);
      changeControl1(offsetX, offsetY);
    } else if (visual === v2 || target === k2) {
      setDrag(visual);
      changeControl2(offsetY);
    } else if (visual === v3 || target === k3) {
      setDrag(visual);
      changeAlpha(offsetY);
    }
    e.preventDefault();
  };
  const pointerUp = (e: PointerEvent) => {
    const [v1] = visuals();
    const doc = getDocument(v1);
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
  const pointerMove = (e: PointerEvent): void => {
    const [v1, v2, v3] = visuals();
    const { pageX, pageY } = e;

    if (!drag) return;

    const controlRect = getBoundingClientRect(drag);
    const win = getDocumentElement(v1);
    const offsetX = pageX - win.scrollLeft - controlRect.left;
    const offsetY = pageY - win.scrollTop - controlRect.top;

    if (drag === v1) {
      changeControl1(offsetX, offsetY);
    }

    if (drag === v2) {
      changeControl2(offsetY);
    }

    if (drag === v3) {
      changeAlpha(offsetY);
    }
  };
  const handleKnobs = (e: Event & { code: string }) => {
    const { target, code } = e;

    // only react to arrow buttons
    if (![keyArrowUp, keyArrowDown, keyArrowLeft, keyArrowRight].includes(code)) return;
    e.preventDefault();

    const [k1, k2, k3] = knobs();
    /**
     * @see https://stackoverflow.com/questions/70373659/solidjs-computations-created-outside-a-createroot-or-render-will-never-be
     */
    const [{ offsetWidth, offsetHeight }] = visuals();
    const { activeElement } = getDocument(k1);
    const currentKnob = [k1, k2, k3].find(x => x === activeElement);
    const yRatio = offsetHeight / 360;

    /* istanbul ignore else */
    if (currentKnob) {
      /* istanbul ignore else */
      if (target === k1) {
        const xRatio = offsetWidth / 100;

        /* istanbul ignore else */
        if ([keyArrowLeft, keyArrowRight].includes(code)) {
          setControlPositions({
            ...controlPositions,
            c1x: controlPositions.c1x + (code === keyArrowRight ? xRatio : -xRatio),
          });
        } else if ([keyArrowUp, keyArrowDown].includes(code)) {
          setControlPositions({
            ...controlPositions,
            c1y: controlPositions.c1y + (code === keyArrowDown ? yRatio : -yRatio),
          });
        }

        changeControl1(controlPositions.c1x, controlPositions.c1y);
      } else if (target === k2) {
        setControlPositions({
          ...controlPositions,
          c2y: controlPositions.c2y + ([keyArrowDown, keyArrowRight].includes(code) ? yRatio : -yRatio),
        });
        changeControl2(controlPositions.c2y);
      } else if (target === k3) {
        setControlPositions({
          ...controlPositions,
          c3y: controlPositions.c3y + ([keyArrowDown, keyArrowRight].includes(code) ? yRatio : -yRatio),
        });
        changeAlpha(controlPositions.c3y);
      }
      handleScroll(e);
    }
  };

  const changeControl1 = (X: number, Y: number) => {
    let [offsetX, offsetY] = [0, 0];

    if (X > offsetWidth()) offsetX = offsetWidth();
    else if (X >= 0) offsetX = X;

    if (Y > offsetHeight()) offsetY = offsetHeight();
    else if (Y >= 0) offsetY = Y;

    const hue = controlPositions.c2y / offsetHeight();
    const saturation = offsetX / offsetWidth();
    const lightness = 1 - offsetY / offsetHeight();
    const alpha = 1 - controlPositions.c3y / offsetHeight();

    // new color
    const newColor = new Color(
      {
        h: hue,
        s: saturation,
        v: lightness,
        a: alpha,
      },
      format(),
    );

    setValue(newColor.toString());
    setColor(newColor);
    setControlPositions({
      ...controlPositions,
      c1x: offsetX,
      c1y: offsetY,
    });
  };

  const changeControl2 = (Y: number) => {
    let offsetY = 0;

    if (Y > offsetHeight()) offsetY = offsetHeight();
    else if (Y >= 0) offsetY = Y;

    const hue = offsetY / offsetHeight();
    const saturation = controlPositions.c1x / offsetWidth();
    const lightness = 1 - controlPositions.c1y / offsetHeight();
    const alpha = 1 - controlPositions.c3y / offsetHeight();

    // new color
    const newColor = new Color(
      {
        h: hue,
        s: saturation,
        v: lightness,
        a: alpha,
      },
      format(),
    );

    setValue(newColor.toString());
    setColor(newColor);
    setControlPositions({
      ...controlPositions,
      c2y: offsetY,
    });
  };

  const changeAlpha = (Y: number) => {
    let offsetY = 0;

    if (Y > offsetHeight()) offsetY = offsetHeight();
    else if (Y >= 0) offsetY = Y;

    // update color alpha
    const alpha = 1 - offsetY / offsetHeight();
    const newColor = new Color(color.setAlpha(alpha), format());

    setValue(newColor.toString());
    setColor(newColor);
    setControlPositions({
      ...controlPositions,
      c3y: offsetY,
    });
  };

  const toggleEvents = (add?: boolean) => {
    const action = add ? addListener : removeListener;
    const win = getWindow(input.current as HTMLElement);
    const doc = win.document;
    const [c1, c2, c3] = controls();
    const [k1, k2, k3] = knobs();
    // const parent = c1.closest('.color-picker');
    action(win, 'scroll', handleScroll);
    action(win, 'resize', handleResize);
    action(doc, 'keyup', handleDismiss as EventListener);
    action(doc, 'pointerup', pointerUp as EventListener);
    action(doc, 'pointermove', pointerMove as EventListener);
    [c1, c2, c3].forEach(c => action(c, 'pointerdown', pointerDown as EventListener));
    [k1, k2, k3].forEach(k => action(k, 'keydown', handleKnobs as EventListener));
    if (typeof mainRef === 'object' && typeof mainRef.current !== 'undefined')
      action(mainRef.current as HTMLElement, 'focusout', handleBlur as EventListener);
    // when no presets/keywords, the menu won't be rendered
    if (typeof menuDropdown === 'object' && typeof menuDropdown.current !== 'undefined')
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
      setColor(newColor);
      setValue(newColor.toString());
    });
  };

  useEffect(() => {
    if (pickerShown || menuShown) {
      toggleEvents(true);
    } else {
      toggleEvents();
    }

    return toggleEvents;
  }, [pickerShown, menuShown]);

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
        visuals,
        knobs,
        inputs,
        controlPositions,
        setControlPositions,
        updateControlPositions,
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
            onInput={handleChange}
            onChange={e => setValue(e.target.value)}
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
