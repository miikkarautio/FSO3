require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('dist'))

var morgan = require('morgan')


morgan.token('user', function(req, res){
    return req.body.name || 'no-name';
})

morgan.token('num', function(req, res){
    return req.body.number || 'no-num';
})

app.use(
    morgan('tiny'),
    morgan(function (tokens, req, res){
        return JSON.stringify({
            user: tokens.user(req, res),
            num: tokens.num(req, res)
        })
    })
)


//Leaving it here if it needs to be used
/* app.get('/info', (request, response) => {
    const count = persons.length; //Take count of how many people are in persons list
    let currentDate = new Date() //Get date 
    response.send(`
    <p>Phonebook has info for ${count.toString()} people</p> 
    <p>${currentDate} </p>`) 
}) */


app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    console.log(persons)
    response.json(persons)
  })
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

app.post('/info', (request, response) => {

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

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


