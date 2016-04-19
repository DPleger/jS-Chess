$(function() {
	logi();
	console.log("Logic Queued Up: All Systems GREEN");
	ParseFen(START_FEN);
	PrintBoard();
});

function RunFilesRankBoard() {
	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;

	for(var index=0; index<BOARD_SQ_NUM; index++) {
		FilesBrd[index] = SQUARES.OUTOFBOUNDS;
		RanksBrd[index] = SQUARES.OUTOFBOUNDS;	
	}

	for(var rank=RANKS.RANK_1; rank<=RANKS.RANK_8; rank++) {
		for(file = FILES.FILE_A; file<=FILES.FILE_H; file++) {
			sq = FRSQ(file, rank);
			FilesBrd[sq] = file;
			RanksBrd[sq] = rank;
		}
	}
}

function InitHashKeys() {
	var index = 0;

	for(var index=0; index<14*120; index++) {
		PieceVals[index] = RANDVAL();
	}

	SideKey = RANDVAL();

	for(var index=0; index<16; index++) {
		CastleKeys[index] = RANDVAL();
	}
}

function InitSq120To64() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1
	var sq = SQUARES.A1;
	var sq64 = 0;

	for(var index=0; index<BOARD_SQ_NUM; index++) {
		Sq64toSq120[index] = 65;
	}

	for(var index=0; index<64; ++index) {
		Sq64toSq120[index] = 120;
	}

	for(var rank=RANKS.RANK_1; rank<=RANKS.RANK_8; rank++) {
		for(var file=FILES.FILE_A; file<=FILES.FILE_H; file++) {
			sq = FRSQ(file,rank);
			Sq64toSq120[sq64] = sq;
			Sq120toSq64[sq] = sq64;
			++sq64;
		}
	}
}

function logi() {
	console.log("Logic() initialized!");
	RunFilesRankBoard();
	InitHashKeys();
	InitSq120To64();

};