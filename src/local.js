/**
 * Created by wingerted on 15/3/4.
 */

var SERVER = "127.0.0.1";
var PORT = "1080";
var KEY = "Winger";
var REMOTE_PORT = "1080";
var STATE_AUTHENTICATION = 1;

var net = require('net');

var client = net.createServer(function (host_connection) {

    console.log('shadowsocks client has connected by user host');

    host_connection.on("end", function() {console.log('shadowsocks client has disconnected with user host')});

    host_connection.on("data", function(data) {

        console.log('shadowsocks client get data from user host');
        client.check_state(data);
        console.log(data.toString());
    });

    host_connection.on("error", function() {console.log('shadowsocks client error !')});
});

client.state = STATE_AUTHENTICATION;

client.check_state = function(data) {
    
    console.log("Current State is " + this.state);
};

client.listen(PORT, function (){
    console.log('shadowsocks client start listen');
});





var server = net.createConnection(REMOTE_PORT, SERVER, function (server_connection) {
    console.log('shadowsocks server is connected');
    //server.write('1sdoufhasdflasdj');

    server.on("end", function() {console.log('shadowsocks server has disconnected with user host')});

    server.on("data", function() {console.log('shadowsocks server get data from user host')});

    server.on("error", function() {console.log('shadowsocks server error !')});
});



//server.connect(REMOTE_PORT, SERVER);