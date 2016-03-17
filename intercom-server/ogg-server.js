/*
    Intercom server.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const fs = require('fs');
const http = require('http');
const ogg = require('ogg');
const vorbis = require('vorbis');
const BinaryServer = require('binaryjs').BinaryServer;
const server = http.createServer();

let bs = BinaryServer({server: server});
let oe = new ogg.Encoder();
let ve = new vorbis.Encoder();
let out = null;

bs.on('connection', function(client) {
	client.on('stream', function(stream, meta) {
		stream.pipe(ve);
		stream.on('end', function() {
			ve.pipe(oe.stream());
			oe.pipe(process.stdout);
		});
	});

	client.on('close', function() {
		if(out != null) {
			ve.pipe(oe.stream());
			oe.pipe(process.stdout);
		}
	});
});

server.listen(43770);
