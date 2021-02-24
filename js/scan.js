//JS for scanIn.html
import { loadExternalHTML, ui, people, auth, signOut, verify } from './Scripts.js';

/** html docrefs */
const resultBox = $('#result');
const toggle = $('#checkInSwitchToggle');
const typeToggle = $('#typeSwitchToggle');
const switchDisplay = $('#switchDisplay');
const greenBox = $('#greenBox');

/** scanning */
var codeReader;
let deviceId;

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

function reset(){
	setTimeout(function(){
		resultBox.html('<em>Scanning ...</em>');
		greenBox.css('visibility', 'hidden');
		scanBlock = false;
	}, greenBoxVisibilityDelay);
}

function setup(){
	
// goes to system default

	loadExternalHTML();

	console.log('scan.js loaded');
	verify(onSignIn);
	
	
	// to future programmers
	// the scanning library uses getUserMedia()
	// if it breaks without good reason check the corresponding security rules for above method
	// and check for updates

}

function onSignIn(){

	codeReader = new ZXing.BrowserBarcodeReader();
	
	codeReader
	.getVideoInputDevices()
	.then(videoInputDevices => {
		deviceId = videoInputDevices[0].deviceId;
		videoInputDevices.forEach(device =>
			console.log(`${device.label}, ${device.deviceId}`)
		);
	})
	.catch(err => console.error(err));
	codeReader.decodeFromInputVideoDeviceContinuously(deviceId, 'videoStream',(result, err) =>{
		processBarcode(result,err);
	});
	// pick a device and start continous scan
/*
	$('#top').css('visibility', 'visible');
	$('#middle').css('visibility', 'visible');
	$('#bottom').css('visibility', 'visible');
*/
}

setup();