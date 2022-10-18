const net = require("net");

const server = net.createServer();

server.on("connection", (clientToProxySocket) => {
  clientToProxySocket.once("data", (data) => {
    const isTLS = data.toString().indexOf("CONNECT") !== -1;
    let address;
    let port = 80;

    if (isTLS) {
      port = data.toString().split("CONNECT ")[1].split(" ")[0].split(":")[1];
      address = data.toString().split("CONNECT ")[1].split(" ")[0].split(":")[0];
    } else address = data.toString().split("Host: ")[1].split("\r\n")[0];

    console.log(address);

    let proxyToServerSocket = net.createConnection(
      {
        host: address,
        port: port
      },
      () => {
        if (isTLS) clientToProxySocket.write("HTTP/1.1 200 OK\r\n\n");
        else proxyToServerSocket.write(data);

        clientToProxySocket.pipe(proxyToServerSocket);
        proxyToServerSocket.pipe(clientToProxySocket);

        proxyToServerSocket.on("error", (err) => console.log(err));
      }
    );

    clientToProxySocket.on("error", (err) => console.log(err));
  });
});

server.on("error", (err) => console.log(err));
server.on("close", () => console.log("Disconnected"));
server.listen(8080, () => console.log("Server is running at http://localhost:8080"));
