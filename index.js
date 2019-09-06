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

*/


// Code by: Damini Sharma
// For this reverse scatterplot, I heavily referenced Andrew McNutt's solutions to the week7 D3 exercise
// and code showed by Alex Engler in class
// To run my files I did the following:
    // npm install -g live-server
    // then: live-server


// Set the dimensions of my plot
const height = 700;
const width = 700;
const margin = {top: 130, left: 70, right: 70, bottom: 0};

const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.bottom - margin.top;

// Load the dataset and catch any errors while loading data
// https://stackoverflow.com/questions/49768165/code-within-d3-json-callback-is-not-executed
d3.json("sentence_dataset.json")
  .then(function(data){
      console.log(data);
      makeScatterplot(data);
  })
  .catch(function(error){
      if (error) {
          console.log(error)
          console.log("CHECK THE DATASET NAME!")
      } else {
          console.log(data)
      }
  });


function makeScatterplot(data) {
    // Set my scales to transform data into something I can plot on my chart
    const xScale = d3.scaleLinear()
       .domain([0, d3.max(data, function(d) {return d.case_length_total;})])
       .range([plotWidth,margin.left]) 
       .nice();

    const yScale = d3.scaleLinear()
       .domain([0,d3.max(data, function(d) {return d.sentence_length})])
       .range([margin.top,plotHeight])
       .nice();   

    // Append my svg element and set its height and width
    svg = d3.select('.first')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    // Check that my scales are working as expected
    console.log(yScale(data[1].sentence_length) );
    console.log(xScale(data[1].case_length_total) );

    // Plot the circles separately for white, black, and hispanic
    dots_w = svg.selectAll('.dot_white')
                .data(data)
                .enter()
                .append("circle")
                .filter(function(d) {return d.race == "White"})
                .attr('cx', d => xScale(d.case_length_total))
                .attr('cy', d => yScale(d.sentence_length))
                .attr('r',5)
                .attr('class', 'dot_white');

    dots_b = svg.selectAll('.dot_black')
                .data(data)
                .enter()
                .append("circle")
                .filter(function(d) {return d.race == "Black"})
                .attr('cx', d => xScale(d.case_length_total))
                .attr('cy', d => yScale(d.sentence_length))
                .attr('r',5)
                .attr('class', 'dot_black');
    
    dots_h = svg.selectAll('.dot_hispanic')
                .data(data)
                .enter()
                .append("circle")
                .filter(function(d) {return d.race == "Hispanic"})
                .attr('cx', d => xScale(d.case_length_total))
                .attr('cy', d => yScale(d.sentence_length))
                .attr('r',5)
                .attr('class', 'dot_hispanic');

    // Create my axess
    var xAxis = d3.axisTop(xScale)
    var yAxis = d3.axisRight(yScale)

    svg.append('g')
        .call(xAxis)
        .attr('transform', `translate(0,${margin.top})`);

    svg.append('g')
        .call(yAxis)
        .attr('transform', `translate( ${plotWidth},0)`);

    // Add labels to my axes
    svg.append("text")
        .attr("y",100)
        .attr("x",plotWidth/2)
        .style("text-anchor", "middle")
        .text("Case Length")
        .attr('font-family', 'tahoma')
        .attr('font-size',12);  
    
    svg.append("text")
        .attr("transform", "rotate(90)")
        .attr("x",plotHeight/2 + 40)
        .attr("y",0- (plotWidth + 50))
        .style("text-anchor", "middle")
        .text("Sentence Length")
        .attr('font-family', 'tahoma')
        .attr('font-size',12);

    // Add a title and subtitle
    svg.append("text")
        .attr("y",50)
        .attr("x",margin.left)
        .style("text-anchor", "left")
        .text("Longer Case Lengths Correlated With Longer Sentences")
        .attr('font-size', 20)
        .attr('font-family', 'tahoma'); 
    
    svg.append("text")
        .attr("y",75)
        .attr("x",margin.left)
        .style("text-anchor", "left")
        .text("Case Lengths and Sentence Lengths By Race")
        .attr('font-size', 15)
        .attr('font-family', 'tahoma'); 

    // Create a legend
    svg.append("rect")
        .attr('height',15)
        .attr('width',15)
        .attr('x',margin.left)
        .attr('y',plotHeight-190)
        .attr('fill','#CF1264');
    
    svg.append("rect")
        .attr('height',15)
        .attr('width',15)
        .attr('x',margin.left)
        .attr('y',plotHeight-150)
        .attr('fill','#681E70');
    
    svg.append("rect")
        .attr('height',15)
        .attr('width',15)
        .attr('x',margin.left)
        .attr('y',plotHeight-110)
        .attr('fill','#107386');

    svg.append("text")
        .attr('x',margin.left)
        .attr('y',plotHeight-200)
        .text('Race')
        .attr('font-family', 'tahoma')
        .attr('font-size',14); 

    svg.append("text")
        .attr('x',margin.left + 30)
        .attr('y',plotHeight-95)
        .text('White')
        .attr('font-family', 'tahoma')
        .attr('font-size',12); 
    
    svg.append("text")
        .attr('x',margin.left + 30)
        .attr('y',plotHeight-135)
        .text('Black')
        .attr('font-family', 'tahoma')
        .attr('font-size',12);
    
    svg.append("text")
        .attr('x',margin.left + 30)
        .attr('y',plotHeight-175)
        .text('Hispanic')
        .attr('font-family', 'tahoma')
        .attr('font-size',12);
    
    // Add a source line
    svg.append("text")
        .attr('x',300)
        .attr('y',plotHeight + 40)
        .text("Source: Cook County State Attorney's Office Data Portal")
        .attr('font-family', 'tahoma')
        .attr('font-size',12);
}
