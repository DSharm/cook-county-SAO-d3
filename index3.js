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
    
//Define key function, to be used when binding data
var key = function(d) {
    return d.key;
};

function makeVis2(allData,Configuration) {
    // console.log(Configuration)
    document.getElementById("Intake").addEventListener('click', function(event) {
        dataset = allData[0];
        config = Configuration["Intake"]
        nested_data = nested(dataset,config)

        makelineChart(nested_data,config);
        
      })

      document.getElementById("Disposition").addEventListener('click', function(event) {
        dataset = allData[1];
        config = Configuration["Disposition"]
        //console.log(dataset)
        //console.log(config)

        nested_data = nested(dataset,config)

        makelineChart(nested_data,config);
        
      })
      document.getElementById("Sentence").addEventListener('click', function(event) {
        dataset = allData[2];
        config = Configuration["Sentence"]
        //console.log(dataset)
        //console.log(config)

        nested_data = nested(dataset,config)

        makelineChart(nested_data,config);
        
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

  function createParentElem() {
    $(".lineChart").empty();
    var parentElement = d3.select(".lineChart").append('div')

    return parentElement
  }
  

  function makeSvg(parentElement,moveChart) {
    
        var svg = parentElement.append("svg").attr("id", "line-chart")
      .attr("width", (width+margin+400)+"px")
      .attr("height", (height+margin)+"px")
      .append("g")
      .attr("id", 'line-chart-g')
      .attr("transform", 'translate('  + moveChart + "," + 50 + ")");

      return svg
  }

function removeLineChart() {
    d3.select("#line-chart-g")
        .transition()
        .duration(1000)
        .attr("transform",'translate('  + 50 + "," + 50 + ")")
    d3.select("#line-chart")
        .attr('width',(width+margin)+"px")

}


  function makelineChart(data, config) {
    //     console.log(config["name"]);
    //     figureID = config["name"];
    //   var parentElement = d3.select("#" + figureID );
        // $(".lineChart").empty();
        // var parentElement = d3.select(".lineChart").append('div')
    
        // data = data
        var firstPie = 0;
        console.log(data);
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
    // var svg = parentElement.append("svg")
    //   .attr("width", (width+margin + 100)+"px")
    //   .attr("height", (height+margin)+"px")
    //   .append('g')
    //   .attr("transform", 'translate('  + 100 + "," + 50 + ")");
    
    parentElement = createParentElem()
    svg = makeSvg(parentElement,200)
    console.log(svg)

    // parentElement = makeSvg(100).parentElement

    // console.log(svg.parentElement)
    /* Add line into SVG */
    var line = d3.line()
      .x(d => xScale(d.Year))
      .y(d => yScale(d.Total));
    
    let lines = svg.append('g')
      .attr('class', 'lines');
    
      //console.log(data);
    lineGroups = lines.selectAll('.line-group')
      .data(data,key).enter()
      .append('g')
      .attr('class', 'line-group')  
      .on("mouseover", function(d, i) {
          //console.log(d)
          if (config["name"] === "Intake") {
            color = intakeColor;
          }
          else if (config["name"] === "Disposition") {
            color = dispositionColor;
          }
          else if (config["name"] === "Sentence") {
            color = sentColor;
          }

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
    
    path = lineGroups.append('path')
      .attr('class', 'line')  
      .attr('d', d => line(d.values))
      .style('stroke', function(d,i) {
        if (config["name"] === "Intake") {
            return intakeColor(i)
          }
          else if (config["name"] === "Disposition") {
            return dispositionColor(i);
          }
          else if (config["name"] === "Sentence") {
            return sentColor(i);
          }
      })
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
    
        var totalLength = path.node().getTotalLength();

        // Set Properties of Dash Array and Dash Offset and initiate Transition
        // http://duspviz.mit.edu/d3-workshop/transitions-animation/
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
          .transition() // Call Transition Method
            .duration(4000) // Set Duration timing (ms)
            //.ease(d3.easeLinear) // Set Easing option
            .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
    
    /* Add circles in the line */
   circleGroups = lines.selectAll("circle-group")
      .data(data,key).enter()
      .append("g")
      .style("fill", function(d,i) {
        if (config["name"] === "Intake") {
            return intakeColor(i)
          }
          else if (config["name"] === "Disposition") {
            return dispositionColor(i);
          }
          else if (config["name"] === "Sentence") {
            return sentColor(i);
          }
      })

    circle = circleGroups
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
      .on("click", function(d) {
            firstPie++
            console.log(d)
            click(d,firstPie)
      })
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
          })
    .style('opacity', 0)
      .transition()
      .duration(4000)
      .style('opacity', circleOpacity)
      
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
      .attr('x', 50)
      .attr("transform", "rotate(-90)")
      .attr("fill", "#000")
      .text("Total cases");
    
    console.log(data);
    var results = []

    data.forEach(function(d) {
        results.push(d.key)
    })
    console.log(results)

    // https://bl.ocks.org/bricedev/0d95074b6d83a77dc3ad
    legend = svg.selectAll(".legend")
        .data(results)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i*20 + ")"; })
       .style("opacity","1");
    
    legend.append("rect")
      .attr("x", width - 10)
      .attr("width", 10)
      .attr("height", 18)
      .style("fill", function(d) { 
        if (config["name"] === "Intake") {
          return intakeColor(d)
        }
        else if (config["name"] === "Disposition") {
          return dispositionColor(d);
        }
        else if (config["name"] === "Sentence") {
          return sentColor(d);
        }
      });
    
    legend.append("text")
      .attr("x", width - 15)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .attr("font-size",10)
      .text(function(d) {return d; });
    
    svg.append("text")
        .attr("transform","translate(" + 0 + "," + (height-10) +")")
        .text("Source: Cook County State Attorney's Office Data Portal")
        .attr('font-family', 'tahoma')
        .attr('font-size',12); 

    svg.append("text")
        .attr("transform","translate(" + width/2 + "," + (-30) +")")
        .text(config["title"])
        .attr("text-anchor","middle")
        .attr('font-family', 'tahoma')
        .attr('font-size',14);
    
      
  };

function click(d,firstPie){  // utility function to be called on mouseover.
    d3.selectAll(".pie")
    .transition()
    .duration(1)
    .attr('opacity',0)
    .remove();  

    removeLineChart()


    gender = d.Gender;
    race = d.Race;
    parent = d.Parent
         
    // call update functions of pie-chart and legend.    
    pC.update(d,gender,race,"on",firstPie);
  }


  
  var pC = {};
  
pC.update = function(d,gender,race, mouse,firstPie){
  
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
    
    var div = pieSvg.append('div')
    .attr("class", "tooltip")				
    .style("opacity", 0);

    if (firstPie===1) {
        d3.selectAll(".pie")
                        .style("opacity",0)
                        .transition()
                        .duration(3000)
                        .style("opacity",1)
    }
    
    // firstPie++ 

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
      .on("mouseover", function(d, i) {

        pieSvg.append("text")
          .attr("class", "pie-text")
          .style("fill", color_gender(i))        
          .text(d.data.key + ":" + d.data.value)
          .attr("text-anchor", "middle")
          .attr("x", (margin*2.5))
          .attr("y", (margin*3)-5);
      })
    .on("mouseout", function(d) {
        pieSvg.select(".pie-text").remove();
      })

    // console.log(d)
    // console.log(gender)
  
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
      .attr("transform", "translate(" + (-60) + "," + (-100) + ")")
      .text("Gender Breakdown" + ", " + d.key)
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
      .on("mouseover", function(d, i) {

        pieSvg.append("text")
          .attr("class", "pie-text")
          .style("fill", color_race(i))        
          .text(d.data.key + ":" + d.data.value)
          .attr("text-anchor", "middle")
          .attr("x", (margin*2.5))
          .attr("y", (margin*8)-5);
      })
    .on("mouseout", function(d) {
        pieSvg.select(".pie-text").remove();
      })
  
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
      .attr("transform", "translate(" + (-60) + "," + (-110) + ")")
//      .attr("transform", "translate(" + -(pieChartsWidth/1.8) + "," + (-pieChartsHeight/1.5) + ")")
      .text("Race Breakdown" + ", " + d.key)
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
  }

 