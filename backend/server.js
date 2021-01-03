const { ApolloServer } = require('apollo-server');
const { sequelize } = require('./models')


// GraphQL Schema
const typeDefs = require('./graphql/typeDefs')

// map of functions which return data for the schema
const resolvers = require('./graphql/resolvers')

// check authentication
const contextMiddleware = require('./util/contextMiddleware')

// create new instance of ApolloServer
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: contextMiddleware,
})

// start server, connect to database
server.listen().then(({ url }) => {
    console.log(`Apollo Server ready at ${url}`)

    sequelize
        // try authentication
        .authenticate()
        // if successful
        .then(() => console.log('Database connected!'))
        // catch error
        .catch((err) => console.log(err))
    
})