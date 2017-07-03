module.exports = {
	/**
	takes in value from move command from message, 
	converts it to value that can be used for accessing
	the board array
	**/
	function coordToArrPos(val){
		const convert = { "a": 0, "b": 1, "c": 2, "d": 3, "e": 4, 
			"f": 5, "g": 6, "h": 7, 8: 0, 7: 1, 6: 2, 
			5: 3, 4: 4, 3: 5, 2: 6, 1: 7};

		return convert[val];
	}

	/**
	returns 2d array that represents chess board
	N is knight
	b is black
	w is white
	**/
	function initBoard(){
		board = [[bR, bN, bB, bQ, bK, bB, bN, bR],
				 [bP, bP, bP, bP, bP, bP, bP, bP],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [wP, wP, wP, wP, wP, wP, wP, wP],
				 [wR, wN, wB, wQ, wK, wB, wN, wR]];
		return board;
	}

	function isValidMove(color, piece, start, dest){

	}
};