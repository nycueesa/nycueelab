// store.js
import { configureStore } from '@reduxjs/toolkit';
import commonReducer from './commonSlice';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

// persist 設定
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['common'] // 只保留這個 slice
};

// 將 reducer 包進 persistReducer
import { combineReducers } from 'redux';
const rootReducer = combineReducers({
  common: commonReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 關閉序列化檢查
    }),
});

// 創建 persistor
export const persistor = persistStore(store);