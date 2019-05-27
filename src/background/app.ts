// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import * as url from 'url';
import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { applicationMenuTemplate } from './menu/application_menu_template';
import createWindow from './helpers/window';

import { join } from 'path';
import { getConfig, setConfigProps } from './config';

import { BackgroundApp } from './model/background-app';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
  var userDataPath = app.getPath('userData');
  app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

const onThemeChange = (theme: string) => setConfigProps({ theme });

const onAngularToggle = () => {
  const config = getConfig();
  const showLibs = !config.showLibs;
  setConfigProps({ showLibs });
};

const onModulesToggle = () => {
  const config = getConfig();
  const showModules = !config.showModules;
  setConfigProps({ showModules });
};

const menuItems = [applicationMenuTemplate(onThemeChange, onAngularToggle, onModulesToggle)];
if (env.name !== 'production') {
  menuItems.push(devMenuTemplate());
}

export const menus = Menu.buildFromTemplate(menuItems);

app.on('ready', function() {
  Menu.setApplicationMenu(menus);

  var mainWindow = createWindow('main', {
    width: 1000,
    height: 600
  });

  mainWindow.setTitle(require('../package.json').name);

  mainWindow.loadURL(
    url.format({
      pathname: join(__dirname, 'app.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  if (env.name === 'development') {
    mainWindow.openDevTools();
  }

  const backgroundApp = new BackgroundApp();
  backgroundApp.init(getConfig());
});

app.on('window-all-closed', function() {
  app.quit();
});
