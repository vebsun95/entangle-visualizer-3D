import * as e from "express";
import { threadId } from "worker_threads";
import { COLORS } from "./constants";
import { DataContainer } from "./dataContainer";
import { Vertex } from "./interfaces";

const SVGURL = "http://www.w3.org/2000/svg";

interface Tile {
    Container: SVGElement,
    Rect: SVGRectElement,
    Text: SVGTextElement,
}

interface InfoGraphic {
    Container: HTMLDivElement;
    Text: HTMLParagraphElement;
    BreadCrumbs: HTMLParagraphElement;
    BreadCrumbsIndex: number[];
}

interface MouseOverElement {
    Container: HTMLDivElement,
    List: HTMLUListElement,
}

export class MerkelTreeViewer extends DataContainer {

    private container: HTMLDivElement = document.getElementById("tree-container") as HTMLDivElement;
    private infoGraphic: InfoGraphic = { 
        Container: document.createElement("div"),
        Text: document.createElement("p"),
        BreadCrumbs: document.createElement("p"),
        BreadCrumbsIndex: [],}
    private svgElement: SVGElement = document.getElementById("original-merkel-tree") as unknown as SVGElement;
    private mouseOverEle: MouseOverElement = {
        Container: this.container.appendChild(document.createElement("div")),
        List: document.createElement("ul")};
    private padding = 20;
    private borderSize = 5;
    private tiles: Tile[] = Array(260);
    private currentRootNode: number = 0;

    constructor() {
        super();
        this.createTileElements();

        this.mouseOverEle.Container.style.position = "absolute";
        this.mouseOverEle.Container.style.backgroundColor = "white";
        this.mouseOverEle.Container.style.border = "1px solid black"
        this.mouseOverEle.Container.setAttribute("display", "none")
        this.mouseOverEle.Container.style.pointerEvents = "none";

        this.mouseOverEle.Container.append(this.mouseOverEle.List);
    }

    HandleUpdatedDate() {
        this.currentRootNode = this.nrOfVertices - 1;
        this.infoGraphic.BreadCrumbsIndex = [ this.currentRootNode ]
        this.CreateInfoGraphic();
        this.updateInfoGraphic();
        this.UpdateDynamicAttributes();
        this.CreateOMT();
    }

    UpdateDynamicAttributes() {
        this.svgElement.setAttribute("height", (window.innerHeight * 0.2).toString());
        this.svgElement.setAttribute("width", (window.innerWidth).toString());

        this.infoGraphic.Container.setAttribute("height", (window.innerHeight * 0.2).toString());
        this.infoGraphic.Container.setAttribute("width", (window.innerWidth).toString());
    }

    onWindowResize() {
        this.UpdateDynamicAttributes();
        this.CreateOMT();
    }

    private createTileElements() {
        var tile: Tile
        
        for(let i =0; i < this.tiles.length; i++) {
                tile = {Container: document.createElementNS(SVGURL, "svg"),
                    Rect: document.createElementNS(SVGURL, "rect"),
                    Text: document.createElementNS(SVGURL, "text")};

                tile.Rect.setAttribute("stroke-width", (this.borderSize).toString());
                tile.Rect.setAttribute("stroke", "black")

                tile.Text.setAttribute("text-anchor", "middle");
                tile.Text.setAttribute("dominant-baseline", "middle");

                tile.Container.append(tile.Rect, tile.Text);
                tile.Container.addEventListener("click", () => { this.tileOnClickHandler(i) });
                tile.Container.addEventListener("mouseenter", () => { this.tileMouseEnterHandler(i) })
                tile.Container.addEventListener("mouseleave", this.tileMouseLeaveHandler.bind(this));
                
                this.svgElement.append(tile.Container);
                this.tiles[i] = tile
        }
    }

    private CreateInfoGraphic() {

        this.infoGraphic.Container.style.width = window.innerWidth.toString() + "px";
        this.infoGraphic.Container.style.height = this.padding.toString() + "px";
        this.infoGraphic.Container.style.position = "absolute";

        this.infoGraphic.BreadCrumbs.style.margin = "0";
        this.infoGraphic.BreadCrumbs.style.float = "left";

        this.infoGraphic.Text.style.margin = "0";
        this.infoGraphic.Text.style.textAlign = "center";

        this.infoGraphic.Container.append(this.infoGraphic.BreadCrumbs, this.infoGraphic.Text);
        this.container.insertBefore(this.infoGraphic.Container, this.svgElement);
    }

    private updateInfoGraphic() {
        var breadCrumb: HTMLAnchorElement;

        while(this.infoGraphic.BreadCrumbs.children.length > 0) { this.infoGraphic.BreadCrumbs.removeChild(this.infoGraphic.BreadCrumbs.lastChild!) }
        for (let rootNodeIndex of this.infoGraphic.BreadCrumbsIndex) {
            breadCrumb = document.createElement("a");
            breadCrumb.href = "#";
            breadCrumb.addEventListener("mousedown", () => this.breadCrumbOnClickHandler(rootNodeIndex));
            breadCrumb.innerHTML = `>${this.vertices[rootNodeIndex].Index}`
            this.infoGraphic.BreadCrumbs.append(breadCrumb);
        }

        let currentNode = this.vertices[this.currentRootNode].Index;
        let depth = this.vertices[this.currentRootNode].Depth;
        let nrOfChildren = this.vertices[this.currentRootNode].Children.length;
        this.infoGraphic.Text.innerHTML = `Current node: ${currentNode}, Depth: ${depth}, Number of children: ${nrOfChildren}`

    }

    CreateOMT() {
        var vertex: Vertex;
        var tile: Tile;
        var nrOfChildren, nrOfRows, nrOfColumns, tileWidth, tileHeight, tileCounter, row, col: number;

        nrOfChildren = this.vertices[this.currentRootNode].Children.length;
        switch(nrOfChildren) {
            case 128:
                nrOfColumns = 16;
                nrOfRows = 8;
                break;
            default:
                nrOfRows = Math.floor((2 / 3) * Math.sqrt(nrOfChildren)) || 1; // https://www.brilliant.org/bartek_stasiak;
                nrOfColumns = Math.ceil(nrOfChildren / nrOfRows);
        }
        

        tileWidth = Math.ceil((this.svgElement.clientWidth - this.padding * 2) / nrOfColumns);
        tileHeight = Math.ceil((this.svgElement.clientHeight - this.padding * 2) / nrOfRows);
        

        tileCounter = 0;
        row = 0;
        col = 0;

        for(let childIndex of this.vertices[this.currentRootNode].Children) {
            vertex = this.vertices[childIndex];
            tile = this.tiles[tileCounter];

            if (vertex.DamagedChildren.length > 0 && vertex.Depth > 1) {
                tile.Rect.setAttribute("stroke", "red");
            } else {
                tile.Rect.setAttribute("stroke", this.convertHexToStringColor(0x000000));
            }

            tile.Container.setAttribute("x", (col * tileWidth + this.padding).toString());
            tile.Container.setAttribute("y", (row * (tileHeight) + this.padding).toString());
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
        // Hide rest of the tiles.
        for(; tileCounter < this.tiles.length; tileCounter++) {
            this.tiles[tileCounter].Container.setAttribute("display", "none");
        }

        this.updateInfoGraphic();
    }

    private tileOnClickHandler(tileIndex: number) {
        let childIndex = this.vertices[this.currentRootNode].Children[tileIndex] 
        if (this.vertices[childIndex].Children.length > 0) {
            this.currentRootNode = this.vertices[this.currentRootNode].Children[tileIndex]
            this.infoGraphic.BreadCrumbsIndex.push(this.currentRootNode);
            // Hide the the mouseOverElement
            this.mouseOverEle.Container.style.display = "none";
            this.CreateOMT();
            this.updateInfoGraphic();
        }
    }

    private tileMouseEnterHandler( tileIndex: number ) {
        let childIndex = this.vertices[this.currentRootNode].Children[tileIndex]
        if ( this.vertices[childIndex].DamagedChildren.length > 0 ) {
            this.mouseOverEle.Container.style.display = "unset";
            this.mouseOverEle.Container.style.left = this.tiles[tileIndex].Container.getAttribute("x")+ "px";
            this.mouseOverEle.Container.style.top = this.tiles[tileIndex].Container.getAttribute("y") + "px";
            this.mouseOverEle.List.innerHTML = "";
            var li: HTMLLIElement;
            var vertex: Vertex;
            for(let i = 0; i < this.vertices[childIndex].DamagedChildren.length || i < 5; i++) {
                vertex = this.vertices[this.vertices[childIndex].DamagedChildren[i]];
                li = document.createElement("li");
                li.innerText = `Vertex: ${vertex.Index}. Depth: ${vertex.Depth}`;
                this.mouseOverEle.List.append(li);
            }
        }
    }

    private tileMouseLeaveHandler() {
        this.mouseOverEle.Container.style.display = "none";
    }

    private breadCrumbOnClickHandler( rootNodeIndex: number ) {
        this.currentRootNode = rootNodeIndex;
        while( this.infoGraphic.BreadCrumbsIndex[ this.infoGraphic.BreadCrumbsIndex.length - 1 ] != rootNodeIndex ) {
            this.infoGraphic.BreadCrumbsIndex.pop();
        }
        this.CreateOMT();
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
