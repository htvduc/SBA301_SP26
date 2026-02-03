import Modal from "./Modal";
import "../styles/ConfirmDialog.css";

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = "danger" }) {
  const handleConfirm = async () => {
    // Await onConfirm nếu nó là async function
    if (onConfirm) {
      await onConfirm();
    }
    // onClose sẽ được gọi từ parent component sau khi xóa xong
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="confirm-dialog">
        <div className="confirm-icon">
          {type === "danger" ? "⚠️" : "ℹ️"}
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button 
            type="button"
            className="btn-cancel" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            className={`btn-confirm btn-${type}`}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleConfirm();
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
