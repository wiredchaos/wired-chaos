/**
 * Shell utilities for executing commands
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ShellResult {
    stdout: string;
    stderr: string;
}

export interface ShellOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}

export async function execShell(
    command: string,
    options?: ShellOptions
): Promise<ShellResult> {
    try {
        const { stdout, stderr } = await execAsync(command, {
            cwd: options?.cwd,
            env: { ...process.env, ...options?.env }
        });
        
        return { stdout, stderr };
    } catch (error: any) {
        throw new Error(`Command failed: ${command}\n${error.message}`);
    }
}
