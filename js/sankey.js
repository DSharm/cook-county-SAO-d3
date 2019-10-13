
var margin_sankey = 20;
var width_sankey = 800;
var height_sankey = 320;

// https://observablehq.com/@mbostock/flow-o-matic
var starting_year = "2018";

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scaleOrdinal().range(["#107386", "#CF1264", "#681E70", "#ff8c00","#00ffc8"]);

var sankeyColor = d3.scaleOrdinal()
  .range(["#107386", "#CF1264", "#681E70", "#ff8c00","#00ffc8"]);

var graph;

var sankey = d3.sankey().nodeWidth(20)
.nodePadding(50)
.size([(width_sankey-margin_sankey), height_sankey]);

freqCounter =1;

d3.json("processed_data/sent_intake_dispo_join_final.json")
.then(function(data) {
    sankey_data = data;
    make_sankey(sankey_data,starting_year);    
});

function make_sankey(data, year) {
    data_nested = d3.nest()
            .key(function(d) {
                return d.receive_year;
            })
            .entries(data)
    //console.log(data_nested);


    const svg = d3.select("#sankey")
    .append('svg')
    .attr('id',"Sankey")
    .style("background", "#fff")
    .attr("width", (width_sankey+margin_sankey)+"px")
    .attr("height", (height_sankey+margin_sankey)+"px")
    .append('g')
    .attr("transform","translate(30,10)")
    
      graph = {"nodes" : [], "links" : []};

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
      graph.nodes = d3.map(graph.nodes, function(d) {return d.name;}).keys()


      // loop through each link replacing the text with its index from node
      graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
      });

      graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d };
      });

    
        const {nodes, links} = sankey({
            nodes: graph.nodes.map(d => Object.assign({}, d)),
            links: graph.links.map(d => Object.assign({}, d))
        });
        console.log(nodes);
    
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

    // save default node positions from 2018
    if (year === "2018") {
      links.forEach(function(d) {
        //console.log(d)
         if (d.target.name === "Approved") {
             approved_x0 = d.target.x0;
             approved_x1 = d.target.x1;
             approved_y0 = d.target.y0;
             approved_y1 = d.target.y1;
         }

         if (d.target.name === "Continued Investigation") {
            ci_x0 = d.target.x0;
            ci_x1 = d.target.x1;
            ci_y0 = d.target.y0;
            ci_y1 = d.target.y1;
        }

        if (d.source.name === "Continued Investigation") {
          ci_x0 = d.source.x0;
          ci_x1 = d.source.x1;
          ci_y0 = d.source.y0;
          ci_y1 = d.source.y1;
      }

        if (d.target.name === "Filed by LEA") {
            lea_x0 = d.target.x0;
            lea_x1 = d.target.x1;
            lea_y0 = d.target.y0;
            lea_y1 = d.target.y1;
        }

        if (d.source.name === "Filed by LEA") {
          lea_x0 = d.source.x0;
          lea_x1 = d.source.x1;
          lea_y0 = d.source.y0;
          lea_y1 = d.source.y1;
      }



        if (d.target.name === "Other") {
          other_x0 = d.target.x0;
          other_x1 = d.target.x1;
          other_y0 = d.target.y0;
          other_y1 = d.target.y1;
      }
        if (d.target.name === "Rejected") {
          rej_x0 = d.target.x0;
          rej_x1 = d.target.x1;
          rej_y0 = d.target.y0;
          rej_y1 = d.target.y1;
      }

 
     })

    }

    links.forEach(function(d) {
      console.log(d)
        if (d.target.name === "Approved") {
          d.target.x0 = approved_x0;
          d.target.x1 = approved_x1;
          d.target.y0 = approved_y0;
          d.target.y1 = approved_y1;
        }

        if (d.target.name === "Continued Investigation") {
          d.target.x0 = ci_x0;
          d.target.x1 = ci_x1;
          d.target.y0 = ci_y0;
          d.target.y1 = ci_y1;
        }

        if (d.source.name === "Continued Investigation") {
          d.source.x0 = ci_x0;
          d.source.x1 = ci_x1;
          d.source.y0 = ci_y0;
          d.source.y1 = ci_y1;
        }

      if (d.target.name === "Filed by LEA") {
          d.target.x0 = lea_x0;
          d.target.x1 = lea_x1;
          d.target.y0 = lea_y0;
          d.target.y1 = lea_y1;

        }

        if (d.source.name === "Continued Investigation") {
          d.source.x0 = lea_x0;
          d.source.x1 = lea_x1;
          d.source.y0 = lea_y0;
          d.source.y1 = lea_y1;
        }
      
      if (d.target.name === "Other") {
        d.target.x0 = other_x0;
        d.target.x1 = other_x1;
        d.target.y0 = other_y0;
        d.target.y1 = other_y1;

      }
      
      if (d.target.name === "Rejected") {

        d.target.x0 = rej_x0;
        d.target.x1 = rej_x1;
        d.target.y0 = rej_y0;
        d.target.y1 = rej_y1;
      }

   })


    var node = svg.append("g")
    .attr("class", "nodes")
    .attr("font-family", "tahoma")
    .attr("font-size", 10)
  .selectAll("g");

  node = node
    .data(nodes)
    .enter().append("g")

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
                    d.name === "Pending Conviction" ) {
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
            
        })
        .append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()}`);          

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
        .style("font", "10px tahoma")
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

}

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
    .default(new Date(2018, 10, 3))
    .on('onchange', function(val) {
        //console.log(d3.timeFormat('%Y')(val));
        year = d3.timeFormat('%Y')(val);
        d3.selectAll("#Sankey")
                
              .remove();
        make_sankey(sankey_data, year);
    
    });
  
  var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 600)
    .attr('height', 70)
    .append('g')
    .attr('transform', 'translate(250,30)');

  gTime.call(sliderTime);

// Annotations
// https://bl.ocks.org/susielu/23dc3082669ee026c552b85081d90976
const type = d3.annotationCallout

const annotations = [{
  note: {
    bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
    title: "Intake"
  },
  x: 260, 
  y: 0,
  dy: (-30),
  dx: 0
},{
    note: {
        title: "All Case Participants"
      },
      x: 8, 
      y: 20,
      dy: (-35),
      dx: 0
},{
    note: {
        title: "Dispositions"
      },
      x: 512, 
      y: 0,
      dy: (-35),
      dx: 0
},{
    note: {
        title: "Sentencing"
      },
      x: 768, 
      y: 0,
      dy: (-35),
      dx: (-0.1)
}]

const makeAnnotations = d3.annotation()
  .editMode(true)
  .notePadding(1)
  .type(type)
  .annotations(annotations)

d3.select("#sankey")
    .append("svg")
    .attr('id',"SankeyLabels")
    .style("background", "#fff")
    .attr("width", (width_sankey+margin_sankey)+"px")
    .attr("height", (55)+"px")
    .append('g')
    .attr("transform","translate(30,60)")
    .attr("class", "annotation-group")
    .call(makeAnnotations)