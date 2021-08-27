const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let currentState = {
  history: [],
  cardsShown: false
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('welcome', currentState);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', msg => {
    console.log('chat message');
    currentState.history.push(msg);
    io.emit('chat message', msg);
    io.emit('view cards shown', currentState.cardsShown);
  });
  socket.on('set cards shown', msg => {
    console.log('set cards shown', msg);
    currentState.cardsShown = msg;
    io.emit('view cards shown', currentState.cardsShown);
  });
  socket.on('new vote', msg => {
    console.log('new vote', msg);
    currentState.cardsShown = false;
    currentState.history = [];
    io.emit('welcome', currentState);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
