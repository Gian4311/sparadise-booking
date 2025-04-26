import { useEffect } from "react";
import "../styles/PopupModal.scss"; // reuse your existing styling

export default function QuickPopup({
    message,
    clearPopup
}: {
    message: string,
    clearPopup(): void
}): JSX.Element {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            clearPopup();
        }, 3000); // 3 seconds (you can adjust to 5000 for 5 seconds)

        return () => clearTimeout(timer); // cleanup if component unmounts early
    }, [clearPopup]);

    if (!message) return <></>;

    return (
        <div className="popup-modal-wrapper">
            <div className="popup-modal">
                {message}
            </div>
        </div>
    );
}
