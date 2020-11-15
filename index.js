var express = require("express");
var app = express();
var net = require('net');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 5000;

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

var humid = 0, temp = 0, dust = 0;
var esp_array = [];

const server = require("http").Server(app);
const io = require("socket.io")(server);

// Server handling request of UI of socket io web app
server.listen(port, () => {
    console.log("Server running on port " + port);
});

app.get("/", function (req, res) {
    res.render("./home.ejs");
});

io.on('connection', (socket) => {
    console.log("Have connection from : " + socket.id);

    socket.on("disconnect", function () {
        console.log("Disconnect from : " + socket.id);
    });

    socket.on("control-pin", (data) => {
        let pin = data.pin;
        let state  = data.state;
        console.log(`pin = ${pin} have state = ${state}`);
        esp_array.forEach(e => {
            if(e.username == 'useruser') {
                e.write(`pin${pin}:${state}}`);
            }
        })
    });

})

// Configuration parameters for server TCP handling ESP32 connection
const HOST = '0.0.0.0';
const PORT = 6789;

// Create Server instance to handle ESP32
const server_raw = net.createServer(onClientConnected);

server_raw.listen(PORT, HOST, function () {
    console.log('server listening on %j', server_raw.address());
});

function onClientConnected(sock) {
    sock.setKeepAlive(true, 30000); //0.5 min = 30000 milliseconds.

    console.log('Embedded client connected');
    sock.on('data', function (data) {
        let verify = data.slice(0, 16) + ''; // Xac minh dung esp32, co the kiem "id" cua esp32 de xac minh nguoi so huu esp
        if('Hello from ESP32' == verify) {
            if(sock.username != 'useruser') {
                sock.username = 'useruser';
                esp_array.push(sock);
            }
        } else if (data.slice(0, 7) == '{ node:') { // cap nhat gia tri cam bien cho front-end
            io.sockets.emit('sensor-values', {humid: 50, temp: 29, dust: 0.1});
        } else if (data.slice(0, 6) == '{ pin:') { // cap nhat gia tri cua cac pin device tren esp32
            io.sockets.emit('status-of-pins', {pin1: 1, pin2: 1});
        }
    });
    sock.on('close', function (error) {
        let i = esp_array.indexOf(sock);
        esp_array.splice(i, 1);
        console.log('Socket closed!');
        if (error) {
            console.log('Socket was closed coz of transmission error');
        }
    });

    sock.on('error', function (error) {
        let i = esp_array.indexOf(sock);
        esp_array.splice(i, 1);
        if (error) {
            console.log('Socket was closed coz of transmission error');
        }
    });
    sock.on('timeout', function () {
        console.log('Connection  time out');
    });
};