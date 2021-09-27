[![CI Status](https://github.com/jstritch/git-tabular-diff/workflows/CI/badge.svg)](https://github.com/jstritch/git-tabular-diff/actions)
[![Dependency Status](https://david-dm.org/jstritch/git-tabular-diff.svg)](https://david-dm.org/jstritch/git-tabular-diff)
[![DevDependency Status](https://david-dm.org/jstritch/git-tabular-diff/dev-status.svg)](https://david-dm.org/jstritch/git-tabular-diff#info=devDependencies)

# git-tabular-diff

It is difficult to easily review changes made to csv files with a traditional Git difference.
The git-tabular-diff package helps Atom users review changes made to csv files.
The screenshot below shows a Git diff on the left and the git-tabular-diff of the same change on the right.

![comparison screenshot](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)

To use git-tabular-diff, select a csv file in the TreeView, Git panel,
or the active text editor and invoke the git-tabular-diff:compare-selected-files command.
The command is available from the context menus and bound to the key sequence `alt-g alt-d` by default.
A new Atom pane opens displaying the changes between the working tree and the head revision.
A pane is not opened if no differences were found.
If multiple files are selected, the differences appear in a single pane.

Settings allow ignoring case and/or white space.

Any git-tabular-diff view may be saved to a file with the saveAs `ctrl-shift-s` command.
To open the file later, select the .gtd file in the Atom TreeView and
invoke the git-tabular-diff:compare-selected-files command.
A gtd file may be shared with other git-tabular-diff users.
