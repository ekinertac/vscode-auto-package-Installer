import * as vscode from 'vscode';
import * as path from 'path';
import { findNearestPackageJson } from './fileUtils';
import { installPackage, isExpoProject, detectPackageManager } from './packageManagers';
import { createCodeActionProvider } from './codeActionProvider';

export function activate(context: vscode.ExtensionContext) {
  const supportedLanguages = ['javascript', 'typescript'];

  supportedLanguages.forEach((language) => {
    const codeActionProviderDisposable = vscode.languages.registerCodeActionsProvider(
      { language, scheme: 'file' },
      {
        async provideCodeActions(document, range, context) {
          const packageJsonPath = await findNearestPackageJson(path.dirname(document.uri.fsPath));
          if (packageJsonPath) {
            const projectPath = path.dirname(packageJsonPath);
            return createCodeActionProvider(projectPath).provideCodeActions(document, range, context);
          }
          return undefined;
        },
      },
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

        const projectPath = path.dirname(packageJsonPath);

        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Installing package: ${packageName}`,
            cancellable: false,
          },
          async (progress) => {
            try {
              progress.report({ increment: 0 });
              await installPackage(packageName, projectPath);
              progress.report({ increment: 100 });
              const isExpo = await isExpoProject(projectPath);
              const installMethod = isExpo ? 'npx expo install' : await detectPackageManager(projectPath);
              vscode.window.showInformationMessage(
                `Package installed successfully: ${packageName} (using ${installMethod})`,
              );
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
