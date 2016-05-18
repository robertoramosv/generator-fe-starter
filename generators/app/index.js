var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var path = require('path');
var rimraf = require('rimraf');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.conf = this.fs.readJSON(path.join(__dirname, '../', '/config.json'), {});
    this.projectAppPath = this.conf.projectAppPath || 'app';
    this.projectPath = this.conf.projectPath || 'my-project';
    this.destinationRoot(this.projectPath);

    //Show Start Message
    this.log(yosay(this.conf.message));
  },

  prompting: function () {
    var done = this.async();

    //Define Prompts
    var prompts = [
      {
        type: 'confirm',
        name: 'cssProcessors',
        message: chalk.white('Would you like to include a ' + chalk.cyan('CSS Pre-processor') + '?'),
        default: true
      },
      {
        type: 'list',
        name: 'cssProcessorsList',
        message: chalk.white('What kind of ' + chalk.cyan('CSS Pre-processor') + ' would you like?'),
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
        message: chalk.white('Would you like to include a ' + chalk.cyan('Javascript Templating Engine') + '?'),
        default: true
      },
      {
        type: 'list',
        name: 'templateEnginesList',
        message: chalk.white('What ' + chalk.cyan('JavaScript Code Quality Tool') + ' would you like?'),
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
        message: chalk.white('Would you like to include a ' + chalk.cyan('JavaScript Code Quality Tool') + '?'),
        default: true
      },
      {
        type: 'list',
        name: 'jsLintersList',
        message: chalk.white('What kind of ' + chalk.cyan('JavaScript Code Quality Tool') + ' would you like?'),
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
        message: chalk.white('Would you like to include ' + chalk.cyan('JSCodeSniffer') + '?'),
        default: true
      },
      {
        type: 'confirm',
        name: 'htmlHint',
        message: chalk.white('Would you like to include ' + chalk.cyan('HTMLHint') + '?'),
        default: true
      },
      {
        type: 'list',
        name: 'serversList',
        message: chalk.white('What kind of ' + chalk.cyan('Server') + ' would you like?'),
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
      mkdirp.sync(path.join(this.destinationRoot(), this.projectAppPath, '/css'));
      mkdirp.sync(path.join(this.destinationRoot(), this.projectAppPath, '/js'));
      mkdirp.sync(path.join(this.destinationRoot(), this.projectAppPath, '/images'));
      mkdirp.sync(path.join(this.destinationRoot(), this.projectAppPath, '/fonts'));
    },

    copyCSS: function () {
      if (this.userAnswers.cssProcessors.sass) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/css/scss/**/*'),
          path.join(this.destinationRoot(), this.projectAppPath, '/css')
        );
      } else if (this.userAnswers.cssProcessors.less) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/css/less/**/*'),
          path.join(this.destinationRoot(), this.projectAppPath, '/css')
        );
      } else {
        this.fs.copy(
          path.join(this.sourceRoot(), '/css/dist/**/*'),
          path.join(this.destinationRoot(), this.projectAppPath, '/css')
        );
      }
    },

    copyJS: function () {
      this.fs.copy(
        path.join(this.sourceRoot(), '/js/**/*'),
        path.join(this.destinationRoot(), this.projectAppPath, '/js')
      );
    },

    copyImages: function () {
      this.fs.copy(
        path.join(this.sourceRoot(), '/images/**/*'),
        path.join(this.destinationRoot(), this.projectAppPath, '/images')
      );
    },

    copyFonts: function () {
      this.fs.copy(
        path.join(this.sourceRoot(), '/fonts/**/*'),
        path.join(this.destinationRoot(), this.projectAppPath, '/fonts')
      );
    },

    copyTemplates: function () {
      if (this.userAnswers.templateEngines.ejs) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/ejs/**/*'),
          path.join(this.destinationRoot(), this.projectAppPath, '/templates')
        );
      } else if (this.userAnswers.templateEngines.handlebars) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/handlebars/**/*'),
          path.join(this.destinationRoot(), this.projectAppPath, '/templates')
        );
      } else if (this.userAnswers.templateEngines.dust) {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/dust/**/*'),
          path.join(this.destinationRoot(), this.projectAppPath, '/templates')
        );
      } else {
        this.fs.copy(
          path.join(this.sourceRoot(), '/templates/dist/**/*'),
          path.join(this.destinationRoot(), this.projectAppPath)
        );
      }
    },

    packageJSON: function () {
      this.fs.copyTpl(
        path.join(this.sourceRoot(), '_package.json'),
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