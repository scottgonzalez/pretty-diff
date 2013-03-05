#!/usr/bin/env node

var https = require( "https" ),
	exec = require( "child_process" ).exec,
	diff = require( "./diff" );

getAuth(function( username, password ) {
	var auth = username && password ? username + ":" + password : null,
		args = process.argv.slice( 2 ),
		publicGist = args.indexOf( "--public" ),
		isPublic = publicGist !== -1;

	if ( isPublic ) {
		args.splice( publicGist, 1 );
	}

	diff( args.join( " " ), function( error, parsedDiff ) {
		var files = {};
		for ( var file in parsedDiff ) {
			files[ file.replace( /\//g, "-" ) + ".diff" ] = {
				content: parsedDiff[ file ].join( "\n" )
			};
		}
		postGist({
			"public": isPublic,
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
		var username = stdout.trim();
		if ( username ) {
			fn( username );
			return;
		}

		process.stdout.write( "GitHub username: " );
		process.stdin.resume();
		process.stdin.setEncoding( "utf8" );

		process.stdin.once( "data", function( chunk ) {
			process.stdin.pause();
			fn( chunk.trim() );
		});
	});
}

function getPassword( username, fn ) {
	process.stdout.write( "GitHub password for " + username + ": " );
	process.stdin.resume();
	process.stdin.setEncoding( "utf8" );
	process.stdin.setRawMode( true );

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
		getPassword( username, function( password ) {
			fn( username, password );
		});
	});
}
