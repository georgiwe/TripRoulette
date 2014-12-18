var fs = require('fs');
var path = require('path');

// requires absolute path?
var modelsFolder = path.resolve(__dirname + '/model_files/') + '/';
var fileNames = fs.readdirSync(modelsFolder);

for (var i = 0, len = fileNames.length; i < len; i += 1) {
	require(modelsFolder + fileNames[i]);
};
