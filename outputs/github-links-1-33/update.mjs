import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const source='/Users/sayyid/Documents/github/the100hackathoner/data/Hackathon CV.xlsx';
const out=new URL('.',import.meta.url).pathname;
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
console.log((await wb.inspect({kind:'sheet',include:'id,name',maxChars:1800})).ndjson);
const sheet=wb.worksheets.getItem('Hackathons');
const values=sheet.getRange('A1:O35').values;
console.log(JSON.stringify(values.map((r,i)=>({row:i+1,n:r[0],title:r[10],link:r[14]}))));
await fs.writeFile(out+'before.png',new Uint8Array(await (await wb.render({sheetName:'Hackathons',range:'K14:P20',scale:1.3})).arrayBuffer()));
if(process.argv.includes('--edit')){
 const matches=JSON.parse(await fs.readFile(out+'matches.json','utf8'));
 for(const {number,repo} of matches){const idx=values.findIndex(r=>Number(r[0])===number);if(idx<1||![null,'','-'].includes(values[idx][14]))throw Error('Unexpected row/value '+number);sheet.getRange(`O${idx+1}`).values=[[`https://github.com/sayyidkhan/${repo}`]];}
 wb.recalculate();
 await fs.writeFile(out+'after.png',new Uint8Array(await (await wb.render({sheetName:'Hackathons',range:'K14:P20',scale:1.3})).arrayBuffer()));
 const file=await SpreadsheetFile.exportXlsx(wb);await file.save(out+'artifact-edited.xlsx');
 console.log('Updated '+matches.length+' links');
}
