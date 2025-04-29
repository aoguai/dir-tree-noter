const submitDisplay = (value) => ({
    type: "SUBMIT_DISPLAY",
    value
});

const setDepthDisplay = (value) => ({
    type: "SET_DEPTH_DISPLAY",
    value
});

const setIndentDisplay = (value) => ({
    type: "SET_INDENT_DISPLAY",
    value
});

const setExcludeFoldersDisplay = (value) => ({
    type: "SET_EXCLUDE_FOLDERS_DISPLAY",
    value
});

const resetOptionDisplay = () => ({
    type: "RESET_OPTION_DISPLAY"
});

const restoreDisplay = () => ({
    type: "RESTORE_OPTION_DISPLAY"
});

const refreshReader = () => ({
    type: "REFRESH_READER"
});

export default {
    submitDisplay, setDepthDisplay,
    setIndentDisplay, resetOptionDisplay, restoreDisplay, refreshReader,
    setExcludeFoldersDisplay
};
