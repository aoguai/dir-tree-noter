import React, {Component} from "react";
import Header from "./Header";
import Editor from "./Editor";
import OptionsModal from "./OptionsModal";
import ExcludeFoldersModal from "./ExcludeFoldersModal";

class App extends Component {

    constructor(props) {
        super(props);

        this.showOptions = this.showOptions.bind(this);
        this.showExcludeFoldersModal = this.showExcludeFoldersModal.bind(this);
    }

    showOptions(){
        this.refs.optionsModal.getWrappedInstance().showModal();
    }

    showExcludeFoldersModal(props) {
        const modal = this.refs.excludeFoldersModal.getWrappedInstance();
        modal.onConfirm = props.onConfirm;
        modal.onCancel = props.onCancel;
        modal.showModal();
    }

    render(){
        return (
            <div className="root-container">
                <Header showExcludeFoldersModal={this.showExcludeFoldersModal} />
                <Editor handleShowOptions={this.showOptions} />
                <OptionsModal ref="optionsModal"/>
                <ExcludeFoldersModal ref="excludeFoldersModal"/>
            </div>
        );
    }
}

export default App;
