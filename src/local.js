/**
 * Created by wingerted on 15/3/4.
 */

var SERVER = "127.0.0.1";
var PORT = "1080";
var KEY = "Winger";
var REMOTE_PORT = "1080";
var STATE_INIT = 0;
var STATE_AUTHENTICATION = 1;
var STATE_CONNECT_TO_SERVER = 2;
var STATE_CONNECT_TO_HOST = 3;
var STATE_DATA_TO_SERVER = 4;
var STATE_DATA_TO_HOST = 5;

var net = require('net');
var buffer = require('buffer');


var client = net.createServer(function (host_connection) {

    server_connection.on("end", function() {
        console.log('shadowsocks client has disconnected with shadowsocks server');
    });

    server_connection.on("data", function(data) {
        client.check_state(data);
        //handle_data(data);
        console.log('shadowsocks client get data from shadowsocks server')
    });

    server_connection.on("error", function() {
        console.log('connection of shadowsocks client and server error !');
    });

    host_connection.on("end", function() {
        client.state = STATE_INIT;
        console.log('shadowsocks client has disconnected with user host');
    });

    host_connection.on("data", function(data) {
        console.log('shadowsocks client get data from user host');
        client.check_state(data);
        handle_data(data);
        console.log(data.toString());
    });

    host_connection.on("error", function() {
        console.log('connection of shadowsocks client and host error !');
    });

    var handle_data = function(data) {
        switch (client.state) {
            case STATE_AUTHENTICATION:
                host_connection.write(new Buffer([0x05, 0x00]));
                break;
            case STATE_CONNECT_TO_SERVER:
                //server_connection.write(data);
                break;
            case STATE_CONNECT_TO_HOST:
                host_connection.write(data);
                break;
            case STATE_DATA_TO_SERVER:
                //server_connection.write(data);
                break;
            case STATE_DATA_TO_HOST:
                host_connection.write(data);
                break;
            default : break;
        }
    };

});

var server_connection = net.connect(REMOTE_PORT, SERVER, function () {
    console.log('shadowsocks server is connected');
});


client.state = STATE_INIT;

client.check_state = function(data) {
    switch (client.state) {
        case STATE_INIT:
            if (data[0] == 5) {
                client.state = STATE_AUTHENTICATION;
            }
            break;
        case STATE_AUTHENTICATION:
            if (data[0] == 5 && data[1] == 1 && data[2] == 0) {
                client.state = STATE_CONNECT_TO_SERVER;
            }
            break;
        case STATE_CONNECT_TO_SERVER:
            if (data[0] == 5 && data[1] == 1 && data[2] == 0) {
                client.state = STATE_CONNECT_TO_HOST;
            }
            break;
        case STATE_CONNECT_TO_HOST:
            client.state = STATE_DATA_TO_SERVER;
            break;
        case STATE_DATA_TO_SERVER:
            client.state = STATE_DATA_TO_HOST;
            break;
        case STATE_DATA_TO_HOST:
            //client.state = STATE_DATA_TO_SERVER;
            break;
        default : break;
    }

    console.log("Current State is " + this.state);
};

client.listen(PORT, function (){
    console.log('shadowsocks client start listen');
});
