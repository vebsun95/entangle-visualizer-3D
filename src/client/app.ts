import { BitMap } from "./bitmap";
import { MerkelTreeViewer } from "./merkelTreeViewer";
import { RendererObject } from "./renderObject";
import { SideBar } from "./sidebar";



import { VertexJSON, ContentJSON, Vertex, ParityJSON } from "./interfaces";
import { COLORS, STRANDS } from "./constants";



export class App {
    renderer = new RendererObject();
    bitMap = new BitMap();
    merkelTree = new MerkelTreeViewer();
    sideBar = new SideBar();
    vertices: Vertex[] = []

    constructor() {
        this.AddEventListener();
    }

    TestDev() {
        dispatchEvent(new CustomEvent("new-file-upload", {detail: {newContent: JSON.parse(devContent)}}))
    }

    UpdateData(alpha: number, s: number, p: number) {

        this.vertices[0].Color = COLORS.RED;
        this.vertices[this.vertices[0].Parent -1].DamagedChildren.push(0);

        this.vertices[this.vertices.length - 2].Color = COLORS.RED;
        this.vertices[this.vertices[this.vertices.length - 2].Parent -1].DamagedChildren.push(this.vertices.length - 2);

        this.vertices[this.vertices.length - 3].Color = COLORS.RED;
        this.vertices[this.vertices[this.vertices.length - 3].Parent -1].DamagedChildren.push(this.vertices.length - 3);

        this.renderer.UpdateData(alpha, s, p, this.vertices);
        this.bitMap.UpdateData(alpha, s, p, this.vertices);
        this.merkelTree.UpdateData(alpha, s, p, this.vertices);
        this.sideBar.UpdateData(alpha, s, p, this.vertices);

        this.renderer.HandleUpdatedData();
        this.bitMap.HandleUpdatedData();
        this.merkelTree.HandleUpdatedDate();

    }

    AddEventListener() {
        window.addEventListener("bitmap-clicked", this.HandleBitMapClicked.bind(this) as EventListener);
        window.addEventListener("new-file-upload", this.HandleNewFileUploaded.bind(this) as EventListener);
        window.addEventListener('resize', this.HandleWindowResize.bind(this), false);
    }
    HandleBitMapClicked(e : CustomEvent) {
        this.renderer.GoTo(e.detail.vertexIndex)
    }
    HandleNewFileUploaded(e : CustomEvent) {
        let content : ContentJSON = e.detail.newContent;

        let alpha = content.config.alpha;
        let s = content.config.s;
        let p = content.config.p;

        this.vertices = Array(content.config.dataElements);

        var vertexJson: VertexJSON;
        var parityJson: ParityJSON;
        for(var i=0 ;i < this.vertices.length; i++){
            vertexJson = content.dataTree[i]
            this.vertices[i] = {
                Addr: vertexJson.addr,
                Label: vertexJson.index.toString(),
                Color: COLORS.GREY,
                Outputs: Array(alpha),
                Index: vertexJson.index,
                Depth: vertexJson.depth,
                Parent: vertexJson.parent,
                Replication: vertexJson.replication,
                Children: [],
                DamagedChildren: [],
            }
            for(var j=0; j<alpha; j++) {
                parityJson = content.parityTrees[j][i]
                this.vertices[i].Outputs[j] = {
                    LeftPos: parityJson.index,
                    RightPos: parityJson.to,
                    Strand: j + 1,
                    Color: COLORS.GREY,
                    Fetched: false,
                }
                
            }
        }
        for(i=0; i < this.vertices.length - 1; i++) {
                this.vertices[this.vertices[i].Parent - 1].Children.push(i)
        }
        this.UpdateData(alpha, s, p)
    }
    HandleWindowResize() {
        this.renderer.onWindowResize();
        this.merkelTree.onWindowResize();
    }

}
var nrOfVertices = 16000;
    var alpha = 3
    var s = 5
    var p = s;
function readFile() {

    


    var branchingFactor = 128;
    var depth, index, parent, replication: number;
    var addr: string;
    addr = "aaaqqqaaaqqqaaaqqqaaaqqq";
    replication = 33;
    var vertices: Vertex[] = [];
    
    for (let i = 1; i < nrOfVertices + 1; i++) {

        if (i == nrOfVertices) {
            depth = 3;
            parent = 0;
        }
        else if ( i == nrOfVertices - 1) {
            depth = 2
            parent = nrOfVertices - 1;
        }

        else if (i % (branchingFactor + 1) == 0)
        {
            parent = nrOfVertices - 1;
            depth = 2;
        } else {
            depth = 1;
            parent = Math.ceil(i / branchingFactor) * 129;
            if(parent > nrOfVertices) {
                parent = parent = nrOfVertices - 2
            }
        }


        vertices.push(
            {
                Index: i,
                Label: i.toString(),
                Color: 0x00ff00,//GetRandomColorString(),
                Outputs: [],
                Replication: replication,
                Addr: addr,
                Parent: parent,
                Depth: depth,
                Children: [],
                DamagedChildren: [],
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
    for(let k=0; k < nrOfVertices; k++) {
        if (vertices[k].Depth < 3 ) {
            vertices[vertices[k].Parent].Children.push(k);
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

const devContent = '{"config": {"alpha": 3, "s": 5, "p": 5, "dataElements": 31, "filesize": 126976, "parityLabels": ["Horizontal", "Right", "Left"]}, "dataTree": [{"addr": "d125ee27fe76c050ded1cdab25bc2650d980f55e4bc263365ecf795dc22f1661", "index": 1, "depth": 1, "replication": 95, "parent": 6}, {"addr": "e2755dc625f37434e3cea0f6fb54baf68292e9b20848a8956c75b2210ff343bd", "index": 2, "depth": 1, "replication": 65, "parent": 6}, {"addr": "8a7b493938122854ced5644b8fb71698b736e52f30509056e2383cfb96527d34", "index": 3, "depth": 1, "replication": 125, "parent": 6}, {"addr": "c8b8b4789c2b13adb575360f3aaa4c72b80384c9110e278e3d78e66b2c0c6c63", "index": 4, "depth": 1, "replication": 92, "parent": 6}, {"addr": "7e2344d5b3639d810b73f77a16e6488e7d449177526e75192d06cb36c55287d8", "index": 5, "depth": 1, "replication": 100, "parent": 6}, {"addr": "661a95b1e336b1e36a2594c611cbce7da4c384857bd245b9564f3cc947b4bf2f", "index": 6, "depth": 2, "replication": 55, "parent": 31}, {"addr": "b8638deb92e55296b4e75d3cbc4d3dbe7c9fa6150f60a7a89b5a9eccebba0398", "index": 7, "depth": 1, "replication": 108, "parent": 12}, {"addr": "510d88362516a07116376eb0ce0aa53398e6f1b059095fbff17e74c9b902842f", "index": 8, "depth": 1, "replication": 31, "parent": 12}, {"addr": "7c8fd645dd5dcced8a7a9f6c1ea182d191f521ab351f1f04e55baf2db3873ffa", "index": 9, "depth": 1, "replication": 32, "parent": 12}, {"addr": "a8ae823aa2cd91541292e7238a68a1e59db4c9d2c9155e80ad47525fabdb8e9c", "index": 10, "depth": 1, "replication": 132, "parent": 12}, {"addr": "452b33f7be6d1946f08b5f584421a0b72463e57ce1a7cfe06a0a72453a581e70", "index": 11, "depth": 1, "replication": 49, "parent": 18}, {"addr": "8b4188748bfe34a8c60822e66ba1b31a9d393ad0d6af4b0c8cdde0a62fd6e8e1", "index": 12, "depth": 2, "replication": 73, "parent": 31}, {"addr": "316a55141121916b16bfcde714f2c2f5d1216b7f9ea4f5cd04241b702cf12447", "index": 13, "depth": 1, "replication": 109, "parent": 18}, {"addr": "77d22a002ecb373aaf8588c7c759d520989582670f4234555215f7386d95a482", "index": 14, "depth": 1, "replication": 70, "parent": 18}, {"addr": "6270b82bfdbe1b9ca59e91d044794acced28b27d09291cf15b5fe61e9aa811da", "index": 15, "depth": 1, "replication": 56, "parent": 18}, {"addr": "de401c95a803217d6dc8e16f9cc50b1de5046dc729239dde89b49c7e6b0649da", "index": 16, "depth": 1, "replication": 63, "parent": 24}, {"addr": "91f94f0670aed44fec0c6d5bc7b3b92a3dc44788b7d0db5ff1ef7a4584ec857c", "index": 17, "depth": 1, "replication": 118, "parent": 24}, {"addr": "bb122393460a9b292e6525d685674d8563d93b8f90980bda7af6f93901d17a1b", "index": 18, "depth": 2, "replication": 103, "parent": 31}, {"addr": "6fcccc48b138fcc92e493770a70c34d5790b1971d8e5413b2b86fe93071a1d15", "index": 19, "depth": 1, "replication": 110, "parent": 24}, {"addr": "d100986b4a8ec29359daae04ddd71a42f4023c69ae25450b8e69938d03821e3c", "index": 20, "depth": 1, "replication": 132, "parent": 24}, {"addr": "e6bc56fa6925ef922ac077c3721067c82d5760d76ee27ebb589033df0f93655b", "index": 21, "depth": 1, "replication": 37, "parent": 30}, {"addr": "7b7f68c206d0586486da54d68e4344daa3763300a139330828be29823199e616", "index": 22, "depth": 1, "replication": 107, "parent": 30}, {"addr": "62599210fbc5039ab70230dc36e0594c6ce7b1110e869f1fd1253d72b7971b9a", "index": 23, "depth": 1, "replication": 95, "parent": 30}, {"addr": "b9db99674f603e1d02427af9ad9ce5c4b392e23db3dadd33a965deba9d7c9239", "index": 24, "depth": 2, "replication": 71, "parent": 31}, {"addr": "2e2e03f4f5b9c98ac4e6babfa7f28eb72a7ea9a2400c5b3f82ab66fcd374869b", "index": 25, "depth": 1, "replication": 102, "parent": 30}, {"addr": "0a6167af9de4956c5e4e8389aae0dad41fa97428c43e1408436b0cf8971f64b9", "index": 26, "depth": 1, "replication": 53, "parent": 30}, {"addr": "ff2fc752ef5b7b744c873cf591530b91c1d7f9d26ed0352bf0902fd364ca18b4", "index": 27, "depth": 1, "replication": 31, "parent": 30}, {"addr": "7a23caba2df4372bf6ddeeaa09b5917b7d084a12979fd8c53d9efd9786286493", "index": 28, "depth": 1, "replication": 55, "parent": 30}, {"addr": "64deb5807ebdb48225c2fe026849811ef6c8979b500da0e8e750a75eb91140c1", "index": 29, "depth": 1, "replication": 117, "parent": 30}, {"addr": "142b1137502a531fbade0403564005138fc547d0d6fc7e49aa0f44772a6dceeb", "index": 30, "depth": 2, "replication": 76, "parent": 31}, {"addr": "6eab42b5ce7f5854182602078e59f4e09ee9bdff735987ecc1b182960c10a44c", "index": 31, "depth": 3, "replication": 63, "parent": 0}], "parityTrees": [[{"addr": "d6e", "index": 1, "depth": 1, "replication": 73, "parent": 6, "from": 1, "to": 6}, {"addr": "be7", "index": 2, "depth": 1, "replication": 105, "parent": 6, "from": 2, "to": 7}, {"addr": "c6a", "index": 3, "depth": 1, "replication": 59, "parent": 6, "from": 3, "to": 8}, {"addr": "2b3", "index": 4, "depth": 1, "replication": 66, "parent": 6, "from": 4, "to": 9}, {"addr": "c59", "index": 5, "depth": 1, "replication": 113, "parent": 6, "from": 5, "to": 10}, {"addr": "a85", "index": 6, "depth": 2, "replication": 32, "parent": 31, "from": 6, "to": 11}, {"addr": "1a8", "index": 7, "depth": 1, "replication": 83, "parent": 12, "from": 7, "to": 12}, {"addr": "4da", "index": 8, "depth": 1, "replication": 90, "parent": 12, "from": 8, "to": 13}, {"addr": "4ac", "index": 9, "depth": 1, "replication": 78, "parent": 12, "from": 9, "to": 14}, {"addr": "03e", "index": 10, "depth": 1, "replication": 68, "parent": 12, "from": 10, "to": 15}, {"addr": "744", "index": 11, "depth": 1, "replication": 85, "parent": 18, "from": 11, "to": 16}, {"addr": "bf2", "index": 12, "depth": 2, "replication": 127, "parent": 31, "from": 12, "to": 17}, {"addr": "cad", "index": 13, "depth": 1, "replication": 50, "parent": 18, "from": 13, "to": 18}, {"addr": "d2c", "index": 14, "depth": 1, "replication": 42, "parent": 18, "from": 14, "to": 19}, {"addr": "480", "index": 15, "depth": 1, "replication": 75, "parent": 18, "from": 15, "to": 20}, {"addr": "a02", "index": 16, "depth": 1, "replication": 122, "parent": 24, "from": 16, "to": 21}, {"addr": "c75", "index": 17, "depth": 1, "replication": 62, "parent": 24, "from": 17, "to": 22}, {"addr": "450", "index": 18, "depth": 2, "replication": 128, "parent": 31, "from": 18, "to": 23}, {"addr": "f3e", "index": 19, "depth": 1, "replication": 101, "parent": 24, "from": 19, "to": 24}, {"addr": "ecb", "index": 20, "depth": 1, "replication": 109, "parent": 24, "from": 20, "to": 25}, {"addr": "95e", "index": 21, "depth": 1, "replication": 97, "parent": 30, "from": 21, "to": 26}, {"addr": "f1e", "index": 22, "depth": 1, "replication": 112, "parent": 30, "from": 22, "to": 27}, {"addr": "d27", "index": 23, "depth": 1, "replication": 59, "parent": 30, "from": 23, "to": 28}, {"addr": "dda", "index": 24, "depth": 2, "replication": 39, "parent": 31, "from": 24, "to": 29}, {"addr": "156", "index": 25, "depth": 1, "replication": 81, "parent": 30, "from": 25, "to": 30}, {"addr": "a8e", "index": 26, "depth": 1, "replication": 34, "parent": 30, "from": 26, "to": 31}, {"addr": "2d6", "index": 27, "depth": 1, "replication": 114, "parent": 30, "from": 27, "to": 2}, {"addr": "60c", "index": 28, "depth": 1, "replication": 65, "parent": 30, "from": 28, "to": 3}, {"addr": "9e0", "index": 29, "depth": 1, "replication": 78, "parent": 30, "from": 29, "to": 4}, {"addr": "f58", "index": 30, "depth": 2, "replication": 107, "parent": 31, "from": 30, "to": 5}, {"addr": "4b6", "index": 31, "depth": 3, "replication": 60, "parent": 0, "from": 31, "to": 1}], [{"addr": "626", "index": 1, "depth": 1, "replication": 106, "parent": 6, "from": 1, "to": 7}, {"addr": "dd0", "index": 2, "depth": 1, "replication": 83, "parent": 6, "from": 2, "to": 8}, {"addr": "2de", "index": 3, "depth": 1, "replication": 96, "parent": 6, "from": 3, "to": 9}, {"addr": "ebc", "index": 4, "depth": 1, "replication": 105, "parent": 6, "from": 4, "to": 10}, {"addr": "0d5", "index": 5, "depth": 1, "replication": 120, "parent": 6, "from": 5, "to": 6}, {"addr": "37c", "index": 6, "depth": 2, "replication": 78, "parent": 31, "from": 6, "to": 12}, {"addr": "8e6", "index": 7, "depth": 1, "replication": 100, "parent": 12, "from": 7, "to": 13}, {"addr": "baf", "index": 8, "depth": 1, "replication": 47, "parent": 12, "from": 8, "to": 14}, {"addr": "bd4", "index": 9, "depth": 1, "replication": 32, "parent": 12, "from": 9, "to": 15}, {"addr": "8d7", "index": 10, "depth": 1, "replication": 45, "parent": 12, "from": 10, "to": 11}, {"addr": "2cf", "index": 11, "depth": 1, "replication": 32, "parent": 18, "from": 11, "to": 17}, {"addr": "286", "index": 12, "depth": 2, "replication": 64, "parent": 31, "from": 12, "to": 18}, {"addr": "088", "index": 13, "depth": 1, "replication": 50, "parent": 18, "from": 13, "to": 19}, {"addr": "c7f", "index": 14, "depth": 1, "replication": 58, "parent": 18, "from": 14, "to": 20}, {"addr": "332", "index": 15, "depth": 1, "replication": 52, "parent": 18, "from": 15, "to": 16}, {"addr": "f70", "index": 16, "depth": 1, "replication": 106, "parent": 24, "from": 16, "to": 22}, {"addr": "77f", "index": 17, "depth": 1, "replication": 87, "parent": 24, "from": 17, "to": 23}, {"addr": "22d", "index": 18, "depth": 2, "replication": 116, "parent": 31, "from": 18, "to": 24}, {"addr": "ded", "index": 19, "depth": 1, "replication": 68, "parent": 24, "from": 19, "to": 25}, {"addr": "4ab", "index": 20, "depth": 1, "replication": 107, "parent": 24, "from": 20, "to": 21}, {"addr": "37b", "index": 21, "depth": 1, "replication": 92, "parent": 30, "from": 21, "to": 27}, {"addr": "22e", "index": 22, "depth": 1, "replication": 95, "parent": 30, "from": 22, "to": 28}, {"addr": "246", "index": 23, "depth": 1, "replication": 93, "parent": 30, "from": 23, "to": 29}, {"addr": "020", "index": 24, "depth": 2, "replication": 61, "parent": 31, "from": 24, "to": 30}, {"addr": "ab1", "index": 25, "depth": 1, "replication": 88, "parent": 30, "from": 25, "to": 26}, {"addr": "12c", "index": 26, "depth": 1, "replication": 107, "parent": 30, "from": 26, "to": 5}, {"addr": "bba", "index": 27, "depth": 1, "replication": 52, "parent": 30, "from": 27, "to": 5}, {"addr": "6bf", "index": 28, "depth": 1, "replication": 50, "parent": 30, "from": 28, "to": 5}, {"addr": "7e6", "index": 29, "depth": 1, "replication": 94, "parent": 30, "from": 29, "to": 5}, {"addr": "fce", "index": 30, "depth": 2, "replication": 71, "parent": 31, "from": 30, "to": 31}, {"addr": "828", "index": 31, "depth": 3, "replication": 120, "parent": 0, "from": 31, "to": 5}], [{"addr": "2ad", "index": 1, "depth": 1, "replication": 31, "parent": 6, "from": 1, "to": 10}, {"addr": "658", "index": 2, "depth": 1, "replication": 59, "parent": 6, "from": 2, "to": 6}, {"addr": "e6e", "index": 3, "depth": 1, "replication": 37, "parent": 6, "from": 3, "to": 7}, {"addr": "16b", "index": 4, "depth": 1, "replication": 111, "parent": 6, "from": 4, "to": 8}, {"addr": "939", "index": 5, "depth": 1, "replication": 54, "parent": 6, "from": 5, "to": 9}, {"addr": "0ce", "index": 6, "depth": 2, "replication": 118, "parent": 31, "from": 6, "to": 15}, {"addr": "0d0", "index": 7, "depth": 1, "replication": 106, "parent": 12, "from": 7, "to": 11}, {"addr": "42f", "index": 8, "depth": 1, "replication": 118, "parent": 12, "from": 8, "to": 12}, {"addr": "38b", "index": 9, "depth": 1, "replication": 125, "parent": 12, "from": 9, "to": 13}, {"addr": "a1d", "index": 10, "depth": 1, "replication": 122, "parent": 12, "from": 10, "to": 14}, {"addr": "f3f", "index": 11, "depth": 1, "replication": 80, "parent": 18, "from": 11, "to": 20}, {"addr": "fb2", "index": 12, "depth": 2, "replication": 85, "parent": 31, "from": 12, "to": 16}, {"addr": "e12", "index": 13, "depth": 1, "replication": 104, "parent": 18, "from": 13, "to": 17}, {"addr": "bc0", "index": 14, "depth": 1, "replication": 63, "parent": 18, "from": 14, "to": 18}, {"addr": "1c2", "index": 15, "depth": 1, "replication": 124, "parent": 18, "from": 15, "to": 19}, {"addr": "2b5", "index": 16, "depth": 1, "replication": 46, "parent": 24, "from": 16, "to": 25}, {"addr": "000", "index": 17, "depth": 1, "replication": 43, "parent": 24, "from": 17, "to": 21}, {"addr": "842", "index": 18, "depth": 2, "replication": 110, "parent": 31, "from": 18, "to": 22}, {"addr": "d49", "index": 19, "depth": 1, "replication": 39, "parent": 24, "from": 19, "to": 23}, {"addr": "cfc", "index": 20, "depth": 1, "replication": 88, "parent": 24, "from": 20, "to": 24}, {"addr": "a1a", "index": 21, "depth": 1, "replication": 108, "parent": 30, "from": 21, "to": 30}, {"addr": "a22", "index": 22, "depth": 1, "replication": 116, "parent": 30, "from": 22, "to": 26}, {"addr": "d41", "index": 23, "depth": 1, "replication": 118, "parent": 30, "from": 23, "to": 27}, {"addr": "c23", "index": 24, "depth": 2, "replication": 84, "parent": 31, "from": 24, "to": 28}, {"addr": "55e", "index": 25, "depth": 1, "replication": 45, "parent": 30, "from": 25, "to": 29}, {"addr": "bf0", "index": 26, "depth": 1, "replication": 126, "parent": 30, "from": 26, "to": 1}, {"addr": "b08", "index": 27, "depth": 1, "replication": 31, "parent": 30, "from": 27, "to": 31}, {"addr": "1ed", "index": 28, "depth": 1, "replication": 76, "parent": 30, "from": 28, "to": 3}, {"addr": "e04", "index": 29, "depth": 1, "replication": 117, "parent": 30, "from": 29, "to": 4}, {"addr": "2d0", "index": 30, "depth": 2, "replication": 131, "parent": 31, "from": 30, "to": 5}, {"addr": "56c", "index": 31, "depth": 3, "replication": 82, "parent": 0, "from": 31, "to": 2}]]}'