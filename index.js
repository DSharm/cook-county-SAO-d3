// Code goes here
var margin = {
    top: 100,
    right: 20,
    bottom: 60,
    left: 100
  },
  width = 700 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var x_groups = d3.scaleBand()
  .rangeRound([0, width], .3)
  .padding(0.05);

var x_categories = d3.scaleBand();

var x_values = d3.scaleBand();

var y = d3.scaleLinear()
  .range([height, 0]);

var color = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  // var xAxis = d3.axisTop(xScale)
  //     var yAxis = d3.axisRight(yScale)
  
var groups_axis = d3.axisBottom(x_groups);
var categories_axis = d3.axisBottom(x_categories);
var values_axis = d3.axisBottom(x_categories);
var yAxis = d3.axisLeft(y).tickFormat(d3.format(".2s"));;

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //d3.json("processed_data/intake_year_status_gender.json")

d3.json("processed_data/intake_year_status_gender.json")
        .then(function(data) {
            
            dataset = data;
            
            
            //console.log(dataset);
            nested_total = d3.nest()
            .key(function(d) {
                return d.Year;
            })
            .key(function(d){
                return d.initiation_result;
            })
            .rollup(function(leaves) {
              return [{
                key: 'Female',
                value: leaves[0]['Female']
              }, {
                key: 'Male',
                value: leaves[0]['Male']
              }];
            })
            .entries(dataset);

          nested_total.forEach(function(d){
            d.values.forEach(function(d) {
              //console.log(d.value[0].value);
              d.Total = d.value[0].value + d.value[1].value; 
            })  
          });

            console.log(nested_total);

            // var keys = d3.keys(data[0]).slice(1);
            // console.log(d3.max(data, function(d) {return d.Year}));
            //console.log('keys');
            //console.log(keys);
            x_groups.domain(nested_total.map(function(d) { return d.key; }));

            var results = nested_total[0].values.map(function(d, i) {
                console.log(d.key);
                return d.key;
              });
            
              x_categories.domain(results).rangeRound([0, x_groups.bandwidth()]);
            
            //var values = ['value 1', 'value 2', 'value 3']; 
            //console.log(nested_total[0].values[0]);
            var values = "Total";
            //console.log(values);

            // var values = nested_total[0].values[0].value.map(function(d, i) {
            //     //console.log(d.value);
            //     return d.key;
            // });
            x_values.domain(values).rangeRound([0, x_categories.bandwidth()]);
            
            y.domain([0, d3.max(nested_total, function(d) {
                //console.log(d.values);
                return d3.max(d.values, function(d) {
                    //console.log(d.Total); 
                    return d.Total;                   
                })
              })]);
            
            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + (height) + ")")
              .call(groups_axis);
          
            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 1)
              .attr("dy", ".5em")
              .style("text-anchor", "end")
              .text("Value");
          
            var groups_g = svg.selectAll(".group")
              .data(nested_total)
              .enter().append("g")
              .attr("class", function(d) {
                return 'group group-' + d.key;
              })
              .attr("transform", function(d) {
                return "translate(" + x_groups(d.key) + ",0)";
              });
          
            var categories_g = groups_g.selectAll(".category")
              .data(function(d) {
                //console.log(d);
                return d.values;
              })
              .enter().append("g")
              .attr("class", function(d) {
                return 'category category-' + d.key;
              })
              .attr("transform", function(d) {
                return "translate(" + x_categories(d.key) + ",0)";
              })
            
            //   var categories_labels = categories_g.selectAll('.category-label')
            //   .data(function(d) {
            //     return [d.key];
            //   })
            //   .enter().append("text")
            //   .attr("class", function(d) {
            //     return 'category-label category-label-' + d;
            //   })
            //   .attr("x", function(d) {
            //     return x_categories.bandwidth() / 2;
            //   })
            //   .attr('y', function(d) {
            //     return height + 25;
            //   })
            //   .attr('text-anchor', 'middle')
            //   .text(function(d) {
            //     return d;
            //   })
            /*  
            var values_g = categories_g.selectAll(".value")
              .data(function(d) {
                //console.log(d.Total);
                return d.value;
              })
              .enter().append("g")
              .attr("class", function(d) {
                return 'value value-' + 'Total';
              })
              .attr("transform", function(d) {
                return "translate(" + x_values(d.Total) + ",0)";
              });
              */
            // var values_labels = values_g.selectAll('.value-label')
            //   .data(function(d) {
            //     return [d.key];
            //   })
            //   .enter().append("text")
            //   .attr("class", function(d) {
            //     return 'value-label value-label-' + d;
            //   })
            //   .attr("x", function(d) {
            //     return x_values.bandwidth() / 2;
            //   })
            //   .attr('y', function(d) {
            //     return height + 10;
            //   })
            //   .attr('text-anchor', 'middle')
            //   .text(function(d) {
            //     return d;
            //   })
          
            //console.log(values_g);
            var rects = categories_g.selectAll('.rect')
              .data(function(d) {
                //console.log([d]);
                return [d];
              })
              .enter().append("rect")
              .attr("class", "rect")
              .attr("width", 15)
              .attr("x", function(d) {
                return 0;
              })
              .attr("y", function(d) {
                return y(d.Total);
              })
              .attr("height", function(d) {
                return height - y(d.Total);
              })
              .on("mouseover",mouseover)
              .on("mouseout",mouseout);// mouseout is defined below.
             
            function mouseover(d){  // utility function to be called on mouseover.
                // filter for selected state.
                console.log(d.value);
                nD = d.value;
                //var result = nested_total.filter(function(s){ return s.key == d[0];})[0],
                //nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
                   
                // call update functions of pie-chart and legend.    
              pC.update(nD,"on");
            }

            function mouseout(d){
                pC.update(d,"off");

            }
            var pC = {};
            
            pC.update = function(nD, mouse){
              
                var w = 200;
                var h = 200;

                var outerRadius = w/2;
                var innerRadius = 0;
                var arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
                
                var pie = d3.pie().value(function(d) { return d.value ;} );

                var pie_svg = d3.select('body')
                    .append("svg")
                    .attr("class","pie")
                    .attr('width',w)
                    .attr('height',h);
                
                //console.log(pie(nested_gender_test));
                // Set up groups
                var arcs = pie_svg.selectAll("g.arc")
                  .data(pie(nD))
                  .enter()
                  .append("g")
                  .attr("class","arc")
                  .attr("transform", "translate(" + +outerRadius + "," + +outerRadius + ")");

              if (mouse === "on") {
                

                // Draw arcs paths
                arcs.append("path")
                    .attr("fill",function(d,i) {
                      return color(i);
                    })
                    .attr("d",arc);


              }
              
              else if (mouse === "off") {
                d3.selectAll(".pie")
                  .transition()
                  .duration(50)
                  .attr('opacity',0)
                  .remove();
              }



              //arcs.selectAll("path").data(pie(nD)).transition().duration(500);
          }   

            // DRAW PIE CHART
            // First create different nested data for Gender
            /*
            nested_gender = d3.nest()
            .key(function(d) {
                return d.Year;
            })
            .key(function(d){
                return d.initiation_result;
            })
            .rollup(function(leaves) {
                return [{
                  key: 'Male',
                  value: leaves[0]['Male']
                },{
                  key: 'Female',
                  value: leaves[0]['Female']
                }]
              })
            .entries(dataset);

            nested_gender_test = nested_gender[0].values[0].value;
            //console.log(nested_gender_test);
            var pie = d3.pie().value(function(d) { return d.value ;} );
              
            var w = 200;
            var h = 200;

            var outerRadius = w/2;
            var innerRadius = 0;
            var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

            var pie_svg = d3.select('body')
                .append("svg")
                .attr('width',w)
                .attr('height',h);
            
            //console.log(pie(nested_gender_test));
            // Set up groups
            var arcs = pie_svg.selectAll("g.arc")
              .data(pie(nested_gender_test))
              .enter()
              .append("g")
              .attr("class","arc")
              .attr("transform", "translate(" + +outerRadius + "," + +outerRadius + ")");

            // Draw arcs paths
            arcs.append("path")
                .attr("fill",function(d,i) {
                  return color(i);
                })
                .attr("d",arc);

                */




            
            })

            .catch(function(error){
                      if (error) {
                          console.log(error)
                          console.log("CHECK THE DATASET NAME!")
                      } else {
                          //console.log(data)
                      }
                    });

/*

next steps: figure out if nested sructure allows for pie chart to be created on the side
http://bl.ocks.org/cflavs/695d3215ccbce135d3bd


if bar chart and pie chart working interactively, clean up code
add dispositions (and sentencing?) data plus nested structures
add functions to choose different parts of the data to be turned into bar chart

change categories for intake - other too small



*/



//xcode dump

/*
            

 ////////////////////////////////////////////////////////////////////////////////////////////////////////               

            /*
            dataset = data;

            dataset.forEach(function(d) {
                d.Total = d.Female + d.Male;
            });
            //console.log(dataset);

            // turn data into nested data;
            data_by_year = d3.nest()
                .key(function(d) {return d.Year;})
                .entries(dataset);

            
            console.log(data_by_year);

            data_by_year_result = d3.nest()
                .key(function(d) {return d.initiation_result;})
                .entries(data_by_year);

            
            console.log(data_by_year_result);
            
            /*data_by_year[0].values.forEach(function(d) {
                console.log(d.Female);
            });
            */
            
            // Compute total for each year and result:
           // data.forEach(function(d) {
           //     console.log(d.Year);              
           // });

            //console.log(data_by_year);
            /*
            var keys = d3.keys(data[0]).slice(1);
            // console.log(d3.max(data, function(d) {return d.Year}));
            console.log('keys');
            console.log(keys);
            x0.domain(data.map(function(d) { return d.Year; }));
            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

            g.append("g")
                .selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("class","bar")
                .attr("transform", function(d) { return "translate(" + x0(d.Year) + ",0)"; })
                .selectAll("rect")
                .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
                .enter().append("rect")
                .attr("x", function(d) { return x1(d.key); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("height", function(d) { return plotHeight - y(d.value); })
                .attr("fill", function(d) { return z(d.key); });

            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + plotHeight + ")")
                .call(d3.axisBottom(x0));

            g.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
                .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("Cases");

            var legend = g.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(keys.slice())
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
            legend.append("rect")
                .attr("x", plotWidth - 20)
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", z)
                .attr("stroke", z)
                .attr("stroke-width",2)
                
            legend.append("text")
                .attr("x", plotWidth - 27)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(function(d) { return d; });
        
        })
        .catch(function(error){
                  if (error) {
                      console.log(error)
                      console.log("CHECK THE DATASET NAME!")
                  } else {
                      console.log(data)
                  }

    });

// Load the dataset and catch any errors while loading data
// https://stackoverflow.com/questions/49768165/code-within-d3-json-callback-is-not-executed
// d3.json("sentence_dataset.json")
//   .then(function(data){
//       console.log(data);
//       makeScatterplot(data);
//   })
//   .catch(function(error){
//       if (error) {
//           console.log(error)
//           console.log("CHECK THE DATASET NAME!")
//       } else {
//           console.log(data)
//       }
//   });


// function makeScatterplot(data) {
//     // Set my scales to transform data into something I can plot on my chart
//     const xScale = d3.scaleLinear()
//        .domain([0, d3.max(data, function(d) {return d.case_length_total;})])
//        .range([plotWidth,margin.left]) 
//        .nice();

//     const yScale = d3.scaleLinear()
//        .domain([0,d3.max(data, function(d) {return d.sentence_length})])
//        .range([margin.top,plotHeight])
//        .nice();   

//     // Append my svg element and set its height and width
//     svg = d3.select('.first')
//             .append('svg')
//             .attr('width',width)
//             .attr('height',height);

//     // Check that my scales are working as expected
//     console.log(yScale(data[1].sentence_length) );
//     console.log(xScale(data[1].case_length_total) );

//     // Plot the circles separately for white, black, and hispanic
//     dots_w = svg.selectAll('.dot_white')
//                 .data(data)
//                 .enter()
//                 .append("circle")
//                 .filter(function(d) {return d.race == "White"})
//                 .attr('cx', d => xScale(d.case_length_total))
//                 .attr('cy', d => yScale(d.sentence_length))
//                 .attr('r',5)
//                 .attr('class', 'dot_white');

//     dots_b = svg.selectAll('.dot_black')
//                 .data(data)
//                 .enter()
//                 .append("circle")
//                 .filter(function(d) {return d.race == "Black"})
//                 .attr('cx', d => xScale(d.case_length_total))
//                 .attr('cy', d => yScale(d.sentence_length))
//                 .attr('r',5)
//                 .attr('class', 'dot_black');
    
//     dots_h = svg.selectAll('.dot_hispanic')
//                 .data(data)
//                 .enter()
//                 .append("circle")
//                 .filter(function(d) {return d.race == "Hispanic"})
//                 .attr('cx', d => xScale(d.case_length_total))
//                 .attr('cy', d => yScale(d.sentence_length))
//                 .attr('r',5)
//                 .attr('class', 'dot_hispanic');

//     // Create my axess
//     var xAxis = d3.axisTop(xScale)
//     var yAxis = d3.axisRight(yScale)

//     svg.append('g')
//         .call(xAxis)
//         .attr('transform', `translate(0,${margin.top})`);

//     svg.append('g')
//         .call(yAxis)
//         .attr('transform', `translate( ${plotWidth},0)`);

//     // Add labels to my axes
//     svg.append("text")
//         .attr("y",100)
//         .attr("x",plotWidth/2)
//         .style("text-anchor", "middle")
//         .text("Case Length")
//         .attr('font-family', 'tahoma')
//         .attr('font-size',12);  
    
//     svg.append("text")
//         .attr("transform", "rotate(90)")
//         .attr("x",plotHeight/2 + 40)
//         .attr("y",0- (plotWidth + 50))
//         .style("text-anchor", "middle")
//         .text("Sentence Length")
//         .attr('font-family', 'tahoma')
//         .attr('font-size',12);

//     // Add a title and subtitle
//     svg.append("text")
//         .attr("y",50)
//         .attr("x",margin.left)
//         .style("text-anchor", "left")
//         .text("Longer Case Lengths Correlated With Longer Sentences")
//         .attr('font-size', 20)
//         .attr('font-family', 'tahoma'); 
    
//     svg.append("text")
//         .attr("y",75)
//         .attr("x",margin.left)
//         .style("text-anchor", "left")
//         .text("Case Lengths and Sentence Lengths By Race")
//         .attr('font-size', 15)
//         .attr('font-family', 'tahoma'); 

//     // Create a legend
//     svg.append("rect")
//         .attr('height',15)
//         .attr('width',15)
//         .attr('x',margin.left)
//         .attr('y',plotHeight-190)
//         .attr('fill','#CF1264');
    
//     svg.append("rect")
//         .attr('height',15)
//         .attr('width',15)
//         .attr('x',margin.left)
//         .attr('y',plotHeight-150)
//         .attr('fill','#681E70');
    
//     svg.append("rect")
//         .attr('height',15)
//         .attr('width',15)
//         .attr('x',margin.left)
//         .attr('y',plotHeight-110)
//         .attr('fill','#107386');

//     svg.append("text")
//         .attr('x',margin.left)
//         .attr('y',plotHeight-200)
//         .text('Race')
//         .attr('font-family', 'tahoma')
//         .attr('font-size',14); 

//     svg.append("text")
//         .attr('x',margin.left + 30)
//         .attr('y',plotHeight-95)
//         .text('White')
//         .attr('font-family', 'tahoma')
//         .attr('font-size',12); 
    
//     svg.append("text")
//         .attr('x',margin.left + 30)
//         .attr('y',plotHeight-135)
//         .text('Black')
//         .attr('font-family', 'tahoma')
//         .attr('font-size',12);
    
//     svg.append("text")
//         .attr('x',margin.left + 30)
//         .attr('y',plotHeight-175)
//         .text('Hispanic')
//         .attr('font-family', 'tahoma')
//         .attr('font-size',12);
    
//     // Add a source line
//     svg.append("text")
//         .attr('x',300)
//         .attr('y',plotHeight + 40)
//         .text("Source: Cook County State Attorney's Office Data Portal")
//         .attr('font-family', 'tahoma')
//         .attr('font-size',12);
// }

/*
Plan for building dashboard:
- Create main Intake charts
    - Intake bar chart, overall, by year
    - Intake bar chart, stacked gender
    - Intake bar chart, stacked race
    - Intake bar chart, stacked offense type
    - Intake pop out pie charts by  offense, gender, race
- Add interactivity to intake charts
    - mouseover bars, pop out pie chart
    - rearrange stacked bars
    - create filter/ drop down for bar charts

- Create main disposition chart
    - sankey diagram for flow of outcomes for each case
    - default - all offenses, latest year, all races and all genders
- Add interactivity to disposition chart
    - Drop down menu for year (pick a year), and race/gender/offense type (choose to add however many)
    - when plotting different year, can flow be interactive? animation of convictions
    and non convictions going to different outcomes? 
    - static chart should gray out all other flows not moused over

- Create main sentence type chart
    - tree map of sentence type, default year
- Add interactivity
    - slider for year
    - Offense, gender, race filters

// Code by: Damini Sharma
// For this reverse scatterplot, I heavily referenced Andrew McNutt's solutions to the week7 D3 exercise
// and code showed by Alex Engler in class
// To run my files I did the following:
    // npm install -g live-server
    // then: live-server


// Set the dimensions of my plot
/*
const height = 600;
const width = 800;
const margin = {top: 200, left: 60, right: 20, bottom: 30};

const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.bottom - margin.top;
*/
// reference: https://bl.ocks.org/63anp3ca/6bafeb64181d87750dbdba78f8678715
// https://css-tricks.com/scale-svg/
// http://learnjsdata.com/group_data.html
// https://stackoverflow.com/questions/37690018/d3-nested-grouped-bar-chart


/*
var svg = d3.select("body").append('svg').attr('width',width).attr('height',height);
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
console.log(height);
console.log(svg.attr('height'));



    
    // The scale spacing the groups:
    var x0 = d3.scaleBand()
        .rangeRound([0, plotWidth])
        .paddingInner(0.3);

    // The scale for spacing each group's bar:
    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([plotHeight,0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
*/




