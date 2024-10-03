import Color from '@thednp/color';
import {
  getBoundingClientRect,
  reflow,
  focus,
  emulateTransitionEnd,
  ObjectAssign,
  ObjectKeys,
  keyEscape,
  keyEnter,
  on,
  off,
} from '@thednp/shorty';

import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useId,
  forwardRef,
  type ForwardedRef,
  type MutableRefObject,
} from 'react';
import type { ColorPickerProps } from '../types/types';
import { PickerContext } from '../parts/ColorPickerContext';
import initialControlPositions from '../util/initialControlPositions';
import { languagePacks, getLanguageStrings } from '../locales/getLanguageStrings';
import PickerDropdown from '../parts/PickerDropdown';
import MenuDropdown from '../parts/MenuDropdown';
import defaultValues from '../util/defaultValues';
import offsetLength from '../util/offsetLength';

// import default color picker style
import './color-picker.css';

const DefaultColorPicker = forwardRef((props: ColorPickerProps, ref: ForwardedRef<HTMLDivElement>) => {
  const id = props.id || `color-picker-${useId().replace(/\:/g, '')}`;
  const lang = props.lang || defaultValues.lang;
  const theme = props.theme || defaultValues.theme;
  const format = props.format || defaultValues.format;
  const initValue = props.value || defaultValues.value;
  const colorPresets = props.colorPresets || defaultValues.colorPresets;
  const colorKeywords = props.colorKeywords || defaultValues.colorKeywords;
  const placeholder = props.placeholder
    ? props.placeholder
    : getLanguageStrings(lang).placeholder.replace(/%/g, format.toUpperCase());
  const [inputValue, setInputValue] = useState<string>(initValue);
  const [value, setValuePrimitive] = useState<string>(inputValue);
  const setValue: typeof setValuePrimitive = newValue => {
    setValuePrimitive(newValue);
    if (typeof props.onChange === 'function') {
      props.onChange(newValue as string);
    }
  };
  const [color, setColor] = useState<Color>(new Color(inputValue, format));
  const [open, setOpen] = useState<HTMLDivElement | null>(null);
  const [drag, setDragPrimitive] = useState<HTMLElement | undefined | null>(null);
  const dragRef = useRef<HTMLElement | null>(null);
  const setDrag: typeof setDragPrimitive = newDrag => {
    setDragPrimitive(newDrag);
    dragRef.current = newDrag as HTMLElement | null;
  };
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

  const pickerDropdown = useRef<HTMLDivElement>(null);
  const menuDropdown = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const pickerClass = () => {
    return `${open === pickerDropdown.current ? ' ' + position : ''}${pickerShown ? ' show' : ''}`;
  };
  const menuClass = () => {
    return `${open === menuDropdown.current ? ' ' + position : ''}${menuShown ? ' show' : ''}`;
  };

  // toggle visibility
  const showMenu = () => {
    setOpen(menuDropdown.current);
    setPosition('bottom');
    setTimeout(() => {
      setMenuShown(true);
      reflow(menuDropdown.current!);
      updateDropdownPosition();
      setPickerShown(false);
    }, 17);
  };
  const hideMenu = () => {
    setMenuShown(false);
    reflow(menuDropdown.current!);
    emulateTransitionEnd(menuDropdown.current!, hideTransitionEnd);
  };
  const hideDropdown = () => {
    // istanbul ignore else @preserve
    if (pickerShown) hidePicker();
    else if (menuShown) hideMenu();
  };
  const toggleMenu = () => {
    if (open !== menuDropdown.current) {
      showMenu();
    } else {
      hideMenu();
    }
  };
  const showPicker = () => {
    setOpen(pickerDropdown.current);
    setPosition('bottom');
    updateControlPositions();
    setTimeout(() => {
      setPickerShown(true);
      reflow(pickerDropdown.current!);
      updateDropdownPosition();
      setMenuShown(false);
      input.current!.focus();
    }, 17);
  };
  const hidePicker = () => {
    setPickerShown(false);
    reflow(pickerDropdown.current as HTMLDivElement);
    emulateTransitionEnd(pickerDropdown.current as HTMLDivElement, hideTransitionEnd);
  };

  /** Event Listeners */
  // handleBlur must be function to allow accessing THIS
  function handleBlur({ relatedTarget, currentTarget }: FocusEvent<HTMLElement>) {
    // istanbul ignore next @preserve
    if (relatedTarget && !currentTarget.contains(relatedTarget)) {
      hideDropdown();
    }
  }
  const handleDismiss = ({ code }: Event & KeyboardEvent<Document>) => {
    // istanbul ignore else @preserve
    if (open && code === keyEscape) {
      hideDropdown();
    }
  };
  const pointerUp = ({ target }: PointerEvent) => {
    const selection = document.getSelection();
    const container = (ref as MutableRefObject<HTMLDivElement | null>).current;
    // istanbul ignore else @preserve
    if (!dragRef.current && (!selection || !selection.toString().length) && !container?.contains(target as Node)) {
      hideDropdown();
    }

    setDrag(null);
  };
  const updateDropdownPosition = () => {
    // istanbul ignore else @preserve
    if (input.current) {
      const elRect = getBoundingClientRect(input.current);
      const { top, bottom } = elRect;
      const { offsetHeight: inputHeight } = input.current;
      const { clientHeight } = document.documentElement;
      const dropdown = open;
      // istanbul ignore next @preserve
      if (!dropdown) return;
      const { offsetHeight: dropHeight } = dropdown;
      const distanceBottom = clientHeight - bottom;
      const distanceTop = top;
      const bottomExceed = top + dropHeight + inputHeight > clientHeight; // show
      const topExceed = top - dropHeight < 0; // show-top

      if ((!topExceed && bottomExceed) || distanceBottom < distanceTop) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  };
  const updateControlPositions = (newColor?: Color) => {
    const colorInstance = typeof newColor?.r === 'number' ? newColor : color;
    const hsv = colorInstance.toHsv();
    const alpha = colorInstance.a;
    const hue = hsv.h;
    const saturation = hsv.s;
    const lightness = hsv.v;
    setControlPositions({
      c1x: saturation * offsetLength(),
      c1y: (1 - lightness) * offsetLength(),
      c2y: hue * offsetLength(),
      c3y: (1 - alpha) * offsetLength(),
    });
  };

  const toggleGlobalEvents = (add?: boolean) => {
    const action = add ? on : off;
    action(window, 'scroll', updateDropdownPosition);
    action(window, 'resize', updateControlPositions);
    action(document, 'keyup', handleDismiss);
    action(document, 'pointerup', pointerUp);
  };

  const hideTransitionEnd = () => {
    setPosition('');
    setOpen(null);
    // focus the button
    focus(input.current?.previousElementSibling as HTMLElement);
  };

  const handleChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    // istanbul ignore next @preserve
    setInputValue(currentTarget.value);
  };
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    let newValue = e.currentTarget.value;
    // istanbul ignore else @preserve
    if (Color.isNonColor(newValue)) {
      newValue = newValue === 'transparent' ? 'rgba(0,0,0,0)' : /* istanbul ignore next @preserve */ 'rgb(0,0,0)';
    }
    const newColor = new Color(newValue, format);
    const newStringValue = newColor.toString();

    // istanbul ignore else @preserve
    if (keyEnter === e.key && newValue.length && newColor.isValid) {
      setColor(newColor);
      setInputValue(newStringValue);
      setValue(newStringValue);
      updateControlPositions(newColor);
    } else if (keyEscape === e.key) {
      setInputValue(color.toString());
    }
  };

  useEffect(() => {
    if (pickerShown || menuShown) {
      toggleGlobalEvents(true);
    } else {
      toggleGlobalEvents();
    }

    return toggleGlobalEvents;
  }, [menuShown, pickerShown]);

  useEffect(() => {
    const newColor = new Color(value, format);
    const newColorString = newColor.toString();
    setColor(newColor);
    setInputValue(newColorString);
    setValue(newColorString);
    updateControlPositions(newColor);
  }, [format]);

  return (
    <PickerContext.Provider
      value={{
        locale,
        format,
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
      }}
    >
      <div className={className()} lang={lang} ref={ref} onBlur={handleBlur}>
        <button
          type="button"
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
          name={id}
          id={id}
          className="color-preview btn-appearance"
          autoComplete="off"
          spellCheck={false}
          tabIndex={pickerShown ? -1 : 0}
          placeholder={placeholder}
          value={inputValue}
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
          toggleMenu={toggleMenu}
          pickerShown={pickerShown}
          menuShown={menuShown}
        />
      </div>
    </PickerContext.Provider>
  );
});

export default DefaultColorPicker;
