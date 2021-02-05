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

	month = (month.length === 1)? '0' + month : month;
	day = (day.length === 1)? '0' + day : day;

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
						responseBox.html("checkin successful");

					} else if(Logdoc.exists && toggleChecked){
						console.log('checkout');
						docRefLog.set({
							clockInHour: Logdoc.data().clockInHour,
							clockInMinute: Logdoc.data().clockInMinute,
							clockOutHour: HOUR,
							clockOutMinute: MINUTE,
							hourType: type
						});
						responseBox.html("checkout successful");

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
	
	console.log('checkIn.js loaded');

	people.get()
	.then(function(querySnapshot) {
		//dataTableHTML = '';
		querySnapshot.forEach(function(doc) {
			console.log(doc.id, " => ", doc.data());
			//var option = document.createElement('option');
			//option.value = doc.id;
			//option.text = doc.data().firstName +" "+doc.data().lastName;
			nameSelect.append(new Option(doc.data().firstName +" "+doc.data().lastName, doc.id));
			//nameSelect.appendChild(option);
		});
		//dataTableBody.innerHTML = dataTableHTML;
	})
	.catch(function(error) {
		console.log("Error getting documents: ", error);
	});
	
	form.submit(submitData);
	
}

setup();