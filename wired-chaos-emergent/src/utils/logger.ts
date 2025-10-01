/**
 * Logger utility
 */

import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;

    static initialize(channel: vscode.OutputChannel): void {
        this.outputChannel = channel;
    }

    static info(message: string): void {
        this.log(`ℹ️  ${message}`);
    }

    static success(message: string): void {
        this.log(`✅ ${message}`);
    }

    static warning(message: string): void {
        this.log(`⚠️  ${message}`);
    }

    static error(message: string): void {
        this.log(`❌ ${message}`);
    }

    static step(message: string): void {
        this.log(`🔹 ${message}`);
    }

    private static log(message: string): void {
        if (this.outputChannel) {
            this.outputChannel.appendLine(message);
        }
        console.log(message);
    }
}
