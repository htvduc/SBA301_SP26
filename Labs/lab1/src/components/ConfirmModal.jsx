import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function ConfirmModal({ show, handleClose, orchid }) {
  if (!orchid) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{orchid.orchidName}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <img
          src={orchid.image}
          alt=""
          className="img-fluid mb-3 rounded"
          style={{ height: "300px", width: "100%", objectFit: "cover" }}
        />

        <p>
          <strong>Category:</strong> {orchid.category}
        </p>

        <p>{orchid.description}</p>

        {orchid.isSpecial ? (
          <Badge bg="danger">Special</Badge>
        ) : (
          <Badge bg="secondary">Normal</Badge>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
