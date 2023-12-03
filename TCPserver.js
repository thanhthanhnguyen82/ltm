const net = require("net");
const fs = require("fs");

function handleRequest(url, socket) {
  let filePath;
  if (url === "/") {
    filePath = "views/login.html";
  } else if (url === "/chat") {
    filePath = "views/index.html";
  } else {
    filePath = null;
  }

  if (filePath) {
    const readableStream = fs.createReadStream(filePath, "utf8");

    // Phản hồi HTTP 200 OK
    socket.write("HTTP/1.1 200 OK\r\n");

    // Phần tiêu đề HTTP Content-Type
    socket.write("Content-Type: text/html\r\n");

    // Phần tiêu đề HTTP Content-Length (độ dài của nội dung)
    readableStream.on("data", (chunk) => {
      socket.write(`Content-Length: ${Buffer.from(chunk).length}\r\n\r\n`);
    });

    // Pipe dữ liệu từ ReadableStream đến socket
    readableStream.pipe(socket, { end: true });
  } else {
    // Phản hồi HTTP 404 Not Found
    socket.write("HTTP/1.1 404 Not Found\r\n\r\nPage not found");
    socket.end();
  }
}

const server = net.createServer((socket) => {
  console.log("Client connected.");

  socket.on("data", (data) => {
    const request = data.toString();
    const tokens = request.split(" ");
    const method = tokens[0];
    const url = tokens[1];

    switch (method.toUpperCase()) {
      case "GET":
        handleRequest(url, socket);
        break;
      default:
        socket.end();
        break;
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected.");
  });
});

server.listen(3001, () => {
  console.log("TCP server listening on port 3001");
});
