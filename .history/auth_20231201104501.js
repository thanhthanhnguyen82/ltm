const shortid = require("shortid");
const User = require("./user.js").User;
const Token = require("./user.js").Token;

function auth(socket, users, tokens) {
  function checkRegis(name, list) {
    let n = list.length;
    for (let i = 0; i < n; i++) {
      if (list[i]["username"] === name) return false;
    }
    return true;
  }

  function checkLogin(name, pwd, list) {
    let n = list.length;
    for (let i = 0; i < n; i++) {
      if (list[i]["username"] === name && list[i]["password"] === pwd) {
        list[i]["isActive"] = true;
        return list[i]["id"];
      }
    }
    return false;
  }

  function checkActive(uname, list) {
    let n = list.length;
    for (let i = 0; i < n; i++) {
      if (list[i]["username"] === uname) {
        console.log(list[i]["isActive"]);
        if (list[i]["isActive"] === true) return true;
      } // tk dang dc login
    }
    return false; // tk chưa login
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
    let temp = checkLogin(uname, pwd, list);
    let isActive = checkActive(uname, list);
    if (isActive === true) {
      return false;
    }
    if (temp) {
      let idToken = shortid.generate();
      let token = new Token(temp, idToken);
      tokens.push(token);
      socket.username = uname;
      socket.join(temp);
      return token;
    } else return false;
  }

  function Logout(token) {
    // Lọc danh sách token để tìm token cần đăng xuất
    let index = tokens.findIndex((t) => t.token === token);

    if (index !== -1) {
      // Xóa token khỏi danh sách tokens
      tokens.splice(index, 1);
      return true;
    } else {
      return false; // Token không hợp lệ hoặc đã được đăng xuất trước đó
    }
  }

  socket.on("signup", (data) => {
    let stat = Register(data["uname"], data["pwd"], users);
    if (stat)
      socket.emit("signup_success", {
        msg: "Register succeed",
      });
    else
      socket.emit("signup_failed", {
        msg: "Register failed",
      });
  });

  socket.on("login", (data) => {
    let temp = Login(data["uname"], data["pwd"], users);
    if (temp)
      socket.emit("login_succeed", {
        msg: "Login succeed",
        data: temp,
      });
    else
      socket.emit("login_failed", {
        msg: "Login failed",
      });
  });
}

exports.auth = auth;
