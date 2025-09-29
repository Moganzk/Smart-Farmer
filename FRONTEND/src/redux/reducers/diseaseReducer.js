import { 
  DETECTION_REQUEST, 
  DETECTION_SUCCESS, 
  DETECTION_FAILURE,
  GET_DETECTION_HISTORY,
  ADD_DETECTION_TO_HISTORY,
  DELETE_DETECTION
} from '../types';

const initialState = {
  currentDetection: null,
  history: [],
  isLoading: false,
  error: null,
};

const diseaseReducer = (state = initialState, action) => {
  switch (action.type) {
    case DETECTION_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case DETECTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        currentDetection: action.payload,
        error: null
      };
    case DETECTION_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case GET_DETECTION_HISTORY:
      return {
        ...state,
        history: action.payload
      };
    case ADD_DETECTION_TO_HISTORY:
      return {
        ...state,
        history: [action.payload, ...state.history]
      };
    case DELETE_DETECTION:
      return {
        ...state,
        history: state.history.filter(item => item.id !== action.payload)
      };
    default:
      return state;
  }
};

export default diseaseReducer;