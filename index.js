var fs       = require('fs')
var path     = require('path')
var async    = require('async')
var backbeam = require('backbeam')
var moment   = require('moment') // if you need to parse dates

String.prototype.trim = function() { return this.replace(/^\s*|\s*$/g,'') }

function removeQuotes(str) {
	return str.substring(1, str.length-1)
}

function importData(callback) {
	// read the file
	var fullpath = path.join(__dirname, 'data.csv')
	fs.readFile(fullpath, 'utf8', function(err, data) {
		if (err) { return callback(err) }

		// split the lines
		var lines = data.split('\n')
		async.eachSeries(lines, function(line, next) {
			// split the values in each line
			var tokens = line.split(';')
			if (tokens.length <= 1) { return next() } // ignore blank lines
			
			// Save the data to backbeam
			// Here we are supposing that there is an "event" entity with at least two fields: a name and a start_date
			var obj = backbeam.empty('event')
			obj.set('name', removeQuotes(tokens[0]).trim())
			var date = removeQuotes(tokens[1]).trim()
			var d = moment(date)
			obj.set('start_date', d.toDate())
			obj.save(next)
		}, callback)
	})
}

if (module.id === require.main.id) {

	backbeam.configure({
		project: '', // the subdomain used in your control panel project
		shared: '', // the shared key in your pair of API keys
		secret: '', // the secret key in your pair of API keys
		env: 'dev' // "dev" or "pro"
	})

	importData(function(err) {
		if (err) {
			console.log('Error: ', err)
		} else {
			console.log('Done!')
		}
	})

}