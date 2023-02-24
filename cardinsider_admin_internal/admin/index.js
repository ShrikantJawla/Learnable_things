/* Importing the route function from the routes folder. */
const route = require('./routes/');

/* Exporting the function to the main file. */
module.exports = function () {
    route();
}