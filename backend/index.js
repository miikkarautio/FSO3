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

app.delete('/info/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => console.log(error)) //lisää viel error handler -> "next"
})


app.post('/info', (request, response) => {

    const body = request.body

    if(!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    } else if(!body.number){
        return response.status(400).json({
            error: 'number is missing'
        })
    }
    
    Person.findOne({name: body.name}).then(existingPerson => {
        if(existingPerson){
            return response.status(400).json({
                error: 'name must be unique'
            })
        }

        const person = new Person({
            name: body.name || false,
            number: body.number || false,
        })

        person.save().then(savedPerson => {
            response.json(savedPerson)
        })
    })

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


