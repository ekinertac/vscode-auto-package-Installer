import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);
const fsExists = promisify(fs.exists);

const foldersToSkip = ['node_modules', 'venv', '.venv', 'env', '.env'];

async function findNearestPackageJson(startPath: string): Promise<string | null> {
  let currentDir = startPath;
  while (currentDir !== path.parse(currentDir).root) {
    if (foldersToSkip.some((folder) => currentDir.includes(path.sep + folder + path.sep))) {
      currentDir = path.dirname(currentDir);
      continue;
    }

    const packageJsonPath = path.join(currentDir, 'package.json');
    if (await fsExists(packageJsonPath)) {
      return packageJsonPath;
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

export function activate(context: vscode.ExtensionContext) {
  const supportedLanguages = ['javascript', 'typescript'];

  supportedLanguages.forEach((language) => {
    const codeActionProvider = {
      provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext,
      ): vscode.CodeAction[] | undefined {
        const diagnostic = context.diagnostics.find(
          (d) => d.message.includes('Cannot find module') || d.message.includes('cannot be found'),
        );

        if (diagnostic) {
          const fix = new vscode.CodeAction('Install missing package', vscode.CodeActionKind.QuickFix);

          fix.command = {
            command: 'extension.installPackage',
            title: 'Install missing package',
            arguments: [document, diagnostic],
          };

          fix.diagnostics = [diagnostic];

          return [fix];
        }

        return undefined;
      },
    };

    const codeActionProviderDisposable = vscode.languages.registerCodeActionsProvider(
      { language, scheme: 'file' },
      codeActionProvider,
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
      },
    );
    context.subscriptions.push(codeActionProviderDisposable);
  });

  const installPackageDisposable = vscode.commands.registerCommand(
    'extension.installPackage',
    async (document: vscode.TextDocument, diagnostic: vscode.Diagnostic) => {
      const line = document.lineAt(diagnostic.range.start.line).text;
      const packageMatch =
        line.match(/require\(['"]([^'"]+)['"]\)/) || line.match(/import\s.+?\sfrom\s['"]([^'"]+)['"]/);

      if (packageMatch) {
        const packageName = packageMatch[1];
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

        if (!workspaceFolder) {
          vscode.window.showErrorMessage('Unable to determine workspace folder.');
          return;
        }

        const packageJsonPath = await findNearestPackageJson(path.dirname(document.uri.fsPath));

        if (!packageJsonPath) {
          vscode.window.showErrorMessage('Unable to find package.json in the project.');
          return;
        }

        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Installing package: ${packageName}`,
            cancellable: false,
          },
          async (progress) => {
            try {
              progress.report({ increment: 0 });
              await execAsync(`npm install ${packageName}`, { cwd: path.dirname(packageJsonPath) });
              progress.report({ increment: 100 });
              vscode.window.showInformationMessage(`Package installed successfully: ${packageName}`);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              vscode.window.showErrorMessage(`Failed to install package: ${packageName}. Error: ${errorMessage}`);
            }
          },
        );
      }
    },
  );

  context.subscriptions.push(installPackageDisposable);
}

export function deactivate() {}
