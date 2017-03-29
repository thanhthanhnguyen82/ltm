# CHAT APPLICATION WITH SOCKET.IO
 Register an account -> Login with the account -> Enter chat room 

## STORE DATA IN SERVER VIA ARRAYS AND OBJECTS:
* allRoomObj = {} : stores all public room objects
```js
    allRoomObj = {
        publicRoomId: {/*room obj instance of class ROOM */},
        publicRoomId1: {...},
        ...
    }
```

* roomList = {} : each key-value pair is roomId: roomName -> used for updating room list in front end
```js
    roomList = {
        publicRoomId: publicRoomName,
        publicRoomId1: publicRoomName1,
        ...
    }
```

* allPrivateRoom = {}: stores all private room objects
```js
    allPrivateRoom = {
        privateRoomId: {/*room obj instance of class PrivateRoom */},
        privateRoomId1: {...},
        ...
    }
```
* user = []:

* token = []: 

## REGISTER/ LOGIN: new users can register username and password. After logging in successful 
* Register

* Authenticate

* Login

* Redirect to chat room by window.location.href -> connect to index.html -> send clientId to server

## PUBLIC ROOM CHAT: Each public room is an instance of class ROOM in **room.js**

```js
    // e.g: in app.js
    const ROOM = require('./room.js');
    const newPublicRoom = new ROOM(roomId, roomName, clientId);
```

* Each room has inherited methods of adding, removing clients to the room.
* In **app.js**, there are 4 public room functions: createRoom, deleteRoom, joinRoom, leaveRoom. In each function, check if there are any error (e.g. params are correctly passed in, rooms exit, clients are already in room or not)

## PRIVATE ROOM CHAT ONLY BETWEEN 2 CLIENTS: Each private room is an instance of class PrivateRoom in **private_room.js**

```js
    // e.g: in app.js
    const PrivateRoom = require('./private_room.js');
    const newPrivateRoom = new ROOM(senderId, receiverId, senderName, receiverName);
```

* Each room has inherited method of adding clients
* In **app.js**, the private room function is createPrivateRoom

## SOCKET.IO EVENTS:
* A client connects to index.html -> emit clientId to server ('send clientId' event) -> server send back room and user list for clients to update in client-side ('user connect' event)
* If a client reloads the page, their existing rooms are kept (no database so no chat history, only room box)
* Clients can create new public chat room (by submit room form) -> emit 'create room' event to server -> server creates new public room instance -> emit back new room data to client ('new room' event) to create new chat box and update room list in client-side, if error ('create room error' event). Similarly, join, leave, delete room events follow the same logic.

* Send private messages to another client by click on 'chat' button in user list
* Emit to server the senderId and receiverId ('send private' event) -> server checks if private room betw  