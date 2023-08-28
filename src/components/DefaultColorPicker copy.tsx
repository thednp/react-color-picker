import { useState, useTransition, useEffect, useRef, CSSProperties } from 'react';
import type { ColorPickerProps } from '../types/types';
import {
  getWindow,
  getDocumentElement,
  getBoundingClientRect,
  reflow,
  emulateTransitionEnd,
  // Timer,
} from '@thednp/shorty';
import { addListener, removeListener } from '@thednp/event-listener';

import './color-picker.css';

// const { colorPickerLabels, colorNames, ColorPalette, Color } = ColorPicker;

let pickerCount = 0;
const DefaultColorPicker = (props: ColorPickerProps) => {
  const [color, setColor] = useState(props.value || '#ff0000');

  const [open, setOpen] = useState(null as HTMLDivElement | null);
  const [pickerShown, setPickerShown] = useState(false);
  const [menuShown, setMenuShown] = useState(false);
  const [position, setPosition] = useState('');
  const [, startTransition] = useTransition();
  // const pickerDropdown = useRef(undefined as unknown as HTMLElement);
  // const menuDropdown = useRef(undefined as unknown as HTMLElement);
  // const input = useRef(undefined as unknown as HTMLElement);
  const input = useRef<HTMLInputElement>(undefined as any);
  const pickerDropdown = useRef<HTMLInputElement>(undefined as any);
  const menuDropdown = useRef<HTMLInputElement>(undefined as any);
  const id = props.id ? props.id : `color-picker-${pickerCount}`;
  // const pickerLabels = props.colorPickerLabels ? props.colorPickerLabels : colorPickerLabels;
  // const colorLabels = props.colorNames ? props.colorNames : colorNames;
  pickerCount += 1;

  const updatePosition = () => {
    if (typeof input.current !== 'undefined') {
      const elRect = getBoundingClientRect(input.current);
      const { top, bottom } = elRect;
      const { offsetHeight: elHeight } = input.current;
      const windowHeight = getDocumentElement(input.current).clientHeight;
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
    }
  };

  const handleDismiss = () => {
    // console.log(e)
    if (pickerShown) hidePicker();
    else if (menuShown) hideMenu();
  };

  const toggleEvents = (add?: boolean) => {
    const action = add ? addListener : removeListener;
    if (typeof input.current !== 'undefined') {
      const win = getWindow(input.current);
      const doc = win.document;

      action(win, 'scroll', updatePosition);
      action(doc, 'keyup', handleDismiss);
    }
  };

  useEffect(() => {
    if (pickerShown || menuShown) {
      toggleEvents(true);
    } else {
      toggleEvents();
    }
    return toggleEvents;
  }, [pickerShown, menuShown]);

  const hideTransitionEnd = () => {
    setPosition('');
    setOpen(null);
  };
  const showMenu = () => {
    if (typeof menuDropdown.current !== 'undefined') {
      setPickerShown(false);
      setOpen(menuDropdown.current);
      setPosition('bottom');
      reflow(menuDropdown.current);
      startTransition(() => {
        updatePosition();
        setMenuShown(true);
      });
    }
  };
  const hideMenu = () => {
    if (typeof menuDropdown.current !== 'undefined') {
      setMenuShown(false);
      reflow(menuDropdown.current);
      emulateTransitionEnd(menuDropdown.current, hideTransitionEnd);
    }
  };
  const toggleMenu = () => {
    if (open !== menuDropdown.current) {
      showMenu();
    } else {
      hideMenu();
    }
  };

  const showPicker = () => {
    setMenuShown(false);
    setOpen(pickerDropdown.current);
    setPosition('bottom');
    reflow(pickerDropdown.current);
    startTransition(() => {
      updatePosition();
      setPickerShown(true);
    });
  };
  const hidePicker = () => {
    setPickerShown(false);
    reflow(pickerDropdown.current);
    emulateTransitionEnd(pickerDropdown.current, hideTransitionEnd);
  };

  // console.log(props)
  return (
    <div className={props.className}>
      <div className={`color-picker txt-dark${open ? ' open' : ''}`}>
        <button
          className="picker-toggle btn-appearance"
          aria-expanded={pickerShown}
          aria-haspopup="true"
          onClick={() => {
            // console.log(e, isPending());

            showPicker();
            // console.log({open: open, menuShown: menuShown, pickerShown: pickerShown, position: position()});
          }}
        >
          <span className="v-hidden">Colour Picker. Format: RGB</span>
        </button>
        <input
          type="text"
          ref={input}
          name={id}
          id={id}
          className="color-preview btn-appearance"
          autoComplete="off"
          spellCheck={false}
          placeholder="Définir la couleur au format HSL"
          value={color || 'red'}
          data-format="rgb"
          data-color-presets="{hue: 0, hueSteps: 12, lightSteps: 10, saturation: 85}"
          tabIndex={-1}
          style={{ backgroundColor: color }}
          onFocus={() => {
            showPicker();
            // console.log({ open: open, menuShown: menuShown, pickerShown: pickerShown, position: position() });
          }}
          onChange={e => {
            setColor(e.currentTarget.value);
            if (typeof props.onChange === 'function') {
              // props.onChange(e);
              props.onChange(e.currentTarget.value);
            }
          }}
        />
        <div
          ref={pickerDropdown}
          className={`color-dropdown picker${open === pickerDropdown.current ? ' ' + position : ''}${
            pickerShown ? ' show' : ''
          }`}
          role="group"
        >
          <div className="color-controls rgb">Visual controls come here</div>
          <div className="color-form rgb">Color forms come here</div>
        </div>
        <button
          className="menu-toggle btn-appearance"
          tabIndex={-1}
          aria-expanded={menuShown}
          aria-haspopup="true"
          onClick={() => {
            toggleMenu();
            // console.log({ open: open, menuShown: menuShown, pickerShown: pickerShown, position: position });
          }}
        >
          <span className="v-hidden">Select Colour</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
            <path d="M98,158l157,156L411,158l27,27L255,368L71,185L98,158z" fill="#fff"></path>
          </svg>
        </button>
        <div
          ref={menuDropdown}
          className={`color-dropdown scrollable menu${open === menuDropdown.current ? ' ' + position : ''}${
            menuShown ? ' show' : ''
          }`}
        >
          <ul
            className="color-options scrollable multiline"
            role="listbox"
            aria-label="Colour Presets"
            style={
              {
                '--grid-item-size': '1.5rem',
                '--grid-fit': '10',
                '--grid-gap': '1px',
                '--grid-height': '4.5rem',
                '--grid-hover-height': 'calc(5 * 1.5rem + 4 * 1px)',
              } as CSSProperties
            }
          >
            <li>Update List here</li>
            <li
              className="color-option"
              tabIndex={0}
              role="option"
              aria-selected="false"
              data-value="#420505"
              style={{ backgroundColor: 'rgb(66, 5, 5)' }}
            >
              #420505
            </li>
          </ul>
          <ul className="color-defaults" role="listbox" aria-label="Colour Defaults">
            <li>Update List here</li>
            <li className="color-option" tabIndex={0} role="option" aria-selected="false">
              initial
            </li>
            <li className="color-option" tabIndex={0} role="option" aria-selected="false">
              revert
            </li>
            <li className="color-option" tabIndex={0} role="option" aria-selected="false">
              inherit
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DefaultColorPicker;
