import React from "react";
import { hydrate } from "react-dom";
import App from "./app";

// @ts-ignore
hydrate(<App />, document.getElementById("react"));