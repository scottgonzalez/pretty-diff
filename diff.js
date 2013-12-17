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
		files = {},
		matches,
		oldLineNum,
		newLineNum;

	diff.split( "\n" ).forEach(function( line, i ) {
		if ( line.charAt( 0 ) === "d" ) {
			filename = line.replace( /^diff --git a\/(\S+).*$/, "$1" );
			files[ filename ] = [];
			oldLineNum = null;
		} else if ( matches = line.match( /@@\ -[0-9]+(,[0-9]+)?\ \+([0-9]+)(,[0-9]+)?\ @@.*/ ) ) {
			oldLineNum = newLineNum = matches[ 2 ];
			files[ filename ].push({
				line: line,
				oldLineNum: null,
				newLineNum: null
			});
		} else if ( matches = line.match( /^(\[[0-9;]+m)*([\ +-])/ ) ) {
			files[ filename ].push({
				line: line,
				oldLineNum: oldLineNum,
				newLineNum: newLineNum
			});
			if ( matches[ 2 ] != '-' ) {
				newLineNum++;
			} 
			if ( matches[ 2 ] != '+' ) {
				oldLineNum++;
			}
		} else {
			files[ filename ].push({
				line: line,
				oldLineNum: null,
				newLineNum: null
			});
		}
	});

	return files;
}
