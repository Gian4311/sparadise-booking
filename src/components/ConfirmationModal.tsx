import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";

import "../styles/ConfirmationModal.scss";

export default function ConfirmationModal( { pageData, reloadPageData }: {
    pageData: SpaRadisePageData,
    reloadPageData: () => void
} ): JSX.Element {

    const { confirmData } = pageData;
    if( !confirmData ) return <></>;
    const { message, noText, yesText, yes, no } = confirmData;

    function handleFinish(): void {

        delete pageData.confirmData;
        reloadPageData();

    }

    async function handleNo(): Promise< void > {

        if( no ) await no();
        handleFinish();

    }

    async function handleYes(): Promise< void > {

        if( yes ) await yes();
        handleFinish();

    }

    return <>
        <div className="confirmation-modal-wrapper">
            <div className="confirmation-modal">
                <h1>Confirm</h1>
                <p>{ message }</p>
                <button type="button" onClick={ handleNo }>{ noText }</button>
                <button type="button" onClick={ handleYes }>{ yesText }</button>
            </div>
        </div>
    </>;

}
