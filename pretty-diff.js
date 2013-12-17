#!/usr/bin/env node

var fs = require( "fs" ),
	exec = require( "child_process" ).exec,
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
			"<div class='file-diff'><table>" +
				markUpDiff( parsedDiff[ file ] ) +
			"</table></div>";
		}

		fs.writeFileSync( "/tmp/diff.html", template.replace( "{{diff}}", diffHtml ) );
		exec( "open /tmp/diff.html" );
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

	function lineNumTemplate( oldNum, newNum, type ) {
		var remove = type == '+' ? '' : oldNum,
			add    = type == '-' ? '' : newNum;
		return '<td class="line-number">' + (remove || '') + '</td><td class="line-number">' + (add || '') + '</td>';
	}

	return function( diff ) {
		return diff.map(function( lineData ) {
			var type = lineData.line.charAt( 0 );
			return '<tr class="line ' + diffClasses[ type ] + '">' + lineNumTemplate( lineData.oldLineNum, lineData.newLineNum, type ) + '<td><pre>' + escape( lineData.line ) + '</pre></td></tr>';
		}).join( "\n" );
	};
}();
