import React, { Component } from "react";
import { connect } from "react-redux";
import { detectDrop, loadingDrop, finishRead } from "../actions";
import dirReader from "../helpers/dirReader";
import treeify from "../helpers/treeify";
import outputPresets from "../presets/output";
import i18n from "../i18n";

class Header extends Component {
  constructor(props) {
    super(props);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.lastTrees = null;
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.needRefresh &&
      this.props.isComplete &&
      this.props.indentType !== nextProps.indentType
    ) {
      this.publishTrees(this.lastTrees, nextProps);
    }
    if (!this.props.optionActual.equals(nextProps.optionActual)) {
      Materialize.toast(i18n.t("configUpdated"), 4000);
    }
  }

  componentDidMount() {
    this.dropzone = this.refs.dropzone;
  }

  publishTrees(trees, nextProps) {
    const { indentType } = nextProps || this.props;
    let output = outputPresets;

    if (trees instanceof Object && Object.keys(trees).length > 0) {
      let treeString = treeify.exec(trees, indentType);

      if (Object.keys(trees).length === 1) {
        output.rootName = Object.keys(trees)[0];
      }

      output.content = treeString;
      this.lastTrees = trees;
    } else {
      Materialize.toast(i18n.t("browserNotSupported"), 4000);
      this.lastTrees = null;
    }

    this.props.finish(output);
  }

  execReader(dataTransfer) {
    const { maxDepth } = this.props;
    const readCallback = (files, trees) => {
      this.publishTrees(trees);
    };

    this.props.loading();
    dirReader.exec(dataTransfer, {
      maxDepth,
      onComplete: readCallback.bind(this),
    });
  }

  handleDragEnter(e) {
    this.props.dragOver();
  }

  handleDragLeave(e) {
    this.props.dragOut();
  }

  handleDrop(acceptedFiles, rejectedFiles, event) {
    if (event && event.dataTransfer) {
      this.execReader(event.dataTransfer);
    } else if (acceptedFiles && acceptedFiles.length > 0) {
      const dataTransfer = {
        items: acceptedFiles,
        files: acceptedFiles,
      };
      this.execReader(dataTransfer);
    }
  }

  handleClick(acceptedFiles) {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const dataTransfer = {
        items: acceptedFiles,
        files: acceptedFiles,
      };
      this.execReader(dataTransfer);
    }
  }
  render() {
    const { isBoxActive } = this.props;
    let boxClass = "drop-box valign-wrapper";
    if (isBoxActive) {
      boxClass += " active";
    }

    const handleCustomClick = (e) => {
      e.preventDefault();
      const input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;
      input.directory = true;
      input.onchange = (event) => {
        const files = Array.from(event.target.files);
        this.handleClick(files);
      };
      input.click();
    };

    return (
      <div className="upload-area brown darken-4">
        <div className="container">
          <h2 className="center-align grey-text text-lighten-2">
            Dir Tree Noter
          </h2>
          <div className="row drop-container">
            <div className="col s12 m6 l4 offset-m3 offset-l4">
              <div
                className={boxClass}
                onDragEnter={this.handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={this.handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  this.handleDrop([], [], { dataTransfer: e.dataTransfer });
                }}
                onClick={handleCustomClick}
                style={{ cursor: "pointer" }}
              >
                <div className="drop-label valign brown-text text-lighten-2">
                  {i18n.t("dropOrClickHere")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let optionActual = state.getIn(["option", "actual"]);
  state = state.toJS();

  return {
    optionActual: optionActual,
    maxDepth: state.option.actual.depth,
    indentType: state.option.actual.indent,
    needRefresh: state.upload.needRefresh,
    isComplete: state.upload.isComplete,
    isBoxActive: state.upload.isBoxActive,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dragOver: () => dispatch(detectDrop(true)),
    dragOut: () => dispatch(detectDrop(false)),
    loading: () => dispatch(loadingDrop()),
    finish: (output) => dispatch(finishRead(output)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
