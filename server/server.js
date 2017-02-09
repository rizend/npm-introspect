#!/usr/bin/env node

'use strict';

const requestData = require('../server/requestData')
const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')

module.exports.go = () => {

  //app.set('views', path.join(__dirname, 'v'));

  app.use(morgan('combined'))


  //app.use(express.static('../client/index.html'))
  app.get('/index.js', function(req, res){
    res.sendFile('/home/nicholas/code/javascipt/npm-landscape/client/index.js')
  })
  app.get('/data.json', function(req, res){
    res.sendFile('/home/nicholas/code/javascipt/npm-landscape/client/data.json')
  })
  app.get('/', function (req, res) {
      const indexPath = '/home/nicholas/code/javascipt/npm-landscape/client/index.html'
      console.log(indexPath)
      res.sendFile(indexPath)

      //app.use('/js', express.static(path.join(__dirname + '/client/index.js')))
      // requestData.parse()
      // .then(function (data) {
      //     res.json(data)
      //     res.setHeader('Content-Type', 'text/plain');
      //
      //     //res.render(path.join(__dirname + '/../client/index.html'))
      //
      //     res.end(data);
      // })
      // .catch(function (e) {
      //     res.status(500, {
      //         error: e
          //});
      //});
  })  //);

app.get('*', function(req, res){
  res.send('hello ass')
})




  app.listen(8080, function () {
    console.log('Example app listening on port 8080!')

  })




}
