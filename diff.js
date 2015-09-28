var spawn = require( "child_process" ).spawn;

module.exports = function( args, fn ) {
	var stdout = "";
	var stderr = "";

	var childArgs = [ "diff", "--no-color" ];
	if ( args ) {
		childArgs = childArgs.concat( args.split( /\s/ ) );
	}

	var child = spawn( "git", childArgs );

	child.stdout.on( "data", function( chunk ) {
		stdout += chunk;
	});

	child.stderr.on( "data", function( chunk ) {
		stderr += chunk;
	});

	child.on( "close", function( code ) {
		if ( code !== 0 ) {
			var error = new Error( stderr );
			error.code = code;
			fn( error );
		} else if ( !stdout.length ) {
			fn( null, null );
		} else {
			fn( null, splitByFile( stdout ) );
		}
	});
};

function splitByFile( diff ) {
	var filename;
	var isEmpty = true;
	var files = {};

	diff.split( "\n" ).forEach(function( line, i ) {

		// Unmerged paths, and possibly other non-diffable files
		// https://github.com/scottgonzalez/pretty-diff/issues/11
		if ( !line || line.charAt( 0 ) === "*" ) {
			return;
		}

		if ( line.charAt( 0 ) === "d" ) {
			isEmpty = false;
			filename = line.replace( /^diff --(?:cc |git a\/)(\S+).*$/, "$1" );
			files[ filename ] = [];
		}

		files[ filename ].push( line );
	});

	return isEmpty ? null : files;
}
