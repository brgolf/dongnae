import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
await fs.mkdir('_site',{recursive:true});
for(const file of files){
 if(!(file.startsWith('assets/')||(/^[^/]+\.(html|css|js|json)$/.test(file)&&!file.startsWith('blog-thumbnail-'))))continue;
 if((await fs.lstat(file)).isSymbolicLink())throw new Error('Refusing symlink in public site');
 const target=path.join('_site',file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(file,target);
}
await fs.writeFile('_site/.nojekyll','');
console.log('Static site prepared without Git metadata or workflow scripts');
