'use strict'
window.onload = function() {
  
  // EVENT HANDLERS BEGIN

  $( "#searchBar" ).select2( { 
    placeholder: 'Please search for an NPM package or upload a package.json to visualize',   

    tags: true,
  }).on("select2:select", function(e) {
    if( $(this).val().indexOf( e.params.data.text ) === -1 ){
      $(this).find('[value="'+e.params.data.id+'"]').replaceWith(new Option( e.params.data.text, e.params.data.text, true, true ) );
    }
  });
  var input = ""; // why not
  $( ".select2-container" ).keyup(function( e ){
    if(e.which == 13 ) { //Enter keycode
      let currentSearch = $( "#searchBar").val();;
      let startsWith = false;
      currentSearch.forEach(function(search) {
        console.log( search );
        console.log( input );
        console.log( search.toLowerCase().startsWith( input.toLowerCase() ) );
          if( search.toLowerCase().startsWith( input.toLowerCase() ) ) {
            startsWith = true;
          }
      });
      if( currentSearch.indexOf( input ) !== -1 ) {
        document.getElementById("searchBar").querySelector("option[value='"+ input +"']").remove();
        console.log( "this is it" )
        search.updateSearch( input );
      } else if( startsWith ) {
        search.updateSearch( input );
      }
    } else {
      input = document.getElementById("select2-searchBar-results").querySelector( "li" ).innerText;
    }
  });
  document.getElementById( "upload" ).addEventListener( "change", function() {
    if( document.getElementById( "upload" ).value !== "" ) {
        let input = this.files[0];
        let reader = new FileReader();
        reader.onload = function(){
          document.getElementById( "searchBar" ).options.length = 0;
          let dependencies = Object.keys( JSON.parse( reader.result ).dependencies );
          for( var i = 0; i < dependencies.length; i++ ) {
            search.updateSearch( dependencies[ i ], false );
          }
          if( JSON.parse( reader.result ).devDependencies ) {

            let devDependencies = Object.keys( JSON.parse( reader.result ).devDependencies );
            if( devDependencies ) {
              for( var i = 0; i < devDependencies.length; i++ ) {
                search.updateSearch( devDependencies[ i ], false );
              } 
            }
           

          }
          
          search.triggerBuild()
        };
        reader.readAsText( input );
    }
     document.getElementById( "upload" ).value = "";
  })

  document.getElementById( "searchButton" ).addEventListener( "click", function() {
    search.triggerBuild()
  });

  // /EVENT HANDLERS

  chartHide.visibility='hidden';
  request.get('/data.json', [], request.build)
}

var init = false;

var winHeight = window.innerHeight,
    winWidth = window.innerWidth,
    depWidth = winWidth * .6,
    depHeight = winHeight * .45,
    line = d3.line(),
    axis = d3.axisLeft(),
    fontScale = d3.scaleLinear()
      .domain([0,50])
      .range([15,4]),
    color = d3.scaleOrdinal().range(["#82A07D","#5D796A", "#425351","#2C2F32"]);

    const mount = document.getElementById('placeholder')
    const chartHide = document.getElementsByClassName('scoreChart')[0].style;
    const outdated = d3.select('.outdatedDependencies').append('ul');

    const chartBorderHeight = winHeight*0.2,
    chartBorderWidth = (winWidth * 0.9)*0.10,
    marginWidth = chartBorderWidth / 6,
    marginBottom = 20,
    chartHeight= chartBorderHeight - marginBottom,
    chartWidth = chartBorderWidth - (marginWidth*2)

    const margin = {top: 50, right: 500, bottom: 50, left: 100},
    subScoreHeading = ['quality', 'popularity', 'maintenance'],
    scoreHeading = ['Quality', 'Popularity', 'Maintenance', 'Final'],
    dependencies = d3.select('.dependencies')
    .attr('width', depWidth + margin.right + margin.left)
    .attr('height', depHeight + margin.top + margin.bottom)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const spinOptions = {
        lines: 17,
        length: 8,
        width: 3,
        radius: 20,
        color: "#5D796A",
        scale: 1.75,
        speed: 1.9,
        trail: 45,
        corners: 1.0,
        opacity: 0,
        className: 'spinner',
      };

   const spinner = new Spinner(spinOptions)

 const handleClick = function(empty, pkg){
   visualization.buildDependencies(pkg.dependencies)
   visualization.buildOutdated(pkg.outdatedDependencies)
   visualization.buildSubScores(pkg.scores, pkg.subScores)
   visualization.buildTitle(pkg.title) //will not work until I decouple d3
   visualization.buildForks(pkg.forks[1])
   visualization.buildStars(pkg.stars[1])
   visualization.buildDescription(pkg.description)
 }


const request = {
  get: function(url, payload, cb){
    let terms = ""
    if( payload.search ) {
      console.log( "payload" )
      console.log( payload.search )
      terms = payload.search.join( "," )
    }
    url = url + "?search=" + encodeURI( terms )
    return d3.request(url)
      .mimeType('application/json')
      .response(function(xhr) {
        //console.log(xhr)
        return JSON.parse(xhr.responseText);
      })
      .get(function(error, d){
        if(error) request.error(error)
        cb(JSON.parse(d)) 
    })
  },
  error: function(err){
    const mount = document.getElementById('placeholder')
    spinner.stop();
    console.log(err)
    mount.innerText = 'response error :' + '\n error code in console';
  },

  build: function(data){
    chartHide.visibility='visible'
    mount.style.visibility = 'hidden'

    handleClick(0, data[ data.length - 1]);
    pkgBarCharts.barChartContainer(data);
    pkgBarCharts.buildLegend();
    if( !init ) {
      // necessary for initial initial tag population in search bar.
      // can be removed if to keep placeholder
      for( var i = 0; i < data.length; i++ ) {
        search.updateSearch( data[i].title[0][1] )
      } 
      init = true
    }
  }
}


const bChart = {

 labelScale: function(text){
   const labelFontSize = 14
   const textLimit = Math.floor((chartBorderWidth/labelFontSize)*1.5)
   if(text.length > textLimit){
     text = text.substring(0,textLimit)+'..';
   }
   return text
  },

  barHeight: function(){
    return d3.scaleLinear()
     .domain([1, 0])
     .range([0, chartHeight]);
  },

  barWidth: function(){
    return d3.scaleBand()
     .padding(0.05)
     .domain(scoreHeading)
     .rangeRound([0, chartWidth]);
  }
}

const pkgBarCharts = {

  buildLegend: function(){
     const legend = d3.select('.legend').append('g')
    .attr("transform", () => { return "translate(" + [0,0] + ")"; })
    .attr('text-anchor', 'start')
    .selectAll('g')
    .data(scoreHeading)
    .enter().append('g')
    .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });

    legend.append('rect')
    .attr("x",  20)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", color);

    legend.append('text')
    .attr("x", 45)
    .attr("y", 12)
    .text(function(d) {
      return d; });
    },

 barChartContainer : function(data){

   const barGraphs = document.getElementsByClassName('scoreChart')[0];
   while (barGraphs.hasChildNodes()) {
     barGraphs.removeChild(barGraphs.lastChild);
   }

   for(let i = 0; i < data.length; i++){
     const graph = d3.select('.scoreChart').append('svg')
     pkgBarCharts.buildBarChart(data[i], graph)
   }
},

buildBarChart: function(pkg, mount){

  const bWidth = bChart.barWidth(),
        bHeight = bChart.barHeight()

  mount.attr('class', 'package')
       .attr('width', chartBorderWidth)
       .attr('height', chartBorderHeight)
       .on('click', function(e){
         handleClick(0, pkg)
        })


  const chart = mount.append('g')
   .on('mouseover', function() {
     d3.selectAll(this.childNodes).style('fill', function(d){
       let bar = d3.select(this).style('fill')
       return d3.rgb(bar).darker(2)
     })
    })
   .on('mouseout', function() {
     d3.selectAll(this.childNodes).style('fill', function(d){
       let bar = d3.select(this).style('fill')
       return d3.rgb(bar).brighter(2)
     })
    })
   .selectAll('g')
   .data(pkg.scores)

   chart
   .enter()
   .append('rect')
   .merge(chart)
   .attr('x', (d, i) => { return bWidth(d[0]) + marginWidth })
   .attr('width', (d) => { return bWidth.bandwidth() })
   .attr('fill', (d) => { return color(d[0]) })
   .attr('height', (d, i) => { return chartHeight - bHeight(d[1]) })
   .attr('y', (d, i) => { return bHeight(d[1]) })
   .attr('height', 0)
   .attr('y', chartHeight)
   .transition()
   .duration(1000)
   .ease(d3.easeLinear)
   .delay((d, i) => {return i * 400})
   .attr('height', (d, i) => {
       return chartHeight - bHeight(d[1])
     })
   .attr('y', (d, i) => {
       return bHeight(d[1])
     });

   chart.exit().remove();

   mount.append('g')
   .attr('class', 'label')
   .attr("transform", "translate(" + [(chartBorderWidth/2), (chartBorderHeight - (marginBottom/3))]  + ")")
   .append('text')
   .attr('text-anchor', 'middle')
   .attr('transform', 'rotate(0)')
   .text(bChart.labelScale(pkg.title[0][1]))
 }
}

const visualization = {
  buildStars: function(starAmount){
      const star = '\u2605'; //U+2606 for other unicode star
      document.getElementById('stars').innerText = star + ' ' + starAmount
  },

 buildForks: function(forkAmount){
     const forkMount = document.getElementsByClassName('forks')[0];
     while (forkMount.hasChildNodes()){
       forkMount.removeChild(forkMount.lastChild);
     }
     const fork = document.createElement('img');
     fork.src = 'fork.png';
     fork.alt = 'Fork Count';
     const forkCount = document.createElement('span');
     forkCount.id = 'forks';
     forkCount.innerText = forkAmount;
     forkMount.appendChild(fork);
     forkMount.appendChild(forkCount);
   },

 buildOutdated: function(outdatedDeps){
             let outdatedDependencies = outdated.selectAll('li')
             .data(outdatedDeps[0] || [])

             outdatedDependencies
             .enter()
             .append('li')
             .merge(outdatedDependencies)
             .text(
               function(d){
                 return 'Outdated Dependency: ' + d;
               }).on( 'click', function( e ) {
               search.updateSearch( e, true );
             } )
             outdatedDependencies.exit().remove()
           },

 buildSubScores: function(scores, subScores){
     document.getElementById('finalScore').innerText = scores[3][0] + ': ' + scores[3][1].toFixed(2);
     for (let i = 0; i < subScoreHeading.length; i++){
       document.getElementById(subScoreHeading[i] + 'H').innerText = scores[i][0] + ': ' + scores[i][1].toFixed(2)
       for(let j = 0; j < 4; j++){
         document.getElementById(subScoreHeading[i] + j).innerText = subScores[i][j][0] + ': ' + subScores[i][j][1].toFixed(2)
       }
     }
   },

buildDescription: function(description){
     document.getElementById('description').innerText = description;
   },

buildTitle: function(title){
    document.getElementById('name').innerText = title[0][1];
    document.getElementById('version').innerText = title[1][1];
    $( "div.title" ).html( "<a target='_new' href='https://www.npmjs.com/package/"+$( "span.name" ).text()+"'>"+$( "div.title" ).html()+"</a>" );
   },

computeNodeCount: function(node){
  let nodeCount = 0;
  for(let i = 0; i < node.parent.parent.children.length; i++){
    nodeCount += node.parent.parent.children[i].children.length
  }
  return nodeCount
 },

buildDependencies: function(pkgDependencies){

  const treemap = d3.tree()
  .size([depHeight, depWidth]);

  d3.selectAll('g.node').remove()

  const stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

  let nodes = d3.hierarchy(pkgDependencies, function(d) {    //pkg dependencies
  return d.children;
  });

  nodes = treemap(nodes);

  const updateLinks = dependencies.selectAll(".link")
  .data(nodes.descendants().slice(1))

  const enterLinks = updateLinks.enter().append("path")
    .attr("class", "link")

  const exitLink = updateLinks.exit().remove();

  updateLinks.merge(enterLinks)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("d", function(d) {
              return "M" + d.y + "," + d.x
                + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
              });

  const updateNodes = dependencies.selectAll("g.node")
  .data(nodes.descendants(), d => d);

  const enterNodes = updateNodes.enter().append("g")
  .attr("class", function(d) {
        return "node" +
  (d.children ? " node--internal" : d.data.outdated ? " node--outdated" : " node--leaf" ); }) //ternary chains
  .attr("transform", function(d) {
  return "translate(" + d.y + "," + d.x + ")"; });

  enterNodes.append("circle")
  .attr("r", function(d) { return 15; });

  enterNodes.append("text")
  .attr("dy", ".25em")
  .attr("x", 25)
  .style("text-anchor", "start")
  .style("font-size", function(d){
    let fontSize
    if (d.depth == 0) {
      fontSize = 23;
    }
    else if (d.depth == 1){
      fontSize = 17
    }
    else{
      const nc = visualization.computeNodeCount(d)
      if (nc >= 50){fontSize = 3}
      else{fontSize = fontScale(visualization.computeNodeCount(d))}
    }
    return fontSize;
  })
  .text(function(d) {
    return d.data.name;
  }).on("click", function( d,i ) {
      console.log( "clicked!" )
      console.log( d );
      search.updateSearch( d.data.name, true )
  });

  updateNodes.merge(enterNodes);

  const exitNode = updateNodes.exit().remove();
}
}

const search = {
  updateSearch: function( name, triggerUpdate ) {
    console.log( "add " + name + " to search" )
    
    if( typeof name === "undefined" || !name || name === "" || name === "dependency" || name === "devDependency" ) {
      return false;
    }
    let curSearch = document.getElementById( "searchBar" ).value;
    if( curSearch.indexOf( name ) === -1 ) {
      document.getElementById( "searchBar" ).appendChild( new Option( name, name, true, true ) )
    } else {
      document.getElementById( "searchBar" ).querySelector( "option[value='"+ name +"']" ).remove();
    }
    
    if( triggerUpdate ) {
      search.triggerBuild()
    }
    
  }, 
  triggerBuild: function() {
    // should build based on searchbar inputs:
    console.log( "Build based on this!" )
    console.log( $( "#searchBar" ).val() )
    let searchTerms = $( "#searchBar" ).val();
    request.get('/data.json', { search: searchTerms }, request.build)

  }

}
