const express = require('express')
const app = express()
app.use(express.json())
var morgan = require('morgan')

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

/* const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:', request.path)
    console.log('Body:', request.path)
    console.log('---')
    next()
}

app.use(requestLogger) */

morgan.token('username', function(req, res){
    const person = persons.find(person => person.id === req.params.id)
    return person ? person.name : 'no-name';
})

morgan.token('number', function(req, res){
    const person = persons.find(person => person.id === req.params.id)
    return person ? person.number : 'no-number';
})


app.use(
    morgan('tiny'),
    morgan(function (tokens, req, res){
        return JSON.stringify({
            username: tokens.username(req, res),
            number: tokens.number(req, res)
        })
    })
)


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

//disables favicon.ico from showing in the console
app.get('/favicon.ico', (req, res) => res.status(204).end());

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

    const existingPerson = persons.find(person => person.name === body.name);

    if(!body.name){
        return response.status(400).json({
            error: 'number missing'
        })
    } else if(existingPerson){
        return response.status(400).json({
            error: "name must be unique"
        })
    }

    if(!body.number){
        return response.status(400).json({
            error: 'number missing'
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

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)

