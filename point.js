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
