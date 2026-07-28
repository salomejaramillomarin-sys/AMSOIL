import { createContext, useCallback, useContext, useRef, useState } from "react";

const DialogContext = createContext(null);

const ICONOS = {
    info: "!",
    peligro: "🗑",
    exito: "✓",
};

export function DialogProvider({ children }) {
    const [dialog, setDialog] = useState(null);
    const resolverRef = useRef(null);

    const alertDialog = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setDialog({
                type: "alert",
                title: options.title ?? "Aviso",
                message,
                variant: options.variant ?? "info",
                confirmLabel: options.confirmLabel ?? "Aceptar",
            });
        });
    }, []);

    const confirmDialog = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setDialog({
                type: "confirm",
                title: options.title ?? "Confirmar",
                message,
                variant: options.variant ?? "peligro",
                confirmLabel: options.confirmLabel ?? "Sí, continuar",
                cancelLabel: options.cancelLabel ?? "Cancelar",
            });
        });
    }, []);

    function handleClose(result) {
        setDialog(null);
        if (resolverRef.current) {
            resolverRef.current(result);
            resolverRef.current = null;
        }
    }

    return (
        <DialogContext.Provider value={{ alert: alertDialog, confirm: confirmDialog }}>
            {children}

            <div
                className={`modal-overlay${dialog ? " is-open" : ""}`}
                aria-hidden={!dialog}
                onClick={(event) => {
                    if (event.target === event.currentTarget && dialog?.type === "alert") {
                        handleClose(true);
                    }
                }}
            >
                {dialog && (
                    <div
                        className={`modal-card modal-card--${dialog.variant}`}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className={`modal-icon modal-icon--${dialog.variant}`}>
                            {ICONOS[dialog.variant] ?? "!"}
                        </div>
                        <h3>{dialog.title}</h3>
                        <p>{dialog.message}</p>

                        {dialog.type === "confirm" ? (
                            <div className="modal-acciones-confirm">
                                <button
                                    type="button"
                                    className="modal-btn modal-btn--secundario"
                                    onClick={() => handleClose(false)}
                                >
                                    {dialog.cancelLabel}
                                </button>
                                <button
                                    type="button"
                                    className="modal-btn modal-btn--peligro"
                                    onClick={() => handleClose(true)}
                                >
                                    {dialog.confirmLabel}
                                </button>
                            </div>
                        ) : (
                            <button type="button" className="modal-btn" onClick={() => handleClose(true)}>
                                {dialog.confirmLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </DialogContext.Provider>
    );
}

export function useDialog() {
    const ctx = useContext(DialogContext);
    if (!ctx) {
        throw new Error("useDialog debe usarse dentro de un <DialogProvider>.");
    }
    return ctx;
}