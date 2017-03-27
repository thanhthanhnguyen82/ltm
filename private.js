
function getUser(username,list){
	let n = list.length;
	for(let i = 0; i < n;i++){
		if(list[i]['username'] === username) return list[i];
	}
}

//return true if they are already connected 
function check_connect_exist(reiceiverId,listPrivate){
	for(let temp in listPrivate){
		return temp === reiceiverId ? listPrivate[temp] : '';
	}
}

function send_private( uname , pid , msg ){
	io.to(pid).emit('get_private_msg',{
		'sender' : uname,
		'msg' : msg
	});
}

function con_private(u1,u2,socket){
	let id1 = u1['id'];
	let id2 = u2['id'];
	let pid = id1 + id2;
	u1['privates'][id2] = pid;
	socket.join(pid);
	socket.broadcast.to(id2).emit('update_connect',{
		'reiceverName' : u2['username'],
		'pid' : pid,
		'senderId' : id1 
	});
}

// run
function private(senderName,receiverName,msg,list,socket){
	let sender = getUser(senderName,list);
	let receiver = getUser(receiverName,list);
	let pid = check_connect_exist(receiver['id'],sender['privates']);
	if (!pid){
        con_private(sender,receiver,socket);
	}
    send_private(senderName,pid,msg);
}

function update_connect(data,list,socket){
    let user = getUser(data['reiceverName'],list);
    user['privates'][data['senderId']] = data['pid'];
    socket.join(data['pid']);
}

exports.send_private = private;
exports.update_connect = update_connect;

