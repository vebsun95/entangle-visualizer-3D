import { PopUp } from "./popUp/popUp";
import { GenerateParities } from "./popUp/utilts/generateParities";
import { GenerateParityShift } from "./popUp/utilts/generateParityShift";
import { GenerateVertices } from "./popUp/utilts/generateVertecies";
import { strandRules } from './constans/const'

export {FileGenerator}

class FileGenerator {

    public constructor() {
        this.createLayOut();
    }

    public Hide() {
        this.visible = false;
        this.Container.style.display = "none";
    }

    public Show() {
        this.visible = true;
        this.Container.style.display = "unset";
        this.generateDefaultData();
    }

    private createLayOut() {
        this.Container.addEventListener("data-generated", this.handleDataGenerated.bind(this));
        this.changeRulesBtn.addEventListener("click", () => this.popUp.Show());
        this.downloadBtn.addEventListener("click", () => this.Container.dispatchEvent( new Event("download", {bubbles: true})));
        this.downloadBtn.innerText = "Save to clipboard";
        this.changeRulesBtn.innerText = "Change config";

        this.Container.append(this.downloadBtn, this.changeRulesBtn, this.popUp.Container);
    }

    private handleDataGenerated() {
        this.popUp.Hide();
    }

    private generateDefaultData() {
        let alpha=3, s=5, p=5, nrOfData=259;
        let vertices = GenerateVertices(nrOfData);
        let parityShift = GenerateParityShift(nrOfData);
        let parities = GenerateParities(alpha, s, p, nrOfData, strandRules)
        this.Container.dispatchEvent( new CustomEvent("data-generated", {detail: 
            {vertices: vertices, alpha: alpha, s: s, p:p, parities: parities, parityShift: parityShift}, bubbles: true}) );
    }


    public Container: HTMLDivElement = document.createElement("div");
    private downloadBtn: HTMLButtonElement = document.createElement("button");
    private changeRulesBtn: HTMLButtonElement = document.createElement("button");
    private popUp: PopUp = new PopUp();
    private visible: boolean = false;
    
}