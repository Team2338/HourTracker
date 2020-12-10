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
const docRefStudentPointer = db.collection("Data").doc("studentPointer");

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
		db.collection("Data").doc(result).get().then((docSnapshot) =>{
			
			if(docSnapshot.exists){
				var resultAtribute = document.getElementById('result');
				resultAtribute.textContent = result;
				console.log(result);
				logFirebase(result);
			} else{
				console.log("nonecistant student: "+result);
			}
		});
	} else {
		console.log("Faulty scan: "+result);
	}
	
}

function logFirebase(result){
	db.collection("Data").doc(result).set({
		test:result
	}).then(function () {
		console.log("firebase data successful");
	}).catch(function (error) {
		console.log("error: "+error);
	});
}
