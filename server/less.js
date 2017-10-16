const Table = require('cli-table');
const chalk = require('chalk');


exports.buildTable = function(rawData){

  let data;
  try{
    data = JSON.parse(rawData)
  }catch(error){
    throw 'Response Error, a package name may be misspelled, or the api is down'
  }

  const table = new Table({
    head: [chalk.underline.white("Name"), chalk.underline.green("Quality"), chalk.underline.white("Popularity"), chalk.underline.green("Maintenance"), chalk.underline.white("Final")],
    colwidths: [100, 50, 50, 50, 50]
  });

for (pkg of data){
    table.push(

      [chalk.white(pkg.title[0][1]), chalk.green(pkg.scores[0][1].toFixed(2)), chalk.white(pkg.scores[1][1].toFixed(2)), chalk.green(pkg.scores[2][1].toFixed(2)), pkg.scores[3][1].toFixed(2)]
    )
  }

console.log(table.toString());
}
