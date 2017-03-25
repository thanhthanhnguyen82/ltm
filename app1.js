const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');
const ROOM = require('./room.js');


// Routing: 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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
const createRoom = (clientID, roomName, roomID) => {
    // check if both params are passed into
    if (typeof clientID === 'undefined' || typeof roomName === 'undefined') {
        throw new Error('Error: params are undefined');
    } else {
        // let roomID = shortid.generate();
        let newRoom = new ROOM(roomID, roomName, clientID);
        //console.log(room1);
        newRoom.addClient(clientID);
        allRoomObj[roomID] = newRoom;
        roomList[roomID] = roomName;
    }
}

// console.log('check create room function');
// createRoom('fake clientID 1', 'test room 1', 'fake roomID 1');
// createRoom('fake clientID 2', 'test room 2', 'fake roomID 2');
// createRoom('fake clientID 3', 'test room 3', 'fake roomID 3');
// // createRoom('test room 2');
// console.log(allRoomObj);

/**
 * Delete a room function
 * @param {*} clientID 
 * @param {*} roomID 
 */
const deleteRoom = (clientID, roomID) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined') {
        throw new Error('Error: params are undefined');
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

// console.log('check delete room function');
// deleteRoom('fake clientID 2', 'fake roomID 1000');
// deleteRoom('fake clientID 2', 'fake roomID 1');
// deleteRoom('fake clientID 1', 'fake roomID 1');
// console.log(allRoomObj);

/**
 * Clients join Room function -> add clients to room
 * @param {*} clientID 
 * @param {*} roomID 
 */
const joinRoom = (clientID, roomID) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined') {
        throw new Error('Error: params are undefined');
    } else if (allRoomObj[roomID] === undefined) {
        throw new Error('Error: Room does not exist !!');
    } else {
        let room = allRoomObj[roomID];
        room.addClient(clientID);
    }
}

// console.log('check joinRoom func');
// joinRoom('fake clientID 21', 'fake roomID 2');
// console.log(allRoomObj);

/**
 * Clients leave rooms function -> remove clients from room
 * @param {*} clientID 
 * @param {*} roomID
 */
const leaveRoom = (clientID, roomID) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined') {
        throw new Error('Error: params are undefined');
    } else if (allRoomObj[roomID] === undefined) {
        throw new Error('Error: Room does not exist !!');
    } else {
        let room = allRoomObj[roomID];
        room.removeClient(clientID);
    }
}
// console.log('check leaveRoom func');
// leaveRoom();
// leaveRoom('fake clientID 21', 'fake roomID 2');
// console.log(allRoomObj);

/**
 * Clients change the room's name -> only allow the room's creator to change name
 * @param {*} clientID 
 * @param {*} roomID 
 * @param {*} newRoomName 
 */

const changeRoomName = (clientID, roomID, newRoomName) => {
    if (typeof clientID === 'undefined' || typeof roomID === 'undefined' || typeof newRoomName === 'undefined') {
        throw new Error('Error: params are undefined');
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

// console.log('check changeRoomName func');
// changeRoomName('fake clientID 3', 'fake roomID 3', 'new room name 3');
// console.log(allRoomObj);
// console.log(roomList);

//==============================================
// SOCKET.IO EVENTS
//==============================================
const main = io.on('connection', (socket) => {
    /*
    ......................
    */

    socket.on('create_room', (roomName) => {
        try {
            let clientID = socket.id;
            createRoom(clientID, roomName);
            socket.emit('new_room',roomName);
            io.sockets.emit('update_rooms', roomList);
            console.log(allRoomObj);
            console.log(roomList);
        } catch (err) {
            console.log(err);
            socket.emit('create_room_error', err);
        }
        
        // TODO: update room list of users

        // emit to all clients new roomList -> update room list
        io.sockets.emit('create_room', roomList);
    });

    socket.on('delete room', (clientID, roomID) => {
        deleteRoom(clientID, roomID);
        // TODO: update room list of users
        
        // emit to all clients new roomList -> update room list
        io.sockets.emit('delete room', roomList);
    })
})
//===========================================
// LISTEN ON PORT 3000
//===========================================
http.listen(3000, () => {
    console.log('listening on *:3000');
});

