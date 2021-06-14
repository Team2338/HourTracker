// JS for index.html
import { loadExternalHTML, initFirebaseAuth} from './Scripts.js';
// !!Warning!! read this
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

function setup(){

	console.log('index.js loaded');

	initFirebaseAuth();
	loadExternalHTML();
	
}

setup();