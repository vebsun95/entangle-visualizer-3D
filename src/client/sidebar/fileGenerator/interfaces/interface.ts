export interface RuleI {
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