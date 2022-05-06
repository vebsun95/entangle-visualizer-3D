import { PopUp } from "./popUp/popUp";
import { DataGeneratedEvent } from "../events/dataGenerated";
import { InputI, TextAreaI } from "./interfaces/interface";

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
        this.popUp.GenerateDefaultData();
    }

    private createLayOut() {
        this.Container.addEventListener("data-generated", this.handleDataGenerated.bind(this) as EventListener);
        this.changeRulesBtn.addEventListener("click", () => this.popUp.Show());
        this.downloadBtn.addEventListener("click", this.saveToClipBrd.bind(this));
        this.downloadBtn.innerText = "Save to clipboard";
        this.changeRulesBtn.innerText = "Change config";

        this.timeDelay.label.setAttribute("for", "time-delay");
        this.timeDelay.label.innerText = "Time delay.";
        this.timeDelay.label.style.display = "block";
        this.timeDelay.input.name = "time-delay:"
        this.timeDelay.input.style.display= "block";
        this.timeDelay.input.value = "1000";
        this.timeDelay.container.append(this.timeDelay.label, this.timeDelay.input)

        this.Container.append(this.downloadBtn, this.changeRulesBtn, this.timeDelay.container, this.popUp.Container);
    }

    private handleDataGenerated( e: DataGeneratedEvent ) {
        this.popUp.Hide();
        this.alpha = e.alpha;
        this.s = e.s;
        this.p = e.p;
        this.nrOfData = e.vertices.size;
        let ta: TextAreaI;
        while(this.textAreas.length) {
            ta = this.textAreas.pop()!;
            ta.containter.parentNode!.removeChild(ta.containter);
        }
        for(let a=0; a < e.alpha + 1; a++) {
            ta = {
                containter: document.createElement("div"),
                label: document.createElement("label"),
                textArea: document.createElement("textarea"),
            };

            ta.label.setAttribute("for", "ta" + a);
            ta.label.innerText = a == 0 ? "Data:" : "strand " + (a).toString() + ":";
            ta.label.style.display = "block";

            ta.textArea.name = "ta" + a;
            ta.textArea.readOnly = true;
            ta.textArea.style.display = "block";

            ta.containter.append(ta.label, ta.textArea);

            this.textAreas.push(ta);
            this.Container.append(ta.containter);
        }
    }

    private saveToClipBrd() {
        const ListEnum = ["failedList[ts.Alpha]", "failedList[Horizontal]", "failedList[Right]", "failedList[Left]"];
        const ListValue = [" = ts.TranslateLatticePostoMerklePos(", " = ts.ParityLeafIdToCanonIndex(", " = ts.ParityLeafIdToCanonIndex(", " = ts.ParityLeafIdToCanonIndex("];
        let clipBrdString = `func r_EntVisuTest(testsetups *[]*testsetup) {\n\tts := NewTestSetup(${this.nrOfData}*chunk.DefaultSize, ${this.alpha}, ${this.s}, ${this.p})\n\tfailedList := make([][]bf, ${this.alpha}+1)\n\t`;
        for(let i=0; i < this.textAreas.length; i++) {
            let ta = this.textAreas[i];
            clipBrdString += i < ListEnum.length ? ListEnum[i] : `failedList[${i}]`;
            if(!ta.textArea.value.length) {
                clipBrdString += " = empty \n\t"
                continue
            }
            clipBrdString += i < ListValue.length ? ListValue[i] : " = ts.ParityLeafIdToCanonIndex(";
            clipBrdString += ta.textArea.value.slice(0, ta.textArea.value.length - 1);
            clipBrdString += ")\n\t";
        }
        clipBrdString += '*testsetups = append(*testsetups, ts.AddTestFail(failedList, fmt.Sprintf("Generated from Entangle visulaizer 3D")))\n}'
        navigator.clipboard.writeText(clipBrdString);
    }

    /* Objects change state in this order: default(None), Unavailable(Uf), Delayed(sb), Delayed-Unavailable(sbf), default(none) ... */ 

    public SetUnavailable(index: number, strand: number | null) {
        let ta: TextAreaI = this.getTextArea(strand);
        ta.textArea.value += `uf(${index}),`;
    }

    public SetDelayed(index: number, strand: number | null) {
        let ta: TextAreaI = this.getTextArea(strand);
        let newValue: string;
        newValue = `sb(${index},${this.timeDelay.input.value ? this.timeDelay.input.value : 1000}),`
        ta.textArea.value = ta.textArea.value.replace(`uf(${index}),`, newValue);
    }

    public SetDelayedUnavailable(index: number, strand: number | null) {
        let ta: TextAreaI = this.getTextArea(strand);
        let regexString = "sb[(]" + index.toString() + ",[0-9]+"
        let startIdx = ta.textArea.value.search(regexString);

        ta.textArea.value = ta.textArea.value.slice(0, startIdx + 2) + "f" + ta.textArea.value.slice(startIdx + 2);
    }

    public RemoveIndex(index: number, strand: number | null) {
        let ta: TextAreaI = this.getTextArea(strand);
        let startIdx = ta.textArea.value.indexOf('sbf(' + index.toString());
        let endIdx = startIdx + ta.textArea.value.slice(startIdx).indexOf(")") + 2;
        ta.textArea.value = ta.textArea.value.slice(0,startIdx) + ta.textArea.value.slice(endIdx);
    } 

    private getTextArea(strand: number | null): TextAreaI {
        if(strand == null) {
            return this.textAreas[0];
        }
        return this.textAreas[strand + 1];
    }


    public Container: HTMLDivElement = document.createElement("div");
    private downloadBtn: HTMLButtonElement = document.createElement("button");
    private changeRulesBtn: HTMLButtonElement = document.createElement("button");
    private popUp: PopUp = new PopUp();
    private timeDelay: InputI = {
        container: document.createElement("div"),
        label: document.createElement("label"),
        input: document.createElement("input"),
    }
    private textAreas: TextAreaI[] = [];
    private alpha: number = 0;
    private s: number = 0;
    private p: number = 0;
    private nrOfData: number = 0;
    private visible: boolean = false;
    
}