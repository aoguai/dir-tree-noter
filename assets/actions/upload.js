const detectDrop = (isOver) => ({
    type: "DETECT_DROP",
    isOver: isOver
});

const loadingDrop = () => ({
    type: "LOADING_DROP"
});

const finishRead = (output) => ({
    type: "FINISH_READ",
    content: output.content,
    rootName: output.rootName
});

const setFirstLevelFolders = (folders) => ({
    type: "SET_FIRST_LEVEL_FOLDERS",
    folders
});

const setExcludedFolders = (folders) => ({
    type: "SET_EXCLUDED_FOLDERS",
    folders
});

export {
    detectDrop,
    loadingDrop,
    finishRead,
    setFirstLevelFolders,
    setExcludedFolders
};

export default {
    detectDrop,
    loadingDrop,
    finishRead,
    setFirstLevelFolders,
    setExcludedFolders
};
