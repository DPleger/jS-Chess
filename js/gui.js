$(document).ready(function(){
$("#SetPOS").click(function () {
	var fenStr = $("#posIN").val();
	ParseFen(fenStr);
	PrintBoard();
});
});