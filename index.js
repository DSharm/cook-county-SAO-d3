// Code by: Damini Sharma

// running list of references: 
// https://bl.ocks.org/63anp3ca/6bafeb64181d87750dbdba78f8678715
// https://css-tricks.com/scale-svg/
// http://learnjsdata.com/group_data.html
// https://stackoverflow.com/questions/37690018/d3-nested-grouped-bar-chart
// http://bl.ocks.org/cflavs/695d3215ccbce135d3bd
// https://github.com/emmacooperpeterson/human_trafficking_sentencing/blob/master/script.js
// https://next.plnkr.co/edit/qGZ1YuyFZnVtp04bqZki?p=preview&utm_source=legacy&utm_medium=worker&utm_campaign=next&preview

// Set up margins, width, and chart sizes
var margin = {top: 40,right: 100,bottom: 25,left: 40};
var width = 900;
var height = 700;
var barChartWidth = 0.75 * width - margin.right;
var barChartHeight = height  - margin.top*9;
var pieChartsWidth = 0.1 * width;
var pieChartsHeight = 0.5 * barChartHeight;

var svg = d3.select(".first")
            .append("svg")
            .attr('width',width)
            .attr('height',height)
            .attr('transform', 'translate('+ margin.left+',' + margin.top +')');

var barChart = svg.append('g')
                  .attr('height',barChartHeight)
                  .attr('width',barChartWidth)
                  .attr('transform', 'translate('+ margin.left+',' +margin.top*1.7 +')');


// Add title
svg.append('text')
   .attr('x', margin.left)
   .attr('y', margin.top-20)
   .text("Cook County State Attorney's Office - Dashboard")
   .attr('font-family', 'tahoma')
   .attr('font-size',18);

// Set colors for pie charts   
var color_race = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var color_gender = d3.scaleOrdinal()
  .range(["#d0743c", "#ff8c00"]);

// Load data
Promise.all([
  d3.json("processed_data/intake_year_race_gender.json"),
]).then(function(allData) {
  makeVis(allData);
});

function makeVis(allData) {
  nested_data = nested(allData[0]);
  makebarChart(nested_data);
};

// Function to nest the data and then create Race/Gender arrays
function nested(dataset) {
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
              },{
                key: 'Unknown',
                value: leaves[0]['Unknown']
              }];
            })
            .entries(dataset);

            nested_total.forEach(function(d){
            d.values.forEach(function(d) {
              // ideally make this more dynamic / set values somewhere else
              d.Total = d.value[0].value + d.value[1].value; 
              d.Gender = [d.value[0],d.value[1]];
              d.Race = [d.value[2],d.value[3],d.value[4],d.value[5],d.value[6]];
            })  
          });
        console.log(nested_total);
        return nested_total;
};

// make bar chart
function makebarChart(dataset) {
  
  var x_groups = d3.scaleBand()
  .rangeRound([margin.left, barChartWidth], .1)
  .padding(0.08);

  var x_categories = d3.scaleBand();

  var x_values = d3.scaleBand();

  var y = d3.scaleLinear()
    .range([barChartHeight, 0]);
    
  var groups_axis = d3.axisBottom(x_groups);
  var categories_axis = d3.axisBottom(x_categories);
  var values_axis = d3.axisBottom(x_categories);
  var yAxis = d3.axisLeft(y).tickFormat(d3.format(".2s"));

  dataset.forEach(function(d){
    d.values.forEach(function(d) {
      //console.log(d.value[0].value);
      d.Total = d.value[0].value + d.value[1].value; 
    })  
  });

  x_groups.domain(dataset.map(function(d) { return d.key; }));

  var results = dataset[0].values.map(function(d, i) {
      //console.log(d.key);
      return d.key;
    });
  
    x_categories.domain(results).rangeRound([0, x_groups.bandwidth()]);
  
  //var values = ['value 1', 'value 2', 'value 3']; 
  //console.log(nested_total[0].values[0]);
  var values = "Total";
  //console.log(values);

  x_values.domain(values).rangeRound([0, x_categories.bandwidth()]);
  
  y.domain([0, d3.max(dataset, function(d) {
      //console.log(d.values);
      return d3.max(d.values, function(d) {
          //console.log(d.Total); 
          return d.Total;                   
      })
    })]);
  
  barChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (barChartHeight) + ")")
    .call(groups_axis);

  barChart.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .attr("transform","translate(" + margin.left + ",0)");
    
  barChart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x",-(barChartHeight/2))
    .text("Number of Cases")
    .attr('font-family', 'tahoma')
    .attr('font-size',12);
  
  barChart.append("text")
            .attr("transform","translate(" + barChartWidth/2 + "," + (-10) +")")
            .text("Intake - Outcome of Cases Entering SAO System")
            .attr("text-anchor","middle")
            .attr('font-family', 'tahoma')
            .attr('font-size',12);
  

  var groups_g = barChart.selectAll(".group")
    .data(dataset)
    .enter().append("g")
    .attr("class", function(d) {
      return 'group group-' + d.key;
    })
    .attr("transform", function(d) {
      return "translate(" + x_groups(d.key) + ",0)";
    });

  var categories_g = groups_g.selectAll(".category")
    .data(function(d) {
      //console.log(d.key);
      return d.values;
    })
    .enter().append("g")
    .attr("class", function(d) {
      return 'category category-' + d.key;
    })
    .attr("transform", function(d) {
      return "translate(" + x_categories(d.key) + ",0)";
    })
  

  var rects = categories_g.selectAll('.rect')
    .data(function(d) {
      //console.log(m);
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
      return barChartHeight - y(d.Total);
    })
    .on("mouseover",mouseover)
    .on("mouseout",mouseout);// mouseout is defined below.

    // Create a legend - need to make this dynamic to account for other charts (not Intake)
    barChart.append("rect")
        .attr('height',15)
        .attr('width',15)
        .attr("transform","translate(" + (barChartWidth+10) + "," + (40) +")")
        .attr('fill','#107386');
    
    barChart.append("rect")
        .attr('height',15)
        .attr('width',15)
        .attr("transform","translate(" + (barChartWidth+10) + "," + (20) +")")
        .attr('fill','#CF1264');
    
    barChart.append("rect")
        .attr('height',15)
        .attr('width',15)
        .attr("transform","translate(" + (barChartWidth+10) + "," + (0) +")")
        .attr('fill','#681E70');
    
    barChart.append("rect")
        .attr('height',15)
        .attr('width',15)
        .attr("transform","translate(" + (barChartWidth+10) + "," + (-20) +")")
        .attr('fill','#ff8c00');

    barChart.append("text")
        .attr("transform","translate(" + (barChartWidth+40) + "," + (55) +")")
        .text('Approved')
        .attr('font-family', 'tahoma')
        .attr('font-size',14); 
    
    barChart.append("text")
        .attr("transform","translate(" + (barChartWidth+40) + "," + (35) +")")
        .text('Rejected')
        .attr('font-family', 'tahoma')
        .attr('font-size',14); 

    barChart.append("text")
        .attr("transform","translate(" + (barChartWidth+40) + "," + (15) +")")
        .text('Filed by Law Enforcement (Narcotics)')
        .attr('font-family', 'tahoma')
        .attr('font-size',14); 
    
    barChart.append("text")
        .attr("transform","translate(" + (barChartWidth+40) + "," + (-5) +")")
        .text('Other')
        .attr('font-family', 'tahoma')
        .attr('font-size',14); 
    
    barChart.append("text")
        .attr("transform","translate(" + 0 + "," + (barChartHeight+40) +")")
        .text("Source: Cook County State Attorney's Office Data Portal")
        .attr('font-family', 'tahoma')
        .attr('font-size',12); 
    

};

function mouseover(d){  // utility function to be called on mouseover.
  gender = d.Gender;
  race = d.Race;
       
  // call update functions of pie-chart and legend.    
pC.update(gender,race,"on");
}

function mouseout(d){
  pC.update(gender,race,"off");

}

var pC = {};

pC.update = function(gender,race, mouse){

  var w = 170;
  var h = 170;

  var outerRadius = w/2;
  var innerRadius = w/4;
  var arc = d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius);
  
  var pie = d3.pie().value(function(d) { return d.value ;} );

  // Set up groups
  gender_chart_x = pieChartsWidth * 4 + margin.left;

  var arcs_gender = svg
    .append("g")
    .attr("class", "pie")
    .attr('width',pieChartsWidth)
    .attr('height',pieChartsHeight)
    .attr("transform", "translate(" + gender_chart_x + "," + barChartHeight*1.4 + ")")
    .selectAll("g.arc")
    .data(pie(gender))
    .enter()
    .append("g")
    .attr("class","arc")
    .attr("transform", "translate(" + +outerRadius + "," + +outerRadius + ")");

  
  var arcs_race = svg
    .append("g")
    .attr("class", "pie")
    .attr('width',pieChartsWidth)
    .attr('height',pieChartsHeight)
    .attr("transform", "translate(" + margin.left + "," + barChartHeight*1.4 + ")")
    .selectAll("g.arc")
    .data(pie(race))
    .enter()
    .append("g")
    .attr("class","arc")
    .attr("transform", "translate(" + +outerRadius + "," + +outerRadius + ")");

  if (mouse === "on") {
    

    // Draw arcs paths

    // fix labels to look like this and add values: http://bl.ocks.org/dbuezas/9306799
    arcs_gender.append("path")
        .attr("fill",function(d,i) {
          return color_gender(i);
        })
        .attr("d",arc)
        ;
    
    svg
    .append("g")
    .attr("class", "pie title")
    .append("text")
    .attr("transform", "translate(" + gender_chart_x+ "," + barChartHeight*1.37 + ")")
    .text("Gender Breakdown")
    .attr('font-family', 'tahoma')
        .attr('font-size',12);

    arcs_gender.append("text")
              .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
              })
              .attr("text-anchor","middle")
              .attr('font-family', 'tahoma')
              .attr('font-size',12)
              .text(function(d) {
                //console.log(d.data.key);
                return d.data.key
              })

    arcs_race.append("path")
        .attr("fill",function(d,i) {
          return color_race(i);
        })
        .attr("d",arc);
    
    svg
        .append("g")
        .attr("class", "pie title")
        .append("text")
        .attr("transform", "translate(" + margin.left + "," + barChartHeight*1.37 + ")")
        .text("Race Breakdown")
        .attr('font-family', 'tahoma')
        .attr('font-size',12);
    
    // NEED TO FIX OVERLAPPING LABELS
    arcs_race.append("text")
        .attr("transform", function(d) {
          return "translate(" + arc.centroid(d) + ")";
        })
        .attr('font-family', 'tahoma')
        .attr('font-size',12)
        .attr("text-anchor","middle")
        .text(function(d) {
          //console.log(d.data.key);
          return d.data.key
        })

  }

  else if (mouse === "off") {
    d3.selectAll(".pie")
      .transition()
      .duration(1)
      .attr('opacity',0)
      .remove();
  }
};

/*

next steps 9/11/19:
- add dispositions and sentencing charts 
- add offense category breakdown
- add buttons/ functionality to switch between bar charts
- make legends for bar chart and pie charts dynamic (or fix labels for pie charts to not overlap)
- add ability to keep pie charts visible e.g. by click on a given bar so can hover over pie chart
to see values and %'s 

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


