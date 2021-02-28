import React from "react";
// const whyDidYouRender = require("@welldone-software/why-did-you-render");
// whyDidYouRender(React, {
//   trackAllPureComponents: true,
// });
import { render } from "react-dom";
import { App } from "./App";

render(<App />, document.getElementById("app"));
