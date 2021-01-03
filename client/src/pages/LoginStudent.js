import React, { useState } from 'react'
import '../App.scss';
import { Container, Row, Col, Button, Form } from 'react-bootstrap'
import { gql, useLazyQuery } from '@apollo/client';
import { Link } from 'react-router-dom'

import { useAuthDispatch } from '../context/auth'

const LOGIN_STUDENT = gql`
  query login($username: String! $password: String! $isInstructor: Boolean!) {
    login(username: $username password: $password isInstructor: $isInstructor) {
        ...on Instructor {
            username email token createdAt matches
        }
        ...on User {
            username email token createdAt matches
        }
    }
  }
`

export default function LoginStudent(props) {
    // input form state
    const [variables, setVariables] = useState({
        username: '',
        password: '',
        isInstructor: false
    })
    // errors object
    const [errors, setErrors] = useState({})

    // login auth dispatch
    const dispatch = useAuthDispatch()

    const [logStudent, { loading }] = useLazyQuery(LOGIN_STUDENT, {
        onError(err){
            console.log(err)
            setErrors(err.graphQLErrors[0].extensions.errors)
        },
        onCompleted(data){
            dispatch({type: 'LOGIN', payload: data.login})
            window.location.href = '/main-student'
        },
    });

    const submitLoginForm = e => {
        e.preventDefault()
        logStudent({variables})
    }

    return (
    <Container className="pt-5">
        <Row className='bg-white py-5 justify-content-center'>
        <Col sm={8} md={6} lg={4}>
        <h1 className="text-center pb-4">
            Student Login
        </h1>
        <Form onSubmit={submitLoginForm}>

            <Form.Group>
            <Form.Label className={errors.username && 'text-danger'}>
                {errors.username? `Username: ${errors.username}` : 'Username'}
            </Form.Label>
            <Form.Control type="text" 
            value={variables.username} 
            className={errors.username && 'is-invalid'}
            onChange={e => setVariables({...variables, username: e.target.value})}/>
            </Form.Group>

            <Form.Group>
                <Form.Label className={errors.password && 'text-danger'}>
                {errors.password ? `Password: ${errors.password}` : 'Password'}
                </Form.Label>
            <Form.Control type="password" 
            value={variables.password} 
            className={errors.password && 'is-invalid'}
            onChange={e => setVariables({...variables, password: e.target.value})}/>
            </Form.Group>

            <div className="text-center">
            <Button variant="success" type="submit" disabled={loading}>
            { loading ? 'loading...' : 'Login!'}
            </Button>
            <br/>
            <br/>
            <small>Don't have a student account? <Link to='/register-student'> Register here</Link></small>
            <br/>
            <small> <Link to='/'> Back to home page</Link> </small>
            </div>
            </Form>
        </Col>
        </Row>
    </Container>
    );
}
