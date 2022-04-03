import { strandRules } from "../../constans/const";
import { RuleI } from "../../interfaces/interface";

export { GenerateRuleLayout }

function GenerateRuleLayout(alpha: number, c: HTMLDivElement) {
    var ruleFunc: string[] | null;
    var rule: RuleI;
    var header = document.createElement("h1");
    header.innerText = "Rules";
    c.append(header);
    for (let i = 0; i < alpha; i++) {
        rule = {
            container: document.createElement("fieldset"),
            strand: document.createElement("legend"),
            top: {
                container: document.createElement("div"),
                label: document.createElement("label"),
                input: document.createElement("input")
            },
            mid: {
                container: document.createElement("div"),
                label: document.createElement("label"),
                input: document.createElement("input"),
            },
            bot: {
                container: document.createElement("div"),
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

        rule.top.label.innerText = "Top:";
        rule.top.label.setAttribute("for", "top" + i);
        rule.top.input.name = "top" + i;
        rule.top.input.classList.add("alpha" + i);
        rule.top.input.value = ruleFunc ? ruleFunc![0] : "";
        rule.top.container.append(rule.top.label, rule.top.input);

        rule.mid.label.innerText = "Middle:";
        rule.mid.label.setAttribute("for", "mid" + i);
        rule.mid.input.name = "mid" + i;
        rule.mid.input.classList.add("alpha" + i);
        rule.mid.input.value = ruleFunc ? ruleFunc![1] : "";
        rule.mid.container.append(rule.mid.label, rule.mid.input);

        rule.bot.label.innerText = "Bottom:";
        rule.bot.label.setAttribute("for", "bot" + i);
        rule.bot.input.name = "bot" + i;
        rule.bot.input.classList.add("alpha" + i);
        rule.bot.input.value = ruleFunc ? ruleFunc![2] : "";
        rule.bot.container.append(rule.bot.label, rule.bot.input);

        rule.container.append(rule.strand, rule.top.container, rule.mid.container, rule.bot.container);

        c.append(rule.container);
    }
}