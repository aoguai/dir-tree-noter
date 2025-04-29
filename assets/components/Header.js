import React, { Component } from "react";
import { connect } from "react-redux";
import { detectDrop, loadingDrop, finishRead, setFirstLevelFolders, setExcludedFolders } from "../actions";
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
    this.handleExcludeFoldersConfirm = this.handleExcludeFoldersConfirm.bind(this);
    this.handleExcludeFoldersCancel = this.handleExcludeFoldersCancel.bind(this);
    this.lastTrees = null;
    this.tempTrees = null;
    this.rootFolderName = null;
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
    let output = {
      content: ">_<",
      rootName: "dir-tree"
    };

    if (!trees && this.lastTrees) {
      trees = this.lastTrees;
    }

    if (trees instanceof Object && Object.keys(trees).length > 0) {
      let treeString = treeify.exec(trees, indentType);

      if (Object.keys(trees).length === 1) {
        output.rootName = Object.keys(trees)[0];
      }

      output.content = treeString;
      this.lastTrees = trees;
    } else if (this.rootFolderName) {
      const emptyTree = {};
      emptyTree[this.rootFolderName] = {};
      let treeString = treeify.exec(emptyTree, indentType);
      
      output.rootName = this.rootFolderName;
      output.content = treeString;
      this.lastTrees = emptyTree;
    } else {
      Materialize.toast(i18n.t("browserNotSupported"), 4000);
      if (!this.lastTrees) {
        this.lastTrees = null;
      }
    }

    this.props.finish(output);
  }

  getFirstLevelFolders(trees) {
    if (!trees || typeof trees !== 'object') return [];
    
    const keys = Object.keys(trees);
    if (keys.length === 1 && typeof trees[keys[0]] === 'object') {
      const rootFolder = trees[keys[0]];
      this.rootFolderName = keys[0];
      
      return Object.keys(rootFolder).filter(key => {
        return typeof rootFolder[key] === 'object';
      });
    }
    
    return Object.keys(trees).filter(key => {
      return typeof trees[key] === 'object';
    });
  }

  filterExcludedFolders(trees, excludedFolders) {
    if (!trees || !excludedFolders || excludedFolders.length === 0) {
      return trees;
    }

    const keys = Object.keys(trees);
    if (keys.length === 1 && this.rootFolderName && keys[0] === this.rootFolderName) {
      const rootFolder = trees[this.rootFolderName];
      const filteredRoot = {};
      
      Object.keys(rootFolder).forEach(key => {
        if (typeof rootFolder[key] !== 'object' || !excludedFolders.includes(key)) {
          filteredRoot[key] = rootFolder[key];
        }
      });
      
      const filteredTrees = {};
      filteredTrees[this.rootFolderName] = filteredRoot;
      
      return filteredTrees;
    }
    
    const filteredTrees = {};
    
    Object.keys(trees).forEach(key => {
      if (!excludedFolders.includes(key)) {
        filteredTrees[key] = trees[key];
      }
    });
    
    return filteredTrees;
  }

  execReader(dataTransfer) {
    const { maxDepth, excludeFolders } = this.props;
    
    const readCallback = (files, trees) => {
      if (excludeFolders) {
        this.tempTrees = trees;
        
        const firstLevelFolders = this.getFirstLevelFolders(trees);
        this.props.setFirstLevelFolders(firstLevelFolders);
        
        if (firstLevelFolders.length > 0) {
          this.props.showExcludeFoldersModal({
            onConfirm: this.handleExcludeFoldersConfirm,
            onCancel: this.handleExcludeFoldersCancel
          });
        } else {
          this.publishTrees(trees);
        }
      } else {
        this.publishTrees(trees);
      }
    };

    this.props.loading();
    dirReader.exec(dataTransfer, {
      maxDepth,
      onComplete: readCallback.bind(this),
    });
  }

  handleExcludeFoldersConfirm(excludedFolders) {
    this.props.setExcludedFolders(excludedFolders);
    
    const filteredTrees = this.filterExcludedFolders(this.tempTrees, excludedFolders);
    
    this.publishTrees(filteredTrees);
    
    this.tempTrees = null;
  }

  handleExcludeFoldersCancel() {
    this.publishTrees(this.tempTrees);
    
    this.tempTrees = null;
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
    excludeFolders: state.option.actual.excludeFolders,
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
    setFirstLevelFolders: (folders) => dispatch(setFirstLevelFolders(folders)),
    setExcludedFolders: (folders) => dispatch(setExcludedFolders(folders))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
