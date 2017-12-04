function onDeviceReady() {
  window.location.href =
    'https://ptorx.com/app/?r=source~phonegap-' +
    device.platform.split(' ')[0].toLowerCase() +
    '&phonegap=1';
}

document.addEventListener('deviceready', onDeviceReady, false);