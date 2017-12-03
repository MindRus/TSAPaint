document.addEventListener("DOMContentLoaded", function () {
    var mouse = { click: false, move: false, pos: { x: 0, y: 0 }, pos_start: { x: 0, y: 0 }, pos_prev: false };
    var canvasDrawing = document.getElementById('cDrawing');
    var canvasEvent = document.getElementById('cEvent');

    var context = canvasDrawing.getContext('2d');
    var contextEvent = canvasEvent.getContext('2d');
    var imageData;
    var width = parseInt(canvasDrawing.getAttribute('width'));
    var height = parseInt(canvasDrawing.getAttribute('height'));
    var currentTool = 'brush';
    var currentColor = '#000000';
    var currentSize = 15;
    var conn = io.connect();

    conn.on('get_server_image_data', function (data) {
        imageData = data;
        var image = document.createElement("img");
        image.setAttribute("src", imageData);
        var timeout = setTimeout(function () {
            context.drawImage(image, 0, 0);
        }, 200);
    });

    conn.emit('request_data', imageData);
    imageData = canvasDrawing.toDataURL('png', 1);

    function toolChanged(event) {
        currentTool = event.target.getAttribute('data');
        var listOfTools = [];
        listOfTools = document.getElementsByClassName('tool');
        for (var i = 0; i < listOfTools.length; i++) {
            if (listOfTools[i].classList.contains('current'))
                listOfTools[i].setAttribute('class', listOfTools[i].getAttribute('class').slice(0, -8));
        }
        var currentToolElement = document.getElementById(currentTool);
        currentToolElement.setAttribute('class', currentToolElement.getAttribute('class') + ' current');
    }

    document.getElementById('brush').addEventListener("click", toolChanged);
    document.getElementById('line').addEventListener("click", toolChanged);
    document.getElementById('rect').addEventListener("click", toolChanged);
    document.getElementById('circle').addEventListener("click", toolChanged);
    document.getElementById('eraser').addEventListener("click", toolChanged);

    var listOfSizes = [];
    listOfSizes = document.getElementsByName('thickness');
    for (var i = 0; i < listOfSizes.length; i++) {
        listOfSizes[i].addEventListener('click', (event) => { currentSize = event.target.value; })
    }

    document.getElementById('color').addEventListener('blur', (event) => { currentColor = event.target.value; })

    canvasEvent.onmousedown = function (e) {
        mouse.click = true;
        mouse.pos_start.x = e.offsetX;
        mouse.pos_start.y = e.offsetY;
    };

    canvasEvent.onmouseup = function (e) {
        mouse.click = false;
        imageData = canvasDrawing.toDataURL('png', 1);
        canvasEvent.width = canvasEvent.width;

        switch (currentTool) {
            case 'line':
                {
                    canvasEvent.width = canvasEvent.width;
                    drawLine({
                        line: [mouse.pos_start, mouse.pos],
                        c: currentColor,
                        w: currentSize
                    }, context);
                    conn.emit('drawLine', { x: mouse.pos_start.x, y: mouse.pos_start.y }, { x: mouse.pos.x, y: mouse.pos.y }, currentColor, currentSize, imageData);
                    break;
                }
            case 'rect':
                {
                    drawRect(context,
                        { x: mouse.pos_start.x, y: mouse.pos_start.y },
                        { x: mouse.pos.x, y: mouse.pos.y },
                        canvasEvent,
                        currentColor,
                        currentSize
                    );
                    imageData = canvasDrawing.toDataURL('png', 1);
                    conn.emit('drawRectangle', { x: mouse.pos_start.x, y: mouse.pos_start.y }, { x: mouse.pos.x, y: mouse.pos.y }, currentColor, currentSize, imageData);
                    break;
                }
            case 'circle':
                {
                    drawCircle(context,
                        { x: mouse.pos_start.x, y: mouse.pos_start.y },
                        { x: mouse.pos.x, y: mouse.pos.y },
                        canvasEvent,
                        currentColor,
                        currentSize
                    );
                    imageData = canvasDrawing.toDataURL('png', 1);
                    conn.emit('drawCircle', { x: mouse.pos_start.x, y: mouse.pos_start.y }, { x: mouse.pos.x, y: mouse.pos.y }, currentColor, currentSize, imageData);
                    break;
                }
        }
    };

    canvasEvent.onmousemove = function (e) {
        mouse.pos.x = e.offsetX;
        mouse.pos.y = e.offsetY;
        mouse.move = true;
        if (!mouse.click) return;
        contextEvent.fillStyle = currentColor;
        switch (currentTool) {
            case 'line':
                {
                    canvasEvent.width = canvasEvent.width;
                    drawLine({
                        line: [mouse.pos_start, mouse.pos],
                        c: currentColor,
                        w: currentSize
                    }, contextEvent);
                    break;
                }
            case 'rect':
                {
                    drawRect(contextEvent,
                        { x: mouse.pos_start.x, y: mouse.pos_start.y },
                        { x: mouse.pos.x, y: mouse.pos.y },
                        canvasEvent,
                        currentColor,
                        currentSize
                    );
                    break;
                }
            case 'circle':
                {
                    drawCircle(contextEvent,
                        { x: mouse.pos_start.x, y: mouse.pos_start.y },
                        { x: mouse.pos.x, y: mouse.pos.y },
                        canvasEvent,
                        currentColor,
                        currentSize
                    );
                    break;
                }
        }
    };

    var drawRect = function (ctx, point1, point2, layerReset, color, size) {
        context.lineCap = "square";
        context.lineJoin = "miter";

        layerReset.width = layerReset.width;
        ctx.beginPath();
        if (size) {
            ctx.lineWidth = size;
        }
        if (color) {
            ctx.strokeStyle = color;
        }
        ctx.rect(point1.x, point1.y, point2.x - point1.x, point2.y - point1.y);
        ctx.stroke();

        context.lineCap = "round";
        context.lineJoin = "round";
    }

    var drawCircle = function (ctx, point1, point2, layerReset, color, size) {
        layerReset.width = layerReset.width;
        ctx.beginPath();
        if (size) {
            ctx.lineWidth = size;
        }
        if (color) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
        }
        var r = Math.sqrt((point2.x - point1.x) * (point2.x - point1.x) + (point2.y - point1.y) * (point2.y - point1.y));
        ctx.arc(point1.x, point1.y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    var drawLine = function (data, context) {
        var line = data.line;
        context.beginPath();
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = data.c;
        context.lineWidth = data.w;
        context.moveTo(line[0].x, line[0].y);
        context.lineTo(line[1].x, line[1].y);
        context.stroke();
        context.lineWidth = currentSize;
        context.strokeStyle = currentColor;
    };

    conn.on('drawBrush', function (data) {
        drawLine(data, context);
        context.lineWidth = currentSize;
        context.strokeStyle = currentColor;
    });

    conn.on('cleanEraser', function (data) {
        var line = data.line;
        context.clearRect(line[0].x - data.w / 2, line[0].y - data.w / 2, data.w, data.w);
        context.lineWidth = currentSize;
        context.strokeStyle = currentColor;
    });

    conn.on('drawRectangle', function (data) {
        drawRect(context,
            { x: data.point1.x, y: data.point1.y },
            { x: data.point2.x, y: data.point2.y },
            canvasEvent,
            data.c,
            data.w
        );
        context.lineWidth = currentSize;
        context.strokeStyle = currentColor;
    });

    conn.on('drawCircle', function (data) {
        drawCircle(context,
            { x: data.point1.x, y: data.point1.y },
            { x: data.point2.x, y: data.point2.y },
            canvasEvent,
            data.c,
            data.w
        );
        context.lineWidth = currentSize;
        context.strokeStyle = currentColor;
    });

    conn.on('drawLine', function (data) {
        drawLine(data, context);
        context.lineWidth = currentSize;
        context.strokeStyle = currentColor;
    });

    function mainLoop() {
        switch (currentTool) {
            case 'brush':
                {
                    if (mouse.click && mouse.move && mouse.pos_prev) {
                        imageData = canvasDrawing.toDataURL('png', 1);
                        conn.emit('drawBrush', { line: [mouse.pos, mouse.pos_prev], imageCanvasData: imageData, c: currentColor, w: currentSize });
                        mouse.move = false;
                    }
                    break;
                }
            case 'eraser': {
                if (mouse.click && mouse.move && mouse.pos_prev) {
                    imageData = canvasDrawing.toDataURL('png', 1);
                    conn.emit('cleanEraser', { line: [mouse.pos, mouse.pos_prev], imageCanvasData: imageData, w: currentSize });
                    mouse.move = false;
                }
                break;
            }
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        setTimeout(mainLoop, 25);
    }
    mainLoop();
});