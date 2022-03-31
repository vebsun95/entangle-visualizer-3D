import { COLORS } from "../../../SharedKernel/constants";
import { Parity, Vertex } from "../../../SharedKernel/interfaces";
import { strandRules } from "../constans/const";
import { RuleI } from "../interfaces/interface";

export { PopUp }

const layOut = /*html*/
    `
<div id="popup-bg">
    <div class="popup-container">
        <div id="popup-config">
            <div>
                <span>Config</span>
                <span>Connectivity Rules</span>
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
    private alpha: number | null = null;

    constructor() {
        this.Container.innerHTML = layOut;
        this.addEventListeners();
    }

    private addEventListeners() {
        (this.Container.querySelector("#submit-config") as HTMLButtonElement).onclick = this.configSubmited.bind(this);
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
        this.alpha = alpha;
        this.createRulesLayout();
    }

    private createRulesLayout() {
        (this.Container.querySelector("#popup-config")! as HTMLDivElement).style.display = "none";
        let c = this.Container.querySelector("#popup-rules")! as HTMLDivElement;
        while( c.children.length > 0 ) { c.removeChild(c.firstChild!) }
        c.style.display = "unset";
        var ruleFunc: string[] | null;
        var rule: RuleI;
        for (let i = 0; i < this.alpha!; i++) {
            rule = {
                container: document.createElement("div"),
                strand: document.createElement("span"),
                top: {
                    container: document.createElement("div"),
                    type: document.createElement("span"),
                    label: document.createElement("label"),
                    input: document.createElement("input")
                },
                middel: {
                    container: document.createElement("div"),
                    type: document.createElement("span"),
                    label: document.createElement("label"),
                    input: document.createElement("input"),
                },
                bot: {
                    container: document.createElement("div"),
                    type: document.createElement("span"),
                    label: document.createElement("label"),
                    input: document.createElement("input"),
                }
            };

            if (i < strandRules.length) {
                ruleFunc = strandRules[i];
            } else {
                ruleFunc = null;
            }

            rule.strand.innerText = "Strand #" + i;

            rule.top.type.innerText = "Top:";
            rule.top.label.innerText = "Function:";
            rule.top.label.setAttribute("for", "top" + i);
            rule.top.input.name = "top" + i;
            rule.top.input.classList.add("alpha" + i);
            rule.top.input.value = ruleFunc ? ruleFunc![0] : "";

            rule.middel.type.innerText = "Middle:";
            rule.middel.label.innerText = "Function:";
            rule.middel.label.setAttribute("for", "mid" + i);
            rule.middel.input.name = "mid" + i;
            rule.middel.input.classList.add("alpha" + i);
            rule.middel.input.value = ruleFunc ? ruleFunc![1] : "";

            rule.bot.type.innerText = "Bottom:";
            rule.bot.label.innerText = "Function:";
            rule.bot.label.setAttribute("for", "bot" + i);
            rule.bot.input.name = "bot" + i;
            rule.bot.input.classList.add("alpha" + i);
            rule.bot.input.value = ruleFunc ? ruleFunc![2] : "";

            rule.top.container.append(rule.top.type, rule.top.label, rule.top.input);
            rule.middel.container.append(rule.middel.type, rule.middel.label, rule.middel.input);
            rule.bot.container.append(rule.bot.type, rule.bot.label, rule.bot.input);
            rule.container.append(rule.strand, rule.top.container, rule.middel.container, rule.bot.container);
            c.append(rule.container);
        }

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
        let funcStrings: string[][] = Array(alpha); 
        for(let a=0; a < alpha; a++) {
            var strings = this.Container.querySelectorAll(".alpha" + a);
            funcStrings[a] = [];
            funcStrings[a].push((strings[0] as HTMLInputElement).value);
            funcStrings[a].push((strings[1] as HTMLInputElement).value);
            funcStrings[a].push((strings[2] as HTMLInputElement).value);
        }
        let nrdata = parseInt((q[0] as HTMLInputElement).value);
        let vertecies: Map<number, Vertex> = new Map();
        let parities: Map<number, Parity>[] = Array(alpha);
        for(let a=0; a < alpha; a++) {
            parities[a] = new Map();
        }
        let parityShift: Map<number, number> = new Map();
        let children: number[];
        let depth: number, parent: number, shiftedP: number, row: number;
        let to: number | null, from: number | null;
        let fnc: Function;
        let fncString: string; 
        for (let i=1; i<=nrdata; i++) {
            if(i < 129) {
                depth = 1;
                parent = 129;
                children = [];
                shiftedP = i;
            } else if (i == 129) {
                parent = 259;
                depth = 2;
                children = Array(128);
                for(let j = 1; j < 129; j++) {
                    children[j - 1] = j;
                }
                shiftedP = i + 1;
            } else if( i < 258) {
                parent = 258;
                depth = 1;
                children = []
                shiftedP = i + 1;
            } else if (i == 258) {
                parent = 259;
                depth = 2;
                children = Array(128);
                for(let j=130, k=0; k < 129; j++, k++) {
                    children[k] = j;
                }
                shiftedP = i+2;
            } else if (i == 259) {
                parent = 0;
                depth = 3;
                children = [129, 258];
                shiftedP = i+2;
            }
            parityShift.set(i, shiftedP!);
            vertecies.set(i, {Index: i, Children: children!, Color: COLORS.GREY, Depth: depth!, Parent: parent!, DamagedChildren: 0 });
        }
        for(let i=1; i<=nrdata + 5; i++) {
            for(let a=0; a<alpha; a++) {
                to = null;
                from = null;
                row = i % s;
                if(row == 1) {
                    row = 0;
                } else if (row > 1) {
                    row = 1;
                } else if (row == 0 ) {
                    row = 2;
                }
                fncString = "return " + funcStrings[a][row] + ";"
                fncString = fncString.replace( new RegExp("i", "g"), i.toString());
                fncString = fncString.replace( new RegExp("s", "g"), s.toString());
                fncString = fncString.replace( new RegExp("p", "g"), p.toString());
                fnc = new Function(fncString);
                if(i < 129) {
                    depth = 1;
                    parent = 129;
                    children = [];
                    from = i;
                    to = fnc();
                } else if (i == 129) {
                    parent = 263;
                    depth = 2;
                    children = Array(128);
                    for(let j = 1; j < 129; j++) {
                        children[j - 1] = j;
                    }
                } else if( i < 258) {
                    parent = 258;
                    depth = 1;
                    children = []
                    from = i - 1;
                    to = fnc() - 1;
                } else if (i == 258) {
                    parent = 263;
                    depth = 2;
                    children = Array(128);
                    for(let j=130, k=0; k < 129; j++, k++) {
                        children[k] = j;
                    }
                }  else if(i < 262) {
                    parent = 262;
                    depth = 1;
                    children = [];
                    from = i - 2;
                    to = fnc() - 2;
    
                } else if( i == 262) {
                    parent = 263;
                    depth = 2;
                    children = [259, 260, 261];
                } else if (i == 263) {
                    parent = 0;
                    depth = 3;
                    children = [129, 258, 262];
                }
                parities[a].set(i, {Index: i, Parent: parent!, Depth: depth!, Color:COLORS.GREY, Children: children!, DamagedChildren: 0, To: to, From: from})
            }
        }
        this.Container.dispatchEvent( new CustomEvent("data-generated", {detail: 
            {vertecies: vertecies, alpha: alpha, s: s, p:p, parities: parities, parityShift: parityShift}, bubbles: true}) );
    }
}