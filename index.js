const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let currentState = {
  votes: [],
  // vote: {
  //   socketId: 'unMYmxeN5KWeftWBAAAD',
  //   username: 'Michael Knight',
  //   vote: '8'
  // },
  cardsShown: false
}

function restart() {
  currentState.cardsShown = false;
  currentState.votes = [];
  io.emit('welcome', currentState);
}

function userSaidHi(socketId, username) {
  let found = false;
  for (let i = 0; i < currentState.votes.length; i++) {
    if (currentState.votes[i].username === username) {
      found = true;
      break;
    }
  }
  if (!found) {
    currentState.votes.push({
      socketId: socketId,
      username: username,
      vote: null
    })
  }
}

function voteArrived(msg) {
  for (let i = 0; i < currentState.votes.length; i++) {
    let vote = currentState.votes[i];
    if (vote.username === msg.username) {
      vote.vote = msg.vote;
      return;
    }
  }
  console.error("no user in state", msg);
}

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  socket.emit('welcome', currentState);
  socket.on('disconnect', reason => {
    console.log('user disconnected', socket.id);
  });
  socket.on('i am here', username => {
      console.log('i am here', socket.id);
      userSaidHi(socket.id, username);
      io.emit('current state', currentState);
    }
  );
  socket.on('vote', msg => {
    console.log('chat message', socket.id);
    voteArrived(msg);
    io.emit('current state', currentState);
  });
  socket.on('set cards shown', msg => {
    console.log('set cards shown', msg);
    currentState.cardsShown = msg;
    io.emit('current state', currentState);
  });
  socket.on('new vote', msg => {
    console.log('new vote', msg);
    restart();
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
