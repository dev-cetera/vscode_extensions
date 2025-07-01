# Bulk Rename

An extension that allows you to quickly bulk-rename files and folders.

## Installation

1. Open VS Code.
2. Go to the Extensions view by clicking on the square icon on the sidebar or pressing `Ctrl+Shift+X` on Windows or `Cmd+Shift+X` on MacOS.
3. Search for Bulk Rename".
4. Install and reload VS Code.
5. This extension is activated by default. Disable the extension to deactivate it.

## Disclaimer

Bulk-renaming files can break your project if you're not careful. Be sure to try this extension with a dummy project before you use it with an important project. Always save your project before bulk-renaming files or folders in case you break something or the extension behaves in an unexpected way.

## Instructions

1. Open a a workspace in Visual Studio Code.
2. Save your project.
3. Right-click in the Explorer view.
4. Select `🔸 Create BULK_RENAME.txt` from the context menu.
5. A file named `.BULK_RENAME.txt` will be created in the root of the workspace.
6. Open `.BULK_RENAME.txt`, and rename the files or folders as needed (Tip: Press `Ctrl+F` (Windows/Linux) or `Cmd+F` (MacOS) to search for the files or folders if there are too many).
7. Save the file (Tip: Enable auto-save in Visual Studio Code).
8. The files and folders will be renamed accordingly and `.BULK_RENAME.txt` will update.
9. Files or folders staring with a dot "." will be ignored.

## License

This extension is licensed under the [MIT License](LICENSE).
