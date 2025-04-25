import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";

import "../styles/PopupModal.scss";

export default function PopupModal({
    pageData, reloadPageData
}: {
    pageData: SpaRadisePageData,
    reloadPageData(): void
}): JSX.Element {

    const { popupData } = pageData;
    if (!popupData) return <></>;

    const {
        children, popupMode = "yesAndNo", noText = "Cancel", yesText = "Proceed",
        no, yes
    } = popupData;

    async function handleFinish(): Promise<void> {

        delete pageData.popupData;
        reloadPageData();

    }

    async function handleNo(): Promise<void> {

        if (no) await no();
        await handleFinish();

    }

    async function handleYes(): Promise<void> {

        if (yes) await yes();
        await handleFinish();

    }

    return <>
        <div className="popup-modal-wrapper">
            <div className="popup-modal">
                {children}
                <div className="actions">
                    {popupMode === "yesAndNo" && (
                        <button type="button" className="btn-no" onClick={handleNo}>
                            {noText}
                        </button>
                    )}
                    <button type="button" className="btn-yes" onClick={handleYes}>
                        {yesText}
                    </button>
                </div>
            </div>
        </div>

    </>;

}
