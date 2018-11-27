var express = require('express');
var router = express.Router();

//编写执行函数
router.get('/', function(req, res, next) {    
    res.sendFile(process.cwd() + "/views/index.html" )    
});

router.get('/index.html', function(req, res, next) {    
    res.sendFile(process.cwd() + "/views/index.html" )    
});

router.get('/login.html', function(req, res, next) {    
    res.type('html');
    res.sendFile(process.cwd() + "/views/login.html" )    
});

router.get('/userInfo.html', function(req, res, next) {    
    res.type('html');
    res.sendFile(process.cwd() + "/views/userInfo.html" )    
});

router.get('/test.html', function(req, res, next) {    
    res.type('html');
    res.sendFile(process.cwd() + "/views/test.html" )    
});

router.get('/index_iframe/searchResult.html', function(req, res, next) {    
    res.type('html');
    res.sendFile(process.cwd() + "/views/index_iframe/searchResult.html" )    
});

module.exports = router;