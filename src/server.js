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

    var stage = STAGE_CONNECT_TO_SERVER;
    var server_connection = null;

    host_connection.on("end", function() {
        if (server_connection) {
            server_connection.destroy();
        }

        console.log('shadowsocks client has disconnected with user host');
    });

    host_connection.on("data", function(data) {
        console.log('shadowsocks client get data from user host');

        if (stage === STAGE_CONNECT_TO_SERVER) {
            // Now we get this
            // +----+-----+-------+------+----------+----------+
            // |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
            // +----+-----+-------+------+----------+----------+
            // | 1  |  1  | X'00' |  1   | Variable |    2     |
            // +----+-----+-------+------+----------+----------+


            var remote = parse_header(data);
            server_connection = net.connect(remote.port, remote.address, function () {
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
    });

    host_connection.on("error", function(e) {
        console.log('connection of shadowsocks client and host error !');
        console.log(e);
    });

    var parse_header = function (socks5_header) {
        var ADDRESS_TYPE = {
            IPV4: 1,
            DOMAIN: 3,
            IPV6: 4
        };

        var address, port;
        var address_type = socks5_header[3];

        if (address_type === ADDRESS_TYPE.DOMAIN) {
            var address_length = socks5_header[4];

            address = socks5_header.slice(5, 5 + address_length).toString('binary');
            port = socks5_header.readUInt16BE(5 + address_length);
        } else if (address_type === ADDRESS_TYPE.IPV4) {
            var raw_address = socks5_header.slice(4, 8);

            address = raw_address[0] + '.' +
                      raw_address[1] + '.' +
                      raw_address[2] + '.' +
                      raw_address[3];

            port = socks5_header.readUInt16BE(8);
        }

        return {address:address, port:port};
    };

    var handle_data = function(server_connection, host_connection, data) {
        console.log("Last State is " + stage);

        switch (stage) {
            case STAGE_CONNECT_TO_SERVER:
                var return_buffer = new Buffer(10);
                return_buffer.write("\x05\x00\x00\x01\x00\x00\x00\x00");
                return_buffer.writeUInt16BE(server_connection.localPort, 8);
                host_connection.write(return_buffer);
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

server.listen(PORT, function (){
    console.log('shadowsocks client start listen');
});
