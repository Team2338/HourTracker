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
		var different = false;
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
	} else if ((result.length == studentIDLength) && !scanBlock) {
		onFoundBarcode(result.text);
	} else if (scanBlock){
		console.log('scan to early, scan was blocked');
	} else {
		// I theorize this case breaks above loop maybe find a reset instead
		codeReader.reset();
		console.log("Faulty scan: "+result+"\n reload may be necessary");
		//location.reload();
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

	month = (month.length === 1)? '0' + month : month;
	day = (day.length === 1)? '0' + day : day;
	
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

/** ancient technologies
	
	if (() && (scanBlock == false)){
		toggle.checked ?  logClockOut(result): logClockIn(result);
	} else if (scanBlock){
		// block scan to prevent immediate rescan of same id
		console.log('ScanBlocked');
	} else {
		
		console.log("Faulty scan: "+result+"\n reload may be necessary");
		location.reload();
	}
}

function logClockIn(ID){
	
	timeIn = new Date();
	console.log('logging Check In'+ ID+ ' at:\n'+timeIn);

	var yearString = String(timeIn.getFullYear());
	var monthString = String(timeIn.getMonth() +1);
	// month +1 because index starts at 0
	var dayString = String(timeIn.getDate());
	

	monthString = (monthString.length === 1)? '0' + monthString : monthString;
	dayString = (dayString.length === 1)? '0' + dayString : dayString;
	
	var CLOCK_IN_HOUR= String(timeIn.getHours());
	var CLOCK_IN_MINUTE = String(timeIn.getMinutes());

	var studentID = ID;
	var type = "shop";
	
	var docName = monthString + dayString + yearString;
	var docRefStudent = db.collection("Users").doc(studentID);
	var docRefLog = docRefStudent.collection("logs").doc(docName);

	docRefStudent.get().then(function(Studentdoc){

		if(Studentdoc.exists){
			
			greenBox.style.visibility = "visible";
			resultBox.innerHTML = "Welcome "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName;

			docRefLog.get().then(function(docLog){

				if(docLog.exists){
					resultBox.innerHTML = "You already clocked in today.";	
				} else {

					docRefLog.set({
						clockInHour: CLOCK_IN_HOUR,
						clockInMinute: CLOCK_IN_MINUTE,
						
						clockOutHour: "N/A",
						clockOutMinute: "N/A",
						
						hourType: type
					});
				}
			});
		}else{
			
			resultBox.innerHTML = 'Error: ID #'+studentID+' not found';
		}
	});
			
	console.log('data in Firebase');
	
}

function logClockOut(ID){

	timeOut = new Date();
	console.log('logging Check Out'+ ID+ ' at:\n'+timeOut);

	var yearString = String(timeOut.getFullYear());
	var monthString = String(timeOut.getMonth() +1);
	// month +1 because index starts at 0
	var dayString = String(timeOut.getDate());

	monthString = (monthString.length === 1)? '0' + monthString : monthString;
	dayString = (dayString.length === 1)? '0' + dayString : dayString;
	

	var CLOCK_OUT_HOUR = String(timeOut.getHours());
	var CLOCK_OUT_MINUTE = String(timeOut.getMinutes());
	var CLOCK_IN_HOUR;
	var CLOCK_IN_MINUTE;

	var studentID = ID;
	var type = "shop";

	var docName = monthString + dayString + yearString;
	var docRefStudent = db.collection("Users").doc(studentID);
	var docRefLog = docRefStudent.collection("logs").doc(docName);

	docRefStudent.get().then(function(Studentdoc){

		if(Studentdoc.exists){

			greenBox.style.visibility = "visible";
			resultBox.innerHTML = "Goodbye "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName;

			docRefLog.get().then(function(Logdoc){
			
				if(Logdoc.exists){

					CLOCK_IN_HOUR = Logdoc.data().clockInHour;
					CLOCK_IN_MINUTE = Logdoc.data().clockInMinute;

					docRefLog.set({
						clockInHour: CLOCK_IN_HOUR,
						clockInMinute: CLOCK_IN_MINUTE,
						
						clockOutHour: CLOCK_OUT_HOUR,
						clockOutMinute: CLOCK_OUT_MINUTE,
						
						hourType: type
					});

				}else{

					resultBox.innerHTML = 'You forgot to clock in😔';

					console.log('you never clocked in');
					docRefLog.set({
						clockInHour: "N/A",
						clockInMinute: "N/A",
						
						clockOutHour: CLOCK_OUT_HOUR,
						clockOutMinute: CLOCK_OUT_MINUTE,
						
						hourType: type
					});
				
				}
			
			});

		}else{
			
			resultBox.innerHTML = 'Error: ID #'+studentID+' not found';
		
		}

	});
		
	console.log('data in Firebase');
	
}
/*
window.addEventListener('load', function(){
    codeReader
        .listVideoInputDevices()
        .then((videoInputDevices) => {
            deviceId = videoInputDevices[0].deviceId;
            if (videoInputDevices.length > 1) {
                videoInputDevices.forEach((element) => {
                    deviceId = [1].deviceId;
                    console.log(element.label);
					console.log(element.deviceId);
					
				});
				
            }
        })
        .catch(err => {
            console.log("err");
            console.error(err);
        });
	decodeContinuously();
	
});
*/

function setup(){
	console.log('scan.js loaded');

	/** Barcode Scanner init */

	// list our all camera devices
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
	

}

setup();