/*
 * jPhysics 0.3
 * By Rafael C.P. (a.k.a. Kurama_Youko)
 * http://www.inf.ufrgs.br/~rcpinto/physics
 * http://plugins.jquery.com/project/jphysics
 * Created: 2008-11-01
 * Last Modified: 2008-11-02
 * Licensed under GPL v3
 * 
 * ------------------------------------------------
 * 
 * What's New:
 * - Higher performance
 * - Changes only desired properties (don't use defaults except for the first time)
 * 
 * Known Issues:
 * - applyForces works just for time step = 1
 * 
 * To Do:
 * - More vector operations (fromPolar (constructor), getAngle, getLength, distance, toUnity, dot, cross, etc...)
 * - Adding fixed accelerations to each element (like gravity, which doesn't change with different mass)
 * - applyForces for time step > 1 (varying acceleration)
 * - Containers for simulations
 * - Collision detection
 * - Collision response
 * - Friction
 * - Torque
 * - More physics properties (elasticity, hardness, durability, etc...)
 * - Springs
 * - Joints
 * - Fluids
 * - Tensors
 * 
 * Help is always welcome! =)
 * Hope you'll enjoy this plugin!
 * Let me know if you make any interesting application with it.
 */

//----------------------------------------------------
// Vector Class
//----------------------------------------------------
jQuery.Vector = function() {
	//----------------------------------------------------
	// Initialization
	//----------------------------------------------------
	//0-dimension vector
	if (arguments.length == 0)
		var v = [];
	//Argument is the number of dimensions
	//Initializes with zeroes
	else if (arguments.length == 1) {
		var v = [];
		for (var i = 0; i < arguments[0]; ++i) {
			v[i] = 0;
		}
	}
	//Each argument is a vetor element
	else
		var v = jQuery.makeArray(arguments);
		
	//----------------------------------------------------
	// Methods
	//----------------------------------------------------
	//Copies the vector
	v.copy = function() {
		var v2 = new $.Vector();
		$(v).each(function(i){v2[i] = v[i]});
		return v2;
	};
	//Is it a null vector? (made only of zeroes)
	v.isNull = function() {
		for (var i in v) {
			if (v[i] != 0) return false;
		}
		return true;
	};
	//Sum of 2 vectors
	v.add = function (v2) {
		var v3 = v.copy();
		//If v2 is a null vector, returns v copy
		if (v2.isNull()) return v3;
		//If v is a null vector, returns v2 copy
		if (v.isNull()) return v2.copy();
		//Else, normal sum
		$(v).each(function(i){v3[i] += v2[i]});
		return v3;
	};
	//Difference of 2 vectors
	v.sub = function (v2) {
		var v3 = v.copy();
		//If v2 is a null vector, returns v copy
		if (v2.isNull()) return v3;
		//If v is a null vector, returns v2 copy
		if (v.isNull()) return v2.copy();
		//Else, normal subtraction
		$(v).each(function(i){v3[i] -= v2[i]});
		return v3;
	};
	//Vector scalar multiplication
	v.mul = function (x) {
		//If x == 0, return null vector with same dimensions of v
		if (x == 0) return new $.Vector(v.length);
		var v2 = v.copy();
		//If x == 1, return copy of v
		if (x == 1) return v2;
		//Else, normal multiplication
		$(v).each(function(i){v2[i] *= x});
		return v2;
	};
	//Vector scalar division
	v.div = function (x) {
		//If x == 0, return null
		if (x == 0) return null;
		//Else, return mul(1/x)
		return v.mul(1/x);
	};
	//Vectorial maximum between 2 vectors
	v.max = function (v2) {
		var v3 = v.copy();
		$(v).each(function(i){v3[i] = Math.max(v[i],v2[i])});
		return v3;
	};
	//Vectorial minimum between 2 vectors
	v.min = function (v2) {
		var v3 = v.copy();
		$(v).each(function(i){v3[i] = Math.min(v[i],v2[i])});
		return v3;
	};
	//Bounds the vector by 2 other limiting vectors
	v.bound = function (min,max) {
		return v.min(max).max(min);
	};
	return v;
};

//----------------------------------------------------
// $(selector).physics(obj)
// Applies physics properties to selected elements
//----------------------------------------------------
jQuery.fn.physics = function(params) {
	this.each(function(i){
		//Defaults for first time (without physics properties) (when not in 'params')
		if (!this.position) {
			if (!params.position) this.position = new $.Vector(0,0);
			if (!params.velocity) this.velocity = new $.Vector(0,0);
			if (!params.acceleration) this.acceleration = new $.Vector(0,0);
			if (!params.minPosition) this.minPosition = new $.Vector(-Infinity,-Infinity);
			if (!params.maxPosition) this.maxPosition = new $.Vector(Infinity,Infinity);
			if (!params.minVelocity) this.minVelocity = new $.Vector(-Infinity,-Infinity);
			if (!params.maxVelocity) this.maxVelocity = new $.Vector(Infinity,Infinity);
			if (!params.minAcceleration) this.minAcceleration = new $.Vector(-Infinity,-Infinity);
			if (!params.maxAcceleration) this.maxAcceleration = new $.Vector(Infinity,Infinity);
			if (!params.mass) this.mass = 1;
			this.style.position = 'absolute';
		}
		//Use 'params' where possible
		if (params.position) this.position = params.position;
		if (params.velocity) this.velocity = params.velocity;
		if (params.acceleration) this.acceleration = params.acceleration;
		if (params.minPosition) this.minPosition = params.minPosition;
		if (params.maxPosition) this.maxPosition = params.maxPosition;
		if (params.minVelocity) this.minVelocity = params.minVelocity;
		if (params.maxVelocity) this.maxVelocity = params.maxVelocity;
		if (params.minAcceleration) this.minAcceleration = params.minAcceleration;
		if (params.maxAcceleration) this.maxAcceleration = params.maxAcceleration;
		if (params.mass) this.mass = params.mass;
		this.style.left = Math.round(this.position[0])+'px';
		this.style.top = Math.round(this.position[1])+'px';
	});
	return this;
};

//----------------------------------------------------
// $(selector).applyForces()
// Applies forces to selected elements
//----------------------------------------------------
jQuery.fn.applyForces = function() {
	//Passing an array of forces
	if (arguments.length == 1 && arguments[0].length && !arguments[0].add)
		var forces = arguments[0];
	//Passing each force as a parameter
	else
		var forces = $.makeArray(arguments);
	//No forces, nothing to do
	if (forces.length == 0) return this;
	//Sums up all forces
	var result_force = new $.Vector(forces[0].length);
	$(forces).each(function(){
		result_force = result_force.add(this);
	});
	//Applies result_force to each selected element
	// a = F/m
	this.each(function(){
		if (this.mass != 0)
			this.acceleration = result_force.div(this.mass).bound(this.minAcceleration,this.maxAcceleration);
	});
	return this;
};

//----------------------------------------------------
// $(selector).updatePhysics(time)
// Updates physics properties for selected elements
//----------------------------------------------------
jQuery.fn.updatePhysics = function(time) {
	if (!time) time = 1;	//Default time step = 1
	//Updates element CSS position based on its physics position
	var updatePhysicsCSS = function(element) {
		var elm = $(element);
		var oldx = elm.css('left');
		var oldy = elm.css('top');
		var newx = Math.round(element.position[0])+'px';
		var newy = Math.round(element.position[1])+'px';
		var obj = {};
		//Ensures only modified values are updated
		if (oldx != newx) obj.left = newx;
		if (oldy != newy) obj.top = newy;
		if (obj.left || obj.top) $(element).css(obj);
		return element;
	};
	var halfTime = time*0.5;
	this.each(function(i){
		var old_velocity = this.velocity.copy();
		// v = v0 + a*t
		this.velocity = this.velocity.add(this.acceleration.mul(time)).bound(this.minVelocity,this.maxVelocity);
		// s = s0 + t/2(v0+v)
		this.position = this.position.add(this.velocity.add(old_velocity).mul(halfTime)).bound(this.minPosition,this.maxPosition);
		updatePhysicsCSS(this);
	});
	return this;
};
