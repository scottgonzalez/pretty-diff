#!/usr/bin/env node

var https = require( "https" );
var exec = require( "child_process" ).exec;
var open = require( "open" );
var github = require( "github-request" );
var diff = require( "./diff" );
var args = process.argv.slice( 2 );
var publicGist = args.indexOf( "--public" );
var isPublic = publicGist !== -1;

if ( isPublic ) {
	args.splice( publicGist, 1 );
}



function getUA() {
	var os = require( "os" );
	var version = require( "./package.json" ).version;

	return os.platform() + "/" + os.release() + " " +
		"node/" + process.versions.node + " " +
		"gist-diff/" + version;
}

diff( args.join( " " ), function( error, parsedDiff ) {
	if ( error ) {
		console.log( error );
		return;
	}

	if ( !parsedDiff ) {
		console.log( "No differences" );
		return;
	}

	var files = {};
	for ( var file in parsedDiff ) {
		files[ file.replace( /\//g, "-" ) + ".diff" ] = {
			content: parsedDiff[ file ].join( "\n" )
		};
	}

	getAuth(function( error, auth ) {
		if ( error ) {
			console.log( error );
			return;
		}

		postGist({
			"public": isPublic,
			files: files
		}, auth, showGist );
	});
});

function postGist( settings, auth, fn ) {
	var headers = { "user-agent": getUA() };

	if ( auth ) {
		headers.Authorization = auth;
	}

	github.request({
		path: "/gists",
		method: "POST",
		headers: headers
	}, settings, fn );
}

function showGist( error, data ) {
	if ( error ) {
		console.log( error );
		return;
	}

	if ( data.html_url ) {
		open( data.html_url );
	} else {
		console.log( data.message );
	}
}

function getGitConfig( name, fn ) {
	exec( "git config --get " + name, function( error, stdout ) {
		if ( error ) {
			if ( /^Command failed:\s+$/.test( error.message ) ) {
				return fn( null, null );
			}

			return fn( error );
		}

		fn( null, stdout.trim() );
	});
}

function getUsername( fn ) {
	getGitConfig( "github.user", function( error, username ) {
		if ( error ) {
			return fn( error );
		}

		if ( username ) {
			return fn( null, username );
		}

		process.stdout.write( "GitHub username (leave blank for anonymous gist): " );
		process.stdin.resume();
		process.stdin.setEncoding( "utf8" );

		process.stdin.once( "data", function( chunk ) {
			process.stdin.pause();
			fn( null, chunk.trim() );
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
	getGitConfig( "gist-diff.token", function( error, token ) {
		if ( token ) {
			return fn( null, "token " + token );
		}

		getUsername(function( error, username ) {
			if ( error ) {
				return fn( error );
			}

			// No username, create anonymous gist
			if ( !username ) {
				return fn( null, null );
			}

			getPassword( username, function( password ) {

				// No password, create anonymous gist
				if ( !password ) {
					return fn( null, null );
				}

				fn( null, "Basic " +
					new Buffer( username + ":" + password ).toString( "base64" ) );
			});
		});
	});
}
