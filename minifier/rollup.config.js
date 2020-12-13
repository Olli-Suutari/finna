/*
* Rollup.js configuration for generating the minified js for deployment.
* Generates minified .js -files to external/dist folder
* Requirements: npm install --global rollup, npm i rollup-plugin-babel-minify --save-dev
* Usage: Run the .ps1 script for generating a bundle and watching the files for changes.
* More information: https://rollupjs.org/guide/en/
*/
// Minify is no longer maintained, but the recommended terser breaks global variables :)
import minify from 'rollup-plugin-babel-minify';

const path = '../external/js/'
export default {
  external: ['jquery'],
  input: [path + './jquery.translate.js', path + './main.js', path + './news.js', path + './events.js'],
  output: [
    {
      dir: path + './dist',
      format: 'es',
      name: 'version',
      globals: {
        jquery: '$'
      },
      plugins: [
        minify( {
            comments: false,
            sourceMap: false,
        } )
      ]
    }
    /* Unminified variants for debugging
    {
      dir: path + './dist/unminified',
      format: 'es',
      globals: {
        jquery: '$'
      },
    } */
  ],
};
