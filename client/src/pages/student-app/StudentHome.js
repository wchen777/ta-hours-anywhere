import React from 'react'
import { Row, Col } from 'react-bootstrap'
import '../../App.scss';

export default function StudentHome() {
    return (
        <div>
            <Row className="bg-white" > 
                <Col>
                <div className="profile-box"> 
                    <h1 className="default-display">
                        Nothing to see here yet! This is where notifications and stuff will go.
                    </h1>
                </div>
                </Col>
            </Row>
        </div>
    )
}
