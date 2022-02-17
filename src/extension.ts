import * as vscode from 'vscode';
import * as fileSvc from './fileSvc';

export const EXTENSION_ID = "workspacestats";

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand(EXTENSION_ID + '.filesizes', async () => {
		const config = vscode.workspace.getConfiguration(EXTENSION_ID);
		const maxPathLenSetting = config.get<number>("filesizes.maxPathLen") ?? 90;
		const minFileSizeSetting = config.get<number>("filesizes.minFileSize") ?? 10000;

		const document = await vscode.workspace.openTextDocument();
		const editor = await vscode.window.showTextDocument(document, 1, false);
		const allFiles = await fileSvc.FileSystemProvider.getAllFiles(minFileSizeSetting);

		let content: string = "";
		for (const wf of allFiles)
		{
			content += `## Biggest files found in '${wf.workspace}':\r\n`;
			let maxPathLen = wf.files.map(x => x.relativeFilePath.length).reduce((p, c) => p > c ? p : c);
			maxPathLen = Math.min(maxPathLenSetting, maxPathLen);
			const maxSizeLen = wf.files.map(x => x.size).reduce((p, c) => p > c ? p : c).toLocaleString().length;
			const filesOrdered = wf.files.sort((a, b) => a.size > b.size ? -1 : (a.size < b.size ? 1 : 0));
			for (const file of filesOrdered) {
				const filepath = fileSvc.Path.shrinkPath(file.relativeFilePath, maxPathLenSetting).padEnd(maxPathLen);
				const filesize = file.size.toLocaleString().padStart(maxSizeLen);
				content += `${filepath}\t${filesize} bytes\r\n`;
			}
		}

		editor?.edit(editBuilder => {
			editBuilder.insert(new vscode.Position(0, 0), content);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
