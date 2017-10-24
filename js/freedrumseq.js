// 1. Bass Drum			36	//kickbeateron1.wav
// 2. Snare				38	//snare1.wav
// 3. Low Floor Tom		41	//floortom1.wav
// 4. High Floor Tom	43	//tom1.wav
// 5. Closed Hi-Hat		42	//hihatclose1.wav
// 6. Pedal Hi-Hat		44	//hihatloose1.wav
// 7. Open Hi-Hat		46	//hihat1.wav
// 8. Crash Cymbal		49	//crash20inch1.wav


	const bdrm = 36;
	const srnr = 38
	const lftm = 41
	const hftm = 43
	const cdhh = 42
	const pdhh = 44
	const ophh = 46
	const crsl = 49

	const dm0 = 0;
	const dm1 = dm0 +1;
	const dm2 = dm1 +1;

	const dm3 = dm2 +1;
	const dm4 = dm3 +1;
	const dm5 = dm4 +1;

	const dm6 = dm5 +1;
	const dm7 = dm6 +1;

	const SOUNDNUM = dm7 +1;

	var mLocalAudioBuffer= null;
	var	mAudioBuffer = null;
	var audioContext = null;	//Use Audio Interface

	var mReadFlag=0;
	var audioSource = null;

	var mKeylim = Array(SOUNDNUM);
	var mKeyTotal = 0;

	var mImg_pad = null;

function initdrum(){

	// Web Audio API
	audioContext = new AudioContext(); //Use Audio Interface

	// Sound Buffer
	mReadFlag=0;
	mLocalAudioBuffer= Array(SOUNDNUM);
	mAudioBuffer = Array(SOUNDNUM);

	for(var i=0; i<SOUNDNUM; i++){
		mLocalAudioBuffer[i]=new LocalAudioBuffer();
	}

	//Key Information
	for(var i=0; i<SOUNDNUM; i++){
		mKeylim[i]=new Array(3);
	}

	mKeylim[dm0 ] = [ bdrm,bdrm,bdrm ];
	mKeylim[dm1 ] = [ srnr,srnr,srnr ];
	mKeylim[dm2 ] = [ lftm,lftm,lftm ];
	mKeylim[dm3 ] = [ hftm,hftm,hftm ];
	mKeylim[dm4 ] = [ cdhh,cdhh,cdhh ];
	mKeylim[dm5 ] = [ pdhh,pdhh,pdhh ];
	mKeylim[dm6 ] = [ ophh,ophh,ophh ];
	mKeylim[dm7 ] = [ crsl,crsl,crsl ];

	mKeyTotal = mKeylim[dm7 ][2] - mKeylim[dm0 ][0]+1;
	audioSource = Array(mKeyTotal);
	for(var i=0; i<mKeyTotal; i++){
		audioSource[i]=null;
	}

	//Load Wave Files
	loadDogSound("freedrum/wav/kickbeateron1.wav"	,dm0 );
	loadDogSound("freedrum/wav/snare1.wav" 			,dm1 );
	loadDogSound("freedrum/wav/floortom1.wav" 		,dm2 );
	loadDogSound("freedrum/wav/tom1.wav" 			,dm3 );
	loadDogSound("freedrum/wav/hihatclose1.wav"		,dm4 );
	loadDogSound("freedrum/wav/hihatloose1.wav"		,dm5 );
	loadDogSound("freedrum/wav/hihat1.wav" 			,dm6 );
	loadDogSound("freedrum/wav/crash20inch1.wav"	,dm7 );


	//Load Image File
	mImg_pad =new Array(9);
	mPosx =new Array(8);
	mPosy =new Array(8);
	for(var i=0; i<9; i++) mImg_pad[i]= new Image();
	mImg_pad[0].src = "freedrum/png/pad_blueA.png";
	mImg_pad[1].src = "freedrum/png/pad_blueS.png";
	mImg_pad[2].src = "freedrum/png/pad_blueD.png";
	mImg_pad[3].src = "freedrum/png/pad_blueF.png";
	mImg_pad[4].src = "freedrum/png/pad_greenH.png";
	mImg_pad[5].src = "freedrum/png/pad_greenJ.png";
	mImg_pad[6].src = "freedrum/png/pad_greenK.png";
	mImg_pad[7].src = "freedrum/png/pad_greenL.png";
	mImg_pad[8].src = "freedrum/png/pad_orange.png";

	// Web MIDI API
	setInputMenuID(document.input_device_select.ids);
	setOutputMenuID(document.output_device_select.ids);
	runTest();
};

function loadDogSound(url, n) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

// Decode asynchronously
	request.onload = function() {
		audioContext.decodeAudioData(request.response, function(buffer) {
		mAudioBuffer[n]= buffer; 
		mLocalAudioBuffer[n].fSetBuffer(mAudioBuffer[n]);
		mReadFlag++;
		}, function(){ alert('Error'); } );
	}
	request.send();
}

function handleMIDIMessageGroundpiano( event )
{
	var str=null;
	var status, data1, data2;

	if( event.data[0] ==0xFE ) return;
	if( event.data[0] ==0xF8 ) return;

	status = event.data[0]&0xF0;
	data1  = event.data[1];
	data2  = event.data[2];

	if(status==0x90 && data2==0) status=0x80;

	switch( status ){
		case 0x80:
			mNoteoff(data1);
			break;
		case 0x90:
			mNoteon(data1);
			break;
		case 0xA0:
			break;
		case 0xB0:
			break;
		case 0xC0:
			break;
		case 0xD0:
			break;
		case 0xE0:
			break;
		case 0xF0:
			break;
	}

}

function mNoteoff( ckey )
{
	var dnum=0;

	switch( ckey ){
		case bdrm: dnum=4; break;
		case srnr: dnum=3; break;
		case lftm: dnum=5; break;
		case hftm: dnum=2; break;
		case cdhh: dnum=6; break;
		case pdhh: dnum=1; break;
		case ophh: dnum=7; break;
		case crsl: dnum=0; break;
	}

	fdg1.fDrawImageW(mImg_pad[dnum],mPosx[dnum],mPosy[dnum]);
	fdg1.fClearWindowInside();

}

function mNoteon( ckey )
{
	var cnum=0;
	var dnum=0;
	var jnum=ckey- mKeylim[dm0 ][0];

	if( jnum >= mKeyTotal ) return; 

	for(var i=0; i<SOUNDNUM; i++){
		if( ckey >= mKeylim[i][0] && ckey <= mKeylim[i][2] ) {
			cnum =i;
			break;
		}
	}

	switch( ckey ){
		case bdrm: dnum=4; break;
		case srnr: dnum=3; break;
		case lftm: dnum=5; break;
		case hftm: dnum=2; break;
		case cdhh: dnum=6; break;
		case pdhh: dnum=1; break;
		case ophh: dnum=7; break;
		case crsl: dnum=0; break;
	}

	fdg1.fDrawImageW(mImg_pad[8],mPosx[dnum],mPosy[dnum]);

	var computedPlaybackRate = Math.pow(2, (ckey-mKeylim[cnum][1])/12);

	audioSource[jnum] = audioContext.createBufferSource();	// creates a sound source
	audioSource[jnum].buffer = mAudioBuffer[cnum];			// tell the source which sound to play
	audioSource[jnum].connect(audioContext.destination);
	audioSource[jnum].playbackRate.value = computedPlaybackRate;
	audioSource[jnum].start(0);								// play the source now

	fdg1.fDrawLine(mLocalAudioBuffer[cnum].buffer);
}


function process(data){

	var procsize = data.inputBuffer.length;

	/* L-ch を描画する */
	var inbufL = data.inputBuffer.getChannelData(0);
	var inbufR = data.inputBuffer.getChannelData(1);
	var outbufL = data.outputBuffer.getChannelData(0);
	var outbufR = data.outputBuffer.getChannelData(1);

}
