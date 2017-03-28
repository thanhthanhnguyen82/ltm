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
    res.sendFile(__dirname + '/views/index2.html');
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
        throw new Error('Error: params are not passed into the function');
    } else {
        let roomId = shortid.generate();
        let newRoom = new ROOM(roomId, roomName, clientId);
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
        throw new Error('Error: params are not passed into the function');
    } else if (allRoomObj[roomID] === undefined) {
        throw new Error('Error: Room does not exist !!');
    } else {
        // only allows the room's creator
        let roomCreator = allRoomObj[roomID].creator;
        if (clientID !== roomCreator) {
            throw new Error("Error: Only the room's creator is allowed to delete it !!");
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
        throw new Error('Error: params are not passed into the function');
    } else if (allRoomObj[roomID] === undefined) {
        throw new Error('Error: Room does not exist !!');
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
        throw new Error('Error: params are not passed into the function');
    } else if (allRoomObj[roomID] === undefined) {
        throw new Error('Error: Room does not exist !!');
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
        throw new Error('Error: params are not passed into the function');
    }
    else if (allRoomObj[roomID] === undefined) {
        throw new Error('Error: Room does not exist !!');
    }
    else {
        let room = allRoomObj[roomID];
        let roomCreator = allRoomObj[roomID].creator;
        if (clientID !== roomCreator) {
            throw new Error("Error: Only the room's creator is allowed to change room name !!");
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

    //=================================
    socket.on('send clientId', (id) => {
        let clientId = id;
        console.log('receive data');
        // find the client info with clientId
        let connectClient = user.find(ele => ele.id === clientId);
        connectClient.socketId = socket.id;
        socket.username = connectClient.username;
        console.log(connectClient.socketId);
        console.log(socket.id);
        io.to(socket.id).emit('reconnect', connectClient, roomList);
        io.sockets.emit('user connect', connectClient, roomList, user);
    });


    //=================================
    // socket.on('disconnect', () => {
    //     // 
    //     console.log(user);
    //     let disconnectClient = user.find(ele => ele.socketId === socket.id);
    //     socket.broadcast.emit('user disconnect', disconnectClient.username);
    //     console.log(socket.username + ' disconnected');
    //     console.log(user);
    // });
    //===================================
    // IMPORT FROM Nguyen
    auth(socket, user, token);
    //======================ADDING FUNCTION
    function getUsername(uid) {
        let un = '';
        user.forEach((u) => {
            if (u['id'] === uid) un = u['username'];
        });
        return un;
    }
    socket.on('private', (data) => {
        let senderName = getUsername(data['uid']);
        // socket.username = senderName;
        let from = senderName;
        let to = data['to'];
        let msg = data['msg'];
        private.send_private(from, to, msg, user, socket, io);
    });

    socket.on('update_connect', (data) => {
        private.update_connect(data, user, socket);
    });

    socket.on('join default room', (uid) => {
        socket.join(uid);
    });

    //=====================================

    socket.on('create room', (roomName, clientId) => {
        try {
            // have user info -> use clientId not socket.id
            let newRoomId = createRoom(clientId, roomName);
            let client = user.find(ele => ele.id === clientId);
            client.room.push(newRoomId);
            // emit a msg back to the sender
            socket.emit('new room', { clientName: socket.username, newRoomId: newRoomId, newRoomName: roomList[newRoomId] });
            io.sockets.emit('update room', roomList);
            // console.log(allRoomObj);
            // console.log(roomList);
        } catch (err) {
            console.log(err);
            socket.emit('create room error', socket.username, err);
        }
    });

    socket.on('join room', (clientId, roomId) => {
        // check if the client is already in the room
        let alreadyInRoom = allRoomObj[roomId].client.some(ele => ele === clientId);
        if (!alreadyInRoom) {
            joinRoom(clientId, roomId);
            let client = user.find(ele => ele.id === clientId);
            client.room.push(roomId);
            // emit a msg back to the sender
            socket.emit('join room', { clientName: socket.username, roomId: roomId, roomName: roomList[roomId] });
        } else {
            socket.emit('join room error', "You are already in the room!");
        }
    });

    socket.on('leave room', (clientId, roomId) => {
        let alreadyInRoom = allRoomObj[roomId].client.some(ele => ele === clientId);
        if (alreadyInRoom) {
            leaveRoom(clientId, roomId);
            let client = user.find(ele => ele.id === clientId);
            let roomIndex = client.room.indexOf(roomId);
            client.room.splice(roomIndex, 1);
            // emit a msg back to the sender
            socket.emit('leave room', { clientName: socket.username, roomId: roomId, roomName: roomList[roomId] });
        } else {
            socket.emit('leave room error', "You are not in the room!");
        }

    });

    socket.on('delete room', (clientId, roomId) => {
        let roomName = roomList[roomId];
        try {
            deleteRoom(clientId, roomId);
            let client = user.find(ele => ele.id === clientId);
            let roomIndex = client.room.indexOf(roomId);
            client.room.splice(roomIndex, 1);
            // emit to all clients new roomList -> update room list
            io.sockets.emit('delete room', roomId, roomName, roomList);
        } catch (err) {
            console.log(err);
            // emit a msg back to the sender
            socket.emit('delete room error', err.message);
        }
    })


    // when client sends a new msg
    socket.on('chat message', (data) => {
        socket.broadcast.emit('chat message', { roomId: data.roomId, username: socket.username, message: data.message });
    });
})


//===========================================
// LISTEN ON PORT 3000
//===========================================
http.listen(3000, () => {
    console.log('listening on *:3000');
});

