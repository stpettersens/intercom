'use strict';

const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800, 
		height: 670,
		resizable: false,
	});
	//mainWindow.webContents.openDevTools(); // !
	//mainWindow.setMenuBarVisibility(false);
	mainWindow.loadURL(`file://${__dirname}/index.html`);
}

app.on('ready', createWindow);
