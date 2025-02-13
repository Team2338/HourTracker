// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

import {admins, people, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions, firestore, today} from './Scripts.js';

const dataTableBody = $('#tableBody');
const runReportButton = $('#runReportButton');
const permWarning = $('#permWarning');
const dateSelection = $('#dateSelection');
const peopleData = $('#peopleData');

function renderRowHTML(studentDoc,entryDoc) {

	var row = document.createElement('tr');
	row.id = studentDoc.id;

    // ID
	var tableID = document.createElement('td');
	tableID.innerHTML = studentDoc.id;
	row.appendChild(tableID);

    // First Name
	var tableFirstName = document.createElement('td'); 
	tableFirstName.innerHTML = studentDoc.data().firstName;
	row.appendChild(tableFirstName);

    // Last Name
	var tableLastName = document.createElement('td');  
	tableLastName.innerHTML = studentDoc.data().lastName;
	row.appendChild(tableLastName);

    // Clock In
	var tableClockIn = document.createElement('td');
	if(entryDoc.data().clockInHour == 99){
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

    // C;ock Out
	var tableClockOut = document.createElement('td');
	if(entryDoc.data().clockOutHour == 99){
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

async function runReport(){
    var updateDate = document.getElementById("selectViewDate").value;

    var updateYear  = updateDate.substring(0,4); // 0 based
    var updateMonth = updateDate.substring(5,7);// 0 based
    var updateDay   = updateDate.substring(8); // 0 based
    var docName = updateMonth + updateDay + updateYear; // format to database doc format

    // clear the table
    $("#tableBody > tr").remove();


/*
    // Works but gets the subcollection document and no reference to the parent document
    // therefore the student info is not returned
    const querySnapshot = await firestore.collectionGroup('logs').where('clockInHour','==',6).get();
    querySnapshot.forEach((doc) => {
        console.log(doc);
    });
*/

    const queryResult = await people.where("active","==",true).get();
    queryResult.forEach(docRefStudent => {
         var docRefLog = people.doc(docRefStudent.id).collection('logs').doc(docName);
         docRefLog.get().then(logDoc => {
             if(logDoc.exists){
                 renderRowHTML(docRefStudent,logDoc);
             }
         });
     });

/*    people.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(docRefStudent) {
            var docRefLog = people.doc(docRefStudent.id).collection('logs').doc(docName);
            docRefLog.get().then(function(logDoc){
                if(logDoc.exists){
                    renderRowHTML(docRefStudent,logDoc);
                }
            });
        });
    }).catch(function(error) {
        // do not show user list if not signed in as an admin
    });
*/
}

function prepareViewDayDate(){
    // set initial, max, and min dates
    // use yesterday is initial date to run report
    document.getElementById('selectViewDate').setAttribute("min", '2022-01-08');
    document.getElementById('selectViewDate').setAttribute("max", today());
    document.getElementById('selectViewDate').setAttribute("value", today(-1));
}

function setup(){
	
	initFirebaseAuth();

	loadExternalHTML();

    prepareViewDayDate();

    runReportButton.click(runReport);

    // allows access to the elements on the page
    // must be an admin to access this page (i.e. admin field for this logged in user is set to true)
    admins.get().then(function() {
        admins.doc(firebase.auth().currentUser.uid).get().then(doc => {
            // by default, the sections are hidden, so this shows the appropriate section
            if(doc.data().admin) {// this is the admin field in the document
                dateSelection.css('display','block');
                peopleData.css('display','block');

                // run the initial report using the day set in prepareViewDayDate
                runReport();
            } else {
                permWarning.css('display','block');
            }
        });
    }).catch(function(){
        permWarning.css('display','block');
    });
}

setup();
