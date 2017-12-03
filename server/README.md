# TSAPaint: server documentation

## Functions
|Function|Parametres|Description|
|:---|:---:|:---|
|__conn.on('request_data')__| *imgData* | Get current canvas to all new client connections. *imgData* is a string with current canvas to keep it on server.|  
|__conn.on('drawBrush')__| *line*, *color*, *width*, *imgData* | Lines array is used for "Brush tool", where *line* discretisizes to straightforward segments, which added to array lines.|  
|__conn.on('drawLine')__| *point1*, *point2*, *color*, *width*, *imgData* | Two points are used for "Line tool". *point1* is the start of a segment, when *point2* is the end.|  
|__conn.on('drawRectangle')__| *point1*, *point2*, *color*, *width*, *imgData* | Two points are used for "Rectangle tool". *point1* and *point2* are left top corner and right bottom corners.|  
|__conn.on('drawCircle')__| *point1*, *point2*, *color*, *width*, *imgData* | Two points are used for "Circle tool". *point1* is the center of a circle and *point2* is the end of the radius.| 
|__conn.on('cleanEraser')__| *line*, *width*, *imgData* | Line array is used for "Eraser tool" Start- and end-point of each segment is used for clearRect() function and delete canvas within it.|  