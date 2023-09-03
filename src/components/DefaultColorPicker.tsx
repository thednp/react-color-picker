import Color from '@thednp/color';
import { addListener, removeListener } from '@thednp/event-listener';
import {
  getBoundingClientRect,
  reflow,
  focus,
  emulateTransitionEnd,
  getDocument,
  ObjectAssign,
  ObjectKeys,
  keyEnter,
} from '@thednp/shorty';

import { useState, useEffect, startTransition, useRef, ChangeEvent, FocusEvent, KeyboardEvent, useId } from 'react';
import type { ColorPickerProps } from '../types/types';
import { PickerContext } from '../parts/ColorPickerContext';
import initialControlPositions from '../util/initialControlPositions';
import { languagePacks, getLanguageStrings } from '../locales/getLanguageStrings';
import Arrow from '../assets/Arrow';

import PickerDropdown from '../parts/PickerDropdown';
import MenuDropdown from '../parts/MenuDropdown';
import defaultValues from '../util/defaultValues';

// import default color picker style
import './color-picker.css';

const DefaultColorPicker = (props: ColorPickerProps) => {
  const id = () => props.id || `color-picker-${useId().replace(/\:/g, '')}`;
  const [lang, setLang] = useState(defaultValues.lang);
  const [theme, setTheme] = useState(defaultValues.theme);
  const [format, setFormat] = useState(defaultValues.format);
  const [colorPresets, setColorPresets] = useState(defaultValues.colorPresets);
  const [colorKeywords, setColorKeywords] = useState(defaultValues.colorKeywords);
  const [placeholder, setPlaceholder] = useState(
    getLanguageStrings(lang).placeholder.replace(/%/g, format.toUpperCase()),
  );
  const [inputValue, setInputValue] = useState<string>(defaultValues.value);
  const [value, setValue] = useState<string>(inputValue);
  const [color, setColor] = useState<Color>(new Color(inputValue, format));
  const [open, setOpen] = useState<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<HTMLElement | null>(null);
  const [pickerShown, setPickerShown] = useState<boolean>(false);
  const [menuShown, setMenuShown] = useState<boolean>(false);
  const [position, setPosition] = useState<string>('');
  const [controlPositions, setControlPositions] = useState<typeof initialControlPositions>(initialControlPositions);
  const locale = () => {
    if ('en' !== lang && ObjectKeys(languagePacks).includes(lang)) {
      return getLanguageStrings(props.lang);
    }
    const langPack = getLanguageStrings(lang);

    if (props.locale && ObjectKeys(props.locale).length === 35) {
      ObjectAssign(langPack, props.locale);
    }

    return langPack;
  };
  const isDark = () => {
    const temp = new Color(value);
    return temp.isDark && temp.a > 0.33;
  };
  const className = () =>
    [
      'color-picker',
      ...[props.className ? props.className.split(/\s/) : ''],
      isDark() ? 'txt-dark' : 'txt-light',
      theme === 'light' ? ' light' : '',
      open ? 'open' : '',
    ]
      .filter(c => c)
      .join(' ');

  const mainRef = useRef<HTMLDivElement>(null);
  const pickerDropdown = useRef<HTMLDivElement>(null);
  const menuDropdown = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const pickerClass = () => {
    return `${open === pickerDropdown.current ? ' ' + position : ''}${pickerShown ? ' show' : ''}`;
  };
  const menuClass = () => {
    return `${open === menuDropdown.current ? ' ' + position : ''}${menuShown ? ' show' : ''}`;
  };

  const hideDropdown = () => {
    if (pickerShown) hidePicker();
    else if (menuShown) hideMenu();
  };

  /** Event Listeners */
  // handleBlur must be function to allow accessing THIS
  function handleBlur({ relatedTarget, currentTarget }: FocusEvent<HTMLElement>) {
    if (relatedTarget && !currentTarget.contains(relatedTarget)) {
      hideDropdown();
    }
  }
  const handleDismiss = ({ code }: Event & KeyboardEvent<Document>) => {
    if (open && code === 'Escape') hideDropdown();
  };
  const pointerUp = ({ target }: PointerEvent) => {
    const doc = getDocument(target as Node);
    const selection = doc.getSelection();

    if (
      !drag &&
      (!selection || !selection.toString().length) &&
      (!mainRef.current || !mainRef.current.contains(target as Node))
    ) {
      hideDropdown();
    }

    setDrag(null);
  };
  const updateDropdownPosition = () => {
    if (input.current) {
      const elRect = getBoundingClientRect(input.current);
      const { top, bottom } = elRect;
      const { offsetHeight: inputHeight } = input.current;
      const { clientHeight } = document.documentElement;
      const dropdown = open;
      if (!dropdown) return;
      const { offsetHeight: dropHeight } = dropdown;
      const distanceBottom = clientHeight - bottom;
      const distanceTop = top;
      const bottomExceed = top + dropHeight + inputHeight > clientHeight; // show
      const topExceed = top - dropHeight < 0; // show-top

      if ((dropdown === pickerDropdown.current || !topExceed) && distanceBottom < distanceTop && bottomExceed) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  };
  const updateControlPositions = () => {
    const hsv = color.toHsv();
    const alpha = color.a;
    const hue = hsv.h;
    const saturation = hsv.s;
    const lightness = hsv.v;
    const offsetLength = window.innerWidth > 980 ? 300 : 230;
    setControlPositions({
      c1x: saturation * offsetLength,
      c1y: (1 - lightness) * offsetLength,
      c2y: hue * offsetLength,
      c3y: (1 - alpha) * offsetLength,
    });
  };

  const toggleGlobalEvents = (add?: boolean) => {
    const action = add ? addListener : removeListener;
    const doc = window.document;
    action(window, 'scroll', updateControlPositions);
    action(window, 'resize', handleResize);
    action(doc, 'keyup', handleDismiss as EventListener);
    action(doc, 'pointerup', pointerUp as EventListener);
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
  const hideTransitionEnd = () => {
    setPosition('');
    setOpen(null);
    // focus the button
    focus(input.current?.previousElementSibling as HTMLElement);
    if (inputValue !== value) {
      setInputValue(value);
    }
  };

  const handleChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const newValue = currentTarget.value;
    const newColor = new Color(newValue, format);
    setInputValue(newValue);

    if (newValue.length && newColor.isValid) {
      setColor(newColor);
      updateControlPositions();
    }
  };
  const handleKeyUp = ({ code }: KeyboardEvent<HTMLInputElement>) => {
    if ([keyEnter, 'NumpadEnter'].includes(code)) {
      const newValue = color.toString();
      setValue(newValue);
      setInputValue(newValue);
      updateControlPositions();
    }
  };
  const handleResize = () => startTransition(updateControlPositions);
  const update = (newColor: Color) => {
    const newValue = newColor.toString();
    setColor(newColor);
    setValue(newValue);
    setInputValue(newValue);
    updateControlPositions();
  };

  // effects
  useEffect(() => {
    if (props.format) setFormat(props.format);
  }, [props.format]);

  useEffect(() => {
    if (props.theme) setTheme(props.theme);
  }, [props.theme]);

  useEffect(() => {
    if (props.lang) setLang(props.lang);
  }, [props.lang]);

  useEffect(() => {
    if (props.placeholder) setPlaceholder(props.placeholder);
  }, [props.placeholder]);

  useEffect(() => {
    if (props.colorPresets) setColorPresets(props.colorPresets);
  }, [props.colorPresets]);

  useEffect(() => {
    if (props.colorKeywords) setColorKeywords(props.colorKeywords);
  }, [props.colorKeywords]);

  useEffect(() => {
    if (pickerShown || menuShown) {
      toggleGlobalEvents(true);
    } else {
      toggleGlobalEvents();
    }

    return toggleGlobalEvents;
  }, [menuShown, pickerShown]);

  useEffect(() => {
    update(new Color(value, format));
  }, [format]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (typeof props.onChange === 'function') {
        props.onChange(value);
      }
    });
  }, [value]);

  useEffect(() => {
    if (props.value) {
      update(new Color(props.value, format));
    }
  }, []);

  return (
    <PickerContext.Provider
      value={{
        format,
        locale,
        value,
        setValue,
        setInputValue,
        color,
        setColor,
        drag,
        setDrag,
        controlPositions,
        setControlPositions,
        updateControlPositions,
        update,
      }}
    >
      <div className={className()} lang={lang} ref={mainRef} onBlur={handleBlur}>
        <button
          className="picker-toggle btn-appearance"
          aria-expanded={pickerShown}
          aria-haspopup={true}
          onClick={showPicker}
        >
          <span className="v-hidden">{`${locale().pickerLabel}. ${
            locale().formatLabel
          }: ${format.toUpperCase()}`}</span>
        </button>
        <input
          ref={input}
          type="text"
          name={id()}
          id={id()}
          className="color-preview btn-appearance"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={inputValue}
          tabIndex={pickerShown ? -1 : 0}
          style={{ backgroundColor: value }}
          onFocus={showPicker}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
        />
        <PickerDropdown className={pickerClass()} ref={pickerDropdown} />

        <MenuDropdown
          className={menuClass()}
          ref={menuDropdown}
          colorPresets={colorPresets}
          colorKeywords={colorKeywords}
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
    </PickerContext.Provider>
  );
};

export default DefaultColorPicker;
