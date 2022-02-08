import { RendererObject } from './renderObject'
import { Vertices, Parities } from './interfaces';
import { COLORS, STRANDS } from './constants';
import { BitMap } from './bitmap';
import { SideBar } from './sidebar';

const nrOfVertices = 25002;
const alpha = 3;
const s = 5;
const p = s;

var renderer: RendererObject;
var bitmapObj: BitMap;
var sideBar: SideBar;

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
                        Fetched: false,
                    }
                )
            }
            else if (parityTo > nrOfVertices) {
                var right_temp = (i + s) % nrOfVertices;
                if (nrOfVertices % s != 0) {
                    var remaining = nrOfVertices % s;
                    var right_temp = (i + s) % (nrOfVertices - remaining);
                    if( right_temp > s) {
                        right_temp = right_temp % s;
                    } 
                }
                //console.log("HStrand")
                //console.log(i, right_temp);
                vertices[vertices.length - 1].Outputs.push(
                    {
                        LeftPos: i,
                        RightPos: right_temp,
                        Strand: STRANDS.HStrand,
                        Color: COLORS.BLUE,
                        Fetched: false,
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
                            Fetched: false,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (nrOfVertices % s != 0) {
                        if (helper == 1) {
                            var temp_node = i;
                            while(temp_node > s) {
                                if (temp_node % s == 1) {
                                    temp_node = temp_node - s * p + (Math.pow(s,2) - 1)
                                }
                                else {
                                    temp_node = temp_node - (s + 1);
                                }
                            }
                            right_temp = temp_node;
                        }
                        else if (helper > 1) {
                            var temp_node = i;
                            while(temp_node > s) {
                                if (temp_node % s == 1) {
                                    temp_node = temp_node - s * p + (Math.pow(s,2) - 1)
                                }
                                else {
                                    temp_node = temp_node - (s + 1);
                                }
                            }
                            right_temp = temp_node
                        }
                    }
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    //console.log("RHStrand")
                    //console.log(i, right_temp);
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                            Fetched: false,
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
                            Fetched: false,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (nrOfVertices % s != 0) {
                        var temp_node = i;
                        while(temp_node > s) {
                            if (temp_node % s == 1) {
                                temp_node = temp_node - s * p + (Math.pow(s,2) - 1)
                            }
                            else {
                                temp_node = temp_node - (s + 1);
                            }
                        }
                        right_temp = temp_node;
                    }
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    //console.log("RHStrand")
                    //console.log(i, right_temp);
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.RHStrand,
                            Color: COLORS.BLUE,
                            Fetched: false,
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
                            Fetched: false,
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (nrOfVertices % s != 0) {
                        var temp_node = i;
                        while(temp_node > s) {
                            if (temp_node % s == 0) {
                                temp_node = temp_node - s * p + Math.pow((s - 1), 2);
                            }
                            else {
                                temp_node = temp_node - (s - 1);
                            }
                        }
                        right_temp = temp_node;
                    }
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    //console.log("LHStrand")
                    //console.log(i, right_temp);
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                            Fetched: false,
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
                            Fetched: false,
    
                        }
                    )
                }
                else if (parityTo > nrOfVertices) {
                    var right_temp = parityTo % nrOfVertices
                    if (nrOfVertices % s != 0) {
                        if (helper > 1) {
                            var temp_node = i;
                            while(temp_node > s) {
                                if (temp_node % s == 0) {
                                    temp_node = temp_node - s * p + Math.pow((s - 1), 2);
                                }
                                else {
                                    temp_node = temp_node - (s - 1);
                                }
                            }
                            right_temp = temp_node
                        }
                        else if (helper == 0) {
                            var temp_node = i;
                            while(temp_node > s) {
                                if (temp_node % s == 0) {
                                    temp_node = temp_node - s * p + Math.pow((s - 1), 2);
                                }
                                else {
                                    temp_node = temp_node - (s - 1);
                                }
                            }
                            right_temp = temp_node
                        }
                    }
                    if (right_temp == 0) {
                        right_temp = 1
                    }
                    //console.log("LHStrand")
                    //console.log(i, right_temp);
                    vertices[vertices.length - 1].Outputs.push(
                        {
                            LeftPos: i,
                            RightPos: right_temp,
                            Strand: STRANDS.LHStrand,
                            Color: COLORS.BLUE,
                            Fetched: false,
                        }
                    )
                }
            }
    
        }
    }
    return vertices;
}

function GetRandomColorString(): number {
    var dice = Math.random();
    if (dice < 1)
        return COLORS.GREEN
    return COLORS.RED
}

function init() {
    var data = readFile();
    renderer = new RendererObject(alpha, s, p, data, 4);
    renderer.initObjects();
    renderer.createTwoDimView();
    renderer.animate();

    bitmapObj = new BitMap(alpha, s, p, data);
    bitmapObj.Draw();

    sideBar = new SideBar(alpha, s, p, data);

    window.addEventListener('resize', () => renderer.onWindowResize(), false);

    document.getElementById("btn-2d")?.addEventListener("click", () => renderer.createTwoDimView());
    document.getElementById("btn-lattice")?.addEventListener("click", () => renderer.createLattice());
    document.getElementById("btn-torus")?.addEventListener("click", () => renderer.createTorus());
    document.getElementById("btn-ghostgroup")?.addEventListener("click", () => renderer.show_hide_ghostvertcies());
    document.getElementById("bitmap-canvas-container")?.addEventListener("click", (event: MouseEvent) => {
        let index = bitmapObj.GetIndexFromCoord(event.offsetX, event.offsetY);
        renderer.GoTo(index);
    })
    document.getElementById("random")?.addEventListener("click", () => {
        var randomIndex = generateRandomNumber(0, 250);
        data[randomIndex].Color = COLORS.RED;
        bitmapObj.updateVertex(randomIndex);
        renderer.UpdateVertex(randomIndex);
        sideBar.UpdateInfo();
    });
}

function generateRandomNumber (min: number, max: number)  {
    return Math.floor(Math.random() * (max - min) + min);
      };

init();