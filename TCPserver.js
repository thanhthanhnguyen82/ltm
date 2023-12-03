const net = require("net");
const socketIO = require("socket.io");
const fs = require("fs");

// Xử lý yêu cầu HTTP
function handleRequest(request) {
  // Đọc nội dung từ các tệp HTML, CSS và JavaScript
  const htmlContent = fs.readFileSync("views/login.html", "utf8");
  // Tạo phản hồi HTTP chứa nội dung các tệp
  const response = `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n${htmlContent}`;
  return response;
}
// Xử lý yêu cầu HTTP
function handleRequestChat(request) {
  // Đọc nội dung từ các tệp HTML, CSS và JavaScript
  const htmlContent = fs.readFileSync("views/index.html", "utf8");
  // Tạo phản hồi HTTP chứa nội dung các tệp
  const response = `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n${htmlContent}`;
  return response;
}
// Tạo server sử dụng net
const server = net.createServer((socket) => {
  console.log("Client connected.");
  // Đọc dữ liệu từ khách hàng
  socket.on("data", (data) => {
    const request = data.toString();
    // Xử lý yêu cầu
    const tokens = request.split(" ");
    const method = tokens[0];
    const url = tokens[1];
    console.log(url);
    switch (method.toUpperCase()) {
      case "GET":
        if (url == "/") {
          const response = handleRequest(request);
          if (!response) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\nPage not found");
          }
          socket.write(response);
        }
        if (url == "/chat") {
          const response = handleRequestChat(request);
          if (!response) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\nPage not found");
          }
          socket.write(response);
        }

      default:
        socket.end();
        break;
    }
  });

  // Xử lý khi kết nối bị đóng
  socket.on("end", () => {
    console.log("Client disconnected.");
  });
});
// Khởi động server net
server.listen(3001, () => {
  console.log("TCP server listening on port 3000");
});
