package GIFhourLogger.vision;

import GIFhourLogger.Constants;
import GIFhourLogger.Constants.VISION.CAMERA;

//import com.beust.jcommander.internal.Nullable;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.videoio.VideoCapture;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

public class Camera {

    public static VideoCapture capture;

    public Camera(){
        System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
        capture = new VideoCapture(CAMERA.CAMERA_ID);
    }
    public static BufferedImage Mat2BufferedImage(/*@Nullable */Mat mat) throws IOException{

        if (mat == null) {
            return null;
        }else{
            //Encoding the image
            MatOfByte matOfByte = new MatOfByte();
            Imgcodecs.imencode(".jpg", mat, matOfByte);
            //Storing the encoded Mat in a byte array
            byte[] byteArray = matOfByte.toArray();
            //Preparing the Buffered Image
            InputStream in = new ByteArrayInputStream(byteArray);
            BufferedImage bufImage = ImageIO.read(in);
            return bufImage;
        }
    }

    public BufferedImage getPicture(){
        Mat matrix = new Mat();

        boolean read = capture.read(matrix);
        boolean opened = capture.isOpened();
        if(opened && read) {
            try {
                BufferedImage image = Mat2BufferedImage(matrix);
                return image;
            }
            /*
            catch (IOException e){
                e.printStackTrace();
                return null;
            }
            */
            catch (Exception e){
                e.printStackTrace();
                return null;
            }
        }else{
            return null;

        }
    }
}
