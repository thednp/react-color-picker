import Color from '@thednp/color';
import {
  getBoundingClientRect,
  keyArrowUp,
  keyArrowDown,
  keyArrowLeft,
  keyArrowRight,
  on,
  off,
  keyEnter,
} from '@thednp/shorty';
import {
  createElement,
  ChangeEvent,
  PointerEvent,
  KeyboardEvent,
  forwardRef,
  ForwardedRef,
  useId,
  useRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ControlProps, PickerProps } from '../types/types';
import { usePickerContext } from './ColorPickerContext';
import offsetLength from '../util/offsetLength';

const { roundPart } = Color;

const ColorControls = (props: ControlProps) => {
  const {
    setValue,
    setInputValue,
    color,
    setColor,
    drag,
    setDrag,
    locale,
    format,
    controlPositions,
    setControlPositions,
  } = usePickerContext();
  const controlsParentRef = useRef<HTMLDivElement>(null);
  const { stringValue } = props;
  const hueGradient = `linear-gradient(
    rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.67%, 
    rgb(0, 255, 0) 33.33%, 
    rgb(0, 255, 255) 50%, 
    rgb(0, 0, 255) 66.67%, 
    rgb(255, 0, 255) 83.33%, 
    rgb(255, 0, 0) 100%
  )`;
  const hue = controlPositions.c2y / offsetLength();
  const alpha = 1 - controlPositions.c3y / offsetLength();
  const lightness = roundPart(color.toHsv().v * 100);
  const saturation = roundPart(color.toHsv().s * 100);
  const fill = new Color({ h: hue * 360, s: 100, l: 50, a: alpha });
  const fillGradient = () => {
    const roundA = roundPart(alpha * 100) / 100;

    return `linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,${roundA}) 100%),
          linear-gradient(to right, rgba(255,255,255,${roundA}) 0%, ${fill.toRgbString()} 100%), 
          linear-gradient(rgb(255,255,255) 0%, rgb(255,255,255) 100%)`;
  };

  const appearance = useMemo(() => {
    const hsl = color.toHsl();
    const hsv = color.toHsv();
    const HUE = roundPart(hsl.h * 360);
    const saturationSource = format === 'hsl' ? hsl.s : hsv.s;
    const saturation = roundPart(saturationSource * 100);
    const lightness = roundPart(hsl.l * 100);
    const hsvl = hsv.v * 100;

    let colorName = 'black';

    // determine color appearance
    /* istanbul ignore else @preserve */
    if (lightness === 100 && saturation === 0) {
      colorName = locale().white;
    } else if (lightness === 0) {
      colorName = locale().black;
    } else if (saturation === 0) {
      colorName = locale().grey;
    } else if (HUE < 15 || HUE >= 345) {
      colorName = locale().red;
    } else if (HUE >= 15 && HUE < 45) {
      colorName = hsvl > 80 && saturation > 80 ? locale().orange : locale().brown;
    } else if (HUE >= 45 && HUE < 75) {
      const isGold = HUE > 46 && HUE < 54 && hsvl < 80 && saturation > 90;
      const isOlive = HUE >= 54 && HUE < 75 && hsvl < 80;
      colorName = isGold ? locale().gold : locale().yellow;
      colorName = isOlive ? locale().olive : colorName;
    } else if (HUE >= 75 && HUE < 155) {
      colorName = hsvl < 68 ? locale().green : locale().lime;
    } else if (HUE >= 155 && HUE < 175) {
      colorName = locale().teal;
    } else if (HUE >= 175 && HUE < 195) {
      colorName = locale().cyan;
    } else if (HUE >= 195 && HUE < 255) {
      colorName = locale().blue;
    } else if (HUE >= 255 && HUE < 270) {
      colorName = locale().violet;
    } else if (HUE >= 270 && HUE < 295) {
      colorName = locale().magenta;
    } else if (HUE >= 295 && HUE < 345) {
      colorName = locale().pink;
    }
    return colorName;
  }, [color]);

  const handleScroll = (e: KeyboardEvent<HTMLElement>) => {
    const { activeElement } = document;

    // istanbul ignore else @preserve
    if (
      (['pointermove', 'touchmove'].includes(e.type) && drag) ||
      (activeElement && controlsParentRef.current?.contains(activeElement as HTMLElement))
    ) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
  const pointerDown = (e: PointerEvent<HTMLElement>) => {
    // istanbul ignore next @preserve
    if (e.button !== 0) return;
    const { currentTarget, target, pageX, pageY } = e;
    const elements = [...(controlsParentRef.current as HTMLElement).children] as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    const [visual] = [...currentTarget.children] as [HTMLElement, HTMLElement];
    const { left, top } = getBoundingClientRect(visual);
    const { documentElement } = document;
    const offsetX = pageX - documentElement.scrollLeft - left;
    const offsetY = pageY - documentElement.scrollTop - top;

    setDrag(visual);

    // istanbul ignore else @preserve
    if (elements[0].contains(target as Node)) {
      changeControl1(offsetX, offsetY);
    } else if (elements[1].contains(target as Node)) {
      changeControl2(offsetY);
    } else if (elements[2].contains(target as Node)) {
      changeAlpha(offsetY);
    }
    e.preventDefault();
  };

  const pointerMove = (e: PointerEvent<HTMLElement>): void => {
    const { pageX, pageY } = e;
    // istanbul ignore next @preserve
    if (!drag || !controlsParentRef.current) return;

    const elements = controlsParentRef.current.children;
    const controlRect = getBoundingClientRect(drag);
    const { documentElement } = document;
    const offsetX = pageX - documentElement.scrollLeft - controlRect.left;
    const offsetY = pageY - documentElement.scrollTop - controlRect.top;

    // istanbul ignore next @preserve
    if (elements[0].contains(drag)) {
      changeControl1(offsetX, offsetY);
    } else if (elements[1].contains(drag)) {
      changeControl2(offsetY);
    } else if (elements[2].contains(drag)) {
      changeAlpha(offsetY);
    }
  };
  const handleKnobs = (e: KeyboardEvent<HTMLElement>) => {
    const { target, key } = e;

    // only react to arrow buttons
    // istanbul ignore else @preserve
    if (![keyArrowUp, keyArrowDown, keyArrowLeft, keyArrowRight].includes(key) || !controlsParentRef.current) return;
    e.preventDefault();

    const elements = [...controlsParentRef.current.children] as [HTMLElement, HTMLElement, HTMLElement];
    const { activeElement } = document;
    const yRatio = offsetLength() / 360;

    // istanbul ignore else @preserve
    if (activeElement === target) {
      // istanbul ignore else @preserve
      if (elements[0].contains(target as Node)) {
        const xRatio = offsetLength() / 100;

        // istanbul ignore else @preserve
        if ([keyArrowLeft, keyArrowRight].includes(key)) {
          const c1x = controlPositions.c1x + (key === keyArrowRight ? xRatio : -xRatio);
          changeControl1(c1x, controlPositions.c1y);
        } else if ([keyArrowUp, keyArrowDown].includes(key)) {
          const c1y = controlPositions.c1y + (key === keyArrowDown ? yRatio : -yRatio);
          changeControl1(controlPositions.c1x, c1y);
        }
      } else if (elements[1].contains(target as Node)) {
        const c2y = controlPositions.c2y + ([keyArrowDown, keyArrowRight].includes(key) ? yRatio : -yRatio);
        changeControl2(c2y);
      } else if (elements[2].contains(target as Node)) {
        const c3y = controlPositions.c3y + ([keyArrowDown, keyArrowRight].includes(key) ? yRatio : -yRatio);
        changeAlpha(c3y);
      }
      handleScroll(e);
    }
  };

  const changeControl1 = (X: number, Y: number) => {
    let [offsetX, offsetY] = [0, 0];
    const length = offsetLength();

    // istanbul ignore next @preserve
    if (X > length) offsetX = length;
    else if (X >= 0) offsetX = X;

    // istanbul ignore next @preserve
    if (Y > length) offsetY = length;
    else if (Y >= 0) offsetY = Y;

    const HUE = controlPositions.c2y / length;
    const saturation = offsetX / length;
    const lightness = 1 - offsetY / length;
    const alpha = 1 - controlPositions.c3y / length;

    setControlPositions(prev => ({
      ...prev,
      c1x: offsetX,
      c1y: offsetY,
    }));
    // new color
    const newColor = new Color(
      {
        h: HUE * 360,
        s: saturation * 100,
        v: lightness * 100,
        a: alpha,
      },
      format,
    );
    const newValue = newColor.toString();
    setValue(newValue);
    setInputValue(newValue);
    setColor(newColor);
  };

  const changeControl2 = (Y: number) => {
    let offsetY = 0;
    const length = offsetLength();

    // istanbul ignore next @preserve
    if (Y > length) offsetY = length;
    else if (Y >= 0) offsetY = Y;

    const HUE = offsetY / length;
    const saturation = controlPositions.c1x / length;
    const lightness = 1 - controlPositions.c1y / length;
    const alpha = 1 - controlPositions.c3y / length;

    // new color
    const newColor = new Color(
      {
        h: HUE * 360,
        s: saturation * 100,
        v: lightness * 100,
        a: alpha,
      },
      format,
    );
    const newValue = newColor.toString();

    setValue(newValue);
    setInputValue(newValue);
    setColor(newColor);
    setControlPositions(prev => ({
      ...prev,
      c2y: offsetY,
    }));
  };

  const changeAlpha = (Y: number) => {
    let offsetY = 0;
    const length = offsetLength();

    // istanbul ignore next @preserve
    if (Y > length) offsetY = length;
    else if (Y >= 0) offsetY = Y;

    // update color alpha
    const alpha = 1 - offsetY / length;
    const newColor = new Color(color.setAlpha(alpha), format);
    const newValue = newColor.toString();

    setValue(newValue);
    setInputValue(newValue);
    setColor(newColor);
    setControlPositions(prev => ({
      ...prev,
      c3y: offsetY,
    }));
  };

  const toggleGlobalEvents = (add?: boolean) => {
    const action = add ? on : off;
    action(document, 'pointermove', pointerMove);
  };
  useEffect(() => {
    if (drag) toggleGlobalEvents(true);
    else toggleGlobalEvents();
    return toggleGlobalEvents;
  }, [drag]);

  return (
    <div className={`color-controls ${format}`} ref={controlsParentRef}>
      <div className="color-control" role="presentation" tabIndex={-1} onPointerDown={pointerDown}>
        <div className="visual-control visual-control1" style={{ background: fillGradient() }}></div>
        <div
          className="color-pointer knob"
          role="slider"
          tabIndex={0}
          aria-live="polite"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${locale().lightnessLabel} &amp; ${locale().saturationLabel}`}
          aria-valuetext={`${lightness}% &amp; ${saturation}%`}
          aria-valuenow={lightness}
          onKeyDown={handleKnobs}
          style={{ transform: `translate3d(${controlPositions.c1x - 4}px, ${controlPositions.c1y - 4}px, 0px)` }}
        ></div>
      </div>
      <div className="color-control" role="presentation" tabIndex={-1} onPointerDown={pointerDown}>
        <div className="visual-control visual-control2" style={{ background: hueGradient }}></div>
        <div
          className="color-slider knob"
          aria-live="polite"
          role="slider"
          tabIndex={0}
          aria-label={locale().hueLabel}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-description={`${locale().valueLabel}: ${stringValue}. ${locale().appearanceLabel}: ${appearance}.`}
          aria-valuetext={`${roundPart(hue * 100)}°`}
          aria-valuenow={roundPart(hue * 100)}
          style={{ transform: `translate3d(0px, ${controlPositions.c2y - 4}px, 0px)` }}
          onKeyDown={handleKnobs}
        ></div>
      </div>
      <div className="color-control" role="presentation" tabIndex={-1} onPointerDown={pointerDown}>
        <div
          className="visual-control visual-control3"
          style={{
            background: `linear-gradient(${fill.setAlpha(1).toRgbString()} 0%, ${fill.setAlpha(0).toRgbString()} 100%)`,
          }}
        ></div>
        <div
          className="color-slider knob"
          aria-live="polite"
          role="slider"
          tabIndex={0}
          aria-label={locale().alphaLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${roundPart(alpha * 100)}%`}
          aria-valuenow={roundPart(alpha * 100)}
          onKeyDown={handleKnobs}
          style={{ transform: `translate3d(0px, ${controlPositions.c3y - 4}px, 0px)` }}
        ></div>
      </div>
    </div>
  );
};

const RGBForm = forwardRef((props: PickerProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { locale, format, color, setColor, setValue, setInputValue, updateControlPositions } = usePickerContext();
  const id = useId().replace(/\:/g, '');
  const rgb = () => {
    let { r, g, b, a } = color.toRgb();
    a = roundPart(a * 100);
    [r, g, b] = [r, g, b].map(roundPart) as [number, number, number];
    return { r, g, b, a };
  };
  const stringValue = () => {
    const { r, g, b } = rgb();
    return `${format.toUpperCase()}: ${r} ${g} ${b}`;
  };
  const setColorProxy = (newColor: Color) => {
    const newString = newColor.toString();
    setColor(newColor);
    setValue(newString);
    setInputValue(newString);

    updateControlPositions(newColor);
  };

  const changeRed = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...rgb(), r: Number(e.currentTarget.value) }, format));
  const changeGreen = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...rgb(), g: Number(e.currentTarget.value) }, format));
  const changeBlue = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...rgb(), b: Number(e.currentTarget.value) }, format));
  const changeAlpha = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...rgb(), a: Number(e.currentTarget.value) / 100 }, format));

  return (
    <div className={`color-dropdown picker${props.className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />
      <div className="color-form rgb">
        <label htmlFor={`color-rgb-red-${id}`}>
          <span aria-hidden={true}>R:</span>
          <span className="v-hidden">{locale().redLabel}</span>
        </label>
        <input
          id={`color-rgb-red-${id}`}
          type="number"
          className="color-input red"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={255}
          step={1}
          value={rgb().r}
          onChange={changeRed}
        />
        <label htmlFor={`color-rgb-green-${id}`}>
          <span aria-hidden={true}>G:</span>
          <span className="v-hidden">{locale().greenLabel}</span>
        </label>
        <input
          id={`color-rgb-green-${id}`}
          type="number"
          className="color-input green"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={255}
          step={1}
          value={rgb().g}
          onChange={changeGreen}
        />
        <label htmlFor={`color-rgb-blue-${id}`}>
          <span aria-hidden={true}>B:</span>
          <span className="v-hidden">{locale().blueLabel}</span>
        </label>
        <input
          id={`color-rgb-blue-${id}`}
          type="number"
          className="color-input blue"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={255}
          step={1}
          value={rgb().b}
          onChange={changeBlue}
        />
        <label htmlFor={`color-rgb-alpha-${id}`}>
          <span aria-hidden={true}>A:</span>
          <span className="v-hidden">{locale().alphaLabel}</span>
        </label>
        <input
          id={`color-rgb-alpha-${id}`}
          type="number"
          className="color-input alpha"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={100}
          step={1}
          value={rgb().a}
          onChange={changeAlpha}
        />
      </div>
    </div>
  );
});

const HSLForm = forwardRef((props: PickerProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { format, locale, color, setColor, setValue, setInputValue, updateControlPositions } = usePickerContext();
  const id = useId().replace(/\:/g, '');
  const hsl = () => {
    let { h, s, l, a } = color.toHsl();
    [h, s, l] = [h, s, l].map((cl, i) => roundPart(cl * (i ? 100 : 360))) as [number, number, number];
    a = roundPart(a * 100);
    return { h, s, l, a };
  };
  const stringValue = () => {
    const { h, s, l } = hsl();
    return `${format.toUpperCase()}: ${h}° ${s}% ${l}%`;
  };
  const setColorProxy = (newColor: Color) => {
    const newString = newColor.toString();
    setColor(newColor);
    setValue(newString);
    setInputValue(newString);
    updateControlPositions(newColor);
  };

  const changeHue = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hsl(), h: Number(e.currentTarget.value) }, format));
  const changeSaturation = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hsl(), s: Number(e.currentTarget.value) }, format));
  const changeLightness = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hsl(), l: Number(e.currentTarget.value) }, format));
  const changeAlpha = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hsl(), a: Number(e.currentTarget.value) / 100 }, format));

  return (
    <div className={`color-dropdown picker${props.className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />

      <div className="color-form hsl">
        <label htmlFor={`color-hsl-hue-${id}`}>
          <span aria-hidden={true}>H:</span>
          <span className="v-hidden">{locale().hueLabel}</span>
        </label>
        <input
          id={`color-hsl-hue-${id}`}
          type="number"
          className="color-input hue"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={360}
          step={1}
          value={hsl().h}
          onChange={changeHue}
        />
        <label htmlFor={`color-hsl-saturation-${id}`}>
          <span aria-hidden={true}>S:</span>
          <span className="v-hidden">{locale().saturationLabel}</span>
        </label>
        <input
          id={`color-hsl-saturation-${id}`}
          type="number"
          className="color-input saturation"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={100}
          step={1}
          value={hsl().s}
          onChange={changeSaturation}
        />
        <label htmlFor={`color-hsl-lightness-${id}`}>
          <span aria-hidden={true}>L:</span>
          <span className="v-hidden">{locale().lightnessLabel}</span>
        </label>
        <input
          id={`color-hsl-lightness-${id}`}
          type="number"
          className="color-input lightness"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={100}
          step={1}
          value={hsl().l}
          onChange={changeLightness}
        />
        <label htmlFor={`color-hsl-alpha-${id}`}>
          <span aria-hidden={true}>A:</span>
          <span className="v-hidden">{locale().alphaLabel}</span>
        </label>
        <input
          id={`color-hsl-alpha-${id}`}
          type="number"
          className="color-input alpha"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={100}
          step={1}
          value={hsl().a}
          onChange={changeAlpha}
        />
      </div>
    </div>
  );
});

const HWBForm = forwardRef((props: PickerProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { locale, format, color, setColor, setValue, setInputValue, updateControlPositions } = usePickerContext();
  const id = useId().replace(/\:/g, '');
  const hwb = () => {
    let { h, w, b, a } = color.toHwb();
    [h, w, b] = [h, w, b].map((cl, i) => roundPart(cl * (i ? 100 : 360))) as [number, number, number];
    a = roundPart(a * 100);
    return { h, w, b, a };
  };
  const stringValue = () => {
    const { h, w, b } = hwb();
    return `${format.toUpperCase()}: ${h}° ${w}% ${b}%`;
  };
  const setColorProxy = (newColor: Color) => {
    const newString = newColor.toString();
    setColor(newColor);
    setValue(newString);
    setInputValue(newString);
    updateControlPositions(newColor);
  };

  const changeHue = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hwb(), h: Number(e.currentTarget.value) }, format));
  const changeWhiteness = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hwb(), w: Number(e.currentTarget.value) }, format));
  const changeBlackness = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hwb(), b: Number(e.currentTarget.value) }, format));
  const changeAlpha = (e: ChangeEvent<HTMLInputElement>) =>
    setColorProxy(new Color({ ...hwb(), a: Number(e.currentTarget.value) / 100 }, format));

  return (
    <div className={`color-dropdown picker${props.className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />

      <div className="color-form hwb">
        <label htmlFor={`color-hwb-hue-${id}`}>
          <span aria-hidden={true}>H:</span>
          <span className="v-hidden">{locale().hueLabel}</span>
        </label>
        <input
          id={`color-hwb-hue-${id}`}
          type="number"
          className="color-input hue"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={360}
          step={1}
          value={hwb().h}
          onChange={changeHue}
        />
        <label htmlFor={`color-hwb-whiteness-${id}`}>
          <span aria-hidden={true}>W:</span>
          <span className="v-hidden">{locale().whitenessLabel}</span>
        </label>
        <input
          id={`color-hwb-whiteness-${id}`}
          type="number"
          className="color-input whiteness"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={100}
          step={1}
          value={hwb().w}
          onChange={changeWhiteness}
        />
        <label htmlFor={`color-hwb-blackness-${id}`}>
          <span aria-hidden={true}>B:</span>
          <span className="v-hidden">{locale().blacknessLabel}</span>
        </label>
        <input
          id={`color-hwb-blackness-${id}`}
          type="number"
          className="color-input blackness"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={100}
          step={1}
          value={hwb().b}
          onChange={changeBlackness}
        />
        <label htmlFor={`color-hwb-alpha-${id}`}>
          <span aria-hidden={true}>A:</span>
          <span className="v-hidden">{locale().alphaLabel}</span>
        </label>
        <input
          id={`color-hwb-alpha-${id}`}
          type="number"
          className="color-input alpha"
          autoComplete="off"
          spellCheck="false"
          min={0}
          max={100}
          step={1}
          value={hwb().a}
          onChange={changeAlpha}
        />
      </div>
    </div>
  );
});

const HEXForm = forwardRef((props: PickerProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { format, locale, color, setColor, setValue, setInputValue, updateControlPositions } = usePickerContext();
  const [hex, setHex] = useState(color.toHex());
  const HEX = () => color.toHex();
  const { className } = props;
  const id = useId().replace(/\:/g, '');
  const stringValue = () => `${locale().hexLabel}: ${HEX().toUpperCase()}`;
  const updateHex = (e: KeyboardEvent<HTMLInputElement>) => {
    // istanbul ignore next @preserve
    if (e.key === keyEnter) {
      const newValue = e.currentTarget.value;
      const newColor = new Color(newValue, format);
      // istanbul ignore next @preserve
      if (newValue.length && newColor.isValid) {
        setColor(newColor);
        setInputValue(newValue);
        setValue(newValue);
        updateControlPositions(newColor);
      }
    }
  };

  const changeHex = (e: ChangeEvent<HTMLInputElement>) => setHex(e.target.value);
  useEffect(() => setHex(color.toHex()), [color]);

  return (
    <div className={`color-dropdown picker${className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />

      <div className={'color-form hex'}>
        <label htmlFor={`color-hex-${id}`}>
          <span aria-hidden={true}>#:</span>
          <span className="v-hidden">{locale().hexLabel}</span>
        </label>
        <input
          id={`color-hex-${id}`}
          type="text"
          className="color-input hex"
          autoComplete="off"
          spellCheck="false"
          value={hex}
          onChange={changeHex}
          onKeyUp={updateHex}
        />
      </div>
    </div>
  );
});

const PartSelection = {
  rgb: RGBForm,
  hex: HEXForm,
  hsl: HSLForm,
  hwb: HWBForm,
};

const PickerDropdown = forwardRef((props: PickerProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { format } = usePickerContext();

  return createElement(PartSelection[format], { ...props, ref });
});

export default PickerDropdown;
