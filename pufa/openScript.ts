// 打开浦发银行网银自动化脚本

import {imageResource, Key, screen, sleep} from "@nut-tree/nut-js";
import {
    APP_NAME,
    BROWSER_NAME,
    BROWSER_URL,
    LOGIN_PAGE_IMAGE,
    MAX_RETRIES,
    PROCESS_NAME,
    RETRY_DELAY,
    RETRY_INTERVAL,
    WAIT_TIME
} from "./config";
import {retry} from "./retry";
import {isProcessRunning} from "./isProcessRunning";
import {pressAndRelease, typeText} from "./keyboardController";
import {logger} from "../utils/logger";


/**
 * 等待登录页面出现
 */
const waitForLoginPage = async (): Promise<void> => {
    await screen.waitFor(imageResource(LOGIN_PAGE_IMAGE), WAIT_TIME, RETRY_INTERVAL);
};

/**
 * 打开浦发银行网银应用
 */
export const openApp = async (): Promise<void> => {
    try {
        logger.info("开始打开浦发银行网银");

        // 检查应用是否已运行
        const running: boolean = await isProcessRunning(PROCESS_NAME);
        if (running) {
            logger.info(`${APP_NAME} 已经在运行中，无需重新启动。`);
            return;
        }

        // 打开Windows开始菜单
        await pressAndRelease(Key.LeftSuper); // 打开Win搜索框
        await sleep(500)
        await typeText(APP_NAME);
        await sleep(500)
        await pressAndRelease(Key.Enter);
        logger.info(`已发送启动 ${APP_NAME} 的命令。`);

        // 使用重试机制等待登录页面出现
        await retry(waitForLoginPage, {retries: MAX_RETRIES, delay: RETRY_DELAY});
        logger.info("登录页面已成功加载。");

    } catch (e) {
        logger.error('打开程序失败，错误信息：', e);
        // 可以根据需要添加更多的错误处理逻辑，例如截图、发送通知等
    }
};

/**
 * 打开默认浏览器并导航到指定URL
 */
export const openBrowser = async (): Promise<void> => {
    try {
        logger.info(`开始打开默认浏览器并导航到 ${BROWSER_URL}`);

        // 打开运行对话框（Win + R）
        await pressAndRelease(Key.LeftSuper, Key.Space);

        await sleep(500);

        // 输入URL
        await typeText(BROWSER_NAME);

        await sleep(500);

        await pressAndRelease(Key.Enter);

        await sleep(500);

        await pressAndRelease(Key.LeftSuper, Key.L);

        await sleep(500);

        await typeText(BROWSER_URL);

        await pressAndRelease(Key.Enter)

        logger.info(`已打开浏览器并导航到 ${BROWSER_URL}`);

        // 如果需要等待浏览器登录页面出现，可以在此处添加相应的等待逻辑
        // 例如：
        // await retry(waitForBrowserLoginPage, { retries: MAX_RETRIES, delay: RETRY_DELAY });
        // logger.info("浏览器登录页面已成功加载。");

    } catch (e) {
        logger.error('打开浏览器失败，错误信息：', e);
        // 可以根据需要添加更多的错误处理逻辑，例如截图、发送通知等
    }
};


// openApp()
