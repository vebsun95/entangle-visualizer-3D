import { RendererObject } from './renderObject'
import { Vertices, Parities } from './interfaces';
import { COLORS, STRANDS } from './constants';
import { BitMap } from './bitmap';

const nrOfVertices = 250000;
const alpha = 3;
const p = 5;
const s = 5;

function readFile() {
    var vertices: Vertices[] = [];
    
    for (let i = 1; i < nrOfVertices + 1; i++) {
        vertices.push(
            {
                Label: i.toString(),
                Color: GetRandomColorString(),
                Outputs: [],
            }
        )
        for (let j = 1; j < 2; j++) {
            let parityTo = i + s;
    
            // -- H Strand --
            if (parityTo <= nrOfVertices) {
                // horizontal
                vertices[vertices.length - 1].Outputs.push(
                    {
                        LeftPos: i,
                        RightPos: i + s,
                        Strand: STRANDS.HStrand,
                        Color: COLORS.BLUE,
                    }
                )
            }
            else if (parityTo > nrOfVertices) {
                var right_temp = (i + s) % nrOfVertices
                vertices[vertices.length - 1].Outputs.push(
                    {
                        LeftPos: i,
                        RightPos: right_temp,
                        Strand: STRANDS.HStrand,
                        Color: COLORS.BLUE,
                    }
                )
            }
    
            // -- RH Strand --
            let helper = i % s;
            // RH Top & middle
            if (helper >= 1) {
                parityTo = i + s + 1
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
    
                }
            }
            // RH Bottom
            else if (helper == 0) {
                parityTo = i + (s * p) - ((s * s) - 1)
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
            }
            // -- LH Strand --
            if (helper == 1) {
                // top
                parityTo = i + s * p - Math.pow((s - 1), 2)
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
            }
            else if (helper == 0 || helper > 1) {
                // central && bottom
                parityTo = i + s - 1
                if (parityTo <= nrOfVertices) {
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: parityTo,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
    
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                        }
                    )
                }
            }
    
        }
    }

    
    return vertices;
}

function bitMap() {

    var bitMapCanvas = <HTMLCanvasElement> document.getElementById("bitmap");
    console.log(bitMapCanvas.getAttribute("width"));
    console.log(bitMapCanvas.getAttribute("height"));

    // const colors = [
    //     [0,255,0],
    //     [255,0,0],
    //     [0,0,255],
    //     [220,220,220]
    // ]

    // const width = 80;
    // const height = 80;
    // var bitMapCanvas = <HTMLCanvasElement> document.getElementById("bitmap");
    // bitMapCanvas.setAttribute("height", height.toString());
    // bitMapCanvas.setAttribute("width", width.toString());
    // var ctx = bitMapCanvas.getContext('2d');
    // var imageData = ctx?.createImageData(width, height);
    // const data = imageData?.data;

    // var color 

    // for (var i = 0; i < data!.length; i += 4) {
    //     color = colors[GetRandomColor()];
    //     data![i]     = color[0];  // red
    //     data![i + 1] = color[1];  // green
    //     data![i + 2] = color[2];  // blue
    //     data![i + 3] = 255;       // alpha
    // }
    // ctx!.putImageData(imageData!, 0, 0);
}

function GetRandomColor(): number {
    var dice = Math.random();
    if (dice < 0.7)
        return 0
    if (dice < 0.8)
        return 1
    if (dice < 0.9)
        return 2
    return 3
}

function GetRandomColorString(): number {
    var dice = Math.random();
    if (dice < 0.7)
        return COLORS.GREEN
    if (dice < 0.8)
        return COLORS.RED
    if (dice < 0.9)
        return COLORS.GREY
    return COLORS.BLUE
}

function init() {
    let data = readFile();
    const renderer = new RendererObject(3, 5, 5, data, 4);
    renderer.initObjects(1);
    renderer.createTwoDimView();
    renderer.animate();

    const wqerqwe = new BitMap(3, 5, 5, data);
    wqerqwe.Draw()

    window.addEventListener('resize', () => renderer.onWindowResize(), false);

    document.getElementById("btn-2d")?.addEventListener("click", () => renderer.createTwoDimView());
    document.getElementById("btn-lattice")?.addEventListener("click", () => renderer.createLattice());
    document.getElementById("btn-torus")?.addEventListener("click", () => renderer.createTorus());
}

init();