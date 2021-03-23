/** firebase */
var firebaseConfig = {
	apiKey: "AIzaSyBQiIjrNDtP2A5-gNAOakkaeieoLWvpwqQ",
	authDomain: "hourtracker-2b6f8.firebaseapp.com",
	projectId: "hourtracker-2b6f8",
	storageBucket: "hourtracker-2b6f8.appspot.com",
	messagingSenderId: "82969866110",
	appId: "1:82969866110:web:5a089299065444cbea0d2f",
	measurementId: "G-DS4GRL509N"
};

firebase.initializeApp(firebaseConfig);

export var firestore = firebase.firestore();
export var people = firestore.collection("Users");

export var auth = firebase.auth();
export var ui = new firebaseui.auth.AuthUI(auth);
export var realTimeDataBase = firebase.database();

/*
function signIn() {
	// Sign in Firebase using popup auth and Google as the identity provider.
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider);
}*/

// Signs-out of application
export function signOut(){
	auth.signOut()
	.then(() => {
		console.log('signed Out');
	}).catch((err) => {
		console.log('err at Scripts.js: signOut()', err);
	});
}

export function authStateObserver(user){

	var profilePicUrl;
	var userName;

	if(user){// signed in

		profilePicUrl = getProfilePicUrl();
		userName = getUserName();

		$('.showOnSignIn').css('visibility','visible');
		$('.showWhenSignedOut').css('visibility','hidden');

	} else {// signed out

		profilePicUrl = 'Pictures/anonymous icon.png';
		userName = 'not signed In';

		$('.showOnSignIn').css('visibility','hidden');
		$('.showWhenSignedOut').css('visibility','visible');
	}

	$('#profilePic').href = profilePicUrl;
	
}

// Initiate firebase auth.
export function initFirebaseAuth() {
	// Listen to auth state changes.
	firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
export function getProfilePicUrl() {
	return firebase.auth().currentUser.photoURL || '../Pictures/anonymous icon.png';
}
  
// Returns the signed-in user's display name.
export function getUserName() {
	return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
export function isUserSignedIn() {
	return !!firebase.auth().currentUser;
}

/*export function pageInit(){

	loadExternalHTML();
	initFirebaseAuth();

	$('.showOnSignIn').css('visibility','visible');
	$('.showWhenSignedOut').css('visibility','hidden');

	verify();

}*/

export function loadExternalHTML(){
	$(document).ready(function () {
		$("div[data-includeHTML]").each(function () {
			$(this).load($(this).attr("data-includeHTML"));
		});
	});
}

/*
export function verify(){

	auth.onAuthStateChanged(authStateObserver);

	var provider = new firebase.auth.GoogleAuthProvider();
	auth.signInWithPopup(provider);
	
}*/

export function verify(onSuccess){

	document.getElementById("signOutButton").click(signOut);

	var config = {

		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {

				onSuccess();
				/*
				var profilePicUrl;
				var user = auth.currentUser;
				padding: 14px 16px;
				console.log(user.providerData);

				if (user != null) {
					user.providerData.forEach(profile => {

						profilePicUrl = profile.photoURL;
						console.log(profilePicUrl);
					});
				}

				$('#profilePic').html('<img class = "profPic" src = "'+ profilePicUrl+'">');
				*/

				$('#authStatus').html('signed In');

				// User successfully signed in.
				// Return type determines whether we continue the redirect automatically
				// or whether we leave that to developer to handle.
				return false;
			},
			uiShown: function() {
				// The widget is rendered.
				// Hide the loader.
				document.getElementById('loader').style.display = 'none';
			}
		},

		signInOptions: [
			{
				provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
				customParameters: {
					// Forces password re-entry.
					auth_type: 'reauthenticate'
				}
			}//,
/*			{
				provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
				customParameters: {
					// Forces password re-entry.
					auth_type: 'reauthenticate'
				}
			}*/
		]
		
	};

	ui.start('#firebaseui-auth-container', config);
	
}

/**function logIDFirestore(
  IDNumber,
  time,
  type,
  onStart,
  onCheckIn,
  onCheckOut,
  onCheckOutWithoutClockIn,
  onSecondClockIn,
  onEnd,
  checkOut
  ){
	onStart();

	var time = new Date();
	scanBlock = true;

	console.log('Id number found '+ IdNumber +' at: ');
	console.log(time);
	
	var year = String(time.getFullYear());
	var month = String(time.getMonth() +1);
	// month +1 because index starts at 0
	var day = String(time.getDate());

	month = (month.length == 1)? '0' + month : month;
	day = (day.length == 1)? '0' + day : day;
	
	var HOUR = time.getHours();
	var MINUTE = time.getMinutes();
	// redefined to remove seconds and ms
	var studentID = String(IdNumber);
	
	var type = typeToggle.is(':checked')? "service" : "shop" ;
	var checkOut = toggle.is(':checked');

	console.log(type);
	console.log(checkOut);

	var docName = month + day + year;
	var docRefStudent = people.doc(studentID);
	var docRefLog = docRefStudent.collection("logs").doc(docName);
	
	docRefStudent.get().then(function(Studentdoc){

		if(Studentdoc.exists){

			docRefLog.get().then(function(Logdoc){
			
				if(!Logdoc.exists && !checkOut){
					// checkin
					
					greenBox.css('visibility', 'visible');
					resultBox.html("Welcome "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName);

					docRefLog.set({
						clockInHour: HOUR,
						clockInMinute: MINUTE,
						clockOutHour: "N/A",
						clockOutMinute: "N/A",
						hourType: type
					});
					
					realTimeDataBase.ref('users/').once('value').then((snapshot) => {
	
						var peopleList = snapshot.val().here;
						console.log(peopleList);
						if (peopleList === [["N/A","N/A","N/A"]]){
							peopleList = [];
						}
						peopleList.push([Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]);
						console.log(peopleList);							
						
						realTimeDataBase.ref('users/').set({
							here: peopleList
						});
					}).catch(function(err){
						// purges the database and adds the person
						console.log(err);
						var peopleList = [[Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]];
						realTimeDataBase.ref('users/').set({
							here: peopleList
						});
					});

					reset();

				} else if(Logdoc.exists && checkOut){
					// checkout
					greenBox.css('visibility', 'visible');
					resultBox.html("Goodbye "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName);

					docRefLog.set({
						clockInHour: Logdoc.data().clockInHour,
						clockInMinute: Logdoc.data().clockInMinute,
						clockOutHour: HOUR,
						clockOutMinute: MINUTE,
						hourType: type
					});

					realTimeDataBase.ref('users/').once('value').then((snapshot) => {
						var peopleList = snapshot.val().here;
						console.log(peopleList);
						
						// remove that element
						peopleList = peopleList.filter(function(el) {
							if(el[0] === Studentdoc.id){
								return;
							}else{
								return el
							}
							
						});
						if (peopleList.length === 0){
							peopleList = [["N/A","N/A","N/A"]];
						}
						console.log(peopleList);
						
						realTimeDataBase.ref('users/').set({
							here: peopleList
						});
					});

					reset();

				} else if(!Logdoc.exists && checkOut){
					// you never clocked in
					greenBox.css('visibility', 'visible');
					resultBox.html("Goodbye "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName+ ", you forgot to clock in 😔");

					docRefLog.set({
						clockInHour: "N/A",
						clockInMinute: "N/A",
						clockOutHour: HOUR,
						clockOutMinute: MINUTE,
						hourType: type
					});

					reset();
				} else if(Logdoc.exists && !checkOut){
					// you already clocked in
					greenBox.css('visibility', 'visible');
					resultBox.html("Welcome "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName+ " you already clocked in today");

					reset();
				}
			});
	
		}else{
			resultBox.html('Error: ID #'+studentID+' not found');
		}
			
	});
	}


};
*/