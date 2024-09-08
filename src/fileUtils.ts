import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const fsExists = promisify(fs.exists);

const foldersToSkip = ['node_modules', 'venv', '.venv', 'env', '.env'];

export async function findNearestPackageJson(startPath: string): Promise<string | null> {
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
