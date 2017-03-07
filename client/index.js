'use strict'

window.onload = function (){

  const margin = {top: 100, right: 10, bottom: 100, left: 10},
        width = window.innerHeight - margin.left - margin.right,
        height = window.innerWidth - margin.top - margin.bottom,
        line = d3.line(),
        axis = d3.axisLeft(),
        y = d3.scaleLinear()
          .domain([1, 0])
          .range([0, height]);

  const url = '/datam.json'
  d3.request(url)
    .mimeType('application/json')
    .response(function(xhr) { return JSON.parse(xhr.responseText); })
    .get(processData);

    function processData(err, rawData){
      if (err) console.log(err);

      const data = JSON.parse(rawData);
      console.log(data)

      const timeDiffernce = function(dateTo, dateFrom){
          let diff = dateTo - dateFrom;

          const days = Math.floor(diff / 1000 / 60 / 60 /24);
          diff -= days * 1000 * 60 * 60 * 24;

          return days
      }

    const scoreData = data.map((d) => {
      let data = {'name': d.name, 'score' : []};
       ['final', 'maintenance', 'popularity', 'quality']
          .map((p, i) =>{
              data.score.push([i, d[p]])
            })
        return data
          })

console.log(scoreData)
          /////here we need 14 arrays of three objects of six item array

    const usageData = data.map((d) => {
      let data = {[d.name]: { 'time': [], 'count': [], 'rate':[]}}

      d.downloadsAcceleration.map((a, i) =>{
        const dateTo = i === 0? new Date(a.to) : new Date(d.downloadsAcceleration[(i-1)].from)
        const count  = i!== 0? a.count - d.downloadsAcceleration[(i-1)].count : a.count;
        const dateFrom = new Date(a.from);
        const timeSpan = timeDiffernce(dateTo, dateFrom)

        data[d.name].time.push(timeSpan)
        data[d.name].count.push(count)
        data[d.name].rate.push(Math.floor(count/timeSpan))
      })
      return data
    })

    console.log(usageData)

    const usageScale = function(value){
      return d3.scaleLinear()
      .domain(d3.extent(value))
      .range(1, 200)
    }


    // const widthScale = function(d, i){
    //   console.log(d3.extent(usageData[i].time))
    //   const scale = function (){
    //   return d3.scaleLinear()
    //   .domain(d3.extent(usageData[i].time))
    //   .range(0, 75)
    // }
    // return scale(d)
    // }

    const heightScale = d3.scaleLinear()
      .range(0, 200)

    //bar chart, appenfd data with a fillwd and scaled bar chart


            //create the average downloads per week for x weeeks
            //divide

      const svg = d3.select("body").append("svg")
          .attrs({
              width: width,
              height: height
          });

      const g = svg.append('g')
          .attr('transform', 'translate(' + [100, 10] + ')' )


      const path = d3.line()
        .x(function(d, i) {
           return 100 * d[0]; })
        .y(function(d, i) {
           return y(d[1])
         })

      const barGraph = function(name){
        console.log(usageData)
        console.log(usageData[name])
        console.log(usageData.async)
        g.append('g')
        .attr('class', 'usageGraph')
        .selectAll('bar')
        .data(usageData[name])
        .enter()
        .append('rect')
        .attrs({
          transform: 'translate(' + [300, 10] + ')',
          width: (d, i) => {
            console.log(d)
            console.log(usageScale(d.count))

            return 100 * i//widthScale(d, i)
          },
          height: (d, i) => {
            return 100 * i//heightScale(d.rate)
          },
          x: (d, i) => {
            return 100 * i //widthScale(d.time)
          },
          y: (d, i) => {
            return 100 * i //heightScale(d.rate)
          }
        });
      }


      const displayData = function(pkgName){
        console.log(pkgName)
        barGraph(pkgName)

      }


      const createPaths = g.append('g')
        .attr('class', 'lineGraph')
        .selectAll('path')
        .data(scoreData) //array of array
        .enter()
        .append('path')
        .on('click', (d) => {
          //toggle class visible, invisible
          displayData(d.name)
        })
        .attr('transform', 'translate(' + [0, 0] + ')')
        .attr('class', (d) => {
          return d.name
        })
        .attr('d', (d) => {
              return path(d.score)
        })



        const verticalAxis = g.append('g')
          .attr('class', 'axis')
          .selectAll('axis')
          .data(scoreData[0].score)
          .enter()

          .each(function(d, i){
            d3.select(this)
              .append('g')
              .attr('transform', 'translate(' + [(100 * i), 0] + ')')
              .call(axis.scale(y))
          })

}
}
