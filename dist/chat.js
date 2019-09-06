'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var credentials = {
    key: _fs2.default.readFileSync(__dirname + '/privkey.pem'),
    cert: _fs2.default.readFileSync(__dirname + '/cert.pem'),
    ca: _fs2.default.readFileSync(__dirname + '/chain.pem')
};

var PORT = 8083;

var app = (0, _express2.default)();

var env = process.env.NODE_ENV || 'dev';

var server = _http2.default.createServer(app);
if (env === 'production') {
    server = require('https').createServer(credentials, app);
}

var io = (0, _socket2.default)(server);

var clients = [];

io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('login', function (data) {
        // data 는 user 객체와 boardId
        var user = data.user,
            boardId = data.boardId;

        socket.user = user;
        socket.boardId = boardId;
        var exist = false;
        clients.map(function (client) {
            if (client.user.email === socket.user.email && client.boardId === socket.boardId) {
                // 이미 존재하는 유저. 로그인 못함. 
                exist = true;
            }
        });
        if (exist === false) {
            clients.push(socket);
            console.log('user logged in: ', socket.user);
        }
    });
    socket.on('disconnect', function () {
        console.log('user disconnected', socket.user);
        var updatedClients = clients.filter(function (client) {
            if (client.user.email === socket.user.email && client.boardId === socket.boardId) {
                return false;
            } else {
                return true;
            }
        });
        clients = updatedClients;
    });
});

server.listen(PORT, function () {
    return console.log('Chatting server listening on port ' + PORT);
});