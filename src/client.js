/**
 * Created by wingerted on 15/3/4.
 */

var SERVER = "127.0.0.1";
var PORT = "1080";
var KEY = "Winger";
var REMOTE_PORT = "8080";
var STAGE_INIT = 0;
var STAGE_AUTHENTICATION = 1;
var STAGE_CONNECT_TO_SERVER = 2;
var STAGE_CONNECT_TO_HOST = 3;
var STAGE_DATA_TO_SERVER = 4;
var STAGE_DATA_TO_HOST = 5;

var net = require('net');
var buffer = require('buffer');


var client = net.createServer(function (host_connection) {

    var stage = STAGE_AUTHENTICATION;
    var server_connection = null;

    host_connection.on("end", function() {
        if (server_connection) {
            server_connection.destroy();
        }

        console.log('shadowsocks client has disconnected with user host');
    });

    host_connection.on("data", function(data) {
        console.log('shadowsocks client get data from user host');

        if (stage === STAGE_AUTHENTICATION) {
            server_connection = net.connect(REMOTE_PORT, SERVER, function () {
                console.log('shadowsocks server is connected');

                handle_data(server_connection, host_connection, data);
            });

            server_connection.on("end", function() {
                host_connection.end();
                console.log('shadowsocks client has disconnected with shadowsocks server');
            });

            server_connection.on("data", function(data) {
                handle_data(server_connection, host_connection, data);

                console.log('shadowsocks client get data from shadowsocks server')
            });

            server_connection.on("error", function(e) {
                console.log('connection of shadowsocks client and server error !');
                console.log(e);
            });
        } else {
            handle_data(server_connection, host_connection, data);
        }

        console.log(data.toString());
    });

    host_connection.on("error", function(e) {
        console.log('connection of shadowsocks client and host error !');
        console.log(e);
    });

    var handle_data = function(server_connection, host_connection, data) {
        console.log("Last State is " + stage);

        switch (stage) {
            case STAGE_AUTHENTICATION:
                host_connection.write(new Buffer([0x05, 0x00]));
                stage = STAGE_CONNECT_TO_SERVER;
                break;
            case STAGE_CONNECT_TO_SERVER:
                server_connection.write(data);
                stage = STAGE_CONNECT_TO_HOST;
                break;
            case STAGE_CONNECT_TO_HOST:
                host_connection.write(data);
                stage = STAGE_DATA_TO_SERVER;
                break;
            case STAGE_DATA_TO_SERVER:
                server_connection.write(data);
                stage = STAGE_DATA_TO_HOST;
                break;
            case STAGE_DATA_TO_HOST:
                host_connection.write(data);
                break;
            default : break;
        }

        console.log("Current State is " + stage);
    };
});

client.listen(PORT, function (){
    console.log('shadowsocks client start listen');
});
