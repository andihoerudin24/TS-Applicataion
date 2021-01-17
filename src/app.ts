class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElememt: HTMLDivElement;
    element: HTMLFormElement
    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElememt = document.getElementById('app')! as HTMLDivElement;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.attach();
    }

    private attach() {
        this.hostElememt.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput()