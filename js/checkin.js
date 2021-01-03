// js for checkin
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
firebase.analytics();

// !!Warning!! read this
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

var db = firebase.firestore();

var time;

function submitData(event){
	
	event.preventDefault();
	
	console.log('submit');
	console.log(time);
	
	var timeStayedToday = document.querySelector('#time-select').value;
	var studentID = document.querySelector('#student-id-box').value;
	var type = document.querySelector('#hour-type').value;
	
	var year = String(time.getFullYear());
	var month = String(time.getMonth());
	var date = String(time.getDate());
	var hour = String(time.getHours());
	var minute = String(time.getMinutes());
	var second = String(time.getSeconds());
	
	
	var serviceHoursTemp;
	var shopHoursTemp;
	
	var docName = month + date + year;
	var timeHMS = hour+minute+second;
	
	if(studentID.length == 8){
				
		db.collection("Users").doc(studentID).collection("logs").doc(docName).set({
			
			timeIn: timeHMS,
			timeStayed: timeStayedToday,
			
			hourType: type //service or shop				
		});
		
		db.collection("Users").doc(studentID).get().then(function(doc){
			serviceHoursTemp = doc.data().serviceHours;
			shopHoursTemp =doc.data().shopHours;
		});
		
		if(type == "service"){
			db.collection("Users").doc(studentID).set({
				serviceHours : serviceHoursTemp + parseInt(timeStayedToday)
			});
		} else {
			db.collection("Users").doc(studentID).set({
				shopHours : shopHoursTemp + parseInt(timeStayedToday)
			});
		}

		
		console.log('data in Firebase');
	
	} else {
		alert("check your StudentID, it should be 8 chars long");
	}
	
	
}

function setup(){
	
	//console.log('setup');
	
	time = new Date();
	var display = document.querySelector('#recorded-time-display');
	display.innerHTML = time;
	
	var form = document.querySelector('#form');
	
	form.addEventListener('submit',submitData);
	
}

setup();