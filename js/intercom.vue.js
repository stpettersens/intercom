/*
    Intercom.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const storage = require('electron-json-storage');

if(sessionStorage.getItem('server') == null) {
	sessionStorage.setItem('server', 'localhost:8080');
}

window.onload = function() {
	new Vue({
		el: '#intercom',
		data: {
			contact: { 
				username: '',
				lastName: '',
				firstName: '',
				group: '',
				date: ''
			},
			contacts: []
		},
		ready: function() {
			// ...
		},
		methods: {
			displayAbout: function() {
				let html;
				html  = '<div class="about">'
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
			},
			connectServer: function() {
				bootbox.prompt({
					title: 'Connect to chat server',
					value: sessionStorage.getItem('server'),
					callback: function(result) {
						if(result !== null) {
							let server = result.split(':');
							storage.set('server', {
								host: server[0],
								port: server[1]
							}, function() {});
							sessionStorage.setItem('server', result);
							window.location.reload();
						}
					}
				});
			},
			addContact: function() {
				// ...
			},
			retryMic: function() {
				AudioIO.init();
				$('#error').css('display', 'none');
			},
			toggleButton: function(btn, first, second, caption) {
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
			},
			toggleBroadcast: function() {
				let on = this.toggleButton('#toggleBroadcast', '#on', '#off', 'Broadcast');
				if(on) AudioIO.init();
				else AudioIO.end();
			}
		}
	});
}
