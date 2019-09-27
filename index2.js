// Code by: Damini Sharma


var width = 550;
var height = 500;
var margin = 50;

var pieChartsWidth = 0.6 * width;
var pieChartsHeight = height;

var duration = 250;

var lineOpacity = "0.6";
var lineOpacityHover = "0.9";
var otherLinesOpacityHover = "0.1";
var lineStroke = "4px";
var lineStrokeHover = "6px";

var circleOpacity = '0.85';
var circleOpacityOnLineHover = "0.25"
var circleRadius = 6;
var circleRadiusHover = 8;


// Set colors for pie charts   
var intakeColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264", "#681E70", "#ff8c00","#00ffc8"]);

var dispositionColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264"]);

var sentColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264", "#681E70", "#ff8c00"]);

var color_race = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var color_gender = d3.scaleOrdinal()
  .range(["#d0743c", "#ff8c00"]);

// variable = "Intake";

// //datasetG = []
// Load data
Promise.all([
  d3.json("processed_data/intake_year_race_gender.json"),
  d3.json("processed_data/dispo_year_race_gender.json"),
  d3.json("processed_data/sent_year_race_gender.json")
]).then(function(allData) {

    // dataset.push(allData)

    //console.log(allData)
    //console.log(Configuration.BarCharts)
    makeVis2(allData,Configuration.BarCharts);
    
  // https://github.com/UrbanInstitute/state-economic-monitor
//   $.each(Configuration.BarCharts, function(x, config) {
    
//     makeVis(allData,config,variable);
//   })
});

// Make buttons
button_width = 100
button_height = 50
buttonOpacity = 0.5
buttonOpacityHover = 0.9

IntakeSvg = d3.select("#Intake")
    .append("svg")
    .attr("width", (button_width+margin)+"px")
    .attr("height", (button_height+margin)+"px")
    .append('g')
    .attr("transform", `translate(${margin}, ${margin})`);

IntakeSvg.append("rect")
    .attr("class", "rect")
    .attr("width", button_width)
    .attr("height", button_height)
    .attr("fill", "#107386")
    .attr("opacity",buttonOpacity)
    .on("mouseover", function(d) {
        d3.select(this)
        .style('opacity', buttonOpacityHover)

    })
    .on("mouseout", function(d) {
        d3.select(this)
        .style('opacity', buttonOpacity)

    })

IntakeSvg.append("text")
    .text("Intake")
    .attr("transform", "translate(" + (button_width/2) + "," + (button_height/2) + ")")
    .attr("text-anchor", "middle")
    .style('fill',"black")
    .attr('font-size',12);

dispSvg = d3.select("#Disposition")
    .append("svg")
    .attr("width", (button_width+margin)+"px")
    .attr("height", (button_height+margin)+"px")
    .append('g')
    .attr("transform", `translate(${margin}, ${margin})`);

dispSvg.append("rect")
    .attr("class", "rect")
    .attr("width", button_width)
    .attr("height", button_height)
    .attr("fill", "#CF1264")
    .attr("opacity",buttonOpacity)
    .on("mouseover", function(d) {
        d3.select(this)
        .style('opacity', buttonOpacityHover)

    })
    .on("mouseout", function(d) {
        d3.select(this)
        .style('opacity', buttonOpacity)

    })

dispSvg.append("text")
    .text("Disposition")
    .attr("transform", "translate(" + (button_width/2) + "," + (button_height/2) + ")")
    .attr("text-anchor", "middle")
    .style('fill',"black")
    .attr('font-size',12);

sentSvg = d3.select("#Sentence")
    .append("svg")
    .attr("width", (button_width+margin)+"px")
    .attr("height", (button_height+margin)+"px")
    .append('g')
    .attr("transform", `translate(${margin}, ${margin})`);

sentSvg.append("rect")
    .attr("class", "rect")
    .attr("width", button_width)
    .attr("height", button_height)
    .attr("fill", "#ff8c00")
    .attr("opacity",buttonOpacity)
    .on("mouseover", function(d) {
        d3.select(this)
        .style('opacity', buttonOpacityHover)

    })
    .on("mouseout", function(d) {
        d3.select(this)
        .style('opacity', buttonOpacity)

    })

sentSvg.append("text")
    .text("Sentencing")
    .attr("transform", "translate(" + (button_width/2) + "," + (button_height/2) + ")")
    .attr("text-anchor", "middle")
    .style('fill',"black")
    .attr('font-size',12);
    


function makeVis2(allData,Configuration) {

    // Initial chart
    dataset = allData[0];
    config = Configuration["Intake"]

    nested_data = nested(dataset,config)

    makebarChart(nested_data,config);

    //console.log(Configuration)
    document.getElementById("Intake").addEventListener('click', function(event) {
        dataset = allData[0];
        config = Configuration["Intake"]
        nested_data = nested(dataset,config)

        makebarChart(nested_data,config);
        
      })

      document.getElementById("Disposition").addEventListener('click', function(event) {
        dataset = allData[1];
        config = Configuration["Disposition"]
        //console.log(dataset)
        //console.log(config)

        nested_data = nested(dataset,config)

        makebarChart(nested_data,config);
        
      })
      document.getElementById("Sentence").addEventListener('click', function(event) {
        dataset = allData[2];
        config = Configuration["Sentence"]
        //console.log(dataset)
        //console.log(config)

        nested_data = nested(dataset,config)

        makebarChart(nested_data,config);
        
      })

}

// Function to nest the data and then create Race/Gender arrays
function nested(dataset,config) {
      nested_total = d3.nest()
            .key(function(d) {
                // return d.Year;
                group = config["group"];
                //group = "Year";
                //console.log(group);
                //console.log(d[group]);
                return d[group];
            })
            .key(function(d){
                return d.Year
                // //console.log(config["group"]);
                // group = config["group"];
                // //group = "Year";
                // //console.log(group);
                // //console.log(d[group]);
                // return d[group];
            })
            .rollup(function(leaves) {
              return [{
                key: 'Female',
                value: leaves[0]['Female']
              }, {
                key: 'Male',
                value: leaves[0]['Male']
              },{
                key: 'Black',
                value: leaves[0]['Black']
              }, {
                key: 'White',
                value: leaves[0]['White']
              },
              {
                key: 'Latinx',
                value: leaves[0]['Latinx']
              },
              {
                key: 'Other',
                value: leaves[0]['Other']
              }];
            })
            .entries(dataset);

            nested_total.forEach(function(d){
            d.values.forEach(function(d) {
              // ideally make this more dynamic / set values somewhere else
              d.Total = d.value[0].value + d.value[1].value; 
              d.Gender = [d.value[0],d.value[1]];
              d.Race = [d.value[2],d.value[3],d.value[4],d.value[5]];
            })  
          });
        //console.log(nested_total);
        return nested_total;
};

// make initial chart
function makebarChart(data, config) {
//     console.log(config["name"]);
//     figureID = config["name"];
//   var parentElement = d3.select("#" + figureID );
    $(".lineChart").empty();
    var parentElement = d3.select(".lineChart").append('div')

    // data = data
    //console.log(data);
  /* Format Data */
    var parseDate = d3.timeParse("%Y");
    data.forEach(function(d) { 
        //console.log(d)
    d.values.forEach(function(d) {
        d.Year = parseDate(d.key);
        d.Total = +d.Total;    
        //console.log(d.Year)
    });
    }); 

    // console.log(data);

/* Scale */
var xScale = d3.scaleTime()
  .domain(d3.extent(data[0].values, d => d.Year))
  .range([0, width-margin]);

var max = data[0].values[0].Total;

data.forEach(function(d) {
    d.values.forEach(function(d) {
        if (d.Total > max) {
            max = d.Total
        }
    })
})
// var max = d3.max(data, function(d) {
//     console.log(d)
//     d3.max(d.values, function(d) {

//     })
//     })
console.log(max)
var yScale = d3.scaleLinear()
  .domain([0, max])
  .range([height-margin, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

/* Add SVG */
var svg = parentElement.append("svg")
  .attr("width", (width+margin)+"px")
  .attr("height", (height+margin)+"px")
  .append('g')
  .attr("transform", `translate(${margin}, ${margin})`);


/* Add line into SVG */
var line = d3.line()
  .x(d => xScale(d.Year))
  .y(d => yScale(d.Total));

let lines = svg.append('g')
  .attr('class', 'lines');

  //console.log(data);
lines.selectAll('.line-group')
  .data(data).enter()
  .append('g')
  .attr('class', 'line-group')  
  .on("mouseover", function(d, i) {
      //console.log(d)

      svg.append("text")
        .attr("class", "title-text")
        .style("fill", color(i))        
        .text(d.key)
        .attr("text-anchor", "middle")
        .attr("x", (width-margin)/2)
        .attr("y", 5);
    })
  .on("mouseout", function(d) {
      svg.select(".title-text").remove();
    })
  .append('path')
  .attr('class', 'line')  
  .attr('d', d => line(d.values))
  .style('stroke', (d, i) => color(i))
  .style('opacity', lineOpacity)
  .on("mouseover", function(d) {
      d3.selectAll('.line')
					.style('opacity', otherLinesOpacityHover);
      d3.selectAll('.circle')
					.style('opacity', circleOpacityOnLineHover);
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("stroke-width", lineStrokeHover)
        .style("cursor", "pointer");
    })
  .on("mouseout", function(d) {
      d3.selectAll(".line")
					.style('opacity', lineOpacity);
      d3.selectAll('.circle')
					.style('opacity', circleOpacity);
      d3.select(this)
        .style("stroke-width", lineStroke)
        .style("cursor", "none");
    });


/* Add circles in the line */
lines.selectAll("circle-group")
  .data(data).enter()
  .append("g")
  .style("fill", (d, i) => color(i))
  .selectAll("circle")
  .data(d => d.values).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.Total}`)
        .attr("x", d => xScale(d.Year) + 5)
        .attr("y", d => yScale(d.Total) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("cx", d => xScale(d.Year))
  .attr("cy", d => yScale(d.Total))
  .attr("r", circleRadius)
  .style('opacity', circleOpacity)
  .on("click", click)
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this) 
          .transition()
          .duration(duration)
          .attr("r", circleRadius);  
      });


/* Add Axis into SVG */
var xAxis = d3.axisBottom(xScale).ticks(10);
var yAxis = d3.axisLeft(yScale).ticks(12);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height-margin})`)
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append('text')
  //.attr("y", 15)
  .attr('x', 40)
  .attr("transform", "rotate(-90)")
  .attr("fill", "#000")
  .text("Total cases");


  function click(d){  // utility function to be called on mouseover.
    d3.selectAll(".pie")
    .transition()
    .duration(1)
    .attr('opacity',0)
    .remove();  

    gender = d.Gender;
    race = d.Race;
         
    // call update functions of pie-chart and legend.    
    pC.update(gender,race,"on");
  }


  
  var pC = {};
  
  pC.update = function(gender,race, mouse){
  
    if (mouse === "on") {
  
    var w = 170;
    var h = 170;
  
    var outerRadius = w/2;
    var innerRadius = w/4;
    
    var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    var pie = d3.pie().value(function(d) { return d.value ;} );
  
    function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; } 
      
    var radius = Math.min(w, h)/2;
    var outerArc_gender = d3.arc()
          .outerRadius(radius * 1.1)
          .innerRadius(radius * 1.1);
    
    // referenced https://bl.ocks.org/laxmikanta415/dc33fe11344bf5568918ba690743e06f  
    // GENDER BREAKDOWN
    gender_chart_x = pieChartsWidth * 5 + margin.left;  
  
    pieSvg = parentElement.append('svg')
                        .attr("width", pieChartsWidth )
                        .attr("height",pieChartsHeight)
                        .attr("class", "pie");

    pieChart_gender = pieSvg.append("g")
      .attr("class", "pie")
      .attr("transform", `translate(${margin*2.5}, ${margin*3})`);
      
    pieChart_gender.append('g')
      .attr("class", "labels");
    pieChart_gender.append("g")
      .attr("class", "lines"); 
  
    pieChart_gender.selectAll('path')
      .data(pie(gender))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr("fill",function(d,i) {return color_gender(i);})
  
      pieChart_gender.append('g').classed('labels',true);
      pieChart_gender.append('g').classed('lines',true);    
      
      var polyline_gender = pieChart_gender.select('.lines')
                        .selectAll('polyline')
                        .data(pie(gender))
                        .enter().append('polyline')
                        .attr('points', function(d) {
  
              var pos_gender = outerArc_gender.centroid(d);
              pos_gender[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
              return [arc.centroid(d), outerArc_gender.centroid(d), pos_gender]
          });
      
      pieChart_gender.append("g")
      .attr("class", "pie title")
      .append("text")
      .attr("transform", "translate(" + (-40) + "," + (-100) + ")")
      .text("Gender Breakdown")
      .attr('font-family', 'tahoma')
      .attr('font-size',12);
  
      label_gender = pieChart_gender.select('.labels').selectAll('text')
                  .data(pie(gender))  
                  .enter().append('text')
                  .attr('dy', '.35em')
                  .html(function(d) {
                      return d.data.key;
                  })
                  .attr('transform', function(d) {
                      var pos_gender = outerArc_gender.centroid(d);
                      pos_gender[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                      return 'translate(' + pos_gender + ')';
                  })
                  .style('text-anchor', function(d) {
                      return (midAngle(d)) < Math.PI ? 'start' : 'end';
                  })
                  .attr('font-size',10);
  
      // RACE BREAKDOWN
  
      pieChart_race = pieSvg.append("g")
      .attr("class", "pie")
      .attr("transform", `translate(${margin*2.5}, ${margin*8})`);
      
      pieChart_race.append('g')
      .attr("class", "labels");
      pieChart_race.append("g")
      .attr("class", "lines"); 
  
      pieChart_race.selectAll('path')
      .data(pie(race))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr("fill",function(d,i) {return color_race(i);})
  
      pieChart_race.append('g').classed('labels',true);
      pieChart_race.append('g').classed('lines',true);    
      
      var outerArc_race = d3.arc()
          .outerRadius(radius * 1.2)
          .innerRadius(radius * 1.2);
  
      var polyline_race = pieChart_race.select('.lines')
                        .selectAll('polyline')
                        .data(pie(race))
                        .enter().append('polyline')
                        .attr('points', function(d) {
  
              var pos_race = outerArc_race.centroid(d);
              pos_race[0] = radius * 1.1 * (midAngle(d) < Math.PI ? 1 : -1);
              return [arc.centroid(d), outerArc_race.centroid(d), pos_race]
          });
      
          pieChart_race.append("g")
      .attr("class", "pie title")
      .append("text")
      .attr("transform", "translate(" + (-40) + "," + (-110) + ")")
//      .attr("transform", "translate(" + -(pieChartsWidth/1.8) + "," + (-pieChartsHeight/1.5) + ")")
      .text("Race Breakdown")
      .attr('font-family', 'tahoma')
      .attr('font-size',12);
  
      pieChart_race = pieChart_race.select('.labels').selectAll('text')
                  .data(pie(race))  
                  .enter().append('text')
                  .attr('dy', '.35em')
                  .html(function(d) {
                      return d.data.key;
                  })
                  .attr('transform', function(d) {
                      var pos = outerArc_race.centroid(d);
                      pos[0] = radius * 1.1 * (midAngle(d) < Math.PI ? 1 : -1);
                      return 'translate(' + pos + ')';
                  })
                  .style('text-anchor', function(d) {
                      return (midAngle(d)) < Math.PI ? 'start' : 'end';
                  })
                  .attr('font-size',10);
  
  
    }
  
    else if (mouse === "off") {
      d3.selectAll(".pie")
        .transition()
        .duration(1)
        .attr('opacity',0)
        .remove();
    }
  };


// running list of references: 
// https://bl.ocks.org/63anp3ca/6bafeb64181d87750dbdba78f8678715
// https://css-tricks.com/scale-svg/
// http://learnjsdata.com/group_data.html
// https://stackoverflow.com/questions/37690018/d3-nested-grouped-bar-chart
// http://bl.ocks.org/cflavs/695d3215ccbce135d3bd
// https://github.com/emmacooperpeterson/human_trafficking_sentencing/blob/master/script.js
// https://next.plnkr.co/edit/qGZ1YuyFZnVtp04bqZki?p=preview&utm_source=legacy&utm_medium=worker&utm_campaign=next&preview
// https://github.com/UrbanInstitute/state-economic-monitor (used to help the basic architecture of project)
// https://www.w3schools.com/jquery/html_empty.asp

// https://www.d3-graph-gallery.com/graph/sankey_basic.html
// https://grokbase.com/t/gg/d3-js/156byjtyfv/how-to-change-opacity-of-links-when-clicked-on-a-node-in-sankey-diagram-using-d3-library
// https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
// http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
// http://bl.ocks.org/danharr/af796d91926d254dfe99
// https://codepen.io/zakariachowdhury/pen/JEmjwq




//     //console.log(results);
    // Create a legend - need to make this dynamic to account for other charts (not Intake)
    
    // https://bl.ocks.org/bricedev/0d95074b6d83a77dc3ad
    // legend = barChart.selectAll(".legend")
    //     .data(results)
    //     .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function(d,i) { return "translate(0," + i*20 + ")"; })
    //    .style("opacity","1");
    
    // legend.append("rect")
    //   .attr("x", barChartWidth - 10)
    //   .attr("width", 10)
    //   .attr("height", 18)
    //   .style("fill", function(d) { 
    //     if (config["name"] === "Intake") {
    //       return intakeColor(d)
    //     }
    //     else if (config["name"] === "Disposition") {
    //       return dispositionColor(d);
    //     }
    //     else if (config["name"] === "Sentence") {
    //       return sentColor(d);
    //     }
    //   });
    
    // legend.append("text")
    //   .attr("x", barChartWidth - 15)
    //   .attr("y", 9)
    //   .attr("dy", ".35em")
    //   .style("text-anchor", "end")
    //   .attr("font-size",10)
    //   .text(function(d) {return d; });
    
    // barChart.append("text")
    //     .attr("transform","translate(" + 0 + "," + (barChartHeight+40) +")")
    //     .text("Source: Cook County State Attorney's Office Data Portal")
    //     .attr('font-family', 'tahoma')
    //     .attr('font-size',12); 


    

};




/*

next steps:
- add legend to line charts
- add mouseover to pie charts
- put line charts on same page as sankey
- dynamically change variables (not diff pages)
- vertical line on mouseover of circles
- change data!!!!!! to be by receive year



next steps:
- bar charts - add highlighting on bars on click/mouseover. show values on mouseover
- pie charts - show default values or at least on mouseover
- why are pages so long??
- sankey - add drag, color nodes, highlighting of links, and year slider. add particles


next steps:
- add sentences dataset - done
- add offense category breakdown pie chart
- add mouseover to bar charts showing values - added mouseover, no values yet
- allow clicking of bars so pie charts don't disappear - done
- need to highlight bars on click / mouseover
- sankey diagram - preliminary done
- aesthetics
- why are the pages so long?


next steps 9/11/19:
- add dispositions and sentencing charts 
- add offense category breakdown
- add buttons/ functionality to switch between bar charts
- make legends for bar chart and pie charts dynamic (or fix labels for pie charts to not overlap)
- add ability to keep pie charts visible e.g. by click on a given bar so can hover over pie chart
to see values and %'s 
- add ability to see value labels on bars on tool tip
- make bar chart legend interactive - e.g. when hovering on legend, highlight relevant bars?


next steps: figure out if nested sructure allows for pie chart to be created on the side

http://bl.ocks.org/cflavs/695d3215ccbce135d3bd

if bar chart and pie chart working interactively, clean up code
add dispositions (and sentencing?) data plus nested structures
add functions to choose different parts of the data to be turned into bar chart

change categories for intake - other too small


next steps:
- Add headings, labels, titles, roughly
- Clean up code!!!!!
- Add more dimensions: add gender, and append dispositions
- Clean up intake categories 

*/


