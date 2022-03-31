import { ReverseSubtractEquation } from "three";
import { COLORS } from "../../../SharedKernel/constants";
import { Parity, Vertex } from "../../../SharedKernel/interfaces";
import { strandRules } from "../constans/const";
import { RuleI } from "../interfaces/interface";
import { GenerateParities } from "./utilts/generateParities";
import { GenerateParityShift } from "./utilts/generateParityShift";
import { GenerateVertecies } from "./utilts/generatVertecies";
import { GetFuncStrings } from "./utilts/getFuncStrings";
import { GenerateRuleLayout } from "./utilts/utils";

export { PopUp }

const layOut = /*html*/
    `
<div id="popup-bg">
    <div class="popup-container">
        <div id="popup-config">
            <div>
                <h1>Config</h1>
            </div>
            <div id='config-params'>
                <label for='config'> (alpha, s, p): </label>
                <input name='config' />
                <input name='config' />
                <input name='config' />
            </div>
            <div>
                <label for='nrdata'># of data elemets:</label>
                <input name='nrdata' value='259' readonly />
            </div>
            <button id="submit-config" onclick="configSubmited"> submit </button>
        </div>
        <div id="popup-rules">
        </div>
    </div>
</div>
`;

class PopUp {
    public Container: HTMLDivElement = document.createElement("div");
    private configC: HTMLDivElement;
    private rulesC: HTMLDivElement;

    constructor() {
        this.Container.innerHTML = layOut;
        this.configC = this.Container.querySelector("#popup-config") as HTMLDivElement;
        this.rulesC = this.Container.querySelector("#popup-rules") as HTMLDivElement;
        this.addEventListeners();
    }

    private addEventListeners() {
        (this.configC.querySelector("#submit-config") as HTMLButtonElement).onclick = this.configSubmited.bind(this);
        (this.Container.querySelector("#popup-bg") as HTMLDivElement).onclick = this.handleBGClicked.bind(this);
    }

    private configSubmited() {
        let q = this.Container.querySelectorAll("input[name='config']");
        let alpha = parseInt((q[0] as HTMLInputElement).value);
        let s = parseInt((q[1] as HTMLInputElement).value);
        let p = parseInt((q[2] as HTMLInputElement).value);
        if (!alpha || !s || !p) return
        let w = this.Container.querySelector("input[name='nrdata']")!;
        let nrOfData = parseInt((w as HTMLInputElement).value)
        if (!nrOfData) return;
        this.createRulesLayout();
    }

    private handleBGClicked(e: Event) {
        //@ts-ignore
        if( e.srcElement.id == "popup-bg" ){
            this.configC.style.display = "unset";
            this.rulesC.style.display = "none";
            this.Container.dispatchEvent(new Event("back-to-start", {bubbles: true}))
        }
    }

    private createRulesLayout() {
        this.configC.style.display = "none";
        let c = this.rulesC;
        while( c.children.length > 0 ) { c.removeChild(c.firstChild!) }
        c.style.display = "unset";
        let q = this.Container.querySelectorAll("input[name='config']");
        let alpha = parseInt((q[0] as HTMLInputElement).value);
        GenerateRuleLayout(alpha, c);
        var btn = document.createElement("button");
        btn.innerText = "Generate!";
        btn.onclick = this.generateCode.bind(this);
        c.append(btn);
    }
    
    private generateCode() {
        let q = this.Container.querySelectorAll("input[name='config']");
        let alpha = parseInt((q[0] as HTMLInputElement).value);
        let s = parseInt((q[1] as HTMLInputElement).value);
        let p = parseInt((q[2] as HTMLInputElement).value);
        q = this.Container.querySelectorAll("input[name='nrdata']");
        let funcStrings: string[][] = GetFuncStrings(alpha, this.rulesC);
        let nrdata = parseInt((q[0] as HTMLInputElement).value);
        let vertecies = GenerateVertecies(nrdata);
        let parities = GenerateParities(alpha, s, p, nrdata, funcStrings);
        let parityShift = GenerateParityShift(nrdata);
        this.Container.dispatchEvent( new CustomEvent("data-generated", {detail: 
            {vertecies: vertecies, alpha: alpha, s: s, p:p, parities: parities, parityShift: parityShift}, bubbles: true}) );
    }
}