var yeoman = require('yeoman-environment');
var SocketAdapter = require('./socket-adapter');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var rimraf = require('rimraf');
var archiver = require('archiver');
var uuid = require('node-uuid');
var shortid = require('shortid');

module.exports = {
  init: init,
  run: run,
  list: list,
  adapter: SocketAdapter
};

function init(socket, onRun, onEnd) {
  var distFolderPath = path.join(__dirname, '../', '/dist/');

  // Clean dist folder
  if(fs.existsSync(distFolderPath)) {
    try {
      rimraf.sync(path.join(distFolderPath, '*'));
      rimraf.sync(path.join(distFolderPath, '.*'));
    }
    catch (err) {
      console.log('rimraf: ' + err);
    }
  } else {
    fs.mkdirSync(distFolderPath);
  }

  socket.on('yo:run', function(data) {
    // Move dist files
    var distId = shortid.generate();
    var distName = data.namespace.replace(/(:|\/)/gi, '-');
    var distIdPath = path.join(distFolderPath, distId);
    var distPath = path.join(distFolderPath, distId, distName);

    fs.mkdirSync(distIdPath);
    fs.mkdirSync(distPath);

    try {
      process.chdir(distPath);
    }
    catch (err) {
      console.log('chdir: ' + err);
    }

    run(data.namespace, socket, {}, { 'skip-install': true }, function() {
      // Move dist archive
      var archive = archiver.create('zip', {});
      var output = fs.createWriteStream(path.join(distFolderPath, distId, distName + '.zip'));

      output.on('close', function() {
        console.log('Project has been created.');
        console.log('File: ' + distName + '.zip');
        console.log('Size: ' + archive.pointer() + ' total bytes');

        socket.emit('yo:end', {
          distId: distId,
          distName: distName
        });
      });

      archive.on('error', function(err) {
        socket.emit('yo:end', {
          distId: null
        });
        throw err;
      });

      archive.pipe(output);
      archive.directory(distPath, false);
      archive.finalize();
    });
  });

  socket.on('yo:list', function() {
    list(function(generatorList) {
      socket.emit('yo:list', generatorList);
    });
  });
}

function run(namespace, socket, envOptions, runOptions, cb) {
  var env = yeoman.createEnv([], envOptions, new SocketAdapter(socket));
  env.lookup(function () {
    env.run(namespace, runOptions, cb);
  });
}

function list(cb) {
  var config = require(path.join(__dirname, '../', '/config.json'));
  var env = yeoman.createEnv();
  env.lookup(function () {
    var generators = env.getGeneratorsMeta();
    var generatorsObj = {};
    var generatorsList = [];

    _.forEach(generators, function(gen) {
      var namespace = gen.namespace.split(':');
      var name = namespace[0];
      var subname = namespace[1];

      if (config.generator === name) {
        var generator = {
          name: name,
          namespace: namespace.join(':'),
          resolved: gen.resolved
        };

        if(!generatorsObj.hasOwnProperty(name)) {
          generator.subgenerators = [];
          generatorsObj[name] = generator;
          generatorsList.push(generator);
        }

        generatorsObj[name].subgenerators.push({
          name: subname,
          namespace: namespace.join(':')
        });
      }
    });

    return cb(generatorsList);
  });
}
