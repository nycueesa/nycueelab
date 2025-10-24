// commonSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  positionPage: ""
};

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setPositionPage: (state, action) => {
      state.positionPage = action.payload; 
    },
  },
});

export const { setPositionPage } = commonSlice.actions;
export default commonSlice.reducer;