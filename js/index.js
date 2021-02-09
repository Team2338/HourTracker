// JS for index.html
// this file is empty but just here by convention

// !!Warning!! read this
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

function setup(){
	
	console.log('index.js');

	$(document).ready(function () {
		$("div[data-includeHTML]").each(function () {
			$(this).load($(this).attr("data-includeHTML"));
		});
	});
}

setup();