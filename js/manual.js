// js for checkIn.html

/** firebase **/
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
var fbRTDB = firebase.database();
var people = db.collection("Users");

/** html docrefs **/
const toggle = $('#toggle');
const typeToggle = $('#typeSwitchToggle');
const responseBox = $('#responseBox');
const nameSelect = $('#nameSelect');
const form = $('#form');

/** other js stuff **/
var time;

function submitData(event){

	time = new Date();

	// to prevent reload of the webpage on submit
	event.preventDefault();
	
	console.log('submit');
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
 
	var studentID = nameSelect.val();
	var type = typeToggle.is(':checked')? "service" : "shop" ;
	var toggleChecked = toggle.is(':checked');
	
	var docName = month + day + year;
	var docRefStudent = people.doc(studentID);
	var docRefLog = docRefStudent.collection("logs").doc(docName);

/*
	if(type === "shop"){
		newShopHours = elapsedTime/3600000; // converting ms to hours
		newServiceHours = 0;
		console.log(newShopHours);
	} else if(type === "service"){
		newServiceHours = elapsedTime/3600000;
		newShopHours = 0;
		console.log(newServiceHours);
	}
*/	
	if(studentID.length == 8){
		
		docRefStudent.get().then(function(Studentdoc){

			if(Studentdoc.exists){

				docRefLog.get().then(function(Logdoc){
					if(!Logdoc.exists && !toggleChecked){
						console.log('checkin');						
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

							peopleList.push([Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]);
							console.log(peopleList);
							
							firebase.database().ref('users/').set({
								here: peopleList
							});
						}).catch(function(err){
							var peopleList = [[Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]];
							firebase.database().ref('users/').set({
								here: peopleList
							});
						});

						//sets here to an id, name and lastname
						
						responseBox.html("Welcome "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName);

					} else if(Logdoc.exists && toggleChecked){
						console.log('checkout');
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

							console.log(peopleList);
							
							firebase.database().ref('users/').set({
								here: peopleList
							});
						});

						responseBox.html("checkout successful");

						//removes 

					} else if(!Logdoc.exists && toggleChecked){
						console.log('you never clocked in');
						docRefLog.set({
							clockInHour: "N/A",
							clockInMinute: "N/A",
							clockOutHour: HOUR,
							clockOutMinute: MINUTE,
							hourType: type
						});
						responseBox.html("you never clocked in");

					} else if(Logdoc.exists && !toggleChecked){
						console.log('you already clocked in today');
						responseBox.html("you already clocked in today");
					}

				});
/*
				docRefLog.set({
		
					clockInHour: CLOCK_IN_HOUR,
					clockInMinute: CLOCK_IN_MINUTE,
					
					clockOutHour: CLOCK_OUT_HOUR,
					clockOutMinute: CLOCK_OUT_MINUTE,
					
					hourType: type
				});
*/

			}else{
				alert('Error: ID #'+studentID+' not found');
			}
				
		});
				
		console.log('data in Firebase');
	
	} else {
		alert("check your StudentID, it should be 8 chars long");
	}
	
}

function setup(){

	$(document).ready(function () {
		$("div[data-includeHTML]").each(function () {
			$(this).load($(this).attr("data-includeHTML"));
		});
	});
	
	console.log('checkIn.js loaded');

	var optsList= []

	people.get()
	.then(function(querySnapshot) {
		
		querySnapshot.forEach(function(doc) {
			console.log(doc.id, " => ", doc.data());
			optsList.push(new Option(doc.data().lastName+", "+doc.data().firstName, doc.id));
		});

		optsList.sort(function (a, b) {
			return $(a).text() > $(b).text() ? 1 : -1;
		});

		optsList.forEach(function(element) {
			nameSelect.append(element);
		});

		
	})
	.catch(function(error) {
		console.log("Error getting documents: ", error);
	});

	form.submit(submitData);
	
}

setup();