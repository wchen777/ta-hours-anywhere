import React, { useState } from 'react'
import '../../App.scss';
import { Container, Row, Button } from 'react-bootstrap'
import InstructorChat from './InstructorChat'
import InstructorProfile from './InstructorProfile'
import InstructorHome from './InstructorHome'

import { useAuthDispatch } from '../../context/auth';



export default function MainInstructor({ history }) {
    // auth context 
    const dispatch = useAuthDispatch()

    // state for conditional rendering
    const [selectedPage, setSelectedPage] = useState('Chats')

    
    // on logout
    const logout = () => {
        dispatch({ type: 'LOGOUT' })
        window.location.href = '/login-instructor'
    }
    

    return (
            <Container className="pt-0">
                <Row className="pt-2 bg-white justify-content-around pb-2 mb-2">
                        <Button className="text-light" variant="link" size="lg" onClick={() => setSelectedPage('Home')}> My Home </Button>
                        <Button className="text-light" variant="link" size="lg" onClick={() => setSelectedPage('Chats')}> My Chats </Button>
                        <Button className="text-light" variant="link" size="lg" onClick={() => setSelectedPage('Profile')}> My Profile </Button>
                        <Button className="text-light" variant="link" size="lg" onClick={logout}> Logout </Button>
                </Row>
                {selectedPage === 'Chats' && <InstructorChat /> }
                {selectedPage === 'Profile' && <InstructorProfile /> }
                {selectedPage === 'Home' && <InstructorHome /> }
            </Container>
    )
}
