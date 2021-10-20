[![Renovate Status](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![CI Status](https://github.com/jstritch/git-tabular-diff/workflows/CI/badge.svg)](https://github.com/jstritch/git-tabular-diff/actions)

# git-tabular-diff

It is difficult to review changes made to csv files by viewing a traditional Git difference.
The git-tabular-diff package helps Atom users review changes made to csv files.
The screenshot below shows a Git diff on the left and the git-tabular-diff view of the same changes on the right.

![Diff comparison](https://github.com/jstritch/git-tabular-diff/blob/master/example.gif?raw=true)

To use git-tabular-diff, select a csv file in the TreeView, Git panel,
or the active text editor and invoke the git-tabular-diff:compare-selected-files command.
The command is available from the context menus and bound to the key sequence `alt-g alt-d` by default.
A new Atom pane opens displaying the changes between the working tree and the head revision.
A pane is only opened if differences were found.
If multiple files are selected, the differences appear in a single pane.

Settings allow ignoring case and/or white space.

Any git-tabular-diff view may be saved to a file with the saveAs `ctrl-shift-s` command.
To open the file later, select the .gtd file in the Atom TreeView and
invoke the git-tabular-diff:compare-selected-files command.
A gtd file may be shared with other git-tabular-diff users.
