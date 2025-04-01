const express = require('express')
const app = express()
app.use(express.json())

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5423523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },  
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }   
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/info', (request, response) => {
    const count = persons.length; //Take count of how many people are in persons list
    let currentDate = new Date() //Get date 
    response.send(`
    <p>Phonebook has info for ${count.toString()} people</p> 
    <p>${currentDate} </p>`) 
})

app.get('/info/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    } else{
        response.status(404).end()
    }
})

app.delete('/info/:id', (request, response) =>{
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxIdMath = Math.random() * 100000
    return String(Math.floor(maxIdMath))
}

app.post('/info/persons', (request, response) => {
    const body = request.body

    if(!body.name){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const person = {
        name: body.name || false, 
        number: body.number || false,
        id: generateId(),
    }
    
    persons = persons.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)

