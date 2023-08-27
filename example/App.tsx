import { ObjectEntries, ObjectKeys, ObjectValues } from '@thednp/shorty';
import Color from '@thednp/color';
import { useEffect, useState } from 'react';
import Fill from './assets/fill.svg';
import Banner from './assets/banner.svg';
import Plus from './assets/plus.svg';
import './style.css';

import Pre from './Pre';
import { DefaultColorPicker } from '../src';
import { getLanguageStrings } from '../src/locales/getLanguageStrings';
import type { SupportedFormat, SupportedLanguage } from '../src/types/types';
import getLocale from './util/locales';

const App = () => {
  const [format, setFormat] = useState<SupportedFormat>('rgb');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  // const [direction, setDirection] = useState<'rtl' | 'ltr' | null>(null);
  const [instanceColor, setInstanceColor] = useState('red');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const favicon = () => document.getElementById('favicon');
  const locale = () => getLanguageStrings(lang);
  const [hue, setHue] = useState(0);
  const [lightSteps, setLightSteps] = useState(10);
  const [hueSteps, setHueSteps] = useState(12);
  const [saturation, setSaturation] = useState(100);
  const presets = () => ({ hue, hueSteps, lightSteps, saturation });
  const [keywords, setKeywords] = useState<{ [x: string]: string }[]>([
    { default: 'rgb(37, 84, 189)' },
    { complementary: 'rgb(189, 142, 37)' },
  ]);
  const [colorLabel, setColorLabel] = useState('');
  const [colorValue, setColorValue] = useState('');
  const [palette, setPalette] = useState(true);
  const appLocale = () => getLocale(lang);
  const resetKeywordForm = () => {
    setColorValue('');
    setColorLabel('');
  };
  useEffect(() => {
    if (lang === 'ar') {
      // setDirection('rtl');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      // setDirection(null);
      document.documentElement.removeAttribute('dir');
    }
  });
  const onChange = (color: string) => {
    const newColor = new Color(color);
    const newColor90 = new Color(color).spin(90);
    const newColor180 = new Color(color).spin(180);
    const newColor270 = new Color(color).spin(270);
    setInstanceColor(color);
    document.documentElement.style.setProperty('--color', newColor.toRgbString());
    document.documentElement.style.setProperty('--color90', newColor90.toRgbString());
    document.documentElement.style.setProperty('--color180', newColor180.toRgbString());
    document.documentElement.style.setProperty('--color270', newColor270.toRgbString());
    (favicon() as HTMLElement).setAttribute(
      'href',
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="${newColor.toRgbString()}"><path d="M0 32a32 32 0 1 0 64 0a32 32 0 1 0 -64 0M21.83 47.18v-30.3q0 -4.65 2.66 -6.79T33 7.96c2.78 -0.15 5.55 0.42 8.04 1.67c0.23 0.13 0.45 0.28 0.66 0.43q2.85 2.1 2.85 6.9v9.97l-6.37 0.82v-9.22q0 -2.55 -0.98 -3.94t-4.05 -1.39q-2.93 0 -3.86 1.46t-0.94 3.79v27.23q0 1.95 1.05 3.23t3.75 1.27q2.77 0 3.9 -1.27t1.13 -3.23v-8.7l6.38 -0.75v10.95q0 3.98 -2.92 6.15t-8.4 2.17c-2.79 0.17 -5.57 -0.45 -8.03 -1.79C25.01 53.6 24.82 53.47 24.64 53.33q-2.81 -2.17 -2.81 -6.15z"></path></svg>`,
    );
    document.documentElement.style.setProperty(
      '--text-color',
      newColor.isDark && newColor.a > 0.33 ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)',
    );
    document.documentElement.style.setProperty(
      '--heading-color',
      newColor.isDark && newColor.a > 0.33 ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.85)',
    );
    document.documentElement.style.setProperty(
      '--bg-color',
      newColor.isDark && newColor.a > 0.33 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
    );
  };
  return (
    <>
      <div className="fill-wrapper">
        <Fill className="fill" />
      </div>
      <header className="container">
        <div className="row">
          <div className="col col-lg-6 mx-auto mb-5" style={{ paddingTop: '15vh' }}>
            <h1 className="v-hidden">React Color Picker</h1>
            <Banner className="logo mx-auto" />
          </div>
        </div>
      </header>
      <main className="container">
        <div className="row">
          <div className="col col-lg-6 mx-auto">
            <label className="v-hidden" htmlFor="my-color-picker">
              Default Color Picker
            </label>
            <DefaultColorPicker
              id="my-color-picker"
              format={format}
              theme={theme}
              lang={lang}
              value={'rgb(37, 84, 189)'}
              onChange={onChange}
              colorKeywords={keywords.length ? keywords : undefined}
              colorPresets={palette ? presets() : undefined}
            />
            <Pre
              id={'color-picker-sample-code'}
              className={'position-relative mb-3'}
              color={instanceColor}
              format={format}
              lang={lang}
              theme={theme}
              presets={palette ? presets() : undefined}
              keywords={keywords.length ? keywords : undefined}
            />
          </div>
        </div>

        <div className="collapse" id="color-picker-settings">
          <div className="row">
            <div className="col col-lg-6 d-flex mb-3 mx-auto">
              <span>{locale().formatLabel}</span>
              <div className="btn-toolbar gap-1 ms-auto">
                <button className={`btn${format === 'rgb' ? ' active' : ''}`} onClick={() => setFormat('rgb')}>
                  RGB
                </button>
                <button className={`btn${format === 'hsl' ? ' active' : ''}`} onClick={() => setFormat('hsl')}>
                  HSL
                </button>
                <button className={`btn${format === 'hwb' ? ' active' : ''}`} onClick={() => setFormat('hwb')}>
                  HWB
                </button>
                <button className={`btn${format === 'hex' ? ' active' : ''}`} onClick={() => setFormat('hex')}>
                  HEX
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col-lg-6 d-flex mb-3 mx-auto">
              <span>{appLocale().theme}</span>
              <div className="btn-toolbar ms-auto">
                <button className={`btn${theme === 'dark' ? ' active' : ''}`} onClick={() => setTheme('dark')}>
                  Dark
                </button>
                <button className={`btn${theme === 'light' ? ' active' : ''}`} onClick={() => setTheme('light')}>
                  Light
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col-lg-6 mx-auto">
              <div className="d-flex mb-3 gap-1">
                <div className="col d-flex gap-1">
                  <input
                    id={`enable_palette`}
                    className="m-0"
                    type="checkbox"
                    autoComplete="off"
                    checked={palette}
                    onChange={() => setPalette(!palette)}
                  />
                  <label className="m-0" htmlFor="enable_palette">
                    {appLocale().palette}
                  </label>
                </div>
                <div className="col ms-auto">
                  <div className="d-flex gap-1">
                    <div className="col">
                      <label htmlFor="hue_select" className="v-hidden">
                        {locale().hueLabel}
                      </label>
                      <input
                        id={`hue_select`}
                        type="number"
                        className="input"
                        autoComplete="off"
                        min={0}
                        max={359}
                        step={1}
                        spellCheck={false}
                        placeholder={locale().hueLabel}
                        value={hue}
                        onChange={e => setHue(Number(e.target.value))}
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="hueSteps_select" className="v-hidden">
                        {appLocale().hueSteps}
                      </label>
                      <input
                        id={`hueSteps_select`}
                        type="number"
                        className="input"
                        autoComplete="off"
                        min={1}
                        max={24}
                        step={1}
                        spellCheck={false}
                        value={hueSteps}
                        placeholder={appLocale().hueSteps}
                        onChange={e => setHueSteps(Number(e.target.value))}
                      />
                    </div>
                    <div className="col">
                      <label className="v-hidden" htmlFor="lightSteps_select">
                        {appLocale().ligthSteps}
                      </label>
                      <input
                        id={`lightSteps_select`}
                        type="number"
                        className="input"
                        autoComplete="off"
                        min={1}
                        max={24}
                        step={1}
                        spellCheck={false}
                        value={lightSteps}
                        placeholder={appLocale().ligthSteps}
                        onChange={e => setLightSteps(Number(e.target.value))}
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="saturation_select" className="v-hidden">
                        {locale().saturationLabel}
                      </label>
                      <input
                        id={`saturation_select`}
                        type="number"
                        className="input"
                        autoComplete="off"
                        min={1}
                        max={100}
                        step={1}
                        spellCheck={false}
                        value={saturation}
                        placeholder={locale().saturationLabel}
                        onChange={e => setSaturation(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col-lg-6 mx-auto">
              <div className="d-flex mb-3">
                <div className="col me-auto">{locale().presetsLabel}</div>
                <div className="col d-flex align-items-center gap-1">
                  <label htmlFor="add_key_label">
                    <span className="v-hidden">{appLocale().label}</span>
                  </label>
                  <input
                    id={`add_key_label`}
                    type="string"
                    className="input"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={appLocale().label}
                    value={colorLabel}
                    onChange={e => setColorLabel(e.target.value)}
                  />
                  <label htmlFor="add_key_value">
                    <span className="v-hidden">{appLocale().value}</span>
                  </label>
                  <input
                    id={`add_key_value`}
                    type="string"
                    className="input"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={appLocale().value}
                    value={colorValue}
                    onChange={e => setColorValue(e.target.value)}
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      const newColor = new Color(colorValue || colorLabel);
                      if (!colorValue && !colorLabel) {
                        return alert(appLocale().noColor);
                      }
                      if (!newColor.isValid) {
                        const temp = colorValue || colorLabel;
                        resetKeywordForm();
                        return alert(appLocale().invalidColor.replace(/\%/g, temp));
                      }
                      if (keywords.some(k => ObjectValues(k)[0] === colorLabel)) {
                        const temp = colorLabel;
                        resetKeywordForm();
                        return alert(appLocale().invalidLabel.replace(/\%/g, temp));
                      }
                      setKeywords([
                        ...keywords,
                        !colorValue ? { [colorLabel]: colorLabel } : { [colorLabel]: colorValue },
                      ]);
                      resetKeywordForm();
                    }}
                  >
                    <span className="v-hidden">Add</span>
                    <Plus fill="currentColor" />
                  </button>
                </div>
              </div>
              {keywords.length ? (
                <div className="d-flex justify-content-end mb-3">
                  <div className="btn-toolbar gap-1">
                    {keywords.map(kwd => {
                      const [k] = ObjectEntries(kwd)[0] as [string, string];
                      return (
                        <button
                          key={k}
                          className="btn"
                          onClick={() => setKeywords(keywords.filter(kw => ObjectKeys(kw)[0] !== k))}
                        >
                          {k}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="row">
            <div className="col col-lg-6 d-flex justify-content-between mx-auto mb-3">
              <span>{appLocale().language}</span>
              <div className="btn-toolbar scrollable">
                <button className={`btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>
                  EN
                </button>
                <button className={`btn${lang === 'ru' ? ' active' : ''}`} onClick={() => setLang('ru')}>
                  RU
                </button>
                <button className={`btn${lang === 'ar' ? ' active' : ''}`} onClick={() => setLang('ar')}>
                  AR
                </button>
                <button className={`btn${lang === 'fr' ? ' active' : ''}`} onClick={() => setLang('fr')}>
                  FR
                </button>
                <button className={`btn${lang === 'de' ? ' active' : ''}`} onClick={() => setLang('de')}>
                  DE
                </button>
                <button className={`btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>
                  ES
                </button>
                <button className={`btn${lang === 'ro' ? ' active' : ''}`} onClick={() => setLang('ro')}>
                  RO
                </button>
                <button className={`btn${lang === 'pl' ? ' active' : ''}`} onClick={() => setLang('pl')}>
                  PL
                </button>
                <button className={`btn${lang === 'pt' ? ' active' : ''}`} onClick={() => setLang('pt')}>
                  PT
                </button>
                <button className={`btn${lang === 'ja' ? ' active' : ''}`} onClick={() => setLang('ja')}>
                  JP
                </button>
                <button className={`btn${lang === 'zh' ? ' active' : ''}`} onClick={() => setLang('zh')}>
                  ZH
                </button>
                <button className={`btn${lang === 'ko' ? ' active' : ''}`} onClick={() => setLang('ko')}>
                  KO
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="d-block">
        <div className="row">
          <div className="col col-lg-6 mx-auto">
            <div className="d-flex justify-content-between">
              <p className="copy">
                <a target="_blank" href="https://github.com/thednp">
                  thednp
                </a>{' '}
                © {new Date().getFullYear()}
              </p>
              <p className="links">
                <a
                  target="_blank"
                  href="https://github.com/thednp/react-color-picker"
                  title="React Color Picker on Github"
                >
                  Github
                </a>
                {' / '}
                <a
                  target="_blank"
                  href="https://www.npmjs.com/package/@thednp/react-color-picker"
                  title="React Color Picker on NPM"
                >
                  NPM
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default App;
