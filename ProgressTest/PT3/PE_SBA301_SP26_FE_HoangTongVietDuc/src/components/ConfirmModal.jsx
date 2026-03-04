import React from "react";
import { Modal, Button } from "react-bootstrap";

const ConfirmModal = ({ show, handleClose, handleConfirm, title, message }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title || "Confirm Action"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message || "Are you sure you want to proceed?"}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
