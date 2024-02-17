class Model{
    constructor(){
        this.todos = [
            {id:1,text:"faire les courses",completed:false},
            {id:2,text:"appeler la famille",completed:false}
        ]
    }

    addTodo(todoText){
        //Math.max(this.todos[0], this.todos[1], )
        var id = Math.max(...this.todos.map(t => t.id))+1
        const todo = {id:id , text:todoText , completed:false}
        this.todos.push(todo)
        this.onTodoListChanged(this.todos)
    }

    editTodo(id, newText){

        const todo = this.todos.find(todo => todo.id == id )
        todo.text=newText
        this.onTodoListChanged(this.todos)
    }

    deleteTodo(todoId){
       this.todos = this.todos.filter(todo => todo.id != todoId )
       this.onTodoListChanged(this.todos)

    }


    // Flip the complete boolean on the specified todo
  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo,
    )
    this.onTodoListChanged(this.todos)
  }


  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }

}

class View{
    constructor(){
        this.app = this.getElement('#root')

        this.title = this.createElement("h1", "title")
        this.title.innerHTML = 'Todos'

        // The form, with a [type="text"] input, and a submit button
        this.form = this.createElement('form')

        this.input = this.createElement('input')
        this.input.type = 'text'
        this.input.placeholder = 'Add todo'
        this.input.name = 'todo'

        this.submitButton = this.createElement('button')
        this.submitButton.textContent = 'Submit'

        // The visual representation of the todo list
        this.todoList = this.createElement('ul', 'todo-list')

        // Append the input and submit button to the form
        this.form.append(this.input, this.submitButton)

        // Append the title, form, and todo list to the app
        this.app.append(this.title, this.form, this.todoList)
    }


    displayTodos(todos) {
        // Delete all nodes
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild)
        }
        
        // Show default message
        if (todos.length === 0) {
            const p = this.createElement('p')
            p.textContent = 'Nothing to do! Add a task?'
            this.todoList.append(p)
        }
        else {
            // Create todo item nodes for each todo in state
            todos.forEach(todo => {
              const li = this.createElement('li')
              li.id = todo.id
          
              // Each todo item will have a checkbox you can toggle
              const checkbox = this.createElement('input')
              checkbox.type = 'checkbox'
              checkbox.checked = todo.complete
          
              // The todo item text will be in a contenteditable span
              const span = this.createElement('span')
              span.contentEditable = true
              span.classList.add('editable')
          
              // If the todo is complete, it will have a strikethrough
              if (todo.complete) {
                const strike = this.createElement('s')
                strike.textContent = todo.text
                span.append(strike)
              } else {
                // Otherwise just display the text
                span.textContent = todo.text
              }
          
              // The todos will also have a delete button
              const deleteButton = this.createElement('button', 'delete')
              deleteButton.textContent = 'Delete'
              li.append(checkbox, span, deleteButton)
          
              // Append nodes to the todo list
              this.todoList.append(li)
            })
          }
      }

    getElement(selector){
      var element =  document.querySelector(selector)
      return element 
    }

    createElement(tagName, className){
        const element = document.createElement(tagName)
        if (className) element.classList = className
        return element
    }

    bindAddTodo(handler) {
        this.form.addEventListener('submit', event => {
          event.preventDefault()
      
          if (this._todoText) {
            handler(this._todoText)
            this._resetInput()
          }
        })
      }
      
      bindDeleteTodo(handler) {
        this.todoList.addEventListener('click', event => {
          if (event.target.className === 'delete') {
            const id = parseInt(event.target.parentElement.id)
      
            handler(id)
          }
        })
      }
      
      bindToggleTodo(handler) {
        this.todoList.addEventListener('change', event => {
          if (event.target.type === 'checkbox') {
            const id = parseInt(event.target.parentElement.id)
      
            handler(id)
          }
        })
      }


    get _todoText() {
        return this.input.value
      }
      
      _resetInput() {
        this.input.value = ''
      }


}

class Controller{
    constructor(model,view){
        this.model=model
        this.view=view

        this.onTodoListChanged(this.model.todos)
        this.model.bindTodoListChanged(this.onTodoListChanged)
        this.view.bindAddTodo(this.handleAddTodo)
    }

    onTodoListChanged = (todos) => {
        this.view.displayTodos(todos)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindToggleTodo(this.handleToggleTodo)

        localStorage.setItem('todos', JSON.stringify(todos))
      }

    
      handleAddTodo = (todoText) => {
        this.model.addTodo(todoText)
      }
      
      handleEditTodo = (id, todoText, deleted) => {
        this.model.editTodo(id, todoText, deleted)
      }
      
      handleDeleteTodo = (id) => {
        this.model.deleteTodo(id)
      }

      handleToggleTodo = (id) => {
        this.model.toggleTodo(id)
      }
}


const model = new Model()

model.todos = JSON.parse(localStorage.getItem("todos"))

const app = new Controller(model,new View())
