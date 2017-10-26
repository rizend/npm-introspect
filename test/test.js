const requestData = require('../server/requestData');
const schema =  require('./schema.js')
const assert = require('assert');
const chai = require('chai');
chai.use(require('chai-json-schema'));

/*
describe('requestData', function(){
  it('returns valid JSON', function(){
    requestData.parse().then(function(results){
      assert.jsonSchema(results, schema.schema)
    })
  })
})



const badPkgNames = ['react', 'redux', 'reduz'];
describe('requestData', function(){
  it('fails because of misspelled package name', function(){
    requestData.parse(badPkgNames).then(function(results){
      assert.jsonSchema(results, schema.schema)
    })
  })
})
*/
// const goodPkgNames = ['react', 'redux', 'kefir'];
// describe('requestData', function(){
//   it('returns valid JSON', function(){
//     requestData.parse(goodPkgNames).then(function(results){
//       assert.jsonSchema(results, schema.schema)
//     })
//   })
// })
