import React, { useState } from 'react'
import '../App.scss';
import {  Row, Col, Button, Form } from 'react-bootstrap'
import { gql, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom'

const REGISTER_STUDENT = gql`
  mutation register($username: String!, $email: String! $password: String!, $confirmPassword: String!) {
    register(username: $username email: $email password: $password confirmPassword: $confirmPassword) {
      username email createdAt
    }
  }
`;

export default function RegisterStudent(props) {
    // input form state
    const [variables, setVariables] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      })
      // errors object
    const [errors, setErrors] = useState({})

    const [regStudent, { loading }] = useMutation(REGISTER_STUDENT, {
        update(_, __){
            props.history.push('/login-student')
        },
        onError(err){
            console.log(err.graphQLErrors[0].extensions.errors)
            setErrors(err.graphQLErrors[0].extensions.errors)
        }
    });
    
    const submitRegisterForm = e => {
        e.preventDefault()
        regStudent({variables})
      }
    
    return (
         <Row className='bg-white py-5 justify-content-center'>
           <Col sm={10} md={8} lg={6}>
           <h1 className="text-center pb-4">
             Register Student 
           </h1>
           <Form onSubmit={submitRegisterForm}>
            <Form.Group>
              <Form.Label className={errors['users.email'] && 'text-danger'}>
                  {errors['users.email'] ? `Email Address: ${errors['users.email']}` : 'Email Address'}
              </Form.Label>
              <Form.Control type="email" 
              value={variables.email} 
              className={errors['users.email'] && 'is-invalid'}
              onChange={e => setVariables({...variables, email: e.target.value})}/>
            </Form.Group>
    
            <Form.Group>
            <Form.Label className={errors['users.username'] && 'text-danger'}>
                  {errors['users.username'] ? `Username: ${errors['users.username']}` : 'Username'}
              </Form.Label>
              <Form.Control type="text" 
              value={variables.username} 
              className={errors['users.username'] && 'is-invalid'}
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
    
            <Form.Group>
                <Form.Label className={errors.confirmPassword && 'text-danger'}>
                  {errors.confirmPassword ? `Confirm Password: ${errors.confirmPassword}` : 'Confirm Password'}
                </Form.Label>
              <Form.Control type="password" 
              value={variables.confirm}
              className={errors.confirmPassword && 'is-invalid'}
              onChange={e => setVariables({...variables, confirmPassword: e.target.value})}/>
            </Form.Group>
            <div className="text-center">
            <Button variant="success" type="submit" disabled={loading}>
              { loading ? 'loading...' : 'Register!'}
            </Button>
            <br/>
            <br/>
            <small>Already have a student account? <Link to='/login-student'> Login here</Link></small>
            <br/>
            <small> <Link to='/'> Back to home page</Link> </small>
            </div>
            </Form>
           </Col>
         </Row>
      );
}
