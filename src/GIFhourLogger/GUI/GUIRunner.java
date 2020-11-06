/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package GIFhourLogger.GUI;

import GIFhourLogger.Constants.GUI;
import GIFhourLogger.dataprocessing.logging;
import GIFhourLogger.vision.Camera;
import GIFhourLogger.vision.Decoder;

import java.awt.*;
import java.awt.image.BufferedImage;

import javax.swing.*;


/**
 * <p>Simple GIFhourLogger.GUI frontend to the library. Right now, only decodes a local file.
 * This definitely needs some improvement. Just throwing something down to start.</p>
 *
 * @author Sean Owen
 */
public final class GUIRunner{

    public static JFrame frame = null;
    private static JPanel image_View = null;
    private static Graphics g = null;

    private static int frameHeight = 700;
    private static int frameWidth = 700;

    public static Camera camera = null;
    public static logging logger = null;
    public static Decoder decoder = null;
    public static BufferedImage img = null;

    public static String errorImagePath= "C:\\Users\\haide\\IdeaProjects\\gearbox_ID_scanner\\Pictures\\cropped error.jpg";
    public static String logoImagePath = "C:\\Users\\haide\\IdeaProjects\\gearbox_ID_scanner\\Pictures\\logo blue.png";

    public GUIRunner() {
        camera = new Camera();
        logger = new logging();
        frame = new JFrame();
        decoder = new Decoder();

        frame.setTitle("barcode scanner");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(frameWidth, frameHeight);

        ImageIcon icon = new ImageIcon(logoImagePath);
        frame.setIconImage(icon.getImage());
        
        /**  background attempt**
        JComponent background = new JComponent(){
            public void paintComponent(Graphics g) {
                Image img = Toolkit.getDefaultToolkit().getImage(
                        logoImagePath);
                g.drawImage(img, 0, 0, this.getWidth(), this.getHeight(), this);
            }
        };
        background.setBorder(new EmptyBorder(5, 5, 5, 5));
        //background.setLayout(new BorderLayout(0, 0));
        frame.add(background);
        */

        image_View = new JPanel();
        frame.add(image_View);

        frame.setVisible(true);
        g = image_View.getGraphics();
        try{
            img = camera.getPicture();
            int centerY = (img.getHeight()- GUI.IMAGE_HEIGHT)/2;
            int centerX = (img.getWidth()- GUI.IMAGE_WIDTH)/2;
            //System.out.println("h: "+centerY);
            //System.out.println("w: "+centerX);
            img = img.getSubimage(centerX,centerY, GUI.IMAGE_WIDTH,GUI.IMAGE_HEIGHT);
            g.drawImage(img, GUI.IMAGE_X,GUI.IMAGE_Y, img.getWidth(), img.getHeight(),image_View);
        }catch (Exception e){
            e.printStackTrace();
            img = decoder.imageFromPath(errorImagePath);
            g.drawImage(img, GUI.IMAGE_X,GUI.IMAGE_Y, img.getWidth(), img.getHeight(),image_View);
        }



    }

    public static void run(){
        while (true) {

            try {
                img = camera.getPicture();
                int centerY = (img.getHeight()- GUI.IMAGE_HEIGHT)/2;
                int centerX = (img.getWidth()- GUI.IMAGE_WIDTH)/2;
                //System.out.println("h: "+centerY);
                //System.out.println("w: "+centerX);
                img = img.getSubimage(centerX,centerY, GUI.IMAGE_WIDTH,GUI.IMAGE_HEIGHT);
                String s = decoder.decodeBufferedImage(img);
                //System.out.println(s);
                g.drawImage(img, GUI.IMAGE_X,GUI.IMAGE_Y, img.getWidth(), img.getHeight(),image_View);
                if (s!=null) {
                    System.out.println(s);
                    logger.log(s);
                    Thread.sleep(3000);
                }
            }catch (Exception e){
                img = decoder.imageFromPath(errorImagePath);
                g.drawImage(img, GUI.IMAGE_X,GUI.IMAGE_Y, img.getWidth(), img.getHeight(),image_View);

            }
        }
    }

    /*
    private void chooseImage() throws MalformedURLException {
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.showOpenDialog(this);
        Path file = fileChooser.getSelectedFile().toPath();
        Icon imageIcon = new ImageIcon(file.toUri().toURL());
        setSize(imageIcon.getIconWidth(), imageIcon.getIconHeight() + 100);
        imageLabel.setIcon(imageIcon);
        String decodeText = getDecodeText(file);
        System.out.println(decodeText);
        textArea.setText(decodeText);
    }
    */

    /*
    private static String getDecodeText(Path file) {
    // initial proof of concept
        BufferedImage image;
        try {
            image = ImageReader.readImage(file.toUri());
        } catch (IOException ioe) {
            return ioe.toString();
        }
        LuminanceSource source = new BufferedImageLuminanceSource(image);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
        Result result;
        try {
            result = new MultiFormatReader().decode(bitmap);
        } catch (ReaderException re) {
            return re.toString();
        }
        return String.valueOf(result.getText());
    }
    */


}
