import * as vscode from 'vscode';

export function createCodeActionProvider() {
  return {
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
}
