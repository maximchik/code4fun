var count=begin=0; // Порядковый номер первого изображения
var icount=1000000000; // Кол-во изображений
var imageStep=6; // Шаг перебора изображений

var textGen=true; // Флаг включает генерацию текста
var speakFlag=true; // Флаг включения/выключения голоса. На клавиатуре - "v", или щелчек мышкой по правому изображению
var play=true; // Проигрывание/пауза. На клавиатуре - "пробел", или щелчек мышкой по левому изображению 

var tout=5; // Таймаут "беганья квадратика", чем меньше, тем быстрее
var tpout=60*60*1000; // Таймаут при проигрывании без генерации текста, чем меньше, тем быстрее
var	voiceRate = 0.7; // Скорость чтения 0.1 to 10
var	voicePitch = 0.2; // Высота голоса 0 to 2
var wt=ht=25; // Детализация второго изображение, чем больше, тем подробнее, больше текста и тормознее
var darkPoint=70;//96; // Точка черного для правого изображения. Чем больше, тем меньше подробностей и меньше текста
var delay=1; // 1 - "квадратик" притормаживает на светлых участках; 0 - нет 

var rgx=/[^а-яА-Я\-][а-яА-Я\-]{2,}?(ое)[^а-яА-Я\-]/gi;

var content="", inpr=false, spNow=false, text;
var im,im1,rk,xt,yt,sp,imgList=[],info,end;
var canvas = document.createElement("canvas");
var canvas1 = document.createElement("canvas");
canvas.width=canvas.height=512;
canvas1.width=canvas1.height=wt;
var sc=600/canvas1.height;
var Idata1=canvas1.getContext('2d').createImageData(canvas1.width, canvas1.height);
var img_u8 = new jsfeat.matrix_t(canvas.width, canvas.height, jsfeat.U8_t | jsfeat.C1_t);
var img_u8_1 = new jsfeat.matrix_t(canvas1.width, canvas1.height, jsfeat.U8_t | jsfeat.C1_t);
var data_u32 = new Uint32Array(Idata1.data.buffer);
var alpha = (0xff << 24);

function start() {
	im=document.getElementById("imsrc");
	im1=document.getElementById("imm");
	rk=document.getElementById("rk");
	info=document.getElementById("info");
//	readImgList("imglist.txt");
//	sunSearch();
 	readBook("book.txt");
}

function loadNext() {
	if (play) {
//		im.src="getpic.php?i="+count;//"jpg/"+imgList[count];
//		readImg("getpic.php?i="+count);

//		readImg("");

		readImg("getpic.php?i=10000000");
//		count+=imageStep;
//		if (count>=end) count=begin;
	}
}

function writeImInfo(inf) {
	var match=/(\d{4})_(\d{2})_(\d{2})__(\d{2})_(\d{2})/gi.exec(inf);
	info.innerHTML="<b style='font-weight:900; color:#333333'>"+match[3]+"-"+match[2]+"-"+match[1]+" "+match[4]+":"+match[5]+"</b> : : : ";
}

function iterate () {
	downSample();
	canvas1.getContext('2d').putImageData(Idata1, 0, 0);
	im1.src=canvas1.toDataURL("image/jpg");
	xt=yt=0;
	sp=false;
	document.getElementById("text").innerHTML="";
	text="";
	if (textGen) {
		inpr=true;
		document.getElementById("drw").setAttribute("visibility", "visible");
		setTimeout(textCalc,tout);
	} else setTimeout(loadNext,tpout);
}

function downSample() {
	canvas.getContext('2d').drawImage(im, 0, 0, canvas.width, canvas.height);
	var Idata=canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
	jsfeat.imgproc.grayscale(Idata.data, canvas.width, canvas.height, img_u8);
	jsfeat.imgproc.gaussian_blur(img_u8, img_u8, 30);
	jsfeat.imgproc.resample(img_u8, img_u8_1, canvas1.width, canvas1.height);
    var i = img_u8_1.cols*img_u8_1.rows, pix = 0;
    while(--i >= 0) {
        pix = Math.min(Math.round(Math.max(0,img_u8_1.data[i]-darkPoint)*2.5),255);
        data_u32[i] =  alpha | (pix << 16) | (pix << 8) | pix;
    }
}

function textCalc() {
	if (inpr) {
		var j=xt+yt*wt;
		var dta=Idata1.data[j*4];
		var ind=(j*256+dta)%content.length;
		var col=dta+60;
		rk.setAttributeNS(null, "x", xt*sc+4);
		rk.setAttributeNS(null, "y", yt*sc+4);
		rk.setAttributeNS(null, "fill", "rgb("+col+","+col+","+col+")");
		if (dta==0 && sp) {
			sp=false;
			text+=" солнце,";
			document.getElementById("text").innerHTML+=" солнце.<br>";
			info.innerHTML+="0 ";
		} else if (dta) {
			text+=(sp?" ":"")+content[ind]+(Math.random()>0.6?",":"");
			document.getElementById("text").innerHTML+=(sp?" ":"")+content[ind];
			sp=true;
			info.innerHTML+=""+dta+" ";
		}
		if (xt<wt-1) {
			xt++;
			if (textGen) setTimeout(textCalc,tout+delay*(dta>60?(dta+100):0));
		} else {
			xt=0;
			yt++;
			if (yt<ht) {
				if (textGen) setTimeout(textCalc,tout+delay*(dta>60?(dta+100):0))
			} else {
				inpr=false;
				if (speakFlag) speak(text);
				else setTimeout(loadNext,tpout);
			}		
		}
	}
}

function readImgList(file) {
    var textfile;
    if (window.XMLHttpRequest) textfile = new XMLHttpRequest();
    textfile.onreadystatechange = function () {      
    if (textfile.readyState == 4 ) { //&& textfile.status == 200
 			imgList=textfile.responseText.split('\n');
 			end=Math.min(imgList.length,begin+icount);
 			readBook("book.txt");
 		}
    }
    textfile.open("GET", file, true);
    textfile.send();
}

function readImg(file) {
    var imf;
    if (window.XMLHttpRequest) imf = new XMLHttpRequest();
    imf.onreadystatechange = function () {      
    if (imf.readyState == 4 ) { //&& textfile.status == 200
 			im.src=URL.createObjectURL(imf.response);
// 			writeImInfo(imf.getResponseHeader("Content-Location"));
 		}
    }
    imf.open("GET", file, true);
	imf.responseType = "blob";
    imf.send();
}

function sunSearch() {

    var file="getsr.php";
    var rg=/<h3 class="r"><a href=..url.q=(.+?)\&amp/gi;

    var textfile;
    if (window.XMLHttpRequest) textfile = new XMLHttpRequest();
    textfile.onreadystatechange = function () {   
        if (textfile.readyState == 4) { // && textfile.status == 200
//        	console.log(textfile.responseText);
        	while (content=rg.exec(textfile.responseText)) {
        		console.log(content[1]);
			}
        }
    }
    textfile.open("GET", file, true);
    textfile.send();

}


function readBook(file) {
    var textfile;
    if (window.XMLHttpRequest) textfile = new XMLHttpRequest();
    textfile.onreadystatechange = function () {   
        if (textfile.readyState == 4) { // && textfile.status == 200
            content = textfile.responseText.match(rgx);
			for (var u=0; u<content.length;u++)
				content[u]=content[u].toLowerCase().replace(/[^а-яА-Я\-\d\s]/gi,"").trim();
			if (play) loadNext(); 
        }
    }
    textfile.open("GET", file, true);
    textfile.send();
}

function kpress(event) {
   var chCode = ('charCode' in event) ? event.charCode : event.keyCode;
   if (chCode==32) pause();
   if (chCode=="v".charCodeAt(0)) voiceOnOff();
   if (chCode=="t".charCodeAt(0)) textOnOff();
   return false;
}

function pause() {
   	play=!play;
	document.getElementById("pause").innerHTML=(!play)?" PAUSED ":"";
	if (play && !inpr && !spNow) {
		console.log("pausee-play");
		loadNext();
	}
}

function textOnOff () {
   	textGen=!textGen;
   	if (!textGen) {
		inpr=false;
		speechSynthesis.cancel();
		spNow=false;
		document.getElementById("text").innerHTML="";
		loadNext();
		document.getElementById("drw").setAttribute("visibility", "hidden");
	}
}

function voiceOnOff () {
	if (speakFlag) {
		speechSynthesis.cancel();
		spNow=false;
	}
	document.getElementById("voice").innerHTML=speakFlag?"":" VOICE ON ";
   	if (!speakFlag && !inpr) speak(document.getElementById("text").innerHTML.replace(/<br>/gi,""));
   	speakFlag=!speakFlag;	
}

function speak(txt){
	var msg = new SpeechSynthesisUtterance();
	var voices = window.speechSynthesis.getVoices();
	msg.voice = voices[1];
	msg.voiceURI = 'native';
	msg.volume = 1; // 0 to 1
	msg.rate = voiceRate;
	msg.pitch = voicePitch;
	msg.text = txt;
	msg.lang = 'ru';
	msg.onend = function(e) {
		spNow=false;
		if (play) setTimeout(loadNext,tpout);
		console.log('Finished in ' + event.elapsedTime + ' seconds.');
	};
	spNow=true;
	speechSynthesis.speak(msg);
}
