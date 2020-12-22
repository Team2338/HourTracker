// js for Students.html
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
var collectionPeople = db.collection("Teams").doc("2338").collection("People");

const dataTable = document.querySelector('#peopleData');

// thing that creates or edits a student
function editStudent(STUDENT_ID, FIRST_NAME, LAST_NAME, TEAM_NUMBER, SUBTEAM, ROLE) {
	
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

function renderSudent(doc) {
	
	let row = document.createElement('tr');
	
	let studentID = document.createElement('td');
	
	let firstName = document.createElement('td');
	let lastName = document.createElement('td');
	let teamNumber = document.createElement('td');
	let subteam = document.createElement('td');
	let role = document.createElement('td');
	
	row.setAttribute('data-id', doc.id);
	studentID.textContent = doc.id;
	
	firstName.textContent = doc.data().firstName;
	lastName.textContent = doc.data().lastName;
	teamNumber.textContent = doc.data().teamNumber;
	subteam.textContent = doc.data().subteam;
	role.textContent = doc.data().role;
	
	row.appendChild(studentID);
	row.appendChild(lastName);
	row.appendChild(firstName);
	row.appendChild(teamNumber);
	row.appendChild(role);
	row.appendChild(subteam);
	
	dataTable.append(row);
	
}

db.collection("Teams").doc("2338").collection("People").get().then((snapshot) => {
	snapshot.docs.forEach(doc => {
		renderSudent(doc);
	});
});

editStudent("12345888", "test", "test-last", "team", "lego master","master");