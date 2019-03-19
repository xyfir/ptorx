function onDeviceReady() {
  window.StatusBar.hide();
  window.location.href =
    'https://ptorx.com/app?r=source~phonegap-' +
    device.platform.split(' ')[0].toLowerCase();
}

document.addEventListener('deviceready', onDeviceReady, false);
