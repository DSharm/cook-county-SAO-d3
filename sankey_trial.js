var margin = {top: 40,right: 40,bottom: 25,left: 40};
var width_sankey = 900;
var height_sankey = 450;
// var barChartWidth = width - margin.right;
// var barChartHeight = height  - margin.top*9;
// var pieChartsWidth = 0.1 * width;
// var pieChartsHeight = 0.5 * barChartHeight;

// https://observablehq.com/@mbostock/flow-o-matic
var starting_year = "2019";

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scaleOrdinal().range(["#107386", "#CF1264", "#681E70", "#ff8c00","#00ffc8"]);

var sankeyColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264", "#681E70", "#ff8c00","#00ffc8"]);

var graph;

var sankey = d3.sankey().nodeWidth(20)
.nodePadding(50)
.size([(width_sankey-margin.right), height_sankey]);

freqCounter =1;

// var path = sankey.link();

d3.json("processed_data/sent_intake_dispo_join_final.json")
.then(function(data) {
    dataset = data;
    make_sankey(dataset,starting_year);    
});

function make_sankey(data, year) {
    data_nested = d3.nest()
            .key(function(d) {
                return d.receive_year;
            })
            .entries(data)
    //console.log(data_nested);


    const svg = d3.select(".sankey")
    .append('div')
    .attr('id',"Sankey")
    .append('svg')
      .style("background", "#fff")
      .attr("width", width_sankey)
      .attr("height", height_sankey);
      
    // const svg = d3.select("#Sankey")
    //   .append('svg')
    //     .style("background", "#fff")
    //     .style("width", width)
    //     .style("height", height);  

//     var svg = d3.select("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      graph = {"nodes" : [], "links" : []};

    //console.log(graph);
   // console.log(data_nested["2019"]);
    data_nested.forEach(function (d) {
        if (d.key === year) {
            d.values.forEach(function (d) {
                //console.log(d);
                graph.nodes.push({ "name": d.source });
                graph.nodes.push({ "name": d.target });
                graph.links.push({ "source": d.source,
                                    "target": d.target,
                                    "value": +d.value,
                                    "color": "#A9A9A9"  });
            })
        }
        
      });
      //console.log(graph);

      // return only the distinct / unique nodes
      // console.log(graph.nodes);
      graph.nodes = d3.map(graph.nodes, function(d) {return d.name;}).keys()

      // graph.nodes = d3.keys(d3.nest()
      //   .key(function (d) { 
      //     //console.log(d); 
      //     return d.name; 
      //   }));
      // //   .map(graph.nodes));

      //console.log(graph);
      

      // loop through each link replacing the text with its index from node
      graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        // if (graph.links[i].value < 100) {
        //     console.log(graph.links[i].value);
        //     console.log(graph.links[i].color);

        //     //graph.links[i].color = "#ffffff";
        // } 
      });

      //console.log(graph);

      //now loop through each nodes to make nodes an array of objects
      // rather than an array of strings
      graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d };
      });

    
        const {nodes, links} = sankey({
            nodes: graph.nodes.map(d => Object.assign({}, d)),
            links: graph.links.map(d => Object.assign({}, d))
        });
        //console.log(nodes);
    
    // links[1].source.x0 = 200;
    // links[1].source.x1 = 210;
    links.forEach(function(d) {
       //console.log(d)
        if (d.target.name === "Conviction") {
            conviction_x0 = d.target.x0;
            conviction_x1 = d.target.x1;
        }

        if (d.target.name === "No Conviction") {
            d.target.x0 = conviction_x0;
            d.target.x1 = conviction_x1;
        }

    })

    var node = svg.append("g")
    .attr("class", "nodes")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
  .selectAll("g");

  node = node
    .data(nodes)
    .enter().append("g")
  	// .call(d3.drag()
    //         .subject(function(d){return d})
    //         .on('start', function () { this.parentNode.appendChild(this); })
    //         .on('drag', dragmove));


//     var node = svg.append("g").selectAll(".node")
//       .data(nodes)
//       .join("g")
//       .attr("class", "node")
// //    nodes = svg.append("g")
// //         .selectAll(".node")
// //         .data(nodes)
// //         .attr("class", "node")
//         .call(d3.drag()
//         .subject(function(d) {
//           return d;
//         })
//         .on("start", function() {
//           this.parentNode.appendChild(this);
//         })
//         .on("drag", dragmove));


        node.append('rect')
        .attr("x", d => d.x0 + 1)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0 - 2)
        .attr("fill", d => {
            //console.log(d.name)
            if (d.name === "Case Participants") {
                return sankeyColor(1);
            }
            else if (d.name === "Filed by LEA" || 
                    d.name === "Rejected" ||
                    d.name === "Approved" ||
                    d.name === "Continued Investigation" ||
                    d.name === "Other") {
                        return sankeyColor(2)
                    }
            else if (d.name === "No Conviction" || 
                    d.name === "Conviction" ||
                    d.name === "Pending" ) {
                return sankeyColor(3)
            }
            else if (d.name === "Pending Sentence" || 
                    d.name === "Jail" ||
                    d.name === "Other Sentence" ||
                    d.name === "Prison" ||
                    d.name === "Probation"
                    ) {
                return sankeyColor(4)
            }
            // let c;
            // for (const link of d.sourceLinks) {
            // if (c === undefined) c = link.color;
            // else if (c !== link.color) c = null;
            // }
            // if (c === undefined) for (const link of d.targetLinks) {
            // if (c === undefined) c = link.color;
            // else if (c !== link.color) c = null;
            // }
            // return (d3.color(c) || d3.color(color)).darker(0.5);
        })
        .append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()}`);
        

        // function dragmove(d) {
        //     d3.select(this)
        //       .attr("transform", 
        //             "translate(" 
        //                + d.x + "," 
        //                + (d.y = Math.max(
        //                   0, Math.min(height - d.dy, d3.event.y))
        //                  ) + ")");
        //     sankey.relayout();
        //     link.attr("d", path);
          

    const link = svg
        .append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(links)
        .join("g")
        .attr("stroke", function(d) {
            if (d.value < 100) {
                return d3.color("white");
            }
            else {
                return d3.color(d.color);
            }
        })

//        .attr("stroke", d => d3.color(d.color) || color)
        .style("mix-blend-mode", "multiply");
    
        //console.log(links)

    link
        .append("path")
        .attr('class','link')
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width));

    link.append("title")
        .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()}`);

    svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width_sankey / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width_sankey / 2 ? "start" : "end")
        .text(d => d.name)
        .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);


//    return svg.node();
    // console.log(path.links)

//     var linkExtent = d3.extent(links, function (d) {
//         //console.log(d)
//         return d.value});
//     var frequencyScale = d3.scaleLinear().domain(linkExtent).range([1,100]);
//     var particleSize = d3.scaleLinear().domain(linkExtent).range([1,5]);


//   links.forEach(function (link) {
//     link.freq = frequencyScale(link.value);
//     link.particleSize = 2;
//     link.particleColor = d3.scaleLinear().domain([1,1000]).range([sankeyColor(1), sankeyColor(3)]);
//   })

//   var t = d3.timer(tick, 1000);
//   var particles = [];

//   function tick(elapsed, time) {

//     particles = particles.filter(function (d) {return d.time > (elapsed - 1000)});
//     //console.log(particles)
//     if (freqCounter > 100) {
//       freqCounter = 1;
//     }

//     d3.selectAll(".link")
//     .each(
//       function (d) {
//         if (d.freq >= freqCounter) {
//           var offset = (Math.random() - 0.1) * d.width;
//         //   console.log(offset);
//         //   console.log(d.y0)
//           particles.push({link: d, time: elapsed, offset: offset, path: this})
//         }
//       });

//     particleEdgeCanvasPath(elapsed);
//     freqCounter++;

//   }

//   function particleEdgeCanvasPath(elapsed) {
//     var context = d3.select("canvas").node().getContext("2d")

//     context.clearRect(0,0,1000,1000);

//       context.fillStyle = "gray";
//       context.lineWidth = "1px";
//     for (var x in particles) {
//         var currentTime = elapsed - particles[x].time;
//         var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
        
//         var currentPos = particles[x].path.getPointAtLength(currentPercent)
//         context.beginPath();
//       context.fillStyle = particles[x].link.particleColor(currentTime);
//         context.arc(currentPos.x,currentPos.y + particles[x].offset,particles[x].link.particleSize,0,2*Math.PI);
//         context.fill();
//     }
//   }








}

// function dragmove(d) {

//     var rectY = d3.select(this).select("rect").attr("y");

//     d.y0 = d.y0 + d3.event.dy;

//     var yTranslate = d.y0 - rectY;

//     d3.select(this).attr("transform", 
//               "translate(0" + "," + (yTranslate) + ")");

//     // sankey.update(graph);
//     sankey.relayout();
//     link.attr("d",d3.sankeyLinkHorizontal());
//   }
// Time Slider

var dataTime = d3.range(0, 9).map(function(d) {
    return new Date(2011 + d, 10, 3);
  });
  
  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(300)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(2019, 10, 3))
    .on('onchange', function(val) {
        //console.log(d3.timeFormat('%Y')(val));
        year = d3.timeFormat('%Y')(val);
        d3.selectAll("#Sankey")
              .remove();
        // $("#Sankey").empty();
        // //console.log(year);
        make_sankey(dataset, year);
    
        // val => {
        // d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        // console.log(value);
    });
  
  var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);

//   d3.select("div#slider-time").on("onchange", function(d) {
//     console.log(d);
//     selectValue = this.value;
//     console.log(selectValue);
// })
// d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));