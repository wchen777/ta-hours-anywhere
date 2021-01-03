import React, { useState } from 'react'
import { OverlayTrigger, Tooltip, Button, Popover } from 'react-bootstrap'
import classNames from 'classnames'
import moment from 'moment'

import { useAuthState } from '../context/auth'
import { gql, useMutation } from '@apollo/client'


const reactionTypes = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']

const REACT_TO_MESSAGE = gql`
    mutation reactToMessage($uuid: String! $content:String!){
        reactToMessage(uuid: $uuid, content: $content){
            uuid
        }
    }
`

// react to message gql mutation

export default function Message({ message, instructor }) {

    const { user } = useAuthState()
    const sent = message.from === user.username
    const received = !sent

    const [showPopover, setShowPopover] = useState(false)

    // list of reaction icons that are unique, hence set
    const reactionIcons = [...new Set(message.reactions.map(r => r.content))]

    const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
        onError: err => console.log(err),
        onCompleted: (data) => { 
            setShowPopover(false)
        }
    })

    const react = (reaction) => {
        reactToMessage({ variables: { uuid: message.uuid, content: reaction }})
    }

    
    // display for reacting to messages
    const reactButton = (
        <OverlayTrigger
            trigger="click"
            placement="top"
            show={showPopover}
            onToggle={setShowPopover}
            transition={false}
            rootClose
            overlay={
                <Popover className="rounded-pill">
                    <Popover.Content className="d-flex py-1 align-items-center react-button-popover">
                        {reactionTypes.map(reaction => (
                            <Button 
                                variant="link" 
                                key={reaction} 
                                onClick={() => react(reaction)}
                                className="react-icon-button">
                                {reaction}
                            </Button>))}
                    </Popover.Content>
                </Popover>
            }>
            <Button variant="link" className={classNames("px-2 react-button-smile-default", {
                "react-button-smile-clicked": showPopover
            })}>
                <i className="far fa-smile"></i>
            </Button>
        </OverlayTrigger>
    )
    return (
        <div className={classNames("d-flex my-2", {
            "ml-auto": sent,
            "mr-auto": received
        })}>
            {sent && reactButton}
            <OverlayTrigger
                placement={sent ? 'right' : 'left'}
                overlay={
                    <Tooltip >
                        {moment(message.createdAt).format('MMM DD, YYYY h:mm a')}
                    </Tooltip>
                }
            >


                <div className={classNames('py-2 px-3 rounded-pill position-relative', {
                    'bg-primary': sent && !instructor,
                    'bg-light': sent && instructor,
                    'bg-secondary': received
                })}>
                    {message.reactions.length > 0 && (
                        <div className="reactions-div bg-dark px-1 rounded-pill"> 
                        {reactionIcons} 
                        {/* {message.reactions.length}  */}
                        </div>
                    )}
                    <p className={classNames("mb-0", {
                        'text-white': sent
                    })} key={message.uuid}>{message.content}</p>
                </div>


            </OverlayTrigger>
            {received && reactButton}
        </div>
    )
}
