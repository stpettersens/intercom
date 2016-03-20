/*
    Intercom server.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const Speaker = require('speaker');
const BinaryServer = require('binaryjs').BinaryServer;

let server = BinaryServer({port: 8080});
let out = null;

let speaker = new Speaker({
	channels: 1,
	sampleRate: 48000,
	bitDepth: 16
});

server.on('connection', function(client) {
	client.on('stream', function(stream, meta) {
		stream.pipe(speaker);
	});
});
