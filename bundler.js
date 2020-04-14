/*
Generates a single .less file from multiple files

Requirements:
npm (https://nodejs.org/en/download/)
npm install less-bundle

Usage via terminal:
node bundler.js

*/
// bundler.js
const bundle = require('less-bundle');

bundle({
    src: './external/style/less/finna-variables.less',
    dest: './external/style/less/custom.less'
}, function (err) {
    console.log(err)
});