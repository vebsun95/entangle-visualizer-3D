import { ParityShiftMock } from "../../../SharedKernel/parityShiftMock";
import { DataGeneratedEvent } from "../../events/dataGenerated";
import { EntanglementRulesOut } from "../constans/entanglementRules";
import { GenerateParities } from "./utilts/generateParities";
import { GenerateVertices } from "./utilts/generateVertecies";

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
                <input name='config' value='3'/>
                <input name='config' value='5'/>
                <input name='config' value='5'/>
            </div>
            <span class="error-span" id="params-error"></span>
            <div>
                <label for='nrdata'># of data elemets:</label>
                <input name='nrdata' value='259' />
            </div>
            <span class="error-span" id="nrData-error"></span>
            <button id="submit-config"> submit </button>
        </div>
    </div>
</div>
`;

class PopUp {
    public Container: HTMLDivElement = document.createElement("div");
    private configC: HTMLDivElement;
    private configError: HTMLSpanElement;
    private nrDataError: HTMLSpanElement;
    
    constructor() {
        this.Container.innerHTML = layOut;
        this.configC = this.Container.querySelector("#popup-config") as HTMLDivElement;
        this.configError = this.Container.querySelector("#params-error") as HTMLDivElement;
        this.nrDataError = this.Container.querySelector("#nrData-error") as HTMLDivElement;
        this.addEventListeners();
    }

    public Show() {
        this.Container.style.display = "unset";
    }

    public Hide() {
        this.Container.style.display = "none";
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
        let w = this.Container.querySelector("input[name='nrdata']")!;
        let nrOfData = parseInt((w as HTMLInputElement).value)

        this.configError.innerText = "";
        this.nrDataError.innerText = "";
        if (this.checkForError(alpha, s, p, nrOfData)) return

        this.generateData(alpha, s, p, nrOfData);
    }

    private checkForError(alpha: number, s: number, p: number, nrData: number) : boolean {
        if(isNaN(alpha) || isNaN(s) || isNaN(p)) {
            this.configError.innerText = "cant prase alpha, s or p";
            return true;
        }
        if(alpha <= 0 || alpha > EntanglementRulesOut.length) {
            this.configError.innerText = `only alpha ∈ [1:${EntanglementRulesOut.length}]`;
            return true;
        }
        if(p < s) {
            this.configError.innerText = "P must be greater or equal to S";
            return true;
        }
        if(isNaN(nrData) || nrData < s || nrData <= 0) {
            this.nrDataError.innerText = "Invalid input";
            return true;
        }
        return false;
    }

    private handleBGClicked(e: Event) {
        //@ts-ignore
        if( e.srcElement.id == "popup-bg" ){
            this.Hide();
        }
    }
    
    private generateData(alpha: number, s: number, p: number, nrdata: number) {
        let vertices = GenerateVertices(nrdata);
        let parities = GenerateParities(alpha, s, p, nrdata);
        let parityShift = new ParityShiftMock();
        this.Container.dispatchEvent( new DataGeneratedEvent(vertices, alpha, s, p, parities, parityShift, {bubbles: true}));
    }

    public GenerateDefaultData() {
        let alpha=3, s=5, p=5, nrOfData=259;
        this.generateData(alpha, s, p, nrOfData);
    }
}