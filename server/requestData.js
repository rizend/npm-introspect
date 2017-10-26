'use strict'

const fs = require('fs');
const path = require('path')
const Promise = require("bluebird");
const request = require('request-promise');

const formatString = function(string) {
    string = string.replace(/([a-z])([A-Z])/g, '$1 $2')
    return string.charAt(0).toUpperCase() + string.slice(1);
}
const dashToSpace = function(string){
  return string.replace(/-/g,'+')
}
const isOutdated = function(outdatedPkgs){
  return function(pkg){
    if (outdatedPkgs[0]){
      return outdatedPkgs[0].includes(pkg)
    }else{
      return false;
    }
  }
}

const parsePkgJSON = function() {
    return new Promise((resolve, reject) => {

        fs.readFile('package.json', 'utf-8', (error, data) => {
            if (error){
              console.log('Could not find package.json, please run in project root to parse package.json');
              resolve(['d3']);
            //  return
            }
            try {
              let contents = JSON.parse(data);
              const dependencies = contents && contents['dependencies'] ? Object.keys(contents['dependencies']) : []
              const devDependencies = contents['devDependencies'] && contents ? Object.keys(contents['devDependencies']) : []

              let packages = dependencies.concat(devDependencies)
              resolve(packages)
            } catch( err ) {
              console.log( 'Could not read package.json, is it possibly malformed?' )
              resolve(['d3']); // ?? or should we do something else?
            }
            
        });
    });
}

const npmSearch = function(infoRequests, noDevDep) {
     return Promise.map(infoRequests, request.get, {concurrency: 6}).then(function(apiResults) {
            return pkgInfoParse(apiResults, noDevDep)
        }).catch(function(error) {
              return error
        })
}

const pkgInfoParse = function(pkgInfo, noDevDep) {
    let filteredInfo = []
    pkgInfo.forEach((pkg) => {
        let parsedPkg = {}
        let filteredPkg = {}

        try {
            parsedPkg = JSON.parse(pkg)

        } catch (error) {
            console.log( "invalid JSOn" )
            throw 'Error- response not valid JSON'
        }

        filteredPkg.title = [['name', parsedPkg.collected.metadata.name], ['version', 'v' + parsedPkg.collected.metadata.version]]
        filteredPkg.stars = ['stars',  parsedPkg.collected.github && parsedPkg.collected.github.starsCount
            ? parsedPkg.collected.github.starsCount
            : 0]

        filteredPkg.forks = ['forks', parsedPkg.collected.github && parsedPkg.collected.github.forksCount
            ? parsedPkg.collected.github.forksCount
            : 0]

        filteredPkg.outdatedDependencies = [parsedPkg.collected.source && parsedPkg.collected.source.outdatedDependencies ? Object.keys(parsedPkg.collected.source.outdatedDependencies) : null];
        let dependencies = {"name": parsedPkg.collected.metadata.name,
                          "children": []};

        const outdatedPkgs = isOutdated(filteredPkg.outdatedDependencies)

        if (parsedPkg.collected.metadata.dependencies){
            let depChildren = [];
          Object.keys(parsedPkg.collected.metadata.dependencies).forEach((name) => {
            depChildren.push({'name': name, "outdated": outdatedPkgs(name)});
          })
          dependencies.children.push({"name": "dependency", "children": depChildren})
        }

        //user has used no dev dependencies flag
        if(!noDevDep){
          if (parsedPkg.collected.metadata.devDependencies){
            let devDepChildren = [];
          Object.keys(parsedPkg.collected.metadata.devDependencies).forEach((name) => {
              devDepChildren.push({'name': name, "outdated": outdatedPkgs(name)});
            })
            dependencies.children.push({"name": "devDependency", "children": devDepChildren})
          }
          if (parsedPkg.collected.metadata.peerDependencies){
            let peerDepChildren = [];
          Object.keys(parsedPkg.collected.metadata.peerDependencies).forEach((name) => {
              peerDepChildren.push({'name': name, "outdated": outdatedPkgs(name)});
            })
            dependencies.children.push({"name": "peerDependency", "children": peerDepChildren})
          }
        }

        filteredPkg.dependencies = dependencies;
        filteredPkg.description = parsedPkg.collected.metadata.description
        filteredPkg.scores = [['Quality', parsedPkg.score.detail.quality], ['Popularity', parsedPkg.score.detail.popularity], ['Maintenance', parsedPkg.score.detail.maintenance], ['Final', parsedPkg.score.final]];

        let category = ['quality', 'popularity', 'maintenance'];
        let subScores = [];
        for (let s in category){
          let sScores = []
          for (let c in parsedPkg.evaluation[category[s]]){
              sScores.push([formatString(c), parsedPkg.evaluation[category[s]][c]])
          }
          subScores.push(sScores)
        }
        filteredPkg.subScores = subScores;
        filteredInfo.push(filteredPkg)
    })
    return JSON.stringify(filteredInfo)
}

const requestData = function( userPkgs, noDevDep ) {
    return new Promise((resolve, reject) => {
        parsePkgJSON().then((packages) => {
           if( userPkgs && userPkgs.length > 0 ) {
            packages = []
           }
           packages.push(...userPkgs)
            let packageUrls = packages.map((name) => {
                return "https://api.npms.io/v2/package/" + encodeURIComponent(name);
            })
            npmSearch(packageUrls, noDevDep).then(function(result) {
                resolve(result)
            }).catch(function(error) {
                reject('error')
            })
        })
    })
}

exports.request = function(userPkgs, noDevDep) {
  return requestData( userPkgs, noDevDep )
}
