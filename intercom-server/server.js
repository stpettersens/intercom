/*
    Intercom server.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const http = require('http');
const wav = require('wav');
const ogg = require('ogg');
const vorbis = require('vorbis');
const BinaryServer = require('binaryjs').BinaryServer;
const server = http.createServer();

let bs = BinaryServer({server: server});
let out = null;

bs.on('connection', function(client) {
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

server.listen(43770);
