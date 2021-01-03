import React, { useState } from 'react'
import '../../App.scss';
import { Container, Row, Button } from 'react-bootstrap'
import StudentChat from './StudentChat'
import StudentProfile from './StudentProfile'
import StudentHome from './StudentHome'
import StudentMatchPopup from './StudentMatchPopup';

import { useAuthDispatch } from '../../context/auth';

import { gql, useMutation } from '@apollo/client'



// --------------REFACTOR THE MATCH CODE SOMEWHERE ELSE, HERE RN AS A PROTOTYPE-------------- // 

// gql mutation to match with an instructor
const MATCH = gql`
    mutation match {
        match{
            username email createdAt matches
        }
    }
`

// ------------------------------------------------------------------------------------------//

export default function MainStudent({ history }) {
    // auth context 
    const dispatch = useAuthDispatch()

    // state for conditional rendering, set to chats on login
    const [selectedPage, setSelectedPage] = useState('Chats')

    

    // on logout
    const logout = () => {
        dispatch({ type: 'LOGOUT' })
        window.location.href = '/login-student'
    }
    
    // --------------REFACTOR THE MATCH CODE SOMEWHERE ELSE, HERE RN AS A PROTOTYPE-------------- // 

    // state for match info
    const [matchedUser, setMatchedUser] = useState('')

    const[show, setPopup] = useState(false)

    const setMatchInfo = (data) => {
        console.log(data)
        data ? setMatchedUser(data.username) : setMatchedUser('')
        setPopup(true)
    }

    const [match, { data }] = useMutation(MATCH, {
        onCompleted: (data) => setMatchInfo(data.match),
        onError: err => {
            console.log(err)
            setMatchInfo(null)
        }
    })

    // ------------------------------------------------------------------------------------------//

    return (
            <Container className="pt-0">
                <Row className="pt-2 bg-white justify-content-around pb-2 mb-2">
                        <Button variant="link" size="lg" onClick={match}> {'\u2728'} Match me! {'\u2728'} </Button>
                        <Button variant="link" size="lg" onClick={() => setSelectedPage('Home')}> My Home </Button>
                        <Button variant="link" size="lg" onClick={() => setSelectedPage('Chats')}> My Chats </Button>
                        <Button variant="link" size="lg" onClick={() => setSelectedPage('Profile')}> My Profile </Button>
                        <Button variant="link" size="lg" onClick={logout}> Logout </Button>
                </Row>
                <StudentMatchPopup show={show} setPopup={setPopup} username={matchedUser}/>
                {selectedPage === 'Chats' && <StudentChat /> }
                {selectedPage === 'Profile' && <StudentProfile /> }
                {selectedPage === 'Home' && <StudentHome /> }
            </Container>
    )
}
