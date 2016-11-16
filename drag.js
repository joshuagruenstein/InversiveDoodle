var dragIndex;
var dragging;
var mouseX;
var mouseY;
var dragHoldX;
var dragHoldY;

function mouseDownListener(evt) {
	var highestIndex = -1;

	var bRect = c.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(c.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(c.height/bRect.height);

	for (var i=0; i < points.length; i++) {
		if	(points[i].hitTest(mouseX, mouseY)) {
			dragging = true;
			if (i > highestIndex) {
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
	var shapeRad = points[dragIndex].radius;
	var minX = shapeRad;
	var maxX = c.width - shapeRad;
	var minY = shapeRad;
	var maxY = c.height - shapeRad;

	var bRect = c.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(c.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(c.height/bRect.height);

	//clamp x and y positions to prevent object from dragging outside of canvas
	posX = mouseX - dragHoldX;
	posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
	posY = mouseY - dragHoldY;
	posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

	// make sure 2.x < 3.x, 2.y < 3.y
	if (dragIndex == 2) {
		if (posX <= points[3].x) points[2].x = posX;
		if (posY <= points[3].y) points[2].y = posY;
	} else if (dragIndex == 3) {
		if (points[2].x <= posX) points[3].x = posX;
		if (points[2].y <= posY) points[3].y = posY;
	} else {
		points[dragIndex].x = posX;
		points[dragIndex].y = posY;
	}

	onPointChange();
}
