#!/usr/bin/env node

var https = require( "https" ),
	exec = require( "child_process" ).exec,
	diff = require( "./diff" );

getAuth(function( username, password ) {
	var auth = username && password ? username + ":" + password : null,
		args = process.argv.slice( 2 ),
		publicGist = args.indexOf( "--public" );

	if ( publicGist !== -1 ) {
		args.splice( publicGist, 1 );
	}

	diff( args, function( error, parsedDiff ) {
		var files = {};
		for ( var file in parsedDiff ) {
			files[ file.replace( /\//g, "-" ) + ".diff" ] = {
				content: parsedDiff[ file ].join( "\n" )
			};
		}
		postGist({
			"public": publicGist !== -1,
			files: files
		}, auth, showGist );
	});
});

function postGist( settings, auth, fn ) {
	var data = JSON.stringify( settings ),
		headers = {
			"Content-length": data.length
		};

	if ( auth ) {
		headers.Authorization = "Basic " + new Buffer( auth ).toString( "base64" );
	}

	var req = https.request({
		host: "api.github.com",
		port: 443,
		path: "/gists",
		method: "POST",
		headers: headers
	}, function( res ) {
		var response = "";
		res.setEncoding( "utf8" );
		res.on( "data", function( chunk ) {
			response += chunk;
		});
		res.on( "end", function() {
			fn( JSON.parse( response ) );
		});
	});

	req.write( data );
	req.end();
}

function showGist( data ) {
	if ( data.html_url ) {
		exec( "open " + data.html_url );
	} else {
		console.log( data.message );
	}
}

function getUsername( fn ) {
	exec( "git config --get github.user", function( error, stdout ) {
		fn( stdout.trim() );
	});
}

function requestPassword( username, fn ) {
	process.stdout.write( "GitHub password for " + username + ": " );
	process.stdin.resume();
	process.stdin.setEncoding( "utf8" );
	require( "tty" ).setRawMode( true );

	var password = "";
	process.stdin.on( "data", function( chunk ) {
		if ( chunk.charCodeAt( 0 ) === 13 ) {
			process.stdin.pause();
			console.log( "" );
			fn( password );
			return;
		}
		password += chunk;
	});
}

function getAuth( fn ) {
	getUsername(function( username ) {
		requestPassword( username, function( password ) {
			fn( username, password );
		});
	});
}
