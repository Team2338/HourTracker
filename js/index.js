  import { BrowserQRCodeReader } from '@zxing/library';

  const codeReader = new BrowserQRCodeReader();
  const img = document.getElementById('img');

  try {
      const result = await codeReader.decodeFromImage(img);
  } catch (err) {
      console.error(err);
  }

  console.log(result);