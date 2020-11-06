package GIFhourLogger.vision;

import GIFhourLogger.Constants;
import com.beust.jcommander.internal.Nullable;
import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.*;

public class Decoder {

    private Map<DecodeHintType, Object> hints = null;
    MultiFormatReader multiFormatReader = null;

    public Decoder(){
        hints = new EnumMap<>(DecodeHintType.class);
        hints.put(DecodeHintType.POSSIBLE_FORMATS, Constants.VISION.DECODER.FORMATS);
        hints.put(DecodeHintType.TRY_HARDER, Constants.VISION.DECODER.TRY_HARDER);
        multiFormatReader = new MultiFormatReader();
    }

    public String decodeBufferedImage(@Nullable BufferedImage image) {

        if(image != null){
            BinaryBitmap bitmap = null;

            try {
                BufferedImageLuminanceSource source = new BufferedImageLuminanceSource(image);
                bitmap = new BinaryBitmap(new HybridBinarizer(source));

                if (bitmap == null) {
                    return null;
                }else{
                    Result result = multiFormatReader.decode(bitmap, Collections.unmodifiableMap(hints));
                    String answer = result.getText();
                    return answer;
                }

            }catch (NotFoundException e) {
                //e.printStackTrace();
                //System.out.println("barcode not found in image");
                return null;
            }catch (Exception e){
                e.printStackTrace();
                return null;
            }

        }else{
            return null;
        }

    }

    public String decodeFilepath(String path){
        BufferedImage img = null;
        try {
            img = ImageIO.read(new File(path));
            return this.decodeBufferedImage(img);
        } catch (IOException e) {
            return null;
        }

    }

    public BufferedImage imageFromPath(String path){
        BufferedImage img = null;
        try {
            img = ImageIO.read(new File(path));
            return img;
        } catch (IOException e) {
            return null;
        }
    }
}