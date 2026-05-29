import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { FloatingNumpad } from "./components/FloatingNumberPad";
import { PenSidebar } from "./components/PenSidebar";
import "./core/touchPolish";

const rootEl = document.createElement("div");
rootEl.id = "onshape-tablet-root";
document.body.appendChild(rootEl);

createRoot(rootEl).render(
	<React.StrictMode>
		<PenSidebar />
		<FloatingNumpad />
	</React.StrictMode>,
);
