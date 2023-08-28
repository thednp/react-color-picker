import Color from '@thednp/color';
import { createElement, Suspense, ChangeEvent, forwardRef, ForwardedRef, useId } from 'react';
import type { ControlProps, PickerProps } from '../types/types';
import { usePickerContext } from './ColorPickerContext';

const { roundPart } = Color;

const ColorControls = (props: ControlProps) => {
  const { locale, format, controlPositions, appearance, hue, saturation, lightness, alpha, fill, fillGradient } =
    usePickerContext();
  const { stringValue } = props;
  const hueGradient = `linear-gradient(
    rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.67%, 
    rgb(0, 255, 0) 33.33%, 
    rgb(0, 255, 255) 50%, 
    rgb(0, 0, 255) 66.67%, 
    rgb(255, 0, 255) 83.33%, 
    rgb(255, 0, 0) 100%
  )`;

  return (
    <div className={`color-controls ${format}`}>
      <div className="color-control" role="presentation" tabIndex={-1}>
        <div className="visual-control visual-control1" style={{ background: fillGradient() }}></div>
        <div
          className="color-pointer knob"
          role="slider"
          tabIndex={0}
          aria-live="polite"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${locale().lightnessLabel} &amp; ${locale().saturationLabel}`}
          aria-valuetext={`${lightness()}% &amp; ${saturation()}%`}
          aria-valuenow={lightness()}
          style={{ transform: `translate3d(${controlPositions.c1x - 4}px, ${controlPositions.c1y - 4}px, 0px)` }}
        ></div>
      </div>
      <div className="color-control" role="presentation" tabIndex={-1}>
        <div className="visual-control visual-control2" style={{ background: hueGradient }}></div>
        <div
          className="color-slider knob"
          aria-live="polite"
          role="slider"
          tabIndex={0}
          aria-label={locale().hueLabel}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-description={`${locale().valueLabel}: ${stringValue}. ${locale().appearanceLabel}: ${appearance()}.`}
          aria-valuetext={`${roundPart(hue() * 100)}°`}
          aria-valuenow={roundPart(hue() * 100)}
          style={{ transform: `translate3d(0px, ${controlPositions.c2y - 4}px, 0px)` }}
        ></div>
      </div>
      <div className="color-control" role="presentation" tabIndex={-1}>
        <div
          className="visual-control visual-control3"
          style={{
            background: `linear-gradient(${fill().setAlpha(1).toRgbString()} 0%, ${fill()
              .setAlpha(0)
              .toRgbString()} 100%)`,
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
          aria-valuetext={`${roundPart(alpha() * 100)}%`}
          aria-valuenow={roundPart(alpha() * 100)}
          style={{ transform: `translate3d(0px, ${controlPositions.c3y - 4}px, 0px)` }}
        ></div>
      </div>
    </div>
  );
};

const RGBForm = forwardRef((props: PickerProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { locale, format, color, update, alpha } = usePickerContext();
  const id = useId();
  const rgb = () => {
    let { r, g, b, a } = color.toRgb();
    [r, g, b] = [r, g, b].map(roundPart) as [number, number, number];
    a = roundPart(alpha() * 100);
    return { r, g, b, a };
  };
  const stringValue = () => {
    const { r, g, b } = rgb();
    return `${format().toUpperCase()}: ${r} ${g} ${b}`;
  };

  const changeRed = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, r: Number(e.target.value) }, format()));
  const changeGreen = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, g: Number(e.target.value) }, format()));
  const changeBlue = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, b: Number(e.target.value) }, format()));
  const changeAlpha = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, a: Number(e.target.value) / 100 }, format()));

  return (
    <div className={`color-dropdown picker${props.className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />
      <div className="color-form rgb">
        <label htmlFor={`color:rgb:red:${id}`}>
          <span aria-hidden={true}>R:</span>
          <span className="v-hidden">{locale().redLabel}</span>
        </label>
        <input
          id={`color:rgb:red${id}`}
          type="number"
          className="color-input red"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={255}
          step={1}
          value={rgb().r}
          onChange={changeRed}
        />
        <label htmlFor={`color:rgb:green${id}`}>
          <span aria-hidden={true}>G:</span>
          <span className="v-hidden">{locale().greenLabel}</span>
        </label>
        <input
          id={`color:rgb:green${id}`}
          type="number"
          className="color-input green"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={255}
          step={1}
          value={rgb().g}
          onChange={changeGreen}
        />
        <label htmlFor={`color:rgb:blue${id}`}>
          <span aria-hidden={true}>B:</span>
          <span className="v-hidden">{locale().blueLabel}</span>
        </label>
        <input
          id={`color:rgb:blue${id}`}
          type="number"
          className="color-input blue"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={255}
          step={1}
          value={rgb().b}
          onChange={changeBlue}
        />
        <label htmlFor={`color:rgb:alpha${id}`}>
          <span aria-hidden={true}>A:</span>
          <span className="v-hidden">{locale().alphaLabel}</span>
        </label>
        <input
          id={`color:rgb:alpha${id}`}
          type="number"
          className="color-input alpha"
          autoComplete="off"
          spellCheck={false}
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
  const { format, locale, color, update, alpha } = usePickerContext();
  const id = useId();
  const hsl = () => {
    let { h, s, l, a } = color.toHsl();
    [h, s, l] = [h, s, l].map((cl, i) => roundPart(cl * (i ? 100 : 360))) as [number, number, number];
    a = roundPart(alpha() * 100);
    return { h, s, l, a };
  };
  const stringValue = () => {
    const { h, s, l } = hsl();
    return `${format().toUpperCase()}: ${h}° ${s}% ${l}%`;
  };

  const changeHue = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, h: Number(e.target.value) }, format()));
  const changeSaturation = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, s: Number(e.target.value) }, format()));
  const changeLightness = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, l: Number(e.target.value) }, format()));
  const changeAlpha = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, a: Number(e.target.value) / 100 }, format()));

  return (
    <div className={`color-dropdown picker${props.className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />

      <div className="color-form hsl">
        <label htmlFor={`color:hsl:hue${id}`}>
          <span aria-hidden={true}>H:</span>
          <span className="v-hidden">{locale().hueLabel}</span>
        </label>
        <input
          id={`color:hsl:hue${id}`}
          type="number"
          className="color-input hue"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={360}
          step={1}
          value={hsl().h}
          onChange={changeHue}
        />
        <label htmlFor={`color:hsl:saturation${id}`}>
          <span aria-hidden={true}>S:</span>
          <span className="v-hidden">{locale().saturationLabel}</span>
        </label>
        <input
          id={`color:hsl:saturation${id}`}
          type="number"
          className="color-input saturation"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={100}
          step={1}
          value={hsl().s}
          onChange={changeSaturation}
        />
        <label htmlFor={`color:hsl:lightness${id}`}>
          <span aria-hidden={true}>L:</span>
          <span className="v-hidden">{locale().lightnessLabel}</span>
        </label>
        <input
          id={`color:hsl:lightness${id}`}
          type="number"
          className="color-input lightness"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={100}
          step={1}
          value={hsl().l}
          onChange={changeLightness}
        />
        <label htmlFor={`color:hsl:alpha:${id}`}>
          <span aria-hidden={true}>A:</span>
          <span className="v-hidden">{locale().alphaLabel}</span>
        </label>
        <input
          id={`color:hsl:alpha:${id}`}
          type="number"
          className="color-input alpha"
          autoComplete="off"
          spellCheck={false}
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
  const { locale, format, color, update, alpha } = usePickerContext();
  const id = useId();
  const hwb = () => {
    let { h, w, b, a } = color.toHwb();
    [h, w, b] = [h, w, b].map((cl, i) => roundPart(cl * (i ? 100 : 360))) as [number, number, number];
    a = roundPart(alpha() * 100);
    return { h, w, b, a };
  };
  const stringValue = () => {
    const { h, w, b } = hwb();
    return `${format().toUpperCase()}: ${h}° ${w}% ${b}%`;
  };

  const changeHue = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, h: Number((e.currentTarget as HTMLInputElement).value) }, format()));
  const changeWhiteness = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, w: Number((e.currentTarget as HTMLInputElement).value) }, format()));
  const changeBlackness = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, b: Number((e.currentTarget as HTMLInputElement).value) }, format()));
  const changeAlpha = (e: ChangeEvent<HTMLInputElement>) =>
    update(new Color({ ...color, a: Number((e.currentTarget as HTMLInputElement).value) / 100 }, format()));

  return (
    <div className={`color-dropdown picker${props.className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />

      <div className="color-form hwb">
        <label htmlFor={`color:hwb:hue${id}`}>
          <span aria-hidden={true}>H:</span>
          <span className="v-hidden">{locale().hueLabel}</span>
        </label>
        <input
          id={`color:hwb:hue${id}`}
          type="number"
          className="color-input hue"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={360}
          step={1}
          value={hwb().h}
          onChange={changeHue}
        />
        <label htmlFor={`color:hwb:whiteness${id}`}>
          <span aria-hidden={true}>W:</span>
          <span className="v-hidden">{locale().whitenessLabel}</span>
        </label>
        <input
          id={`color:hwb:whiteness${id}`}
          type="number"
          className="color-input whiteness"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={100}
          step={1}
          value={hwb().w}
          onChange={changeWhiteness}
        />
        <label htmlFor={`color:hwb:blackness${id}`}>
          <span aria-hidden={true}>B:</span>
          <span className="v-hidden">{locale().blacknessLabel}</span>
        </label>
        <input
          id={`color:hwb:blackness${id}`}
          type="number"
          className="color-input blackness"
          autoComplete="off"
          spellCheck={false}
          min={0}
          max={100}
          step={1}
          value={hwb().b}
          onChange={changeBlackness}
        />
        <label htmlFor={`color:hwb:alpha${id}`}>
          <span aria-hidden={true}>A:</span>
          <span className="v-hidden">{locale().alphaLabel}</span>
        </label>
        <input
          id={`color:hwb:alpha${id}`}
          type="number"
          className="color-input alpha"
          autoComplete="off"
          spellCheck={false}
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
  const { format, locale, color, update } = usePickerContext();
  const { className } = props;
  const id = useId();
  const hex = () => color.toHex();
  const stringValue = () => `${locale().hexLabel}: ${hex().toUpperCase()}`;
  const changeHex = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newColor = new Color(newValue, format());
    if (newValue && newValue.length && newColor.isValid) {
      update(newColor);
    }
  };

  return (
    <div className={`color-dropdown picker${className}`} role="group" id={`${id}-picker`} ref={ref}>
      <ColorControls stringValue={stringValue()} />

      <div className={'color-form hex'}>
        <label htmlFor={`color:hex${id}`}>
          <span aria-hidden={true}>#:</span>
          <span className="v-hidden">{locale().hexLabel}</span>
        </label>
        <input
          id={`color:hex${id}`}
          type="text"
          className="color-input hex"
          autoComplete="off"
          spellCheck={false}
          value={hex()}
          onChange={changeHex}
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

  return <Suspense>{createElement(PartSelection[format()], { ...props, ref })}</Suspense>;
});

export default PickerDropdown;
