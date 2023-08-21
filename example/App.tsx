// import 'bootstrap/scss/bootstrap-reboot.scss';
// import 'bootstrap/scss/bootstrap-grid.scss';

import DefaultColorPicker from '../src/components/DefaultColorPicker';
import ClassicColorPicker from '../src/components/ClassicColorPicker';

import './style.css';

const App = () => {
  const onChange = (color: string) => {
    // console.log(color)
    const favicon = document.getElementById('favicon');
    if (favicon && typeof favicon !== 'undefined') {
      favicon.setAttribute(
        'href',
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="${encodeURIComponent(
          color,
        )}"><path d="M0 32a32 32 0 1 0 64 0a32 32 0 1 0 -64 0M21.83 47.18v-30.3q0 -4.65 2.66 -6.79T33 7.96c2.78 -0.15 5.55 0.42 8.04 1.67c0.23 0.13 0.45 0.28 0.66 0.43q2.85 2.1 2.85 6.9v9.97l-6.37 0.82v-9.22q0 -2.55 -0.98 -3.94t-4.05 -1.39q-2.93 0 -3.86 1.46t-0.94 3.79v27.23q0 1.95 1.05 3.23t3.75 1.27q2.77 0 3.9 -1.27t1.13 -3.23v-8.7l6.38 -0.75v10.95q0 3.98 -2.92 6.15t-8.4 2.17c-2.79 0.17 -5.57 -0.45 -8.03 -1.79C25.01 53.6 24.82 53.47 24.64 53.33q-2.81 -2.17 -2.81 -6.15z"></path></svg>`,
      );
    }
  };
  return (
    <div className="container" style={{ padding: '15vh 0' }}>
      <div className="row">
        <div className="col">
          <DefaultColorPicker id="my-id" label="Default Color Picker" value={'red'} onChange={onChange} />
          <p>This is where we are working on.</p>
        </div>
        <div className="col">
          <ClassicColorPicker
            id="my-unique-id"
            label="Classic Color Picker"
            className="classic"
            format="hex"
            value="blue"
            onChange={onChange}
          />
          <p>This is how it should work.</p>
        </div>
        {/* <ColorPicker value="blue" onChange={onChange} /> */}
      </div>
    </div>
  );
};

export default App;
