var w = 480;
var h = 640;
var maxh = 450;

var game;
var c;

var bubbles = [];
var bullets = [];
var turret;

var cash = 50;

var mpos;

var gravity = .01;

var interval = 1.0 / 30;

var MAX_BUBBLES = 15;
var BUBBLE_GENERATION_PROB = 0.05;

var man = new Image();

/* OBJECT CLASSES
*/
function Pos(x, y) {
	this.x = x;
	this.y = y;
}
mpos = new Pos(w/2, 0);

function Bubble(x, y, radius, worth, growth, goodchance, badchance, panicchance) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	
	this.vx = Math.random()-.5;
	this.vy = Math.random()-.5;
	
	this.name = "";
	this.permalink = "";
	
	this.invested = 0;
	this.gains = 0;
	
	this.worth = worth;
	
	this.growth = growth;
	this.goodchance = goodchance;
	this.badchance = badchance;
	this.panicchance = panicchance;
	
	this.collidesWith = function(bullet) {
		return ((Math.sqrt(Math.pow(this.x-bullet.x, 2) + Math.pow(this.y-bullet.y, 2)))<this.radius);
	}
	
	this.update = function() {
		this.worth *= this.growth;
		this.invested *= this.growth;
		this.gains *= this.growth;
	}
	
	this.move = function() {
		this.x += this.vx;
		this.y += this.vy;
	}
		
	this.draw = function() {
		fillCirc(this.x, this.y, this.radius);
	}
}

function Bullet(x, y) {
	this.x = x;
	this.y = y;
	
	this.tx = mpos.x;
	this.ty = mpos.y;
	
	this.theta = Math.atan2(this.ty - this.y, this.tx - this.x);
	this.vx = 2 * Math.cos(this.theta);
	this.vy = 2 * Math.sin(this.theta);
	
	this.move = function() {
		this.x += this.vx;
		this.y += this.vy;
	}
	
	this.draw = function() {
		c.save();
		c.translate(this.x, this.y);
		c.rotate(this.theta);
		c.fillRect(-5, -3, 10, 6);
		c.restore();
	}
}

function Turret() {
	this.x = w/2;
	this.y = h;
	
	this.draw = function() {
		fillCirc(w/2, h+10, 40);
				
		c.save();
		c.translate(this.x, this.y);
		c.rotate(Math.atan2(mpos.y - this.y, mpos.x - this.x));
		c.fillRect(0, -5, 50, 10);
		c.restore();
	}
}

function checkBulletBounds() {
	for(var i=0; i<bullets.length; i++) {
		var b = bullets[i];
	
		if(b.x<0 || b.x>w || b.y<0 || b.y>h) {
			bullets.splice(i, 1);
			i--;
		}
	}
}
function checkBubbleBounds() {
	for(var i=0; i<bubbles.length; i++) {
		var b = bubbles[i];
		
		if(b.x<b.radius || b.x>w-b.radius) {
			b.vx *= -1;
			if(b.x<b.radius) {
				b.x=b.radius;
			} else {
				b.x=w-b.radius;
			}
		} else if(b.y<b.radius || b.y>maxh-b.radius) {
			b.vy *= -1;
			if(b.y<b.radius) {
				b.y=b.radius;
			} else {
				b.y=maxh-b.radius;
			}
		}
	}
}
function checkBubblesWithBullets() {
	for(var i=0; i<bullets.length; i++) {
		var bullet = bullets[i];
		for(var j=0; j<bubbles.length; j++) {
			var bubble = bubbles[j];
			
			if(bubble.collidesWith(bullet)) {
				bubble.radius += 2;
				bubble.invested++;
				bubble.gains++;
				
				bullets.splice(i, 1);
			}
		}
	}
}
function checkBounds() {
	checkBubbleBounds();
	checkBulletBounds();
	checkBubblesWithBullets();
}

function randomBubble() {
	return new Bubble(Math.random()*w, Math.random()*h, 20);
}

/* Canvas methods to draw circles
*/
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

/* CLICK HANDLERS
*/
function handleClick(e) {
	mpos = getCursorPosition(e);

	bullets.push(new Bullet(turret.x, turret.y));
	
	cash--;
}
function handleMove(e) {
	mpos = getCursorPosition(e);
}

/* DRAW LOOP
*/
function draw() {
	turret.draw();
	
	for(var i=0; i<bubbles.length; i++) {
		var bubble = bubbles[i];
		bubble.draw();
	}
	for(var i=0; i<bullets.length; i++) {
		var bullet = bullets[i];
		bullet.draw();
	}
	
	c.drawImage(man, 170, h-150);
}
function update() {
	for(var i=0; i<bubbles.length; i++) {
		var bubble = bubbles[i];
		bubble.update();
		bubble.move();
	}
	
	for(var i=0; i<bullets.length; i++) {
		var bullet = bullets[i];
		bullet.move();
	}
	
	checkBounds();
	
	$('#feed').innerHTML = bullets.length;
}
function loop() {
	game.width = game.width; // clear canvas element

	draw();
	update();
	
	maybeAddBubble();
	
	setTimeout('loop()', interval);
}

function setup(n) {
	for (var j = 0; j < n; j++) {
		addBubble();
	}

}

function maybeAddBubble() {
	if (bubbles.length < MAX_BUBBLES) {
		if (Math.random() <= BUBBLE_GENERATION_PROB * interval) {
			addBubble();
		}
	}
}

function addBubble() {
	var xPos = Math.floor(Math.random() * (w + 1));
	var yPos = Math.floor(Math.random() * (maxh + 1));
	var b = null;

	$.getJSON('http://www.tekbubbles.com/company/random?callback=?', function(data) {
		//alert(data['name']);
		var calcSize = 20; //from data we should infer
		var b = new Bubble(xPos, yPos, calcSize);
		b.name = data['name'];
		b.permalink = data['permalink']
		bubbles.push(b);
	});
}

window.addEventListener('load', function() {
	game = document.getElementById('game');
	c = game.getContext('2d');
	
	game.addEventListener('click', handleClick);
	game.addEventListener('mousemove', handleMove);
	
	setup(1);
	
	man.src = "/images/sprite1.png";
	// man.onload = function() {
	// 	c.drawImage(man, 170, h-150);
	// }
	
	turret = new Turret();
	
	loop();
})