import { 
  FETCH_USER_GROUPS, 
  CREATE_GROUP, 
  JOIN_GROUP, 
  LEAVE_GROUP,
  FETCH_GROUP_MESSAGES,
  SEND_GROUP_MESSAGE
} from '../types';

const initialState = {
  groups: [],
  messages: {}
};

const groupReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_GROUPS:
      return {
        ...state,
        groups: action.payload
      };
    case CREATE_GROUP:
      return {
        ...state,
        groups: [...state.groups, action.payload]
      };
    case JOIN_GROUP:
      return {
        ...state,
        groups: [...state.groups, action.payload]
      };
    case LEAVE_GROUP:
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload)
      };
    case FETCH_GROUP_MESSAGES: {
      const { groupId, messages } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [groupId]: messages
        }
      };
    }
    case SEND_GROUP_MESSAGE: {
      const { groupId, message } = action.payload;
      const groupMessages = state.messages[groupId] || [];
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [groupId]: [...groupMessages, message]
        }
      };
    }
    default:
      return state;
  }
};

export default groupReducer;