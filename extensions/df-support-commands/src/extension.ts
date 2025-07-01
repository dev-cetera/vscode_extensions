import * as vscode from 'vscode';
import * as path from 'path';

// A dedicated name for the terminal to reuse it
const TERMINAL_NAME = 'Dart Code Generator';

export function activate(context: vscode.ExtensionContext) {
  
  const generateDartIndexesCommand = vscode.commands.registerCommand('df-support-commands.df_generate_dart_indexes', (uri?: vscode.Uri) => {
    const command = 'dart pub global activate df_generate_dart_indexes && df_generate_dart_indexes';
    runCommandInFolder(uri, command, 'df_generate_dart_indexes');
  });

  const generateDartModelsCommand = vscode.commands.registerCommand('df-support-commands.df_generate_dart_models', (uri?: vscode.Uri) => {
    const command = 'dart pub global activate df_generate_dart_models && df_generate_dart_models';
    runCommandInFolder(uri, command, 'df_generate_dart_models');
  });

  const generateDartModelsMinimalCommand = vscode.commands.registerCommand('df-support-commands.df_generate_dart_models_minimal', (uri?: vscode.Uri) => {
    const command = 'dart pub global activate df_generate_dart_models && df_generate_dart_models --template=minimal';
    runCommandInFolder(uri, command, 'df_generate_dart_models --template=minimal');
  });

  const generateHeaderCommentsCommand = vscode.commands.registerCommand('df-support-commands.df_generate_header_comments', (uri?: vscode.Uri) => {
    const command = 'dart pub global activate df_generate_header_comments && df_generate_header_comments';
    runCommandInFolder(uri, command, 'df_generate_header_comments');
  });

  const generateScreenBindingsCommand = vscode.commands.registerCommand('df-support-commands.df_generate_screen_bindings', (uri?: vscode.Uri) => {
    const command = 'dart pub global activate df_generate_screen && df_generate_screen bindings';
    runCommandInFolder(uri, command, 'df_generate_screen_bindings');
  });

  const generateScreenAccessCommand = vscode.commands.registerCommand('df-support-commands.df_generate_screen_access', (uri?: vscode.Uri) => {
    const command = 'dart pub global activate df_generate_screen && df_generate_screen access';
    runCommandInFolder(uri, command, 'df_generate_screen_access');
  });

  const generateScreenCommand = vscode.commands.registerCommand('df-support-commands.df_generate_screen', async (uri?: vscode.Uri) => {
    const screenName = await vscode.window.showInputBox({
      prompt: 'Enter screen name (e.g., LoginScreen):',
      placeHolder: 'RandomScreen',
      validateInput: (text: string) => {
        if (!text || text.trim().length === 0) {
          return 'Screen name cannot be empty!';
        }
        if (/\s/.test(text)) {
          return 'Screen name cannot contain spaces!';
        }
        return null;
      },
    });
    if (!screenName) {
      console.log('User cancelled the screen name input.');
      return;
    }
    const command = `dart pub global activate df_generate_screen && df_generate_screen -n ${screenName}`;
    runCommandInFolder(uri, command, 'df_generate_screen');
  });


  // Add both commands to the extension's subscriptions
  context.subscriptions.push(
    generateDartIndexesCommand,
    generateDartModelsCommand,
    generateDartModelsMinimalCommand,
    generateHeaderCommentsCommand,
    generateScreenBindingsCommand,
    generateScreenAccessCommand,
    generateScreenCommand,
  );
}

/**
 * A helper function to run a command in the context of a selected folder.
 * @param uri The URI of the folder right-clicked by the user.
 * @param commandToRun The exact shell command to execute.
 * @param taskName A user-friendly name for the task for display messages.
 */
async function runCommandInFolder(uri: vscode.Uri | undefined, commandToRun: string, taskName: string) {
  if (!uri) {
    vscode.window.showErrorMessage(`[${taskName}] This command must be run by right-clicking a folder.`);
    return;
  }

  const folderPath = uri.fsPath;
  console.log(`[${taskName}] Target folder: ${folderPath}`);
  
  try {
    // Find or create a terminal instance for our task
    let terminal = vscode.window.terminals.find(t => t.name === TERMINAL_NAME);
    if (!terminal || terminal.exitStatus !== undefined) {
      terminal = vscode.window.createTerminal(TERMINAL_NAME);
    }
    
    terminal.show();
    
    // Change directory to the target folder, quoting the path to handle spaces
    terminal.sendText(`cd "${folderPath}"`);

    // Run the actual command
    terminal.sendText(commandToRun);

    vscode.window.showInformationMessage(`Running '${taskName}' in "${path.basename(folderPath)}"... See terminal for output.`);

  } catch (error) {
    vscode.window.showErrorMessage(`Failed to run '${taskName}'. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function deactivate() {}