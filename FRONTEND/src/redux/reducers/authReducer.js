import { 
  LOGIN_REQUEST, 
  LOGIN_SUCCESS, 
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGOUT,
  UPDATE_USER
} from '../types';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationSuccess: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload
      };
    case REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        registrationSuccess: false
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        registrationSuccess: true,
        error: null
      };
    case REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        registrationSuccess: false,
        error: action.payload
      };
    case LOGOUT:
      return {
        ...initialState
      };
    case UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

export default authReducer;