#!/usr/bin/env node

var fs = require( "fs" );
var path = require( "path" );
var os = require( "os" );
var open = require( "open" );
var diff = require( "./diff" );

diff( process.argv.slice( 2 ).join( " " ), function( error, parsedDiff ) {
	if ( error ) {

		// Usage error, assume we're not in a git directory
		if ( error.code === 129 ) {
			process.stderr.write( "Error: Not a git repository\n" );
			return;
		}

		process.stderr.write( error.message );
		return;
	}

	if ( !parsedDiff ) {
		console.log( "No differences" );
		return;
	}

	generatePrettyDiff( parsedDiff );
});

function generatePrettyDiff( parsedDiff ) {
	var template = fs.readFileSync( __dirname + "/template.html", "utf8" );
	var diffHtml = "";
	var tempPath = path.join( os.tmpdir(), "diff.html" );

	for ( var file in parsedDiff ) {
		diffHtml += "<h2>" + file + "</h2>" +
		"<div class='file-diff'><div>" +
			markUpDiff( parsedDiff[ file ] ) +
		"</div></div>";
	}

	fs.writeFileSync( tempPath, template.replace( "{{diff}}", diffHtml ) );
	open( tempPath );
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
			.replace( /\$/g, "$$$$" )
			.replace( /&/g, "&amp;" )
			.replace( /</g, "&lt;" )
			.replace( />/g, "&gt;" )
			.replace( /\t/g, "    " );
	}

	return function( diff ) {
		return diff.map(function( line ) {
			var type = line.charAt( 0 );
			return "<pre class='" + diffClasses[ type ] + "'>" + escape( line ) + "</pre>";
		}).join( "\n" );
	};
}();
