//project state management
class ProjectState{
    private listeners: any[] = []
    private projects: any[] = []
    private static instance: ProjectState
    private constructor(){

    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }

    addlistener(listenerFn:Function){
        this.listeners.push(listenerFn)
    }

    addProject(title:string,description:string,numOfPeople:number){
         const newProject = {
             id:Math.random().toString(),
             title:title,
             description:description,
             people:numOfPeople
         }
         this.projects.push(newProject)
         for(const listenerFn of this.listeners){
             listenerFn(this.projects.slice())
         }
    }
}

const projectState = ProjectState.getInstance()

interface Validatable{
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number
    min?:number
    max?:number
}

function validdate(ValidatableINput:Validatable){
    let isvalid = true
    if(ValidatableINput.required){
        isvalid = isvalid && ValidatableINput.value.toString().trim().length !== 0
    }
    if(ValidatableINput.minLength != null && typeof ValidatableINput.value === 'string'){
        isvalid = isvalid && ValidatableINput.value.length >= ValidatableINput.minLength;
    }
    if(ValidatableINput.maxLength != null && typeof ValidatableINput.value === 'string'){
        isvalid = isvalid && ValidatableINput.value.length >= ValidatableINput.maxLength;
    }
    if(ValidatableINput.min != null && typeof ValidatableINput.value === 'number'){
        isvalid = isvalid && ValidatableINput.value >= ValidatableINput.min 
    }
    if(ValidatableINput.max != null && typeof ValidatableINput.value === 'number'){
        isvalid = isvalid && ValidatableINput.value <= ValidatableINput.max 
    }
    console.log('isvalid',isvalid)
    return isvalid
}

function autobind(_: any,
    _2: string,
    descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }

    return adjDescriptor;
}

//project list
class ProjectList{
    templateElement: HTMLTemplateElement;
    hostElememt: HTMLDivElement;
    element: HTMLElement;
    assignedProjects:any[];

    constructor(private type:'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElememt = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = []
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`

        projectState.addlistener((projects: any[]) => {
            this.assignedProjects = projects
            this.renderProjects()
        });
        this.attach()
        this.renderContent()
    } 

    private renderProjects(){
        const listEl =document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        for(const prjItem of this.assignedProjects){
            const listItem = document.createElement('li')
            listItem.textContent = prjItem.title
            listEl.appendChild(listItem)
        }
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS '
    }

    private attach(){
        this.hostElememt.insertAdjacentElement('beforeend', this.element)
    }
}


//project input
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElememt: HTMLDivElement;
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement
    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElememt = document.getElementById('app')! as HTMLDivElement;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input'

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

        this.configure()
        this.attach();
    }

    private getUserInput(): [string,string,number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titlevalidateble : Validatable ={
            value:enteredTitle,
            required:true
        }
        const Descriptionvalidateble : Validatable ={
            value:enteredDescription,
            required:true,
            minLength:5,

        }
        const Peoplevalidateble : Validatable ={
            value:enteredPeople,
            required:true,
            min:1,
            max:5
        }
        if(!validdate(titlevalidateble) || !validdate(Descriptionvalidateble) || !validdate(Peoplevalidateble)){
            alert('invalid input please try again')
            return;
        }else{
            return [enteredTitle,enteredDescription,+enteredPeople]
        }
    }

    private clearInputs(){
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }

    @autobind
    private submitHanlder(event: Event) {
        event.preventDefault()
        const userInput = this.getUserInput()
        if(Array.isArray(userInput)){
            const [title,desc,people] = userInput
            projectState.addProject(title,desc,people)
            this.clearInputs()
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHanlder)
    }

    private attach() {
        this.hostElememt.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')