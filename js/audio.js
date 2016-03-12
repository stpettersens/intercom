'use strict';

const Recorder = require('recorderjs');
const MicrophoneStream = require('microphone-stream');

let audioContext = new AudioContext();
let audioInput = null,
	realAudioInput = null,
	inputPoint = null,
	micStream = null,
	audioRecorder = null,
	analyser = null,
	canvas = null,
	ctx = null,
	canvasWidth = 0, 
	canvasHeight = 0,
	bufferLength = 0,
	dataArray = [],
	recIndex = 0;

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
		audioInput = realAudioInput;
		audioInput.connect(inputPoint);

		analyser = audioContext.createAnalyser();
		analyser.fftSize = 2048;
		inputPoint.connect(analyser);

		audioRecorder = new Recorder(inputPoint);

		let zeroGain = audioContext.createGain();
		zeroGain.gain.value = 0.0;
		inputPoint.connect(zeroGain);
		zeroGain.connect(audioContext.destination);
		AudioIO.displayWaveform();

		micStream = new MicrophoneStream(stream);
		micStream.on('data', function(chunk) {
			let raw = MicrophoneStream.toRaw(chunk);
			//console.log(raw);
		});

		micStream.on('format', function(format) {
			console.log(format);
		});
	}

	static init() {
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
}

window.addEventListener('load', AudioIO.init);
