import React from 'react';
import { useAlert } from "./AlertManager";

const AlertComponent = () => {
    const { showAlert: alert } = useAlert();

    exports.showAlert = (title, message) => {
        return alert({
            title,
            message,
        });
    };

    return (
        <div>
            <button onClick={() => showAlert("Test Title", "Test Message")}>
                Show Alert
            </button>
        </div>
    );
};

export default AlertComponent;