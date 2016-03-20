/*
    Intercom server.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const ogg = require('ogg');
const vorbis = require('vorbis');
const BinaryServer = require('binaryjs').BinaryServer;

let server = BinaryServer({port: 8080});
let oe = new ogg.Encoder();
let ve = new vorbis.Encoder();
let out = null;

server.on('connection', function(client) {
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
