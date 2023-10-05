//JS for scanIn.html
import {people, firestore, admins, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions, sleep, isFullAdmin, getUserName} from './Scripts.js';

export var authenticatedUsers = firestore.collection("googleSignIn");

/** html docrefs */
const pageLayout = $('#pageLayout');
const permWarning = $('#permWarning');
const resultBox = $('#result');
const toggle = $('#checkInSwitchToggle');
const typeToggle = $('#typeSwitchToggle');
const switchDisplay = $('#switchDisplay');
const greenBox = $('#greenBox');
const yellowBox = $('#yellowBox');
const redBox = $('#redBox');
const IDinput = $('#IDselect');
const checkInText = $('#checkInSelected');
const checkOutText = $('#checkOutSelected');

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

	console.log('Id number detected '+ IdNumber +' at: ');
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
	console.log(checkOut ? "Checkout" : "Checkin");

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
						clockOutHour: 99,
						clockOutMinute: 99,
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
					if(Logdoc.data().clockInHour != 99){
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

                    } else {
                        // user attempted to clock out again but still hasn't clocked in
                        redBox.css('visibility', 'visible');
                    	resultBox.html("You still haven't clocked in, " + Studentdoc.data().firstName + ". Please see coach.");
                    }

					reset();

				} else if(!Logdoc.exists && checkOut){
					// you never clocked in
					redBox.css('visibility', 'visible');
					resultBox.html("You forgot to clock in, " + Studentdoc.data().firstName + ". Please see coach.");

					docRefLog.set({
						clockInHour: 99,
						clockInMinute: 0,
						clockOutHour: HOUR,
						clockOutMinute: MINUTE,
						hourType: type
					});

					reset();
				} else if(Logdoc.exists && !checkOut){
					// you already clocked in -or- you are trying to clock in after clocking out w/o previously clocking in
					if(Logdoc.data().clockInHour != 99){
    					yellowBox.css('visibility', 'visible');
	    				resultBox.html("Hello "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName+ ". You already clocked in today.");
                    } else {
                    	redBox.css('visibility', 'visible');
                    	resultBox.html("Hello "+Studentdoc.data().firstName+ ". Need to manually enter clock-in time. Please see coach.");
                    }
					reset();
				}
			});
	
		}else{
			resultBox.html('Error: ID #'+studentID+' not found. Please inform your coach.');
			redBox.css('visibility', 'visible');
			reset();
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
		yellowBox.css('visibility', 'hidden');
		redBox.css('visibility', 'hidden');
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
		if(toggle.is(':checked')){ // checkout is selected
		    checkInText.css('color', 'grey');
		    checkInText.css('opacity','0.3');
		    checkOutText.css('color', '#FFFF00');
		    checkOutText.css('opacity','1.0');
		}else{
		    checkInText.css('color', '#00FF00');
		    checkInText.css('opacity','1.0');
		    checkOutText.css('color', 'grey');
		    checkOutText.css('opacity','0.3');
        }
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

    authenticatedUsers.get().then(function(){
        isFullAdmin();
        pageLayout.css('display', 'block'); // block/none
        permWarning.css('display','none'); // block/none
    }).catch(function(error){
        console.log("error message: " + error.message);
        pageLayout.css('display', 'none'); // block/none
        permWarning.css('display','block'); // block/none
        alert('You do not have permissions to view this page and will be logged out.')
                isFullAdmin();
                // works firebase.auth().signOut();
    });
//	admins.get().then(function() {
//        pageLayout.css('display', 'block'); // block/none
//        permWarning.css('display','none'); // block/none
//    }).catch(function(){
//        pageLayout.css('display', 'none'); // block/none
//        permWarning.css('display','block'); // block/none
//    });
}

setup();