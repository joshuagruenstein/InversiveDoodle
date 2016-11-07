var img = new Image();
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var points = []
var imageExists = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = window.innerWidth;
canvas.style.height = window.innerHeight;

initCanvas();

function initCanvas() {
    points.push(new DraggablePoint(window.innerWidth/4,window.innerHeight/2)); // Circle center

    var sizingPoint = new DraggablePoint(window.innerWidth/4-80,window.innerHeight/2);
    sizingPoint.color = "#00cdcd";
    points.push(sizingPoint); // Circle radius

    c.addEventListener("mousedown", mouseDownListener, false);

    onPointChange();
}

function onPointChange() {
    // clear screen
    ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0,0,c.width,c.height);

    // draw circle of inversion
    var radius = Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);
    ctx.strokeStyle = "#009900";
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, radius, 0, 2*Math.PI, false);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.stroke();

    if (imageExists) {
        // draw original image
        var aspectRatio = img.height/img.width;
        ctx.drawImage(img, points[2].x, points[2].y, points[3].x-points[2].x, points[3].y-points[2].y);

        // invert image

        // NOTE: CAN'T HANDLE FLIPPING
        var imageData = ctx.getImageData(0,0,c.width,c.height);
        for (var x = Math.round(points[2].x); x < points[3].x; x++) {
            for (var y = Math.round(points[2].y); y < points[3].y; y++) {
                var r = imageData.data[(y*c.width + x)*4];
                var g = imageData.data[(y*c.width + x)*4 + 1];
                var b = imageData.data[(y*c.width + x)*4 + 2];

                var newPoint = invertPoint(points[0].x,points[0].y,radius,x,y);
                var arrayIndex = (newPoint.y*c.width + newPoint.x)*4;
                    if (arrayIndex < imageData.data.length) {
                    imageData.data[arrayIndex] = r;
                    imageData.data[arrayIndex+1] = g;
                    imageData.data[arrayIndex+2] = b;
                }
            }
        } ctx.putImageData(imageData,0,0);
    }

    // draw points
    for (var i=0; i<points.length; i++) {
        points[i].drawToContext(ctx);
    }
}

function invertPoint(circleX, circleY, circleRadius, pointX, pointY) {
    var alpha = Math.pow(circleRadius,2)/(Math.pow(pointX-circleX,2)+Math.pow(pointY-circleY,2));
    return {
        x: Math.round(alpha*(pointX-circleX)+circleX),
        y: Math.round(alpha*(pointY-circleY)+circleY)
    };
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);
function handleFileSelect(evt) {
    var f = evt.target.files[0];

    if (f.type.match('image.*')) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                img = new Image();
                img.onload = function () {
                    var aspectRatio = img.height/img.width;

                    while (points.length > 2) {
                        points.pop();
                        points.pop();
                    }

                    points.push(new DraggablePoint(window.innerWidth/2,window.innerHeight/2-aspectRatio*100)); // Image topleft
                    points.push(new DraggablePoint(window.innerWidth/2+200,window.innerHeight/2+aspectRatio*100)); // Image bottomright
                    imageExists = true;

                    onPointChange();
                } img.src = e.target.result;
            };
        })(f); reader.readAsDataURL(f);
    } else {
        // ERROR
    }
}
