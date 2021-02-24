// js for checkIn.html
import { loadExternalHTML, ui, people, auth, signOut, verify } from './Scripts.js';
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

	month = (month.length == 1)? '0' + month : month;
	day = (day.length == 1)? '0' + day : day;

	var HOUR = time.getHours();
	var MINUTE = time.getMinutes();

	// redefined to remove seconds and ms
 
	var studentID = nameSelect.val();
	var type = typeToggle.is(':checked')? "service" : "shop" ;
	var toggleChecked = toggle.is(':checked');
	
	var docName = month + day + year;
	var docRefStudent = people.doc(studentID);
	var docRefLog = docRefStudent.collection("logs").doc(docName);


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
						
						realTimeDataBase.ref('users/').once('value').then((snapshot) => {
							
							var peopleList = snapshot.val().here;
							console.log(peopleList);

							if (here === [["N/A","N/A","N/A"]]){
								peopleList = [];
							}

							peopleList.push([Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]);
							console.log(peopleList);							
							
							realTimeDataBase.ref('users/').set({
								here: peopleList
							});
						}).catch(function(err){
							var peopleList = [[Studentdoc.id, Studentdoc.data().firstName, Studentdoc.data().lastName]];
							realTimeDataBase.ref('users/').set({
								here: peopleList
							});
						});

						//sets here to an id, name and lastname
						
						responseBox.html("Welcome "+Studentdoc.data().firstName+ " "+ Studentdoc.data().lastName);

					} else if(Logdoc.exists && toggleChecked){
					
						console.log('checkout');
					
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

						responseBox.html("checkout successful");

						//removes 

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

	loadExternalHTML();
	
	verify(onSignIn);
	
	console.log('checkIn.js loaded');
	
}

function onSignIn(){
	var optsList= [];

	people.get()
	.then(function(querySnapshot) {
		
		querySnapshot.forEach(function(doc) {
			console.log(doc.id, " => ", doc.data());
			optsList.push(new Option(doc.data().lastName+", "+doc.data().firstName, doc.id));
		});
		optsList.sort(function (a, b) {
			return $(a).text() > $(b).text() ? 1 : -1;
		});
		optsList.forEach(function(element) {
			nameSelect.append(element);
		});
	})
	.catch(function(error) {
		console.log("Error getting documents: ", error);
	});
	form.submit(submitData);
}


setup();
