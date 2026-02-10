import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchUnits = createAsyncThunk("sites/fetchUnits", async () => {
    const response = await api.get("/units");
    return response.data;
});

const unitsSlice = createSlice({
    name: "units",
    initialState: { data: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUnits.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUnits.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUnits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default unitsSlice.reducer;
