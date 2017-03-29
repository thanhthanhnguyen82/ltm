/**
 * Created by techmaster on 3/24/17.
 */

class User {
	constructor(id, usr, pwd){
		this.id = id;
		this.username = usr;
		this.password = pwd;
		this.friend = {};
		this.room = []; // all public rooms they are in
	}
}

class Token{
	constructor(id, token){
		this.id = id;
		this.token = token;
	}
}

module.exports.User = User;
module.exports.Token = Token;