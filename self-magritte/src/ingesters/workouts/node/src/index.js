const jefit = require('./jefit_api');

const args = process.argv.slice(2);

const username = args[0];
const date = args[1];

jefit.fetchSingleDate(username, date, x => {
    console.log(JSON.stringify(x));
});