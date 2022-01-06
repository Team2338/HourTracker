//JS for scanIn.html
import {people, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions,} from './Scripts.js';

/** html docrefs */
const resultBox = $('#result');
const toggle = $('#checkInSwitchToggle');
const typeToggle = $('#typeSwitchToggle');
const switchDisplay = $('#switchDisplay');
const greenBox = $('#greenBox');
const IDinput = $('#IDselect');
/** scanning */
var codeReader;
let deviceId;

/** processing and logging*/
const studentIDLength = 8;
const greenBoxVisibilityDelay = 3000;
var scanBlock = false;

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
						console.log('RTDB logging')
	
						var peopleList = snapshot.val().here;
						console.log("peopleList RTDB:");
						console.log(peopleList);
						//this if statement is broken
						if (peopleList === [["null", "null", "null"]]){
							peopleList = [];
							console.log("nulls cleared");
						}
						peopleList.push([Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]);
						console.log("peopleList before write");
						console.log(peopleList);						
						
						realTimeDataBase.ref('users/').set({
							here: peopleList
						});
					}).catch(function(error) {
						checkPermissions(error, function(err){
						
							console.log("purge RTDB");
							// purges the database and adds the person
							console.log(err);
							var peopleList = [[Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]];
							realTimeDataBase.ref('users/').set({
								here: peopleList
							});
						});
					});

					reset();

				} else if(Logdoc.exists && checkOut){
					console.log("checkout");
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
							peopleList = [["null","null","null"]];
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
			
	}).catch(function(error) {
		checkPermissions(error, function(err){
			console.error(err);
		});
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

	console.log('handHeldScanner.js loaded');

	initFirebaseAuth();

	loadExternalHTML();

	IDinput.select();

	//reselects input so you dont have to click it after changing check in/out or shop/service
	
	typeToggle.change(function(){
		IDinput.select();
	});

	toggle.change(function(){
		IDinput.select();
	});

	function updateValue(e) {
		console.log(e.target.value);

		if(e.target.value.length == 8){
			console.log('logging');
			onFoundBarcode(e.target.value);
			IDinput.val('');
			IDinput.select();
		}
		
	}

	IDinput.on('input', updateValue);
	
}

setup();