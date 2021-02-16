/*
var firebaseConfig = {
    apiKey: "AIzaSyBQiIjrNDtP2A5-gNAOakkaeieoLWvpwqQ",
    authDomain: "hourtracker-2b6f8.firebaseapp.com",
    projectId: "hourtracker-2b6f8",
    storageBucket: "hourtracker-2b6f8.appspot.com",
    messagingSenderId: "82969866110",
    appId: "1:82969866110:web:5a089299065444cbea0d2f",
    measurementId: "G-DS4GRL509N"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
*/

var ui = new firebaseui.auth.AuthUI(firebase.auth());

function setup(){
	console.log('header.js loaded');

	ui.start('#firebaseui-auth-container', {
		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				return true;
			},
			uiShown: function() {
				// The widget is rendered.
				// Hide the loader.
				//document.getElementById('loader').style.display = 'none';
			}
		},
		// Will use popup for IDP Providers sign-in flow instead of the default, redirect.

		signInSuccessUrl: '../html/admin.html',
		signInOptions: [
			// List of OAuth providers supported.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			//firebase.auth.FacebookAuthProvider.PROVIDER_ID,
			//firebase.auth.TwitterAuthProvider.PROVIDER_ID,
			//firebase.auth.GithubAuthProvider.PROVIDER_ID
		],
		// Other config options...
	});

}

setup();