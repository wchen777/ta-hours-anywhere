import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import '../App.scss';

export default function Home(props) {
    return (
        <Container className="pt-3">
                <Row className='bg-white py-5 justify-content-center'>
                <Col sm={12} md={10} lg={8}>
                <h1 className="text-center pb-4">
                    Welcome to
                    TA Hours Anywhere!
                </h1>
                {/* <p className="text-center pb-4">
                    TA Hours Anywhere is a free service connecting volunteer instructors and students.
                </p> */}
                <br/>
                <h2 className="text-center pb-4">
                    I'm ...
                </h2>
                <div className="col-sm-12 text-center">
                    <LinkContainer to='/login-instructor'>
                        <Button variant="primary" size="lg" type="submit" block> An Instructor </Button>
                    </LinkContainer>
                    <LinkContainer to='/login-student'>
                        <Button variant="primary" size="lg" type="submit" block> A Student </Button>
                    </LinkContainer>
                </div>
                </Col>
                </Row>
            </Container>
    )
}
