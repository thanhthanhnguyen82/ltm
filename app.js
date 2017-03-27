const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');
const ROOM = require('./room.js');
// Import from Nguyen
const auth = require('./auth').auth;
const private = require('./private');
const User = require('./user.js').User;
const Token = require('./user.js').Token;

let user = [];
let token = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});
//==========================================
// Routing: 
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

const allRoomObj = {};
const roomList = {};
//==============================================
// ROOM FUNCTIONS
//==============================================
/**
 * Create a room function
 * @param {*} roomName - received from client-side
 * @param {*} clientID - received from client-side
 */
// roomID is not yet generated randomly to run tests
const createRoom = (clientId, roomName) => {
    // check if both params are passed into
    if (typeof clientId === 'undefined' || typeof roomName === 'undefined') {
        console.log('Error: params are not passed into the function');
    } else {
        let roomId = shortid.generate();
        let newRoom = new ROOM(roomId, roomName, clientId);
        //console.log(room1);
        allRoomObj[roomId] = newRoom;
        roomList[roomId] = roomName;
        return roomId;
    }
}

/**
 * Delete a room function
 * @param {*} clientID 
 * @param {*} roomID 
 */
const deleteRoom = (clientID, roomID) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined') {
        console.log('Error: params are not passed into the function');
    } else if (allRoomObj[roomID] === undefined) {
        console.log('Error: Room does not exist !!');
    } else {
        // only allows the room's creator
        let roomCreator = allRoomObj[roomID].creator;
        if (clientID !== roomCreator) {
            console.log("Error: Only the room's creator is allowed to delete it !!");
        } else {
            delete allRoomObj[roomID];
            delete roomList[roomID];
        }
    }

}

/**
 * Clients join rooms function -> add clients to room
 * @param {*} clientID 
 * @param {*} roomID 
 */
const joinRoom = (clientID, roomID) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined') {
        console.log('Error: params are not passed into the function');
    } else if (allRoomObj[roomID] === undefined) {
        console.log('Error: Room does not exist !!');
    } else {
        let room = allRoomObj[roomID];
        room.addClient(clientID);
    }
}

/**
 * Clients leave rooms function -> remove clients from room
 * @param {*} clientID 
 * @param {*} roomID
 */
const leaveRoom = (clientID, roomID) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined') {
        console.log('Error: params are not passed into the function');
    } else if (allRoomObj[roomID] === undefined) {
        console.log('Error: Room does not exist !!');
    } else {
        let room = allRoomObj[roomID];
        room.removeClient(clientID);
    }
}

/**
 * Clients change the room's name -> only allow the room's creator to change name
 * @param {*} clientID 
 * @param {*} roomID 
 * @param {*} newRoomName 
 */

const changeRoomName = (clientID, roomID, newRoomName) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined' || typeof newRoomName === 'undefined') {
        console.log('Error: params are not passed into the function');
    }
    else if (allRoomObj[roomID] === undefined) {
        console.log('Error: Room does not exist !!');
    }
    else {
        let room = allRoomObj[roomID];
        let roomCreator = allRoomObj[roomID].creator;
        if (clientID !== roomCreator) {
            console.log("Error: Only the room's creator is allowed to change room name !!");
        } else {
            room.changeName(newRoomName);
            roomList[roomID] = newRoomName;
        }
    }
}

//==============================================
// SOCKET.IO EVENTS
//==============================================
const main = io.on('connection', (socket) => {
    
    io.sockets.emit('user connect', roomList, user); //roomList, userList, clientName 

    //=================================
    socket.on('move to chat room', () => {
        //
    });
    
    //=================================
    socket.on('disconnect', () => {
        // remove the username from global usernames list
        socket.broadcast.emit('user disconnect', socket.id);
        console.log(socket.id + ' disconnected');
    });
    //===================================
    // IMPORT FROM Nguyen
    auth(socket, user, token);
    // socket.on('send_private',(data)=>{
    // 	private.send_private(socket.username,data['receiverName'],data['msg'],user,socket);
    // 	socket.on('update_connect',(data,socket)=>{
    // 		private.update_connect(data,user,socket);
    // 	});
    //});	

    //=====================================


    socket.on('create room', (roomName) => {
        try {
            // have user info -> use clienId not socket.id
            let clientId = socket.id;
            let newRoomId = createRoom(clientId, roomName);
            socket.emit('new room', { newRoomId: newRoomId, newRoomName: roomList[newRoomId] });
            io.sockets.emit('update room', roomList);
            // console.log(allRoomObj);
            // console.log(roomList);
        } catch (err) {
            console.log(err);
            socket.emit('create room error', err);
        }
    });

    socket.on('join room', (roomId) => {
        let clientId = socket.id;
        joinRoom(clientId, roomId);
        //console.log(allRoomObj[roomId]);
        socket.emit('join room', { roomId: roomId, roomName: roomList[roomId] });
    });

    socket.on('leave room', (roomId) => {
        let clientId = socket.id;
        leaveRoom(clientId, roomId);
        socket.emit('leave room', { roomId: roomId, roomName: roomList[roomId] });
    });

    socket.on('delete room', (roomId) => {
        let roomName = roomList[roomId];
        let clientId = socket.id;
        try {
            deleteRoom(clientId, roomId);
            // emit to all clients new roomList -> update room list
            io.sockets.emit('delete room', roomId, roomName, roomList);
        } catch (err) {
            console.log(err);
            socket.emit('delete room error', err);
        }
    })


    // when client sends a new msg
    socket.on('chat message', (data) => {
        socket.broadcast.emit('chat message', { roomId: data.roomId, username: socket.id, message: data.message });
    });

})





//===========================================
// LISTEN ON PORT 3000
//===========================================
http.listen(3000, () => {
    console.log('listening on *:3000');
});

