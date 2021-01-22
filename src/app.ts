//Project type
enum ProjectStatus { Active, Finished }
class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) {

    }
}

type Listener<T> = (items: T[]) => void

class State<T> {
    protected listeners: Listener<T>[] = []

    addlistener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
    
}

//project state management
class ProjectState extends State<Project> {
   
    private projects: Project[] = []
    private static instance: ProjectState
    private constructor() {
        super()
    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }

    

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople,
            ProjectStatus.Active
        )
        this.projects.push(newProject)
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance()

interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number
    min?: number
    max?: number
}

function validdate(ValidatableINput: Validatable) {
    let isvalid = true
    if (ValidatableINput.required) {
        isvalid = isvalid && ValidatableINput.value.toString().trim().length !== 0
    }
    if (ValidatableINput.minLength != null && typeof ValidatableINput.value === 'string') {
        isvalid = isvalid && ValidatableINput.value.length >= ValidatableINput.minLength;
    }
    if (ValidatableINput.maxLength != null && typeof ValidatableINput.value === 'string') {
        isvalid = isvalid && ValidatableINput.value.length >= ValidatableINput.maxLength;
    }
    if (ValidatableINput.min != null && typeof ValidatableINput.value === 'number') {
        isvalid = isvalid && ValidatableINput.value >= ValidatableINput.min
    }
    if (ValidatableINput.max != null && typeof ValidatableINput.value === 'number') {
        isvalid = isvalid && ValidatableINput.value <= ValidatableINput.max
    }
    console.log('isvalid', isvalid)
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

abstract class Components<T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    hostElememt: T;
    element: U;

    constructor(
        templateId: string,
        hostElement: string,
        insertAtstart: boolean,
        newElementId?: string | undefined) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElememt = document.getElementById(hostElement)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;

        if (newElementId) {
            this.element.id = newElementId
        }

        this.attach(insertAtstart)
    }

    private attach(insertAtBegining:boolean) {
        this.hostElememt.insertAdjacentElement(insertAtBegining ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure?():void
    abstract renderContent():void
}

// ProjectItem Class
class ProjectItem extends Components<HTMLUListElement,HTMLLIElement>{
    private project: Project
    constructor(hostId:string,project:Project){
        super('single-project',hostId,false,project.id)
        this.project = project
        this.configure()
        this.renderContent()
    }

    configure(){}
    renderContent(){
        this.element.querySelector('h2')!.textContent= this.project.title
        this.element.querySelector('h3')!.textContent= this.project.people.toString()
        this.element.querySelector('p')!.textContent= this.project.description

    }
}

//project list
class ProjectList extends Components<HTMLDivElement,HTMLElement> {
    assignedProjects: Project[];


    constructor(private type: 'active' | 'finished') {
        super('project-list','app',false,`${type}-projects`)
        this.assignedProjects = []
        this.configure()
        this.renderContent()
    }
    configure(){
        projectState.addlistener((projects: Project[]) => {
            const relevanProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active
                } else {
                    return prj.status === ProjectStatus.Finished
                }
            })
            this.assignedProjects = relevanProjects
            this.renderProjects()
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS '
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        listEl.innerHTML = ''
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id,prjItem)
        }
    }
}


//project input
class ProjectInput extends Components<HTMLDivElement,HTMLFormElement>{
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement
    constructor() {
        super('project-input','app',true,'user-input')
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement
        this.configure()
        
    }
    configure() {
        this.element.addEventListener('submit', this.submitHanlder)
    }

    renderContent(){

    }

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titlevalidateble: Validatable = {
            value: enteredTitle,
            required: true
        }
        const Descriptionvalidateble: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,

        }
        const Peoplevalidateble: Validatable = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5
        }
        if (!validdate(titlevalidateble) || !validdate(Descriptionvalidateble) || !validdate(Peoplevalidateble)) {
            alert('invalid input please try again')
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }

    @autobind
    private submitHanlder(event: Event) {
        event.preventDefault()
        const userInput = this.getUserInput()
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput
            projectState.addProject(title, desc, people)
            this.clearInputs()
        }
    }
}

const prjInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')