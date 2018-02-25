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
    console.info("Running npm run lint...");
    return shell.exec("npm run lint", { async: true }, function(
      code,
      stdout,
      stderr
    ) {
      if (stdout.includes("Please fix them and try committing again.")) {
        console.info(
          "\x1b[31m%s\x1b[0m",
          `
    
Errors have been found in your files that prettier can't fix. Please run eslint --fix or fix them yourself
            
./node_modules/eslint/bin/eslint.js --fix ./[Full path to file].js
^ For Example ^
            
`
        );
      } else {
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
    });
  }
};
