/**
 * Created by wingerted on 15/3/4.
 */

var SERVER = "127.0.0.1";
var PORT = "1080";
var KEY = "Winger";
var REMOTE_PORT = "1080";
var STATE_AUTHENTICATION = 1;
var STATE_CONNECT = 2;

var net = require('net');
var buffer = require('buffer');

var client = net.createServer(function (host_connection) {

    console.log('shadowsocks client has connected by user host');

    host_connection.on("end", function() {console.log('shadowsocks client has disconnected with user host')});

    host_connection.on("data", function(data) {

        console.log('shadowsocks client get data from user host');
        client.check_state(data);
        client.handle_data(host_connection, data);
        console.log(data.toString());
    });

    host_connection.on("error", function() {console.log('shadowsocks client error !')});
});

client.state = STATE_AUTHENTICATION;

client.handle_data = function(host_connection, data) {
    switch (client.state) {
        case STATE_CONNECT:
            host_connection.write(new Buffer([0x05, 0x00]));
        case STATE_CONNECT:

    }
};


client.check_state = function(data) {
    switch (client.state) {
        case STATE_AUTHENTICATION:
            if (data[0] == 5) {
                client.state = STATE_CONNECT;
            }
            break;
        case STATE_CONNECT:
            if (data[0] == 5 && data[1] == 1 && data[2] == 0) {
                var connect_address = data.slice(4, 7);
                var connect_port = data.slice(8, 9);

            }
            break;
    }

    console.log("Current State is " + this.state);
};

client.listen(PORT, function (){
    console.log('shadowsocks client start listen');
});





var server = net.createConnection(REMOTE_PORT, SERVER, function (server_connection) {
    console.log('shadowsocks server is connected');

    server.on("end", function() {console.log('shadowsocks server has disconnected with user host')});

    server.on("data", function() {console.log('shadowsocks server get data from user host')});

    server.on("error", function() {console.log('shadowsocks server error !')});
});



//server.connect(REMOTE_PORT, SERVER);