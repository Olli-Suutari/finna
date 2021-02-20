/*
* This file is used for generating a bundle of less files.
* based on: https://stackoverflow.com/questions/24205110/combining-two-less-files-in-one
*/
//import {mergeFiles} from 'merge-files';

mergeFiles = require('merge-files');

const fs = require( 'fs' );

const path = '../external/style/'
const outputPath = '../external/style/bundle.less';
 
const inputPathList = [
  path + './newCustom.less',
  path + './newNavigation.less',
  path + './newsAndEvents.less',
  path + './newSearch.less'
];
 
// status: true or false
//const status = await mergeFiles(inputPathList, outputPath);
// or
mergeFiles(inputPathList, outputPath).then((status) => {
    // next
    console.log("next")
});