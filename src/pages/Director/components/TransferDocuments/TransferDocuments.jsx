import { useState } from "react"
import useCheckbox from "../../../../hooks/useCheckbox"
import { transfers } from "../../constants"
import Checkbox from "../Checkbox"
import "./TransferDocuments.scss"
export default function TransferDocuments({ styleCustom, setPopUpTransfer }) {
    const { selectedValues, handleClickCheckboxOnly } = useCheckbox(transfers)
    window.addEventListener("click", (e) => {
        const transferDocuments = document.querySelector(".transfer-documents")
        if (transferDocuments && !transferDocuments.contains(e.target)) {
            setPopUpTransfer(false)
        }
    })
    return (
        <div className="transfer-documents" style={{ ...styleCustom }}>
            <div className="transfer-documents__close" onClick={() => setPopUpTransfer(false)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.40994 7.00019L12.7099 2.71019C12.8982 2.52188 13.004 2.26649 13.004 2.00019C13.004 1.73388 12.8982 1.47849 12.7099 1.29019C12.5216 1.10188 12.2662 0.996094 11.9999 0.996094C11.7336 0.996094 11.4782 1.10188 11.2899 1.29019L6.99994 5.59019L2.70994 1.29019C2.52164 1.10188 2.26624 0.996094 1.99994 0.996094C1.73364 0.996094 1.47824 1.10188 1.28994 1.29019C1.10164 1.47849 0.995847 1.73388 0.995847 2.00019C0.995847 2.26649 1.10164 2.52188 1.28994 2.71019L5.58994 7.00019L1.28994 11.2902C1.19621 11.3832 1.12182 11.4938 1.07105 11.6156C1.02028 11.7375 0.994141 11.8682 0.994141 12.0002C0.994141 12.1322 1.02028 12.2629 1.07105 12.3848C1.12182 12.5066 1.19621 12.6172 1.28994 12.7102C1.3829 12.8039 1.4935 12.8783 1.61536 12.9291C1.73722 12.9798 1.86793 13.006 1.99994 13.006C2.13195 13.006 2.26266 12.9798 2.38452 12.9291C2.50638 12.8783 2.61698 12.8039 2.70994 12.7102L6.99994 8.41019L11.2899 12.7102C11.3829 12.8039 11.4935 12.8783 11.6154 12.9291C11.7372 12.9798 11.8679 13.006 11.9999 13.006C12.132 13.006 12.2627 12.9798 12.3845 12.9291C12.5064 12.8783 12.617 12.8039 12.7099 12.7102C12.8037 12.6172 12.8781 12.5066 12.9288 12.3848C12.9796 12.2629 13.0057 12.1322 13.0057 12.0002C13.0057 11.8682 12.9796 11.7375 12.9288 11.6156C12.8781 11.4938 12.8037 11.3832 12.7099 11.2902L8.40994 7.00019Z" fill="#434547" />
                </svg>

            </div>
            <div className="transfer-documents__list">
                {
                    transfers && transfers.map(transfer => {
                        return <Checkbox key={transfer.id} value={transfer.id} name={transfer.name} selectedValues={selectedValues} handleClickCheckbox={handleClickCheckboxOnly} />

                    })
                }
            </div>
            <button className="transfer-documents__button">Chuyển</button>

        </div>
    )
}
