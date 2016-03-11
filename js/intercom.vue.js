'use strict';

const storage = require('electron-json-storage');

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
				/*storage.get('timestamp', function(err, data) {
					alert(data.ts);
				});*/
			},
			addContact: function() {
				// ...
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
				//storage.set('timestamp', { ts: Date.now() }, function(){});
				if(on) AudioIO.init();
			}
		}
	});
}
