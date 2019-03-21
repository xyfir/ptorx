import { dependencies } from 'package.json';

// Due to OpenPGP.js requiring web workers and our webpack setup not playing
// nice with it we need to load it from a CDN
export function loadOpenPGP(): Promise<typeof import('openpgp').openpgp> {
  return new Promise(resolve => {
    // OpenPGP has already been loaded
    if (typeof window['openpgp'] != 'undefined')
      return resolve(window['openpgp']);

    const script = document.createElement('script');
    script.onload = () => resolve(window['openpgp']);
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/openpgp/' +
      dependencies.openpgp.substr(1) +
      '/openpgp.min.js';
    document.head.appendChild(script);
  });
}
