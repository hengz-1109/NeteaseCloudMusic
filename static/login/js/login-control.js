var localUserName = localStorage.userName || "";
var lcoalUserPwd = localStorage.userPwd || "";
(function() {
	// trim polyfill : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	if (!String.prototype.trim) {
		(function() {
			// Make sure we trim BOM and NBSP
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			String.prototype.trim = function() {
				return this.replace(rtrim, '');
			};
		})();
	}

	[].slice.call( document.querySelectorAll( 'input.input__field' ) ).forEach( function( inputEl ) {
		// in case the input is already filled..
		if( inputEl.value.trim() !== '' ) {
			classie.add( inputEl.parentNode, 'input--filled' );
		}

		// events:
		inputEl.addEventListener( 'focus', onInputFocus );
		inputEl.addEventListener( 'blur', onInputBlur );
	} );

	function onInputFocus( ev ) {
		//classie.add( ev.target.parentNode, 'input--filled' );
	}

	function onInputBlur( ev ) {
		if( ev.target.value.trim() === '' ) {
			//classie.remove( ev.target.parentNode, 'input--filled' );
		}
	}
})();

$(function() {	

	$('#loadingModal').modal('show');

	if(login_bgIsReady() && verifyCodeIsReady()){
		$('#loadingModal').modal('hide');
		setTimeout(function () {  
			$("#background-container").fadeIn();
			$("#login").fadeIn();
			$("#login-verify-code-canvas").css("height",$('#login-verify-code').parent().height());
		},300);
	}

	$('#login #login-password').focus(function() {
		$('.login-owl').addClass('password');
	}).blur(function() {
		$('.login-owl').removeClass('password');
	});
	$('#login #register-password').focus(function() {
		$('.register-owl').addClass('password');
	}).blur(function() {
		$('.register-owl').removeClass('password');
	});
	$('#login #register-repassword').focus(function() {
		$('.register-owl').addClass('password');
	}).blur(function() {
		$('.register-owl').removeClass('password');
	});
	$('#login #forget-password').focus(function() {
		$('.forget-owl').addClass('password');
	}).blur(function() {
		$('.forget-owl').removeClass('password');
	});
	//回车事件
	$(document).keyup(function(event){
		if(event.keyCode ==13){
			login();
		}
	});

	$("#login-username").val(localUserName);
	$("#login-password").val(lcoalUserPwd);
});

function goto_register(){
	$("#register-username").val("");
	$("#register-password").val("");
	$("#register-repassword").val("");
	$("#register-code").val("");
	$("#tab-2").prop("checked",true);
}

function goto_login(){
	$("#login-username").val("");
	$("#login-password").val("");
	$("#tab-1").prop("checked",true);
}

function goto_forget(){
	$("#forget-username").val("");
	$("#forget-password").val("");
	$("#forget-code").val("");
	$("#tab-3").prop("checked",true);
}

function login(){//登录
	var username = $("#login-username").val(),
		password = $("#login-password").val(),
		verifycode = $("#login-verify-code").val(),
		validatecode = null;
		verifycodeType = false;
	var acountType = "";

	localStorage.userName = username;
	localStorage.userPwd = password;
	//判断用户名密码是否为空
	if(username == ""){
		$.pt({
    		target: $("#login-username"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"用户名不能为空"
    	});
		return;
	}
	if(password == ""){
		$.pt({
    		target: $("#login-password"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"密码不能为空"
    	});
		return;
	}
	if(verifycodeType && verifycode == ""){
		$.pt({
    		target: $("#login-verify-code-canvas"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"验证码不能为空"
    	});
		return;
	}		
	if(verifycodeType && timeout_flag){
		$.pt({
    		target: $("#login-verify-code-canvas"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"验证码已经失效"
    	});
		$("#login-verify-code").val("");
		$("#login-verify-code-canvas").click();
		return;
	}
	//判断用户名是否为手机号或邮箱账号
	var phoneReg = /^1[3-578]\d{9}$/;
	var mailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
	if(phoneReg.test(username)){
		acountType = "phone";	
	}else if(mailReg.test(username)){
		acountType = "mail";
	}else{
		$.pt({	
    		target: $("#login-username"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"请输入正确格式的手机号或邮箱"
    	});
		return;
	}
	//判断验证码是否正确
	if(verifycodeType && verifycode != show_num.join("")){
		$.pt({
    		target: $("#login-verify-code-canvas"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"验证码不正确"
    	});
		return;
	}
	
	//登录
	//调用后台登录验证的方法
	//var strPassword = strToBinary(password);
	if(acountType == "phone"){
		$.ajax({
			url:"/login/cellphone", 
			type:"POST",
			data:{
				"phone":username,
				"password":password
			},
			dataType: "json",
			success:function(data){
				if(data.code != "200"){
					alert_info("登录失败！  错误码："+data.code);
					$("#login-password").val("");
					$("#login-verify-code").val("");
					$("#login-verify-code-canvas").click();

					$(".input--verify_code").show();
					$("#login-verify-code-canvas").show();
					verifycodeType = true;
				}else{
					$.session.set('uid', data.account.id);

					window.location.href = "/index.html";
				}
			},
			error:function (err) {  
				alert_info("登录失败！");
				$(".input--verify_code").show();
				$("#login-verify-code-canvas").show();
				verifycodeType = true;

				$("#login-password").val("");
				$("#login-verify-code").val("");
				$("#login-verify-code-canvas").click();
			}
		});
	}else if(acountType == "mail"){
		$.ajax({
			url:"/login",
			type:"POST",
			data:{
			  "email":username,
			  "password":password
			},
			dataType: "json",
			success:function(data){
			  	console.log(data);
			  	if(data.code != "200"){
					alert_info("登录失败！  错误码："+data.code);
					$("#login-password").val("");
					$("#login-verify-code").val("");
					$("#login-verify-code-canvas").click();
				}else{
					$.session.set('uid', data.account.id);

					window.location.href = "/index.html";
				}
			},
			error:function (err) {  
				alert_info("登录失败!");
				$("#login-password").val("");
				$("#login-verify-code").val("");
				$("#login-verify-code-canvas").click();
			}
		});
	}
}

//注册
function register(){
	var username = $("#register-username").val(),
		password = $("#register-password").val(),
		repassword = $("#register-repassword").val(),
		code = $("#register-code").val(),
		flag = false,
		validatecode = null;
	//判断用户名密码是否为空
	if(username == ""){
		$.pt({
    		target: $("#register-username"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"用户名不能为空"
    	});
		flag = true;
	}
	if(password == ""){
		$.pt({
    		target: $("#register-password"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"密码不能为空"
    	});
		flag = true;
	}else{
		if(password != repassword){
			$.pt({
        		target: $("#register-repassword"),
        		position: 'r',
        		align: 't',
        		width: 'auto',
        		height: 'auto',
        		content:"两次输入的密码不一致"
        	});
			flag = true;
		}
	}
	//用户名只能是15位以下的字母或数字
	var regExp = new RegExp("^[a-zA-Z0-9_]{1,15}$");
	if(!regExp.test(username)){
		$.pt({
    		target: $("#register-username"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"用户名必须为15位以下的字母或数字"
    	});
		flag = true;
	}
	//检查用户名是否已经存在
	//调后台代码检查用户名是否已经被注册
	
	//检查注册码是否正确
	//调后台方法检查注册码，这里写死为11111111
	if(code != '11111111'){
		$.pt({
	        target: $("#register-code"),
	        position: 'r',
	        align: 't',
	        width: 'auto',
	        height: 'auto',
	        content:"注册码不正确"
	       });
		flag = true;
	}
	
	
	if(flag){
		return false;
	}else{//注册
		spop({			
			template: '<h4 class="spop-title">注册成功</h4>即将于3秒后返回登录',
			position: 'top-center',
			style: 'success',
			autoclose: 3000,
			onOpen : function(){
				var second = 2;
				var showPop = setInterval(function(){
					if(second == 0){
						clearInterval(showPop);
					}
					$('.spop-body').html('<h4 class="spop-title">注册成功</h4>即将于'+second+'秒后返回登录');
					second--;
				},1000);
			},
			onClose : function(){
				goto_login();
			}
		});
		return false;
	}
}

//重置密码
function forget(){
	var username = $("#forget-username").val(),
		password = $("#forget-password").val(),
		code = $("#forget-code").val(),
		flag = false,
		validatecode = null;
	//判断用户名密码是否为空
	if(username == ""){
		$.pt({
    		target: $("#forget-username"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"用户名不能为空"
    	});
		flag = true;
	}
	if(password == ""){
		$.pt({
    		target: $("#forget-password"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"密码不能为空"
    	});
		flag = true;
	}
	//用户名只能是15位以下的字母或数字
	var regExp = new RegExp("^[a-zA-Z0-9_]{1,15}$");
	if(!regExp.test(username)){
		$.pt({
    		target: $("#forget-username"),
    		position: 'r',
    		align: 't',
    		width: 'auto',
    		height: 'auto',
    		content:"用户名必须为15位以下的字母或数字"
    	});
		flag = true;
	}
	//检查用户名是否存在
	//调后台方法
	
	//检查注册码是否正确
	if(code != '11111111'){
		$.pt({
	        target: $("#forget-code"),
	        position: 'r',
	        align: 't',
	        width: 'auto',
	        height: 'auto',
	        content:"注册码不正确"
	       });
		flag = true;
	}
	
	
	
	if(flag){
		return false;
	}else{//重置密码
		spop({			
			template: '<h4 class="spop-title">重置密码成功</h4>即将于3秒后返回登录',
			position: 'top-center',
			style: 'success',
			autoclose: 3000,
			onOpen : function(){
				var second = 2;
				var showPop = setInterval(function(){
					if(second == 0){
						clearInterval(showPop);
					}
					$('.spop-body').html('<h4 class="spop-title">重置密码成功</h4>即将于'+second+'秒后返回登录');
					second--;
					},1000);
			},
			onClose : function(){
				goto_login();
			}
		});
		return false;
	}
}

function strToBinary(str){
	var result = [];
	var list = str.split("");
	for(var i=0;i<list.length;i++){
		if(i != 0){
			result.push(" ");
		}
		var item = list[i];
		var binaryStr = item.charCodeAt().toString(2);
		result.push(binaryStr);
	}   
	return result.join("");
}