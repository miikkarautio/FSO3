require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('dist'))

var morgan = require('morgan')
const person = require('./models/person')

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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id '})
    }

    next(error)
}

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    console.log(persons)
    response.json(persons)
  })
  .catch(error => next(error))
})

app.get('/info/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(result => {
        response.json(result)
        console.log(result)
    })
    .catch(error => next(error))
})

//disables favicon.ico from showing in the console
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.delete('/info/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/info', (request, response, next) => {

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
    .catch(error => next(error))

})

app.put('/info/:id', (request, response, next) => {

    const { name, number } = request.body

    Person.findById(request.params.id)
        .then(changedNumber => {
            if(!changedNumber){
                return response.status(404).end()
            }

            changedNumber.name = name
            changedNumber.number = number

            return changedNumber.save().then((updatedNumber) => {
                response.json(updatedNumber)
            })

        })
        .catch(error => next(error))

})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


