const { User, Instructor, Message, Reaction } = require('../../models')
const { UserInputError, AuthenticationError, ForbiddenError, withFilter } = require('apollo-server')
const { Op } = require('sequelize')

// user from context contains authenticated user if it exists

module.exports = {
    Query: {
        getMessages: async (parent, { from }, { user }) => {
            try {
                if (!user) throw new AuthenticationError('unauthenticated')

                // find other party based on whether user is instructor or not
                const other = user.isInstructor ? await User.findOne({ where: { username: from } }) : await Instructor.findOne({ where: { username: from } })

                // error checking
                if (!other) throw new UserInputError('other user not found')

                // both users
                const usernames = [user.username, other.username]

                // query all messages that include both users, sorted by date
                // get all reactions that are in that list too
                const messages = await Message.findAll({
                    where: {
                        from: { [Op.in]: usernames },
                        to: { [Op.in]: usernames },
                    },
                    order: [['createdAt', 'DESC']],
                    include: [{ model: Reaction, as: 'reactions' }]
                })

                return messages
            } catch (err) {
                console.log(err)
                throw err
            }
        }
    },
    Mutation: {
        sendMessage: async (parent, { to, content }, { user, pubsub }) => {
            try {
                if (!user) throw new AuthenticationError('unauthenticated')

                // find recipient based on whether user is instructor or not
                const recipient = user.isInstructor ?
                    await User.findOne({ where: { username: to } }) :
                    await Instructor.findOne({ where: { username: to } })

                // error checking and validation
                if (!recipient) {
                    throw new UserInputError('user not found')
                } else if (recipient.username == user.username) {
                    throw new UserInputError('cannot message yourself')
                }

                if (content.trim() === '') {
                    throw new UserInputError('message is empty')
                }

                // new message instance
                const message = await Message.create({
                    from: user.username,
                    to,
                    content,
                })

                // fire subscription whenever new message is published for listener
                pubsub.publish('NEW_MESSAGE', { newMessage: message })

                return message

            } catch (err) {
                console.log(err)
                throw err
            }
        },
        reactToMessage: async (_, { uuid, content }, { user, pubsub }) => {
            const reactionTypes = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']
            try {

                // validation
                if (!reactionTypes.includes(content)) {
                    throw new UserInputError('invalid reaction type')
                }

                // get username from user 
                const username = user ? user.username : ''
                // run query to find user model 
                user = user.isInstructor ?
                    await Instructor.findOne({ where: { username } }) :
                    await User.findOne({ where: { username } })

                if (!user) throw new AuthenticationError('unauthenticated user')

                // obtain message through query
                const message = await Message.findOne({ where: { uuid } })
                if (!message) throw new UserInputError('message not found')

                if (message.from !== user.username && message.to !== user.username) {
                    throw new ForbiddenError('unauthorized')
                }

                // inefficient querying here, refactor?
                // const other = user.isInstructor ?
                // await User.findOne({ where: { username: message.to } }) :
                // await Instructor.findOne({ where: { username: message.to } })

                // reaction is owned by either a student or an instructor 

                // if user is instructor the owner is an instructor, so the studID field is null 
                const studId = user.isInstructor ? null : user.id
                // if user is student the owner is a student, so the instID field is null
                const instId = user.isInstructor ? user.id : null

                // either instructor or student/user id field will be populated depending on the ownership
                // the other field will always be null
                // try and create a reaction
                let reaction = await Reaction.findOne({
                    where: { messageId: message.id, userId: studId, instructorId: instId }
                })

                if (reaction) {
                    // if reaction exists, update it
                    reaction.content = content
                    await reaction.save()
                } else {
                    // if reaction does not exist, create a new one
                    reaction = await Reaction.create({
                        messageId: message.id,
                        userId: studId,
                        instructorId: instId,
                        content
                    })
                }

                // publish reaction event
                pubsub.publish('NEW_REACTION', { newReaction: reaction })
                // return it
                return reaction

            } catch (err) {
                console.log(err)
                throw err
            }
        }
    },
    Subscription: {
        // gql subscription w/ pub sub listener, for receiving messages
        newMessage: {
            subscribe: withFilter((_, __, { user, pubsub }) => {
                if (!user) throw new AuthenticationError('unauthenticated user')

                return pubsub.asyncIterator('NEW_MESSAGE')
            }, ({ newMessage }, _, { user }) => {
                // verify whether or not the logged in user is able to see the message
                // user can only see messages that are to or from them

                // newMessage from parent contains the new message object

                // return true if either message is from user or to user
                return (newMessage.from === user.username || newMessage.to === user.username)

            })
        },
        // similar concept for reactions
        newReaction: {
            subscribe: withFilter((_, __, { user, pubsub }) => {
                if (!user) throw new AuthenticationError('unauthenticated user')

                return pubsub.asyncIterator('NEW_REACTION')
            }, 
            async ({ newReaction }, _, { user }) => {

                const message = await newReaction.getMessage()

                return (message.from === user.username || message.to === user.username)

            })
        }
    }
}