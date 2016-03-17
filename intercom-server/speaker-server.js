/*
    Intercom server.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const fs = require('fs');
const http = require('http');
const Speaker = require('speaker');
const BinaryServer = require('binaryjs').BinaryServer;
const server = http.createServer();

let bs = BinaryServer({server: server});
let out = null;

let speaker = new Speaker({
	channels: 1,
	sampleRate: 48000,
	bitDepth: 16
});

bs.on('connection', function(client) {
	client.on('stream', function(stream, meta) {
		stream.pipe(speaker);
	});
});

server.listen(43770);
