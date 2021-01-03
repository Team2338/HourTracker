// !!Warning!! read this
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
firebase.analytics();

var db = firebase.firestore();

var dataTableBody = document.querySelector('#tableBody');

var IDBox = document.querySelector('#student-id-box');
var firstNameBox = document.querySelector('#first-name-box');
var lastNameBox = document.querySelector('#last-name-box');
var teamSelect = document.querySelector('#team-select');
var roleSelect = document.querySelector('#role-select');
var subteamSelect = document.querySelector('#subteam-select');

var searchButton = document.querySelector('#search-button');
var newButton = document.querySelector('#new-button');
var editButton = document.querySelector('#edit-button');

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
	var selectedRole = roleSelect.value;
	var selectedSubteam = subteamSelect.value;
	
	var people = db.collection("Users");
	
	if ((selectedID.length == 8) &&
		(selectedFirstName.length > 0) &&
		(selectedLastName.length > 0) &&
		(selectedTeam != "none") &&
		(selectedRole != "none")
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
					subteam: selectedSubteam,
					role: selectedRole,
					shopHours: 0,
					serviceHours: 0
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

	var selectedID = IDBox.value;
	var selectedFirstName = firstNameBox.value
	var selectedLastName = lastNameBox.value;
	var selectedTeamNumber = teamSelect.value;
	var selectedRole = roleSelect.value;
	var selectedSubteam = subteamSelect.value;
	
	if (selectedID.length == 8){
		
		var docRef = db.collection("Users").doc(selectedID);
		docRef.get().then(function(doc){

			if(doc.exists){
				
				var newFirstName;
				var newLastName;
				var newTeamNumber;
				var newRole;
				var newSubteam;

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
				if(selectedRole != "none"){
					newRole = selectedRole;
				} else {
					newRole = doc.data().role;
				}
				console.log(selectedSubteam);
				if(selectedSubteam != "none"){
					newSubteam = selectedSubteam;
				} else {
					newSubteam = doc.data().subteam;
				}
				
				docRef.set({
					firstName: newFirstName,
					lastName: newLastName,
					teamNumber: newTeamNumber,
					role: newRole,
					subteam: newSubteam,
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

function renderRowHTML(doc) {
	
	let rowHTML = '<tr id = "'+ doc.id+'">' +
						'<td>' +
							doc.id+
						'</td>' +
						'<td>' +
							doc.data().lastName +
						'</td>' +
						'<td>' +
							doc.data().firstName +
						'</td>' +
						'<td>' +
							doc.data().teamNumber +
						'</td>'+
						'<td>'+
							doc.data().role +
						'</td>' +
						'<td>' +
							doc.data().subteam +
						'</td>' +
					'</tr>'
	;
	return rowHTML;
}

function resetTable(){
	dataTableBody.innerHTML = originalTableHTML;
}

function search(){
	
	console.log('search');
	resetTable();

	var selectedID = IDBox.value;
	var selectedFirstName = firstNameBox.value
	var selectedLastName = lastNameBox.value;
	var selectedTeam = teamSelect.value;
	var selectedRole = roleSelect.value;
	var selectedSubteam = subteamSelect.value;
	
	var people = db.collection("Users");
	var filteredPeople;
	
	if(selectedID.length == 8){
		console.log('ID search');
		filteredPeople = people.doc(selectedID).get().then(
			function(doc){
				if(doc.exists){
					dataTableHTML = renderRowHTML(doc);
					dataTableBody.innerHTML = dataTableHTML;
				} else {
					dataTableHTML = '<tr><td>not found</td></tr>';
					dataTableBody.innerHTML = dataTableHTML;
				}
			}
		);

	} else {
		filteredPeople = people;
		if(selectedFirstName.length >0){
			filteredPeople = filteredPeople.where("firstName","==", selectedFirstName);
		}
		if(selectedLastName.length > 0){
			filteredPeople = filteredPeople.where("lastName", "==", selectedLastName);
		}
		if(selectedTeam != "none"){
			filteredPeople = filteredPeople.where("teamNumber","==", parseInt(selectedTeam));		
		}
		if(selectedRole != "none"){
			filteredPeople = filteredPeople.where("role","==",selectedRole);
		}
		if(selectedSubteam != "none"){
			filteredPeople = filteredPeople.where("subteam","==",selectedSubteam);	
		}
		
		filteredPeople.get()
		.then(function(querySnapshot) {
			dataTableHTML = '';
			querySnapshot.forEach(function(doc) {
				console.log(doc.id, " => ", doc.data());
				dataTableHTML = dataTableHTML + renderRowHTML(doc);
			});
			dataTableBody.innerHTML = dataTableHTML;
		})
		.catch(function(error) {
			console.log("Error getting documents: ", error);
		});
	}

}

function setup(){
	searchButton.addEventListener("click", search);
	newButton.addEventListener("click",newStudent);
	editButton.addEventListener("click",editStudent);
}

setup();