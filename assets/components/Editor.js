import React, {Component} from "react";
import {connect} from "react-redux";
import Preloader from "./Preloader";
import EditorContent from "./EditorContent";
import clip from "../helpers/clip";
import creator from "../helpers/creator";
import i18n from "../i18n";

class Editor extends Component {

    constructor(props) {
        super(props);

        this.handleOptionsClick = this.handleOptionsClick.bind(this);
        this.handleCopyClick = this.handleCopyClick.bind(this);
        this.isDownloadAttrSupported = ("download" in document.createElement("a"));
        this.copyingInProgress = false;
    }

    handleOptionsClick(e) {
        this.props.handleShowOptions();
    }

    handleCopyClick(e) {
        if (this.copyingInProgress) {
            return;
        }
        
        this.copyingInProgress = true;
        setTimeout(() => {
            this.copyingInProgress = false;
        }, 1000);
        
        let contentEl = this.refs.editorContent.getWrappedInstance().refs.code;
        
        try {
            if (navigator.clipboard && contentEl.textContent) {
                navigator.clipboard.writeText(contentEl.textContent)
                    .then(() => {
                        Materialize.toast(i18n.t("copyComplete"), 4000);
                    })
                    .catch(() => {
                        this.fallbackCopy(contentEl);
                    });
                return;
            }
            
            this.fallbackCopy(contentEl);
        } catch (err) {
            console.error("Copy failed:", err);
            Materialize.toast(i18n.t("browserNotSupported"), 4000);
        }
    }
    
    fallbackCopy(contentEl) {
        clip.selectElementText(contentEl);
        
        if(clip.getSelectionText().length > 0){
            let copySuccess = clip.copySelectionText();
            clip.clearSelection();
            
            if(copySuccess){
                Materialize.toast(i18n.t("copyComplete"), 4000);
            } else {
                Materialize.toast(i18n.t("browserNotSupported"), 4000);
            }
        }
    }

    render(){
        const {isLoading, isComplete} = this.props,
        fileName = this.props.rootName + ".txt";
        var editorMain = null;

        if(isComplete || isLoading){
            const {content} = this.props,
            isDownloadAttrSupported = this.isDownloadAttrSupported,
            downloadURL = creator.makeTextFile(content);

            let containerClass = "content-container";
            if(isLoading){
                containerClass += " is-loading";
            }

            editorMain = (
                <div className="editor-main">
                    <div className={containerClass}>
                        <EditorContent ref="editorContent"/>
                    </div>
                    <div className="download-container center-align">
                        <a href="javascript:" className="waves-effect waves-light btn-large btn-copy z-depth-2" onClick={this.handleCopyClick}><i className="material-icons left">description</i>{i18n.t("copy")}</a>
                        { isDownloadAttrSupported ? <a download={fileName} href={downloadURL} className="waves-effect waves-light btn-large btn-download z-depth-2"><i className="material-icons left">play_for_work</i>{i18n.t("download")}</a> : null }
                    </div>
                    <div className="preloader-container valign-wrapper">
                      <div className="valign">
                          { isLoading ? <Preloader /> : null }
                      </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="container editor-area">
                <div className="config-container right-align">
                    <a href="javascript:" className="waves-effect waves-light btn btn-option" onClick={this.handleOptionsClick}><i className="material-icons left">settings</i>{i18n.t("config")}</a>
                </div>
                { editorMain }
            </div>
        );
        }
    }

function mapStateToProps(state) {
    state = state.toJS();
    return {
        isLoading: state.upload.isLoading,
        isComplete: state.upload.isComplete,
        content: state.editor.content,
        rootName: state.editor.rootName
    };
}

export default connect(mapStateToProps)(Editor);
