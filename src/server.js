/**
 * Created by wingerted on 15/3/4.
 */

var SERVER = 'www.baidu.com';
var PORT = "8080";
var KEY = "Winger";
var REMOTE_PORT = "80";
var STAGE_INIT = 0;
var STAGE_CONNECT_TO_SERVER = 2;
var STAGE_CONNECT_TO_HOST = 3;
var STAGE_DATA_TO_SERVER = 4;
var STAGE_DATA_TO_HOST = 5;

var net = require('net');
var buffer = require('buffer');


var server = net.createServer(function (host_connection) {

    var stage = STAGE_INIT;

    host_connection.on("end", function() {
        console.log('shadowsocks client has disconnected with user host');
    });

    host_connection.on("data", function(data) {
        console.log('shadowsocks client get data from user host');
        check_stage(data);

        if (stage == STAGE_CONNECT_TO_SERVER) {
            var server_connection = net.connect(REMOTE_PORT, SERVER, function () {
                console.log('shadowsocks server is connected');

                var return_buffer = new Buffer(10);
                return_buffer.write("\x05\x00\x00\x01\x00\x00\x00\x00");

                return_buffer.writeUInt16BE(server_connection.localPort, 8);

                host_connection.write(return_buffer);
            });
        }


        server_connection.on("end", function() {
            console.log('shadowsocks client has disconnected with shadowsocks server');
        });

        server_connection.on("data", function(data) {
            check_stage(data);

            handle_data(data);
            console.log('shadowsocks client get data from shadowsocks server')
        });

        server_connection.on("error", function() {
            console.log('connection of shadowsocks client and server error !');
        });

        handle_data(data);
        //console.log(data.toString());
    });

    host_connection.on("error", function() {
        console.log('connection of shadowsocks client and host error !');
    });

    var check_stage = function(data) {
        switch (stage) {
            case STAGE_INIT:
                if (data[0] == 5 && data[1] == 1 && data[2] == 0) {
                    stage = STAGE_CONNECT_TO_SERVER;
                }
                break;
            case STAGE_CONNECT_TO_SERVER:
                stage = STAGE_DATA_TO_SERVER;
                break;
            case STAGE_DATA_TO_SERVER:
                stage = STAGE_DATA_TO_HOST;
                break;
            case STAGE_DATA_TO_HOST:
                //stage = STAGE_DATA_TO_SERVER;
                break;
            default : break;
        }

        console.log("Current State is " + stage);
    };

    var handle_data = function(data) {
        switch (stage) {
            case STAGE_CONNECT_TO_SERVER:
                break;
            case STAGE_CONNECT_TO_HOST:
                //host_connection.write(data);
                break;
            case STAGE_DATA_TO_SERVER:
                server_connection.write(data);
                break;
            case STAGE_DATA_TO_HOST:
                host_connection.write(data);
                break;
            default : break;
        }
    };

});




server.listen(PORT, function (){
    console.log('shadowsocks client start listen');
});
