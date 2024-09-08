import * as vscode from 'vscode';
import { detectPackageManager, isExpoProject } from './packageManagers';
import * as path from 'path';

export function createCodeActionProvider(projectPath: string) {
  return {
    async provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range,
      context: vscode.CodeActionContext,
    ): Promise<vscode.CodeAction[] | undefined> {
      const diagnostic = context.diagnostics.find(
        (d) => d.message.includes('Cannot find module') || d.message.includes('cannot be found'),
      );

      if (diagnostic) {
        const line = document.lineAt(diagnostic.range.start.line).text;
        const packageMatch =
          line.match(/require\(['"]([^'"]+)['"]\)/) || line.match(/import\s.+?\sfrom\s['"]([^'"]+)['"]/);

        if (packageMatch) {
          const packageName = packageMatch[1];
          const isExpo = await isExpoProject(projectPath);
          const packageManager = isExpo ? 'expo' : await detectPackageManager(projectPath);

          let installCommand: string;
          if (packageManager === 'expo') {
            installCommand = `npx expo install ${packageName}`;
          } else {
            installCommand = `${packageManager} ${packageManager === 'npm' ? 'install' : 'add'} ${packageName}`;
          }

          const actionTitle = `Install package: ${installCommand}`;

          const fix = new vscode.CodeAction(actionTitle, vscode.CodeActionKind.QuickFix);

          fix.command = {
            command: 'extension.installPackage',
            title: actionTitle,
            arguments: [document, diagnostic],
          };

          fix.diagnostics = [diagnostic];

          return [fix];
        }
      }

      return undefined;
    },
  };
}
