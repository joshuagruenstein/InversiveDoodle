var img = new Image;
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var points = []

var dragIndex;
var dragging;
var mouseX;
var mouseY;
var dragHoldX;
var dragHoldY;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = window.innerWidth;
canvas.style.height = window.innerHeight;


function initCanvas() {
    points.push(new DraggablePoint(window.innerWidth/4,window.innerHeight/2)); // Circle center

    var sizingPoint = new DraggablePoint(window.innerWidth/4-80,window.innerHeight/2);
    sizingPoint.color = "#00cdcd";
    points.push(sizingPoint); // Circle radius

    var aspectRatio = img.height/img.width;
    points.push(new DraggablePoint(window.innerWidth/2,window.innerHeight/2-aspectRatio*100)); // Image topleft
    points.push(new DraggablePoint(window.innerWidth/2+200,window.innerHeight/2+aspectRatio*100)); // Image bottomright

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
            imageData.data[arrayIndex] = r;
            imageData.data[arrayIndex+1] = g;
            imageData.data[arrayIndex+2] = b;
        }
    } ctx.putImageData(imageData,0,0);

    // draw points
    for (var i=0; i<points.length; i++) points[i].drawToContext(ctx);
}

function invertPoint(circleX, circleY, circleRadius, pointX, pointY) {
    var alpha = Math.pow(circleRadius,2)/(Math.pow(pointX-circleX,2)+Math.pow(pointY-circleY,2));
    return {
        x: Math.round(alpha*(pointX-circleX)+circleX),
        y: Math.round(alpha*(pointY-circleY)+circleY)
    };
}

function DraggablePoint(posX, posY) {
     this.x = posX;
     this.y = posY;
     this.color = "#FF0000";
     this.radius = 5;
}

DraggablePoint.prototype.drawToContext = function(theContext) {
    theContext.fillStyle = "#000000";
    theContext.beginPath();
    theContext.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    theContext.closePath();
    theContext.fill();

    theContext.fillStyle = this.color;
    theContext.beginPath();
    theContext.arc(this.x, this.y, this.radius-1, 0, 2*Math.PI, false);
    theContext.closePath();
    theContext.fill();
}

DraggablePoint.prototype.hitTest = function(hitX,hitY) {
     var dx = this.x - hitX;
     var dy = this.y - hitY;
     return(dx*dx + dy*dy < this.radius*this.radius);
}

function mouseDownListener(evt) {
	//We are going to pay attention to the layering order of the objects so that if a mouse down occurs over more than object,
	//only the topmost one will be dragged.
	var highestIndex = -1;

	//getting mouse position correctly, being mindful of resizing that may have occured in the browser:
	var bRect = c.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(c.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(c.height/bRect.height);

	//find which shape was clicked
	for (var i=0; i < points.length; i++) {
		if	(points[i].hitTest(mouseX, mouseY)) {
			dragging = true;
			if (i > highestIndex) {
				//We will pay attention to the point on the object where the mouse is "holding" the object:
				dragHoldX = mouseX - points[i].x;
				dragHoldY = mouseY - points[i].y;
				highestIndex = i;
				dragIndex = i;
			}
		}
	}

	if (dragging) window.addEventListener("mousemove", mouseMoveListener, false);
	c.removeEventListener("mousedown", mouseDownListener, false);
	window.addEventListener("mouseup", mouseUpListener, false);

	if (evt.preventDefault) evt.preventDefault();
	else if (evt.returnValue) evt.returnValue = false;
	return false;
}

function mouseUpListener(evt) {
	c.addEventListener("mousedown", mouseDownListener, false);
	window.removeEventListener("mouseup", mouseUpListener, false);
	if (dragging) {
		dragging = false;
		window.removeEventListener("mousemove", mouseMoveListener, false);
	}
}

function mouseMoveListener(evt) {
	var posX;
	var posY;
	var shapeRad = points[dragIndex].rad;
	var minX = shapeRad;
	var maxX = c.width - shapeRad;
	var minY = shapeRad;
	var maxY = c.height - shapeRad;
	//getting mouse position correctly
	var bRect = c.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(c.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(c.height/bRect.height);

	//clamp x and y positions to prevent object from dragging outside of canvas
	posX = mouseX - dragHoldX;
	posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
	posY = mouseY - dragHoldY;
	posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

	points[dragIndex].x = posX;
	points[dragIndex].y = posY;

	onPointChange();
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);
function handleFileSelect(evt) {
    var f = evt.target.files[0];

    if (f.type.match('image.*')) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                img = new Image;
                img.src = e.target.result;
                initCanvas();
            };
        })(f); reader.readAsDataURL(f);
    } else {
        // ERROR
    }
}
