<?php
$tp=1;
if (isset($_GET["lg"]))
	if ($_GET["lg"]=="ru" || $_GET["lg"]==1) $tp=1;
if (isset($_GET["lg"]))
	if ($_GET["lg"]=="en" || $_GET["lg"]==0) $tp=0;

$title=["Online text to music converter",
"Онлайн генератор музыки из текста"];
$desc=["Type or copy any text into the Text Field and click play button... enjoy.",
"Напишите или скопируйте текст в поле ввода и нажмите кнопку 'играть'... наслаждайтесь.<br>Вы можете дописывать текст во время воспроизведения музыки."];
$playBut=["PLAY", "STOP", "ИГРАТЬ", "ОСТАНОВИТЬ"];
$clearBut=["Clear", "Очистить"];
$ex=["Text examples:","Примеры текстов (нажмите, чтобы вставить выбранный текст):"];
$alfavit=["xwchfkpst".
          "yuoiae".
          "bdgjlmnrqvz",
          "ъбвгджзйлмнр".
          "кпстфхцчшщь".
          "аеёиоуыэюя",];
$glas=["aeiouy","аеёиоуыэюя"]; 
$nlang=["english","русский"];
$sh=[7,0];
$key="";

$handle = fopen("texts_".($tp?"ru":"en").".txt", "r");
while (!feof($handle)) {
    $buffer = fgets($handle, 4096);
    if (($k=iconv_strpos($buffer,"title=",0,'UTF-8')) !== FALSE) {
    	$key=iconv_substr($buffer,$k+iconv_strlen("title="),4096,'UTF-8');
    	$texts[$key]="";
    } elseif ($key) $texts[$key].=str_replace(array("\r\n", "\r", "\n"), "\\n",$buffer);
}
fclose($handle);

?>
<html>
<title><?= $title[$tp]?></title>
<style type="text/css">
   #play.play { 
   	width: 100px;
	-webkit-border-radius: 3px;
	border-radius: 3px;
    background:#ccc;
    font-weight: 600;
   }
   #play.stop { 
   	width: 100px;
	-webkit-border-radius: 3px;
	border-radius: 3px;
    background:#f63;
    font-weight: 600;
   }
	h1 {
		font-family: Tahoma, Arial, San Serif;
		font-size: 24px;
		color: #333;
	}
	body, p.desc {
		font-family: Tahoma, Arial, San Serif;
		font-size: 14px;
		color: #555;
	}
	#lng {
		font-family: Tahoma, Arial, San Serif;
		font-size: 14px;
		color: #69f;		
	}
	#text {
		width: 500px;
	}
	
	.txlink {
		    list-style: square inside;
    		padding: 0 0 0 0;
    		margin: 0 0 0 0;
	}
	a {
		color: #69f;
	}
</style>
<script>
var context = window.AudioContext ? new AudioContext() : new webkitAudioContext();
var notes=new Array(),
	tm=0, unotes=0, y=0, playing=false,
	intervalID,
	str="",strold="", lastNote=0,
	speed=120, ticks=30,
	shift=<?= $sh[$tp]?>;

	var texts=[<?
$i=0;
foreach ($texts as $value) {
	echo(($i++?",\r\n ":"")."\"".$value."\"");
}


?>];



/* var alfavit="ъбвгджзйлмнр"+
                 "аеёиоуыэюя"+
                 "кпстфхцчшщь"; */
             
var alfavit="<?= $alfavit[$tp]?>",
	glas="<?= $glas[$tp]?>",
	prep=";.?!\n";


function playNote(note, vol, period, type, df) {
	var controctave = [ 32.70, 36.95, 41.21, 43.65, 48.999, 55, 61.735],
		osc = context.createOscillator(),
		gainNode = context.createGain(),
		lp=ticks/speed;

	osc.frequency.value=controctave[note%7]*Math.pow(2, Math.floor(note/7) - 1)*(1+df/100);
    vol=(vol-osc.frequency.value/7000>0)?(vol-osc.frequency.value/7000):0.00001;
    vol=vol*0.3;
	osc.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.value = 0.0;
    switch (type) {
    	case 0:
			osc.type = "sine";
		    gainNode.gain.setTargetAtTime(vol*1,context.currentTime,0.02*lp);
		    gainNode.gain.setTargetAtTime(vol*0.3,context.currentTime+0.05*lp,0.1*lp);
		    gainNode.gain.setTargetAtTime(vol*0,context.currentTime+0.3*lp*period,0.3*lp*period);
		    break;
    	case 1:
			osc.type = "sine";
		    gainNode.gain.setTargetAtTime(vol*1,context.currentTime,0.02*lp);
		    gainNode.gain.setTargetAtTime(vol*0.8,context.currentTime+0.05*lp,0.05*lp);
		    gainNode.gain.setTargetAtTime(vol*0,context.currentTime+0.3*lp*period,0.3*lp*period);
		    break;
	}

	osc.start(0);
	setTimeout(function() {
	    osc.stop(0);
	    osc.disconnect(gainNode);
	}, lp*(period+1)*1000);
}

function addNote (order, note, vol, period, type, df) {
	notes.push([order, note, vol, period, type, df]);
}

function play(element, index, array) {
	if (element[0]*ticks<tm && element[0]*ticks>=tm-1) {
		playNote(element[1],element[2],element[3],element[4],element[5]);
		++unotes;
	}
	if (unotes>=notes.length) clearInterval(intervalID);
}

function stopMusic() {
	clearInterval(intervalID);
	playing=false;
	document.getElementById('play').value="<?= $playBut[$tp*2]?>";
	document.getElementById('play').setAttribute('class', 'play');
	document.getElementById('text').focus();
}

function playMusic(cont) {
  	var i, j, k, n, vol=0;
  	str=this.document.getElementById("text").value.toLowerCase();
	document.getElementById('text').focus();  	
  	
  	if (!cont) {
	  	tm=0;
		unotes=0;
		notes=[];
		lastNote=0;
		playing=false;
		strold="";
		y=0;
	}
  	if (cont && (str.length<=strold.length && lastNote==0)) return;
  	i=lastNote;
 	for (k=strold.length; k<str.length; k++) {
	    n=alfavit.indexOf(str.charAt(k));
	    if (n>=0) {
	    	vl=(1+vol*0.008);
			if (glas.indexOf(str.charAt(k))>=0) {
				j=n+3+shift;
				addNote(i,j+7,0.7/vl,4,0,0);
				if (y==0) {
					addNote(i,j+2*7,0.7/vl,8,0,0.2);
					addNote(i,j+5+1*7,0.7/vl,8,0,-0.1);
				}   
				y++;
			} else {
				j=n+2+3+shift;
				addNote(i,j+2*7,0.5/vl,4,1,0);
			}
			if (i%2==1) {
				j=n+3+shift;
				addNote(i,j+1*7,0.2/vl,4,1,0.2);
				addNote(i,j+5+1*7,0.2/vl,4,1,-0.1);        
			}
			i++;
	    } else {
	    	vol++;
	      	if (prep.indexOf(str.charAt(k))>0) {
	      		i++;
	      		vol=0;
	      	}
	      	y=0;
	    }
	}
	if (lastNote<i) {
		lastNote=i;
		strold=str;
		playing=true;
		document.getElementById('play').value="<?= $playBut[$tp*2+1]?>";
		document.getElementById('play').setAttribute('class', 'stop');
		if (intervalID) clearInterval(intervalID);
		intervalID = setInterval(function () {
			tm++;
			notes.forEach(play);
		}, 1000/speed);
	}
}

</script>
	<body>
		<table width="900"><tr valign=top><td align=left width="500"><h1><?= $title[$tp]?></h1></td>
		<td align=right width="400"><a id=lng href=".<?= $tp?"?lg=0":"?lg=1" ?>"><?= $nlang[1-$tp]?></a></td></tr>
		<tr><td><textarea id="text" cols=70 rows=20 onKeyup="javascript: if (playing) playMusic(true);">
<?= str_replace("\\n", "\n",$texts[array_keys($texts)[0]])?>
		</textarea><br>
		<input id="play" class="play" type=button value="<?= $playBut[$tp*2]?>" onClick="javascript: if (playing) stopMusic(); else playMusic(false);"> 
		<input type=button value="<?= $clearBut[$tp]?>" onClick="javascript: stopMusic();document.getElementById('text').value='';"><br>
</td><td valign=top align=left>
<p><?= $ex[$tp]?></p>
<ul class=txlink>
<?
$i=0;
foreach ($texts as $key => $value) {
	echo("<li><a href='#' onClick=\"javascript: stopMusic(); document.getElementById('text').value=texts[".($i++)."]\">".$key."</a>\n");
}
?>
</ul>
</td></tr>
		<tr><td colspan=2><p class="desc"><sup><b>*</b></sup> <?= $desc[$tp]?></td></tr>
</table>

<br>
<br>
<br>
<!--LiveInternet counter--><script type="text/javascript"><!--
document.write("<a href='http://www.liveinternet.ru/click' "+
"target=_blank><img src='//counter.yadro.ru/hit?t44.6;r"+
escape(document.referrer)+((typeof(screen)=="undefined")?"":
";s"+screen.width+"*"+screen.height+"*"+(screen.colorDepth?
screen.colorDepth:screen.pixelDepth))+";u"+escape(document.URL)+
";"+Math.random()+
"' alt='' title='LiveInternet' "+
"border='0' width='10' height='10'><\/a>")
//--></script><!--/LiveInternet-->

	</body>
</html>