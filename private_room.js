
// PRIVATE CHAT ROOM CLASS
// create private room when one user click on another user
class PrivateRoom {
    constructor(senderId, receiverId, senderName, receiverName) {
        this.id = senderId + '--' + receiverId; // room ID -> combine clientId of 2 users
        this.name = senderName +' - ' + receiverName;
        this.client = [senderId]; // array of 2 clientId 
        this.quantity = 1;
        this.limit = 2;
    }
    //
    addClient(clientID) {
        if (this.quantity < this.limit) { 
            this.client.push(clientID);
            this.quantity++;
        } else {
            throw new Error('Bạn không thể tham gia phòng này. Đây là phòng riêng giữa hai người dùng.')
        }

    }
}

module.exports = PrivateRoom; 