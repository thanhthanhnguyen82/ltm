const shortid = require('shortid');
const User = require('./user.js').User;
const Token = require('./user.js').Token;

function auth(io, socket, users, tokens) {
    function checkRegis(name, list) {
        let n = list.length;
        for (let i = 0; i < n; i++) {
            if (list[i]['username'] === name) return false;
        }
        return true;
    }

    function checkLogin(name, pwd, list) {
        let n = list.length;
        for (let i = 0; i < n; i++) {
            if (list[i]['username'] === name && list[i]['password'] === pwd) return list[i];
        }
        return false;
    }

    function isUserLoggedIn(userId, tokens) {
        return tokens.some(token => token.userId === userId);
    }

    function Register(uname, pwd, list) {
        if (checkRegis(uname, list)) {
            let id = shortid.generate();
            let user = new User(id, uname, pwd);
            list.push(user);
            return true;
        } else {
            return false;
        }
    }

    function Login(uname, pwd, list) {
        let user = checkLogin(uname, pwd, list);
        if (user) {
            if (!isUserLoggedIn(user.id, tokens)) {
                let idToken = shortid.generate();
                let token = new Token(user.id, idToken);
                tokens.push(token);
                socket.username = uname;
                socket.join(user.id);
                return token;
            } else {
                return { error: 'Tài khoản này đã đăng nhập từ một nơi khác.' };
            }
        } else {
            return { error: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
        }
    }

    socket.on('signup', (data) => {
        let stat = Register(data['uname'], data['pwd'], users);
        if (stat) socket.emit('signup_success', { 'msg': 'Đăng kí thành công' });
        else socket.emit('signup_failed', { 'msg': 'Đăng kí thất bại' });
    });

    socket.on('login', (data) => {
        let result = Login(data['uname'], data['pwd'], users);
        if (result.error) socket.emit('login_failed', { 'msg': result.error });
        else socket.emit('login_succeed', { 'msg': 'Đăng nhập thành công', 'data': result });
    });
}

exports.auth = auth;
