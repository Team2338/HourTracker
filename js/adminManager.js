// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

import {admins, firestore, loadExternalHTML, initFirebaseAuth, checkPermissions} from './Scripts.js';

const peopleTable = $('#peopleData');
const permWarning = $('#permWarning');
const dataTableBody = $('#tableBody');
const emailBox = $('#emailBox');
const nameBox = $('#nameBox');
const adminToggle = $('#adminToggle');
const uidBox = $('#uidBox');
const searchButton = $('#searchButton');
const saveButton = $('#saveButton');
const hereTableBody = $('#hereTableBody');
var idList =[];

var rowTemp;

const originalTableHTML = dataTableBody.innerHTML;
var dataTableHTML = '';

function renderRowHTML(doc) {

	var row = document.createElement('tr');
	row.id = doc.id;
	//row.onclick = expandRow(doc.id);

	var tableEmail = document.createElement('td');
	tableEmail.innerHTML = doc.data().email;
	row.appendChild(tableEmail);

	var tablename = document.createElement('td');  
	tablename.innerHTML = doc.data().name;
	row.appendChild(tablename);

	var tableID = document.createElement('td'); 
	tableID.innerHTML = doc.id;
	row.appendChild(tableID);

	var tableAdmin = document.createElement('td');
	var tempOuterSpan = document.createElement('span');
	var tempLabel = document.createElement('label');
	var tempInput = document.createElement('input');
	var tempInnerSpan = document.createElement('span');


	$(
	"<span class = \"switchBox\">"+
		"<label class=\"switch\">"+
			"<input class = \"fancyToggle\" id = "+doc.id+" type = \"checkbox\" value =\""+doc.data().admin +"\""+(doc.data().admin==true?"checked":"") +">"+
			"<span class = \"slider round\"></span>"+
		"</label>"+
	"</span>").appendTo(row);

	idList.push("typeSwitchToggle"+doc.id);

	dataTableBody.append(row);
}

function resetTable(){
	$("#tableBody > tr").remove();
}

function removeAllChildren(thing){
	while(thing.firstChild){
		thing.removeChild(thing.firstChild);
	}
}

function search(){
	console.log('search');
	resetTable();

	var selectedEmail = emailBox.val();
	var selectedName = nameBox.val();
	var selectedUID = uidBox.val();
	
	var filteredPeople;
    var peeps;

	console.log(selectedEmail);
	console.log(selectedName);
	//console.log(selectedAdmin);
	console.log(selectedUID);

	var googleSignedInRef = firestore.collection("googleSignIn");
	console.log("SignedIn");
	if(selectedUID.length > 0){
		console.log('ID search');

		filteredPeople = googleSignedInRef.doc(selectedUID).get()
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
	
	} else if(selectedUID.length === 0){
		filteredPeople = googleSignedInRef;

		if(selectedName.length >0){
			filteredPeople = filteredPeople.where("name","==", selectedName);
		}
		if(selectedEmail.length > 0){
			filteredPeople = filteredPeople.where("email","==", selectedEmail);		
		}

		filteredPeople.get()
		.then(function(querySnapshot) {
			//dataTableHTML = '';
			querySnapshot.forEach(function(doc) {
				console.log(doc.id, " => ", doc.data());
				renderRowHTML(doc);		
			});
			$(".fancyToggle").click(function () {
				var admin = !this.checked;
				var adminID = this.id;
				firestore.collection("googleSignIn").doc(adminID).get().then(function(doc){
					if(admin){
						if(confirm("You are about to remove admin privileges for "+doc.data().name)){

							firestore.collection("googleSignIn").doc(adminID).set({
								email: doc.data().email,
								name: doc.data().name,
								admin:false
							});
						} else {
						    location.reload();
						}
					} else {
						if(confirm("You are about to make "+doc.data().name+" an admin")){

							firestore.collection("googleSignIn").doc(adminID).set({
								email: doc.data().email,
								name: doc.data().name,
								admin:true
							});
						
						} else {
						    location.reload();
						}
					}

				}).catch(function(error) {
                    checkPermissions(error, function(err){
                        console.error(err);
                    });
                });
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

function save(){}

function setup(){
	
	initFirebaseAuth();

	loadExternalHTML();

	searchButton.click(search);
	saveButton.click(save);

    // allows access to the elements on the page
    // must be an admin to access this page (i.e. admin field for this logged in user is set to true)
	admins.get().then(function() {
		admins.doc(firebase.auth().currentUser.uid).get().then(function(doc){
		    // by default, the sections are hidden, so this shows the appropriate section
            if(doc.data().admin) // this is the admin field in the document
                peopleTable.css('display','block');
            else
                permWarning.css('display','block')
		});
    }).catch(function(){
        permWarning.css('display','block')
    });
}

setup();