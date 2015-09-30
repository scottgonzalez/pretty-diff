# Pretty Diff

Pretty diff generates colorized HTML diffs similar to the diff/commit views on GitHub.
Simply use `pretty-diff` the same way you use `git diff` and you'll get pretty diffs.
If you want to share the diff, you can use `gist-diff` and you'll get a new gist.

Support this project by [donating on Gratipay](https://gratipay.com/scottgonzalez/).

![image](https://cloud.githubusercontent.com/assets/39191/10147714/8c358910-65e4-11e5-8e59-e1526ef674cd.png)


## Installation

Simply install globally via npm:

```sh
npm install -g pretty-diff
```

## Usage

### pretty-diff

pretty-diff has no settings of its own.
Simply provide whatever settings you want to pass to `git diff`.

For example, to see what changed in the last commit:

	pretty-diff HEAD^

### gist-diff

gist-diff has one setting: `--public`.
By default `gist-diff` will generate a private gist.
If `--public` is provided, the gist will be public.
This setting can be specified anywhere (before or after the `git diff` settings).

gist-diff will attempt to create the gist using your GitHub account.
In order to create the gist with your account, you will be prompted for your password.
If you enter no password, then an anonymous gist will be generated.
However, if you enter an incorrect password, then no gist will be generated.

#### Authentication

If you set your GitHub username in your git config, you will only be prompted for your password.

```sh
git config --global github.user "Your Username"
```

To avoid being prompted for your password, you can
[create a personal access token](https://github.com/settings/applications) and
store it in your git config. You don't need to set `github.user` if you're using
a token.

```sh
git config --global gist-diff.token "Your token"
```

## License

Copyright Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gratipay](https://gratipay.com/scottgonzalez/).
