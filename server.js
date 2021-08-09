const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const path = require('path');
const pug = require('pug');
const { v4: uuidV4 } = require('uuid');

//peer specific
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use('/peerjs', peerServer);

//express specific
app.use('/public', express.static('public'));
app.use(express.urlencoded());

//pug specific
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//our end-points
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    const params = { roomId: req.params.room }
    res.status(200).render('room.pug', params);
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      console.log("user joined the call...");
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('user-connected', userId);

      socket.on('message', (message) => {
        io.to(roomId).emit('createMessage', message, userId);
    });
    
      socket.on('disconnect', () => {
          socket.broadcast.to(roomId).emit('user-disconnected', userId);
      });
    });
});

//start the server
server.listen(process.env.PORT||8000);