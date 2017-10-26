const mTrack 	=8;			//トラックの数
const mBeat		=16;		//Beatの数
var canvas	= null;
var ctx		= null;
var log		= null;

var ixb		=10;			//シーケンスのマークの四角の左上のＸの場所
var iyb		=20;			//シーケンスのマークの四角の左上のＹの場所
var iyt		=10;			//シーケンスの四角の高さ

var ixo		=40;			//四角の左上のＸの場所
var iyo		=40;			//四角の左上のＸの場所
var ixa		=30;			//一つの四角のＸの長さ
var iya		=40;			//一つの四角のＹの長さ

var toggle  =new Array(mTrack);		//toggle[mTrack][mBeat]

var timerId	=null;
var ipn		=0;				//Beatの番号
var tempo	=120;			//テンポの初期値 120
var beatx	=125;			//16分音符の長さ　ms
var tone	=new Array();	//各トラックのドラムのノート番号
var dvol	=[ 127,127,127,127,127,127,127,127 ];	//ドラムの音量
var mCh		=0;				//Channel Number

var mNumtxt =["1-", "2-", "3-", "4-", "5-", "6-", "7-", "8-"];

window.addEventListener('load', function (){

	var i, j, ix, iy;
	canvas	= document.getElementById('step_seq');
	ctx		= canvas.getContext('2d');
	var clientWidth=canvas.clientWidth;

	ixa=clientWidth/18;

	log = document.getElementById("log");

	ctx.font = "11pt Arial";

	for(i=0; i<mTrack; i++)
		toggle[i]=new Array(mBeat);

	ctx.fillStyle	= '#DDDDDD';
	for(i=0; i<mTrack; i++)
		ctx.fillText(mNumtxt[i], ixo-30, iyo+15+iya*i);

	for(i=0,ix=ixo; i<mBeat; i++){
		ctx.fillRect(ix, iyb, ixa-2, iyt-2);
		ix+=ixa;
	}

	//toggle[mTrack][mBeat]
	for(j=0,iy=iyo; j<mTrack; j++){
		for(i=0,ix=ixo; i<mBeat; i++){
			ctx.fillRect(ix, iy, ixa-2, iya-2);
			ix+=ixa;
			toggle[j][i] = false;
		}
		iy+=iya;
	}

	tone[0]=48;		//初期値　Bass Drum
	tone[1]=52;		//初期値　low Floor Tom
	tone[2]=53;		//初期値　High Floor Tom
	tone[3]=55;		//初期値　Closed Hi-Hat

	initdrum();		/* ドラムの初期化 */

	seq_play();		/* シーケンサープ再生スタート */

	button(ixo, iyo, ixa*mBeat, iya*mTrack);


});

/* -------------------------------------------------------------------------- */
function button(x, y, width, height){
//	ctx.rect(x, y, width, height);
	var ipx,ipy,ip;

	ctx.stroke();

	canvas.addEventListener('click', function(e){
		var button = e.target.getBoundingClientRect();
		mouseX = e.clientX - button.left;
		mouseY = e.clientY - button.top;
		ipx = Math.floor((mouseY - iyo)/iya);	//Track
		ipy = Math.floor((mouseX - ixo)/ixa);	//Beat

/*		log.innerText +="ipx=";
		log.innerText += ipx;
		log.innerText +=" ipy=";
		log.innerText += ipy;
		log.innerText +="\n";
*/

		//toggle[mTrack][mBeat], ipx=>Track, ipy=>Beat
		if(x < mouseX && mouseX < x + width){
			if(y < mouseY && mouseY < y + height){
				if(toggle[ipx][ipy]==false){
					draw1(ipx,ipy);
					toggle[ipx][ipy] = true;
				}else{
					clear(ipx,ipy);
					toggle[ipx][ipy] = false;
				}
			}
		}
	}, false);
}

/* -------------------------------------------------------------------------- */
/* シーケンス再生 */
function seq_play()
{
	var jpn;	//Beat

	timerId=setInterval(function(){
		ctx.fillStyle = "#DDDDDD";
		ctx.fillRect(ixo+ipn*ixa+1, iyb+1, ixa-2, iyt-1);

		jpn=ipn-1;
		if(jpn<0) jpn=15;

		//toggle[mTrack][mBeat]
/*		if(toggle[0][jpn]==true) outMessage(0x90|mCh,tone[0],0);
		if(toggle[1][jpn]==true) outMessage(0x90|mCh,tone[1],0);
		if(toggle[2][jpn]==true) outMessage(0x90|mCh,tone[2],0);
		if(toggle[3][jpn]==true) outMessage(0x90|mCh,tone[3],0);
		if(toggle[4][jpn]==true) outMessage(0x90|mCh,tone[4],0);
		if(toggle[5][jpn]==true) outMessage(0x90|mCh,tone[5],0);
		if(toggle[6][jpn]==true) outMessage(0x90|mCh,tone[6],0);
		if(toggle[7][jpn]==true) outMessage(0x90|mCh,tone[7],0);
*/
		if(toggle[0][ipn]==true) mNoteon(bdrm);
		if(toggle[1][ipn]==true) mNoteon(srnr);
		if(toggle[2][ipn]==true) mNoteon(lftm);
		if(toggle[3][ipn]==true) mNoteon(hftm);
		if(toggle[4][ipn]==true) mNoteon(cdhh);
		if(toggle[5][ipn]==true) mNoteon(pdhh);
		if(toggle[6][ipn]==true) mNoteon(ophh);
		if(toggle[7][ipn]==true) mNoteon(crsl);

		ipn++;
		if(ipn>=16) ipn=0;

		ctx.fillStyle = "#222222";
		ctx.fillRect(ixo+ipn*ixa+1, iyb+1, ixa-2, iyt-1);

	}, beatx);

}

/* -------------------------------------------------------------------------- */
/* 全部消す */
function clear_all()
{
	var i,j;
	for(j=0; j<mTrack; j++){
		for(i=0; i<mBeat; i++){
			toggle[j][i]=true;
			clear(j,i);
		}
	}
}

/* -------------------------------------------------------------------------- */

function changeTempo(item)
{
	tempo = item.value;
	beatx = Math.floor(60000/tempo/4);

	if(timerId!=null)  clearInterval(timerId);
	timerId=null;

	seq_play();	/* シーケンサープ再生スタート */
}

/* -------------------------------------------------------------------------- */

function drumChange(parts,n)
{
	tone[n]=parts.selectedIndex+35;
}

function noteChange(item,n)
{
	tone[n]=item.value;
s}

function changeVolume(item,n)
{
	dvol[n]=item.value;
}

/* -------------------------------------------------------------------------- */
/* Sequence Start & Stop */
function seq_stop()
{
	if(timerId!=null) clearInterval(timerId);
	timerId=null;
	outMessage(0xB0,0x78,0x00);		//All Sound Off
}

function seq_restart()
{

	if(timerId!=null)  clearInterval(timerId);
	timerId=null;

	ctx.fillStyle = "#DDDDDD";
//	ctx.clearRect(ixo+ipn*ixa+1, iyb+1, ixa-2, iyt-1);
	ctx.fillRect(ixo+ipn*ixa+1, iyb+1, ixa-2, iyt-1);
	ipn=15;

	seq_play();	/* シーケンサープ再生スタート */

}

/* -------------------------------------------------------------------------- */
/* 基本図形の描画 */
//itk=>Track, ibt=>Beat
function clear(jtk,jbt){
	ctx.fillStyle = "#DDDDDD";
//	ctx.fillRect(ixo+ipn*ixa+1, iyb+1, ixa-2, iyt-1);
	ctx.fillRect(ixo+jbt*ixa+1, iyo+jtk*iya+1, ixa-2, iya-2);
}

function draw(){
	ctx.rect(20, 20, 200, 200);
	ctx.stroke();
}

/* 円を描く */
//itk=>Track, ibt=>Beat
function draw1(jtk,jbt) {
  ctx.beginPath();
  ctx.arc(ixo+jbt*ixa+ixa/2, iyo+jtk*iya+iya/2, ixa/4, 0, Math.PI*2, false);
  ctx.stroke();
}

/* -------------------------------------------------------------------------- */
var mPch=0;
var mPMsb=0;
var mPLsb=0;

function programchange()
{
	outMessage(0xB0|mCh,0x00,mPMsb);
	outMessage(0xB0|mCh,0x20,mPLsb);
	outMessage2(0xC0|mCh,mPch);
}

function all_sound_off()
{

	for(var ich=0; ich<0x10; ich++){
		outMessage(0xB0|ich,0x78,00);
	}
}

