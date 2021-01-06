//js for scan in
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

let deviceId;
const codeReader = new ZXing.BrowserBarcodeReader();
const studentIDMax = 8;

var db = firebase.firestore();
var collectionPeople = db.collection("people");
var resultBox = document.querySelector('#result');

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
                })
            }
        })
        .catch(err => {
            console.log("err");
            console.error(err);
        });
    decodeContinuously();
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
      }

      if (err instanceof ZXing.ChecksumException) {
        //console.log('A code was found, but it\'s read value was not valid.')
      }

      if (err instanceof ZXing.FormatException) {
        //console.log('A code was found, but it was in a invalid format.')
      }
    }
  })
}

function onFoundBarcode(result){
	
	if (result.length == 8){
		logFirebase(result);
		console.log(result);
		resultBox.innerHTML = result;

	} else {
		console.log("Faulty scan: "+result);
	}
}

function logFirebase(ID){
	
	// to prevent reload of the webpage on submit
	
	console.log('logging');
	console.log(timeIn);

	timeIn = new Date();

	var year = String(timeIn.getFullYear());
	var month = String(timeIn.getMonth() +1);
	// month +1 because index starts at 0
	var day = String(timeIn.getDate());

	month = (month.length === 1)? '0' + month : month;
	day = (day.length === 1)? '0' + day : day;

	var CLOCK_IN_HOUR = String(timeIn.getHours());
	var CLOCK_IN_MINUTE = String(timeIn.getMinutes());
	
	var CLOCK_OUT_HOUR = 21;
	var CLOCK_OUT_MINUTE = 0;

	var timeOut = new Date(year,month-1,day,CLOCK_OUT_HOUR,CLOCK_OUT_MINUTE);
	timeIn = new Date(year,month-1,day,CLOCK_IN_HOUR,CLOCK_IN_MINUTE);
	// redefined to remove seconds and ms

	var elapsedTime = timeOut.getTime() - timeIn.getTime();

	console.log(elapsedTime);

	var studentID = ID;
	var type = "shop";
	
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
				

			}else{
				
				alert('Human #'+studentID+' Not found');
			}
				
		});
				
		console.log('data in Firebase');
	
	} else {
		alert("check your StudentID, it should be 8 chars long");
	}
	
}


/*
function logFirebase(result){
	collectionPeople.doc(result).set({
		test:result
	}).then(function () {
		console.log("firebase data successful");
	}).catch(function (error) {
		console.log("error: "+error);
	});
}
*/