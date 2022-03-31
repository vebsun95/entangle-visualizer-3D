import { strandRules } from "../../constans/const";
import { RuleI } from "../../interfaces/interface";

export { GenerateRuleLayout }

function GenerateRuleLayout(alpha: number, c: HTMLDivElement) {
    var ruleFunc: string[] | null;
    var rule: RuleI;
    for (let i = 0; i < alpha; i++) {
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
}