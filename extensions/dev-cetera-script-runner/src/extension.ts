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

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

const TERMINAL_NAME = 'Script Runner Terminal';

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('script-runner.execute', async (uri?: vscode.Uri) => {
    if (!uri) {
      if (vscode.window.activeTextEditor) {
        uri = vscode.window.activeTextEditor.document.uri;
      } else {
        vscode.window.showErrorMessage('Script Runner: No file selected or open to run.');
        return;
      }
    }
    const filePath = uri.fsPath;
    const fileExtension = path.extname(filePath).toLowerCase();
    const config = vscode.workspace.getConfiguration('script-runner');
    const commands = config.get<{ [key: string]: string }>('commands');
    if (!commands || typeof commands !== 'object') {
      vscode.window.showErrorMessage('Script Runner: Configuration for "script-runner.commands" is missing or invalid.');
      return;
    }
    const commandTemplate = commands[fileExtension];
    if (!commandTemplate) {
      vscode.window.showWarningMessage(`Script Runner: No command found for "${fileExtension}" files. Please configure it in your settings.`);
      return;
    }
    const fileInfo = {
      file: filePath,
      dir: path.dirname(filePath),
      fileName: path.basename(filePath),
      fileNoExt: path.basename(filePath, fileExtension),
      workspaceRoot: vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath || path.dirname(filePath),
    };
    const finalCommand = commandTemplate.replace(
      /\${(file|dir|fileName|fileNoExt|workspaceRoot)}/g,
      (match, placeholder: keyof typeof fileInfo) => fileInfo[placeholder]
    );
    let terminal = vscode.window.terminals.find(t => t.name === TERMINAL_NAME);
    if (!terminal || terminal.exitStatus !== undefined) {
      terminal = vscode.window.createTerminal(TERMINAL_NAME);
    }
    terminal.show();
    terminal.sendText(`cd ${fileInfo.dir}`);
    terminal.sendText(finalCommand);
  });

  context.subscriptions.push(disposable);
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

export function deactivate() {}