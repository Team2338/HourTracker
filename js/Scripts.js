import { firebaseConfig } from './databaseConfig.js';

firebase.initializeApp(firebaseConfig);

export var firestore = firebase.firestore();
export var people = firestore.collection("Users"); // .orderBy("studentID"); would need to add studentID field to each doc
export var admins = firestore.collection("googleSignIn");
export var user = firebase.auth().currentUser;

export var auth = firebase.auth();
export var realTimeDataBase = firebase.database();

/*
function signIn() {
	// Sign in Firebase using popup auth and Google as the identity provider.
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider);
}*/

// Signs-out of application

export function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

export function signOut(){
	auth.signOut()
	.then(() => {
		console.log('signed Out');
	}).catch((err) => {
		console.log('err at Scripts.js: signOut()', err);
	});
}

// Initiate firebase auth.
export function initFirebaseAuth() {
	
	console.log("<---------------initFirebaseAuth-------------------->>>");

	firebase.auth().onAuthStateChanged((user) => {

		console.log("<-------------------AuthState Change---------------->>>");
		var profilePicUrl;
		var userName;
	
		if(user){
			// signed in

			console.log('signed in');
			$("#signOutButton").click(signOut);

			userName = getUserName();
			$("#userName").html(userName);

			profilePicUrl = getProfilePicUrl();
			$('#profilePic').attr('src',profilePicUrl);

		} else {
			verify();
			// signed out
		}
		
	});
	console.log('init firebase auth complete');

	//sleep(2000);

	// Listen to auth state changes.
	
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
	return firebase.auth().currentUser.photoURL || '../Pictures/anonymous icon.png';
}
  
// Returns the signed-in user's display name.
function getUserName() {
	return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
	return !!firebase.auth().currentUser;
}

export function loadExternalHTML(){
	$(document).ready(function () {
		$("div[data-includeHTML]").each(function () {
			$(this).load($(this).attr("data-includeHTML"));
		});
	});
}

export function checkPermissions(error,after){
	
	if(error.message == "Missing or insufficient permissions."){
		//console.log(error);
		alert("Your account has missing or insufficient permissions. You will be signed out. Please sign in using an admin account or contact an admin to verify your account as a user.");
		//create possible Admin file

		var currentUID = firebase.auth().currentUser.uid;

		var docRef = firestore.collection("googleSignIn").doc(currentUID);

		docRef.get().then(function(doc){
			console.log('get');
			if(doc.exists){
				console.log('exists');
				sleep(2000);
				//alert('Cannot create new student, Student exists');
			}else{
				docRef.set({
					email: firebase.auth().currentUser.email,
					Name: firebase.auth().currentUser.displayName,
					admin: "false"
				});
				console.log('fileWrite');
			}
		
		}).catch(function(error){
			console.log(error);
			
		});
		
		sleep(2000);
		after(error);
		signOut();
	} else {
		after(error);
	}
	
}

function verify(){
	
	if (user) {
		console.log('user signed in');
	} else {

		firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
		.then(() => {
			var provider = new firebase.auth.GoogleAuthProvider();
			// In memory persistence will be applied to the signed in Google user
			// even though the persistence was set to 'none' and a page redirect
			// occurred.
			return firebase.auth().signInWithRedirect(provider);
		})
		.catch((error) => {
			// Handle Errors here.
			console.log(error);
			var errorCode = error.code;
			var errorMessage = error.message;
		});

		firebase.auth()
		.getRedirectResult()
		.then((result) => {
			if (result.credential) {
				/** @type {firebase.auth.OAuthCredential} */
				var credential = result.credential;

				// This gives you a Google Access Token. You can use it to access the Google API.
				var token = credential.accessToken;
				// ...
			}
			// The signed-in user info.
			user = result.user;
		}).catch((error) => {
			// Handle Errors here.
			var errorCode = error.code;
			console.log(error);
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			// ...
		});
	}
}

/*
*   returns local date in YYYY-MM-DD format
*/
export function today(){
    // need to convert to local time
    let utcDate = new Date();
    var yourDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset()*60*1000));
    return yourDate.toISOString().split('T')[0];
}

/*
*   returns local date in Date format
*/
export function todayDate(){
    let utcDate = new Date();
    return utcDate;
}

/*
function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}
*/