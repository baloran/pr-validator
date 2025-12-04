var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var core = __toESM(require("@actions/core"));
var github = __toESM(require("@actions/github"));
async function run() {
  try {
    const mandatoryAssigneeInput = core.getInput("mandatory-assignee");
    const mandatoryAssignee = mandatoryAssigneeInput.toLowerCase() === "true";
    const context2 = github.context;
    if (context2.payload.pull_request == null) {
      core.setFailed("This action can only be run on pull_request events.");
      return;
    }
    const pr = context2.payload.pull_request;
    let isValid = true;
    let validationMessages = [];
    if (mandatoryAssignee) {
      if (pr.assignee == null) {
        isValid = false;
        validationMessages.push("Pull request must have an assignee.");
      }
    }
    if (isValid) {
      core.info("Pull request is valid.");
    } else {
      core.setFailed(
        `Pull request is invalid:
- ${validationMessages.join("\n- ")}`
      );
    }
    core.setOutput("isvalid", isValid.toString());
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
