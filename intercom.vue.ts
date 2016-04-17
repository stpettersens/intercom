/*
    Intercom.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

/// <reference path="typings/main.d.ts" />
/// <reference path="typings/intercom/vue-instance.ts" />
/// <reference path="typings/intercom/audio.ts" />
/// <reference path="typings/intercom/configuration.ts" />

import $ = require('jquery');
import storage = require('electron-json-storage');
import fs = require('fs');

class Intercom extends VueInstance {
	constructor() {
		super();
		this.el = '#intercom';
		this.data = {
			contact: {
				username: '',
				name: '',
				group: ''
			},
			contacts: []
		};
	}

	public ready(): void {
		if(sessionStorage.getItem('init') === null) {
			let data = JSON.parse(fs.readFileSync('defaults.json', 'utf-8').toString());
			sessionStorage.setItem('server', `${data.host}:${data.port}`);
			sessionStorage.setItem('init', 'true');
			window.location.reload();
		}
		storage.get('server', function(err, data: Configuration) {
			$('#init').css('display', 'none');
			if(data) {
				let host = data.host;
				let port = data.port;
				sessionStorage.setItem('server', `${host}:${port}`);
			}
			else {
				sessionStorage.setItem('server', 'localhost:43370');
			}
		});
	};

	private toggleButton(btn, first, second, caption): void {
		let on = null;
		if($(btn).attr('href') == first) {
			$(btn).attr('href', second);
			$(btn).text(`${caption} ${second.substr(1, second.length)}`);
			on = false;
		}
		else {
			$(btn).attr('href', first);
			$(btn).text(`${caption} ${first.substr(1, first.length)}`);
			on = true;
		}
		return on;
	};

	public displayAbout(): void {
		let html;
		html  = '<div class="about">';
		html += '<span class="navbar-brand">Intercom</span>';
		html += '<br><p>version 0.1</p>';
		html += '<hr><p>P2P voice chat application.</p>'
		html += '<p>Copyright &copy; 2016 Sam Saint-Pettersen.</p>';
		html += '<p>Released under the MIT License.</p>';
		html += `<hr><p>Using electron ${process.versions.electron}`
		html += ` + node.js ${process.versions.node}`;
		html += ` + chromium ${process.versions.chrome}</p>`;
		html += '<p>Intercom make uses of the following modules:</p>';
		html += '</div>';
		bootbox.dialog({
			message: html,
			title: 'About Intercom',
			buttons: {
				close: {
					label: 'Close',
					className: 'btn-default btn-close',
					callback: function() {}
				}
			}
		});
	};

	public connectServer(): void {
		bootbox.prompt({
			title: 'Connect to chat server',
			value: sessionStorage.getItem('server'),
			callback: function(result) {
				if(result !== null) {
					let server = result.split(':');
					storage.set('server', {
						host: server[0],
						port: parseInt(server[1])
					}, function() {});
					sessionStorage.setItem('server', result);
					window.location.reload();
				}
			}
		});
	};

	public addContact(): void {
		// ...
	};

	public retryMic(): void {
		AudioIO.init();
		$('#error').css('display', 'none');
	};

	public toggleBroadcast(): void {
		let on = this.toggleButton('#toggleBroadcast', '#on', '#off', 'Broadcast');
		if(on) AudioIO.init();
		else AudioIO.end();
	};
};
