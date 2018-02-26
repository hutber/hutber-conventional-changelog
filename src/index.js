const fs = require("fs");
const inquirer = require("inquirer");
const wrap = require("word-wrap");
const appRoot = require("app-root-path");
const { questions } = require("./prompt/questions");
const LimitedInput = require("./prompt/LimitedInput");
const shell = require("shelljs");

const MAX_LINE_WIDTH = 72;

inquirer.registerPrompt("limitedInput", LimitedInput);

const makeAffectsLine = function(answers) {
  const selectedPackages = answers.packages;

  if (selectedPackages && selectedPackages.length) {
    return `\naffects: ${selectedPackages.join(", ")}`;
  }

  return "";
};

module.exports = {
  prompter(cz, commit) {
    return inquirer.prompt(questions).then(answers => {
      const wrapOptions = {
        indent: "",
        trim: true,
        width: MAX_LINE_WIDTH
      };

      const head = answers.type + ": " + answers.subject;
      const affectsLine = makeAffectsLine(answers);

      // Wrap these lines at MAX_LINE_WIDTH character
      const body = wrap(answers.body + affectsLine, wrapOptions);
      const breaking = wrap(answers.breaking, wrapOptions);
      const footer = wrap(answers.footer, wrapOptions);

      let msg;

      msg = head;

      if (body) {
        msg += "\n\n" + body;
      }

      if (breaking) {
        msg += "\n\nBREAKING CHANGE: " + breaking;
      }

      if (footer) {
        msg += "\n\nIssues: WMVT-230" + footer;
      }

      return commit(msg);
    });
  }
};
