var generators = require('yeoman-generator');
var yosay = require('yosay');
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
//var chalk = require('chalk');
//var wiredep = require('wiredep');
//var _ = require('lodash');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    this.pkg = this.fs.readJSON(path.join(this.destinationPath(), 'package.json'), {});
    this.config = this.fs.readJSON(path.join(__dirname, '/config.json'), {});
    this.project = this.config.project || 'new-project';
    this.app = this.config.app || 'app';
    this.destinationRoot(this.project);

    //Show Start Message
    this.log(yosay(this.config.message));
  },

  prompting: function () {
    var done = this.async();

    //Define Prompts
    var prompts = [
      {
        type: 'confirm',
        name: 'cssProcessors',
        message: 'Would you like to include a CSS Pre-processor?',
        default: true
      },
      {
        type: 'list',
        name: 'cssProcessorsList',
        message: 'What kind of CSS Pre-processor would you like?',
        default: 'sass',
        choices: [
          {
            name: 'Sass',
            value: 'sass'
          },
          {
            name: 'Less',
            value: 'less'
          }
        ],
        when: function (answers) {
          return answers.cssProcessors;
        }
      },
      {
        type: 'confirm',
        name: 'templateEngines',
        message: 'Would you like to include a Javascript Templating Engine?',
        default: true
      },
      {
        type: 'list',
        name: 'templateEnginesList',
        message: 'What JavaScript Code Quality Tool would you like?',
        default: 'handlebars',
        choices: [
          {
            name: 'Handlebars',
            value: 'handlebars'
          },
          {
            name: 'Dust',
            value: 'dust'
          },
          {
            name: 'EJS',
            value: 'ejs'
          }
        ],
        when: function (answers) {
          return answers.templateEngines;
        }
      },
      {
        type: 'confirm',
        name: 'jsLinters',
        message: 'Would you like to include a JavaScript Code Quality Tool?',
        default: true
      },
      {
        type: 'list',
        name: 'jsLintersList',
        message: 'What kind of JavaScript Code Quality Tool would you like?',
        default: 'jshint',
        choices: [
          {
            name: 'JSHint',
            value: 'jshint'
          },
          {
            name: 'JSLint',
            value: 'jslint'
          }
        ],
        when: function (answers) {
          return answers.jsLinters;
        }
      },
      {
        type: 'confirm',
        name: 'jsCodeSniffer',
        message: 'Would you like to include JSCodeSniffer?',
        default: true
      },
      {
        type: 'confirm',
        name: 'htmlHint',
        message: 'Would you like to include HTMLHint?',
        default: true
      },
      {
        type: 'list',
        name: 'serversList',
        message: 'What kind of Server would you like?',
        default: 'express',
        choices: [
          {
            name: 'Express Server',
            value: 'express'
          },
          {
            name: 'Connect Web Server',
            value: 'connect'
          }
        ]
      }
    ];

    this.prompt(prompts, function (answers) {
      function hasFeature(options, choice) {
        return options && options.indexOf(choice) !== -1;
      }

      this.userAnswers = {
        cssProcessors: {
          sass: answers.cssProcessors ? hasFeature(answers.cssProcessorsList, 'sass') : false,
          less: answers.cssProcessors ? hasFeature(answers.cssProcessorsList, 'less') : false
        },
        templateEngines: {
          ejs: answers.templateEngines ? hasFeature(answers.templateEnginesList, 'ejs') : false,
          handlebars: answers.templateEngines ? hasFeature(answers.templateEnginesList, 'handlebars') : false,
          dust: answers.templateEngines ? hasFeature(answers.templateEnginesList, 'dust') : false
        },
        jsLinters: {
          jshint: answers.jsLinters ? hasFeature(answers.jsLintersList, 'jshint') : false,
          jslint: answers.jsLinters ? hasFeature(answers.jsLintersList, 'jslint') : false
        },
        jsCodeSniffer: answers.jsCodeSniffer || false,
        htmlHint: answers.htmlHint || false,
        servers: {
          express: hasFeature(answers.serversList, 'express'),
          connect: hasFeature(answers.serversList, 'connect')
        }
      };

      done();
    }.bind(this));
  },

  writing: {
    cleanFolder: function () {
      if (this.fs.exists(path.join(this.destinationRoot(), 'package.json'))) {
        rimraf.sync(path.join(this.destinationRoot(), '*'));
        rimraf.sync(path.join(this.destinationRoot(), '.*'));
      }
    },

    createFolderStructure: function () {
      mkdirp.sync(path.join(this.destinationPath(this.app), '/css'));
      mkdirp.sync(path.join(this.destinationPath(this.app), '/js'));
      mkdirp.sync(path.join(this.destinationPath(this.app), '/images'));
      mkdirp.sync(path.join(this.destinationPath(this.app), '/fonts'));
    },

    copyCSS: function () {
      console.log(this.userAnswers.cssProcessors);
      if (this.userAnswers.cssProcessors.sass) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/css/scss/**/*'),
          path.join(this.destinationPath(this.app), '/css')
        );
      } else if (this.userAnswers.cssProcessors.less) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/css/less/**/*'),
          path.join(this.destinationPath(this.app), '/css')
        );
      } else {
        this.fs.copy(
          path.join(this.sourceRoot(), '/css/dist/**/*'),
          path.join(this.destinationPath(this.app), '/css')
        );
      }
    },

    copyJS: function () {
      this.fs.copy(
        path.join(this.sourceRoot(), '/js/**/*'),
        path.join(this.destinationPath(this.app), '/js')
      );
    },

    copyImages: function () {
      this.fs.copy(
        path.join(this.sourceRoot(), '/images/**/*'),
        path.join(this.destinationPath(this.app), '/images')
      );
    },

    copyFonts: function () {
      this.fs.copy(
        path.join(this.sourceRoot(), '/fonts/**/*'),
        path.join(this.destinationPath(this.app), '/fonts')
      );
    },

    copyTemplates: function () {
      if (this.userAnswers.templateEngines.ejs) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/ejs/**/*'),
          path.join(this.destinationPath(this.app), '/templates')
        );
      } else if (this.userAnswers.templateEngines.handlebars) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/handlebars/**/*'),
          path.join(this.destinationPath(this.app), '/templates')
        );
      } else if (this.userAnswers.templateEngines.dust) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/dust/**/*'),
          path.join(this.destinationPath(this.app), '/templates')
        );
      } else {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/dist/**/*'),
          path.join(this.destinationPath(this.app))
        );
      }
    },

    packageJSON: function () {
      this.fs.copyTpl(
        path.join(this.sourceRoot(), 'package.json'),
        path.join(this.destinationRoot(), 'package.json'),
        {
          userAnswers: this.userAnswers
        }
      );
    },

    JSLinter: function () {
      if (this.userAnswers.jsLinters.jshint) {
          this.fs.copy(
            path.join(this.sourceRoot(), '.jshintrc'),
            path.join(this.destinationRoot(), '.jshintrc')
          );
      }

      if (this.userAnswers.jsLinters.jslint) {
          this.fs.copy(
            path.join(this.sourceRoot(), '.jslintrc'),
            path.join(this.destinationRoot(), '.jslintrc')
          );
      }
    },

    JSCodeSniffer: function () {
      if (this.userAnswers.jsCodeSniffer) {
        this.fs.copy(
          path.join(this.sourceRoot(), '.jscsrc'),
          path.join(this.destinationRoot(), '.jscsrc')
        );
      }
    },

    HtmlLinter: function () {
      if (this.userAnswers.htmlHint) {
        this.fs.copy(
          path.join(this.sourceRoot(), '.htmlhintrc'),
          path.join(this.destinationRoot(), '.htmlhintrc')
        );
      }
    }
  },

  install: function () { },

  end: function () { }
});