/*
    Intercom.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

'use strict';

const toBuffer = require('typedarray-to-buffer');
const BinaryClient = require('binaryjs').BinaryClient;

let client = BinaryClient('ws://localhost:43770');
let audioStream = null;

client.on('open', function() {
	audioStream = client.createStream();
});

client.on('broadcast', function(data) {
	audioStream.write(toBuffer(data));
});

client.on('end', function() {
	audioStream.end();
});
