const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/env.json')
const { PubSub } = require('apollo-server')

// pub sub instance for gql subscription, pass it down to resolvers
const pubsub = new PubSub()

module.exports = context => {
    // context object middleware passes information that resolvers will need

    let token
    // authorization for get users, verify that a validated user is issuing the request
    if (context.req && context.req.headers.authorization) {
        token = context.req.headers.authorization.split('Bearer ')[1]
    }
    // get authorization for subscriptions from web sockets
    else if (context.connection && context.connection.context.Authorization) {
        token = context.connection.context.Authorization.split('Bearer ')[1]
    }

    // verify if token exists
    if (token){
        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            context.user = decodedToken
        })
    }

    context.pubsub = pubsub 

    // if verification failed or there was no login, user will be empty when context object is passed into resolvers

    return context
}