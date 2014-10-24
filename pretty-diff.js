#!/usr/bin/env node

var fs = require( "fs" ),
	open = require( "open" ),
	diff = require( "./diff" );

diff( process.argv.slice( 2 ).join( " " ), function( error, parsedDiff ) {
	if ( error ) {
		process.stderr.write( error );
		return;
	}

	if ( !parsedDiff ) {
		console.log( "No differences" );
		return;
	}

	generatePrettyDiff( parsedDiff );
});

function generatePrettyDiff( parsedDiff ) {
	var template = fs.readFileSync( __dirname + "/template.html", "utf8" ),
		diffHtml = "";

		for ( var file in parsedDiff ) {
			diffHtml += "<h2>" + file + "</h2>" +
			"<div class='file-diff'><div>" +
				markUpDiff( parsedDiff[ file ] ) +
			"</div></div>";
		}

		fs.writeFileSync( "/tmp/diff.html", template.replace( "{{diff}}", diffHtml ) );
		open( "/tmp/diff.html" );
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
