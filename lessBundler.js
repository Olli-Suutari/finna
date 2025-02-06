/*
 * This file is used for generating a bundle of less files.
 * Bundle is placed on external/js/dist since it's easy to ignore and other dist files are there.
 */
mergeFiles = require('merge-files');

const path = './external/style/';
const outputPath = './external/js/dist/bundle.less';
const inputPathList = [
	path + './newCustom.less',
	path + './newNavigation.less',
	path + './news.less',
	path + './newSearch.less',
	path + './record.less',
	path + './profile.less'
];

mergeFiles(inputPathList, outputPath).then((status) => {
	console.log('Bundle complete!');
});
