
// Settings
var repeat = localStorage.repeat || 0,
	continous = true;

var time = new Date();
var	trigger = false,
	audio, timeout, playCounts;

$(".cover").css("height",$("#player").height()-20 );
$(".cover").css("width",$("#player").height()-20 );
$(".ctrl").css("margin-left",$("#player").height()+2 );

var play = function(){
	audio.play();
	$('.playback').addClass('playing');
	timeout = setInterval(updateProgress, 500);
}

var pause = function(){
	audio.pause();
	$('.playback').removeClass('playing');
	clearInterval(updateProgress);
}

// Update progress
var setProgress = function(value){
	var currentSec = parseInt(value%60) < 10 ? '0' + parseInt(value%60) : parseInt(value%60),
		ratio = value / audio.duration * 100;

	$('.timer').html(parseInt(value/60)+':'+currentSec);
	$('.player_progress .pace').css('width', ratio + '%');
	$('.player_progress .slider a').css('left', ratio + '%');
}

var updateProgress = function(){
	setProgress(audio.currentTime);
}

// Progress slider
$('.player_progress .slider').slider({step: 0.1, slide: function(event, ui){
	$(this).addClass('enable');
	var value = audio.duration * ui.value / 100;
	setProgress(value);
	//audio.currentTime = value;
	clearInterval(timeout);
}, stop: function(event, ui){
	audio.currentTime = audio.duration * ui.value / 100;
	setAudioOneCurrentTime(audio.currentTime);
	$(this).removeClass('enable');
	timeout = setInterval(updateProgress, 500);
}});


// Volume slider
var setVolume = function(value){
	//audio.volume = localStorage.volume = value;
	audioOne.volume = defultValmue = localStorage.volume = value;
	$('.volume .pace').css('width', value * 100 + '%');
	$('.volume .slider a').css('left', value * 100 + '%');
}

var volume = localStorage.volume || 0.5;
$('.volume .slider').slider({max: 1, min: 0, step: 0.01, value: volume, slide: function(event, ui){
	setVolume(ui.value);
	$(this).addClass('enable');
	$('.mute').removeClass('enable');
}, stop: function(){
	$(this).removeClass('enable');
}}).children('.pace').css('width', volume * 100 + '%');

$('.mute').click(function(){
	if ($(this).hasClass('enable')){
		setVolume($(this).data('volume'));
		$(this).removeClass('enable');
	} else {
		$(this).data('volume', audioOne.volume).addClass('enable');
		setVolume(0);
	}
});

function randomNum(maxNum,num){ 
	var tempNum = -1;
    tempNum = Math.floor(Math.random() * maxNum);
	if(tempNum == -1 || tempNum == num){
		randomNum(maxNum,num);
	}
	return tempNum;
} 

var switchTrack = function(num){
	$('audio').remove();

	var beforeId = $("#player").attr("data-id");
	if (repeat == 1){
		isPlaySongId = localStorage.isPlaySongId = beforeId;
	}else{
		if(songLists.length > 0){
			for(var i in songLists){
				if(songLists[i] == beforeId){
					//repeat 0 顺序播放 1 单曲循环 2 循环播放 3 随机播放
					//num -1 上一首 1 下一首
					if(repeat == 3){
						var random = randomNum(songLists.length,i);
						isPlaySongId = localStorage.isPlaySongId = songLists[random];
					}else if(num == "-1"){
						if(i == 0 && repeat == 0){
							alert_info("已是第一首！");
						}else if(i == 0 && repeat == 2){
							isPlaySongId = localStorage.isPlaySongId = songLists[songLists.length - 1];
						}else{
							isPlaySongId = localStorage.isPlaySongId = songLists[--i];
						}
					}else if(num == "1"){
						if(i == (songLists.length - 1) && repeat == 0){
							alert_info("已播放结束，歌单为空！");
						}else if(i == (songLists.length - 1) && repeat == 2){
							isPlaySongId = localStorage.isPlaySongId = songLists[0];
						}else{
							isPlaySongId = localStorage.isPlaySongId = songLists[++i];
						}
					}
				}else{
					isPlaySongId = localStorage.isPlaySongId = songLists[0];
				}
			}
		}else{
			alert_info("已播放结束，歌单为空！");
		}
	}
	//重新初始化播放列表
	$("#songListsUl li").removeClass("playing");
   	$("#songListsUl li i").removeClass("fa-music");

	$("#songListsUl li").each(function () { 
		if($(this).attr("data-id") == isPlaySongId){
			$(this).addClass("playing");
        	$(this).find("i").addClass("fa-music");
		}
	});
    
	if(isPlaySongId != "" && isPlaySongId != "undefined"){
		autoplay = true;
		loadPlayer(isPlaySongId);
	}
}


var ended = function(){
	pause();
	audio.currentTime = 0;
	
	switchTrack("1");
}

var beforeLoad = function(){
	var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
	$('.player_progress .loaded').css('width', (100 / (this.duration || 1) * endVal) +'%');
}

var afterLoad = function(){
	/*if (autoplay == true) play();
	userStart();*/
}

var loadMusic = function(src,imgsrc,name,artist,ablum){
	var newaudio = $('<audio>').html('<source src="'+src+'">').appendTo('#player');
	
	$('.cover').html('<img src="'+imgsrc+'" alt="">');
	$('.tag').html('<strong>'+name+'</strong><span class="artist">'+artist+'</span><span class="album">'+ablum+'</span>');
	audio = newaudio[0];
	audio.crossOrigin="anonymous";
	audio.volume = 0.0;
	audio.addEventListener('player_progress', beforeLoad, false);
	audio.addEventListener('durationchange', beforeLoad, false);
	audio.addEventListener('canplay', afterLoad, false);
	audio.addEventListener('ended', ended, false);

}

//播放控制
$('.playback').on('click', function(){
	userStart();
	if ($(this).hasClass('playing')){
		pause();
	} else {
		play();
	}
});

//上一首
$('.rewind').on('click', function(){
	switchTrack("-1");
});
//下一首
$('.fastforward').on('click', function(){
	switchTrack("1");
});

if (repeat == 1){
	$('.repeat').addClass('once').attr("title","单曲循环");
}else if (repeat == 2){
	$('.repeat').addClass('all').attr("title","循环播放");
}else if (repeat == 3){
	$('.repeat').addClass('shuffle').attr("title","随机播放");
}else{
	$('.repeat').attr("title","顺序播放");
}

$('.repeat').on('click', function(){
	if ($(this).hasClass('once')){
		repeat = localStorage.repeat = 2;
		$(this).removeClass('once').addClass('all').attr("title","循环播放");
	} else if ($(this).hasClass('all')){
		repeat = localStorage.repeat = 3;
		$(this).removeClass('all').addClass('shuffle').addClass("enable").attr("title","随机播放");
	} else if ($(this).hasClass('shuffle')){
		repeat = localStorage.repeat = 0;
		$(this).removeClass('shuffle').removeClass('enable').attr("title","顺序播放");
	}else{
		repeat = localStorage.repeat = 1;
		$(this).addClass('once').attr("title","单曲循环");
	}
});


//播放器显隐控制
$("#player_lock").click(function () {
	if($(this).find("i").hasClass("fa-unlock")){
		$(this).html("").append('<i class="fa fa-lock" title="锁定"></i>');
	}else if($(this).find("i").hasClass("fa-lock")){
		$(this).html("").append('<i class="fa fa-unlock" title="解锁"></i>');
	}
});

$("#player_lock").mouseover(function () {  
	setTimeout(function () {
		$("#player").animate({bottom:'0px'},50);
		$("#player").addClass("show");
	},"50");
	/*setTimeout(function () {
		$("#player_bar").animate({bottom:'80px'},50);
	},"49");*/
	setTimeout(function () {  
		var height = $("#songLibraryDiv").height() - 150;
		$("#songLibraryContaint").animate({height:height},50);
	},"47");
});

/*$("#player_bar").mouseover(function () {  
	setTimeout(function () {
		$("#player").animate({bottom:'0px'},50);
	},"50");
	setTimeout(function () {
		$("#player_bar").animate({bottom:'80px'},50);
	},"49");
});*/

$("#player").hover(function(){
	showPlayer();
},function(){
	if($("#player_lock").find("i").hasClass("fa-lock")){
		return;
	}else{
		hidePlayer();
	}
});
var tm_player;
var showPlayer = function () {  
	setTimeout(function () {
		$("#player").animate({bottom:'0px'},50);
		$("#player").addClass("show");
	},"50");
	/*setTimeout(function () {
		$("#player_bar").animate({bottom:'80px'},50);
	},"49");*/
	setTimeout(function () {  
		$("#songListsDiv").animate({bottom:'81px'},50);
	},"48");
	setTimeout(function () {  
		var height = $("#songLibraryDiv").height() - 150;
		$("#songLibraryContaint").animate({height:height},50);
	},"47");
	if(tm_player){
		clearTimeout(tm_player);
	}
}
var hidePlayer = function () {  
	tm_player = setTimeout(function(){
		setTimeout(function () {
			$("#player").animate({bottom:'-80px'},50);
			$("#player").removeClass("show");
		},"50");
		/*setTimeout(function () {
			$("#player_bar").animate({bottom:'0px'},50);
		},"49");*/
		setTimeout(function () {  
			$("#songListsDiv").animate({bottom:'0px'},50);
		},"48");
		setTimeout(function () {  
			var height = $("#songLibraryDiv").height() - 70;
			$("#songLibraryContaint").animate({height:height},50);
		},"47");
		
	},1000);
}