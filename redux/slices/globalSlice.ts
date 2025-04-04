import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllClassAndSections, fetchClassFromDB, fetchSectionFromDB } from '../../services/apiService';

// Fetch Classes (Using Global API Fetch)
export const fetchClasses = createAsyncThunk('global/fetchClasses', async () => {
  let res = await fetchClassFromDB(); // ✅ Replace with actual API
  // console.log("Classes: ",res)
  return res
});

// Fetch Sections (Using Global API Fetch)
export const fetchSections = createAsyncThunk('global/fetchSections', async () => {
  let response =  await fetchSectionFromDB();
  // console.log ("Section: ", response);
  return response // ✅ Replace with actual API
});

export const fetchAllClassAndSectionsData = createAsyncThunk('global/allClassAndSections', async () => {
  let response =  await fetchAllClassAndSections();
  // console.log ("Section: ", response);
  return response // ✅ Replace with actual API
});

// Define Initial State
interface GlobalState {
  classes: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string }>;
  allClassAndSections: Array<{id: string, name: string, sections: Array<{id: string, name: string}>}>
  loading: boolean;
  error: string | null;
}

const initialState: GlobalState = {
  classes: [],
  sections: [],
  allClassAndSections: [],
  loading: false,
  error: null,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle Classes
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        // console.log("Classes Payload: ",action.payload)
        state.loading = false;
        state.classes = action.payload.data;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        // console.log("Classes Payload: ",action.error)
        state.error = action.error.message || 'Failed to fetch classes';
      })

      // Handle Sections
      .addCase(fetchSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        // console.log("Section Payload: ",action.payload)
        state.loading = false;
        state.sections = action.payload.data;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        // console.log("Section Error: ",action.error)
        state.error = action.error.message || 'Failed to fetch sections';
      })

      //Handle All Class and Sections
      .addCase(fetchAllClassAndSectionsData.pending, (state)=>{
        state.loading = false,
        state.error = null
      })
      .addCase(fetchAllClassAndSectionsData.fulfilled, (state, action)=>{
        // console.log("All Payload: ",action.payload)
        state.loading = false,
        state.allClassAndSections = action.payload.data
      })
      .addCase(fetchAllClassAndSectionsData.rejected, (state, action)=>{
        state.loading = false,
        // console.log("All Error: ",action.error)
        state.error = action.error.message || 'Failed to fetch all class and sections'
      });
  },
});

export default globalSlice.reducer;
