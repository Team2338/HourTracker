// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

import {firestore, loadExternalHTML, initFirebaseAuth, checkPermissions} from './Scripts.js';

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
			"<input class = \"fancyToggle\" id = "+doc.id+" type = \"checkbox\" value =\""+doc.data().admin +"\""+(doc.data().admin?"checked":"") +">"+
			"<span class = \"slider round\"></span>"+
		"</label>"+
	"</span>").appendTo(row);

	idList.push("typeSwitchToggle"+doc.id);

	console.log('sooome valuuue');

	//tempInnerSpan.attr("class","slider round");
	//tempInput.attr("type","checkbox");
	//tempInput.attr("value",doc.data().admin);
	//tempInput.prop( "checked", doc.data().admin );
/*
	tempLabel.addClass("switch");
	tempOuterSpan.addClass("switchBox");

	tempLabel.append(tempInput);
	tempLabel.append(tempInnerSpan);

	tempOuterSpan.append(tempLabel);

	tableAdmin.append(tempOuterSpan);
*/
/*
	tableAdmin.innerHTML = 
	"<span class = \"switchBox\">"+
		"<label class=\"switch\">"+
			"<input id = \"typeSwitchToggle"+doc.id+"\" type = \"checkbox\" value =\""+doc.data().admin +"\""+(doc.data().admin?"checked":"") +">"+
			"<span class = \"slider round\"></span>"+
		"</label>"+
	"</span>";
*/


	//console.log(tableAdmin.innerHTML);
	//row.appendChild(tableAdmin);
	/*
	$("typeSwitchToggle"+doc.id).change(function(){
		console.log('temp');
		firestore.collection("googleSignIn").doc(doc.id).set({
			email: doc.data().email,
			name: doc.data().name,
			admin:$("typeSwitchToggle"+doc.id).val()
		});
	});
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

function removeAllChildren(thing){
	while(thing.firstChild){
		thing.removeChild(thing.firstChild);
	}
}

function search(){
	
	console.log('search');
	resetTable();

	var selectedEmail = emailBox.val();
	var selectedname = nameBox.val();
	//var selectedAdmin = adminToggle.val();
	var selectedUID = uidBox.val();
	
	var filteredPeople;

	console.log(selectedEmail);
	console.log(selectedname);
	//console.log(selectedAdmin);
	console.log(selectedUID);

	var googleSignedInRef = firestore.collection("googleSignIn");
	
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
		
	
		if(selectedname.length >0){
			
			filteredPeople = filteredPeople.where("name","==", selectedname);
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
				console.log('isAdmin');
				console.log(admin);
				var adminID = this.id;
				firestore.collection("googleSignIn").doc(adminID).get().then(function(doc){
					if(admin){
						if(confirm("you are about to make"+doc.data().name+"not an admin")){

							firestore.collection("googleSignIn").doc(adminID).set({
								email: doc.data().email,
								name: doc.data().name,
								admin:"false"
							});
						}
					} else {
						if(confirm("you are about to make"+doc.data().name+"an admin")){

							firestore.collection("googleSignIn").doc(adminID).set({
								email: doc.data().email,
								name: doc.data().name,
								admin:"true"
							});
						
						}
					}

				});
            });
			
			//dataTableBody.innerHTML = dataTableHTML;
		})/*.catch(function(error) {
			checkPermissions(error, function(err){
				console.error(err);
			});
		})*/;
	} else {
		alert('invalid ID');
	}

}

function save(){}

function setup(){
	
	console.log('admin.js loaded');

	initFirebaseAuth();

	loadExternalHTML();

	searchButton.click(search);
	saveButton.click(save);

}

setup();
