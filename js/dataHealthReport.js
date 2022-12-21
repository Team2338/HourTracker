// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

import {admins, people, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions, firestore, today} from './Scripts.js';

const dataTableBody = $('#tableBody');
const healthyDataMessage = $("#healthyDataMessage");
const updateDataButton = $('#updateDataButton');
const updateMap = new Map();

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

	var tableDate = document.createElement('td');
	var date = new Date();
    var week = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
    date.setHours(12,0,0);
    date.setMonth(Number(entryDoc.id.substring(0,2))-1,Number(entryDoc.id.substring(2,4))); // months are zero based
    date.setYear(Number(entryDoc.id.substring(4,8)));
    tableDate.innerHTML = week[date.getDay()];
	row.appendChild(tableDate);

	var tableClockIn = document.createElement('td');
	if(entryDoc.data().clockInHour == 99){
        var tableClockInInput = document.createElement('input');
        tableClockInInput.type = "time";
        if( date.getDay() != 6 ) { // if not saturday, use 6 PM start
            tableClockInInput.value= "18:00";
            updateMap.set(studentDoc.id + "." + entryDoc.id + '.in',"18:00");
        } else {                   // if  saturday, use 10 AM start
            tableClockInInput.value= "10:00";
            updateMap.set(studentDoc.id + "." + entryDoc.id + '.in',"10:00");
        }
        tableClockInInput.addEventListener("input", () => {
            updateMap.set(studentDoc.id + "." + entryDoc.id + '.in',tableClockInInput.value);
        })
        row.appendChild(tableClockInInput);
//        row.appendChild(tableClockIn);
	} else {
        tableClockIn.style.textAlign = "left";
        // display record time in "H:MM AM" format
        var hour = entryDoc.data().clockInHour > 12 ? entryDoc.data().clockInHour - 12 : entryDoc.data().clockInHour;
        if( entryDoc.data().clockInHour == 0 ) {
            hour = 12;
        }
        var ampm = entryDoc.data().clockInHour > 11 ? "PM" : "AM";

        tableClockIn.innerHTML = hour + ":" + entryDoc.data().clockInMinute.toString().padStart(2,"0") + " " + ampm;// entryDoc.data().clockInHour + ":" + entryDoc.data().clockInMinute.toString().padStart(2,"0");
        row.appendChild(tableClockIn);
	}

	var tableClockOut = document.createElement('td');
	if(entryDoc.data().clockOutHour == 99){
        var tableClockOutInput = document.createElement('input');
        tableClockOutInput.type = "time";
        if( date.getDay() != 6 ) { // if not saturday, use 9 PM end
            tableClockOutInput.value= "21:00";
            updateMap.set(studentDoc.id + "." + entryDoc.id + '.out',"21:00");
        } else {                   // if saturday, use 4 PM end
            tableClockOutInput.value= "16:00";
            updateMap.set(studentDoc.id + "." + entryDoc.id + '.out',"16:00");
        }
        row.appendChild(tableClockOutInput);
        tableClockOutInput.addEventListener("input", () => {
            updateMap.set(studentDoc.id + "." + entryDoc.id + '.out',tableClockOutInput.value);
        })
    } else {
        tableClockOut.style.textAlign = "left";

        // display record time in "H:MM AM" format
        var hour = entryDoc.data().clockOutHour > 12 ? entryDoc.data().clockOutHour - 12 : entryDoc.data().clockOutHour;
        if( entryDoc.data().clockOutHour == 0 ) {
            hour = 12;
        }
        var ampm = entryDoc.data().clockOutHour > 11 ? "PM" : "AM";

        tableClockOut.innerHTML = hour + ":" + entryDoc.data().clockOutMinute.toString().padStart(2,"0") + " " + ampm;
        row.appendChild(tableClockOut);
    }

	dataTableBody.append(row);
}

function updateData(){
    for (let [key, value] of updateMap) {

        // split the key up into its appropriate sections
        const myArray = key.split(".");
        var selectedID = myArray[0];
        var docName = myArray[1];
        var inOut = myArray[2];

        // update database
        var docRefStudent = people.doc(selectedID);
        var docRefLog = docRefStudent.collection("logs").doc(docName);

        // update clockIn or clockOut
        if( inOut == "in" ){
            docRefLog.update({
                clockInHour:    Number(value.substring(0,2)), // value format is HH:MM
                clockInMinute:  Number(value.substring(3,5))
            });
        } else {
            docRefLog.update({
                clockOutHour:    Number(value.substring(0,2)),
                clockOutMinute:  Number(value.substring(3,5))
            });
        }
    }
    alert("Database updated");
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
		querySnapshot.forEach((studentDoc) => {
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
                if( reviewCounter == peopleCount ) { // only notify on the last student
                    if( errorCount == 0 ) { // only notify if there were no errors
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

    updateDataButton.click(updateData);
}

setup();
