/*
const { spawnSync } = require('child_process');

////spawnSync(process.execPath, process.argv.slice(2), { stdio: 'inherit' })


//process.chdir(__dirname);
//require( "./server");

spawnSync(process.execPath,  ['frdl', 'autoload', './server.js'], { stdio: 'inherit' });
*/

require( "./server");
