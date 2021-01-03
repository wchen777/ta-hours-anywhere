import React from 'react'
import { Col, Image } from 'react-bootstrap'
import '../../../App.scss';
import { gql, useQuery } from '@apollo/client'
import classNames from 'classnames'

import { useMessageDispatch, useMessageState } from '../../../context/messages'

// ----------------------CODE HERE IS MOSTLY COPIED FROM STUDENT PAGE, CAN DEF REFACTOR THIS---------------------//

const GET_STUDENTS = gql`
    query getStudents{
        getMatchedStudents{
            username email createdAt imageUrl 
            latestMessage {
                uuid from to content createdAt
            }
        } 
    }
`
export default function InstructorMatches() {
    // react context for messages
    const dispatch = useMessageDispatch()
    const { users } = useMessageState()
    const selected = users?.find(u => u.selected === true)?.username

    // query to fetch matched Students on page load using context
    const { loading } = useQuery(GET_STUDENTS, {
        onCompleted: data => dispatch({ type: 'SET_USERS', payload: data.getMatchedStudents}),
        onError: err => console.log(err)
    })

   

    let usersMarkup
    if (!users || loading) {
        usersMarkup = <p className="default-match">Loading...</p>
    } else if (users.length === 0){
        usersMarkup = <p className="default-match">You haven't matched with any students yet.</p>
    } else if (users.length > 0){
        usersMarkup = users.map((student) => { 
            const s = selected === student.username
            const newM = student.latestMessage
            console.log(newM)
            return (<div 
                role="button"
                className={classNames('user-div d-flex p-3', {'bg-dark': s})}
                key={student.username} 
                onClick={() => dispatch({type: 'SET_SELECTED', payload: student.username})}>

                <Image src={student.imageUrl} className="mr-2 border pr-0 pro-pic"/>

                <div className="pl-2 d-none d-md-block"> 
                    <p className="text-warning m-0">{student.username}</p>
                    <p className={classNames("font-weight-light m-0", {"font-italic": !newM})}>
                        {newM ? 
                        (student.latestMessage.content.length > 38 ? 
                            student.latestMessage.content.substring(0, 35) + '...' : 
                            student.latestMessage.content) :
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
