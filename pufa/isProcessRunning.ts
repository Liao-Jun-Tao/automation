import os from "os";
import {exec} from "child_process";

/**
 * 检查指定进程是否正在运行
 *
 * 该函数检查指定的进程是否在系统上运行，支持 Windows、Linux、macOS。
 *
 * @param {string} processName - 进程的名称（例如 `notepad.exe` 或 `SPDBENTClient.exe`）
 * @returns {Promise<boolean>} - 如果进程在运行，则返回 `true`，否则返回 `false`
 */
export const isProcessRunning = async (processName: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const platform = os.platform();

        let command = '';

        if (platform === 'win32') {
            // Windows 使用 tasklist 命令
            command = `tasklist`;
        } else if (platform === 'linux' || platform === 'darwin') {
            // Linux 和 macOS 使用 ps -A 命令
            command = `ps -A`;
        } else {
            return reject(new Error(`Unsupported platform: ${platform}`));
        }

        exec(command, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                console.error(`执行命令时出错: ${error}`);
                return reject(error);
            }

            // 将输出转换为小写，便于不区分大小写的比较
            const processList = stdout.toLowerCase();

            // 检查进程名称是否存在于进程列表中
            const isRunning = processList.includes(processName.toLowerCase());

            resolve(isRunning);
        });
    });
};
