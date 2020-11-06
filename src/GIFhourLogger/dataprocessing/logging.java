package GIFhourLogger.dataprocessing;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
//import com.google.gson.Gson;
//import com.google.gson.GsonBuilder;

/**  this class is for the processing of data**/

public class logging {

    ArrayList<String[]> logs = null;
    //Gson gson = null;

    public logging(){
        //GsonBuilder gsonbuilder = new GsonBuilder();
        //gsonbuilder.setPrettyPrinting();
        //gsonbuilder.serializeNulls();
        //gson = gsonbuilder.create();
        logs = new ArrayList<String[]>();
    }

    public void log(String studentID){
        Date date = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        System.out.println(studentID+" :: "+formatter.format(date));
        //["ID","time"]
        String thing[] = new String[2];
        thing[0] = studentID;
        thing[1] = formatter.format(date);
        logs.add(thing);
        System.out.println("logs \n\n");
        this.printlog();
    }

    public void printlog(){
        for (String[] i : logs) {
            System.out.println(i[0]+" :: "+i[1]);
        }
    }

}