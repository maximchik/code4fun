var count=begin=0,icount=1E9,imageStep=6,textGen=!0,speakFlag=!0,play=!0,tout=5,tpout=36E5,voiceRate=.7,voicePitch=.2,wt=ht=25,darkPoint=70,delay=1,rgx=/[^\u0430-\u044f\u0410-\u042f\-][\u0430-\u044f\u0410-\u042f\-]{2,}?(\u043e\u0435)[^\u0430-\u044f\u0410-\u042f\-]/gi,content="",inpr=!1,spNow=!1,text,im,im1,rk,xt,yt,sp,imgList=[],info,end,canvas=document.createElement("canvas"),canvas1=document.createElement("canvas");canvas.width=canvas.height=512;canvas1.width=canvas1.height=wt;
var sc=600/canvas1.height,Idata1=canvas1.getContext("2d").createImageData(canvas1.width,canvas1.height),img_u8=new jsfeat.matrix_t(canvas.width,canvas.height,jsfeat.U8_t|jsfeat.C1_t),img_u8_1=new jsfeat.matrix_t(canvas1.width,canvas1.height,jsfeat.U8_t|jsfeat.C1_t),data_u32=new Uint32Array(Idata1.data.buffer),alpha=-16777216;
function start(){im=document.getElementById("imsrc");im1=document.getElementById("imm");rk=document.getElementById("rk");info=document.getElementById("info");readBook("book.txt")}function loadNext(){play&&readImg("getpic.php?i=1000000")}function writeImInfo(b){b=/(\d{4})_(\d{2})_(\d{2})__(\d{2})_(\d{2})/gi.exec(b);info.innerHTML="<b style='font-weight:900; color:#333333'>"+b[3]+"-"+b[2]+"-"+b[1]+" "+b[4]+":"+b[5]+"</b> : : : "}
function iterate(){downSample();canvas1.getContext("2d").putImageData(Idata1,0,0);im1.src=canvas1.toDataURL("image/jpg");xt=yt=0;sp=!1;text=document.getElementById("text").innerHTML="";textGen?(inpr=!0,document.getElementById("drw").setAttribute("visibility","visible"),setTimeout(textCalc,tout)):setTimeout(loadNext,tpout)}
function downSample(){canvas.getContext("2d").drawImage(im,0,0,canvas.width,canvas.height);var b=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);jsfeat.imgproc.grayscale(b.data,canvas.width,canvas.height,img_u8);jsfeat.imgproc.gaussian_blur(img_u8,img_u8,30);jsfeat.imgproc.resample(img_u8,img_u8_1,canvas1.width,canvas1.height);for(var b=img_u8_1.cols*img_u8_1.rows,a=0;0<=--b;)a=Math.min(Math.round(2.5*Math.max(0,img_u8_1.data[b]-darkPoint)),255),data_u32[b]=alpha|a<<16|a<<8|a}
function textCalc(){if(inpr){var b=xt+yt*wt,a=Idata1.data[4*b],b=(256*b+a)%content.length,c=a+60;rk.setAttributeNS(null,"x",xt*sc+4);rk.setAttributeNS(null,"y",yt*sc+4);rk.setAttributeNS(null,"fill","rgb("+c+","+c+","+c+")");0==a&&sp?(sp=!1,text+=" \u0441\u043e\u043b\u043d\u0446\u0435,",document.getElementById("text").innerHTML+=" \u0441\u043e\u043b\u043d\u0446\u0435.<br>",info.innerHTML+="0 "):a&&(text+=(sp?" ":"")+content[b]+(.6<Math.random()?",":""),document.getElementById("text").innerHTML+=(sp?
" ":"")+content[b],sp=!0,info.innerHTML+=""+a+" ");xt<wt-1?(xt++,textGen&&setTimeout(textCalc,tout+delay*(60<a?a+100:0))):(xt=0,yt++,yt<ht?textGen&&setTimeout(textCalc,tout+delay*(60<a?a+100:0)):(inpr=!1,speakFlag?speak(text):setTimeout(loadNext,tpout)))}}
function readImgList(b){var a;window.XMLHttpRequest&&(a=new XMLHttpRequest);a.onreadystatechange=function(){4==a.readyState&&(imgList=a.responseText.split("\n"),end=Math.min(imgList.length,begin+icount),readBook("book.txt"))};a.open("GET",b,!0);a.send()}function readImg(b){var a;window.XMLHttpRequest&&(a=new XMLHttpRequest);a.onreadystatechange=function(){4==a.readyState&&(im.src=URL.createObjectURL(a.response))};a.open("GET",b,!0);a.responseType="blob";a.send()}
function sunSearch(){var b=/<h3 class="r"><a href=..url.q=(.+?)\&amp/gi,a;window.XMLHttpRequest&&(a=new XMLHttpRequest);a.onreadystatechange=function(){if(4==a.readyState)for(;content=b.exec(a.responseText);)console.log(content[1])};a.open("GET","getsr.php",!0);a.send()}
function readBook(b){var a;window.XMLHttpRequest&&(a=new XMLHttpRequest);a.onreadystatechange=function(){if(4==a.readyState){content=a.responseText.match(rgx);for(var b=0;b<content.length;b++)content[b]=content[b].toLowerCase().replace(/[^\u0430-\u044f\u0410-\u042f\-\d\s]/gi,"").trim();play&&loadNext()}};a.open("GET",b,!0);a.send()}function kpress(b){b="charCode"in b?b.charCode:b.keyCode;32==b&&pause();118==b&&voiceOnOff();116==b&&textOnOff();return!1}
function pause(){play=!play;document.getElementById("pause").innerHTML=play?"":" PAUSED ";!play||inpr||spNow||(console.log("pausee-play"),loadNext())}function textOnOff(){textGen=!textGen;textGen||(inpr=!1,speechSynthesis.cancel(),spNow=!1,document.getElementById("text").innerHTML="",loadNext(),document.getElementById("drw").setAttribute("visibility","hidden"))}
function voiceOnOff(){speakFlag&&(speechSynthesis.cancel(),spNow=!1);document.getElementById("voice").innerHTML=speakFlag?"":" VOICE ON ";speakFlag||inpr||speak(document.getElementById("text").innerHTML.replace(/<br>/gi,""));speakFlag=!speakFlag}
function speak(b){var a=new SpeechSynthesisUtterance,c=window.speechSynthesis.getVoices();a.voice=c[1];a.voiceURI="native";a.volume=1;a.rate=voiceRate;a.pitch=voicePitch;a.text=b;a.lang="ru";a.onend=function(a){spNow=!1;play&&setTimeout(loadNext,tpout);console.log("Finished in "+event.elapsedTime+" seconds.")};spNow=!0;speechSynthesis.speak(a)};