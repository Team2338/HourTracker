package GIFhourLogger.dataprocessing;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

public class CSVthing {

    public static ArrayList<List<String>> readCSV(String filePath){
        ArrayList<List<String>> fileData = new ArrayList<List<String>>();
        try{
            File f1 = new File(filePath);
            if(!f1.exists()) {
                return fileData;
            }
            BufferedReader csvReader = new BufferedReader(new FileReader(filePath));
            String row = csvReader.readLine();
            while (row != null) {
                ArrayList<String> data = new ArrayList<String>();
                String[] temp_Data = row.split(",");
                for(String thing : temp_Data){
                    data.add(thing);
                }
                fileData.add(data);
                row = csvReader.readLine();
            }
            csvReader.close();
            return fileData;

        } catch (IOException e){
            e.printStackTrace();
            return fileData;
        }

    }

    public static boolean exists(String filePath){
        try {
            File f1 = new File(filePath);
            if(!f1.exists()) {
                return false;
            }else{
                return true;
            }
        } catch (Exception e){
            e.printStackTrace();
            return false;
        }

    }

    public static void writeCSV(String filePath, ArrayList<List<String>> data){
        try {

            File f1 = new File(filePath);
            if(!f1.exists()) {
                f1.createNewFile();
            }

            FileWriter csvWriter = new FileWriter(filePath);

            for (List<String> rowData : data) {
                csvWriter.append(String.join(",", rowData));
                csvWriter.append("\n");
            }
            csvWriter.flush();
            csvWriter.close();
        }catch (Exception e ){
            e.printStackTrace();
        }
    }

    public static void backupCSV(String filePath, String backupPath){
        writeCSV(backupPath, readCSV(filePath));
    }

    public static void appendCSV(String filePath, List<String> data){
        try {

            File f1 = new File(filePath);
            if(!f1.exists()) {
                f1.createNewFile();
            }

            FileWriter csvWriter = new FileWriter(f1.getName(),true);
            csvWriter.append(String.join(",", data));
            csvWriter.append("\n");
            csvWriter.flush();
            csvWriter.close();

        } catch(IOException e){
            e.printStackTrace();
        }
    }

}