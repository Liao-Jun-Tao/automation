// tools.ts
import {Button, imageResource, Key, keyboard, mouse, Point, Region, RGBA, screen, straightTo,} from "@nut-tree/nut-js";
import "@nut-tree/nl-matcher"; // 引入图像匹配插件
import {
    useBolt,
    useBoltInputMonitor,
    useBoltKeyboard,
    useBoltMouse,
    useBoltScreen,
    useBoltWindowFinder,
    useBoltWindows
} from "@nut-tree/bolt";

import notifier from "node-notifier";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import {exec} from 'child_process';
import os from 'os';

// 定义 MatchOptions 类型
interface MatchOptions {
    searchMultipleScales?: boolean;
    useGrayScale?: boolean;
    scaleSteps?: number[];
    applyAlphaMask?: boolean;
    validMatches?: boolean;
}

// 默认配置
const defaultOptions: MatchOptions = {
    searchMultipleScales: true,
    useGrayScale: false,
    scaleSteps: [0.9, 0.8, 0.7, 0.6, 0.5],
    applyAlphaMask: false,
    validMatches: false,
};

/**
 * 初始化
 * @nut-tree /bolt 配置函数
 * @param {boolean} [enableKeyboard] 是否启用键盘提供者
 * @param enableMouse
 * @param enableScreen
 * @param {boolean} [enableWindows] 是否启用窗口提供者
 * @param {boolean} [enableWindowFinder] 是否启用窗口查找功能
 * @param enableInputMonitor
 */
function initializeNutBolt(
    {
        enableKeyboard = true,
        enableMouse = true,
        enableScreen = true,
        enableWindows = true,
        enableWindowFinder = true,
        enableInputMonitor = true,
    }:
    {
        enableKeyboard?: boolean;
        enableMouse?: boolean;
        enableScreen?: boolean;
        enableWindows?: boolean;
        enableWindowFinder?: boolean;
        enableInputMonitor?: boolean;
    }) {
    // 启动 @nut-tree/bolt 提供者
    if (enableKeyboard) useBoltKeyboard();
    if (enableMouse) useBoltMouse();
    if (enableScreen) useBoltScreen();
    if (enableWindows) useBoltWindows();
    if (enableWindowFinder) useBoltWindowFinder();
    if (enableInputMonitor) useBoltInputMonitor();

    // 启动所有 @nut-tree/bolt 提供者
    if (enableKeyboard || enableMouse || enableScreen || enableWindows || enableWindowFinder || enableInputMonitor) {
        useBolt();
    }

    console.log('NutBolt initialized with the following providers:');
    console.log('keyboard:', enableKeyboard);
    console.log('mouse:', enableMouse);
    console.log('screen:', enableScreen);
    console.log('Windows:', enableWindows);
    console.log('WindowFinder:', enableWindowFinder);
    console.log('InputMonitor:', enableInputMonitor);
}

/**
 * 封装图像搜索方法
 * @param {string} imagePath - 图像资源的路径
 * @param {MatchOptions} options - 配置选项（可选）
 * @returns {Promise<any[]>} - 返回匹配结果数组
 */
async function findImageMatches(imagePath: string, options: MatchOptions = {}): Promise<any[]> {
    const providerData = {...defaultOptions, ...options};

    try {
        return await screen.findAll(imageResource(imagePath), {providerData});
    } catch (error) {
        console.error("Error finding image matches:", error);
        return []; // 遇到错误时返回空数组
    }
}

const mouseController = {
    /**
     * 设置鼠标的配置
     * @param {Object} config - 鼠标配置对象
     * @param {number} [config.speed] - 鼠标移动速度（像素/秒）
     * @param {number} [config.autoDelayMs] - 鼠标操作的自动延迟时间，单位为毫秒
     */
    setMouseConfig: (config: { speed?: number; autoDelayMs?: number }) => {
        if (config.speed !== undefined) {
            if (config.speed <= 0) {
                console.warn("鼠标速度应为正数。将其设置为默认值 1000 像素/秒。");
                config.speed = 1000; // 设置默认速度
            }
            mouse.config.mouseSpeed = config.speed; // 设置鼠标移动速度（像素/秒）
        }

        if (config.autoDelayMs !== undefined) {
            if (config.autoDelayMs < 0) {
                console.warn("鼠标自动延迟应为非负数。将其设置为默认值 100 毫秒。");
                config.autoDelayMs = 100; // 设置默认延迟
            }
            mouse.config.autoDelayMs = config.autoDelayMs; // 设置鼠标自动延迟
        }

        console.log("鼠标配置已更新:", config);
    },

    /**
     * 设置鼠标位置到指定区域的中心
     *
     * @param {Region} region - 目标区域对象
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    async setPosition(region: Region): Promise<void> {
        // 将 Region 的中心点计算为 Point
        const centerX = region.left + region.width / 2;
        const centerY = region.top + region.height / 2;
        const point = new Point(centerX, centerY);

        console.log(`[设置鼠标位置] 移动鼠标到位置: (${centerX}, ${centerY})`);
        await mouse.setPosition(point); // 设置鼠标到目标位置
    },


    /**
     * 获取鼠标当前位置
     * @returns {Promise<Object>} - 返回包含当前鼠标位置的 Promise 对象
     * @property {number} x - 鼠标当前位置的 X 坐标
     * @property {number} y - 鼠标当前位置的 Y 坐标
     */
    getPosition: async (): Promise<{ x: number, y: number }> => {
        return await mouse.getPosition();
    },

    /**
     * 向下滚动鼠标滚轮
     * @param {number} ticks - 滚动的步数
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    scrollDown: async (ticks: number): Promise<void> => {
        await mouse.scrollDown(ticks);
    },

    /**
     * 向上滚动鼠标滚轮
     * @param {number} ticks - 滚动的步数
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    scrollUp: async (ticks: number): Promise<void> => {
        await mouse.scrollUp(ticks);
    },

    /**
     * 向左滚动鼠标滚轮
     * @param {number} ticks - 滚动的步数
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    scrollLeft: async (ticks: number): Promise<void> => {
        await mouse.scrollLeft(ticks);
    },

    /**
     * 向右滚动鼠标滚轮
     * @param {number} ticks - 滚动的步数
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    scrollRight: async (ticks: number): Promise<void> => {
        await mouse.scrollRight(ticks);
    },

    /**
     * 直线移动鼠标到指定目标点
     * @param {Object} targetPoint - 目标点对象
     * @param {number} targetPoint.x - 目标点的 X 坐标
     * @param {number} targetPoint.y - 目标点的 Y 坐标
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    straightTo: async (targetPoint: { x: number, y: number }): Promise<void> => {
        await mouse.move(straightTo(targetPoint));
    },

    /**
     * 点击鼠标按钮
     * @param { Button} [button=Button.LEFT] - 要点击的鼠标按钮，默认左键
     * @returns {Promise<void>} - 完成点击操作的 Promise
     */
    click: async (button: Button = Button.LEFT): Promise<void> => {
        await mouse.click(button);
    },

    /**
     * 双击鼠标按钮
     * @param { Button} [button=Button.LEFT] - 要双击的鼠标按钮，默认左键
     * @returns {Promise<void>} - 完成双击操作的 Promise
     */
    doubleClick: async (button: Button = Button.LEFT): Promise<void> => {
        await mouse.doubleClick(button);
    },

    /**
     * 按住鼠标按钮
     * @param { Button} [button=Button.LEFT] - 要按住的鼠标按钮，默认左键
     * @returns {Promise<void>} - 完成按住操作的 Promise
     */
    pressButton: async (button: Button = Button.LEFT): Promise<void> => {
        await mouse.pressButton(button);
    },

    /**
     * 释放鼠标按钮
     * @param { Button} [button=Button.LEFT] - 要释放的鼠标按钮，默认左键
     * @returns {Promise<void>} - 完成释放操作的 Promise
     */
    releaseButton: async (button: Button = Button.LEFT): Promise<void> => {
        await mouse.releaseButton(button);
    },

    /**
     * 拖动鼠标沿指定路径移动
     * @param {Point[]} path - 拖动路径的点数组
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    drag: async (path: Point[]): Promise<void> => {
        await mouse.drag(path);
    }
};

// 封装键盘控制方法
const keyboardController = {
    /**
     * 按下并释放多个按键
     * @param {...Key[]} keys - 要按下并释放的按键
     */
    pressAndRelease: async (...keys: Key[]): Promise<void> => {
        await keyboard.pressKey(...keys);
        await keyboard.releaseKey(...keys);
    },

    /**
     * 按住多个按键
     * @param {...Key[]} keys - 要按住的按键
     */
    pressKeys: async (...keys: Key[]): Promise<void> => {
        await keyboard.pressKey(...keys);
    },

    /**
     * 释放多个按键
     * @param {...Key[]} keys - 要释放的按键
     */
    releaseKeys: async (...keys: Key[]): Promise<void> => {
        await keyboard.releaseKey(...keys);
    },

    /**
     * 设置键盘的配置
     * 该方法可以配置一些键盘行为的设置，例如按键的自动延迟等。
     *
     * @param {object} config 配置对象
     * @param {number} [config.autoDelayMs] 自动延迟时间，单位毫秒，默认值为 100ms。
     */
    setKeyboardConfig: (config: { autoDelayMs?: number }) => {
        if (config.autoDelayMs !== undefined) {
            if (config.autoDelayMs < 0) {
                console.warn("键盘自动延迟应为非负数。将其设置为默认值 100 毫秒。");
                config.autoDelayMs = 100; // 设置默认延迟
            }
            keyboard.config.autoDelayMs = config.autoDelayMs;
            console.log(`键盘自动延迟已设置为 ${config.autoDelayMs} 毫秒`);
        }
    },

    /**
     * 输入文本
     * @param {string} text - 要输入的文本内容
     * @returns {Promise<void>} - 返回一个 Promise 表示操作完成
     */
    typeText: async (text: string): Promise<void> => {
        await keyboard.type(text);
    }
};

// 屏幕操作控制器
const screenController = {
    /**
     * 查找屏幕上的图像并返回所有匹配的区域
     *
     * @param {string} imagePath - 图像文件的路径。用于查找图像的位置。
     * @param {object} [options] - 可选参数对象，用于配置查找行为。
     * @param {number} [options.confidence] - 匹配的置信度（0到1之间）。默认为 0.8。
     *
     * @returns {Promise<Region[]>} 返回一个 `Region` 对象数组，表示所有匹配到的图像区域。
     *
     * @throws {Error} 如果图像在屏幕上找不到或者发生其他错误，抛出错误。
     */
    async findAllImages(
        imagePath: string,
        options: { confidence?: number } = {confidence: 0.8}
    ): Promise<Region[]> {
        try {
            const matches = await screen.findAll(imageResource(imagePath), options);
            console.log(`找到图像 ${imagePath} 的所有匹配区域：`, matches);
            return matches;
        } catch (error) {
            console.error(`未能找到图像 ${imagePath} 的任何匹配，错误信息：`, error);
            throw new Error(`未找到图像 ${imagePath} 或发生错误`);
        }
    },


    /**
     * 等待图像出现在屏幕上并将鼠标移动到图像的匹配位置
     *
     * @param {string} imagePath - 图像文件的路径，用于查找图像。
     * @param {number} timeout - 超时时间，单位为毫秒。如果在该时间内未找到图像，将抛出错误。
     * @param {number} interval - 查找图像的间隔时间，单位为毫秒。每次检查图像是否出现的间隔。
     *
     * @throws {Error} 如果图像在指定的时间内未找到，或者发生了其他错误，会抛出错误。
     *
     * @example
     * // 等待图像 "cookies.png" 出现并将鼠标移动到该位置
     * await waitForImage("cookies.png", 7000, 1000);
     */
    waitForImage: async (imagePath: string, timeout: number, interval: number) => {
        try {
            // 使用 `screen.waitFor` 等待图像出现在屏幕上，返回一个 `Region` 对象
            // `imageResource(imagePath)` 用于加载图像资源，timeout 和 interval 分别是超时时间和查找间隔
            const match: Region = await screen.waitFor(imageResource(imagePath), timeout, interval);

            // `match` 是一个 Region 对象，包含了图像的位置和大小
            // 使用 `match.left` 和 `match.top` 获取图像的左上角坐标（即鼠标应移动到的位置）
            const targetPoint = new Point(match.left + match.width / 2, match.top + match.height / 2);
            await mouse.move(straightTo(targetPoint));

            // 可选：如果需要在找到图像后进行点击，可以加上下面的代码
            // await mouse.click(Button.LEFT);
        } catch (error) {
            // 如果发生错误（比如图像超时未找到），打印错误信息并抛出
            console.error('Error waiting for image:', error);
            throw error;
        }
    },

    /**
     * 判断屏幕上是否存在指定的图像
     *
     * @param {string} imagePath - 图像文件的路径。用于查找图像的位置。
     * @param {object} [options] - 可选参数对象，用于配置查找行为。
     * @param {number} [options.confidence] - 匹配的置信度（0到1之间）。默认为 0.8。
     * @returns {Promise<boolean>} 返回布尔值，表示是否找到图像。
     */
    isImageExist: async (imagePath: string, options?: { confidence?: number }): Promise<boolean> => {
        try {
            await screen.find(imageResource(imagePath), options);
            return true; // 找到图像返回 true
        } catch {
            return false; // 找不到图像返回 false
        }
    },

    /**
     * 设置屏幕的配置
     *
     * 该方法用于更新屏幕操作的配置，包括图像匹配的置信度、是否启用高亮显示、图像高亮的持续时间等设置。
     *
     * @param {object} options - 配置对象，用于设置屏幕操作的行为。
     * @param {number} [options.confidence] - 图像匹配的置信度，范围是 0 到 1，默认为 0.8，值越高，匹配越严格。
     * @param {boolean} [options.autoHighlight] - 是否启用自动高亮功能。默认为 `false`，表示不自动高亮匹配到的图像。
     * @param {number} [options.highlightDurationMs] - 高亮显示的持续时间（毫秒），默认值为 1000 毫秒。
     * @param {number} [options.highlightOpacity] - 高亮显示的透明度，范围是 0 到 1，默认为 0.5，值越小越透明。
     * @param {string} [options.resourceDirectory] - 资源目录路径，用于指定存储图像资源的位置。
     */
    setConfig(options: {
        confidence?: number;
        autoHighlight?: boolean;
        highlightDurationMs?: number;
        highlightOpacity?: number;
        resourceDirectory?: string;
    }) {
        if (options.confidence !== undefined) screen.config.confidence = options.confidence;
        if (options.autoHighlight !== undefined) screen.config.autoHighlight = options.autoHighlight;
        if (options.highlightDurationMs !== undefined) screen.config.highlightDurationMs = options.highlightDurationMs;
        if (options.highlightOpacity !== undefined) screen.config.highlightOpacity = options.highlightOpacity;
        if (options.resourceDirectory !== undefined) screen.config.resourceDirectory = options.resourceDirectory;
    },
};

/**
 * 通知管理器对象
 */
const NotificationManager = {
    // 默认配置
    defaultOptions: {
        title: '通知',               // 默认标题
        message: '有新消息',          // 默认消息内容
        sound: true,                 // 默认播放声音
        wait: false,                 // 默认不等待用户关闭通知
        icon: '',                    // 默认不设置图标
        time: 5000                   // 默认通知显示时间 5 秒
    },

    /**
     * 显示通知
     *
     * 使用 `notifier` 库显示一个简单的桌面通知。可以通过传入自定义的 `options` 来覆盖默认配置。
     *
     * @param {object} options - 可选的配置对象，用于定制通知的行为。
     * @param {string} options.title - 通知标题（可选）。
     * @param {string} options.message - 通知内容（可选）。
     * @param {boolean} options.sound - 是否播放通知声音（可选）。
     * @param {string} options.icon - 通知图标路径（可选）。
     * @param {boolean} options.wait - 是否等待用户关闭通知后再继续执行（可选）。
     * @param {number} options.time - 通知显示时间（可选）。
     */
    show: function (options: {
        title: string;
        message: string;
        sound: boolean;
        icon: string;
        wait: boolean;
        time: number;
    } = {
        icon: "",
        message: "",
        sound: false,
        time: 0,
        title: "",
        wait: false
    }) {
        // 合并默认配置和传入的选项
        const finalOptions = {...this.defaultOptions, ...options};

        // 显示通知
        notifier.notify(finalOptions);
    },

    /**
     * 设置默认配置
     *
     * 更新通知管理器的默认配置，以便之后的所有通知使用这些新的默认值。
     *
     * @param {object} options - 要更新的配置对象。
     * @param {string} options.title - 默认通知标题。
     * @param {string} options.message - 默认通知内容。
     * @param {boolean} options.sound - 默认是否播放声音。
     * @param {string} options.icon - 默认通知图标。
     * @param {boolean} options.wait - 默认是否等待用户关闭通知后再继续执行。
     * @param {number} options.time - 默认通知显示时间。
     */
    setDefaultOptions: function (options: {
        title: string; // 默认标题
        message: string; // 默认消息内容
        sound: boolean; // 默认播放声音
        wait: boolean; // 默认不等待用户关闭通知
        icon: string; // 默认不设置图标
        time: number; // 默认通知显示时间 5 秒
    }) {
        this.defaultOptions = {...this.defaultOptions, ...options};
    },

    /**
     * 发送带有自定义按钮的通知
     *
     * 该方法会发送一个包含自定义按钮的通知，并通过回调函数来处理用户点击的按钮。
     *
     * @param {object} options - 可选的配置对象，用于定制通知的行为。
     * @param {string[]} options.buttons - 按钮名称的数组，用户可以点击这些按钮（可选）。
     * @param {string} options.title - 通知标题（可选）。
     * @param {string} options.message - 通知内容（可选）。
     * @param {boolean} options.sound - 是否播放通知声音（可选）。
     * @param {number} options.time - 通知显示时间（可选）。
     * @param {(err: Error | null, response: any) => void} callback - 用户点击按钮后的回调函数。
     */
    showWithButtons(
        options: {
            buttons?: string[];
            title?: string;
            message?: string;
            sound?: boolean;
            time?: number;
        } = {},
        callback: (err: Error | null, response: any) => void
    ) {
        const finalOptions = {...options, wait: true};
        notifier.notify(finalOptions, callback);
    },

    /**
     * 发送定时自动关闭的通知
     *
     * 该方法会发送一个在指定时间后自动关闭的通知。
     *
     * @param {object} options - 可选的配置对象，用于定制通知的行为。
     * @param {string} options.title - 通知标题（可选）。
     * @param {string} options.message - 通知内容（可选）。
     * @param {boolean} options.sound - 是否播放通知声音（可选）。
     * @param {string} options.icon - 通知图标路径（可选）。
     * @param {number} timeout - 通知显示的超时时间（单位：毫秒）。默认 5000 毫秒（5秒）。
     */
    showWithTimeout: function (options: { title: string; message: string; sound: boolean; icon: string; } = {
        icon: "",
        message: "",
        sound: false,
        title: ""
    }, timeout: number = 5000) {
        const finalOptions = {...this.defaultOptions, ...options, time: timeout};
        notifier.notify(finalOptions);
    }
};

/**
 * 日志管理对象
 * 封装了 `winston` 和 `winston-daily-rotate-file`，提供统一的日志记录接口。
 */
const logger = {
    // 创建日志记录器实例
    createLoggerInstance() {
        // 配置每日轮转日志
        const logTransport = new DailyRotateFile({
            filename: 'logs/%DATE%.log',  // 日志文件的存储路径，并使用日期作为文件名
            datePattern: 'YYYY-MM-DD',    // 日期格式：年-月-日
            maxFiles: '7d',               // 保留最近 7 天的日志文件
            level: 'info',                // 记录 info 及以上级别的日志
        });

        // 创建 winston 日志记录器
        return winston.createLogger({
            level: 'info',  // 默认日志级别
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.printf(({
                                           timestamp,
                                           level,
                                           message
                                       }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
            ),
            transports: [
                new winston.transports.Console(),
                logTransport  // 输出到每天轮转的文件
            ]
        });
    },

    /**
     * 记录 info 级别的日志
     * @param message - 日志信息
     */
    info(message: string) {
        const loggerInstance = this.createLoggerInstance();
        loggerInstance.info(message);
    },

    /**
     * 记录 warn 级别的日志
     * @param message - 日志信息
     */
    warn(message: string) {
        const loggerInstance = this.createLoggerInstance();
        loggerInstance.warn(message);
    },

    /**
     * 记录 error 级别的日志
     * @param message - 日志信息
     */
    error(message: string) {
        const loggerInstance = this.createLoggerInstance();
        loggerInstance.error(message);
    },

    /**
     * 记录 debug 级别的日志
     * @param message - 日志信息
     */
    debug(message: string) {
        const loggerInstance = this.createLoggerInstance();
        loggerInstance.debug(message);
    },

    /**
     * 设置日志级别
     * @param level - 日志级别（例如 'info', 'warn', 'error' 等）
     */
    setLogLevel(level: string) {
        const loggerInstance = this.createLoggerInstance();
        loggerInstance.level = level;
    }
};

/**
 * 检查指定进程是否正在运行
 *
 * 该函数检查指定的进程是否在系统上运行，支持 Windows、Linux、macOS。
 *
 * @param {string} processName - 进程的名称（例如 `notepad.exe` 或 `SPDBENTClient.exe`）
 * @returns {Promise<boolean>} - 如果进程在运行，则返回 `true`，否则返回 `false`
 */
const isProcessRunning = async (processName: string): Promise<boolean> => {
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

// 最终导出所有功能
export {
    logger,
    NotificationManager,
    initializeNutBolt,
    isProcessRunning,
    mouseController,
    keyboardController,
    screenController,
    findImageMatches
};
