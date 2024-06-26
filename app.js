'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');

var socket = require('./routes/socket.js');

var app = express();
var server = http.createServer(app);

/* Configuration */
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('port', 3000);

if (process.env.NODE_ENV === 'development') {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

/* Socket.io Communication */
var io = require('socket.io').listen(server);
io.sockets.on('connection', socket);

/* Start server */
server.listen(app.get('port'), function (){
  //console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});




const bodyParser = require('body-parser');
app.use(bodyParser.json());
let users = []; //유저 목록을 관리하는 배열

// Register endpoint
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    // 동일한 이름의 사용자가 존재하는지 체크
    if (users.find(user => user.username === username)) {
        return res.json({ success: false, message: '이미 사용 중인 아이디입니다.' });
    }

    // 유저 리스트에 추가
    users.push({ username, password });
    let ids = users.map(user => user.username);
    res.json({ success: true, userlist: ids });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 아이디와 비밀번호가 일치하는지 검사
    const user = users.find(user => 
        user.username === username && user.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, 
            message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
});

// Update user endpoint
app.post('/api/update', (req, res) => {
    const { currentname, newName } = req.body;
    //console.log(currentname, newName);

    // 동일한 이름의 사용자가 존재하는지 체크
    if (users.find(user => user.username === newName)) {
        return res.json({ success: false, message: '이미 사용 중인 아이디입니다.' });
    }

    // 현재 이름을 찾아서
    const userIndex = users.findIndex(user => user.username === currentname);

    if (userIndex !== -1) {
        // 새 이름으로 update
        users[userIndex].username = newName;
        res.json({ success: true, message: '아이디가 성공적으로 변경되었습니다.' });
        //console.log(users, '성공');
    } else {
        res.json({ success: false, message: '해당하는 아이디를 찾을 수 없습니다.' });
        //console.log('실패');

    }
});

// Get endpoint
app.post('/api/get', (req, res) => {
    let ids = users.map(user => user.username);
    res.json({userlist : ids});
});



module.exports = app;