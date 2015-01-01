#!/usr/bin/env node

var fs = require( "fs" ),
	open = require( "open" ),
	diff = require( "./diff" );

diff( process.argv.slice( 2 ).join( " " ), function( error, parsedDiff ) {
	if ( error ) {
		console.error( error );
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

	return function( lines ) {
		var line, type, lookAhead, lookAheadType,
			output = "";

		while ( lines.length ) {
			line = lines.shift();
			type = line.charAt( 0 );

			if ( type === "d" || type === "i" || type === "@" ) {
				output += "<pre class='" + diffClasses[ type ] + "'>" + escape( line ) + "</pre>\n";
				continue;
			}

			if ( type === "+" ) {
				output += "<pre class='split'> </pre>";
				output += "<pre class='split " + diffClasses[ type ] + "'>" + escape( line ) + "</pre>";
			} else if ( type === "-" ) {
				output += "<pre class='split " + diffClasses[ type ] + "'>" + escape( line ) + "</pre>";

				lookAhead = 0;
				lookAheadType = lines[ lookAhead ].charAt( 0 );
				while ( lookAheadType === "-" && lookAhead < lines.length ) {
					lookAhead++;
					lookAheadType = lines[ lookAhead ].charAt( 0 );
				}

				if ( lookAheadType === "+" ) {
					line = lines.splice( lookAhead, 1 )[ 0 ];
					type = line.charAt( 0 );
					output += "<pre class='split " + diffClasses[ type ] + "'>" + escape( line ) + "</pre>";
				} else {
					output += "<pre class='split'> </pre>";
				}
			} else {
				output += "<pre class='split " + diffClasses[ type ] + "'>" + escape( line ) + "</pre>";
				output += "<pre class='split " + diffClasses[ type ] + "'>" + escape( line ) + "</pre>";
			}

			output += "\n";
		}

		return output;
	};
}();
