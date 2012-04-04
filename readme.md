# Pretty Diff

Pretty diff generates colorized HTML diffs similar to the diff/commit views on GitHub.
Simply use `git pd` the same way you use `git diff` and you'll get pretty diffs.
If you want to share the diff, you can use `git gd` and you'll get a new gist.

## Installation

Clone the repo and then create a Git alias. Open `~/.gitconfig` and add:

	[alias]
		pd = !/path/to/pretty-diff.js
		gd = !/path/to/gist-diff.js

## Usage

### pretty-diff

pretty-diff has no settings of its own.
Simply provide whatever settings you want to pass to `git diff`.

For example, to see what changed in the last commit:

	git pd HEAD^

### gist-diff

gist-diff has one setting: `--public`.
By default `git gist-diff` will generate a private gist.
If `--public` is provided, the gist will be public.
This setting can be specific anywhere (before or after the `git diff` settings.

gist-diff will attempt to create the gist using your GitHub account.
In order to create the gist with your account, you will be prompted for your password.
If you enter no password, then an anonymous gist will be generated.
However, if you enter an incorrect password, then no gist will be generated.