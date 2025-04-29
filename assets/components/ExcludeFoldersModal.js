import React, {Component} from "react";
import {connect} from "react-redux";
import i18n from "../i18n";

class ExcludeFoldersModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFolders: [],
            searchText: "",
            selectAll: false
        };

        this.handleConfirmClick = this.handleConfirmClick.bind(this);
        this.handleCancelClick = this.handleCancelClick.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
        this.handleFolderSelect = this.handleFolderSelect.bind(this);
        this.renderFolderItem = this.renderFolderItem.bind(this);
        
        // 将在App组件中通过ref设置
        this.onConfirm = null;
        this.onCancel = null;
    }

    componentDidMount() {
        this.modalEl = $(this.refs.modal);
        this.modalEl.modal({
            dismissible: false,
            complete: this.handleCancelClick
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.folders !== this.props.folders) {
            this.setState({
                selectedFolders: [],
                selectAll: false,
                searchText: ""
            });
        }
    }

    showModal() {
        this.modalEl.modal("open");
    }

    closeModal() {
        this.modalEl.modal("close");
    }

    handleConfirmClick() {
        if (typeof this.onConfirm === 'function') {
            this.onConfirm(this.state.selectedFolders);
        }
        this.closeModal();
    }

    handleCancelClick() {
        if (typeof this.onCancel === 'function') {
            this.onCancel();
        }
        this.closeModal();
    }

    handleSearchChange(e) {
        this.setState({ searchText: e.target.value });
    }

    handleSelectAllClick() {
        if (this.state.selectAll) {
            this.setState({ 
                selectedFolders: [],
                selectAll: false
            });
        } else {
            const filteredFolders = this.getFilteredFolders();
            this.setState({ 
                selectedFolders: [...filteredFolders],
                selectAll: true
            });
        }
    }

    handleFolderSelect(folder) {
        const { selectedFolders } = this.state;
        if (selectedFolders.includes(folder)) {
            this.setState({
                selectedFolders: selectedFolders.filter(f => f !== folder),
                selectAll: false
            });
        } else {
            this.setState({
                selectedFolders: [...selectedFolders, folder],
                selectAll: this.getFilteredFolders().length === selectedFolders.length + 1
            });
        }
    }

    getFilteredFolders() {
        const { folders } = this.props;
        const { searchText } = this.state;
        
        if (!searchText.trim()) {
            return folders;
        }
        
        return folders.filter(folder => 
            folder.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    renderFolderItem(folder) {
        const { selectedFolders } = this.state;
        const isSelected = selectedFolders.includes(folder);
        return (
            <div className="folder-item" key={folder}>
                <label>
                    <input 
                        type="checkbox" 
                        className="filled-in" 
                        checked={isSelected} 
                        onChange={() => this.handleFolderSelect(folder)} 
                    />
                    <span>{folder}</span>
                </label>
            </div>
        );
    }

    render() {
        const { folders } = this.props;
        const { selectedFolders, searchText, selectAll } = this.state;
        const filteredFolders = this.getFilteredFolders();

        return (
            <div ref="modal" className="modal modal-fixed-footer exclude-folders-modal">
                <div className="modal-content">
                    <h5 className="blue-text text-darken-2">{i18n.t("excludeFolders")}</h5>
                    
                    <div className="search-container">
                        <div className="input-field">
                            <i className="material-icons prefix">search</i>
                            <input 
                                id="folder_search" 
                                type="text" 
                                value={searchText} 
                                onChange={this.handleSearchChange} 
                                placeholder={i18n.t("searchFolders")}
                            />
                        </div>
                    </div>

                    <div className="select-all-container">
                        <label>
                            <input 
                                type="checkbox" 
                                className="filled-in" 
                                checked={selectAll && filteredFolders.length > 0} 
                                onChange={this.handleSelectAllClick}
                                disabled={filteredFolders.length === 0}
                            />
                            <span>{i18n.t("selectAll")}</span>
                        </label>
                        <span className="selected-count">
                            {i18n.t("selectedCount", { count: selectedFolders.length })}
                        </span>
                    </div>

                    <div className="folders-list">
                        {filteredFolders.length > 0 ? (
                            filteredFolders.map(this.renderFolderItem)
                        ) : (
                            <div className="no-folders">{i18n.t("noFoldersFound")}</div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <a href="javascript:" className="modal-action waves-effect waves-green btn btn-combined" onClick={this.handleConfirmClick}>
                        {i18n.t("confirm")}
                    </a>
                    <a href="javascript:" className="modal-action waves-effect btn-flat btn-combined" onClick={this.handleCancelClick}>
                        {i18n.t("cancel")}
                    </a>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    state = state.toJS();
    return {
        folders: state.upload.firstLevelFolders || []
    };
}

export default connect(mapStateToProps, null, null, {
    withRef: true
})(ExcludeFoldersModal); 