```js
// sending to sender-client only
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid (server-side)
socket.broadcast.to(socketid).emit('message', 'for your eyes only');

// join to subscribe the socket to a given channel (server-side):
socket.join('some room');

// then simply use to or in (they are the same) when broadcasting or emitting (server-side)
io.to('some room').emit('some event'):

// leave to unsubscribe the socket to a given channel (server-side)
socket.leave('some room');

// list of clients in one room
io.sockets.adapter.rooms[roomId]

// all clients in a room leave the room
io.in(roomId).clients(function (error, clients) {
  if (clients.length > 0) {
    console.log('clients in the room: ');
    console.log(clients);
    clients.forEach(function (socket_id) {
      // clients leave room
      io.sockets.sockets[socket_id].leave(roomId);
    });
  }
});
```

### Update on 23/07/2017
#### Room messages error: send messages to all clients not just the clients in the destination room
* Use `socket.join('room')` and `socket.leave('room')` to accurately join and leave rooms -> joined sockets subscribe to listen to the room
* On event `socket.on('chat message')`, now use `socket.broadcast.to(data.roomId).emit('chat message', {...}` to only send messages to the room's clients 