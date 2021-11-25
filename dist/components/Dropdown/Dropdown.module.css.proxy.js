
export let code = "._container_18qps_1 {\n  width: 100%;\n  margin-bottom: 8px;\n}\n._container_18qps_1._error_18qps_5 ._dropdown_18qps_5 {\n  border-color: #ff0c3e;\n}\n._container_18qps_1._error_18qps_5 ._helperText_18qps_8 {\n  color: #ff0c3e;\n}\n._container_18qps_1._medium_18qps_11 ._dropdown_18qps_5 {\n  height: 48px;\n}\n._container_18qps_1._medium_18qps_11 ._select_18qps_14 {\n  height: 46px;\n  padding: 14px 16px;\n}\n._label_18qps_19 {\n  display: block;\n  margin-bottom: 4px;\n  font-weight: var(--body-font-weight-bold);\n  text-align: left;\n}\n._label_18qps_19 > span {\n  float: right;\n  color: rgba(255, 255, 255, 0.7);\n  font-weight: normal;\n}\n._dropdown_18qps_5 {\n  position: relative;\n  display: grid;\n  align-items: center;\n  width: 140px;\n  height: 36px;\n  font-size: 1.25rem;\n  background-color: rgba(0, 0, 0, 0.54);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 0.25em;\n  cursor: pointer;\n  grid-template-areas: \"select\";\n}\n._dropdown_18qps_5::after {\n  z-index: 1;\n  width: 10px;\n  height: 5px;\n  margin-right: 9px;\n  background-color: #fff;\n  clip-path: polygon(100% 0%, 0 0%, 50% 100%);\n  -webkit-clip-path: polygon(100% 0%, 0 0%, 50% 100%);\n  /* stylelint-disable-line */\n  content: \"\";\n  justify-self: end;\n}\n._dropdown_18qps_5._fullWidth_18qps_56 {\n  width: 100%;\n  margin-left: initial;\n}\n._dropdown_18qps_5 ._select_18qps_14 {\n  z-index: 1;\n  width: 100%;\n  height: 36px;\n  margin: 0;\n  padding: 2px 8px;\n  color: #fff;\n  font-family: inherit;\n  font-weight: 700;\n  font-size: 1rem;\n  line-height: 1em;\n  text-overflow: ellipsis;\n  background: none;\n  border: none;\n  outline: none;\n  cursor: inherit;\n  -webkit-appearance: none;\n  /* stylelint-disable-line */\n  appearance: none;\n}\n._dropdown_18qps_5 ._select_18qps_14::-ms-expand {\n  display: none;\n}\n._dropdown_18qps_5 ._select_18qps_14, ._dropdown_18qps_5::after {\n  grid-area: select;\n}\n._dropdown_18qps_5 ._disabled_18qps_86 {\n  background-color: #eee;\n  background-image: linear-gradient(to top, #ddd, #eee 33%);\n  cursor: not-allowed;\n}\n._dropdown_18qps_5:hover, ._dropdown_18qps_5:focus-within {\n  border-color: #fff;\n  outline: none;\n}\n._option_18qps_96 {\n  white-space: normal;\n  background-color: rgba(0, 0, 0, 0.84);\n  outline-color: #fff;\n}\n._helperText_18qps_8 {\n  margin-top: 4px;\n  font-size: 12px;\n  text-align: left;\n}";
let json = {"container":"_container_18qps_1","error":"_error_18qps_5","dropdown":"_dropdown_18qps_5","helperText":"_helperText_18qps_8","medium":"_medium_18qps_11","select":"_select_18qps_14","label":"_label_18qps_19","fullWidth":"_fullWidth_18qps_56","disabled":"_disabled_18qps_86","option":"_option_18qps_96"};
export default json;

// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';

  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}