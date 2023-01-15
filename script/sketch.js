// Maze Generator by Michael Hoefler
// Recursive Backtracking Algorithm

var cols, rows;
var w = 25;
var grid = [];
var stack = [];
var current;
var start;
var finish;
var grey = '#eeeeee';
var light = '#fefefe'
var curr = '#dddddd';



function setup() {
	var c = createCanvas(document.body.clientWidth,document.documentElement.scrollHeight);
    c.parent("p5");
	background(light);
	frameRate(300);
	cols = floor(width/w);
	rows = floor(height/w);

	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			var cell = new Cell(x,y);
			grid.push(cell);
		}
	}

	current = grid[index(1,1)];
	start = grid[index(1,1)];
	finish = grid[index(cols-2,rows-2)];
}

function draw() {
	background(0);
	for (var i = 0; i < grid.length; i++) {
		grid[i].show();
	}
	current.visited = true;
	var check = current.checkNeighbors();
	if (check) {
		var next = check[0];
		current.bridge(check);
		current = next;
		stack.push(current);
	} else if (stack.length > 0) {
		current = stack.pop();
	}
}

function index(x,y) {
	if (x<0 || y<0 || x>cols-1 || y>rows-1) {
		return -1;
	}
	return x + y * cols;
}

function AroundClear(x,y) {
	if(grid[index(x,y-1)] && 
	   grid[index(x+1,y-1)] && 
	   grid[index(x+1,y)] && 
	   grid[index(x+1,y+1)] && 
	   grid[index(x,y+1)] && 
	   grid[index(x-1,y+1)] && 
	   grid[index(x-1,y)] && 
	   grid[index(x-1,y-1)] && 
	   !grid[index(x,y-1)].visited && 
	   !grid[index(x+1,y-1)].visited && 
	   !grid[index(x+1,y)].visited && 
	   !grid[index(x+1,y+1)].visited && 
	   !grid[index(x,y+1)].visited && 
	   !grid[index(x-1,y+1)].visited && 
	   !grid[index(x-1,y)].visited && 
	   !grid[index(x-1,y-1)].visited) {
			return true;
	}
}

function Cell(x,y) {
	this.x = x;
	this.y = y;
	this.visited = false;
	
	this.checkNeighbors = function() {
		var neighbors = [];
		if (AroundClear(x,y-2) == true) {
			neighbors.push([grid[index(x,y-2)],"UP"]);
		}
		if (AroundClear(x+2,y) == true) {
			neighbors.push([grid[index(x+2,y)],"RIGHT"]);
		}
		if (AroundClear(x,y+2) == true) {
			neighbors.push([grid[index(x,y+2)],"DOWN"]);
		}
		if (AroundClear(x-2,y) == true) {
			neighbors.push([grid[index(x-2,y)],"LEFT"]);
		}
		if (neighbors.length > 0) {
			var r = floor(random(0, neighbors.length));
			return neighbors[r];
		} else {
			return undefined;
		}
	}

	this.show = function() {
		noStroke();
    	if (this == current) {
      		fill(curr);
    	} else if (!this.visited) {
      		fill(light);
    	} else {
      		fill(grey);
      	}
    	if (stack.length == 0) {
    		if (this.visited) {
				fill(curr);
			}
    		//if (this == start) {
			//	fill('#77dd77');
			//}
			//if (this == finish) {
			//	fill('#ff6961');
			//}
    	}
    	rect(this.x * w, this.y * w, w, w);
	}
	this.bridge = function(a) {
		if(a[1] == "UP") {
			grid[index(x,y-1)].visited = true;
		}
		if(a[1] == "RIGHT") {
			grid[index(x+1,y)].visited = true;
		}
		if(a[1] == "DOWN") {
			grid[index(x,y+1)].visited = true;
		}
		if(a[1] == "LEFT") {
			grid[index(x-1,y)].visited = true;
		}
	}
}


