import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
await mkdir('dist/src',{recursive:true});
for(const file of ['index.html','style.css','app.js']) await copyFile(file,`dist/${file}`);
for(const file of ['elements.json','rules.js','geometry.js','starter-cards.js','material-cards.js','placement.js']) await copyFile(`src/${file}`,`dist/src/${file}`);
let revision=process.env.GITHUB_SHA;
if(!revision) {try {revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{revision='local'}}
await writeFile('dist/version.json',JSON.stringify({revision,version:'0.1.0',rules:'v37',builtAt:new Date().toISOString()})+'\n');
