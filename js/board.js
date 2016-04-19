

function PCEINDEX(pce, pceInv) {
	return (pce * 10 + pceInv);
}

var Space = {};

Space.pieces = new Array(BOARD_SQ_NUM);
Space.side = TEAMS.WHITE;
Space.drawCount = 0;
Space.halfMove = 0;
Space.Move = 0;
Space.pawnPas = 0;
Space.castlePerm = 0;
Space.color = new Array(2); 
Space.pceInv = new Array(13);
Space.pList = new Array(14*10);
Space.posVal = 0;
Space.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
Space.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
Space.moveListStart = new Array(MAXDEPTH);


function PrintBoard() {

	var sq,file,rank,piece;

	console.log("\nGame Board:\n");
	for(var rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line = (RankChar[rank] + "  ");
		for(var file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FRSQ(file,rank);
			piece = Space.pieces[sq];
			line += (" " + PceChar[piece] + " ");
		}
		console.log(line);
	}

	console.log("");
	var line = "  ";
	for(var file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + FileChar[file] + ' ');
	}

	console.log(line);
	console.log("side:" + SideChar[Space.side] );
	console.log("enPas:" + Space.pawnPas);
	line = "";

	if(Space.castlePerm & CASTLEBIT.WKCA) line += "K";
	if(Space.castlePerm & CASTLEBIT.WQCA) line += "Q";
	if(Space.castlePerm & CASTLEBIT.BKCA) line += "k";
	if(Space.castlePerm & CASTLEBIT.BQCA) line += "q";
	console.log("castle:" + line);
	console.log("key:" + Space.posVal.toString(16));
}



function GeneratePosVal() {

	var sq = 0;
	var finalVal = 0;
	var piece = CHARS.EMPTY;

	for(var sq=0; sq<BOARD_SQ_NUM; sq++) {
		piece = Space.pieces[sq];
		if(piece != CHARS.EMPTY && piece != SQUARES.OUTOFBOUNDS) {
			finalVal ^= PieceVals[(piece * 120) + sq];
		}
	}

	if(Space.side == TEAMS.WHITE) {
		finalVal ^= SideVal;
	}

	if(Space.pawnPas != SQUARES.NO_SQ) {
		finalVal ^= PieceVal[Space.pawnPas];
	}

	return finalVal;
}

function ResetBoard() {

	var index = 0;

	for(var index=0; index<BOARD_SQ_NUM; index++) {
		Space.pieces[index] = SQUARES.OUTOFBOUNDS;
	}

	for(var index=0; index<64; index++) {
		Space.pieces[SQ120(index)] = CHARS.EMPTY;
	}

	for(var index=0; index<14 * 120; index++) {
		Space.pList[index] = CHARS.EMPTY;
	}

	for(var index=0; index<2; index++) {
		Space.color[index] = 0;
	}

	for(var index=0; index<13; index++) {
		Space.pceInv[index] = 0;
	}

	Space.side = TEAMS.BOTH;
	Space.pawnPas = SQUARES.NO_SQ;
	Space.drawCount = 0;
	Space.move = 0;
	Space.halfMove = 0;
	Space.castlePerm = 0;
	Space.posVal = 0;
	Space.moveListStart[Space.move] = 0;

}

function ParseFen(fen) {

	ResetBoard();

	var rank = RANKS.RANK_8;
	var file = FILES.FILE_A;
	var piece = 0;
	var count = 0;
	var i = 0;
	var sq120 = 0;
	var fenCnt = 0;

	while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
		count = 1;
		switch (fen[fenCnt]) {
			case 'p': 
				piece = CHARS.bP;
				break;
			case 'r':
				piece = CHARS.bR;
				break;
			case 'n':
				piece = CHARS.bN;
				break;
			case 'b':
				piece = CHARS.bB;
				break;
			case 'k':
				piece = CHARS.bK;
				break;
			case 'q':
				piece = CHARS.bQ;
				break;
			case 'P':
				piece = CHARS.wP;
				break;
			case 'R':
				piece = CHARS.wP;
				break;
			case 'N':
				piece = CHARS.wN;
				break;
			case 'B':
				piece = CHARS.wB;
				break;
			case 'K':
				piece = CHARS.wK;
				break;
			case 'Q':
				piece = CHARS.wQ;
				break;

			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
				piece = CHARS.EMPTY;
				count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
				break;

			case '/':
			case ' ':
				rank--;
				file = FILES.FILE_A;
				fenCnt++;
				continue;
			default:
				console.log("What is this, I don't even?!");
				return;

		}

		for(var i=0; i<count; i++) {
			sq120 = FRSQ(file, rank);
			Space.pieces[sq120] = piece;
			file++;
		}
		fenCnt++;

	}	

	Space.side = (fen[fenCnt] == 'w') ? TEAMS.WHITE : TEAMS.BLACK;
	fenCnt += 2;

	for (var i=0; i<4; i++) {
		if (fen[fenCnt] == ' ') {
			break;
		}
		switch(fen[fenCnt]) {
			case 'K' : 
				Space.castlePerm |= CASTLEBIT.WKCA;
				break;
			case 'Q':
				Space.castlePerm |= CASTLEBIT.WQCA;
				break;
			case 'k':
				Space.castlePerm |= CASTLEBIT.BKCA;
				break;
			case 'q':
				Space.castlePerm |= CASTLEBIT.BQCA;
				break;
			default:
				break;
		}
		fenCnt++;
	}
	fenCnt++;

	if (fen[fenCnt] != '-') {
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();
		console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
		Space.pawnPas = FRSQ(file, rank);
	}

	Space.posVal = GeneratePosVal();



}