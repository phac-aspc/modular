//https://observablehq.com/@d3/path-tween
//pathTween test
function pathTween(d1, precision) {
  return function() {
    console.log("this", this)
    const path0 = this;
    const path1 = path0.cloneNode();
    path1.setAttribute("d", d1);
    const n0 = path0.getTotalLength();
    const n1 = path1.getTotalLength();

    // Uniform sampling of distance based on specified precision.
    const distances = [0];
    const dt = precision / Math.max(n0, n1);
    let i = 0; while ((i += dt) < 1) distances.push(i);
    distances.push(1);

    // Compute point-interpolators at each distance.
    const points = distances.map((t) => {
      const p0 = path0.getPointAtLength(t * n0);
      const p1 = path1.getPointAtLength(t * n1);
      return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
    });

    return (t) => t < 1 ? "M" + points.map((p) => p(t)).join("L") : d1;
  };
}
const d0 = "M0,0c100,0 0,100 100,100c100,0 0,-100 100,-100";
const d1 = "M0,0c100,0 0,100 100,100c100,0 0,-100 100,-100c100,0 0,100 100,100";

// const l0 = "M176.66666666666669,266.0029663639365L253.33333333333334,278.9631356757057L330,284.1820384291848L406.6666666666667,268.8467294759349L483.33333333333337,307.3257008057215L560,60"
// const l1 = "M100,60L176.66666666666669,94.56790123456791L253.33333333333334,124.19753086419753L330,168.641975308642L406.6666666666667,195.30864197530857L483.33333333333337,300.98765432098764L560,264.4444444444444"

const width = 928;
const height = 500;
const svg = d3.select("#pathWrapper")
.append('svg')
.attr("width", width)
.attr("height", height)
.attr("viewBox", [0, 0, width, height])
.attr("style", "max-width: 100%; height: auto;");

let path = svg.append("path")
.attr("transform", "translate(180,150)scale(2,2)")
.attr("fill", "none")
.attr("stroke", "currentColor")
.attr("stroke-width", 1.5)
.attr("d", d0)

let bool = true;

d3.select("#updatePath").on('click', ()=>{
    path
        .transition()
        .duration(1000)
        .attrTween("d", pathTween(bool ? d1 : d0, 4))
    
    bool = !bool;

})

  
  
