import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const fsExists = promisify(fs.exists);

export async function detectPackageManager(projectPath: string): Promise<string> {
  const packageManagers = [
    { name: 'yarn', file: 'yarn.lock' },
    { name: 'pnpm', file: 'pnpm-lock.yaml' },
    { name: 'bun', file: 'bun.lockb' },
  ];

  let currentPath = projectPath;
  const root = path.parse(currentPath).root;

  while (currentPath !== root) {
    for (const pm of packageManagers) {
      if (await fsExists(path.join(currentPath, pm.file))) {
        return pm.name;
      }
    }
    currentPath = path.dirname(currentPath);
  }

  // Check the root directory as well
  for (const pm of packageManagers) {
    if (await fsExists(path.join(root, pm.file))) {
      return pm.name;
    }
  }

  return 'npm'; // Default to npm if no lock file is found
}

export async function installPackage(packageName: string, projectPath: string): Promise<void> {
  const isExpo = await isExpoProject(projectPath);
  if (isExpo) {
    await execAsync(`npx expo install ${packageName}`, { cwd: projectPath });
    return;
  }

  const packageManager = await detectPackageManager(projectPath);
  let command: string;

  switch (packageManager) {
    case 'yarn':
      command = `yarn add ${packageName}`;
      break;
    case 'pnpm':
      command = `pnpm add ${packageName}`;
      break;
    case 'bun':
      command = `bun add ${packageName}`;
      break;
    default:
      command = `npm install ${packageName}`;
  }

  await execAsync(command, { cwd: projectPath });
}
