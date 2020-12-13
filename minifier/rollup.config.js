/*
* Rollup.js configuration for generating the minified js for deployment.
* Generates minified .js -files to external/dist folder
* Requirements: npm install --global rollup, npm i rollup-plugin-terser --save-dev
* Usage: Run the .ps1 script for generating a bundle and watching the files for changes.
* More information: https://rollupjs.org/guide/en/
*/
import { terser } from "rollup-plugin-terser";

const path = '../external/js/'
export default {
  input: [path + './jquery.translate.js', path + './main.js', path + './news.js', path + './events.js'],
  output: [
    {
      dir: path + './dist',
      format: 'cjs',
      name: 'version',
      plugins: [terser()]
    }
  ]
};
