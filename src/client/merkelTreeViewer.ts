import { DataContainer } from "./dataContainer";
import { Vertices } from "./interfaces";

const SVGURL = "http://www.w3.org/2000/svg";

interface Tile {
    Container: SVGElement,
    Rect: SVGRectElement,
    Text: SVGTextElement,
}

interface InfoGraphic {
    Container: SVGElement;
    NrOfChilderen: SVGTextElement;
    CurrentNode: SVGTextElement;
    Depth: SVGTextElement;
}

export class MerkelTreeViewer extends DataContainer {

    private container: HTMLDivElement = document.getElementById("tree-container") as HTMLDivElement;
    private svgElement: SVGElement = document.getElementById("original-merkel-tree") as unknown as SVGElement;
    private nrOfColumns = 16;
    private nrOfRows = 8;
    private padding = 20;
    private tiles: Tile[] = Array(this.nrOfColumns * this.nrOfRows);
    private infoGraphic: InfoGraphic = { 
        Container: document.createElementNS(SVGURL, "svg"),
        NrOfChilderen: document.createElementNS(SVGURL, "text"),
        CurrentNode: document.createElementNS(SVGURL, "text"),
        Depth: document.createElementNS(SVGURL, "text")};

    constructor(alpha: number, s: number, p: number, vertices: Vertices[]) {
        super(alpha, s, p, vertices);

        this.updateDynamicAttributes();
        this.createTileElements();
        this.CreateOMT(0, []);
        this.CreateInfoGraphic();
        this.UpdateInfoGraphic(16000, 3, 125);
    }

    private updateDynamicAttributes() {
        this.svgElement.setAttribute("height", (window.innerHeight * 0.2).toString());
        this.svgElement.setAttribute("width", (window.innerWidth).toString());
    }

    private createTileElements() {
        var tile: Tile
        
        for(let i =0; i < this.tiles.length; i++) {
                tile = {Container: document.createElementNS(SVGURL, "svg"),
                    Rect: document.createElementNS(SVGURL, "rect"),
                    Text: document.createElementNS(SVGURL, "text")};

                tile.Rect.setAttribute("stroke", "black")

                tile.Text.setAttribute("text-anchor", "middle");
                tile.Text.setAttribute("dominant-baseline", "middle");

                tile.Container.append(tile.Rect, tile.Text);
                this.svgElement.append(tile.Container);
                this.tiles[i] = tile
        }
    }

    private CreateInfoGraphic() {

        this.infoGraphic.Container.setAttribute("width", (window.innerWidth).toString());
        this.infoGraphic.Container.setAttribute("height", (this.padding).toString());

        this.infoGraphic.CurrentNode.setAttribute("x", (200).toString());
        this.infoGraphic.CurrentNode.setAttribute("y", (this.padding / 2).toString());
        this.infoGraphic.CurrentNode.setAttribute("dominant-baseline", "middle");

        this.infoGraphic.Depth.setAttribute("x", (400).toString());
        this.infoGraphic.Depth.setAttribute("y", (this.padding / 2).toString());
        this.infoGraphic.Depth.setAttribute("dominant-baseline", "middle");

        this.infoGraphic.NrOfChilderen.setAttribute("x", (600).toString());
        this.infoGraphic.NrOfChilderen.setAttribute("y", (this.padding / 2).toString());
        this.infoGraphic.NrOfChilderen.setAttribute("dominant-baseline", "middle");

        this.infoGraphic.Container.append(this.infoGraphic.CurrentNode, this.infoGraphic.Depth, this.infoGraphic.NrOfChilderen);
        this.svgElement.append(this.infoGraphic.Container);
    }

    private UpdateInfoGraphic(currentNode: number, depth: number, nrOfChildren: number) {
        this.infoGraphic.CurrentNode.innerHTML = `Current node: ${currentNode}`;
        this.infoGraphic.Depth.innerHTML = `Depth: ${depth}`;
        this.infoGraphic.NrOfChilderen.innerHTML = `Number of children: ${nrOfChildren}`;

    }

    private CreateOMT(depth: number, path: number[]) {
        var vertex: Vertices;
        var tile: Tile;
        var nrOfChildren, nrOfRows, nrOfColumns, tileWidth, tileHeight, tileCounter, row, col: number;

        nrOfChildren = this.vertices[this.nrOfVertices - 1].Children.length;
        nrOfRows = Math.floor((2 / 3) * Math.sqrt(nrOfChildren)); // https://www.brilliant.org/bartek_stasiak;
        nrOfColumns = Math.ceil(nrOfChildren / nrOfRows);

        tileWidth = Math.ceil((this.svgElement.clientWidth - this.padding * 2) / nrOfColumns);
        tileHeight = Math.ceil((this.svgElement.clientHeight - this.padding * 2) / nrOfRows);
        tileCounter = 0;
        row = 0;
        col = 0;

        for(var childIndex of this.vertices[this.nrOfVertices - 1].Children) {
            vertex = this.vertices[childIndex];
            tile = this.tiles[tileCounter];

            tile.Container.setAttribute("x", (col * tileWidth + this.padding).toString());
            tile.Container.setAttribute("y", (row * tileHeight + this.padding).toString());
            tile.Container.setAttribute("width",  (tileWidth).toString());
            tile.Container.setAttribute("height", (tileHeight).toString());
            tile.Container.setAttribute("display", "unset");

            tile.Rect.setAttribute("width", (tileWidth).toString());
            tile.Rect.setAttribute("height", (tileHeight).toString());
            tile.Rect.setAttribute("fill", this.convertHexToStringColor(vertex.Color));

            tile.Text.setAttribute("x", (tileWidth / 2).toString());
            tile.Text.setAttribute("y", (tileHeight / 2 + 2).toString());
            tile.Text.innerHTML = vertex.Index.toString();

            col = (col + 1) % nrOfColumns
            if(col == 0 ) row++

            tileCounter++;
        }
        for(; tileCounter < this.tiles.length; tileCounter++) {
            this.tiles[tileCounter].Container.setAttribute("display", "none");
        }
    }

    private convertHexToStringColor(hexColor: number) : string
    {
        let hexColorString = hexColor.toString(16);
        // 0xFFFFFF
        while(hexColorString.length < 6) {
            hexColorString = '0' + hexColorString;
        }
        hexColorString = '#' + hexColorString;
        return hexColorString;
    }
}
