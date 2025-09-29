import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from './reducers';

// Configure Redux Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Whitelist (Save specific reducers)
  whitelist: ['auth', 'settings', 'disease'],
  // Blacklist (Don't save specific reducers)
  blacklist: [],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with middleware
const store = createStore(
  persistedReducer,
  applyMiddleware(thunk)
);

// Create persistor
const persistor = persistStore(store);

export { store, persistor };