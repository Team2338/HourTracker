//js for scan in
let deviceId;
const codeReader = new ZXing.BrowserBarcodeReader();

window.addEventListener('load', function(){
    codeReader
        .listVideoInputDevices()
        .then((videoInputDevices) => {
            deviceId = videoInputDevices[0].deviceId;
            if (videoInputDevices.length > 1) {
                videoInputDevices.forEach((element) => {
                    deviceId = [1].deviceId;
                    console.log(element.label);
                    console.log(element.deviceId);
                })
            }
        })
        .catch(err => {
            console.log("err");
            console.error(err);

        });
    decodeContinuously();
});

function decodeContinuously() {
    codeReader.decodeFromInputVideoDeviceContinuously(deviceId, 'videoStream', (result, err) => {
    if (result) {
      onFoundBarcode(result.text);
    }

    if (err) {
        // other errors break loop
      if (err instanceof ZXing.NotFoundException) {
        //console.log('No QR code found.')
      }

      if (err instanceof ZXing.ChecksumException) {
        //console.log('A code was found, but it\'s read value was not valid.')
      }

      if (err instanceof ZXing.FormatException) {
        //console.log('A code was found, but it was in a invalid format.')
      }
    }
  })
}

function onFoundBarcode(result){
    var resultAtribute = document.getElementById('result');
    resultAtribute.textContent = result;
    console.log(result);
    
    //sleep(3000);
    //resultAtribute.textContent = 'Searching';
    //console.log('reset');
}

function sleep(ms){
    
    const date = Date.now();
    let currentDate = null;
    
    do {
        currentDate = Date.now();
    }while(currentDate -date<ms);
    
}