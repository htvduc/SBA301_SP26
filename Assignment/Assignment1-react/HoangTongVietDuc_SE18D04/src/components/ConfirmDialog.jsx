import Modal from "./Modal";
import "../styles/ConfirmDialog.css";

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = "danger" }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="confirm-dialog">
        <div className="confirm-icon">
          {type === "danger" ? "⚠️" : "ℹ️"}
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className={`btn-confirm btn-${type}`}
            onClick={handleConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
