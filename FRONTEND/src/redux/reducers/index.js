import { combineReducers } from 'redux';
import authReducer from './authReducer';
import diseaseReducer from './diseaseReducer';
import advisoryReducer from './advisoryReducer';
import groupReducer from './groupReducer';
import settingsReducer from './settingsReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  disease: diseaseReducer,
  advisory: advisoryReducer,
  groups: groupReducer,
  settings: settingsReducer,
});

export default rootReducer;