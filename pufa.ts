// main.ts
import {
    initializeNutBolt,
    isProcessRunning,
    keyboardController,
    logger,
    mouseController,
    NotificationManager,
    screenController
} from './tools';
import {Key, mouse, sleep} from '@nut-tree/nut-js';
import path from "path";
import dotenv from 'dotenv';

mouse.config.mouseSpeed = 1000
// 加载环境变量
dotenv.config();

// =====================================
// ============ 配置信息 ===============
// =====================================
const CONFIG = {
    appName: "浦发银行网银",
    startEntryName: 'SPDBENTClient.exe',
    credentials: {
        // 请替换为实际用户名
        password: process.env.SPDB_PASSWORD || "782109ming",                 // 请替换为实际密码
        secondaryPassword: process.env.SPDB_SECONDARY_PASSWORD || "782109"      // 请替换为实际二次密码
    },
    images: {
        loginPage: "login_page_image.png",
        homePage: "homepage_image.png",
        secondaryPassword: "secondary_password_image.png",
        passwordBox: "password_box.png",
        loginButton: "login_button.png",
        secondaryLogin: "secondary_login.png",
        accountDetails: "account_details.png",
        balanceDetails: "balance_details.png",
        queryButton: "query_button.png",
        selectAll: "select_all.png",
        transactionDownload: "transaction_download.png",
        excelDownload: "excel_download.png",
        saveSystem: "save_system.png",
        overwriteConfirm: "overwrite_confirm.png",
        closeSavePage: "close_save_page.png",
        homeButton: "home_button.png",
        searchBox: "window11_search_box.png",
        virtualMachine: "virtual_machine_icon.png" // 假设有虚拟机图标截图
    },
    scrollAmount: 500,
    maxScroll: 9999,
    timeouts: {
        imageWait: 10000,       // 等待图像出现的超时时间（毫秒）
        retryInterval: 5000     // 重试间隔时间（毫秒）
    },
    confidence: 0.99,            // 图像匹配置信度（0.0 - 1.0）
    mouse: {
        speed: 2000,             // 鼠标移动速度（像素/秒）
        autoDelayMs: 100         // 鼠标动作间的自动延迟（毫秒）
    },
    keyboard: {
        autoDelayMs: 100         // 键盘动作间的自动延迟（毫秒）
    }
};

// =====================================
// ============ 日志函数 ===============
// =====================================
function log(stepNumber: number, message: string) {
    logger.info(`【步骤 ${stepNumber}】 ${message}`);
}

// =====================================
// ============ 核心功能函数 ===========
// =====================================

/**
 * 启动虚拟机
 */
async function startVirtualMachine() {
    try {
        log(0, "检查是否已启动虚拟机...");


        log(0, "启动虚拟机...");
        await keyboardController.pressAndRelease(Key.LeftSuper, Key.Space); // 打开搜索框
        await sleep(500); // 等待

        await keyboardController.typeText("windows po"); // 输入虚拟机名称
        await sleep(500); // 等待

        await keyboardController.pressAndRelease(Key.Enter); // 按回车键启动虚拟机
        await sleep(3000); // 等待虚拟机启动
        log(0, "虚拟机启动完成");
        await next();


    } catch (error) {
        logger.error(`[虚拟机启动] 虚拟机启动失败: ${error}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `虚拟机启动失败: ${error}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw error; // 重新抛出错误，确保错误被捕获
    }
};

/**
 * 初始化配置 - 鼠标、键盘、屏幕配置
 */
async function initializeConfig() {
    log(1, "正在初始化配置...");
    initializeNutBolt({
        enableKeyboard: true,
        enableMouse: true,
        enableScreen: true,
        enableWindows: true,
        enableWindowFinder: true,
        enableInputMonitor: true,
    });

    // 设置鼠标配置
    mouseController.setMouseConfig({
        speed: CONFIG.mouse.speed,
        autoDelayMs: CONFIG.mouse.autoDelayMs,
    });

    // 设置键盘配置
    keyboardController.setKeyboardConfig({
        autoDelayMs: CONFIG.keyboard.autoDelayMs,
    });

    // 设置屏幕配置
    screenController.setConfig({
        confidence: CONFIG.confidence, // 使用 CONFIG 中的置信度
        resourceDirectory: path.resolve('images/pufa'), // 设置图像资源目录
    });

    log(1, "初始化配置完成");
    await next();
}

/**
 * 判断浦发银行网银是否运行
 */
async function checkAppRunning(): Promise<boolean> {
    log(2, `判断是否有运行进程: ${CONFIG.startEntryName}`);
    const running = await isProcessRunning(CONFIG.startEntryName);
    if (running) {
        log(2, "浦发银行网银已在运行");
    } else {
        log(2, "浦发银行网银未运行");
    }
    return running;
}

/**
 * 运行浦发银行网银
 */
async function runApp() {
    try {
        log(3, "通过开始菜单搜索并运行浦发银行网银");
        await keyboardController.pressAndRelease(Key.LeftControl, Key.Escape); // 打开开始菜单
        await screenController.waitForImage(CONFIG.images.searchBox, CONFIG.timeouts.imageWait, CONFIG.timeouts.retryInterval);
        await keyboardController.typeText(CONFIG.appName);
        await keyboardController.pressAndRelease(Key.Enter);
        log(3, "浦发银行网银启动命令已发送");
    } catch (e) {
        logger.error(`启动浦发银行网银失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `启动浦发银行网银失败: ${e}`,
            sound: true,
            icon: "",
            wait: true,
            time: 5000
        });
        throw e;
    }
    await next();
}

/**
 * 登录浦发银行网银
 */
async function login() {
    try {
        log(4, "登录浦发银行网银，输入用户名和密码");

        await screenController.waitForImage(CONFIG.images.loginPage, CONFIG.timeouts.imageWait, CONFIG.timeouts.retryInterval)
        const passwordBox = await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.passwordBox, {
            confidence: CONFIG.confidence,
        });
        if (passwordBox) {
            await keyboardController.typeText(CONFIG.credentials.password);
            log(4, "密码已输入");
        } else {
            throw new Error("密码输入框未找到");
        }

        // 点击登录按钮
        const loginButton = await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.loginButton, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        if (loginButton) {
            log(4, "登录按钮已点击");
        } else {
            throw new Error("登录按钮未找到");
        }
        log(4, "登录信息已输入并提交");
    } catch (e) {
        logger.error(`登录失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `登录失败: ${e}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw e;
    }
    await next();
}

/**
 * 判断是否需要二次输入
 */
async function handleSecondaryLogin(): Promise<void> {
    try {
        log(5, "检查是否需要二次登录");
        const requiresSecondary = await screenController.isImageExist(CONFIG.images.secondaryLogin, {confidence: 0.9});
        if (requiresSecondary) {
            log(5, "需要二次登录，输入二次密码");
            const secondaryPasswordBox = await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.secondaryLogin, {
                confidence: CONFIG.confidence,
                action: "click"
            });
            if (secondaryPasswordBox) {
                await keyboardController.typeText(CONFIG.credentials.secondaryPassword);
                await keyboardController.pressAndRelease(Key.Enter);
                log(5, "二次密码已输入并提交");
            } else {
                throw new Error("二次登录密码框未找到");
            }
        } else {
            log(5, "无需二次登录");
        }
    } catch (e) {
        logger.error(`处理二次登录失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `处理二次登录失败: ${e}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw e;
    }
    await next();
}

/**
 * 确保跳转到首页
 */
async function navigateToHomePage() {
    try {
        log(6, "跳转到首页");
        const onHomePage = await screenController.isImageExist(CONFIG.images.homePage, {confidence: CONFIG.confidence});
        if (!onHomePage) {
            await screenController.waitForImage(CONFIG.images.homePage, CONFIG.timeouts.imageWait, CONFIG.timeouts.retryInterval);
            const confirmedHomePage = await screenController.isImageExist(CONFIG.images.homePage, {confidence: CONFIG.confidence});
            if (!confirmedHomePage) {
                throw new Error("未能跳转到首页");
            }
        }
        log(6, "已在首页");
    } catch (e) {
        logger.error(`跳转到首页失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `跳转到首页失败: ${e}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw e;
    }
    await next();
}

/**
 * 查询账户明细
 */
async function queryAccountDetails() {
    try {
        log(7, "点击余额明细、账户明细查询，并滚动页面");
        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.balanceDetails, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(7, "余额明细已点击");

        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.accountDetails, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(7, "账户明细查询已点击");

        await mouseController.scrollDown(CONFIG.scrollAmount);
        log(7, "已滚动页面");
    } catch (e) {
        logger.error(`查询账户明细失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `查询账户明细失败: ${e}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw e;
    }
    await next();
}

/**
 * 下载交易明细
 */
async function downloadTransactionDetails() {
    try {
        log(8, "点击查询按钮");
        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.queryButton, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(8, "查询按钮已点击");

        await mouseController.scrollDown(CONFIG.maxScroll); // 向下滚动至底部
        log(8, "已向下滚动至底部");

        await screenController.waitForImage(CONFIG.images.selectAll, CONFIG.timeouts.imageWait, CONFIG.timeouts.retryInterval);
        log(8, "全选按钮出现");

        log(9, "点击全选按钮并下载交易明细");
        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.selectAll, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(9, "全选按钮已点击");

        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.transactionDownload, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(9, "交易明细下载按钮已点击");

        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.excelDownload, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(9, "Excel下载按钮已点击");

        log(9, "交易明细下载完成");
    } catch (e) {
        logger.error(`下载交易明细失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `下载交易明细失败: ${e}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw e;
    }
    await next();
}

/**
 * 保存下载的文件
 */
async function saveFile() {
    try {
        log(10, "保存下载的文件，处理提示信息");
        await screenController.waitForImage(CONFIG.images.saveSystem, CONFIG.timeouts.imageWait, CONFIG.timeouts.retryInterval);
        log(10, "保存系统提示出现");

        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.saveSystem, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(10, "保存按钮已点击");

        // 检查是否需要覆盖
        const overwritePrompt = await screenController.isImageExist(CONFIG.images.overwriteConfirm, {confidence: CONFIG.confidence});
        if (overwritePrompt) {
            log(11, "检测到覆盖提示，点击覆盖");
            await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.overwriteConfirm, {
                confidence: CONFIG.confidence,
                action: "click"
            });
            log(11, "覆盖确认按钮已点击");
        }

        // 等待保存完成
        await screenController.waitForImage(CONFIG.images.homePage, CONFIG.timeouts.imageWait, CONFIG.timeouts.retryInterval);
        log(10, "文件保存完成");
    } catch (e) {
        logger.error(`保存文件失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `保存文件失败: ${e}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw e;
    }
    await next();
}

/**
 * 关闭保存页并返回首页
 */
async function closeSavePageAndReturnHome() {
    try {
        log(12, "关闭保存页，返回首页");
        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.closeSavePage, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(12, "关闭保存页按钮已点击");

        await screenController.findImageAndMoveToAdjustedPosition(CONFIG.images.homeButton, {
            confidence: CONFIG.confidence,
            action: "click"
        });
        log(12, "返回首页按钮已点击");

        log(12, "已关闭保存页并返回首页");
    } catch (e) {
        logger.error(`关闭保存页失败: ${e}`);
        NotificationManager.show({
            title: "自动化流程错误",
            message: `关闭保存页失败: ${e}`,
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
        throw e;
    }
    await next();
}

// =====================================
// ============ 步骤注册函数 ============
// =====================================
let steps: (() => Promise<void>)[] = []; // 存储所有任务的队列

/**
 * 注册所有步骤到队列
 */
async function registerSteps() {
    steps.push(initializeConfig);
    steps.push(startVirtualMachine);
    steps.push(async () => {
        const appRunning = await checkAppRunning();
        if (!appRunning) {
            await runApp();
        } else {
            log(2, "浦发银行网银已在运行");
            await next();
        }
    });
    steps.push(async () => {
        const onHomePage = await screenController.isImageExist(CONFIG.images.homePage, {confidence: CONFIG.confidence});
        if (!onHomePage) {
            await login();
            await handleSecondaryLogin();
            await navigateToHomePage();
        } else {
            log(4, "已在首页，无需登录");
            await next();
        }
    });
    steps.push(queryAccountDetails);
    steps.push(downloadTransactionDetails);
    steps.push(saveFile);
    steps.push(closeSavePageAndReturnHome);
}

// =====================================
// ============ 步骤执行函数 ============
// =====================================
/**
 * 执行下一个步骤
 */
async function next() {
    if (steps.length > 0) {
        const currentStep = steps.shift();
        if (currentStep) {
            try {
                await currentStep();
            } catch (error) {
                logger.error(`执行步骤失败: ${error}`);
                console.log("终止自动化流程");
                NotificationManager.show({
                    title: "自动化流程错误",
                    message: `执行步骤失败: ${error}`,
                    sound: true,
                    icon: "",
                    wait: false,
                    time: 5000
                });
            }
        }
    } else {
        console.log("✅ 所有步骤已完成");
        logger.info("所有步骤已完成");
        NotificationManager.show({
            title: "自动化流程",
            message: "所有步骤已完成",
            sound: true,
            icon: "",
            wait: false,
            time: 5000
        });
    }
}

// =====================================
// ============ 主流程入口 =============
// =====================================
/**
 * 主流程入口
 */
async function main() {
    console.log("=== 启动浦发银行网银自动化流程 ===");
    logger.info("=== 启动浦发银行网银自动化流程 ===");
    await registerSteps(); // 注册所有步骤
    await next(); // 开始执行步骤
}

main().catch((error) => {
    logger.error(`执行过程中发生错误: ${error}`);
    NotificationManager.show({
        title: "自动化流程错误",
        message: `执行过程中发生错误: ${error}`,
        sound: true,
        icon: "",
        wait: false,
        time: 5000
    });
});
