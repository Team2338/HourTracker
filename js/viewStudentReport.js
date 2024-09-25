// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

/*
    Overall works but would have preferred to load the data into an array and then displayed.
    Was unable to figure that out so instead just used the date format YYYY/MM/DD
    Would have preferred to use the format MM/DD/YY
    The entryList[] was an attempt, along with addToEntryList and renderTest
*/

import {admins, people, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions, firestore, today} from './Scripts.js';

const studentSelection = $('#studentSelection');
const peopleTable = $('#peopleData');
const permWarning = $('#permWarning');
const dataTableBody = $('#tableBody');
const runReportButton = $('#runReportButton');
const updateStudentIDSelected = $('#selectIDList');
const updateStudentNameSelected = $('#selectNameList');
const sortIDButton = $('#sortIDButton');
const sortNameButton = $('#sortNameButton');

var studentList = [];
//var entryList = [];

function getDoW(d){
    var week = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
    return week[d.getDay()];
}

function renderRowHTML(entryDoc) {

	var row = document.createElement('tr');
	row.id = entryDoc.id;

    // Date
    var entryYear  = entryDoc.id.substring(4); // 0 based
    var entryMonth = entryDoc.id.substring(0,2);// 0 based
    var entryDay   = entryDoc.id.substring(2,4); // 0 based

	var tableDate = document.createElement('td');
	tableDate.innerHTML = entryYear + "/" + entryMonth + "/" + entryDay; // used this format so data can be sorted on screen
//	tableDate.innerHTML = entryMonth + "/" + entryDay + "/" + entryYear;
//	tableDate.innerHTML = entryDay + "/" + entryMonth + "/" + entryYear;
	row.appendChild(tableDate);

    // Day of Week
    var date = new Date();
    date.setMonth(entryMonth-1,entryDay); // months are zero based, also sets date
    date.setYear(entryYear);
    date.setHours(12,0,0);

	var tableDoW = document.createElement('td');
	tableDoW.innerHTML = getDoW(date);
	row.appendChild(tableDoW);

    // Clock In
	var tableClockIn = document.createElement('td');
	if (entryDoc.data().clockInHour == 99) {
        tableClockIn.style.textAlign = "left";
        tableClockIn.innerHTML = "missing";
	} else {
        tableClockIn.style.textAlign = "left";
        // display record time in "H:MM AM" format
        var hour = entryDoc.data().clockInHour > 12 ? entryDoc.data().clockInHour - 12 : entryDoc.data().clockInHour;
        if( entryDoc.data().clockInHour == 0 ) {
            hour = 12;
        }
        var ampm = entryDoc.data().clockInHour > 11 ? "PM" : "AM";

        tableClockIn.innerHTML = hour + ":" + entryDoc.data().clockInMinute.toString().padStart(2,"0") + " " + ampm;// entryDoc.data().clockInHour + ":" + entryDoc.data().clockInMinute.toString().padStart(2,"0");
	}
    row.appendChild(tableClockIn);

    // Clock Out
	var tableClockOut = document.createElement('td');
	if (entryDoc.data().clockOutHour == 99) {
        tableClockOut.style.textAlign = "left";
        tableClockOut.innerHTML = "missing";
    } else {
        tableClockOut.style.textAlign = "left";

        // display record time in "H:MM AM" format
        var hour = entryDoc.data().clockOutHour > 12 ? entryDoc.data().clockOutHour - 12 : entryDoc.data().clockOutHour;
        if( entryDoc.data().clockOutHour == 0 ) {
            hour = 12;
        }
        var ampm = entryDoc.data().clockOutHour > 11 ? "PM" : "AM";

        tableClockOut.innerHTML = hour + ":" + entryDoc.data().clockOutMinute.toString().padStart(2,"0") + " " + ampm;
    }
    row.appendChild(tableClockOut);

	dataTableBody.append(row);
}

// used as test to sort the data first and then render on screen
// but the rendering was delayed until after the user selected
// a different id/name
//function renderTest() {
//    // clear the table
//    $("#tableBody > tr").remove();
//
//    entryList.forEach(student => {
//        var row = document.createElement('tr');
//        row.id = student[0];
//
//        var tableDate = document.createElement('td');
//        tableDate.innerHTML = student[0];
//        row.appendChild(tableDate);
//
//        var tableIn = document.createElement('td');
//        tableIn.innerHTML = student[1];
//        row.appendChild(tableIn);
//
//    	dataTableBody.append(row);
//    })
//}

// used as test to sort the data first and then render on screen
// but the rendering was delayed until after the user selected
// a different id/name
//function addToEntryList(entryDoc) {
//    entryList.push([
//        entryDoc.id,
//        entryDoc.data().clockInHour]);
//}

function RunReport(){
    $("#tableBody > tr").remove();

    people.doc(document.getElementById('selectIDList').value).collection('logs').get()
    .then((queryLog) => {
//            entryList.length = 0;
            queryLog.forEach((logDoc) => {
            if (logDoc.id != "init") {
                renderRowHTML(logDoc);
//                addToEntryList(logDoc);
            }
        })
    }).catch(function(error) {
        checkPermissions(error, function(err){
            console.error(err);
        });
    });
}

function updateStudentNameFromID(){
    document.getElementById('selectNameList').value = document.getElementById('selectIDList').value;
    RunReport();
}

function updateStudentIDFromName(){
    document.getElementById('selectIDList').value = document.getElementById('selectNameList').value;
    RunReport();
}

function resetUpdateFields(){
    // reset all the fields (leaving the date field alone for now)
    document.getElementById('selectNameList').value = document.getElementById('selectIDList').value;
}

function prepareUpdateFields(){
    // load list of IDs to dropdown
    var select = document.getElementById('selectIDList');
    var selectName = document.getElementById('selectNameList');

    // clear the drop down list (except for the first blank entry)
    select.length=1;
    selectName.length=1;

    studentList.forEach(student => {
        var opt = document.createElement('option');
        opt.value = student[0];
        opt.innerHTML = student[0];
        select.appendChild(opt);

        var optName = document.createElement('option');
        optName.value = student[0];
        optName.innerHTML = student[1];
        selectName.appendChild(optName);
    });
}

// Creates the student list from the DB (and populates the dropdown fields initially)
// The querySnapshot utilizes a callback function so
// in order to populate the student list to the dropdown
// fields when the page first loads, need to also call
// the prepareUpdateFields function from within the callback function
function createStudentList(){
    admins.get().then(function(){
        people.get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if(doc.data().active == true) {
                    if(doc.id.length === 8){ // filters out admins which use UIDs that are greater than 8 chars
                        studentList.push([
                            doc.id,
                            doc.data().firstName + " " + doc.data().lastName]);
                    };
                };
            });
            prepareUpdateFields();
        });

    }).catch(function(error) {
        // do not show user list if not signed in as an admin
    });

}

function sortStudentListName(){
    studentList.sort(function(a,b){ return a[1] > b[1] ? 1 : -1;});
    prepareUpdateFields();
    resetUpdateFields();
}

function sortStudentListID(){
    studentList.sort(function(a,b){ return a[0] - b[0]});
    prepareUpdateFields();
    resetUpdateFields();
}

function setup(){
	
	initFirebaseAuth();

	loadExternalHTML();

    createStudentList();

    sortIDButton.click(sortStudentListID);
    sortNameButton.click(sortStudentListName);
    updateStudentNameSelected.change(updateStudentIDFromName);
    updateStudentIDSelected.change(updateStudentNameFromID);

    // allows access to the elements on the page
    // must be an admin to access this page (i.e. admin field for this logged in user is set to true)
    admins.get().then(function() {
        admins.doc(firebase.auth().currentUser.uid).get().then(function(doc){
            // by default, the sections are hidden, so this shows the appropriate section
            if(doc.data().admin) {// this is the admin field in the document
                peopleTable.css('display','block');
                studentSelection.css('display','block');
            } else {
                permWarning.css('display','block');
            }
        });
    }).catch(function(){
        permWarning.css('display','block');
    });

}

setup();
