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
const deleteMap = new Map();

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
	var monthEntry = Number(entryDoc.id.substring(0,2)) < 10 ? entryDoc.id.substring(1,2) : entryDoc.id.substring(0,2);
	var dayEntry   = Number(entryDoc.id.substring(2,4)) < 10 ? entryDoc.id.substring(3,4) : entryDoc.id.substring(2,4);
	tableDate.innerHTML = monthEntry + "/" + dayEntry + "/" + entryDoc.id.substring(4,8);
	row.appendChild(tableDate);

	var tableDoW = document.createElement('td');
	var date = new Date();
    var week = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
    date.setHours(12,0,0);
    date.setMonth(Number(entryDoc.id.substring(0,2))-1,Number(entryDoc.id.substring(2,4))); // months are zero based
    date.setYear(Number(entryDoc.id.substring(4,8)));
    tableDoW.innerHTML = week[date.getDay()];
	row.appendChild(tableDoW);

	var tableClockIn = document.createElement('td');
	if(entryDoc.data().clockInHour == 99){
        var tableClockInInput = document.createElement('input');
        tableClockInInput.type = "time";
        if( date.getDay() != 6 ) { // if not saturday, use 6 PM start
            tableClockInInput.value= "18:00";
            updateMap.set(studentDoc.id + "." + entryDoc.id, {in:"18:00"});
        } else {                   // if  saturday, use 10 AM start
            tableClockInInput.value= "10:00";
            updateMap.set(studentDoc.id + "." + entryDoc.id, {in:"10:00"});
        }
        tableClockInInput.addEventListener("input", () => {
            const existing = updateMap.get(studentDoc.id + "." + entryDoc.id) || {};
            updateMap.set(studentDoc.id + "." + entryDoc.id, {...existing,in:tableClockInInput.value});
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
            updateMap.set(studentDoc.id + "." + entryDoc.id,{out:"21:00"});
        } else {                   // if saturday, use 4 PM end
            tableClockOutInput.value= "16:00";
            updateMap.set(studentDoc.id + "." + entryDoc.id,{out:"16:00"});
        }
        row.appendChild(tableClockOutInput);
        tableClockOutInput.addEventListener("input", () => {
            const existing = updateMap.get(studentDoc.id + "." + entryDoc.id) || {};
            updateMap.set(studentDoc.id + "." + entryDoc.id,{...existing,out:tableClockOutInput.value});
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

    var tableDeleteEntryCheckBox = document.createElement('td');
	tableDeleteEntryCheckBox.innerHTML = "<input type=checkbox>";
    tableDeleteEntryCheckBox.style.textAlign = "center";
    tableDeleteEntryCheckBox.addEventListener("change", (e) => {
        if( e.target.checked ) {
            deleteMap.set(studentDoc.id + "." + entryDoc.id,"r"); // need something but just the existence indicates remove
        } else {
            deleteMap.delete(studentDoc.id + "." + entryDoc.id);
        }
    })
    row.appendChild(tableDeleteEntryCheckBox);

    var tableSkipEntryCheckBox = document.createElement('td');
	tableSkipEntryCheckBox.innerHTML = "<input type=checkbox>";
    tableSkipEntryCheckBox.style.textAlign = "center";
    tableSkipEntryCheckBox.addEventListener("change", (e) => {
        const existing = updateMap.get(studentDoc.id + "." + entryDoc.id) || {};
        if( e.target.checked ) {
            updateMap.set(studentDoc.id + "." + entryDoc.id,{...existing,skip:true});
        } else {
            updateMap.set(studentDoc.id + "." + entryDoc.id,{...existing,skip:false});
        }
    })
    row.appendChild(tableSkipEntryCheckBox);

	dataTableBody.append(row);
}

function updateData(){
    for (let [key, value] of updateMap) {

        // split the key up into its appropriate sections
        const myArray = key.split(".");
        var selectedID = myArray[0];
        var docName = myArray[1];

        if (value.skip !== true) {
            // update database
            var docRefStudent = people.doc(selectedID);
            var docRefLog = docRefStudent.collection("logs").doc(docName);

            // update clockIn or clockOut
            if (value.in) {
                docRefLog.update({
                    clockInHour:    Number(value.in.substring(0,2)), // value format is HH:MM
                    clockInMinute:  Number(value.in.substring(3,5))
                });
            }

            if (value.out) {
                docRefLog.update({
                    clockOutHour:    Number(value.out.substring(0,2)),
                    clockOutMinute:  Number(value.out.substring(3,5))
                });
            }
        }
    }

    // delete any entries marked for deletion
    for (let [key, value] of deleteMap) {
        // split the key up into its appropriate sections
        const myArray = key.split(".");
        var selectedID = myArray[0];
        var docName = myArray[1];

        // update database
        var docRefStudent = people.doc(selectedID);
        var docRefLog = docRefStudent.collection("logs").doc(docName);

        docRefLog.delete();
    }

    alert("Database updated");
}

function setup(){
	
	initFirebaseAuth();

	loadExternalHTML();

    document.getElementById('healthyDataMessage').innerHTML = "";

    var reviewCounter = 0;  // running count of people reviewed
    var peopleCount = 0;    // total number of people to be reviewed
    var dirty = false;      // flag to indicate if a bad record was found

	people.where("active","==",true).get()
	.then( querySnapshot => {
	    peopleCount = querySnapshot.size;

		querySnapshot.forEach(async function(studentDoc){
		    const logData = people.doc(studentDoc.id).collection('logs');

            // couldn't get the Filter.Or to work so instead getting
            // the bad records for clockInHour and clockOutHour separately
            await logData.where("clockInHour","==",99).get()
                .then(async function(queryLog) {
                    queryLog.forEach(logDoc => {
                        renderRowHTML(studentDoc,logDoc);
                        dirty = true;
                    })
                }).then(
                    await logData.where("clockOutHour","==",99).get()
                    .then(queryLog => {
                        queryLog.forEach(logDoc => {
                            renderRowHTML(studentDoc,logDoc);
                            dirty = true;
                        })
                    })
                ).then((notifyIfZeroErrors) => {
                    reviewCounter++;
                    if (reviewCounter == peopleCount) { // only check when we are at the last person
                        if (dirty == false) {
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
