export {RuleI, TextAreaI, InputI}

interface RuleI {
    container: HTMLFieldSetElement,
    strand: HTMLLegendElement,
    top: InputLabelI,
    mid: InputLabelI,
    bot: InputLabelI,
}

interface InputLabelI {
    container: HTMLDivElement,
    label: HTMLLabelElement,
    input: HTMLInputElement,
}

interface TextAreaI {
    containter: HTMLDivElement,
    textArea: HTMLTextAreaElement,
    label: HTMLLabelElement,
}

interface InputI {
    container: HTMLDivElement,
    label: HTMLLabelElement,
    input: HTMLInputElement,
}