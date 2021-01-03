import React, { useEffect, Fragment, useState } from 'react'
import {  Col, Form } from 'react-bootstrap'
import '../../../App.scss';
import { gql,  useLazyQuery, useMutation } from '@apollo/client'
import Message from '../../Message'

import { useMessageDispatch, useMessageState } from '../../../context/messages'

// gql query to get all messages from a certain user
const GET_MESSAGES = gql`
    query getMessages($from: String!){
        getMessages(from: $from){
            uuid from to content createdAt
            reactions{
                uuid
                content
            }
        }
    }
`

// gql mutation to send a message 
const SEND_MESSAGE = gql`
    mutation sendMessage($to: String!, $content: String!) {
        sendMessage(to: $to, content: $content) {
            uuid from to content createdAt
        }
    }
`

export default function StudentMessages() {
    // context for messages
    const dispatch = useMessageDispatch()
    const { users } = useMessageState()
    const [content, setContent] = useState('')

    // find selected user and their messages
    const selected = users?.find(u => u.selected === true)
    const messages = selected?.messages

    // get existing messages from user, call query
    const [getMessages, { loading: messagesLoading, data: messagesData}] = useLazyQuery(GET_MESSAGES)

    // grab messages from selected user
    useEffect(() => {
        if (selected && !selected.messages) {
            getMessages({ variables: { from: selected.username }})
        }
    }, [selected])

    // if we got messages
    useEffect(() => {
        if (messagesData) {
            dispatch({type: 'SET_USER_MESSAGES', payload: {
                username: selected.username,
                messages: messagesData.getMessages
            }})
        }
    }, [messagesData])

    // call mutation to send message, message will be retrived from context in StudentChat component
    const [sendMessage] = useMutation(SEND_MESSAGE, {
        onError: err => console.log(err)
    })

    // submit message form handler
    const submitMessage = e => {
        e.preventDefault()
        setContent('')
        // validation
        if (content.trim() === '' || !selected) return

        // mutation for sending the message
        sendMessage({ variables: { to: selected.username, content }})
    }

    let selectedChatMarkup
    if (messagesLoading){
        selectedChatMarkup = <p className="default-info"> Loading ... </p>
    } else if (!messages && !messagesLoading) {
        selectedChatMarkup = <p className="default-display"> 
        Welcome to your chats page!  
        <br/> <br/> Select an instructor from your matched list 
        <br/> on the left to start chatting! 
        <br/> <br/> Click the {'\u2728'} Match Me! {'\u2728'} button in the top left
        <br/> to be matched with an instructor! </p>
    } else if (messages.length > 0) {
        selectedChatMarkup = messages.map((message, index) => (
            <Fragment key={message.uuid} > 
                <Message message={message}/>
                {index === messages.length - 1 && (
                    <div className="invisible">
                        <hr className="m-0"/> 
                    </div>
                )}
            </Fragment>
        ))
    } else if (messages.length === 0) {
        selectedChatMarkup = <p className="default-info"> You are now connected! Reach out to your instructor! </p>
    }
    return (
    <Col xs={10} md={8} className="p-0">
        <div className="messages-box d-flex flex-column-reverse p-3">
            {selectedChatMarkup}
        </div>
         <div className="pt-3 px-3 py-2">
            <Form onSubmit={submitMessage}> 
                    <Form.Group className="d-flex align-items-center m-1">
                        <Form.Control
                            type="text"
                            className="rounded-pill bg-secondary border-0 msg-input p-4"
                            placeholder="Type a message..."
                            value={content}
                            onChange={e => setContent(e.target.value)}/> 
                            <i className="fas fa-paper-plane fa-2x text-primary ml-2" role="button" onClick={submitMessage}></i>
                    </Form.Group>
                </Form>
        </div> 
    </Col>
    )
}
