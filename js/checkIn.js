// js for checkIn.html
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

// !!Warning!! read this
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

var db = firebase.firestore();

var timeIn;
var timeOut;

var display = document.querySelector('#recorded-time-display');
var hourSelect = document.querySelector('#select-hour');

function submitData(event){

	// to prevent reload of the webpage on submit
	event.preventDefault();
	
	console.log('submit');
	console.log(timeIn);

	var year = String(timeIn.getFullYear());
	var month = String(timeIn.getMonth() +1);
	// month +1 because index starts at 0
	var day = String(timeIn.getDate());

	month = (month.length === 1)? '0' + month : month;
	day = (day.length === 1)? '0' + day : day;

	var CLOCK_IN_HOUR = String(timeIn.getHours());
	var CLOCK_IN_MINUTE = String(timeIn.getMinutes());
	
	var CLOCK_OUT_HOUR = document.querySelector('#select-hour').value;
	var CLOCK_OUT_MINUTE = document.querySelector('#select-minute').value;

	var timeOut = new Date(year,month-1,day,CLOCK_OUT_HOUR,CLOCK_OUT_MINUTE);
	timeIn = new Date(year,month-1,day,CLOCK_IN_HOUR,CLOCK_IN_MINUTE);
	// redefined to remove seconds and ms

	var elapsedTime = timeOut.getTime() - timeIn.getTime();

	console.log(elapsedTime);

	var studentID = document.querySelector('#student-id-box').value;
	var type = document.querySelector('#hour-type').value;
	
	var docName = month + day + year;
	var docRefStudent = db.collection("Users").doc(studentID);
	var docRefLog = docRefStudent.collection("logs").doc(docName);

	var newShopHours;
	var newServiceHours;

	if(elapsedTime <= 0){
		alert('negative hours');
	}

	if(type === "shop"){
		newShopHours = elapsedTime/3600000; // converting ms to hours
		newServiceHours = 0;
		console.log(newShopHours);
	} else if(type === "service"){
		newServiceHours = elapsedTime/3600000;
		newShopHours = 0;
		console.log(newServiceHours);
	}
	
	if(studentID.length == 8){
		
		docRefStudent.get().then(function(doc){

			if(doc.exists){

				docRefLog.set({
		
					clockInHour: CLOCK_IN_HOUR,
					clockInMinute: CLOCK_IN_MINUTE,
					
					clockOutHour: CLOCK_OUT_HOUR,
					clockOutMinute: CLOCK_OUT_MINUTE,
					
					hourType: type
				});

				docRefStudent.set({
					firstName: doc.data().firstName,
					lastName: doc.data().lastName,
					teamNumber: doc.data().teamNumber,
					subteam: doc.data().subteam,
					role: doc.data().role,
					shopHours: doc.data().shopHours + newShopHours,
					serviceHours: doc.data().serviceHours + newServiceHours
				});
				display.innerHTML = 'Your response was recorded';

			}else{
				
				alert('Human #'+studentID+' Not found');
			}
				
		});
				
		console.log('data in Firebase');
	
	} else {
		alert("check your StudentID, it should be 8 chars long");
	}
	
}

function setup(){
	
	console.log('checkIn.js loaded');
	timeIn = new Date();
	
	// Month +1 because month index start at 0 
	display.innerHTML = 
		String(timeIn.getMonth()+1) + '-'+
		String(timeIn.getDate()) + '-'+
		String(timeIn.getFullYear()) + ' '+
		String(timeIn.getHours()) + ':' +
		String(timeIn.getMinutes())
	;

	for(var currentHour = timeIn.getHours(); currentHour<24; currentHour++ ){
		var opt = document.createElement("option");
		opt.value = currentHour;
		opt.innerHTML = currentHour;
		hourSelect.appendChild(opt);
	}
	
	
	var form = document.querySelector('#form');
	
	form.addEventListener('submit',submitData);
	
}

setup();