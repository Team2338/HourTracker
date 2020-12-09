package GIFhourLogger;

import com.google.zxing.BarcodeFormat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Constants {

    public static class VISION{

        public static class CAMERA{

            /** camera Ids**
            0 is computer default
            1 is the first other thing
            */
            public static int CAMERA_ID = 1;

        }

        public static class DECODER{

            /** Formats
             * possible formats to check for
             * we use CODE39
             * **/
            public static List<BarcodeFormat> FORMATS =
                    new ArrayList<>(Arrays.asList(
                            BarcodeFormat.CODE_39
                    ));

            //looks extra hard for a barcode used for pictures instead of computer generated
            public static boolean TRY_HARDER = true;

            /**luminance
             * we need to add a variable for luminance sources here to eventually
             * **/
        }

    }

    public static class GUI{
        public static int IMAGE_HEIGHT= 80;      //40;  //max 640
        public static int IMAGE_WIDTH = 440;     //220; //max 480

        public static int IMAGE_X = 15;
        public static int IMAGE_Y = 15;
    }

    public static class dataProcessing{
        public static String Save = "C:\\Users\\haide\\IdeaProjects\\gearbox_ID_scanner\\save\\";

    }
}
