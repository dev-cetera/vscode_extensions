//.title
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
//
// VS Code Extensions by dev-cetera.com & contributors. The use of this
// source code is governed by an MIT-style license described in the LICENSE
// file located in this project's root directory.
//
// See: https://opensource.org/license/mit
//
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
//.title~

import * as vscode from 'vscode';
import * as path from 'path';

const TERMINAL_NAME = 'Run Script';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('run-script.execute', async (uri?: vscode.Uri) => {
    // 1. Determine the file to run
    if (!uri) {
      // If the command was not triggered from the context menu, use the active editor's file
      if (vscode.window.activeTextEditor) {
        uri = vscode.window.activeTextEditor.document.uri;
      } else {
        vscode.window.showErrorMessage('Run Script: No file selected or open to run.');
        return;
      }
    }

    const filePath = uri.fsPath;
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // 2. Get the command from settings
    const config = vscode.workspace.getConfiguration('run-script');
    const commands = config.get<{ [key: string]: string }>('commands');

    if (!commands || typeof commands !== 'object') {
      vscode.window.showErrorMessage('Run Script: Configuration for "run-script.commands" is missing or invalid.');
      return;
    }

    const commandTemplate = commands[fileExtension];

    if (!commandTemplate) {
      vscode.window.showWarningMessage(`Run Script: No command found for "${fileExtension}" files. Please configure it in your settings.`);
      return;
    }

    // 3. Prepare placeholders for substitution
    const fileInfo = {
      // For paths with spaces, quoting is essential
      file: `"${filePath}"`,
      dir: `"${path.dirname(filePath)}"`,
      fileName: `"${path.basename(filePath)}"`,
      fileNoExt: `"${path.basename(filePath, fileExtension)}"`,
      workspaceRoot: `"${vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath || path.dirname(filePath)}"`,
    };

    // 4. Substitute placeholders to create the final command
    const finalCommand = commandTemplate.replace(
      /\${(file|dir|fileName|fileNoExt|workspaceRoot)}/g,
      (match, placeholder: keyof typeof fileInfo) => fileInfo[placeholder]
    );

    // 5. Get or create a terminal instance
    let terminal = vscode.window.terminals.find(t => t.name === TERMINAL_NAME);
    if (!terminal || terminal.exitStatus !== undefined) {
      // If terminal is closed, create a new one
      terminal = vscode.window.createTerminal(TERMINAL_NAME);
    }

    // 6. Show the terminal, change to the file's directory, and run the command
    terminal.show();
    // CRITICAL: Change directory to the file's location so relative paths in the script work
    terminal.sendText(`cd ${fileInfo.dir}`);
    terminal.sendText(finalCommand);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}