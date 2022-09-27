// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

import {admins, people, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions, firestore, today} from './Scripts.js';

const dataTableBody = $('#tableBody');
const healthyDataMessage = $("#healthyDataMessage");

function renderRowHTML(studentDoc, entryDoc) {

	var row = document.createElement('tr');
	row.id = studentDoc.id;

	var tableID = document.createElement('td');
	tableID.innerHTML = studentDoc.id;
	row.appendChild(tableID);

	var tableFirstName = document.createElement('td'); 
	tableFirstName.innerHTML = studentDoc.data().firstName;
	row.appendChild(tableFirstName);

	var tableLastName = document.createElement('td');  
	tableLastName.innerHTML = studentDoc.data().lastName;
	row.appendChild(tableLastName);

	var tableDate = document.createElement('td');
	tableDate.innerHTML = entryDoc.id;
	row.appendChild(tableDate);

	var tableClockInHour = document.createElement('td');
	tableClockInHour.innerHTML = entryDoc.data().clockInHour;
	row.appendChild(tableClockInHour);
	
	var tableClockInMinute = document.createElement('td');
	tableClockInMinute.innerHTML = entryDoc.data().clockInMinute;
	row.appendChild(tableClockInMinute);

	var tableClockOutHour = document.createElement('td');
	tableClockOutHour.innerHTML = entryDoc.data().clockOutHour;
	row.appendChild(tableClockOutHour);

	var tableClockOutMinute = document.createElement('td');
	tableClockOutMinute.innerHTML = entryDoc.data().clockOutMinute;
	row.appendChild(tableClockOutMinute);

	dataTableBody.append(row);
}

function setup(){
	
	initFirebaseAuth();

	loadExternalHTML();

    document.getElementById('healthyDataMessage').innerHTML = "";

    var errorCount = 0;     // running count of errors
    var reviewCounter = 0;  // running count of people reviewed
    var peopleCount = 0;    // total number of people to be reviewed

	people.get()
	.then((querySnapshot) => {
	    peopleCount = querySnapshot.size;
//	    console.log("people count " , peopleCount);
		querySnapshot.forEach((studentDoc) => {
//            console.log("index " , reviewCounter, " " , studentDoc.data().firstName);

			people.doc(studentDoc.id).collection('logs').get()
			.then((queryLog) => {
                reviewCounter++;
				queryLog.forEach((logDoc) => {
                    if( logDoc.data().clockInHour == 99 || logDoc.data().clockOutHour == 99) {
                        renderRowHTML(studentDoc,logDoc);
                        errorCount++;
                    }
                })
            }).then((notifyIfZeroErrors) => {
//                console.log(reviewCounter , " " , peopleCount , " " , errorCount)
                if( reviewCounter == peopleCount ) { // only notify on the last student
                    if( errorCount == 0 ) { // only notify if there were no errors
//                        alert("Data is healthy!");
                        healthyDataMessage.css('visibility','visible');
                        document.getElementById('healthyDataMessage').innerHTML = "Data is healthy!";
                    }
                }
            })
		})
	}).catch(function(error) {
        checkPermissions(error, function(err){
            console.error(err);
        });
    });
}

setup();
