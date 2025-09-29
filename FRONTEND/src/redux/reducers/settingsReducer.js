import {
  CHANGE_LANGUAGE,
  TOGGLE_THEME,
  UPDATE_NOTIFICATION_SETTINGS,
  UPDATE_SYNC_SETTINGS
} from '../types';

const initialState = {
  language: 'en',
  theme: 'light',
  notifications: {
    enabled: true,
    diseaseAlerts: true,
    advisoryUpdates: true,
    groupMessages: true
  },
  sync: {
    onlyOnWifi: true,
    syncInterval: 'daily',
    autoSync: true
  }
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.payload
      };
    case TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    case UPDATE_NOTIFICATION_SETTINGS:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          ...action.payload
        }
      };
    case UPDATE_SYNC_SETTINGS:
      return {
        ...state,
        sync: {
          ...state.sync,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export default settingsReducer;