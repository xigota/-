const width = 960;
const height = 900;

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 20) + ")");

const cluster = d3.cluster().size([360, width / 2 - 120]);

d3.json("modules.json", (error, data) => {
  if (error) throw error;

  const root = d3
    .hierarchy(data)
    .eachBefore(d => {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sort((a, b) => {
      return a.height - b.height || a.data.id.localeCompare(b.data.id);
    });

  cluster(root);

  const link = g
    .selectAll(".link")
    .data(root.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d => {
      return (
        "M" +
        project(d.x, d.y) +
        "C" +
        project(d.x, (d.y + d.parent.y) / 2) +
        " " +
        project(d.parent.x, (d.y + d.parent.y) / 2) +
        " " +
        project(d.parent.x, d.parent.y)
      );
    });

  const node = g
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", d => {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", d => "translate(" + project(d.x, d.y) + ")");

  node.append("circle").attr("r", 2.5);

  node
    .append("text")
    .attr("dy", "0.31em")
    .attr("x", d => (d.x < 180 === !d.children ? 6 : -6))
    .style("text-anchor", d => (d.x < 180 === !d.children ? "start" : "end"))
    .attr("transform", d => "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")")
    .text(d => d.data.id.substring(d.data.id.lastIndexOf(".") + 1));
});

function project(x, y) {
  const angle = (x - 90) / 180 * Math.PI;
  const radius = y;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}
