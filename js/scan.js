//JS for scanIn.html
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

var db = firebase.firestore();
var people = db.collection("Users");

var ui = new firebaseui.auth.AuthUI(firebase.auth());

/** html docrefs */
const resultBox = $('#result');
const toggle = $('#checkInSwitchToggle');
const typeToggle = $('#typeSwitchToggle');
const switchDisplay = $('#switchDisplay');
const greenBox = $('#greenBox');

/** scanning */
let deviceId;
var codeReader = new ZXing.BrowserBarcodeReader();

/** processing and logging*/
const studentIDLength = 8;
const greenBoxVisibilityDelay = 3000;
var scanBlock = false;


function processBarcode(result,err){
	// essentially checks for barcode validity

	if (err) {
		var different = true;
		// other errors break loop <= need to find fix for broken loops
		if (err instanceof ZXing.NotFoundException) {
			//console.log('No code found.');
			different = false;
		}
		if (err instanceof ZXing.ChecksumException) {
			different = false;
			console.log('A code was found, but it\'s read value was not valid.');
		}
		if (err instanceof ZXing.FormatException) {
			different = false;
			console.log('A code was found, but it was in a invalid format.');
		}
		if (different === true) {
			console.log('we got an interesting error\n',err);
		}
	} else if ((result.text.length == studentIDLength) && !scanBlock) {
		onFoundBarcode(result.text);
	} else if (scanBlock){
		//console.log('scan to early, scan was blocked');
	} else {
		// I theorize this case breaks above loop maybe find a reset instead
		//codeReader.reset();
		console.log("Faulty scan: "+result+"\n reload may be necessary");
		location.reload();
	}
	
}

function onFoundBarcode(IdNumber){
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
					
					firebase.database().ref('users/').once('value').then((snapshot) => {
	
						var peopleList = snapshot.val().here;
						console.log(peopleList);
						if (peopleList === [["N/A","N/A","N/A"]]){
							peopleList = [];
						}
						peopleList.push([Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]);
						console.log(peopleList);							
						
						firebase.database().ref('users/').set({
							here: peopleList
						});
					}).catch(function(err){
						// purges the database and adds the person
						console.log(err);
						var peopleList = [[Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]];
						firebase.database().ref('users/').set({
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

					firebase.database().ref('users/').once('value').then((snapshot) => {
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
						
						firebase.database().ref('users/').set({
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

function reset(){
	setTimeout(function(){
		resultBox.html('<em>Scanning ...</em>');
		greenBox.css('visibility', 'hidden');
		scanBlock = false;
	}, greenBoxVisibilityDelay);
}


function signOut(){
	firebase.auth().signOut().then(() => {
		$('.showOnSignIn').css('visibility','hidden');
	  }).catch((error) => {
		console.log('err');
	  });
}

function setup(){

	$(document).ready(function () {
		$("div[data-includeHTML]").each(function () {
			$(this).load($(this).attr("data-includeHTML"));
		});
	});

	console.log('scan.js loaded');

	ui.start('#firebaseui-auth-container', {
		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				$('.showOnSignIn').css('visibility','visible');
				//$('.showHideSignIn').css('visibility','hidden');
				console.log(authResult.credential.accessToken);
				var user = firebase.auth().currentUser;
				var profilePicUrl;
/*
				people.doc(user.accessToken.).get()
				.then(function(querySnapshot) {
					//dataTableHTML = '';
					querySnapshot.forEach(function(doc) {
						console.log(doc.id, " => ", doc.data());
						if(doc.id.length === 8){// filters out admins which use UIDs that are greater than 8 cha
							renderRowHTML(doc);
						}
					});
					//dataTableBody.innerHTML = dataTableHTML;
				})
				.catch(function(error) {
					console.log("Error getting documents: ", error);
				});*/
				
				onSignIn();
				
				if (user != null) {
					user.providerData.forEach(profile => {
				   		console.log(profile.photoURL);
						profilePicUrl = profile.photoURL;
					});
				}
				$('#profilePic').html('<img class = "profPic" src = "'+ profilePicUrl+'">');
				return false;
			},
			uiShown: function() {
				// The widget is rendered.
				// Hide the loader.
				document.getElementById('loader').style.display = 'none';
			}
		},
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

	/** Barcode Scanner init */

	// list our all camera devices

	
}

function onSignIn(){

	codeReader
	.listVideoInputDevices()
	.then(videoInputDevices => {
		videoInputDevices.forEach(device =>
			console.log(`${device.label}, ${device.deviceId}`)
		);
	})
	.catch(err => console.error(err));
	
	// goes to system default
	deviceId = undefined;
	// pick a device and start continous scan

	codeReader.decodeFromInputVideoDeviceContinuously(deviceId, 'videoStream',(result, err) =>{
		processBarcode(result,err);
	});

	$('#top').css('visibility', 'visible');
	$('#middle').css('visibility', 'visible');
	$('#bottom').css('visibility', 'visible');

}


setup();