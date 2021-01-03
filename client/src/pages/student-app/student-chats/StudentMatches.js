import React from 'react'
import { Col, Image } from 'react-bootstrap'
import '../../../App.scss';
import { gql, useQuery } from '@apollo/client'
import classNames from 'classnames'

import { useMessageDispatch, useMessageState } from '../../../context/messages'


const GET_INSTRUCTORS = gql`
    query getInstructors{
        getMatchedInstructors{
            username email createdAt imageUrl 
            latestMessage {
                uuid from to content createdAt
            }
        } 
    }
`
export default function StudentMatches() {
    // react context for messages
    const dispatch = useMessageDispatch()
    const { users } = useMessageState()
    const selected = users?.find(u => u.selected === true)?.username

    // query to fetch matched instructors on page load using context
    const { loading } = useQuery(GET_INSTRUCTORS, {
        onCompleted: data => dispatch({ type: 'SET_USERS', payload: data.getMatchedInstructors}),
        onError: err => console.log(err)
    })

   

    let usersMarkup
    if (!users || loading) {
        usersMarkup = <p className="default-match">Loading...</p>
    } else if (users.length === 0){
        usersMarkup = <p className="default-match">You haven't matched with any instructors yet.</p>
    } else if (users.length > 0){
        usersMarkup = users.map((instructor) => { 
            const s = selected === instructor.username
            const newM = instructor.latestMessage
            return (<div 
                role="button"
                className={classNames('user-div d-flex p-3', {'bg-dark': s})}
                key={instructor.username} 
                onClick={() => dispatch({type: 'SET_SELECTED', payload: instructor.username})}>

                <Image src={instructor.imageUrl} className="mr-2 border pr-0 pro-pic"/>

                <div className="pl-2 d-none d-md-block"> 
                    <p className="text-info m-0">{instructor.username}</p>
                    <p className={classNames("font-weight-light m-0", {"font-italic": !newM})}>
                        {newM ? 
                        (instructor.latestMessage.content.length > 38 ? 
                            instructor.latestMessage.content.substring(0, 35) + '...' : 
                            instructor.latestMessage.content) :
                         'New match - you are now connected!'}
                    </p>
                </div>    
            </div>
        )})
    }
    return (
        <Col xs={2} md={4} className="p-0 bg-secondary">
            {usersMarkup}
        </Col>
    )
}
