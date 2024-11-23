import { Suspense } from 'react';
import { ColorKeywords } from '../src/types/types';
import Files from './assets/files.svg?react';
import Gear from './assets/gear.svg?react';
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

const Pre = ({ id, lang, color, format, theme, className, keywords, presets }: PreProps) => {
  const colorString = `  value="${color}"`;
  const formatString = format !== 'rgb' ? '  format="' + format + '"' : '';
  const langString = lang !== 'en' ? '  lang="' + lang + '"' : '';
  const themeString = theme !== 'dark' ? '  theme="' + theme + '"' : '';
  const onChangeString = `  onChange={(color) => console.log(color)}`;
  const keywordsString = keywords && keywords.length ? '  colorKeywords={' + JSON.stringify(keywords) + '}' : '';
  const presetsString =
    presets && presets.hueSteps && presets.lightSteps ? `  colorPresets={${JSON.stringify(presets)}}` : '';

  // cannot deconstruct class variable
  return (
    <Suspense>
      <div className="position-relative">
        <pre id={id} className={className}>
          <span className="d-block">{'<DefaultColorPicker'}</span>
          <span className={'heading-color'}>
            <span className="d-block">{colorString}</span>
            <span className="d-block">{formatString}</span>
            <span className="d-block">{langString}</span>
            <span className="d-block">{themeString}</span>
            <span className="d-block">{onChangeString}</span>
            <span className="d-block">{keywordsString}</span>
            <span className="d-block">{presetsString}</span>
          </span>
          <span className="d-block">{`/>`}</span>
        </pre>
        <div className="position-absolute d-flex gap-1" style={{ top: '1rem', right: '1rem' }}>
          <button className="btn-option" onClick={copyToClipboard} data-target={id}>
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
