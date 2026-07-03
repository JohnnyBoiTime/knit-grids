import {configureStore} from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import knittingProjectReducer from './slices/knittingProjectSlice'
import {persistStore, persistReducer} from 'redux-persist'


// Make sure on refreshes, we still have the knitting project
const knittingProjectPersistConfig = {
    key: 'knittingProject',
    storage // Store the knitting projects info in brower storage
}

// Take the projects information that is stored in the browsers storage,
// and put it back into the store to display when app refreshes
const persistKnittingProjectReducer = persistReducer(knittingProjectPersistConfig, knittingProjectReducer)

export const makeStore = configureStore({
    reducer: {
        knittingProject: persistKnittingProjectReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({serializableCheck: false})
})

// Look for the knitting info under some set key to 
// dispatch to the slice
export const persistor = persistStore(makeStore)


export type AppStore = typeof makeStore
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]