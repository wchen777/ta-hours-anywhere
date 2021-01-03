const { User, Instructor, Message } = require('../../models')
const bcrypt = require('bcryptjs')
const { UserInputError, AuthenticationError, ApolloError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../config/env.json')
const { Op } = require('sequelize')
const { instructorImages, studentImages } = require('./imageLinks')

// user from context contains authenticated user if it exists

module.exports = {
    StudOrInst: {
        __resolveType(obj, context, info){
            if(obj.isInstructor){
              return 'Instructor';
            } else {
                return 'User'
            }
          },
    },
    Query: {
        getUsers: async (_, __, { user }) => {
            try {
                // user is object that issued getUser, passed into by context middleware
                if (!user) throw new AuthenticationError('unauthenticated user')

                // get users except for current user
                const users = await User.findAll({
                    where: { username: { [Op.ne]: user.username } }
                })

                return users

            } catch (err) {
                console.log(err)
                throw err
            }
        },
        getInstructors: async (_, __, { user }) => {
            try {
                // user is object that issued getUser, passed into by context middleware
                if (!user) throw new AuthenticationError('unauthenticated user')

                // get users except for current instructor
                const instructors = await Instructor.findAll({
                    where: { username: { [Op.ne]: user.username } }
                })

                return instructors

            } catch (err) {
                console.log(err)
                throw err
            }
        },
        login: async (_, args) => {
            // destructure args input parameter
            const { username, password, isInstructor } = args
            // errors object
            let errors = {}

            try {
                // validation for inputs
                if (username.trim() === '') errors.username = 'username must not be empty'
                if (password === '') errors.password = 'password must not be empty'

                // if errors object is non-empty, we have encountered an error
                if (Object.keys(errors).length > 0) {
                    throw new UserInputError('bad login info', { errors })
                }

                // search db for student/instructor, create new object based on if student or instructor
                let user
                if (isInstructor) {
                    user = await Instructor.findOne({
                        where: { username }
                    })
                } else {
                    user = await User.findOne({
                        where: { username }
                    })
                }

                // const user = await User.findOne({
                //     where: { username }
                // })

                // if user is not found
                if (!user) {
                    errors.username = 'user not found'
                    throw new UserInputError('user not found', { errors })
                }


                // if user is found, check if password matches
                const correctPassword = await bcrypt.compare(password, user.password)

                // incorrect password
                if (!correctPassword) {
                    errors.password = 'password is incorrect'
                    throw new UserInputError('password is incorrect', { errors })
                }

                // if successful auth, issue a jwt (w/ 1 hour expiration) and send it back 
                const token = jwt.sign({ username, isInstructor }, JWT_SECRET, { expiresIn: '1h' });
                // append token to user json object
                user.token = token

                // fix timestamp for createdAt
                return {
                    ...user.toJSON(),
                    createdAt: user.createdAt.toISOString(),
                    token,
                }


            } catch (err) {
                console.log(err)
                throw err
            }
        },
        getMatchedStudents: async (_, __, { user }) => {
            try {
                // user is object that issued getUser, passed into by context middleware
                if (!user) throw new AuthenticationError('unauthenticated user')


                // get current instructor, because we are searching for students
                const currInstructor = await Instructor.findOne({
                    where: { username: user.username }
                })

                // array of Users that match usernames in matches array
                let matchedStudents = await User.findAll({
                    where: { username: { [Op.in]: currInstructor.matches } }
                })

                // all messages that container the user
                const allMsgsBetween = await Message.findAll({
                    where: {
                        [Op.or]: [{ from: user.username }, { to: user.username }]
                    },
                    order: [['createdAt', 'DESC']]
                })

                // set latest messages for all matched users
                matchedStudents = matchedStudents.map(inst => {
                    const latestMessage = allMsgsBetween.find(
                        m => m.from === inst.username || m.to === inst.username
                    )
                    inst.latestMessage = latestMessage
                    return inst
                })
                
                return matchedStudents

            } catch (err) {
                console.log(err)
                throw err
            }
        },
        getMatchedInstructors: async (_, __, { user }) => {
            try {
                // user is object that issued getUser, passed into by context middleware
                if (!user) throw new AuthenticationError('unauthenticated user')

                // get current student, because we are searching for instructors
                const currUser = await User.findOne({
                    where: { username: user.username }
                })

                // array of Instructors that match usernames in matches array
                let matchedInstructors = await Instructor.findAll({
                    where: { username: { [Op.in]: currUser.matches } }
                })

                // all messages that container the user
                const allMsgsBetween = await Message.findAll({
                    where: {
                        [Op.or]: [{ from: user.username }, { to: user.username }]
                    },
                    order: [['createdAt', 'DESC']]
                })

                // set latest messages for all matched instructors
                matchedInstructors = matchedInstructors.map(inst => {
                    const latestMessage = allMsgsBetween.find(
                        m => m.from === inst.username || m.to === inst.username
                    )
                    inst.latestMessage = latestMessage
                    return inst
                })

                return matchedInstructors

            } catch (err) {
                console.log(err)
                throw err
            }
        },
    },
    Mutation: {
        register: async (_, args) => {
            // destructure args, which contains data from register mutation
            let { username, email, password, confirmPassword } = args
            // errors object storing any potential mishaps
            let errors = {}

            try {
                // 1. validate input data, check if username, email exists
                // 2. hash password
                // 3. if valid, create a new user and return user to new client

                // validation, check empty inputs
                if (email.trim() === '') errors['users.email'] = 'email must not be empty'
                if (username.trim() === '') errors['users.username'] = 'username must not be empty'
                if (password.trim() === '') errors.password = 'password must not be empty'
                if (confirmPassword.trim() === '') errors.confirmPassword = 'repeat password must not be empty'

                // confirm password = password
                if (password !== confirmPassword) errors.confirmPassword = 'passwords must match'

                // // ensure no duplicate users in instructor db by username (check other db so no cross duplicates)
                const existingUser = await Instructor.findOne({ where: { username }})

                // // abovve variable should be empty if there were no duplicates
                if (existingUser) errors['users.username'] = 'username is taken'


                // if we made it here with the errors object being empty, then everything went smoothly
                // otherwise, throw the errors to break the try block
                if (Object.keys(errors).length > 0) {
                    throw errors
                }

                // salt and hash password
                password = await bcrypt.hash(password, 6)

                // successful! create new user/student
                const newUser = await User.create({
                        username,
                        email,
                        password,
                        imageUrl: studentImages[Math.floor(Math.random() * studentImages.length)],
                        matches: []
                    })
                
                // returns json of user given validation passed
                return newUser

            } catch (err) {
                console.log(err)
                // sequelize constraints error checking
                if (err.name === 'SequelizeUniqueConstraintError') {
                    err.errors.forEach(
                        (e) => (errors[e.path] = `${e.value} is already taken`)
                    )
                } else if (err.name === 'SequelizeValidationError') {
                    err.errors.forEach(
                        (e) => (errors[e.path] = e.message)
                    )
                }
                throw new UserInputError('faulty input', { errors })
            }
        },
        registerInstructor: async (_, args) => {
            // destructure args, which contains data from register mutation
            let { username, email, password, confirmPassword } = args
            // errors object storing any potential mishaps
            let errors = {}

            try {
                // 1. validate input data, check if username, email exists
                // 2. hash password
                // 3. if valid, create a new user and return instructor to new client

                // validation, check empty inputs
                if (email.trim() === '') errors['users.email'] = 'email must not be empty'
                if (username.trim() === '') errors['users.username'] = 'username must not be empty'
                if (password.trim() === '') errors.password = 'password must not be empty'
                if (confirmPassword.trim() === '') errors.confirmPassword = 'repeat password must not be empty'

                // confirm password = password
                if (password !== confirmPassword) errors.confirmPassword = 'passwords must match'

                // // ensure no duplicate users in student db by username
                const existingUser = await User.findOne({ where: { username }})

                // // abovve variable should be empty if there were no duplicates
                if (existingUser) errors['instructors.username'] = 'username is taken'


                // if we made it here with the errors object being empty, then everything went smoothly
                // otherwise, throw the errors to break the try block
                if (Object.keys(errors).length > 0) {
                    throw errors
                }

                // salt and hash password
                password = await bcrypt.hash(password, 6)

                // successful! create new user/student
                const newInstructor = await Instructor.create({
                        username,
                        email,
                        password,
                        imageUrl: instructorImages[Math.floor(Math.random() * instructorImages.length)],
                        isInstructor: true,
                        matches: []
                    })
                
                // returns json of user given validation passed
                return newInstructor

            } catch (err) {
                console.log(err)
                // sequelize constraints error checking, duplicate user/instructor w/in own user/instructor db
                if (err.name === 'SequelizeUniqueConstraintError') {
                    err.errors.forEach(
                        (e) => (errors[e.path] = `${e.value} is already taken`)
                    )
                } else if (err.name === 'SequelizeValidationError') {
                    err.errors.forEach(
                        (e) => (errors[e.path] = e.message)
                    )
                }
                throw new UserInputError('faulty input', { errors })
            }
        },
        match: async (_, __, { user }) => {
            // function issued by a student to match with a random instructor, adding their username to the student's matched list, 
            // adding the student's username to the instructors matched list

            //  REFACTOR THIS LATER: 
            //  Have separate tables for each topic, with each table containing instructor usernames
            //  pass in a topic of choice into args and then select a random username from that table based on the topic query

            // RIGHT NOW: pick a random instructor 
            try {
                // user is object that issued getUser, passed into by context middleware
                if (!user) throw new AuthenticationError('unauthenticated user') 

                // should never reach here, but for safety
                if (user.isInstructor) throw new UserInputError('cannot search as an instructor')

                // get current student, because we are searching for instructors
                const currUser = await User.findOne({
                    where: { username: user.username }
                })

                // all possible instructors
                const all = await Instructor.findAll({
                    where: { username: { [Op.notIn]: currUser.matches } }
                })

                // matched instructor
                const matched = all[Math.floor(Math.random() * all.length)]

                // if we have found a match, set fields, otherwise throw an error
                if (matched) {
                    // add student username to instructor
                    matched.matches = [...matched.matches, user.username]
                    // add instructor username to student
                    currUser.matches = [...currUser.matches, matched.username]
                } else {
                    throw new ApolloError('Sorry, no more instructors available at this time!')
                }



                await matched.save()
                await currUser.save()
                
                return matched

            } catch (err) {
                console.log(err)
                throw err
            }
        },
    }
}