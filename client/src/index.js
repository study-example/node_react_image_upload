import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ImageProvider } from "./context/imageContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ImageProvider>
        <App />
      </ImageProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
