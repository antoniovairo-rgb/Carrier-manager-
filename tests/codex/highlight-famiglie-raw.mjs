import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
const plain=new URL('./highlight-famiglie.json',import.meta.url);
const archive=new URL('./highlight-famiglie.json.gz',import.meta.url);
// Restore the local checkpoint from the compressed, tracked raw data.
if(!fs.existsSync(plain)&&fs.existsSync(archive))fs.writeFileSync(plain,gunzipSync(fs.readFileSync(archive)));
