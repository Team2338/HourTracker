package GIFhourLogger.dataprocessing;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import GIFhourLogger.Constants.dataProcessing;

import GIFhourLogger.dataprocessing.CSVthing;

/**  this class is for the processing of data**/

public class logging {

    ArrayList<List<String>> logs = null;

    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
    SimpleDateFormat timeFormat = new SimpleDateFormat(" HH:mm:ss");

    String savePath= "";
    String backupPath = "";
    //Gson gson = null;

    public logging(){
        logs = new ArrayList<List<String>>();
        Date date = new Date();

        savePath = dataProcessing.Save + "GIFlogs-"+ dateFormat.format(date) +".csv";
        backupPath = dataProcessing.Save + "GIFlogs-"+ dateFormat.format(date) + "BACKUP" +".csv";

        List<String> labels = new ArrayList<String>();
        labels.add("ID");
        labels.add("time");

        System.out.println(savePath);
        CSVthing.appendCSV(savePath, labels);

    }

    public void log(String studentID){
        Date date = new Date();

        System.out.println(studentID+" :: "+timeFormat.format(date));

        List<String> individual_Log = new ArrayList<String>();

        individual_Log.add(studentID);
        individual_Log.add(timeFormat.format(date));

        CSVthing.appendCSV(savePath,individual_Log);

        CSVthing.backupCSV(savePath,backupPath);

        logs.add(individual_Log);

        /**data format
         * ID time
         * **/
    }

    public void printlog(){
        for (List<String> individualLog : logs) {
            System.out.println(individualLog.get(0)+" :: "+individualLog.get(1));
        }
    }

}