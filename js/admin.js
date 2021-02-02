// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

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

var db = firebase.firestore();
var people = db.collection("Users");

//var requirejs = require('requirejs');
//import { saveAs } from 'file-saver';
//var FileSaver = require('file-saver');

var dataTableBody = $('#tableBody');
var IDBox = $('#studentIdBox');
var firstNameBox = $('#firstNameBox');
var lastNameBox = $('#lastNameBox');
var teamSelect = $('#teamSelect');
var searchButton = $('#searchButton');
var newButton = $('#newButton');
var editButton = $('#editButton');
var deleteButton = $('#deleteButton');
var hourTable = $('#personData');
var clearButton = $('#clearButton');
var downloadButton = $('#downloadButton');

var rowTemp;

const originalTableHTML = dataTableBody.innerHTML;
var dataTableHTML = '';

//creation of a new student
function newStudent() {
	
	console.log('newStudent');
	resetTable();
	
	var selectedID = IDBox.value;
	var selectedFirstName = firstNameBox.value;
	var selectedLastName = lastNameBox.value;
	var selectedTeam = teamSelect.value;
	
	var people = db.collection("Users");
	
	if ((selectedID.length == 8) &&
		(selectedFirstName.length > 0) &&
		(selectedLastName.length > 0)
	   ){
		
		var docRef = db.collection("Users").doc(selectedID);
		docRef.get().then(function(doc){

			if(doc.exists){
				alert('Cannot create new student, Student exists');
			}else{
				docRef.set({
					firstName: selectedFirstName,
					lastName: selectedLastName,
					teamNumber: selectedTeam,
					shopHours: 0,
					serviceHours: 0
				});
				docRef.collection("logs").doc("")
				// TODO:
				// add individual hour logs here
			}
				
		});


	} else {
		alert('new student parameters invalid');
	}
	
}

function clearTextBoxes(){
	
	console.log('clearTextBoxes');
	teamSelect.value = "none";
	IDBox.value = "";
	firstNameBox.value = "";
	lastNameBox.value = "";
}

function editStudent() {
	
	console.log('edit');
	resetTable();

	var selectedID = IDBox.value;
	var selectedFirstName = firstNameBox.value
	var selectedLastName = lastNameBox.value;
	var selectedTeamNumber = teamSelect.value;
	
	if (selectedID.length == 8){
		
		var docRef = db.collection("Users").doc(selectedID);
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

				if(selectedTeamNumber != "none"){
					newTeamNumber = selectedTeamNumber;					
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
	var selectedID = IDBox.value;

	var people = db.collection("Users");
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
						console.error("Error removing document: ", error);
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

	var titleString ="Id, first name, last name, team# \n";
	var saveArray = [titleString];
	var saveString = titleString;

	var i = 1;

	people.get()
	.then(function(querySnapshot) {
		//dataTableHTML = '';
		querySnapshot.forEach(function(doc) {
			//console.log(doc.id, " => ", doc.data());
			saveString = doc.id + ',' + doc.data().firstName + ',' + doc.data().lastName + ',' + doc.data().teamNumber + '\r\n';
			console.log(saveString);
			//i += 1;
		});
		//dataTableBody.innerHTML = dataTableHTML;
	})
	.catch(function(error) {
		console.log("Error getting documents: ", error);
	});

	let csvContent = "data:text/csv;charset=utf-8,";
/*
	saveArray.forEach(function(rowArray) {
		let row = rowArray.join(",");
		csvContent += row + "\r\n";
	});
*/
	var blob = new Blob([saveString], { type: 'data:text/csv;charset=utf-8,' });

	saveAs(blob, "hello world.csv");
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
	dataTableBody.appendChild(row);

}

function resetTable(){
	//dataTableBody.innerHTML = originalTableHTML;
	while(dataTableBody.firstChild){
		dataTableBody.removeChild(dataTableBody.firstChild);
	}
	
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
	
	})
	.catch(function(error) {
		console.log("Error getting documents: ", error);
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

	var selectedID = IDBox.value;
	var selectedFirstName = firstNameBox.value;
	var selectedLastName = lastNameBox.value;
	var selectedTeam = teamSelect.value;
	
	var filteredPeople;
	
	if(selectedID.length == 8){
		console.log('ID search');
		filteredPeople = people.doc(selectedID).get().then(
			function(doc){
				if(doc.exists){
					renderRowHTML(doc);
				} else {
					dataTableHTML = '<tr><td>not found</td></tr>';
					dataTableBody.innerHTML = dataTableHTML;
				}
			}
		);

	} else if(selectedID.length == 0){
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
				renderRowHTML(doc);
			});
			//dataTableBody.innerHTML = dataTableHTML;
		})
		.catch(function(error) {
			console.log("Error getting documents: ", error);
		});
	} else {
		alert('invalid ID');
	}

}

function setup(){
	
	console.log('admin.js loaded');

	searchButton.click(search);
	newButton.click(newStudent);
	editButton.click(editStudent);
	deleteButton.click(deleteStudent);
	clearButton.click(clearTextBoxes);
	downloadButton.click(downloadCSV);
}

setup();
