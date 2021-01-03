import React, { useEffect } from 'react'
import { Row } from 'react-bootstrap'
import '../../App.scss';
import { gql, useSubscription } from '@apollo/client'

import InstructorMatches from './instructor-chats/InstructorMatches';
import InstructorMessages from './instructor-chats/InstructorMessages';

import { useMessageDispatch } from '../../context/messages'
import { useAuthState } from '../../context/auth';

const NEW_MESSAGE = gql`
    subscription newMessage{
        newMessage{
            uuid from to content createdAt
        }
    }
`

const NEW_REACTION = gql`
    subscription newReaction{
        newReaction{
            uuid content 
            message {
                uuid from to
            }
        }
    }
`


export default function MainInstructor() {
    const dispatch = useMessageDispatch()
    const { user } = useAuthState()

    const { data: messageData, error: messageError } = useSubscription(NEW_MESSAGE)

    const { data: reactionData, error: reactionError } = useSubscription(NEW_REACTION)

    useEffect(() => {
        if (messageError) console.log(messageError)

        if (messageData) {
            const message = messageData.newMessage
            // otherUser is either the to or from of the message
            const otherUser = user.username === message.to ? message.from : message.to

            dispatch({ type: 'ADD_MESSAGE', payload: {
                username: otherUser,
                message: message
            }})
        }
    }, [messageError, messageData])

    useEffect(() => {
        if (reactionError) console.log(reactionError)

        if (reactionData) {
            const reaction = reactionData.newReaction
            // otherUser is either the to or from of the message
            const otherUser = user.username === reaction.message.to ? reaction.message.from : reaction.message.to

            dispatch({ type: 'ADD_REACTION', payload: {
                username: otherUser,
                reaction
            }})
        }
    }, [reactionError, reactionData])
    

    return (
        <Row className="bg-white" > 
            <InstructorMatches /> 
            <InstructorMessages />

        </Row>
    )
}
