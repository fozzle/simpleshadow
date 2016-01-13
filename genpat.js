var Markov = require('markov');
var fs = require('fs');

var pat = Markov(1);
var fd = fs.createReadStream(__dirname + '/pat.txt');

pat.seed(fd, function() {
	var stdin = process.openStdin();
	console.log("enter");

	stdin.on('data', function() {
		var res = pat.pick();
		console.log(pat.forward(res).join(' '));
	});
});

