var whiteboard = ( function() {
	var $_canvas = $("#drawingArea"),
	$_context = $_canvas[0].getContext('2d'),
	drawing = false,
	line = [],

	Dot = function(args){
		this.X = args.x || - 1;
		this.Y = args.y || - 1;
		this.dragging = args.dragging || false;
		this.end = args.end || false;
		this.text = args.text || false;
	},

	addDot = function(args){
		line.push(new Dot(args));
		socketControl.pushLine(line[line.length-1]);
		draw();
	},

	draw = function(){
		$_context.clearRect(0, 0, $_context.canvas.width, $_context.canvas.height);
		var i;
		for(i = 0; i < line.length; i = i + 1){
			if (!line[i].dragging){
				$_context.beginPath();
				$_context.moveTo(line[i].X, line[i].Y);
			} else {
				$_context.lineTo(line[i].X, line[i].Y);
				if (i === line.length - 1 || line[i + 1].end){
					$_context.strokeStyle=line[i].color;
					$_context.stroke();
				}
			}
		}
	};

	$_canvas.attr("width",$_canvas.css('width')).attr("height",$_canvas.css('height'));
	$_context.globalCompositeOperation = "source-over";
	$_context.strokeStyle = "rgb(255,0,0)";
	$_context.lineJoin = "round";
	$_context.lineWidth = 5;
	$_canvas.mousedown(function(e){
		var mouseX = e.pageX - $(this).offset().left,
		mouseY = e.pageY - $(this).offset().top;
		drawing = true; 
		addDot({x: mouseX, y: mouseY, dragging: false});
	});
	$_canvas.mousemove(function(e){
		var mouseX = e.pageX - $(this).offset().left,
		mouseY = e.pageY - $(this).offset().top;
		if(drawing){
			addDot({x: mouseX, y: mouseY, dragging: true});
		}
	});
	$_canvas.mouseup(function(e){
		var mouseX = e.pageX - $(this).offset().left,
		mouseY = e.pageY - $(this).offset().top;
		if(drawing){
			addDot({x: mouseX, y: mouseY, dragging: true, end: true});
			drawing = false;
		}

	});
	$_canvas.mouseleave(function(e){
		var mouseX = e.pageX - $(this).offset().left,
		mouseY = e.pageY - $(this).offset().top;
		if (drawing){
			addDot({x: mouseX, y: mouseY, dragging: true, end: true });
			drawing = false;
		}
	});
	return{
		updateLines: function(new_line){
			line = line.concat(new_line);
			draw();
		}
	};
})();

var socketControl = ( function() {
	var socket = io(),
	line_buffer = [];
	socket.on('broadcastLine', function (data) {
		whiteboard.updateLines(data);
	});
	return{
		pushLine: function(new_stroke){
			line_buffer.push(new_stroke);
			if(new_stroke.end){
				socket.emit('pushLine', line_buffer);
				line_buffer = [];
			}
		}
	}
})();