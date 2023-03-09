import { processFmPlaceholders } from './../helpers/processFmPlaceholders';
import { processPathPlaceholders } from './../helpers/processPathPlaceholders';
import { Telemetry } from './../helpers/Telemetry';
import {
  SETTING_PREVIEW_HOST,
  SETTING_PREVIEW_PATHNAME,
  CONTEXT,
  TelemetryEvent,
  PreviewCommands,
  SETTING_EXPERIMENTAL,
  SETTING_DATE_FORMAT
} from './../constants';
import { ArticleHelper } from './../helpers/ArticleHelper';
import { join } from 'path';
import { commands, env, Uri, ViewColumn, window } from 'vscode';
import { Extension, parseWinPath, processKnownPlaceholders, Settings } from '../helpers';
import { ContentFolder, ContentType, PreviewSettings } from '../models';
import { format } from 'date-fns';
import { DateHelper } from '../helpers/DateHelper';
import { Article } from '.';
import { urlJoin } from 'url-join-ts';
import { WebviewHelper } from '@estruyf/vscode';
import { Folders } from './Folders';

export class Chatbot {
  /**
   * Open the Chatbot in the editor
   */
  public static async open(extensionPath: string) {
    // Create the preview webview
    const webView = window.createWebviewPanel(
      'frontMatterChatbot',
      'Front Matter - Ask me anything',
      {
        viewColumn: ViewColumn.Beside,
        preserveFocus: true
      },
      {
        enableScripts: true
      }
    );

    webView.iconPath = {
      dark: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-dark.svg')),
      light: Uri.file(join(extensionPath, 'assets/icons/frontmatter-short-light.svg'))
    };

    const cspSource = webView.webview.cspSource;

    webView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case PreviewCommands.toVSCode.open:
          if (message.data) {
            commands.executeCommand('vscode.open', message.data);
          }
          return;
      }
    });

    const dashboardFile = 'dashboardWebView.js';
    const localPort = `9000`;
    const localServerUrl = `localhost:${localPort}`;

    const nonce = WebviewHelper.getNonce();

    const ext = Extension.getInstance();
    const isProd = ext.isProductionMode;
    const version = ext.getVersion();
    const isBeta = ext.isBetaVersion();
    const extensionUri = ext.extensionPath;

    const csp = [
      `default-src 'none';`,
      `img-src ${cspSource} http: https:;`,
      `script-src ${
        isProd ? `'nonce-${nonce}'` : `http://${localServerUrl} http://0.0.0.0:${localPort}`
      } 'unsafe-eval'`,
      `style-src ${cspSource} 'self' 'unsafe-inline' http: https:`,
      `connect-src https://* ${
        isProd
          ? ``
          : `ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`
      }`
    ];

    let scriptUri = '';
    if (isProd) {
      scriptUri = webView.webview
        .asWebviewUri(Uri.joinPath(extensionUri, 'dist', dashboardFile))
        .toString();
    } else {
      scriptUri = `http://${localServerUrl}/${dashboardFile}`;
    }

    // Get experimental setting
    const experimental = Settings.get(SETTING_EXPERIMENTAL);

    webView.webview.html = `
      <!DOCTYPE html>
      <html lang="en" style="width:100%;height:100%;margin:0;padding:0;">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="${csp.join('; ')}">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">

          <title>Front Matter Docs Chatbot</title>
        </head>
        <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden">
          <div id="app" data-type="chatbot" data-isProd="${isProd}" data-environment="${
      isBeta ? 'BETA' : 'main'
    }" data-version="${version.usedVersion}" ${
      experimental ? `data-experimental="${experimental}"` : ''
    } style="width:100%;height:100%;margin:0;padding:0;"></div>

          <script ${isProd ? `nonce="${nonce}"` : ''} src="${scriptUri}"></script>
        </body>
      </html>
    `;

    Telemetry.send(TelemetryEvent.openChatbot);
  }
}
