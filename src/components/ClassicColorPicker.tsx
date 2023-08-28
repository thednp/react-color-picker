import ColorPicker from '@thednp/color-picker';
import './color-picker.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import { addListener, removeListener } from '@thednp/event-listener';
import type { ColorPickerProps } from '../types/types';

let pickerId = 0;

const ClassicColorPicker = (props: ColorPickerProps & { label: string }) => {
  const target = useRef<HTMLInputElement>(undefined as any);
  const [instance, setInstance] = useState<ColorPicker>(undefined as any);
  const id = props.id ? props.id : `picker-${pickerId}`;
  const colorValue = useMemo(() => {
    let newValue = props.value || 'red';
    if (typeof instance !== 'undefined') {
      newValue = instance.value;
    }
    if (typeof props.onChange !== 'undefined') {
      props.onChange(newValue);
    }

    return newValue;
  }, []);

  useEffect(() => {
    if (typeof target.current !== 'undefined') {
      const newInstance = new ColorPicker(target.current);
      if (props.value) {
        newInstance.color = new ColorPicker.Color(props.value, props.format || 'rgb');
        newInstance.update();
      }
      const changeListener = () => {
        if (typeof props.onChange !== 'undefined') {
          props.onChange(newInstance.value);
        }
      };
      setInstance(newInstance);
      if (typeof props.onChange !== 'undefined') {
        props.onChange(newInstance.value);
        addListener(target.current, 'colorpicker.change', changeListener);
      }
      pickerId += 1;
      return () => {
        if (typeof target.current !== 'undefined') {
          ColorPicker.getInstance(target.current)?.dispose();
          removeListener(target.current, 'colorpicker.change', changeListener);
          setInstance(undefined as any);
        }
      };
    }
  }, [target]);

  return (
    <div className={props.className}>
      <label htmlFor={id}>{props.label || 'Sample Label'}</label>
      <div className="color-picker">
        <input
          ref={target}
          name={id}
          id={id}
          type="text"
          className="color-preview btn-appearance"
          autoComplete="off"
          spellCheck="false"
          placeholder={props.placeholder || 'Select colour'}
          value={colorValue}
          onChange={e => {
            props.onChange ? props.onChange(e.target.value) : null;
          }}
          data-format={props.format || 'rgb'}
          data-color-presets={JSON.stringify({ hue: 120, hueSteps: 12, lightSteps: 10, saturation: 85 })}
        />
      </div>
    </div>
  );
};
export default ClassicColorPicker;
