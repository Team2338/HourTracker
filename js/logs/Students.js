  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// !!Warning!! read this
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

var db = firebase.firestore();

var dataTableBody = document.querySelector('#tableBody');
const originalTableHTML = dataTableBody.innerHTML;
var dataTableHTML = '';

var teamSelect = document.querySelector('#team-select');
var searchButton = document.querySelector('#search button');

// thing that creates or edits a student
function editStudent(STUDENT_ID, FIRST_NAME, LAST_NAME, TEAM, SUBTEAM, ROLE) {
	
	db.collection("Teams").doc("2338").collection("People").doc(STUDENT_ID).set({
		firstNamme: FIRST_NAME,
		lastName: LAST_NAME,
		
		//studentID: STUDENT_ID,
		//access student ID through doc.id
		
		teamNumber: TEAM_NUMBER,
		subteam: SUBTEAM,
		role: ROLE
	});
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
};

function search(){
	
	console.log('search');
	resetTable();
	var selectedID = document.querySelector('#student-id-box').value;
	var selectedTeam = document.querySelector('#team-select').value;
	var selectedFirstName = document.querySelector('#first-name-box').value;
	var selectedLastName = document.querySelector('#last-name-box').value;
	var selectedRole = document.querySelector('#role-select').value;
	var selectedSubteam = document.querySelector('#subteam-select').value;
	
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
			console.log('Fname');
			filteredPeople = filteredPeople.where("firstName","==", selectedFirstName);
		}
		if(selectedLastName.length > 0){
			console.log('Lname');
			filteredPeople = filteredPeople.where("lastName", "==", selectedLastName);
		}
		if(selectedTeam != "none"){
			console.log('Team');
			filteredPeople = filteredPeople.where("teamNumber","==", parseInt(selectedTeam));		
		}
		if(selectedRole != "none"){
			console.log('Role');
			filteredPeople = filteredPeople.where("role","==",selectedRole);
		}
		if(selectedSubteam != "none"){
			console.log('subteam');
			filteredPeople = filteredPeople.where("subteam","==",selectedSubteam);	
		}
		filteredPeople.get()
		.then(function(querySnapshot) {
			dataTableHTML = '';
			querySnapshot.forEach(function(doc) {
				// doc.data() is never undefined for query doc snapshots
				console.log(doc.id, " => ", doc.data());
				dataTableHTML = dataTableHTML + renderRowHTML(doc);
			});
			dataTableBody.innerHTML = dataTableHTML;
		})
		.catch(function(error) {
			console.log("Error getting documents: ", error);
		});
	}
	/*
	console.log('search Parameters');
	console.log(selectedID);
	console.log(selectedFirstName);
	console.log(selectedLastName);
	console.log(selectedRole);
	console.log(selectedTeam);
	console.log(selectedSubteam);*/
	/*
	filteredPeople.get().then((snapshot) => {
		dataTableHTML = '';
		snapshot.docs.forEach((doc) => {
			dataTableHTML = dataTableHTML + renderRowHTML(doc);
			//console.log(dataTableHTML);
		});
		//console.log(dataTableHTML);
		dataTableBody.innerHTML = dataTableHTML;
	});
	*/

}

function setup(){
	
	/*
	//finds all teams from firebase and adds them to the dropdown
	db.collection("Teams").get().then(querySnapshot =>{
		querySnapshot.forEach( doc =>{
			var option = document.createElement("option");
			option.value = doc.id;
			option.text = doc.id;
			teamSelect.add(option);
		});

	});*/

	searchButton.addEventListener("click", () => { search();});
	console.log('test2');
}

setup();