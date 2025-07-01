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
import * as fs from 'fs/promises';
import { renameSync, readFileSync } from 'fs';

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

const RENAME_FILENAME = '.BULK_RENAME.txt';

interface IRenameSession {
  sessionRoot: string;
  fileList: string[];
  foldersList: string[];
}

const activeSessions = new Map<string, IRenameSession>();

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

export function activate(context: vscode.ExtensionContext) {
  const startCommand = vscode.commands.registerCommand('bulk-rename.start', async (folderUri?: vscode.Uri) => {
    if (!folderUri) {
      vscode.window.showInformationMessage('Please right-click a folder in the Explorer to use this command.');
      return;
    }
    await createOrUpdateSession(folderUri.fsPath);
  });
  const saveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (path.basename(document.uri.fsPath) !== RENAME_FILENAME) return;
    await processRenameFile(document.uri);
  });
  const deleteListener = vscode.workspace.onDidDeleteFiles((event) => {
    for (const fileUri of event.files) {
      if (activeSessions.has(fileUri.fsPath)) {
        activeSessions.delete(fileUri.fsPath);
        console.log(`[bulk-rename] Session closed for: ${fileUri.fsPath}`);
      }
    }
  });

  context.subscriptions.push(startCommand, saveListener, deleteListener);
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

async function createOrUpdateSession(folderPath: string) {
  try {
    const { fileList, foldersList } = await getAllFilesAndFolders(folderPath);
    foldersList.sort((a, b) => b.length - a.length);

    const session: IRenameSession = {
      sessionRoot: folderPath,
      fileList,
      foldersList,
    };

    const content = `// Bulk Rename for: ${path.basename(folderPath)}
// IMPORTANT: Do not change the number of lines or the order of sections.
// Edit the paths below and save the file to apply changes.

Files:
${fileList.join('\n')}

Folders:
${foldersList.join('\n')}
`;
    const renameFilePath = path.join(folderPath, RENAME_FILENAME);
    activeSessions.set(renameFilePath, session);

    await fs.writeFile(renameFilePath, content);
    const document = await vscode.workspace.openTextDocument(renameFilePath);
    await vscode.window.showTextDocument(document);

    console.log(`[bulk-rename] Session started for: ${folderPath}`);
  } catch (error) {
    vscode.window.showErrorMessage(`[bulk-rename] Error starting session: ${getErrorMessage(error)}`);
  }
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

async function processRenameFile(fileUri: vscode.Uri) {
  const session = activeSessions.get(fileUri.fsPath);
  if (!session) {
    console.warn(`[bulk-rename] No active session found for ${fileUri.fsPath}. A new session will be created.`);
    await createOrUpdateSession(path.dirname(fileUri.fsPath));
    return;
  }
  try {
    const updatedContent = readFileSync(fileUri.fsPath, 'utf-8');
    const sections = updatedContent.split('Folders:');
    if (sections.length < 2) {
      vscode.window.showErrorMessage(`[bulk-rename] Invalid format in ${RENAME_FILENAME}. 'Folders:' section not found.`);
      return;
    }
    const newFilesList = sections[0].split('Files:')[1]?.trim().split('\n') ?? [];
    const newFoldersList = sections[1].trim().split('\n');
    const cleanNewFiles = newFilesList.filter(line => line.trim() !== '');
    const cleanNewFolders = newFoldersList.filter(line => line.trim() !== '');
    await renamePaths(session.sessionRoot, session.foldersList, cleanNewFolders, 'folder');
    await renamePaths(session.sessionRoot, session.fileList, cleanNewFiles, 'file');
    vscode.window.showInformationMessage('[bulk-rename] Rename complete.');
    await createOrUpdateSession(session.sessionRoot);
  } catch (error) {
    vscode.window.showErrorMessage(`[bulk-rename] Error processing rename: ${getErrorMessage(error)}`);
  }
}

async function getAllFilesAndFolders(rootPath: string): Promise<{ fileList: string[]; foldersList: string[] }> {
  const fileList: string[] = [];
  const foldersList: string[] = [];
  const ignoreList = new Set(['.git', 'node_modules', '.vscode', 'out', RENAME_FILENAME]);
  async function recurse(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoreList.has(entry.name)) continue;
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath);
      if (entry.isDirectory()) {
        foldersList.push(relativePath);
        await recurse(fullPath);
      } else if (entry.isFile()) {
        fileList.push(relativePath);
      }
    }
  }
  await recurse(rootPath);
  return { fileList, foldersList };
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

async function renamePaths(sessionRoot: string, oldRelativePaths: string[], newRelativePaths: string[], type: 'file' | 'folder'): Promise<void> {
  if (oldRelativePaths.length !== newRelativePaths.length) {
    vscode.window.showWarningMessage(`[bulk-rename] The number of ${type}s was changed. Aborting rename to prevent data loss.`);
    return;
  }
  for (let i = 0; i < oldRelativePaths.length; i++) {
    const oldRelative = oldRelativePaths[i];
    const newRelative = newRelativePaths[i];

    if (oldRelative && newRelative && oldRelative !== newRelative) {
      const oldAbsolute = path.join(sessionRoot, oldRelative);
      const newAbsolute = path.join(sessionRoot, newRelative);
      
      try {
        console.log(`Renaming ${type}: ${oldAbsolute} -> ${newAbsolute}`);
        await fs.mkdir(path.dirname(newAbsolute), { recursive: true });
        renameSync(oldAbsolute, newAbsolute);
      } catch (e) {
        vscode.window.showErrorMessage(`Failed to rename ${oldRelative} to ${newRelative}. Error: ${getErrorMessage(e)}`);
        throw e;
      }
    }
  }
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}