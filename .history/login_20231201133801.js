<script>
      $(document).ready(function () {
        var socket = io();

        $("#login").click(function () {
          let uname = $("#uname").val();
          let pwd = $("#pwd").val();
          socket.emit("login", {
            uname: uname,
            pwd: pwd,
          });
        });

        $("#register").click(function () {
          let uname = $("#regis_uname").val();
          let pwd = $("#regis_pwd").val();
          socket.emit("signup", {
            uname: uname,
            pwd: pwd,
          });
        });

        socket.on("login_succeed", function (data) {
          localStorage.setItem("token", data["data"]["token"]);
          localStorage.setItem("id", data["data"]["id"]);
          alert(data["msg"]);
          let destination = window.location.href + "chat"; // đường dẫn đến trang chat
          window.location.href = destination; // chuyển hướng đường dẫn đến destination
        });

        socket.on("login_failed", function (data) {
          alert(data["msg"]);
        });

        socket.on("signup_success", function (data) {
          alert(data["msg"]);
        });

        socket.on("signup_failed", function (data) {
          alert(data["msg"]);
        });
      });
    </script>