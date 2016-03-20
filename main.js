/*
    Intercom.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800, 
		height: 540,
		resizable: false,
	});
	//mainWindow.webContents.openDevTools(); // !
	//mainWindow.setMenuBarVisibility(false);
	mainWindow.loadURL(`file://${__dirname}/index.html`);
}

app.on('ready', createWindow);
