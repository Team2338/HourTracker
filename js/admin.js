// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

import {people, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions, firestore} from './Scripts.js';

const dataTableBody = $('#tableBody');
const IDBox = $('#studentIdBox');
const firstNameBox = $('#firstNameBox');
const lastNameBox = $('#lastNameBox');
const teamSelect = $('#teamSelect');
const searchButton = $('#searchButton');
const newButton = $('#newButton');
const editButton = $('#editButton');
const deleteButton = $('#deleteButton');
const hourTable = $('#personData');
const clearButton = $('#clearButton');
const downloadButton = $('#downloadButton');
const hereTableBody = $('#hereTableBody');
const checkoutAllButton = $('#checkOutAll');
const hereTable = $('#hereTable');
const noOneHereBox = $('#noOneHereBox');

var rowTemp;

const originalTableHTML = dataTableBody.innerHTML;
var dataTableHTML = '';

function newStudent() {
	
	console.log('newStudent');
	resetTable();
	
	var selectedID = IDBox.val();
	var selectedFirstName = firstNameBox.val();
	var selectedLastName = lastNameBox.val();
	var selectedTeam = teamSelect.val();

	if ((selectedID.length == 8) &&
		(selectedFirstName.length > 0
			) &&
		(selectedLastName.length > 0)
	   ){
		
		var docRef = firestore.collection("Users").doc(selectedID);
		docRef.get().then(function(doc){

			if(doc.exists){
				alert('Cannot create new student, Student exists');
			}else{
				alert('New Student Created');
				docRef.set({
					firstName: selectedFirstName,
					lastName: selectedLastName,
					teamNumber:"2338", //selectedTeam,
					shopHours: 0,
					serviceHours: 0
				});
				docRef.collection("logs").doc("init").set({
					thing: "empty"
				});
				// TODO:
				// add individual hour logs here
			}
				
		});


	} else {
		alert('new student parameters invalid');
	}
	
}

function editStudent() {
	
	console.log('edit');
	resetTable();

	var selectedID = IDBox.val();
	var selectedFirstName = firstNameBox.val();
	var selectedLastName = lastNameBox.val();
	var selectedTeam = teamSelect.val();
	
	if (selectedID.length == 8){
		
		var docRef = firestore.collection("Users").doc(selectedID);
		docRef.get().then(function(doc){

			if(doc.exists){
				
				var newFirstName;
				var newLastName;
				var newTeamNumber;

				if(selectedFirstName.length >0){
					newFirstName = selectedFirstName;				
				} else {
					newFirstName = doc.data().firstName;
				}

				if(selectedLastName.length > 0){
					newLastName = selectedLastName;
				} else {
					newLastName = doc.data().lastName;
				}

				if(selectedTeam != "none"){
					newTeamNumber = selectedTeam;					
				} else {
					newTeamNumber = doc.data().teamNumber;
				}
				
				docRef.set({
					firstName: newFirstName,
					lastName: newLastName,
					teamNumber: newTeamNumber,
					shopHours: doc.data().shopHours,
					serviceHours: doc.data().serviceHours
				});

			}else{
				alert('Student with ID'+selectedID+'not found');
			}
				
		});


	} else {
		alert('fields invalid');

	}
	
	// create a new collection/doc for hours that are logged
}

function deleteStudent(){
	console.log('delete');
	
	var selectedID = IDBox.val();
	//var selectedFirstName = firstNameBox.val();
	//var selectedLastName = lastNameBox.val();
	//var selectedTeam = teamSelect.val();

	var docRef = people.doc(selectedID);

	var answer;
	
	if (selectedID.length == 8){
		docRef.get().then(function(Studentdoc){
			if(Studentdoc.exists){
				answer = window.confirm("You are about to delete "+Studentdoc.data().firstName+". Are you sure about this?");
				if (answer){
					docRef.delete().then(function() {
						console.log("Document successfully deleted!");
					}).catch(function(error) {
						checkPermissions(error, function(err){
							console.error(err);
						});
					});
				} else{
					console.log('delete canceled');
				}
			} else{
				console.log('cannot delete, student not found');
			}
				
		});
	} else{
		console.log('Id not 8 chars');
	}
	
}

function downloadCSV(){
	console.log('download');

	var titleString ="Id,first name,last name,team#,date,HourIn,MinuteIn,HourOut,MinuteOut,type, elapsed\r\n";
	var saveString = titleString;

	var isComplete = false;
	var i = 0;
	people.get()
	.then(function(querySnapshot) {

		querySnapshot.forEach(function(studentDoc) {
			
			people.doc(studentDoc.id).collection('logs').get()
			.then(function(queryLog){
				
				queryLog.forEach(function(logDoc){

					var startDate = new Date();
					var endDate = new Date();
					
					startDate.setHours(logDoc.data().clockInHour);
					startDate.setMinutes(logDoc.data().clockInMinute);
					endDate.setHours(logDoc.data().clockOutHour);
					endDate.setMinutes(logDoc.data().clockOutMinute);

					var elapsed = endDate - startDate;
					elapsed /= 60000;

					var logString = studentDoc.id + ','
					+ studentDoc.data().firstName
					+ ',' + studentDoc.data().lastName
					+ ',' + studentDoc.data().teamNumber 
					+ ',' + logDoc.id
					+ ',' + logDoc.data().clockInHour
					+ ',' + logDoc.data().clockInMinute
					+ ',' + logDoc.data().clockOutHour
					+ ',' + logDoc.data().clockOutMinute
					+ ',' + logDoc.data().hourType
					+ ',' + elapsed
					+ '\r\n';
					saveString += logString;
					
				});
				i += 1;
				if(i >= querySnapshot.size){
					save(saveString);
				}
				
			});		
			
		});		

	});

	function save(myString){
		console.log('saving',myString);
		var blob = new Blob([myString], { type: 'text/plain' });
		saveAs(blob, "data.csv");
	}	
}

function renderRowHTML(doc) {

	var row = document.createElement('tr');
	row.id = doc.id;
	//row.onclick = expandRow(doc.id);

	var tableID = document.createElement('td');
	tableID.innerHTML = doc.id;
	row.appendChild(tableID);

	var tableFirstName = document.createElement('td'); 
	tableFirstName.innerHTML = doc.data().firstName;
	row.appendChild(tableFirstName);

	var tableLastName = document.createElement('td');  
	tableLastName.innerHTML = doc.data().lastName;
	row.appendChild(tableLastName);

	var tableTeamNumber = document.createElement('td');
	tableTeamNumber.innerHTML = doc.data().teamNumber;
	row.appendChild(tableTeamNumber);
	
	/*
	var tableButton = document.createElement('button');
	var tableButtonData = document.createElement('td');
	
	tableButton.onclick = () => {
		expandRow(row);
	};
	
	tableButton.id = doc.id + "Button";
	tableButton.className = "expandButton"; 
	// for the arrow css later
	tableButtonData.appendChild(tableButton);
	row.appendChild(tableButtonData);
	*/
	dataTableBody.append(row);

}

function resetTable(){
	//dataTableBody.innerHTML = originalTableHTML;
	/*
	while(dataTableBody.firstChild){
		dataTableBody.removeChild(dataTableBody.firstChild);
	}*/
	console.log('clear');
	$("#tableBody > tr").remove();
	//$("#dataTableBody tr").remove();
	
}

function expandRow(row){
	console.log('expandRow'+row.id);

	try{
		rowTemp.removeChild(hourTable);
	}catch(err){
		console.log(err);
	}

	rowTemp = row;
	hourTable.setAttribute('class','hourTable');
	var studentLogRef = db.collection("Users").doc(row.id).collection('logs');
	
	var titleRow = document.createElement('tr');
	var titleDate = document.createElement('th');
	var titleClockIn = document.createElement('th');
	var titleClockOut = document.createElement('th');
	var titleType = document.createElement('th');
	titleDate.innerHTML = 'Date';
	titleClockIn.innerHTML = 'Clock In';
	titleClockOut.innerHTML = 'Clock Out';
	titleType.innerHTML = 'Type';
	titleRow.appendChild(titleDate);
	titleRow.appendChild(titleClockIn);
	titleRow.appendChild(titleClockOut);
	titleRow.appendChild(titleType);
	hourTable.appendChild(titleRow);
	studentLogRef.get()
	.then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			
			console.log(doc.id, " => ", doc.data());
			
			var log = document.createElement('tr');
			
			var clockInData = document.createElement('td');
			var clockOutData = document.createElement('td');
			var dateData = document.createElement('td');
			var typeData = document.createElement('td');
			clockInData.innerHTML = doc.data().clockInHour + ":" + doc.data().clockInMinute;
			clockOutData.innerHTML = doc.data().clockOutHour + ":" + doc.data().clockOutMinute;
			dateData.innerHTML = doc.id;
			typeData.innerHTML = doc.data().hourType;
			log.appendChild(dateData);
			log.appendChild(clockInData);
			log.appendChild(clockOutData);
			log.appendChild(typeData);
			hourTable.appendChild(log);		
		});
		
		row.appendChild(hourTable);
	}).catch(function(error) {
		checkPermissions(error, function(err){
			console.error(err);
		});
	});
	
}

function removeAllChildren(thing){
	while(thing.firstChild){
		thing.removeChild(thing.firstChild);
	}
}

function search(){
	
	console.log('search');
	resetTable();

	var selectedID = IDBox.val();
	var selectedFirstName = firstNameBox.val();
	var selectedLastName = lastNameBox.val();
	var selectedTeam = teamSelect.val();
	
	var filteredPeople;

	console.log(selectedID);
	console.log(selectedLastName);
	console.log(selectedLastName);
	console.log(selectedTeam);
	
	if(selectedID.length === 8){
		console.log('ID search');
		filteredPeople = people.doc(selectedID).get()
		.then(
			function(doc){
				if(doc.exists){
					renderRowHTML(doc);
				} else {
					dataTableHTML = '<tr><td>not found</td></tr>';
					dataTableBody.innerHTML = dataTableHTML;
				}
			}
		).catch(function(error) {
			checkPermissions(error, function(err){
				console.error(err);
			});
		});
	
	} else if(selectedID.length === 0){
	
		filteredPeople = people;
	
		if(selectedFirstName.length >0){
			filteredPeople = filteredPeople.where("firstName","==", selectedFirstName);
		}
		if(selectedLastName.length > 0){
			filteredPeople = filteredPeople.where("lastName", "==", selectedLastName);
		}
		if(selectedTeam != "none"){
			filteredPeople = filteredPeople.where("teamNumber","==", selectedTeam);		
		}
		
		filteredPeople.get()
		.then(function(querySnapshot) {
			//dataTableHTML = '';
			querySnapshot.forEach(function(doc) {
				console.log(doc.id, " => ", doc.data());
				if(doc.id.length === 8){// filters out admins which use UIDs that are greater than 8 chars
					renderRowHTML(doc);
				}
			});

			//dataTableBody.innerHTML = dataTableHTML;
		}).catch(function(error) {
			checkPermissions(error, function(err){
				console.error(err);
			});
		});
	} else {
		alert('invalid ID');
	}

}

function checkoutAll(){
	console.log('checkoutAll');

	realTimeDataBase.ref('users/').once('value').then((snapshot) => {

		console.log('start checkout');

		var time = new Date();

		var HOUR = time.getHours();
		var MINUTE = time.getMinutes();

		var year = String(time.getFullYear());
		var month = String(time.getMonth() +1);
		// month +1 because index starts at 0
		var day = String(time.getDate());
		
		month = (month.length == 1)? '0' + month : month;
		day = (day.length == 1)? '0' + day : day;

		var peopleList = snapshot.val().here;
		console.log(peopleList);

		var docName = month + day + year;

		console.log('shiiit');
		peopleList.forEach(function(element){
			var studentID = element[0];
			
			if(studentID != "N/A"){


			//var docRefStudent = ;
			var docRefLog = people.doc(studentID).collection("logs").doc(docName);	

			docRefLog.get().then(function(logDoc){
				if(logDoc.exists){
					docRefLog.set({
						clockInHour: logDoc.data().clockInHour,
						clockInMinute: logDoc.data().clockInMinute,
						clockOutHour: HOUR,
						clockOutMinute: MINUTE,
						hourType: logDoc.data().hourType
					});
				}
			});
			}
		});

		peopleList = [["null","null","null"]];

		realTimeDataBase.ref('users/').set({
			here: peopleList
		});
	}).catch(function(error) {
		checkPermissions(error, function(err){
			console.error(err);
		});
	});

}

function clearTextBoxes(){
	
	console.log('clearTextBoxes');
	teamSelect.val("none");
	IDBox.val("");
	firstNameBox.val("");
	lastNameBox.val("");
}

function refreshRealTime(snapshot){

	console.log('realTime list change');
	
	console.log(snapshot.val());
	//console.log(snapshot.ref('here/').val());

	hereTableBody.empty();
	
	var peopleList = snapshot.val().here;
	console.log("peopleList log");
	console.log(peopleList);
	
	peopleList.forEach(function(element){
		
		if(element[0] === "null"){
			console.log('nobody here');
			
			hereTable.css('display', 'none');
			noOneHereBox.css('display', 'block');
		
		} else {
			noOneHereBox.css('display', 'none');
			hereTable.css('display', 'block');
			
			var row = document.createElement('tr');
			var ID = document.createElement('td');
			var firstName = document.createElement('td');
			var lastName = document.createElement('td');
			
			ID.innerHTML = element[0];
			firstName.innerHTML = element[1];
			lastName.innerHTML = element[2];
			
			row.appendChild(ID);
			row.appendChild(firstName);
			row.appendChild(lastName);
			
			hereTableBody.append(row);
		}
	});
	
}
/*
function createAdmin(email,password){

	auth.createUserWithEmailAndPassword(email, password)
	.then((userCredential) => {
		// Signed in 
		var user = userCredential.user;
		// ...
		console.log(userCredential);
	
	}).catch(function(error) {
		checkPermissions(error, function(err){
			console.error(err);
		});
	});
}
*/
function setup(){
	
	console.log('admin.js loaded');

	initFirebaseAuth();

	loadExternalHTML();

	searchButton.click(search);
	newButton.click(newStudent);
	editButton.click(editStudent);
	deleteButton.click(deleteStudent);
	clearButton.click(clearTextBoxes);
	downloadButton.click(downloadCSV);
	checkoutAllButton.click(checkoutAll);

	realTimeDataBase.ref('users/').on('value', (snapshot) => {
		refreshRealTime(snapshot);
	});
}

setup();
