import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App.jsx";
import { store, persistor } from "./redux/store.js"; // ✅ named import
import 'bootstrap/dist/css/bootstrap.min.css';

// Browser scroll restoration is disabled because it fires before async data
// finishes loading and the page grows. We persist the scroll position on
// beforeunload and restore it manually in Layout once the page is tall enough.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.addEventListener("beforeunload", () => {
  try {
    sessionStorage.setItem(
      `scroll:${window.location.pathname}`,
      String(window.scrollY)
    );
  } catch {
    /* sessionStorage may be unavailable */
  }
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter basename="/nycueelab/">
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
