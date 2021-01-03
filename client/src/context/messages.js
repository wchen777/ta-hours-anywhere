import React, { createContext, useReducer, useContext } from 'react'

// context for messages

const MessageStateContext = createContext()
const MessageDispatchContext = createContext()

const MessageReducer = (state, action) => {

    // declarations

    // copy of users 
    let usersC
    // user index in array
    let userIndex 
    const { username, message, messages, reaction } = action.payload

    switch(action.type){
        case 'SET_USERS':
            return {
                ...state,
                users: action.payload
            }
        case "SET_USER_MESSAGES":
            usersC = [...state.users]
            userIndex = usersC.findIndex(u => u.username === username)

            usersC[userIndex] = {...usersC[userIndex], messages}
            return {
                ...state,
                users: usersC
            }
        case 'SET_SELECTED':
            usersC = state.users.map(user => ({
                ...user,
                selected: user.username === action.payload
            }))
            return {
                ...state,
                users: usersC
            }
        case 'ADD_MESSAGE': 
            usersC = [...state.users]
            userIndex = usersC.findIndex(u => u.username === username)

            // initialize with empty reactions array, no reactions
            message.reactions = []

            // copy of single user with new attributes, if no user is selected, don't fetch new messages yet
            let newUser = {
                ...usersC[userIndex],
                messages: usersC[userIndex].messages ? [message, ...usersC[userIndex].messages] : null,
                latestMessage: message
            }

            usersC[userIndex] = newUser

            return {
                ...state,
                users: usersC
            }
        case 'ADD_REACTION':
            usersC = [...state.users]
            userIndex = usersC.findIndex(u => u.username === username)

            // A LITTLE CONFUSING HERE SAME CONCEPT AS ADD MESSAGE CODE
            // CONCEPT IS THAT WE ARE COPYING OBJECTS AND ASSIGNING TO PROPERTIES,
            // AND THEN REASSINING THAT COPIED OBJECT IN PLACE OF THE ORIGINAL TO UPDATE THEM

            // shallow copy of user
            let userC = { ...usersC[userIndex]}

            // find index of message that this reaction pertains to
            const messageIndex = userC.messages?.findIndex(m => m.uuid === reaction.message.uuid)

            if (messageIndex > -1) {
                // shallow copy of user messages
                let messagesC = [...userC.messages]

                // shallow copy ofuser message recations
                let reactionsC = [...messagesC[messageIndex].reactions]

                const reactionIndex = reactionsC.findIndex(r => r.uuid === reaction.uuid)

                if (reactionIndex > -1) {
                    // reaction exists, update it
                    reactionsC[reactionIndex] = reaction
                } else {
                    // new reaction, add it
                    reactionsC = [...reactionsC, reaction]
                }

                // replace existing message with new message copy
                messagesC[messageIndex] = {
                    ...messagesC[messageIndex],
                    reactions: reactionsC
                }
                userC = {...userC, messages: messagesC }
                usersC[userIndex] = userC

            }

            return {
                ...state,
                users: usersC
            }
        default:
            throw new Error(`unknown action type: ${action.type}`)
    }
}

export const MessageProvider = ({ children }) => {
    const [state, dispatch] = useReducer(MessageReducer, { users: null })

    return (
        <MessageDispatchContext.Provider value={dispatch}>
            <MessageStateContext.Provider value={state}>
                {children}
            </MessageStateContext.Provider>
        </MessageDispatchContext.Provider>
    )
}

export const useMessageState = () => useContext(MessageStateContext)
export const useMessageDispatch = () => useContext(MessageDispatchContext)