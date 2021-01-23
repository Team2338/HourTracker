//JS for scanIn.html
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

let deviceId;
const codeReader = new ZXing.BrowserBarcodeReader();
const studentIDMax = 8;

var db = firebase.firestore();
var collectionPeople = db.collection("people");
var resultBox = document.querySelector('#result');
var toggle = document.querySelector('#toggle');
var switchDisplay = document.querySelector("#switchDisplay");
var greenBox = document.querySelector('#greenBox');
var scanBlock = false;

var timeIn;
var timeOut;

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

toggle.addEventListener('change', function() {
	if (this.checked) {
	  console.log("switch is checked..");
	  switchDisplay.innerHTML = "checking In";
	} else {
	  console.log("switch is not checked..");
	  switchDisplay.innerHTML = "checking Out";
	}
});

function decodeContinuously() {
	
    codeReader.decodeFromInputVideoDeviceContinuously(deviceId, 'videoStream', (result, err) => {
    if (result) {
      onFoundBarcode(result.text);
    }
    if (err) {
		
        // other errors break loop
      if (err instanceof ZXing.NotFoundException) {
        //console.log('No QR code found.')
      } else if (err instanceof ZXing.ChecksumException) {
        //console.log('A code was found, but it\'s read value was not valid.')
      } else if (err instanceof ZXing.FormatException) {
        //console.log('A code was found, but it was in a invalid format.')
      } else {
		  console.log(err);
	  }
    }
  })
}

function onFoundBarcode(result){
	
	if ((result.length == 8) && (scanBlock == false)){

		toggle.checked ? logClockIn(result) : logClockOut(result);

		greenBox.style.visibility = "visible";
		resultBox.innerHTML = result;
		
		scanBlock = true;
		setTimeout(function(){
			resultBox.innerHTML = '<em>Scanning ...</em>';
			greenBox.style.visibility = "hidden";
			scanBlock = false;
		}, 3000);

	} else if (scanBlock){
		console.log('ScanBlocked');
	} else {
		console.log("Faulty scan: "+result);
		// possibly reconstruct barcode scanner object
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
			
			docRefLog.set({
	
				clockInHour: CLOCK_IN_HOUR,
				clockInMinute: CLOCK_IN_MINUTE,
				
				clockOutHour: "N/A",
				clockOutMinute: "N/A",
				
				hourType: type
			});				

		}else{
			
			alert('Human #'+studentID+' Not found');
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

					resultBox.innerHTML = ' YOU DID NOT CLOCK IN TODAY GO SEE ZAIN';

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
			
			alert('Human #'+studentID+' Not found');
		
		}

	});
		
	console.log('data in Firebase');
	
}

function reload(Id){
    var container = document.getElementById(Id);
    var content = container.innerHTML;
    container.innerHTML= content; 
    
   //this line is to watch the result in console , you can remove it later	
    console.log("Refreshed"); 
}
