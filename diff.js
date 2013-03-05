var spawn = require( "child_process" ).spawn;

module.exports = function( args, fn ) {
	var childArgs = args ? [ "diff" ].concat( args.split( /\s/ ) ) : [ "diff" ],
		child = spawn( "git", childArgs ),
		stdout = "",
		stderr = "";

	child.stdout.on( "data", function( chunk ) {
		stdout += chunk;
	});

	child.stderr.on( "data", function( chunk ) {
		stderr += chunk;
	});

	child.on( "close", function( code ) {
		if ( code !== 0 ) {
			fn( new Error( stderr ) );
		} else if ( !stdout.length ) {
			fn( null, null );
		} else {
			fn( null, splitByFile( stdout ) );
		}
	});
};

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
