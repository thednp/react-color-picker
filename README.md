[<img width="100%" src="banner.svg" alt="react-color-picker">](https://thednp.github.io/react-color-picker/)

# React Color Picker
[![ci](https://github.com/thednp/react-color-picker/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/react-color-picker/actions/workflows/ci.yml)
[![Npm Version](https://img.shields.io/npm/v/@thednp/react-color-picker)](https://www.npmjs.com/package/@thednp/react-color-picker)
[![typescript version](https://img.shields.io/badge/typescript-5.6.2-brightgreen)](https://www.typescriptlang.org/)
[![eslint version](https://img.shields.io/badge/eslint-8.57.1-brightgreen)](https://github.com/eslint)
[![prettier version](https://img.shields.io/badge/prettier-3.3.3-brightgreen)](https://prettier.io/)
[![react version](https://img.shields.io/badge/react-18.3.1-brightgreen)](https://react.dev/)
[![vitest version](https://img.shields.io/badge/vitest-2.1.2-brightgreen)](https://vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-5.4.8-brightgreen)](https://github.com/vitejs)

The feature rich **ColorPicker** component for React, sourced with TypeScript, WAI-ARIA compliant and is mainly based on [ColorPicker](https://github.com/thednp/color-picker).

## Demo
[Live Demo](https://thednp.github.io/react-color-picker/)


## Highlights

- Accessibility Focus for WAI-ARIA compliance
- Built in translations for German, French, Russian, Arabic, Spanish, Portuguese, Romanian, Polish, Chinese, Korean and Japanese for accessibility
- TypeScript sourced code base
- Supporting HEX(a), RGB(a), HSL(a) and HWB(a)
- Supports keyboard and touch events as well as responsive design
- Automatic repositioning of the popup dropdown on show / window scroll
- Right To Left Languages Supported


## Installation

```bash
npm i @thednp/react-color-picker
# or
yarn add @thednp/react-color-picker
# or
pnpm add @thednp/react-color-picker
```


## Usage

```tsx
import { DefaultColorPicker } from '@thednp/react-color-picker'
import '@thednp/react-color-picker/style.css'

function App() {
  return <DefaultColorPicker value="turquoise" onChange={color => console.log(color)} />;
}
```
For additional component configuration options, please check the [demo](https://thednp.github.io/react-color-picker/).


## Some notes
* The React version for [ColorPicer](https://github.com/thednp/color-picker) was implemented with minor differences to accomodate the declarative nature of the modern JavaScript framework, especially with event listeners.
* Due to the nature of React state management, this component is implemented with minor differences compared to the [SolidJS](https://github.com/thednp/solid-color-picker) version.
* Tests powered by Vitest make use of a real browser environment for consistent and realistic results.
* Since the React event listeners are synthetic by nature, some special fixtures have been implemented for the tests to make them possible.


## License

**React Color Picker** is released under the [MIT License](https://github.com/thednp/react-color-picker/blob/master/LICENSE).
