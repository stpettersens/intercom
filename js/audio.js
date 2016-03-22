/*
    Intercom.
    P2P chat application.
    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

/*
	Some code adapted from:
	* https://henri.io/posts/streaming-microphone-input-with-flask.html
	* https://webaudiodemos.appspot.com/AudioRecorder/js/main.js
	* https://github.com/gabrielpoca/browser-pcm-stream
*/

'use strict';

let on = false;
let audioContext, audioInput, realAudioInput = null;
let inputPoint, micStream, analyser, canvas, ctx = null;
let canvasWidth, canvasHeight, bufferLength = 0;
let dataArray = [];

class AudioIO {

	static displayWaveform() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		bufferLength = analyser.frequencyBinCount;
		dataArray = new Uint8Array(bufferLength);
		analyser.getByteTimeDomainData(dataArray);
		AudioIO.drawWaveform();
	}

	static drawWaveform() {
		let drawVisual = window.requestAnimationFrame(AudioIO.drawWaveform);
		analyser.getByteTimeDomainData(dataArray)
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#d3d3d3';
		ctx.beginPath();

		let sliceWidth = canvas.width * 1.0 / bufferLength;
		let x = 0;

		for(let i = 0; i < bufferLength; i++) {
			let v = dataArray[i] / 128.0;
			let y = v * canvas.height / 2;

			if(i === 0) {
				ctx.moveTo(x, y);
			}
			else {
				ctx.lineTo(x, y);
			}
			x += sliceWidth;
		}

		ctx.lineTo(canvas.width, canvas.height / 2);
		ctx.stroke();
	}

	static getStream(stream) {
		inputPoint = audioContext.createGain();
		
		// Create an AudioNode from the stream.
		realAudioInput = audioContext.createMediaStreamSource(stream);

		let recorder = audioContext.createScriptProcessor(2048, 1, 1);
		recorder.onaudioprocess = AudioIO.onAudio;

		realAudioInput.connect(recorder);
		recorder.connect(audioContext.destination);

		audioInput = realAudioInput;
		audioInput.connect(inputPoint);

		audioInput = AudioIO.convertToMono(inputPoint);

		analyser = audioContext.createAnalyser();
		analyser.fftSize = 2048;
		inputPoint.connect(analyser);

		let zeroGain = audioContext.createGain();
		zeroGain.gain.value = 0.0;
		inputPoint.connect(zeroGain);
		zeroGain.connect(audioContext.destination);
		AudioIO.displayWaveform();
	}

	static convertFloat32ToInt16(buffer) {
		let l = buffer.length;
		let buf = new Int16Array(l);
		while(l--) {
			buf[l] = buffer[l] * 0xFFFF;
		}
		return buf.buffer;
	}

	static convertToMono(input) {
		let splitter = audioContext.createChannelSplitter(2);
		let merger = audioContext.createChannelMerger(2);

		input.connect(splitter);
		splitter.connect(merger, 0, 0);
		splitter.connect(merger, 0, 1);
		return merger;
	}

	static onAudio(e) {
		let mic = e.inputBuffer.getChannelData(0);
		let data = AudioIO.convertFloat32ToInt16(mic);
		if(on) client.emit('broadcast', data);
	}

	static init() {
		on = true;
		audioContext = new AudioContext();
		canvas = document.getElementById('waveform');
		ctx = canvas.getContext('2d');
		navigator.webkitGetUserMedia({
				audio: true,
				video: false,
		}, AudioIO.getStream, function(e) {
			$('#error').css('display', 'block');
			console.log(e);
		});
	}

	static end() {
		on = false;
		client.emit('end');
	}
}

window.addEventListener('load', AudioIO.init);
