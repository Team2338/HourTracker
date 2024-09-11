// JS for students.html
/*
!!Warning!!
you are about to use javascript you may end up throwing your device out the window
*/

import {admins, people, realTimeDataBase, loadExternalHTML, initFirebaseAuth, checkPermissions, firestore, today, todayDate} from './Scripts.js';

const toolsSection = $('#toolsSection');
const usersPresentSection = $('#usersPresentSection');
const studentEditSection = $('#studentEditSection');
const permWarning = $('#permWarning');
const dataTableBody = $('#tableBody');
const IDBox = $('#studentIdBox');
const firstNameBox = $('#firstNameBox');
const lastNameBox = $('#lastNameBox');
const searchActiveCheckbox = $('#searchActiveCheckbox');
const teamSelect = $('#teamSelect');
const searchButton = $('#searchButton');
const newButton = $('#newButton');
const editButton = $('#editButton');
const deleteButton = $('#deleteButton');
const hourTable = $('#personData');
const clearButton = $('#clearButton');
const downloadButton = $('#downloadButton');
const downloadDate = $('#downloadDate');
const downloadActiveStudentsFlag = $('#downloadActiveStudentsFlag');
const downloadStudentListButton = $('#downloadStudentListButton');
const dataHealthButton = $('#healthButton');
const viewDayReportButton = $('#viewDayReportButton');
const importButton = $('#importButton');
const hereTableBody = $('#hereTableBody');
const checkoutAllButton = $('#checkOutAll');
const checkoutTimeField = $('checkoutTime');
const hereTable = $('#hereTable');
const noOneHereBox = $('#noOneHereBox');
const notAuthorizedBox = $('#notAuthorizedBox');
const updateSelectDate = $('#selectDate');
const updateDoW = $('#selectDoW');
const updateStudentIDSelected = $('#selectIDList');
const updateStudentNameSelected = $('#selectNameList');
const updateStudentSubmitButton = $('#updateStudentSubmit');
const updateTimeInField  = $('#selectTimeIn');
const updateTimeOutField = $('#selectTimeOut');
const updateDeleteRecordButton = $('#deleteRecordButton');
const timeInActual = $("#timeInActual");
const timeOutActual = $("#timeOutActual");
const successCheckmarkItem = $("#successCheckmark");
const sortIDButton = $('#sortIDButton');
const sortNameButton = $('#sortNameButton');

var rowTemp;

const originalTableHTML = dataTableBody.innerHTML;
var dataTableHTML = '';

var studentList = [];

function newStudent() {
    // make sure we're an admin to perform this function
	admins.get().then(function(){
        resetTable();

        var selectedID = IDBox.val();
        var selectedFirstName = firstNameBox.val();
        var selectedLastName = lastNameBox.val();
        var selectedTeam = teamSelect.val();

        if ((selectedID.length == 8) &&
            (selectedFirstName.length > 0
                ) &&
            (selectedLastName.length > 0)
           ){

            var docRef = firestore.collection("Users").doc(selectedID);
            docRef.get().then(function(doc){

                if(doc.exists){
                    alert('Cannot create new student, Student exists');
                }else{
                    alert('New Student Created');
                    docRef.set({
                        active: true,
                        firstName: selectedFirstName,
                        lastName: selectedLastName,
                        teamNumber:"2338", //selectedTeam,
                        shopHours: 0,
                        serviceHours: 0
                    });
                    docRef.collection("logs").doc("init").set({
                        thing: "empty"
                    });
                    // TODO:
                    // add individual hour logs here
                }

            });


        } else {
            alert('new student parameters invalid');
        }
	}).catch(function(error) {
        checkPermissions(error, function(err){
          console.error(err);
        });
    });
}

function editStudent() {
    // make sure we're an admin to perform this function
	admins.get().then(function(){

        resetTable();

        var selectedID = IDBox.val();
        var selectedFirstName = firstNameBox.val();
        var selectedLastName = lastNameBox.val();
        var selectedTeam = teamSelect.val();
        var selectedActive = document.getElementById("searchActiveCheckbox").checked;

        if (selectedID.length == 8){

            var docRef = firestore.collection("Users").doc(selectedID);
            docRef.get().then(function(doc){

                if(doc.exists){

                    var newFirstName;
                    var newLastName;
                    var newTeamNumber;
                    var newActive = selectedActive;

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

                    if(selectedTeam != "none"){
                        newTeamNumber = selectedTeam;
                    } else {
                        newTeamNumber = doc.data().teamNumber;
                    }

                    docRef.set({
                        active: newActive,
                        firstName: newFirstName,
                        lastName: newLastName,
                        teamNumber: newTeamNumber,
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
    }).catch(function(error) {
        checkPermissions(error, function(err){
          console.error(err);
        });
    });
}

function deleteStudent(){
    // make sure we're an admin to perform this function
	admins.get().then(function(){

        var selectedID = IDBox.val();
        //var selectedFirstName = firstNameBox.val();
        //var selectedLastName = lastNameBox.val();
        //var selectedTeam = teamSelect.val();

        var docRef = people.doc(selectedID);

        var answer;

        if (selectedID.length == 8){
            docRef.get().then(function(Studentdoc){
                if(Studentdoc.exists){
                    answer = window.confirm("You are about to delete "+Studentdoc.data().firstName+". Are you sure about this?");
                    if (answer){
                        docRef.delete().then(function() {
                            console.log("Document successfully deleted!");
                        }).catch(function(error) {
                            checkPermissions(error, function(err){
                                console.error(err);
                            });
                        });
                    } else{
                        console.log('delete canceled');
                    }
                } else{
                    console.log('cannot delete, student not found');
                }

            });
        } else{
            console.log('Id not 8 chars');
        }
	}).catch(function(error) {
        checkPermissions(error, function(err){
          console.error(err);
        });
    });
}

function updateDeleteRecord(){
    // get values from screen
    var selectedID    = document.getElementById("selectIDList").value;
    var updateDate    = document.getElementById("selectDate").value;

    admins.get().then(function(){
        // get individual fields to find record
        var updateYear  = updateDate.substring(0,4); // 0 based
        var updateMonth = updateDate.substring(5,7);// 0 based
        var updateDay   = updateDate.substring(8); // 0 based
        var docName = updateMonth + updateDay + updateYear;

        // update database
        var docRefStudent = people.doc(selectedID);
        var docRefLog = docRefStudent.collection("logs").doc(docName);

        docRefStudent.get().then(function(Studentdoc){
            if(Studentdoc.exists){
                docRefLog.delete();

                updateStudentInfoFromRecord();
                successCheckmarkItem.css('visibility','visible');
            }else{
                alert("Database Error: Student does not exist.");
            }
        });
    }).catch(function(error) {
        checkPermissions(error, function(err){
        console.error(err);
        });
    });
}

function updateStudentSubmit(){
    // get values from screen
    var selectedID    = document.getElementById("selectIDList").value;
    var updateDate    = document.getElementById("selectDate").value;
    var updateInTime  = document.getElementById("selectTimeIn").value;
    var updateOutTime = document.getElementById("selectTimeOut").value;

    admins.get().then(function(){
        // validate data

        // get individual fields to create record
        var updateYear  = updateDate.substring(0,4); // 0 based
        var updateMonth = updateDate.substring(5,7);// 0 based
        var updateDay   = updateDate.substring(8); // 0 based
        var docName = updateMonth + updateDay + updateYear;

        var updateInHour    = updateInTime.substring(0,2);
        var updateInMinute  = updateInTime.substring(3);
        var updateOutHour   = updateOutTime.substring(0,2);
        var updateOutMinute = updateOutTime.substring(3);

        // do some data validation
        if( updateDate > today() ){
            alert('Date must be today or earlier.');
            return;
        }

        if( updateDate < "2022-01-08"){
            alert('Date must be on or after Jan 8, 2022');
            return;
        }

        if(updateOutTime < updateInTime){
            alert('Out Time must be later than In Time. Please check your selection.');
            return;
        }

        if( updateInTime.length == 0 || updateOutTime.length == 0){
            alert('Time fields must not be empty');
            return;
        }

        // update database
        var docRefStudent = people.doc(selectedID);
        var docRefLog = docRefStudent.collection("logs").doc(docName);

        docRefStudent.get().then(function(Studentdoc){
            if(Studentdoc.exists){
                docRefLog.get().then(function(Logdoc){
                    docRefLog.set({
                        clockInHour:    Number(updateInHour),
                        clockInMinute:  Number(updateInMinute),
                        clockOutHour:   Number(updateOutHour),
                        clockOutMinute: Number(updateOutMinute),
                        hourType: "shop"
                    });
                });
                //alert("Student " + selectedID + " has been updated for " + updateMonth + "/" + updateDay + "/" + updateYear)
                updateStudentInfoFromRecord();
                successCheckmarkItem.css('visibility','visible');
            }else{
                alert("Database Error: Student does not exist.");
            }
        });
    }).catch(function(error) {
        checkPermissions(error, function(err){
        console.error(err);
        });
    });
}

function updateTimeIn(){
    // Hide actual indication
    timeInActual.css('visibility', 'hidden');
    successCheckmarkItem.css('visibility','hidden');
}

function updateTimeOut(){
    // Hide actual indication
    timeOutActual.css('visibility', 'hidden');
    successCheckmarkItem.css('visibility','hidden');
}

function downloadStudentList(){
	var titleString ="ID,First Name,Last Name,Team,Active\r\n";
	var saveString = titleString;

	var i = 0;

    people.get()
	.then(function(querySnapshot) {
		querySnapshot.forEach(function(studentDoc) {
            var logString = studentDoc.id + ','
            + studentDoc.data().firstName + ','
            + studentDoc.data().lastName + ','
            + studentDoc.data().teamNumber + ','
            + studentDoc.data().active
            + '\r\n';
            saveString += logString;

            // when we have finished with the last record, save the string
            i += 1;
            if(i >= querySnapshot.size){
                save(saveString);
            }
        });
	}).catch(function(error) {
        checkPermissions(error, function(err){
            console.error(err);
        });
    });

	function save(myString){
		var blob = new Blob([myString], { type: 'text/plain' });
        var todayDate = new Date();
        var month = todayDate.getMonth()+1;
        var filename = "Hour Tracker Student List " + todayDate.getFullYear() + " " + month.toString().padStart(2, '0') + " " + todayDate.getDate().toString().padStart(2, '0') + ".csv";
		saveAs(blob, filename);
	}
}

function downloadCSV(){
	var titleString ="ID,First Name,Last Name,Team,Date,HourIn,MinuteIn,HourOut,MinuteOut,Type,Elapsed\r\n";
	var saveString = titleString;

	var isComplete = false;
	var i = 0;

    // Get selected date from screen (used to filter old records)
    var selectedDateUI = document.getElementById("downloadDate").value;
    var selectedDate = new Date();
    var selectedActive = document.getElementById("downloadActiveStudentsFlag").checked;

    selectedDate.setHours(12,0,0);
    selectedDate.setMonth(Number(selectedDateUI.substring(5,7))-1,Number(selectedDateUI.substring(8)));
    selectedDate.setYear(Number(selectedDateUI.substring(0,4)));

    people.get()
	.then(function(querySnapshot) {

		querySnapshot.forEach(function(studentDoc) {
			
			people.doc(studentDoc.id).collection('logs').get()
			.then(function(queryLog){
				
				queryLog.forEach(function(logDoc){

                    if( selectedActive == false || studentDoc.data().active == true ){ // second condition implies selectedActive==true
                        // logDoc.ID contains the date of the record
                        // only export data since UI selected date
                        // convert ID to date and compare
                        var idDate = new Date();
                        idDate.setHours(12,0,1);
                        idDate.setMonth(Number(logDoc.id.substring(0,2))-1,Number(logDoc.id.substring(2,4))); // months are zero based
                        idDate.setYear(Number(logDoc.id.substring(4,8)));

                        if(idDate > selectedDate){
                            var startDate = new Date();
                            var endDate = new Date();
                            var elapsed = 0;

                            startDate.setHours(logDoc.data().clockInHour);
                            startDate.setMinutes(logDoc.data().clockInMinute);
                            endDate.setHours(logDoc.data().clockOutHour);
                            endDate.setMinutes(logDoc.data().clockOutMinute);

                            if(  logDoc.data().clockInHour    != 99 &&
                                 logDoc.data().clockInMinute  != 99 &&
                                 logDoc.data().clockOutHour   != 99 &&
                                 logDoc.data().clockOutMinute != 99 ){
                                elapsed = ( endDate - startDate ) / 60000;
                            } else {
                                elapsed = 0;
                            }


                            var logString = studentDoc.id + ','
                            + studentDoc.data().firstName
                            + ',' + studentDoc.data().lastName
                            + ',' + studentDoc.data().teamNumber
                            + ',' + logDoc.id
                            + ',' + logDoc.data().clockInHour
                            + ',' + logDoc.data().clockInMinute
                            + ',' + logDoc.data().clockOutHour
                            + ',' + logDoc.data().clockOutMinute
                            + ',' + logDoc.data().hourType
                            + ',' + elapsed
                            + '\r\n';
                            saveString += logString;
                        }
                    }
				});

				// when we have finished with the last record, save the string
				i += 1;
				if(i >= querySnapshot.size){
					save(saveString);
				}

			});		
			
		});		

	}).catch(function(error) {
        checkPermissions(error, function(err){
            console.error(err);
        });
    });

	function save(myString){
		var blob = new Blob([myString], { type: 'text/plain' });
        var todayDate = new Date();
        var month = todayDate.getMonth()+1;
        var filename = "Hour Tracker " + todayDate.getFullYear() + " " + month.toString().padStart(2, '0') + " " + todayDate.getDate().toString().padStart(2, '0') + ".csv";
//		saveAs(blob, "HourLogData.csv");
		saveAs(blob, filename);

	}	
}

function importCSV(){
	const selectedFile = document.getElementById('importFile').files[0];

    // make sure we're an admin to perform this function
	admins.get().then(function(){
        // Check to make sure a file was selected
        if(selectedFile){
            let reader = new FileReader();
            reader.readAsText(selectedFile);

            reader.onload = function(progressEvent){
                var recordCount = 0;
                //split the file into an array of entries
                var entryArray = this.result.split(/\r\n|\n/);

                entryArray.forEach( function (entryLine){
                    var entryRecord = entryLine.split(",");

                    if(entryRecord[0] != "ID" && entryRecord[0] != ""){
                        recordCount++;
                        var docRefStudent = firestore.collection("Users").doc(entryRecord[0]);
                        docRefStudent.get().then(function(doc){
                            docRefStudent.set({
                                firstName:    entryRecord[1],
                                lastName:     entryRecord[2],
                                teamNumber:   entryRecord[3],
                                active:       true,
                                shopHours:    0,
                                serviceHours: 0
                            });

                            docRefStudent.collection("logs").doc("init").set({
                                thing: "empty"
                            });

                            if(entryRecord.length > 4 && entryRecord[4] != "init"){

                                docRefStudent.collection("logs").doc(entryRecord[4]).set({
                                    clockInHour:    Number(entryRecord[5]),
                                    clockInMinute:  Number(entryRecord[6]),
                                    clockOutHour:   Number(entryRecord[7]),
                                    clockOutMinute: Number(entryRecord[8]),
                                    hourType:       entryRecord[9]
                                });
                            }
                        })
                    }
                });
                alert(recordCount + " records updated.")
            };
        } else {
            alert("Please select a file for import")
        }
    }).catch(function(error) {
       checkPermissions(error, function(err){
           console.error(err);
       });
    });
}

function renderRowHTML(doc) {

	var row = document.createElement('tr');
	row.id = doc.id;
	//row.onclick = expandRow(doc.id);

	var tableID = document.createElement('td');
	tableID.innerHTML = doc.id;
	row.appendChild(tableID);

	var tableFirstName = document.createElement('td'); 
	tableFirstName.innerHTML = doc.data().firstName;
	row.appendChild(tableFirstName);

	var tableLastName = document.createElement('td');  
	tableLastName.innerHTML = doc.data().lastName;
	row.appendChild(tableLastName);

	var tableTeamNumber = document.createElement('td');
	tableTeamNumber.innerHTML = doc.data().teamNumber;
	row.appendChild(tableTeamNumber);

	var tableActive = document.createElement('td');
	tableActive.align="middle";
	if( doc.data().active ) {
	    tableActive.innerHTML = "Active";
	} else {
    	tableActive.innerHTML = "No";
	}
	row.appendChild(tableActive);

	/*
	var tableButton = document.createElement('button');
	var tableButtonData = document.createElement('td');
	
	tableButton.onclick = () => {
		expandRow(row);
	};
	
	tableButton.id = doc.id + "Button";
	tableButton.className = "expandButton"; 
	// for the arrow css later
	tableButtonData.appendChild(tableButton);
	row.appendChild(tableButtonData);
	*/
	dataTableBody.append(row);

}

function resetTable(){
	//dataTableBody.innerHTML = originalTableHTML;
	/*
	while(dataTableBody.firstChild){
		dataTableBody.removeChild(dataTableBody.firstChild);
	}*/
	$("#tableBody > tr").remove();
	//$("#dataTableBody tr").remove();
	
}

function expandRow(row){
	try{
		rowTemp.removeChild(hourTable);
	}catch(err){
		console.log(err);
	}

	rowTemp = row;
	hourTable.setAttribute('class','hourTable');
	var studentLogRef = db.collection("Users").doc(row.id).collection('logs');
	
	var titleRow = document.createElement('tr');
	var titleDate = document.createElement('th');
	var titleClockIn = document.createElement('th');
	var titleClockOut = document.createElement('th');
	var titleType = document.createElement('th');
	titleDate.innerHTML = 'Date';
	titleClockIn.innerHTML = 'Clock In';
	titleClockOut.innerHTML = 'Clock Out';
	titleType.innerHTML = 'Type';
	titleRow.appendChild(titleDate);
	titleRow.appendChild(titleClockIn);
	titleRow.appendChild(titleClockOut);
	titleRow.appendChild(titleType);
	hourTable.appendChild(titleRow);
	studentLogRef.get()
	.then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {

			var log = document.createElement('tr');
			
			var clockInData = document.createElement('td');
			var clockOutData = document.createElement('td');
			var dateData = document.createElement('td');
			var typeData = document.createElement('td');
			clockInData.innerHTML = doc.data().clockInHour + ":" + doc.data().clockInMinute;
			clockOutData.innerHTML = doc.data().clockOutHour + ":" + doc.data().clockOutMinute;
			dateData.innerHTML = doc.id;
			typeData.innerHTML = doc.data().hourType;
			log.appendChild(dateData);
			log.appendChild(clockInData);
			log.appendChild(clockOutData);
			log.appendChild(typeData);
			hourTable.appendChild(log);		
		});
		
		row.appendChild(hourTable);
	}).catch(function(error) {
		checkPermissions(error, function(err){
			console.error(err);
		});
	});
	
}

function removeAllChildren(thing){
	while(thing.firstChild){
		thing.removeChild(thing.firstChild);
	}
}

function getDoW(d){
    var week = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
    return week[d.getDay()];
}

function prepareUpdateFields(){
    // set initial, max, and min dates
    document.getElementById('selectDate').setAttribute("min", '2022-01-08');
    document.getElementById('selectDate').setAttribute("max", today());

    document.getElementById('selectDate').setAttribute("value", today());

    document.getElementById('selectDoW').innerHTML = getDoW(todayDate());

    // set Time In to a common start time
    document.getElementById('selectTimeIn').setAttribute("value", "18:00");

    // initialize StudentName to empty
    document.getElementById('updateStudentName').innerHTML = "";

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
/*
* This function will clear the success checkmark and then load the student info.
* Need this because after submitting, the updateStudentInfoFromRecord is called
* and if the hidden was placed there, the checkmark would only show for a brief second
*/
function updateStudentInfoFromRecordReset(){
    successCheckmarkItem.css('visibility','hidden');
    updateStudentInfoFromRecord();
}

function updateStudentIDFromName(){
    document.getElementById('selectIDList').value = document.getElementById('selectNameList').value;
    updateStudentInfoFromRecord();
}

function updateStudentInfoFromRecord(){

    var selectedID = document.getElementById("selectIDList").value;
    var updateDate = document.getElementById("selectDate").value;

    admins.get().then(function(){
        // split selected date to YYYY, MM, DD in order to get record from DB
        var updateYear  = updateDate.substring(0,4); // 0 based
        var updateMonth = updateDate.substring(5,7);// 0 based
        var updateDay   = updateDate.substring(8); // 0 based
        var docName = updateMonth + updateDay + updateYear; // format to database doc format

        // if empty string was selected, do nothing and reset all fields
        if( selectedID == ""){
            // reset fields
            resetUpdateFields();
            document.getElementById('updateStudentName').innerHTML = "";
            return;
        }

        // update Weekday field
        var date = new Date();
        date.setMonth(updateMonth-1,updateDay); // months are zero based, also sets date
        date.setYear(updateYear);
        date.setHours(12,0,0);
        document.getElementById('selectDoW').innerHTML = getDoW(date);

        // read database and populate in and out times
        var docRefStudent = people.doc(selectedID);
        var docRefLog = docRefStudent.collection("logs").doc(docName);

        docRefStudent.get().then(function(Studentdoc){
            if(Studentdoc.exists){
                document.getElementById('updateStudentName').innerHTML = Studentdoc.data().firstName + " " + Studentdoc.data().lastName;
                document.getElementById('selectNameList').value = selectedID;
                docRefLog.get().then(function(logDoc){
                    if(logDoc.exists){
                        if (logDoc.data().clockInHour != 99){
                            // convert database fields to usable date in YYYY-MM-DD format
                            var time = new Date();
                            time.setUTCHours(logDoc.data().clockInHour);
                            time.setUTCMinutes(logDoc.data().clockInMinute);
                            // update UI
                            document.getElementById('selectTimeIn').value = time.toISOString().substr(11, 5);

                            // Show actual indication
                            timeInActual.css('visibility', 'visible');
                        } else {
                            // Field contains 99. This is a placeholder in the DB and should be ignored
                            document.getElementById('selectTimeIn').value = "";
                            // Hide actual indication
                            timeInActual.css('visibility', 'hidden');
                        }

                        if (logDoc.data().clockOutHour != 99){
                            // convert database fields to usable date in YYYY-MM-DD format
                            var time = new Date();
                            time.setUTCHours(logDoc.data().clockOutHour);
                            time.setUTCMinutes(logDoc.data().clockOutMinute);
                            // update UI
                            document.getElementById('selectTimeOut').value = time.toISOString().substr(11, 5);

                            // Show actual indication
                            timeOutActual.css('visibility', 'visible');
                        } else {
                            // Field contains 99. This is a placeholder in the DB and should be ignored
                            document.getElementById('selectTimeOut').value = "";
                            // Hide actual indication
                            timeOutActual.css('visibility', 'hidden');
                        }
                    } else {
                        // reset fields
                        resetUpdateFields();
                    }
                });

            }else{
                alert("Database Error: Student does not exist.");
            }
        });

    }).catch(function() {
//    }).catch(function(error) {
//        checkPermissions(error, function(err){
//        console.error(err);
//        });
    });
}

function resetUpdateFields(){
    // reset all the fields (leaving the date field alone for now)
    document.getElementById('selectNameList').value = document.getElementById('selectIDList').value;

    var updateDateElement = document.getElementById("selectDate").value;
    var date = new Date();
    date.setMonth(Number(updateDateElement.substring(5,7))-1,Number(updateDateElement.substring(8,10))); // months are zero based, also sets date
    date.setYear(Number(updateDateElement.substring(0,4)));
    date.setHours(12,0,0);
    var startTime = date.getDay() == 6 ? "10:00" : "18:00";
    document.getElementById('selectTimeIn').value = startTime;

    document.getElementById('selectTimeOut').value = "";
    document.getElementById('selectDoW').innerHTML = getDoW(date);
    timeInActual.css('visibility', 'hidden');
    timeOutActual.css('visibility', 'hidden');
    successCheckmarkItem.css('visibility','hidden');
}

function search(){
	resetTable();

	var selectedID = IDBox.val();
	var selectedFirstName = firstNameBox.val();
	var selectedLastName = lastNameBox.val();
	var selectedTeam = teamSelect.val();
	var selectedActive = document.getElementById("searchActiveCheckbox").checked;
	
	var filteredPeople;

//	console.log(selectedID);
//	console.log(selectedLastName);
//	console.log(selectedLastName);
//	console.log(selectedTeam);
//	console.log(selectedActive);

    // make sure we're an admin to perform this function
	admins.get().then(function(){
        if(selectedID.length === 8){
            console.log('ID search');
            filteredPeople = people.doc(selectedID).get()
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

        } else if(selectedID.length === 0){

            filteredPeople = people;

            if(selectedFirstName.length >0){
                filteredPeople = filteredPeople.where("firstName","==", selectedFirstName);
            }
            if(selectedLastName.length > 0){
                filteredPeople = filteredPeople.where("lastName", "==", selectedLastName);
            }
            if(selectedTeam != "none"){
                filteredPeople = filteredPeople.where("teamNumber","==", selectedTeam);
            }
            if(selectedActive){
                filteredPeople = filteredPeople.where("active","==", true);
            }

            filteredPeople.get()
            .then(function(querySnapshot) {
                //dataTableHTML = '';
                querySnapshot.forEach(function(doc) {
                    //console.log(doc.id, " => ", doc.data());
                    if(doc.id.length === 8){// filters out admins which use UIDs that are greater than 8 chars
                        renderRowHTML(doc);
                    }
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
    }).catch(function(error) {
        checkPermissions(error, function(err){
            console.error(err);
        });
    });
}

function checkoutAll(){
	realTimeDataBase.ref('users/').once('value').then((snapshot) => {

		var time = new Date();

		var checkoutHour = time.getHours();
		var checkoutMinute = time.getMinutes();

        // if the clock field is set, use that value
        var checkoutTime  = document.getElementById("checkoutTime").value;
        if( checkoutTime != ""){
            checkoutHour   = Number( checkoutTime.substring(0,2));
            checkoutMinute = Number( checkoutTime.substring(3));
        }

		var year = String(time.getFullYear());
		var month = String(time.getMonth() +1); // month +1 because index starts at 0
		var day = String(time.getDate());
		
		month = (month.length == 1)? '0' + month : month;
		day = (day.length == 1)? '0' + day : day;

		var peopleList = snapshot.val().here;

		var docName = month + day + year;

		peopleList.forEach(function(element){
			var studentID = element[0];
			
			if(studentID != "N/A"){

			var docRefLog = people.doc(studentID).collection("logs").doc(docName);

			docRefLog.get().then(function(logDoc){
				if(logDoc.exists){
					docRefLog.set({
						clockInHour: logDoc.data().clockInHour,
						clockInMinute: logDoc.data().clockInMinute,
						clockOutHour: checkoutHour,
						clockOutMinute: checkoutMinute,
						hourType: logDoc.data().hourType
					});
				}
			});
			}
		});

		peopleList = [["null","null","null"]];

		realTimeDataBase.ref('users/').set({
			here: peopleList
		});
		updateStudentInfoFromRecordReset();
	}).catch(function(error) {
		checkPermissions(error, function(err){
			console.error(err);
		});
	});
}

function clearTextBoxes(){
	teamSelect.val("none");
	IDBox.val("");
	firstNameBox.val("");
	lastNameBox.val("");
}

function refreshRealTime(snapshot){

	hereTableBody.empty();
	
	var peopleList = snapshot.val().here;

//	admins.get().then(function(){
        peopleList.forEach(function(element){

            if(element[0] === "null"){
                hereTable.css('display', 'none');
                noOneHereBox.css('display', 'block');
                notAuthorizedBox.css('display', 'none');
            } else {
                hereTable.css('display', 'block');
                noOneHereBox.css('display', 'none');
                notAuthorizedBox.css('display', 'none');

                var row = document.createElement('tr');
                var ID = document.createElement('td');
                var firstName = document.createElement('td');
                var lastName = document.createElement('td');

                ID.innerHTML = element[0];
                firstName.innerHTML = element[1];
                lastName.innerHTML = element[2];

                row.appendChild(ID);
                row.appendChild(firstName);
                row.appendChild(lastName);

                hereTableBody.append(row);
            }
        });
//	}).catch(function(error) {
//        hereTable.css('display', 'none');
//        noOneHereBox.css('display', 'none');
//        notAuthorizedBox.css('display', 'block');
//    });
}

function dataHealthReport(){

    open('./html/dataHealthReport.html');

    return;

    // The following works but requires a full read of the database just
    // to determine if there is a single error in the database. Given our
    // account has a quota, it is too costly to run this here and then
    // again on the report page.
    // Kept it here to show the usage of the 'where' clause and limit()

/*
    var count = 0;
    var peopleCount = 0;
    var dataSize = 0;

	people.get()
	.then( (querySnapshot) => {
	    dataSize = querySnapshot.size;
	    console.log("datasize " , dataSize );
		querySnapshot.forEach((studentDoc) => {
			var missingIn = people.doc(studentDoc.id).collection('logs').where("clockInHour", "==", 99).limit(1);
			missingIn.get()
                .then((querySnapshot) => {
                    if( querySnapshot.size > 0){
                        count++;
                    }
                    peopleCount++;
                    console.log("index " , peopleCount , " " , querySnapshot.size);
                }).then((alertIfZero) => {
                    if( peopleCount == dataSize ) {
                        if( count == 0 ) {
                            alert("Database is healthy");
                        } else {
                            alert("Reporting  page should be opened");
                        }
                    }
			    })
        })
    });
*/
}

function viewDayReport(){
    open('./html/viewDayReport.html');
    return;
}

/*
function createAdmin(email,password){

	auth.createUserWithEmailAndPassword(email, password)
	.then((userCredential) => {
		// Signed in 
		var user = userCredential.user;
		// ...
		console.log(userCredential);
	
	}).catch(function(error) {
		checkPermissions(error, function(err){
			console.error(err);
		});
	});
}
*/


function setup(){
	
	initFirebaseAuth();

	loadExternalHTML();

    createStudentList();

	searchButton.click(search);
	newButton.click(newStudent);
	editButton.click(editStudent);
	deleteButton.click(deleteStudent);
	clearButton.click(clearTextBoxes);
	downloadButton.click(downloadCSV);
	downloadStudentListButton.click(downloadStudentList);
	dataHealthButton.click(dataHealthReport);
	viewDayReportButton.click(viewDayReport);
    importButton.click(importCSV);
	checkoutAllButton.click(checkoutAll);
	sortIDButton.click(sortStudentListID);
	sortNameButton.click(sortStudentListName);

	updateSelectDate.change(updateStudentInfoFromRecordReset);
	updateStudentIDSelected.change(updateStudentInfoFromRecordReset);
    updateStudentNameSelected.change(updateStudentIDFromName);
	updateTimeInField.change(updateTimeIn);
	updateTimeOutField.change(updateTimeOut);
    updateDeleteRecordButton.click(updateDeleteRecord);
    updateStudentSubmitButton.click(updateStudentSubmit);

	admins.get().then(function() {
	    usersPresentSection.css('display', 'block');
		admins.doc(firebase.auth().currentUser.uid).get().then(function(doc){
		    // by default, the sections are hidden, so this shows the appropriate section
            if(doc.data().admin) { // this is the admin field in the document
                toolsSection.css('display', 'block');
                studentEditSection.css('display','block');
            }
        })
    }).catch(function(){
        permWarning.css('display','block');
    });

	realTimeDataBase.ref('users/').on('value', (snapshot) => {
		refreshRealTime(snapshot);
	});
}

setup();
