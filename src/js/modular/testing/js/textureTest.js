let textureSVG = d3.select("#textureContainer")

var t = textures.lines()
  .orientation("diagonal")
  .size(10)
  .strokeWidth(2)
  .stroke("darkorange")
  .background("firebrick");

textureSVG.call(t);

let rect = textureSVG.append('rect')
    // .attr('fill', 'yellow')
    .attr("fill", t.url())
    // .attr('stroke', 'black')
    .attr('x', 50)
    .attr('y', 50)
    .attr('height', 50)
    .attr('width', 50)


