# Pretty Diff

Pretty diff generates colorized HTML diffs similar to the diff/commit views on GitHub.
Simply use `git pretty-diff` the same way you use `git diff` and you'll get pretty diffs.

## Installation

Clone the repo and then create a Git alias. Open `~/.gitconfig` and add:

	[alias]
		pretty-diff = !node /path/to/pretty-diff.js
