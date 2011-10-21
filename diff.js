var exec = require( "child_process" ).exec;

module.exports = function( args, fn ) {
	exec( "git diff " + args, function( error, stdout, stderr ) {
		if ( error ) {
			fn( error );
		} else if ( stderr.length ) {
			fn( stderr );
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
