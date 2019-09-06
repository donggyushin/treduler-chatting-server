import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import fs from 'fs';
const credentials = {
    key: fs.readFileSync(__dirname + '/privkey.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem'),
    ca: fs.readFileSync(__dirname + '/chain.pem')
}

const PORT = 8083

const app = express()

const env = process.env.NODE_ENV || 'dev';

let server = http.createServer(app);
if (env === 'production') {
    server = require('https').createServer(credentials, app);
}

const io = socketIO(server);

let clients = []

io.on('connection', socket => {
    console.log('user connected')
    socket.on('login', data => {
        // data 는 user 객체와 boardId
        const { user, boardId } = data;
        socket.user = user
        socket.boardId = boardId
        let exist = false;
        clients.map(client => {
            if (client.user.email === socket.user.email && client.boardId === socket.boardId) {
                // 이미 존재하는 유저. 로그인 못함. 
                exist = true;
            }
        })
        if (exist === false) {
            clients.push(socket)
            console.log('user logged in: ', socket.user)
        }
    })
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.user);
        const updatedClients = clients.filter(client => {
            if (client.user.email === socket.user.email && client.boardId === socket.boardId) {
                return false
            } else {
                return true
            }
        })
        clients = updatedClients
    })
})

server.listen(PORT, () => console.log(`Chatting server listening on port ${PORT}`))