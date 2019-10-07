// Code by: Damini Sharma
var width = 550;
var height = 500;
var margin = 70;

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

var UNROLL_DURATION = 1000;
var CIRCLE_DURATION = 3000;
var DISPLAY_TEXT = 1500;
var REMOVE_TEXT = 1000;
var REMOVE_LINES = 400;
var DELAY_UNROLL = 1000;
var CHANGE_Y_AXIS = 900;
var moveChartRight_DURATION = 500;
var moveChartLeft_DURATION = 500;
var DELAY_Y_AXIS = 500;

var yScale = d3.scaleLinear().range([height-margin, 0]);
var yAxis = d3.axisLeft(yScale).ticks(12);

var xScale = d3.scaleTime().range([0, width-margin]);
var xAxis = d3.axisBottom(xScale).ticks(10);

var viewState = 0;
var moveChartRight = 290;

// Set colors for pie charts   
var intakeColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264", "#681E70", "#ff8c00","#2965E6"]);

var dispositionColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264","#681E70"]);

var sentColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264", "#681E70", "#ff8c00","#2965E6"]);

var color_race = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var color_gender = d3.scaleOrdinal()
  .range(["#d0743c", "#ff8c00"]);

// variable = "Intake";
//Define key function, to be used when binding data
var key = function(d) {
  return d.key;
};

// //datasetG = []
// Load data
Promise.all([
  d3.json("processed_data/intake_year_race_gender.json"),
  d3.json("processed_data/dispo_year_race_gender.json"),
  d3.json("processed_data/sent_year_race_gender.json")
]).then(function(allData) {

    makeButtons()
    makeVis2(allData,Configuration.BarCharts);
    
});


function makeButtons() {
  button_width = 100
  button_height = 40
  buttonOpacity = 0.5
  buttonOpacityHover = 0.9

  IntakeSvg = d3.select("#Intake")
      .append("svg")
      .attr("width", (button_width+margin)+"px")
      .attr("height", (button_height)+"px")
      .append('g')
      // .attr("transform", `translate(${margin}, ${margin})`);
      .attr("transform", 'translate(0,0)')

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
      .attr("height", (button_height)+"px")
      .append('g')
      // .attr("transform", `translate(${margin}, ${margin})`);
      .attr("transform", 'translate(0,0)')

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
      .attr("height", (button_height)+"px")
      .append('g')
      .attr("transform", 'translate(0,0)')

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

}

function makeVis2(allData,Configuration) {
    // console.log(Configuration)
    document.getElementById("Intake").addEventListener('click', function(event) {

      d3.selectAll(".pie")
        .transition()
        .duration(1)
        .attr('opacity',0)
        .remove();  
        
        moveLineChartRight(moveChartRight) 
        dataset = allData[0];
        config = Configuration["Intake"]
        nested_data = nested(dataset,config)

        makelineChart(nested_data,config);

        viewState ++ ;

        // Add explanatory text
        d3.select(".inner#Disposition")
          .transition()
          .duration(REMOVE_TEXT)
          .style("opacity",0)
        
        d3.select(".inner#Sentencing")
          .transition()
          .duration(REMOVE_TEXT)
          .style("opacity",0)


        d3.select(".inner#Intake")
          .transition()
          .duration(DISPLAY_TEXT)
          .style("opacity",1)
        
      })

      document.getElementById("Disposition").addEventListener('click', function(event) {
        d3.selectAll(".pie")
        .transition()
        .duration(1)
        .attr('opacity',0)
        .remove();  

        moveLineChartRight(moveChartRight) 
        dataset = allData[1];
        config = Configuration["Disposition"]
        nested_data = nested(dataset,config)
        makelineChart(nested_data,config);

        viewState ++ ;

         // Add explanatory text
         d3.select(".inner#Disposition")
         .transition()
         .duration(DISPLAY_TEXT)
         .style("opacity",1)
       
       d3.select(".inner#Sentencing")
         .transition()
         .duration(REMOVE_TEXT)
         .style("opacity",0)


       d3.select(".inner#Intake")
         .transition()
         .duration(REMOVE_TEXT)
         .style("opacity",0)
        
      })
      document.getElementById("Sentence").addEventListener('click', function(event) {
        d3.selectAll(".pie")
        .transition()
        .duration(1)
        .attr('opacity',0)
        .remove();  

        moveLineChartRight(moveChartRight) 
        dataset = allData[2];
        config = Configuration["Sentence"]
        nested_data = nested(dataset,config)
        makelineChart(nested_data,config);

        viewState ++ ;

        // Add explanatory text
        d3.select(".inner#Disposition")
        .transition()
        .duration(REMOVE_TEXT)
        .style("opacity",0)
      
        d3.select(".inner#Sentencing")
        .transition()
        .duration(DISPLAY_TEXT)
        .style("opacity",1)

        d3.select(".inner#Intake")
        .transition()
        .duration(REMOVE_TEXT)
        .style("opacity",0)
        
      })
    }

// Function to nest the data and then create Race/Gender arrays
function nested(dataset,config) {
    nested_total = d3.nest()
          .key(function(d) {
              group = config["group"];
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
  
function makeSvg(parentElement,moveChartRight) {
    
      var svg = parentElement.append("svg").attr("id", "line-chart")
      .attr("width", (width+margin+250)+"px")
      .attr("height", (height+margin)+"px")
      .append("g")
      .attr("id", 'line-chart-g')
      .attr("transform", 'translate('  + moveChartRight + "," + margin + ")");

      return svg
  }

function moveLineChartRight(moveChartRight) {
  d3.select("#line-chart")
    .transition()
    .duration(moveChartRight_DURATION)
    .attr('width',(width+margin+250)+"px")
    
    d3.select("#line-chart-g")
        .transition()
        .duration(moveChartRight_DURATION)
        .attr("transform",'translate('  + moveChartRight + "," + margin + ")")
        
    

}


function moveLineChartLeft() {
    d3.select("#line-chart-g")
        .transition()
        .duration(moveChartLeft_DURATION)
        .attr("transform",'translate('  + 50 + "," + margin + ")")
        
    d3.select("#line-chart")
        .transition()
        .duration(moveChartLeft_DURATION)
        .attr('width',(width+margin+200)+"px")
      

}


function makelineChart(data, config) {
      console.log(viewState)
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
    /* Scale */
    
    
    var max = data[0].values[0].Total;
    
    data.forEach(function(d) {
        d.values.forEach(function(d) {
            if (d.Total > max) {
                max = d.Total
            }
        })
    })
    // var yScale = d3.scaleLinear()
    //   .domain([0, max])
    //   .range([height-margin, 0]);
      xScale.domain(d3.extent(data[0].values, d => d.Year))
      yScale.domain([0,max])
      // console.log(max)
    
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    
    if (viewState===0) {
      parentElement = createParentElem()
      svg = makeSvg(parentElement,moveChartRight)

    }

    if (viewState!==0) {

      // d3.select("#line-chart-g")
      //   .transition()
      //   .duration(1000)
      //   .attr("transform",'translate('  + 50 + "," + margin + ")")
        
      d3.select("text.title")
        .transition()
        .duration(300)
        .style("opacity",0)

      d3.select(".lines")
        .transition()
        .duration(REMOVE_LINES)
        .style("opacity",0)
        .remove()

    }
    

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
    
        // console.log(path.node())
        // console.log(path._groups[0])

        // path.forEach(function(d) {

                 
        //   console.log(d.node())


        // })
        // path.forEach(function(d) {
        //https://stackoverflow.com/questions/21140547/accessing-svg-path-length-in-d3
      path.each(function(d) { d.totalLength = this.getTotalLength(); })
          .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
          .attr("stroke-dashoffset", function(d) { return d.totalLength; })
          .transition()
          .delay(DELAY_UNROLL)
          .duration(UNROLL_DURATION)
          .attr("stroke-dashoffset",0);


        // })
        // var totalLength = path.node().getTotalLength();

        // // Set Properties of Dash Array and Dash Offset and initiate Transition
        // // http://duspviz.mit.edu/d3-workshop/transitions-animation/
        // path
        //     .attr("stroke-dasharray", (totalLength*2) + " " + (totalLength*2))
        //     .attr("stroke-dashoffset", totalLength)
        //   .transition() // Call Transition Method
        //     .duration(UNROLL_DURATION) // Set Duration timing (ms)
        //     //.ease(d3.easeLinear) // Set Easing option
        //     .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
    
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
            
            d3.select(this)
              .transition()
              .duration(duration)
              .attr("r", circleRadiusHover);
            
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
      .delay(DELAY_UNROLL)
      .duration(CIRCLE_DURATION)
      .style('opacity', circleOpacity)
      
    /* Add Axis into SVG */
    
    // var yAxis = d3.axisLeft(yScale).ticks(12);
    
    
    
    if (viewState===0) {
      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append('text')
      //.attr("y", 15)
      .attr('x', 5)
      .attr('y', -5)
      // .attr("transform", "rotate(-90)")
      .attr("fill", "#000")
      .text("Total cases");

      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height-margin})`)
      .call(xAxis);
    }
    
    // if (viewState !== 0) {
    //   console.log(viewState)
    //   svg.selectAll(".y.axis")
    //   .transition()
    //   .duration(750)
    //   .call(yAxis)
    // }
    if (viewState !== 0) {
      svg.selectAll("g.y.axis")
      .transition()
      .delay(DELAY_Y_AXIS)
      .duration(CHANGE_Y_AXIS)
      .call(yAxis)

      svg.selectAll("g.x.axis")
      .transition()
      .duration(750)
      .call(xAxis)
      // .style("opacity",0.5)
    }
    
      // .call(yAxis)

    // console.log(data);
    var results = []

    data.forEach(function(d) {
        results.push(d.key)
    })
    console.log(results)

    // https://bl.ocks.org/bricedev/0d95074b6d83a77dc3ad
    legend = lines.selectAll(".legend")
        .data(results)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(" + 10  + "," + i*20 + ")"; });
    
    legend.append("rect")
      .attr("x", width+10 )
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
      })
      .style("opacity","0")
      .transition()
      .delay(1000)
      .duration(1000)
      .style("opacity","1");

    
    legend.append("text")
      .attr("x", width+5)
      .attr("y", 5)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .attr("font-size",10)
      .text(function(d) {
        if (d==="Filed by LEA") {
          tspan()
        }
        else {
          return d;
        }})
      .style("opacity", "0")
      .transition()
      .delay(1000)
      .duration(1000)
      .style("opacity","1");
    
    

    lines.append("text")
        .attr("transform","translate(" + 0 + "," + (height-10) +")")
        .text("Source: Cook County State Attorney's Office Data Portal")
        .attr('font-family', 'tahoma')
        .attr('font-size',12); 

    lines.append("text")
        .attr("class","title")
        .attr("transform","translate(" + width/2 + "," + (-30) +")")
        .text(config["title"])
        .attr("text-anchor","middle")
        .attr('font-family', 'tahoma')
        .attr('font-size',14)
        .style('opacity',0)
        .transition()
        .duration(1000)
        .style('opacity',1)
    
      
  };

function tspan() {
  d3.selectAll(".lines")
    .append('text')
    .attr('id','Filed-by-LEA')
    .attr("font-size",10)
    .attr("x", width-40)
      .attr("y", 50)
      .attr("dy",".35em")
    .append('tspan')
    .text('Filed by LEA')
    .append('tspan')
    .attr('baseline-shift','super')
    .text('1')

  d3.selectAll("#Filed-by-LEA")
    .style("opacity", "0")
      .transition()
      .delay(1000)
      .duration(1000)
      .style("opacity","1");
}

function click(d,firstPie){  // utility function to be called on mouseover.
    d3.selectAll(".pie")
    .transition()
    .duration(1)
    .attr('opacity',0)
    .remove();  

    moveLineChartLeft()

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
    // gender_chart_x = pieChartsWidth * 5 + margin.left;  

  
    pieSvg = parentElement.append('svg')
                        .attr("width", (pieChartsWidth)+"px" )
                        .attr("height",(pieChartsHeight)+"px")
                        .attr("class", "pie")
                        .attr("id","pieSvg")
                        // .append('g')
                        // .attr('transform','translate(150,0)')


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
      .attr("transform", `translate(${margin*1.7}, ${margin*2})`);
      
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
          .text(d.data.key + ": " + d.data.value)
          .attr("text-anchor", "middle")
          .attr("x", (margin*1.7))
          .attr("y", (margin*2)-5)
          .attr('font-size',13);
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
      .attr("transform", `translate(${margin*1.7}, ${margin*5.5})`);
      
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
          .attr("x", (margin*1.7))
          .attr("y", (margin*5.5)-5)
          .attr('font-size',13);;
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

 // List of references: 
// https://bl.ocks.org/63anp3ca/6bafeb64181d87750dbdba78f8678715
// https://css-tricks.com/scale-svg/
// http://learnjsdata.com/group_data.html
// https://stackoverflow.com/questions/37690018/d3-nested-grouped-bar-chart
// http://bl.ocks.org/cflavs/695d3215ccbce135d3bd
// https://github.com/emmacooperpeterson/human_trafficking_sentencing/blob/master/script.js
// https://next.plnkr.co/edit/qGZ1YuyFZnVtp04bqZki?p=preview&utm_source=legacy&utm_medium=worker&utm_campaign=next&preview
// https://github.com/UrbanInstitute/state-economic-monitor (used to help the basic architecture of project)
// https://www.w3schools.com/jquery/html_empty.asp
// https://observablehq.com/@mbostock/flow-o-matic
// https://www.d3-graph-gallery.com/graph/sankey_basic.html
// https://grokbase.com/t/gg/d3-js/156byjtyfv/how-to-change-opacity-of-links-when-clicked-on-a-node-in-sankey-diagram-using-d3-library
// https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
// http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
// http://bl.ocks.org/danharr/af796d91926d254dfe99
// https://codepen.io/zakariachowdhury/pen/JEmjwq
// https://bl.ocks.org/susielu/23dc3082669ee026c552b85081d90976
