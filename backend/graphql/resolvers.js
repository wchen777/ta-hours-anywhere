const userResolvers = require('./resolvers/usersResolvers')
const messageResolvers = require('./resolvers/messageResolvers')

const { User, Message, Instructor } = require('../models')

// get all resolvers all in one place 
module.exports = {
    StudOrInst: {
        ...userResolvers.StudOrInst
    },
    Message: {
        createdAt: (parent) => parent.createdAt.toISOString()
    },
    Reaction: {
        createdAt: (parent) => parent.createdAt.toISOString(),
        message: async (parent) => await Message.findByPk(parent.messageId),
        user: async (parent) => parent.userId ?  await User.findByPk(parent.userId) : null,
        instructor: async (parent) => parent.instructorId ? await Instructor.findByPk(parent.instructorId) : null
    },
    Query: {
        ...userResolvers.Query,
        ...messageResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...messageResolvers.Mutation,
    },
    Subscription: {
        ...messageResolvers.Subscription,
    }
}