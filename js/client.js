/*
    Intercom.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const toBuffer = require('typedarray-to-buffer');
const BinaryClient = require('binaryjs').BinaryClient;

let server = sessionStorage.getItem('server');
let audioStream = null;

let client = BinaryClient('ws://' + server);

client.on('open', function() {
	console.log(`Connecting to server: ${server}`);
	audioStream = client.createStream();
});

client.on('broadcast', function(data) {
	audioStream.write(toBuffer(data));
});

client.on('end', function() {
	audioStream.end();
});
