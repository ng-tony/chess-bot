'use strict';

/**
takes in string value from move command from message,
converts it to value that can be used for accessing
the board array
**/
function getCoord(val){
	const convert = {
		"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7,
		"8": 0, "7": 1, "6": 2, "5": 3, "4": 4, "3": 5, "2": 6, "1": 7
	};

	//check for bad coords
	// tolowercase will not do anything to numbers
	if(convert[val.toLowerCase()] !== undefined){
		return convert[val];
	}else{
		throw new Error('invalid string to convert to coordinate');
	}
}

/*return the first letter of the unit on that board coord
i.e. the color of the piece*/
function getColor(x, y, board){
	if(x > 7 || x < 0 || y > 7 || y < 0){
		throw new Error('trying to get color of something out of bounds');
	}else{
		return board[y][x].charAt(0);
	}
}

function getPiece(x, y, board){
	if(x > 7 || x < 0 || y > 7 || y < 0){
		throw new Error('trying to get piece type of something out of bounds');
	}else{
		return board[y][x].charAt(1);
	}
}

function isInBoard(coord){
	return (coord > 0 && coord < 7) ? true : false;
}

function nothingBetweenDiag(startX, startY, destX, destY, board){
	var upperBoundX;
	var lowerBoundX;
	var lowerBoundY;
	/*don't need to do upperBoundY because we
	use upperBoundX to get the number of spaces that the bishop
	moves vertically*/
	if(destX > startX){
		upperBoundX = destX;
		lowerBoundX = startX;
	}else{
		upperBoundX = startX;
		lowerBoundX = destX;
	}

	if(destY > startY){
		lowerBoundY = startY;
	}else{
		lowerBoundY = destY;
	}

	//chose upperBoundX and lowerBoundX because only displacement amount matters
	//completely arbitrary, could use the other too
	for(var i = 1; i < upperBoundX - lowerBoundX - 1; i++){
		if(board[lowerBoundY + i][lowerBoundX + i]){
			return false;
		}
	}
	return true;
}

function nothingBetweenLateral(start, startX, startY, dest, board, isVertical){
	//check that nothing is inbetween
	var upperBound;
	var lowerBound;
	if(dest > start){
		upperBound = dest;
		lowerBound = start;
	}else{
		upperBound = start;
		lowerBound = dest;
	}

	/* since rook can't jump over piece, return false if trying that
	   lowerBound + 1 since its not looking at either end points
	*/
	for(var i = 1; i < upperBound - lowerBound - 1; i++){
		if((isVertical && (board[lowerBound + i][startX] === 0))
		||(!isVertical && (board[startY][lowerBound + i] === 0))){
			return false;
		}

	}
	return true;
}

function findNextPiece(adjustX, adjustY, startX, startY, board){
	console.log(isInBoard(startY));
	if(!isInBoard(startX) || !isInBoard(startY) || !(Math.abs(adjustX) in [0,1]) || !(Math.abs(adjustY) in [0,1])){
		return 0;
	}else if(board[startY][startX] !== 0){
		return board[startY][startX];
	}else{
		return findNextPiece(adjustX, adjustY, startX+adjustX, startY+adjustY, board);
	}
}


function pawn(color, startX, startY, destX, destY, board){
	if(color === "w"){
		//move forward 1
		if(destY - startY === -1){
			//moving diagonal 1, so killing a piece
			if((Math.abs(destX - startX) === 1)
			||(destX === startX && board[destY][destX] === 0)){
			//or, just moving forward(not diagonal) and empty space there
				return true;
			}
		}else if(Math.abs(destY - startY) === 2 && (startY === 6) && (board[destY][destX] === 0)){
		//first move for pawn, move two, also empty space
			return true;
		}
	/*same thing as white, only Y is reversed and we kill white pieces now
		also, can move two if start at y === 1
	*/
	}else if(color === "b"){
		if(destY - startY === 1){
			if((Math.abs(destX - startX) === 1)
			||(destX === startX && board[destY][destX] === 0)){
				return true;
			}
		}else if(Math.abs(destY - startY) === 2 && (startY === 1) && (board[destY][destX] === 0)){
			return true;
		}
	}
	return false;
}

function rook(startX, startY, destX, destY, board){
	//move vertically
	if(((destX === startX) && nothingBetweenLateral(startY, startX, startY, destY, board, true))
	||((destY === startY) && nothingBetweenLateral(startX, startX, startY, destX, board, false))){
	//move horizontally, destY is now destX, startY is now startX
		return true;
	}
	return false;
}

function knight(startX, startY, destX, destY){
	if((Math.abs(destX - startX) === 2 && Math.abs(destY - startY) === 1)
	||(Math.abs(destX - startX) === 1 && Math.abs(destY - startY) === 2)){
		return true;
	}
	return false;
}

function bishop(startX, startY, destX, destY, board){
	if((Math.abs(destX-startX) === Math.abs(destY-startY)) && nothingBetweenDiag(startX, startY, destX, destY, board)){
		return true;
	}
	return false;
}

function queen(startX, startY, destX, destY, board){
	if(Math.abs(destX - startX) === 0 && nothingBetweenLateral(startY, startX, startY, destY, board, true)){
	//move vertical
		return true;
	}else if(Math.abs(destY - startY) === 0 && nothingBetweenLateral(startX, startX, startY, destY, board, false)){
	//move horizontal
		return true;
	}else if((Math.abs(destY - startY) === Math.abs(destX - startX)) && nothingBetweenDiag(startX, startY, destX, destY, board)){
	//move diagonal
		return true;
	}
	return false;
}

// castling is done elsewhere
function king(startX, startY, destX, destY){
	//since eating its own piece is already checked for, nothing to really check
	console.log(startX, startY, destX, destY);
	if((Math.abs(startX - destX) <= 1) && (Math.abs(startY - destY) <= 1)){
		console.log("king is good")
		return true;
	}
	return false;
}

var self = module.exports = {
	/**
	returns 2d array that represents chess board
	N is knight
	b is black
	w is white
	**/
	/*accessing this board
	will be board[Y coord][X coord] because it is row then term*/
	initBoard: function(){
		var board = [["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
				 ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
				 ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]];
		return board;
	},
	
	getMoveInfo: function(movePhrase, board){
		var startX = getCoord(movePhrase.charAt(0));
		var startY = getCoord(movePhrase.charAt(1));
		var destX = getCoord(movePhrase.charAt(2));
		var destY = getCoord(movePhrase.charAt(3));
		console.log(board[startY][startX]);
		var piece = getPiece(startX, startY, board);
		var pieceColor = getColor(startX, startY, board);
	
		return {"startX": startX,
				"startY": startY,
				"destX": destX,
				"destY": destY,
				"piece": piece,
				"pieceColor": pieceColor
		};
	},
	
	/**checks if moving side's king is put in check
	but knight case checks if its putitng opponent king into check

	this should really check if a king is put in check from old position(your king is in check)
	and from new position (enemy king is in check)
	**/
	isCheck: function(color, board){
		console.log(board);
		var king = (() => {
			var kingPhrase = color + "K";
			for(var y = 0; y < 8; y++){
				for(var x = 0; x < 8; x++){
					if(board[y][x] === kingPhrase){
						return {x:x, y:y};
					}
				}
			}
		})();
		console.log("king", king)
		var opponentColor = (color == "w") ? "b" : "w";
		const diagKillerRange = {"Q": 8, "P": 1, "K": 1, "B": 8};
		const horiKillerRange = {"Q": 8, "K": 1, "R": 8};
		const cardinalDirections = {up:[0, 1], down:[0, -1], right:[1, 0], left:[-1, 0],
							se:[1, -1], nw:[-1, 1], ne:[1, 1], sw:[-1, -1]};
		const knightDirections = [[-1, -2], [-1, 2], [1, -2], [1, 2],
								[-2, -1], [-2, 1], [2, -1], [2, 1]];
		for(var i in cardinalDirections){
			var pieceInfo = findPieceWithInfo(cardinalDirections[i], king.x, king.y, board);
			if(isKiller(i, pieceInfo.name, pieceInfo.dist)) {return true};
		}
		for(var i in knightDirections){
			var y = knightDirections[i][1] + king.y;
			var x = knightDirections[i][0] + king.x;
			if (0 <= x && 0 <= y &&
				7 >= x  && 7 >= y ) {
				if (board[y][x] == opponentColor + "N") {
					return true;
				}
			}
		}
		return false;
		function findPieceWithInfo(direction, x, y, board){
			console.log(direction, x, y)
			var dist = 0;
			x = x + direction[0];
			y = y + direction[1];
			dist++;
			while (0 <= x  && 0 <= y &&
				   7 >= x  && 7 >= y ){	
				console.log("X: ", x, "Y: ", y);
				if(board[y][x] != 0){
					console.log("Direction: ",direction);
					console.log("Name: ",board[y][x]);
					console.log("Dist: ",dist);
					return {name:board[y][x], dist:dist}
				}
				x = x + direction[0];
				y = y + direction[1];
				dist++;
			}
			return {name:0, dist:0}
		}

		function isKiller(direction, piece, dist){
			console.log(direction);
			console.log(["up", "down", "left", "right"].includes(direction))
			console.log(["nw", "ne", "se", "sw"].includes(direction))
			if(piece[0] == color){
				return false;
			}
			if (["up", "down", "left", "right"].includes(direction)){
				console.log("hor killer");
				console.log((horiKillerRange[piece[1]] > dist));
				return (horiKillerRange[piece[1]] > dist);
			}
			if (["nw", "ne", "se", "sw"].includes(direction)){
				console.log("diag killer");
				console.log((diagKillerRange[piece[1]] > dist));
				return (diagKillerRange[piece[1]] > dist);
			}
			return false;
		}
		//find all cardinal pieces
		//check if any of them are offensive
		//check for jumper
	},

	/* *** need to check if move is out of range of board - done
		check if it puts own king into check
		check if invalid move command(letter and numbers are out of order or something) - done
		check if move is not putting piece in the same place its already in - done
		check if move tries to kill piece of own colour -done
		check if it is indeed moving its own color piece - done
	*/

	//color is taken in as "w" or "b"
	//move phrase is [PIECE][START][DEST]
	isValidMove: function(movePhrase, color, board){
		var isValid = false;
		console.log("hello 1");
		var moveInfo = self.getMoveInfo(movePhrase, board);
		var startX = moveInfo["startX"];
		var startY = moveInfo["startY"];
		var destX = moveInfo["destX"];
		var destY = moveInfo["destY"];
		var piece = moveInfo["piece"];
		var pieceColor = moveInfo["pieceColor"];
		console.log(moveInfo);
		console.log("hello 2");
		//moving to same space
		if(((startX === destX) && (startY === destY))
		//moving piece of not own color
		|| (pieceColor !== color)
		//killing piece of own color
		|| ((board[destY][destX] !== 0) && getColor(destX, destY, board) === color)){
			return false;
		}
		console.log("hello 3");
		switch(piece){
			case "P":
				isValid = pawn(color, startX, startY, destX, destY, board);
				break;
			case "R":
				isValid = rook(startX, startY, destX, destY, board);
				break;
			case "N":
				isValid = knight(startX, startY, destX, destY);
				break;
			case "B":
				isValid = bishop(startX, startY, destX, destY, board);
				break;
			case "Q":
				isValid = queen(startX, startY, destX, destY, board);
				break;
			case "K":
				isValid = king(startX, startY, destX, destY);
				break;
		}
		console.log("hello 4");
		console.log("isValid so far: " , isValid);
		//if the move is valid but mover's king is in check before move
		if(isValid){
			var afterBoard = board.map(function(arr) {
			    return arr.slice();
			});
			afterBoard[startY][startX] = 0
			afterBoard[destY][destX] = pieceColor + piece;
			if(self.isCheck(color, afterBoard)){
				return false;
			}
		}
		console.log("hello 5");
		return isValid;
	}
	
}
