var w = 480;
var h = 640;
var maxh = 420;

var game;
var c;

var bubbles = [];
var bullets = [];
var turret;

var cash = 50;

var mpos;

var interval = 1.0 / 30;

var MAX_BUBBLES = 15;
var BUBBLE_GENERATION_PROB = 0.05;

var clicked = false;

var sprite1 = new Image();
var sprite2 = new Image();
var sprite3 = new Image();

var NEWS_GENERATION_PROB = 0.06;
var URL = "http://www.tekbubbles.com";
var newsStory = "";

/* OBJECT CLASSES
*/
function Pos(x, y) {
	this.x = x;
	this.y = y;
}
mpos = new Pos(w/2, 0);

function Bubble(x, y, radius, worth, growth, goodchance, panicchance) {
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
	this.panicchance = panicchance;
	
	this.collidesWithPoint = function(p) {
		return ((Math.sqrt(Math.pow(this.x-p.x, 2) + Math.pow(this.y-p.y, 2)))<this.radius);
	}
	
	this.update = function() {
		var growthPerFrame = 1 + (this.growth/2) * interval;
		
		this.radius *= growthPerFrame;
		this.worth *= growthPerFrame;
		this.gains *= growthPerFrame;
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
			
			if(bubble.collidesWithPoint(bullet)) {
				bubble.radius += 2;
				bubble.invested++;
				bubble.gains++;
				
				bullets.splice(i, 1);
			}
		}
	}
}
function checkBubbleSize() {
	for(var i=0; i<bubbles.length; i++) {
		var b = bubbles[i];
		if(b.radius < 10 || b.radius > 100) {
			cash -= b.gains;
			bubbles.splice(i, 1);
		}
	}
}
function checkBounds() {
	checkBubbleBounds();
	checkBulletBounds();
	checkBubblesWithBullets();
	checkBubbleSize();
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
function makeBullet() {
	if(cash>0) {
		bullets.push(new Bullet(turret.x, turret.y));
		cash--;
	}
}
function hoverOnBubble() {
	for(var i=0; i<bubbles.length; i++) {
		var b = bubbles[i];
		if(b.collidesWithPoint(mpos)) {
			return true;
		}
	}
	return false;
}
function clickedOnBubble() {
	for(var i=0; i<bubbles.length; i++) {
		var b = bubbles[i];
		if(b.collidesWithPoint(mpos)) {
			bubbles.splice(i, 1);
			cash += b.gains;		
			return true;
		}
	}
	return false;
}
function handleMouseDown(e) {
	clicked = false;
	
	mpos = getCursorPosition(e);

	if(!clickedOnBubble()) {
		makeBullet();
	}
}
function handleMouseUp(e) {
	clicked = false;
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
	c.font = "12pt Arial";
	c.fillText(newsStory,200,500,100);
	
	c.drawImage(sprite1, 150, h-200);
	
	c.fillText(cash, 10, 20);
	
	if(hoverOnBubble()) {
		document.getElementById('game').style.cursor = 'pointer';
	} else {
		document.getElementById('game').style.cursor = 'default';
	}
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
}
function loop() {
	game.width = game.width; // clear canvas element

	draw();
	update();
	
	maybeAddBubble();
	maybeAddNewsStory();
	
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

	$.getJSON(URL+'/company/random?callback=?', function(data) {
		//alert(data['name']);
		//from data we should infer
		var num_of_employees = data['number_of_employees'];
		var worth;
		var radius;
		var growth;
		var goodchance;
		var panicchance;
		if(num_of_employees == null || num_of_employees <= 3){
			worth = 500000;
			growth = 0.12;
			goodchance = 0.5;
			panicchance = 0.4;
			radius = 15;
		}else if(num_of_employees > 101){
			worth = 10000000;
			growth = 0.01;
			goodchance = 0.35;
			panicchance = 0.1;
			radius = 30;
		}else if(num_of_employees > 20){
			worth = 50000000;
			growth = 0.02;
			radius = 25;
			goodchance = 0.5;
			panicchance = 0.1;
		}else if(num_of_employees > 11){
			worth = 10000000;
			growth = 0.05;
			radius = 20;
			goodchance = 0.45;
			panicchange = 0.2;
		}else if(num_of_employees > 4){
			worth = 1000000;
			growth = 0.06;
			radius = 17;
			goodchance = 0.5;
			panicchange = 0.2;
		}
		var b = new Bubble(xPos, yPos, radius,worth,growth, goodchance,panicchance);
		b.name = data['name'];
		b.permalink = data['permalink']
		bubbles.push(b);
	});
}

function maybeAddNewsStory(){
	if(Math.random() <= NEWS_GENERATION_PROB*interval){
		addNewsStory();
	}
}

function addNewsStory(){
	var num_companies = bubbles.length;
	var i = Math.floor(Math.random() * (num_companies));
	var selectedBubble = bubbles[i];
	var good = 0;
	if(selectedBubble!=undefined) {
		if(selectedBubble.goodchance > Math.random()){
			good = 1;
		}
		$.getJSON(URL+'/story/'+selectedBubble.permalink+'?good='+good+'&callback=?',
		function(data) {
			newsStory = data['story'];
			var val = data['value']/100;
			if(good == 0){
				val = -1*val;
			}
			selectedBubble.growth += val;
		});
	}
}


window.addEventListener('load', function() {
	game = document.getElementById('game');
	c = game.getContext('2d');
	
	game.addEventListener('mousedown', handleMouseDown);
	game.addEventListener('mouseup', handleMouseUp);
	game.addEventListener('mousemove', handleMove);
	
	setup(1);
	
	sprite1.src = "images/sprite1.png";
	sprite2.src = "images/sprite2.png";
	sprite3.src = "images/sprite3.png";
	
	//$('#game_container').append('<div id="money"></div>');
	
	turret = new Turret();
	
	loop();
})