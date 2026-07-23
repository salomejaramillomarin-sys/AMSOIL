export default function SuccessModal({ open, onClose, title, message }) {
    return (
        <div
            className={`modal-overlay${open ? " is-open" : ""}`}
            aria-hidden={!open}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="modal-icon">✓</div>
                <h3 id="modal-title">{title}</h3>
                <p>{message}</p>
                <button className="modal-btn" id="close-modal-btn" type="button" onClick={onClose}>
                    Aceptar
                </button>
            </div>
        </div>
    );
}
