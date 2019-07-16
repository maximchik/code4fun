<?php
header('Content-type: image/jpeg');
//readfile("http://sohowww.nascom.nasa.gov/data/realtime/eit_171/1024/latest.html");
//$im= file_get_contents("http://sohowww.nascom.nasa.gov/data/realtime/eit_171/1024/latest.jpg");
//echo $im;

$ok=false;
$tz=date_default_timezone_get();
for ($d=0;$d<3 && !$ok;$d++) {
	date_default_timezone_set("GMT");
	$page="http://proba2.oma.be/swap/data/qlk/".date('Y/m/d/',mktime(0, 0, 0, date("m")  , date("d")-$d, date("Y")));
	date_default_timezone_set($tz);
	$cont=@file_get_contents($page, false);
	//echo "---".$page."<br>";
	if (preg_match_all('@href="(.+?jp2)"@iu',$cont,$files, PREG_PATTERN_ORDER)) {
		$ind=($_GET["i"]>count($files[1]))?count($files[1])-1:$_GET["i"];
		$img = $_SERVER['DOCUMENT_ROOT']."/sun/".date_timestamp_get(date_create()).'.jp2';
//		echo "+++".$page.$files[1][$ind];
		file_put_contents($img, file_get_contents($page.$files[1][$ind],false));
		$image = new Imagick($img);
		unlink($img);
		$image->setImageFormat('jpg');
		header('Content-Location: '.$files[1][$ind]);
		echo $image;
		//echo $page.$files[1][$ind];
		$ok=true;
	}
}

/*$files=scandir("pics");
if (count($files)>2) {
	$image = new Imagick("pics/".(($_GET["i"]+2)>count($files)?$files[count($files)-1]:$files[$_GET["i"]+2]));
	$image->setImageFormat('jpg');
	echo $image;	
}*/

/*
$files=scandir("jpg");

if (count($files)>3) {
	$fl=(($_GET["i"]+3)>count($files)?$files[count($files)-1]:$files[$_GET["i"]+3]);
    $img = imagecreatefromjpeg("jpg/".$fl);
	header('Content-Location: '.$fl);
	imagejpeg($img);
	imagedestroy($img);
} */
