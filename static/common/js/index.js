var bgOneInterval;
var audioSrc = "",songImgsrc = "",songName = "",songArtist = "",songAblum = "";
//默认音量
var defultValmue = localStorage.volume || 0.0;
//背景类型
var bgType = localStorage.bgType || '0';
//推荐歌曲列表
var recommendSongsObj = new Array();
//播放列表
var songLists = localStorage.songLists.split(",") || new Array();
//播放音乐ID
var isPlaySongId = localStorage.isPlaySongId || "";
//日期
var date = localStorage.date || "1996-11-9";
//自动播放
var autoplay = false;
//歌曲库历史页面
var songLibraryHistoryPage = new Object();
var songLibraryHistoryPageNum = 0;


$(function () {

    $("#loadingModal").css("opacity","1");
    $("#loadingModal").show();

    //平台、设备和操作系统
    var system = {
        win: false,
        mac: false,
        xll: false,
        ipad:false
    };
    //检测平台
    var p = navigator.platform;
    system.win = p.indexOf("Win") == 0;
    system.mac = p.indexOf("Mac") == 0;
    system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
    system.ipad = (navigator.userAgent.match(/iPad/i) != null)?true:false;
    //跳转语句，如果是手机访问就自动跳转到wap.baidu.com页面
    if (system.win || system.mac || system.xll||system.ipad) {

        if(getLoginStatus()){
            $("#loadingModal").hide();
            $("#loadingModal").remove();
            setTimeout(function(){
                $("#container").fadeIn(200);
            },300);
            setTimeout(function(){
                showPlayer();
            },301);

            //加载播放器
            //判断是否有本地音乐 或 根据日期获取推荐歌单
            if(isPlaySongId == "" || isPlaySongId == "undefined" || date != getDate()){
                date = localStorage.date = getDate();
                //获取推荐音乐并加载
                if(recommendSongs()){
                    //推荐音乐添加至播放列表
                    songLists = localStorage.songLists = recommendSongsObj;
                    isPlaySongId = localStorage.isPlaySongId = songLists[0];
                }
            }
            loadPlayer(isPlaySongId);
            //加载播放列表
            loadSongList();
        }

    }else{
        alert_info("暂不支持手机端访问");
    }

    /*点击事件*/
    //隐藏/显示侧边栏
    $("#hideMenu").click(function () {
        
        $(".icon_menu").hide();
        $(".containerMenuIcon").show();
        $("#bgMenuDiv").hide();
        $("#bgMenuDiv").removeClass("show");
        setTimeout(function () {
            $("#menu_div").animate({left:'-40px'},0);
        },"2");
        setTimeout(function () {
            $("#player").animate({width:'100%',left:'0px'},0);
        },"1");
        setTimeout(function () {  
			$("#songListsDiv").animate({left:'0px'},50);
		},"3");
        /*setTimeout(function () {
            $("#menu_bar").animate({left:'0px'},0);
        },"0");*/
    });
    $("#showMenuDiv").click(function(){
        $("#showMenuDiv").hide();
        setTimeout(function () {
            $("#menu_div").animate({left:'0px'},0);
            $(".icon_menu").show();
        },"2");
        setTimeout(function () {
            var width = $("#containt").width() - 40;
            $("#player").animate({width:width,left:'41px'},0);
        },"1");
        setTimeout(function () {  
			$("#songListsDiv").animate({left:'41px'},50);
		},"3");
        /*setTimeout(function () {
            $("#menu_bar").animate({left:'40px'},0);
        },"0");*/

    });
    //鼠标悬浮显示/隐藏菜单栏
    var tm_menu;
    /*$("#menu_bar").mouseover(function () {  
        setTimeout(function () {
            $("#menu_div").animate({left:'0px'},0);
            $(".icon_menu").show();
        },"2");
        setTimeout(function () {
            var width = $("#containt").width() - 40;
            $("#player").animate({width:width,left:'41px'},0);
        },"1");
        setTimeout(function () {
            $("#menu_bar").animate({left:'40px'},0);
        },"0");
    });*/

    $("#menu_div").hover(function(){
        $(".containerMenuIcon").hide();
        setTimeout(function () {
            $("#menu_div").animate({left:'0px'},0);
            $(".icon_menu").show();
        },"2");
        setTimeout(function () {
            var width = $("#containt").width() - 40;
            $("#player").animate({width:width,left:'41px'},0);
        },"1");
        setTimeout(function () {  
			$("#songListsDiv").animate({left:'41px'},50);
		},"3");
        /*setTimeout(function () {
            $("#menu_bar").animate({left:'40px'},0);
        },"0");*/
        if(tm_menu){
            clearTimeout(tm_menu);
        }
    },function(){        
        tm_menu = setTimeout(function(){
            $(".icon_menu").hide();
            $(".containerMenuIcon").show();
            $("#bgMenuDiv").hide();
            $("#bgMenuDiv").removeClass("show");
            setTimeout(function () {
                $("#menu_div").animate({left:'-40px'},0);
            },"2");
            setTimeout(function () {
                $("#player").animate({width:'100%',left:'0px'},0);
            },"1");
            setTimeout(function () {  
                $("#songListsDiv").animate({left:'0px'},50);
            },"3");
            /*setTimeout(function () {
                $("#menu_bar").animate({left:'0px'},0);
            },"0");*/
        },400);
    });

    //登录
    $("#userImg_Logout").click(function(){
        window.location.href = "/login.html";
    });
    $("#userImg_Login").click(function(){
        goUserInfo();
    });

   //背景菜单相关事件
    $("#bgMenuDiv div").click(function () {  
        bgType = localStorage.bgType = $(this).attr("data-type");
        $("#bgMenuDiv").hide();
        loadPlayer(isPlaySongId);
    });
    $("#bgMenu").hover(function(){
        $("#bgMenuDiv").show();
    },function(){        
        $("#bgMenuDiv").hide();
    });
    //播放列表相关点击事件
    $("#songListsIcon").click(function () {  
        if($("#songListsDiv").hasClass("show")){
            $("#songListsDiv").removeClass("show");
        }else{
            $("#songListsDiv").addClass("show");
            //获取滚动条高度显示当前播放歌曲
            var liNum = 0;
            var tempNum = 0; 
            $("#songListsUl li").each(function () { 
                if($(this).hasClass("playing")){
                    liNum = tempNum;
                }else{
                    tempNum++;
                }
            });
            $("#songListsUl").scrollTop((liNum - 2) * 27);
        }
    });
    $("#closeSongListsDiv").click(function () {  
        $("#songListsDiv").removeClass("show");
    });
    $("#songListsUl li").click(function () {  
        $("#songListsUl li").removeClass("playing");
        $("#songListsUl li i").removeClass("fa-music");
        $(this).addClass("playing");
        $(this).find("i").addClass("fa-music");
        var songId = $(this).attr("data-id");
        autoplay = true;
        loadPlayer(songId);    
    });
    //显示隐藏歌曲库
    $(".songLibraryIcon").click(function () {  
        if($(".songLibraryDiv").hasClass("show")){
            $(".songLibraryDiv").removeClass("show");
        }else{
            $(".songLibraryDiv").addClass("show");
        }
    });
    //搜索
    $("#searchBtn").click(function(){
        var keywords = $("#searchIpt").val();
        var url = "/index_iframe/searchResult.html?keywords=" + keywords;
        $("#songLibraryIframe").attr("src",url);
        addSongLibraryHistoryPage(url);
    });    

    //歌曲库刷新
    $("#page_Refresh").click(function () {  
        $("#songLibraryIframe").attr("src",songLibraryHistoryPage[songLibraryHistoryPageNum]);
    });


    //键盘事件
    $(document).keyup(function(event){
        //回车
        if(event.keyCode ==13){
            if($("#searchIpt").is(":focus")){
                var keywords = $("#searchIpt").val();
                var url = "/index_iframe/searchResult.html?keywords=" + keywords;
                $("#songLibraryIframe").attr("src",url);
                addSongLibraryHistoryPage(url);
            }
        }
    });
    //resize
    $(window).resize(function () {
        //背景1  
        if(bgType == '1'){
            onResize();
        }
        //歌曲库
        if($("#player").hasClass("show")){
            $("#songLibraryContaint").css("height","calc(100% - 150px)");
        }else{
            $("#songLibraryContaint").css("height","calc(100% - 70px)");
        }
    })
});


//获取账户信息
function getLoginStatus() {  
    var funrst = false;
    var uid = $.session.get('uid');
    if(uid != undefined){
        $.ajax({
            url:"/user/detail",
            type:"POST",
            data:{
              "uid":uid
            },
            dataType: "json",
            async:false,
            success:function(data){
                  //console.log(data);
                  $("#userImg_Logout").hide();
                  $("#userImg_Login").attr("src",data.profile.avatarUrl).show();
                  loginRefresh();
                  funrst = true;
            },
            error:function (err) {  
              console.log(err); 
            }
        });
    }else{
        /*$("#userImg_Logout").show();
        $("#loadingModal").hide();
        
        $("#userImg_Login").hide();
        setTimeout(function(){
            $("#container").fadeIn(200);
        },300);*/
        window.location.href = "/login.html";
    }
    return funrst;
}
//刷新登录信息
function loginRefresh() {
    $.ajax({
        url:"/login/refresh",
        type:"POST",
        dataType: "json",
        success:function(data){
            if(data.code == "200"){
                return;
            }else{
                alert_info("刷新登录信息失败！");
                $.session.clear();
                clearCookie();
                $("#userImg_Login").hide(); 
                $("#userImg_Logout").show();
            }   
        },
        error:function (err) {  
          console.log(err); 
        }
    });
}
//退出登录
function logout() {  
    if(isloggedIn()){
        $.session.clear();
        alert_info("退出登录成功！");
        getLoginStatus();
    }else{
        alert_info("暂无登录");
    }
}
//跳转账号信息页
function goUserInfo() {  
    if(isloggedIn()){
        window.location.href = "/userInfo.html";
    }else{
        alert_info("无登录权限！");
    }
}
//是否登录
function isloggedIn() { 
    var uid = $.session.get('uid');
    if(uid != undefined){
        return true;
    }else{
        return false;
    }
}
//检查音乐是否可用
function checkMusic(songId){
    var funrst = false; 
    $.ajax({
        url:"/check/music",
        type:"POST",
        data:{
            id:songId
        },
        async:false,
        dataType: "json",
        success:function(data){
            if(data.success){
                funrst = true;
            }else{
                alert_info("音乐不可用，Message："+data.message);
            }
        },
        error:function (err) {  
          console.log(err); 
        }
    });
    return funrst;
}
//获取每日推荐歌曲
function recommendSongs() {  
    var funrst = false;
    $.ajax({
        url:"/recommend/songs",
        type:"POST",
        dataType: "json",
        async:false,
        success:function(data){
            if(data.code == "200"){
                for(var i in data.recommend){
                    recommendSongsObj.push(data.recommend[i].id);
                }
                funrst = true;
            }else{
               console.log("获取每日推荐歌曲失败！");
            }   
        },
        error:function (err) {  
          console.log(err); 
        }
    });
    return funrst;
}
//加载播放列表
function loadSongList() {
    $("#songListsUl").html(""); 
    var ids = ""; 
    for(var i in songLists){
        if( ids == ""){
            ids = ids + songLists[i];
        }else{
            ids = ids + "," + songLists[i];
        }
    }
    var timestamp = Date.parse(new Date());
    var url = "/song/detail?ids="+ids+"&timestamp="+timestamp;
    $.ajax({
        url:url,
        type:"GET",
        dataType: "json",
        async:false,
        success:function(data){
            if(data.code == "200"){
                var songs = data.songs;
                for(var i in songs){
                    var songId = songs[i].id;
                    var songName = songs[i].name;
                    var songArtist = songs[i].ar[0].name;
                    if(songId == isPlaySongId){
                        $("#songListsUl").append('<li class="playing" data-id="' + songId + '"><i class="fa fa-music" aria-hidden="true"></i><span>'+songName+' - '+ songArtist +'</span></li>'); 
                    }else{
                        $("#songListsUl").append('<li class="" data-id="' + songId + '"><i class="fa" aria-hidden="true"></i><span>'+songName+' - '+ songArtist +'</span></li>'); 
                    
                    }
                }
            }else{
               console.log("获取歌曲详情失败！");
            }   
        },
        error:function (err) {  
          console.log(err); 
        }
    });
    
}

//播放器加载一条龙（专用）
function loadPlayer(songId) { 
    isPlaySongId = songId; 
    //检查音乐是否可用
    if(checkMusic(songId)){
        if(getSongUrl(songId)){
            //显示歌曲信息至页面
            if(audioSrc != "" && songImgsrc != "" && songName != "" && songArtist != "" && songAblum != ""){
                $("#player").attr("data-id",songId);
                loadMusic(audioSrc,songImgsrc,songName,songArtist,songAblum);

                if(bgType == "1"){
                    //加载背景一
                    $(".containerMenuIcon .fa_icon").css("color","#fff");

                    $("#canvasBgOne").remove();
                    initBackgroundOne();
                    audioSetup(audioSrc);

                    if(autoplay){
                        userStart();
                        play();
                    }
                }
                 
            }
        }
    }
}
//获取歌曲url
function getSongUrl(songId) { 
    var funrst = false; 
    var timestamp = Date.parse(new Date());
    var url = "/song/url?timestamp="+timestamp;
    $.ajax({
        url:url,
        type:"POST",
        async:false,
        data:{
            'id' : songId
        },
        dataType: "json",
        success:function(data){
            if(data.code == "200"){
                audioSrc = data.data[0].url;
                if(getSongDetail(songId)){
                    funrst = true; 
                }
            }else{
               console.log("获取歌曲url失败！");
            }   
        },
        error:function (err) {  
          console.log(err); 
        }
    });
    return funrst;
}
//获取歌曲详情
function getSongDetail(songId) {  
    var funrst = false;
    var timestamp = Date.parse(new Date());
    var url = "/song/detail?ids="+songId+"&timestamp="+timestamp;
    $.ajax({
        url:url,
        type:"GET",
        dataType: "json",
        async:false,
        success:function(data){
            if(data.code == "200"){
                songName = data.songs[0].name;
                songArtist = data.songs[0].ar[0].name;
                songAblum = data.songs[0].al.name;

                var albumId = data.songs[0].al.id;
                if(getAlbum(albumId)){
                    funrst = true;
                }
            }else{
               console.log("获取歌曲详情失败！");
            }   
        },
        error:function (err) {  
          console.log(err); 
        }
    });
    return funrst;
}
//获取专辑详情
function getAlbum(songId){
    var funrst = false;
    var timestamp = Date.parse(new Date());
    var url = "/album?id="+songId+"&timestamp"+timestamp;
    $.ajax({
        url:url,
        type:"GET",
        dataType: "json",
        async:false,
        success:function(data){
            if(data.code == "200"){
                songImgsrc = data.album.picUrl;
                funrst = true;
            }else{
               console.log("获取歌曲封面失败！");
            }   
        },
        error:function (err) {  
          console.log(err); 
        }
    });
    return funrst;
}

//获取年月日year-month-date
function getDate() {  
    var date = new Date();
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
}


//设置歌曲库历史页面
//添加url
function addSongLibraryHistoryPage(url){
    if(songLibraryHistoryPageNum == "0"){
        //历史为空
        songLibraryHistoryPageNum = 1;
        songLibraryHistoryPage[1] = url;
    }else{
        var isRedirect = false;
        for(var i in songLibraryHistoryPage){
            if(parseInt(i) > parseInt(songLibraryHistoryPageNum)){
                isRedirect = true;
            }
        }
        if(isRedirect){
            for(var i in songLibraryHistoryPage){
                if(parseInt(i) > parseInt(songLibraryHistoryPageNum)){
                    delete songLibraryHistoryPage[i];
                }
            }
        }
        songLibraryHistoryPageNum = parseInt(songLibraryHistoryPageNum) + 1;
        songLibraryHistoryPage[songLibraryHistoryPageNum] = url;
    }

    initHistoryPageControl();

}
//重定向iframe
function redirectHistoryPage(type){
    var url = "";
    if(type == "back"){
        url = songLibraryHistoryPage[parseInt(songLibraryHistoryPageNum) - 1];
        songLibraryHistoryPageNum = parseInt(songLibraryHistoryPageNum) - 1;
    }else if(type == "forward"){
        url = songLibraryHistoryPage[parseInt(songLibraryHistoryPageNum) + 1];
        songLibraryHistoryPageNum = parseInt(songLibraryHistoryPageNum) + 1;
    }
    $("#songLibraryIframe").attr("src",url);
    initHistoryPageControl();
}

function initHistoryPageControl() {  
    //初始化页面控制
    unBindHistorPageControl();
    var length = Object.getOwnPropertyNames(songLibraryHistoryPage).length;
    if(length > 1 && parseInt(songLibraryHistoryPageNum) == 1){
        bindPage_forward();
    }else if(length > 1 && parseInt(songLibraryHistoryPageNum) == length){
        bindPage_back();
    }else if(length > 1){
        bindPage_forward();
        bindPage_back();
    }
}
//绑定歌曲库页面控制按钮事件
function unBindHistorPageControl() {  
    $("#page_back").off();
    $("#page_forward").off();
    $("#page_back").css("color","#999");
    $("#page_forward").css("color","#999");
}
 
function bindPage_back() {  
    $("#page_back").css("color","white");
    $("#page_back").click(function () {  
        redirectHistoryPage("back");
    });
}
function bindPage_forward() {  
    $("#page_forward").css("color","white");
    $("#page_forward").click(function () {  
        redirectHistoryPage("forward");
    });
}
