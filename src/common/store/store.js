import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

//Reducers
import counterReducer from "../../features/counter/counter-slice";
import authReducer from "@features/auth/auth-slice";
import sitesReducer from "@/features/sites/sites-slice";
import machineCategoryReducer from "@/features/machine-category/machine-category-slice";
import primaryCategoryReducer from "@/features/primary-category/primary-category-slice";
import machineReducer from "@/features/machine/machine-slice";
import itemGroupsReducer from "@/features/item-groups/item-groups-slice";
import itemsReducer from "@/features/items/items-slice";
import unitsReducer from "@/features/units/units-slice";

const persistConfig = {
  key: "root", // key for storing in localStorage
  storage, // uses localStorage by default
  whitelist: ["auth"], // specify reducers to persist (optional)
};

const rootReducer = combineReducers({
  counter: counterReducer,
  auth: authReducer,
  sites: sitesReducer,
  machineCategories: machineCategoryReducer,
  primaryCategories: primaryCategoryReducer,
  machines: machineReducer,
  itemGroups: itemGroupsReducer,
  items: itemsReducer,
  units: unitsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
