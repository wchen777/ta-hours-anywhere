import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default function StudentMatchPopup({ show, setPopup, username }) {
    return (
        <Modal
        show={show}
        onHide={() => setPopup(false)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thank you for matching!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {username !== '' ? 
            <p> Success! You matched with <b>{username}</b>! 
            <br/> <br/> 
            <b> {username} </b> will be notified shortly of the match and will receive your messages. <br/> 
            <b> {username} </b> has also been automatically added to your matched list and chats. 
            <br/> <br/> 
            Remember, matches will only last for 1 week, so go ahead and send your first message!</p> 
            : "Sorry, there were no instructor matches to be found. Try again later!" }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
              setPopup(false)
              window.location.href = '/main-student'
            }}>
            Got it!
          </Button>
        </Modal.Footer>
      </Modal>
    )
}
