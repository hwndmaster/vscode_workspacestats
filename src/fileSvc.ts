import * as fs from 'fs';
import * as vscode from 'vscode';

export interface WorkspaceFolderInfo {
  workspace: string;
  workspacePath: string;
  files: FileInfo[];
}

export interface FileInfo {
  relativeFilePath: string;
  fileName: string;
  ext: string;
  size: number;
  ctime: Date;
  mtime: Date;
}

export class FileSystemProvider {
  static async getAllFiles(minFileSize: number): Promise<WorkspaceFolderInfo[]> {
    if (!vscode.workspace.workspaceFolders)
    {
      return Promise.resolve([]);
    }

    const result: WorkspaceFolderInfo[] = [];
    for (const wf of vscode.workspace.workspaceFolders)
    {
      var foundFiles = await vscode.workspace.findFiles(new vscode.RelativePattern(wf, "**/*.*"));

      const wfi :WorkspaceFolderInfo = {
        workspace: wf.name,
        workspacePath: wf.uri.fsPath,
        files: []
      };

      for (const file of foundFiles)
      {
        const stats = fs.statSync(file.fsPath);

        if (stats.size < minFileSize)
        {
          continue;
        }

        const fileInfo: FileInfo = {
          relativeFilePath: this.getRelativeFilePath(wf, file),
          fileName: this.getFileName(file),
          ext: this.getFileExt(file),
          size: stats.size,
          ctime: stats.ctime,
          mtime: stats.mtime
        };

        wfi.files.push(fileInfo);
      }

      if (wfi.files.length > 0) {
        result.push(wfi);
      }
    }

    return Promise.resolve(result);
  }

  private static getRelativeFilePath(workspaceFolder: vscode.WorkspaceFolder, file: vscode.Uri) {
    return file.fsPath.replace(workspaceFolder.uri.fsPath, "");
  }

  private static getFileName(file: vscode.Uri) {
    return file.fsPath.split(/[/\\]+/).slice(-1)[0];
  }

  private static getFileExt(file: vscode.Uri) {
    return file.fsPath.split('.').slice(-1)[0];
  }
}

export class Path {
  public static shrinkPath(str: string, maxLength: number)
  {
    var splitter = str.indexOf('/')>-1 ? '/' : "\\",
        tokens = str.split(splitter),
        maxLength = maxLength || 25,
        drive = str.indexOf(':')>-1 ? tokens[0] : "",
        fileName = tokens[tokens.length - 1],
        len = drive.length + fileName.length,
        remLen = maxLength - len - 5, // remove the current lenth and also space for 3 dots and 2 slashes
        path, lenA, lenB, pathA, pathB;

        // Remove first and last elements from the array
    tokens.splice(0, 1);
    tokens.splice(tokens.length - 1, 1);

    // Recreate our path
    path = tokens.join(splitter);

    // Handle the case of an odd length
    lenA = Math.ceil(remLen / 2);
    lenB = Math.floor(remLen / 2);

    // Rebuild the path from beginning and end
    pathA = path.substring(0, lenA);
    pathB = path.length > lenB ? path.substring(path.length - lenB) : "";
    let result = "";
    if (drive.length > 0) {
      result = drive + splitter;
    }
    result += pathA;
    if (pathA.length > 0 && pathB.length > 0) {
      result += "...";
    }
    result += pathB;
    if (pathA.length > 0 || pathB.length > 0) {
      result += splitter;
    }
    result += fileName;
    return result;
  }
}
