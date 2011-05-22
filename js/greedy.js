var w = 640;
var h = 480;

var game;
var c;

var bubbles = [];
var bullets = [];
var turret;

var mpos;

var gravity = .01;

var interval = 1.0 / 30;

/* CLASSES */
function Pos(x, y) {
	this.x = x;
	this.y = y;
}
mpos = new Pos(w/2, 0);

function Bubble(x, y, radius) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	
	this.vx = 0;
	this.vy = 0;
	
	this.name = "";
	
	this.move = function() {
		this.x += this.vx;
		this.y += this.vy;
		
		this.vy += gravity;
	}
		
	this.draw = function() {
		this.move();
		
		fillCirc(this.x, this.y, this.radius);
	}
}

function Turret() {
	this.x = w/2;
	this.y = h;
	
	this.draw = function() {
		//c.fillRect(w/2 - 10, h-20, 20, 20);
		
		c.save();
		c.translate(this.x, this.y);
		c.rotate(Math.atan2(mpos.y - this.y, mpos.x - this.x));
		c.fillRect(0, -5, 50, 10);
		c.restore();
	}
}

/* Canvas methods to draw circles */
function circle(x, y, radius) {
	c.beginPath();
	c.arc(x, y, radius, 0, Math.PI*2, false);
	c.closePath();
}
function fillCirc(x, y, radius) {
	circle(x, y, radius);
	c.fill();
}
function strokeCirc(x, y, radius) {
	circle(x, y, radius);
	c.stroke();
}

function getCursorPosition(e) {
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
    } else {
		x = e.clientX + document.body.scrollLeft +
	            document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop +
            	document.documentElement.scrollTop;
    }

	x -= game.offsetLeft;
    y -= game.offsetTop;

	return new Pos(x, y);
}

function handleClick(e) {
	mpos = getCursorPosition(e);

	bubbles.push(new Bubble(mpos.x, mpos.y, 20));
}
function handleMove(e) {
	mpos = getCursorPosition(e);
	
	c.fillRect(mpos.x, mpos.y, 1, 1);		
}

function draw() {
	turret.draw();
	
	for(var i=0; i<bubbles.length; i++) {
		var b = bubbles[i];
		b.draw();
	}
}
function update() {
	
}

function loop() {
	game.width = game.width; // clear canvas element

	draw();
	//update();
		
	setTimeout('loop()', interval);
}

window.addEventListener('load', function() {
	game = document.getElementById('game');
	c = game.getContext('2d');
	
	game.addEventListener('click', handleClick);
	game.addEventListener('mousemove', handleMove);
	
	var b = new Bubble(200, 250, 20);
	
	bubbles.push(b);
	
	//c.fillRect(50, 25, 150, 100);
	
	//strokeCirc(c, 200, 250, 20);
		
	turret = new Turret();
	
	loop();
}
)