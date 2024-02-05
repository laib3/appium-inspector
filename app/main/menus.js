import {Menu, app, dialog, shell} from 'electron';

import config, {languageList} from '../configs/app.config';
import i18n from '../configs/i18next.config';
import {checkNewUpdates} from './auto-updater';
import {APPIUM_SESSION_EXTENSION} from './helpers';
import {launchNewSessionWindow} from './windows';

let menuTemplates = {mac: {}, other: {}};

function languageMenu() {
  return languageList.map((language) => ({
    label: `${language.name} (${language.original})`,
    type: 'radio',
    checked: i18n.language === language.code,
    click: () => i18n.changeLanguage(language.code),
  }));
}

function getShowAppInfoClickAction() {
  return () => {
    dialog.showMessageBox({
      title: i18n.t('appiumInspector'),
      message: i18n.t('showAppInfo', {
        appVersion: app.getVersion(),
        electronVersion: process.versions.electron,
        nodejsVersion: process.versions.node,
      }),
    });
  };
}

function macMenuAppium() {
  return {
    label: 'Appium',
    submenu: [
      {
        label: i18n.t('About Appium'),
        click: getShowAppInfoClickAction(),
      },
      {
        label: i18n.t('Check for updates'),
        click() {
          checkNewUpdates(true);
        },
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('Hide Appium'),
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: i18n.t('Hide Others'),
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      {
        label: i18n.t('Show All'),
        selector: 'unhideAllApplications:',
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('Quit'),
        accelerator: 'Command+Q',
        click() {
          app.quit();
        },
      },
    ],
  };
}

function macMenuEdit() {
  return {
    label: i18n.t('Edit'),
    submenu: [
      {
        label: i18n.t('Undo'),
        accelerator: 'Command+Z',
        selector: 'undo:',
      },
      {
        label: i18n.t('Redo'),
        accelerator: 'Shift+Command+Z',
        selector: 'redo:',
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('Cut'),
        accelerator: 'Command+X',
        selector: 'cut:',
      },
      {
        label: i18n.t('Copy'),
        accelerator: 'Command+C',
        selector: 'copy:',
      },
      {
        label: i18n.t('Paste'),
        accelerator: 'Command+V',
        selector: 'paste:',
      },
      {
        label: i18n.t('Select All'),
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  };
}

function macMenuView({mainWindow}) {
  const submenu =
    process.env.NODE_ENV === 'development'
      ? [
          {
            label: i18n.t('Reload'),
            accelerator: 'Command+R',
            click() {
              mainWindow.webContents.reload();
            },
          },
          {
            label: i18n.t('Toggle Developer Tools'),
            accelerator: 'Alt+Command+I',
            click() {
              mainWindow.toggleDevTools();
            },
          },
        ]
      : [];

  submenu.push({
    label: i18n.t('Toggle Full Screen'),
    accelerator: 'Ctrl+Command+F',
    click() {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    },
  });

  submenu.push({
    label: i18n.t('Languages'),
    submenu: languageMenu(),
  });

  return {
    label: i18n.t('View'),
    submenu,
  };
}

function macMenuWindow() {
  return {
    label: i18n.t('Window'),
    submenu: [
      {
        label: i18n.t('Minimize'),
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      {
        label: i18n.t('Close'),
        accelerator: 'Command+W',
        selector: 'performClose:',
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('Bring All to Front'),
        selector: 'arrangeInFront:',
      },
    ],
  };
}

function macMenuHelp() {
  return {
    label: i18n.t('Help'),
    submenu: [
      {
        label: i18n.t('Inspector Documentation'),
        click() {
          shell.openExternal('https://github.com/appium/appium-inspector');
        },
      },
      {
        label: i18n.t('Appium Documentation'),
        click() {
          shell.openExternal('https://appium.io');
        },
      },
      {
        label: i18n.t('Search Issues'),
        click() {
          shell.openExternal('https://github.com/appium/appium-inspector/issues');
        },
      },
      {
        label: i18n.t('Add Or Improve Translations'),
        click() {
          shell.openExternal('https://crowdin.com/project/appium-desktop');
        },
      },
    ],
  };
}

menuTemplates.mac = ({mainWindow, shouldShowFileMenu}) => [
  macMenuAppium(),
  ...(shouldShowFileMenu ? [macMenuFile({mainWindow})] : []),
  macMenuEdit(),
  macMenuView({mainWindow}),
  macMenuWindow(),
  macMenuHelp(),
];

async function openFileCallback(mainWindow) {
  const {canceled, filePaths} = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: 'Appium Session Files', extensions: [APPIUM_SESSION_EXTENSION]}],
  });
  if (!canceled) {
    const filePath = filePaths[0];
    mainWindow.webContents.send('open-file', filePath);
  }
}

async function saveAsCallback(mainWindow) {
  const {canceled, filePath} = await dialog.showSaveDialog({
    title: i18n.t('saveAs'),
    filters: [{name: 'Appium', extensions: [APPIUM_SESSION_EXTENSION]}],
  });
  if (!canceled) {
    mainWindow.webContents.send('save-file', filePath);
  }
}

function macMenuFile({mainWindow}) {
  return {
    label: i18n.t('File'),
    submenu: [
      {
        label: i18n.t('New Session Window…'),
        accelerator: 'Command+N',
        click: launchNewSessionWindow,
      },
      {
        label: i18n.t('Open'),
        accelerator: 'Command+O',
        click: () => openFileCallback(mainWindow),
      },
      {
        label: i18n.t('Save'),
        accelerator: 'Command+S',
        click: () => mainWindow.webContents.send('save-file'),
      },
      {
        label: i18n.t('saveAs'),
        accelerator: 'Command+Shift+S',
        click: () => saveAsCallback(mainWindow),
      },
    ],
  };
}

function otherMenuFile({mainWindow, shouldShowFileMenu}) {
  const fileSavingOperations = [
    {
      label: i18n.t('New Session Window…'),
      accelerator: 'Ctrl+N',
      click: launchNewSessionWindow,
    },
    {
      label: i18n.t('Open'),
      accelerator: 'Ctrl+O',
      click: () => openFileCallback(mainWindow),
    },
    {
      label: i18n.t('Save'),
      accelerator: 'Ctrl+S',
      click: () => mainWindow.webContents.send('save-file'),
    },
    {
      label: i18n.t('saveAs'),
      accelerator: 'Ctrl+Shift+S',
      click: () => saveAsCallback(mainWindow),
    },
  ];

  let fileSubmenu = [
    ...(shouldShowFileMenu ? fileSavingOperations : []),
    {
      label: '&' + i18n.t('About Appium'),
      click: getShowAppInfoClickAction(),
    },
    {
      type: 'separator',
    },
    {
      label: '&' + i18n.t('Close'),
      accelerator: 'Ctrl+W',
      click() {
        mainWindow.close();
      },
    },
  ];

  // If it's Windows, add a 'Check for Updates' menu option
  if (process.platform === 'win32') {
    fileSubmenu.splice(1, 0, {
      label: '&' + i18n.t('Check for updates'),
      click() {
        checkNewUpdates(true);
      },
    });
  }

  return {
    label: '&' + i18n.t('File'),
    submenu: fileSubmenu,
  };
}

function otherMenuView({mainWindow}) {
  const submenu = [];
  submenu.push({
    label: i18n.t('Toggle &Full Screen'),
    accelerator: 'F11',
    click() {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    },
  });

  submenu.push({
    label: i18n.t('Languages'),
    submenu: languageMenu(),
  });

  if (process.env.NODE_ENV === 'development') {
    submenu.push({
      label: '&' + i18n.t('Reload'),
      accelerator: 'Ctrl+R',
      click() {
        mainWindow.webContents.reload();
      },
    });
    submenu.push({
      label: i18n.t('Toggle &Developer Tools'),
      accelerator: 'Alt+Ctrl+I',
      click() {
        mainWindow.toggleDevTools();
      },
    });
  }

  return {
    label: '&' + i18n.t('View'),
    submenu,
  };
}

function otherMenuHelp() {
  // just the same as mac menus for now since we don't have any hotkeys for this menu
  return macMenuHelp();
}

menuTemplates.other = ({mainWindow, shouldShowFileMenu}) => [
  otherMenuFile({mainWindow, shouldShowFileMenu}),
  otherMenuView({mainWindow}),
  otherMenuHelp(),
];

export function rebuildMenus(mainWindow, shouldShowFileMenu) {
  if (!mainWindow) {
    return;
  }

  if (config.platform === 'darwin') {
    const template = menuTemplates.mac({mainWindow, shouldShowFileMenu});
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    const template = menuTemplates.other({mainWindow, shouldShowFileMenu});
    const menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
}
