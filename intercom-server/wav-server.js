/*
    Intercom server.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const wav = require('wav');
const BinaryServer = require('binaryjs').BinaryServer;

let server = BinaryServer({port: 8080});
let out = null;

server.on('connection', function(client) {
	client.on('stream', function(stream, meta) {
		out = new wav.FileWriter('out.wav', {
			channels: 1,
			sampleRate: 48000,
			bitDepth: 16
		});
		stream.pipe(out);
		stream.on('end', function() {
			out.end();
		});
	});

	client.on('close', function() {
		if(out != null) {
			out.end();
		}
	});
});
