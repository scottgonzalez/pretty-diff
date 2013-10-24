#!/usr/bin/env node

var fs = require( "fs" ),
	exec = require( "child_process" ).exec,
	diff = require( "./diff" );

diff( process.argv.slice( 2 ).concat( "--word-diff=porcelain"/*, "--word-diff-regex=[A-z0-9_]+|[^[:space:]]"*/ ).join( " " ), function( error, parsedDiff ) {
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
				markUpDiff( parsedDiff[ file ].slice( 4 ).join( "\n" ) ) +
			"</div></div>";
		}

		fs.writeFileSync( "/tmp/diff.html", template.replace( "{{diff}}", diffHtml ) );
		exec( "open /tmp/diff.html" );
}

function escape( str ) {
	return str
		.replace( /&/g, "&amp;" )
		.replace( /</g, "&lt;" )
		.replace( />/g, "&gt;" )
		.replace( /\t/g, "    " );
}

function generateLine( parts ) {
	var part = parts[ 0 ];
	if ( part.type === "@" ) {
		return "<pre>" + part.content.replace( /(@[^@]+@@)(.*)/, function( _, info, content ) {
			return "<span class='info'>@" + escape( info ) + "</span>" + escape( content );
		}) + "</pre>";
	} else {
		return "<pre>" + escape( part.content ) + "</pre>";
	}
}

function generateDeletion( parts ) {
	return "" +
		"<pre class='delete'>" +
		parts.map(function( part ) {
			if ( parts.length > 1 && part.type === "-" ) {
				return "<span class='word-delete'>" + escape( part.content ) + "</span>";
			} else if ( part.type !== "+" ) {
				return escape( part.content );
			}
		}).join( "" ) +
		"</pre>";
}

function generateInsertion( parts ) {
	return "" +
		"<pre class='insert'>" +
		parts.map(function( part ) {
			if ( parts.length > 1 && part.type === "+" ) {
				return "<span class='word-insert'>" + escape( part.content ) + "</span>";
			} else if ( part.type !== "-" ) {
				return escape( part.content );
			}
		}).join( "" ) +
		"</pre>";
}

function markUpDiff( diff ) {
	var diffStart = diff.indexOf( "@" );
	var lines = diff.substring( 0, diffStart )
		.split( "\n" )
		.map(function( line ) {
			return " " + line;
		})
		.concat(
			diff.substring( diffStart ).split( /\n~\n/ )
		);

	return lines.map(function( line ) {
		var parts = line.split( "\n" ).map(function( part ) {
			return {
				type: part.charAt( 0 ),
				content: part.substring( 1 )
			};
		});
		var hasDeletion = !!parts.filter(function( part ) {
			return part.type === "-";
		}).length;
		var hasInsertion = !!parts.filter(function( part ) {
			return part.type === "+";
		}).length;

		if ( hasInsertion && hasDeletion ) {
			return generateDeletion( parts ) + generateInsertion( parts );
		} else if ( hasInsertion ) {
			return generateInsertion( parts );
		} else if ( hasDeletion ) {
			return generateDeletion( parts );
		} else {
			return generateLine( parts );
		}
	}).join( "\n" );
}
