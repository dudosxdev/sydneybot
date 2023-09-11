import axios from'axios';
import base64 from'base64-js';
import fs from'fs';
import { createCanvas, loadImage } from 'canvas';

class rudalleClient {
  constructor() {
    this.headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Connection': 'keep-alive',
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundarytXy6y3KLVNWmrqUb',
      'Origin': 'https://editor.fusionbrain.ai',
      'Referer': 'https://editor.fusionbrain.ai/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
  };

  }

  async ask(prompt = 'cat', style = '', width = 1024, height = 1024) {
    const jsondata = JSON.stringify({
      "type": "GENERATE",
      "style": style,
      "width": width,
      "height": height,
      "generateParams": {
        "query": prompt
      }
    });
    const data =`------WebKitFormBoundarytXy6y3KLVNWmrqUb\r\nContent-Disposition: form-data; name="params"; filename="blob"\r\nContent-Type: application/json\r\n\r\n${jsondata}\r\n------WebKitFormBoundarytXy6y3KLVNWmrqUb--\r\n`

    const resp = await axios.post('https://api.fusionbrain.ai/web/api/v1/text2image/run?model_id=1', data, { headers: this.headers });
    const json = resp.data;


    if (json['status'] == 'INITIAL') {

      return {
        status: true, id:json.uuid
      };
    }
    return {status:false, id:''};
  }

  async check(id, path, saveId) {
    const response = await axios.get(
      `https://api.fusionbrain.ai/web/api/v1/text2image/status/${id}`,
      { headers: this.headers }
    );

    if (response.data['status'] in ['INITIAL', 'PROCESSING']) return false;
    if (response.data['status'] == 'DONE') {

      const newjpgtxt = response.data.images[0];

      if (newjpgtxt) {
        const img_bytes = base64.toByteArray(newjpgtxt);
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');
        console.log(canvas) 
        const buffer = new Buffer.from(img_bytes);
        const img = await loadImage(buffer);
        // await img.save(`${path}/1.png`).catch(console.error)
        ctx.drawImage(img, 0, 0);
        fs.writeFileSync(`${path}/${saveId || '0'}.png`, canvas.toBuffer());

        return true
      }

      return true;
    }

    return false
  }
};

export async function generate(prompt, path, style, width, height, saveId) {
  const client = new rudalleClient();
  const {status, id} = await client.ask(prompt || 'a cat at night', style || '', width , height);

  if (status == false) return false;

  let x;

  while (x != true) {
    x = await client.check(id, path||'./',saveId)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return;
}
