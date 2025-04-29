import Immutable from "immutable";

const initialState = Immutable.Map({
    isBoxActive: false,
    isLoading: false,
    isComplete: false,
    needRefresh: false,
    firstLevelFolders: Immutable.List(),
    excludedFolders: Immutable.List()
});

export default function(state = initialState, action) {
    switch (action.type) {
        case "DETECT_DROP":
            return state.merge({
                isBoxActive: action.isOver
            });
        case "LOADING_DROP":
            return state.merge({
                isBoxActive: false,
                isLoading: true,
                isComplete: false
            });
        case "FINISH_READ":
            return state.merge({
                isLoading: false,
                isComplete: true,
                needRefresh: false
            });
        case "REFRESH_READER":
            return state.merge({
                needRefresh: true
            });
        case "SET_FIRST_LEVEL_FOLDERS":
            return state.merge({
                firstLevelFolders: Immutable.List(action.folders)
            });
        case "SET_EXCLUDED_FOLDERS":
            return state.merge({
                excludedFolders: Immutable.List(action.folders)
            });
        default:
            return state;
    }
}
