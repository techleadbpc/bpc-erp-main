import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchItemGroups = createAsyncThunk("itemGroups/fetchItemGroups", async () => {
    const response = await api.get("/item-groups");
    return response.data;
});

const itemGroupsSlice = createSlice({
    name: "itemGroups",
    initialState: { data: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchItemGroups.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchItemGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchItemGroups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default itemGroupsSlice.reducer;
