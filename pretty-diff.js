#!/usr/bin/env node

var fs = require( "fs" ),
	exec = require( "child_process" ).exec;

function generatePrettyDiff( diff ) {
	var parsedDiff = parseDiff( diff ),
		template = fs.readFileSync( __dirname + "/template.html", "utf8" ),
		diffHtml = "";

	for ( var file in parsedDiff ) {
		diffHtml += "<h2>" + file + "</h2>" +
			"<div class='file-diff'>" +
				parsedDiff[ file ] +
			"</div>";
	}

	fs.writeFileSync( "/tmp/diff.html", template.replace( "{{diff}}", diffHtml ) );
	exec( "open /tmp/diff.html" );
};

function parseDiff( diff ) {
	var parsed = splitByFile( diff );
	for ( var file in parsed ) {
		parsed[ file ] = markUpDiff( parsed[ file ] );
	}
	return parsed;
}

function splitByFile( diff ) {
	var filename,
		files = {};

	diff.split( "\n" ).forEach(function( line, i ) {
		if ( line.charAt( 0 ) === "d" ) {
			filename = line.replace( /^diff --git a\/(\S+).*$/, "$1" );
			files[ filename ] = [];
		}

		files[ filename ].push( line );
	});

	return files;
}

var markUpDiff = function() {
	var diffClasses = {
		"d": "file",
		"i": "file",
		"@": "info",
		"-": "delete",
		"+": "insert",
		" ": "context"
	};

	function escape( str ) {
		return str
			.replace( /&/g, "&amp;" )
			.replace( /</g, "&lt;" )
			.replace( />/g, "&gt;" );
	}

	return function( diff ) {
		return diff.map(function( line ) {
			var type = line.charAt( 0 );
			return "<pre class='" + diffClasses[ type ] + "'>" + escape( line ) + "</pre>";
		}).join( "\n" );
	};
}();

exec( "git diff " + process.argv.slice( 2 ).join( " " ), function( error, stdout, stderr ) {
	if ( stderr.length ) {
		process.stderr.write( stderr );
	} else if ( stdout.length ) {
		generatePrettyDiff( stdout );
	} else {
		console.log( "No differences" );
	}
});
