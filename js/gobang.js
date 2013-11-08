function Gobang(canvasId) {
	this.canvas = document.getElementById(canvasId);
	this.cxt = this.canvas.getContext("2d");
	this.h = this.canvas.height;
	this.w = this.canvas.width;
	this.size = 20;
	this.length = 20;
	this.r = 8;
	this.whites = [];
	this.blacks = [];
	this.board = [];
	this.playedCount = 0;
	for(i=0;i<this.size;i++){
		var row=[];
		for(j=0;j<this.size;j++){
			row.push('');
		}
		this.board.push(row);
	}
};

Gobang.prototype.init = function () {
	this.cxt.clearRect(0, 0, this.w, this.h);
	
	this.cxt.beginPath()
	for(var i=0; i<=this.size+2; i++) {
		this.cxt.moveTo(0, this.length*i);
		this.cxt.lineTo(this.w, this.length*i);
		this.cxt.moveTo(this.length*i, 0);
		this.cxt.lineTo(this.length*i, this.h);
	}
	this.cxt.closePath()
	this.cxt.stroke();
};

Gobang.prototype.moveChess = function(x, y) {
	if(this.board[x][y] === '') {
		this.board[x][y] = 'black';
		this.blacks.push({x: x, y: y});
		this.drawChessman(x, y, '#000');
		this.playedCount++;
		
		if(this.checkGame(x, y, 'black')) {
			$('#game_result').html('You Win!');
			$('#game_over').show();
			return;
		}
		
		this.moveChessByAI();
	}
};

Gobang.prototype.moveChessByAI = function() {
	this.calcWhitesWeight();
	
	var x = 0;
	var y = 0;
	var maxv = this.whites[0][0];
	
	for(i=0;i<this.size;i++){
		for(j=0;j<this.size;j++){
			if(this.board[i][j] === '' && this.whites[i][j] > maxv) {
				maxv = this.whites[i][j];
				x = i;
				y = j;
			}
		}
	}
	
	if(this.board[x][y] === '') {
		this.board[x][y] = 'white';
		this.drawChessman(x, y, '#FFF');
		//$('#point').html('x: '+x+', y: '+y);
		this.playedCount++;
		if(this.checkGame(x, y, 'white')) {
			$('#game_result').html('Game Over!');
			$('#game_over').show();
			return;
		} else if(this.playedCount == this.size*this.size) {
			$('#game_result').html('Game end in Draw!');
			$('#game_over').show();
			return;
		}
		return;
	}
};

Gobang.prototype.checkGame = function(x, y, playColor) {
	var a = this.countChess(x,y,playColor,'l') + this.countChess(x+1,y,playColor,'r');
	var b = this.countChess(x,y,playColor,'t') + this.countChess(x,y+1,playColor,'b');
	var c = this.countChess(x,y,playColor,'lt') + this.countChess(x+1,y+1,playColor,'rb');
	var d = this.countChess(x,y,playColor,'lb') + this.countChess(x+1,y-1,playColor,'rt');
	return a>4 || b>4 || c>4 || d>4;
};

Gobang.prototype.countChess = function(x, y, playColor, direction) {
	if(x<0 || x>=this.size || y<0 || y>=this.size || this.board[x][y] !== playColor) return 0;
	
	switch(direction){
		case 'l': return this.countChess(x-1,y,playColor,direction)+1;
		case 'r': return this.countChess(x+1,y,playColor,direction)+1;
		case 't': return this.countChess(x,y-1,playColor,direction)+1;
		case 'b': return this.countChess(x,y+1,playColor,direction)+1;
		case 'lt': return this.countChess(x-1,y-1,playColor,direction)+1;
		case 'rb': return this.countChess(x+1,y+1,playColor,direction)+1;
		case 'rt': return this.countChess(x+1,y-1,playColor,direction)+1;
		case 'lb': return this.countChess(x-1,y+1,playColor,direction)+1;
		default: return 0;
	}
};

Gobang.prototype.calcWhitesWeight = function() {
	this.whites = [];
	for(i=0;i<this.size;i++){
		var row=[];
		for(j=0;j<this.size;j++){
			if(this.board[i][j] === ''){
				row.push(this.calcWeightValue(i,j));
			}else {
				row.push(-1);
			}
		}
		this.whites.push(row);
	}
	
	/*
	table = '<table border="1"><tr><th></th>';
	for(i=0;i<this.size;i++)table += '<th>'+i+'</th>';
	table += '</tr>';
	for(j=0;j<this.size;j++){
		table += '<tr><td>' + j +'</td><td>';
		row=[];
		for(i=0;i<this.size;i++){
			row.push(this.whites[i][j]);
		}
		table += row.join('</td><td>');
		table += '</td></tr>';
	}
	table += '</table>';
	$('#weight_table').html(table);
	*/
}

Gobang.prototype.calcWeightValue = function(x, y) {
	var v = 0;
	
	// whites
	this.board[x][y] = 'white';
	var wa1 = this.countChess(x,y,'white','l')
	var wa2 = this.countChess(x+1,y,'white','r');
	var wa = wa1 + wa2;
	if(wa1>0 && x-wa1>=0 && this.board[x-wa1][y] == '') wa1++;
	if(wa2>0 && x+1+wa2<this.size && this.board[x+1+wa2][y] == '') wa2++;
	var wap = wa1 + wa2;
	
	var wb1 = this.countChess(x,y,'white','t');
	var wb2 = this.countChess(x,y+1,'white','b');
	var wb = wb1 + wb2;
	if(wb1>0 && y-wb1>=0 && this.board[x][y-wb1] == '') wb1++;
	if(wb2>0 && y+1+wb2<this.size && this.board[x][y+1+wb2] == '') wb2++;
	var wbp = wb1 + wb2;
	
	
	var wc1 = this.countChess(x,y,'white','lt');
	var wc2 = this.countChess(x+1,y+1,'white','rb');
	var wc = wc1 + wc2;
	if(wc1>0 && x-wc1>=0 && y-wc1>=0 && this.board[x-wc1][y-wc1] == '') wc1++;
	if(wc2>0 && x+1+wc2<this.size && y+1+wc2<this.size && this.board[x+1+wc2][y+1+wc2] == '') wc2++;
	var wcp = wc1 + wc2;
	
	var wd1 = this.countChess(x,y,'white','lb');
	var wd2 = this.countChess(x+1,y-1,'white','rt');
	var wd = wd1 + wd2;
	if(wd1>0 && x-wd1>=0 && y+wd1>=0 && this.board[x-wd1][y+wd1] == '') wd1++;
	if(wd2>0 && x+1+wd2<this.size && y-1-wd2<this.size && this.board[x+1+wd2][y-1-wd2] == '') wd2++;
	var wdp = wd1 + wd2;
	
	
	//blacks
	this.board[x][y] = 'black';
	var ba1 = this.countChess(x,y,'black','l')
	var ba2 = this.countChess(x+1,y,'black','r');
	var ba = ba1 + ba2;
	if(ba1>0 && x-ba1>=0 && this.board[x-ba1][y] == '') ba1++;
	if(ba2>0 && x+1+ba2<this.size && this.board[x+1+ba2][y] == '') ba2++;
	var bap = ba1 + ba2;
	
	var bb1 = this.countChess(x,y,'black','t');
	var bb2 = this.countChess(x,y+1,'black','b');
	var bb = bb1 + bb2;
	if(bb1>0 && y-bb1>=0 && this.board[x][y-bb1] == '') bb1++;
	if(bb2>0 && y+1+bb2<this.size && this.board[x][y+1+bb2] == '') bb2++;
	var bbp = bb1 + bb2;
	
	
	var bc1 = this.countChess(x,y,'black','lt');
	var bc2 = this.countChess(x+1,y+1,'black','rb');
	var bc = bc1 + bc2;
	if(bc1>0 && x-bc1>=0 && y-bc1>=0 && this.board[x-bc1][y-bc1] == '') bc1++;
	if(bc2>0 && x+1+bc2<this.size && y+1+bc2<this.size && this.board[x+1+bc2][y+1+bc2] == '') bc2++;
	var bcp = bc1 + bc2;
	
	var bd1 = this.countChess(x,y,'black','lb');
	var bd2 = this.countChess(x+1,y-1,'black','rt');
	var bd = bd1 + bd2;
	if(bd1>0 && x-bd1>=0 && y+bd1>=0 && this.board[x-bd1][y+bd1] == '') bd1++;
	if(bd2>0 && x+1+bd2<this.size && y-1-bd2<this.size && this.board[x+1+bd2][y-1-bd2] == '') bd2++;
	var bdp = bd1 + bd2;
	
	//reset board
	this.board[x][y] = '';
	
	var wmax = Math.max(wa,wb,wc,wd)
	var bmax = Math.max(ba,bb,bc,bd);
	var wpmax = Math.max(wap,wbp,wcp,wdp)
	var bpmax = Math.max(bap,bbp,bcp,bdp);
	
	var wpsum = wap + wbp + wcp + wdp;
	var bpsum = bap + bbp + bcp + bdp;
	
	//TODO: 预算加权
	if(wmax>=5) {
		v = 9;
	}else if (bmax>=5) {
		v = 8;
	}else if (wmax==4 && wpmax>5) {
		v = 7;
	}else if (bmax==4 && bpmax>5) {
		v = 6;
	}else if (wmax > 1 && wmax==bmax) {
		v = wmax + 0.1; //进攻is最好的防守!!
	}else {
		v = wmax>=bmax ? wmax : bmax;
	}
	
	//边线降权
	if((x % this.size) == 0 || (y % this.size) == 0) {
		v -= 0.1;
	}
	return v;
}

Gobang.prototype.drawChessman = function(x, y, color) {
		this.cxt.fillStyle = color;
		this.cxt.beginPath();
		this.cxt.arc(this.length*(x+1),this.length*(y+1),this.r,0,Math.PI*2,true);
		this.cxt.closePath();
		this.cxt.stroke();
		this.cxt.fill();
};

Gobang.prototype.playGame = function(e) {
	var x = e.pageX - $(this.canvas).offset().left;
	var y = e.pageY - $(this.canvas).offset().top;
	x = Math.floor((x-gb.length/2)/gb.length);
	y = Math.floor((y-gb.length/2)/gb.length);
	if(x>-1 && y>-1) {
		this.moveChess(x, y);
	}
}

Gobang.prototype.startGame = function() {
	$(this.canvas).on('click', function(e){ gb.playGame(e);});
}

var gb;

$(document).ready(function () {
	gb = new Gobang('canvas');
	gb.init();
	gb.startGame();
	//$("#game_over .close").on('click', function(){ $("#game_over").hide(); });
});
