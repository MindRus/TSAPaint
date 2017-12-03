var express = require('express'), app = express(), http = require('http'), socketIo = require('socket.io');
var fs = require('fs');

var server = http.createServer(app);
var socketIO = socketIo.listen(server);
server.listen(8080);

var directory = __dirname.slice(0, -7) + '\\Client';
app.use(express.static(directory));
console.log("The server is started at localhost: 8080");

var serverData = "";
socketIO.on('connection', function (conn)
{
    conn.on('request_data', function (data)
    {
        socketIO.emit('get_server_image_data', serverData);
    });

    conn.on('drawBrush', function (data) {
        serverData = data.imgData;
        socketIO.emit('drawBrush', { line: data.line, c: data.c, w: data.w });
    });

    conn.on('drawLine', function (point1, point2, color, width, imgData) {
        serverData = imgData;
        var data = { line: [point1, point2], c: color, w: width }
        socketIO.emit('drawLine', { line: data.line, c: data.c, w: data.w });
    });

    conn.on('drawRectangle', function (point1, point2, color, width, imgData)
    {
        serverData = imgData;
        socketIO.emit('drawRectangle', { point1, point2, color, width });
    });

    conn.on('drawCircle', function (point1, point2, color, width, imgData)
    {
        serverData = imgData;
        socketIO.emit('drawCircle', { point1, point2, color, width });
    });

    conn.on('cleanEraser', function (data)
    {
        serverData = data.imgData;
        socketIO.emit('cleanEraser', { line: data.line, w: data.w });
    });
});