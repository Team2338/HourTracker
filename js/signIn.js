// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/



function setup(){
	
	//console.log('signIn.js loaded');

	ui.start('#firebaseui-auth-container', {
		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				$('.showOnSignIn').css('visibility','visible');
				//$('.showHideSignIn').css('visibility','hidden');

				var user = firebase.auth().currentUser;

				var profilePicUrl;
				if (user != null) {
					user.providerData.forEach(profile => {
				   		console.log(profile.photoURL);
						profilePicUrl = profile.photoURL;
					});
				}
				$('#profilePic').src = profilePicUrl;

				return false;
			},
			uiShown: function() {
				// The widget is rendered.
				// Hide the loader.
				document.getElementById('loader').style.display = 'none';
			}
		},

		// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
		//signInFlow: 'popup',

		//signInSuccessUrl: '../html/admin.html',
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
