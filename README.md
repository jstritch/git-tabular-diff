[![Renovate Status](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![CI Status](https://github.com/jstritch/git-tabular-diff/workflows/CI/badge.svg)](https://github.com/jstritch/git-tabular-diff/actions)

# git-tabular-diff

It is difficult to review changes made to csv files using a traditional Git difference.
At other times, a git difference is more meaningful when displayed side-by-side.
The git-tabular-diff package provides both tabular and split views to ease these situations.
An example split view appears below.

![Split view](https://github.com/jstritch/git-tabular-diff/blob/master/example-split.gif?raw=true)

The following image compares a Git diff on the left to a tabular view of the same changes on the right.

![Tabular view](https://github.com/jstritch/git-tabular-diff/blob/master/example.gif?raw=true)

To use git-tabular-diff, select a file in the TreeView, Git panel, or the active text editor and
invoke either the git-tabular-diff:compare-selected-files
or git-tabular-diff:compare-selected-split command.
The commands are available from the context menus and
bound to the key sequences `alt-g alt-d` and `alt-g ctrl-d` by default.
A new Atom pane opens displaying the changes between the working tree and the head revision.
A pane is only opened if differences are found.
If multiple files are selected, the differences appear in a single pane.

Settings allow ignoring case and/or white space in the tabular view.

The split view invokes the Git diff machinery,
enabling textconv display of binary files when configured.
To learn about configuring textconv, visit
[gitattributes[5]](https://git-scm.com/docs/gitattributes).

Any git-tabular-diff view may be saved to a file with the saveAs `ctrl-shift-s` command.
To open the file later, select the .gtd file in the Atom TreeView and
invoke either git-tabular-diff command.
A gtd file may be shared with other git-tabular-diff users.
