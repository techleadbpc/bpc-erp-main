import React, { createContext, useState, useContext } from "react";

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const showLoader = () => { setLoading(true) };
    const hideLoader = () => { setLoading(false) };
    return (
        <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
            {loading && <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-[9999]">
                <div className="animate-spin rounded-full border-t-4 border-[hsl(var(--primary))] w-16 h-16 border-solid"></div>
                <div className="mt-4 italic font-light text-accent">Loading . . .</div>
            </div>}
            {children}
        </LoaderContext.Provider>
    )
}

export const Spinner = () => {
    return (
        <div className="animate-spin rounded-full border-t-4 border-[hsl(var(--primary))] w-16 h-16 border-solid"></div>
    )
} 