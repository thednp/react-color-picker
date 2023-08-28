import { Suspense } from 'react';
import { ColorKeywords } from '../src/types/types';
import { ReactComponent as Files } from './assets/files.svg';
import { ReactComponent as Gear } from './assets/gear.svg';
import { toggleCollapse } from './util/toggleCollapse';
import copyToClipboard from './util/copyToClipboard';

type PreProps = {
  color: string;
  format: string;
  theme: 'dark' | 'light';
  lang: string;
  presets?: {
    hue: number;
    hueSteps: number;
    lightSteps: number;
    saturation: number;
  };
  className?: string;
  id?: string;
  keywords?: ColorKeywords;
};

const Pre = (props: PreProps) => {
  const id = () => props.id || 'color-picker-sample-code';
  const className = () => props.className;
  const colorString = () => `  value="${props.color}"`;
  const formatString = () => (props.format !== 'rgb' ? '  format="' + props.format + '"' : '');
  const langString = () => (props.lang !== 'en' ? '  lang="' + props.lang + '"' : '');
  const themeString = () => (props.theme !== 'dark' ? '  theme="' + props.theme + '"' : '');
  const onChangeString = () => `  onChange={(color) => console.log(color)}`;
  const keywordsString = () =>
    props.keywords && props.keywords.length ? '  colorKeywords={' + JSON.stringify(props.keywords) + '}' : '';
  const presetsString = () =>
    props.presets && props.presets.hueSteps && props.presets.lightSteps
      ? `  colorPresets={${JSON.stringify(props.presets)}}`
      : '';

  // cannot deconstruct class variable
  return (
    <Suspense>
      <div className="position-relative">
        <pre id={id()} className={className()}>
          <span className="d-block">{'<DefaultColorPicker'}</span>
          <span className={'heading-color'}>
            <span className="d-block">{colorString()}</span>
            <span className="d-block">{formatString()}</span>
            <span className="d-block">{langString()}</span>
            <span className="d-block">{themeString()}</span>
            <span className="d-block">{onChangeString()}</span>
            <span className="d-block">{keywordsString()}</span>
            <span className="d-block">{presetsString()}</span>
          </span>
          <span className="d-block">{`/>`}</span>
        </pre>
        <div className="position-absolute d-flex gap-1" style={{ top: '1rem', right: '1rem' }}>
          <button className="btn-option" onClick={copyToClipboard} data-target={id()}>
            <span className="v-hidden">Copy</span>
            <Files fill="currentColor" />
          </button>
          <button className="btn-option" onClick={toggleCollapse} data-target="color-picker-settings">
            <span className="v-hidden">Settings</span>
            <Gear fill="currentColor" />
          </button>
        </div>
      </div>
    </Suspense>
  );
};

export default Pre;
