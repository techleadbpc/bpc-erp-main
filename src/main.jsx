import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { store, persistor } from "./common/store/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./common/context/theme/theme-provider.jsx";
import { ErrorBoundary } from "./app/error/error-boundary/page.jsx";
import { LoaderProvider } from "./common/context/loader/loader-provider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false,
      retry: 2, // Retry failed requests 2 times
    },
  },
});

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <LoaderProvider>
              <LoaderProvider>
                <App />
              </LoaderProvider>
            </LoaderProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
  // </StrictMode>
);
