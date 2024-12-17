// Start of Selection
import {keyboardController, screenController} from "./tools.js";
import {Key} from "@nut-tree/nut-js";

let steps: (() => Promise<void>)[] = []; // 存储所有任务的队列
/**
 * next 函数用于依次执行队列中的任务
 */
async function next() {
    if (steps.length > 0) {
        const currentStep = steps.shift(); // 获取队列中的第一个步骤
        if (currentStep) {
            try {
                await currentStep(); // 执行当前步骤
            } catch (error) {
                console.error(`步骤执行失败: ${error}`); // 打印错误消息到控制台
            }
        }
    } else {
        console.log("所有步骤已完成"); // 打印完成消息到控制台
    }
}

/**
 * 添加步骤到队列
 */
async function addStep(step: () => Promise<void>) {
    steps.push(step); // 将步骤加入到队列
}


/**
 * 初始化配置 - 鼠标、键盘、屏幕配置
 */
// async function initializeConfig() {
//     console.log("正在初始化配置..."); // 打印初始化消息到控制台
//
//     // 设置鼠标配置
//     mouseController.setMouseConfig({
//         speed: 100,
//         autoDelayMs: 100,
//     });
//
//     // 设置键盘配置
//     keyboardController.setKeyboardConfig({
//         autoDelayMs: 100,
//     });
//
//     // 设置屏幕配置
//     screenController.ts.setConfig({
//         confidence: 0.99, // 设置图像匹配的置信度（越高匹配越严格）
//         resourceDirectory: './images', // 设置图像资源目录
//     });
//
//     console.log("初始化配置完成"); // 打印完成消息到控制台
//
//     await next()
// }

/**
 * 通过开始菜单搜索打开上海清算所客户端
 * 如果等待登录界面超时，就重复执行本流程。
 */
async function openSHCHAppViaSearch(retryCount = 0) {
    const MAX_RETRY = 1; // 设定最多重试次数，避免无限递归

    console.log(`第 ${retryCount + 1} 次尝试：打开上海清算所客户端...`);

    // 1. 打开开始菜单
    await keyboardController.pressAndRelease(Key.LeftSuper);

    // 2. 输入关键字并回车
    await keyboardController.typeText("清算所");
    await keyboardController.pressAndRelease(Key.Enter);

    console.log("等待登录界面出现（最多15秒）...");
    try {
        await screenController.waitForImage("login_button.png", 10000, 5000);
        console.log("检测到登录界面！");
        await next()
    } catch (error) {
        console.warn("等待登录界面超时！");

        // 如果还没到最大重试次数，就重新执行 openSHCHAppViaSearch
        if (retryCount < MAX_RETRY) {
            console.log("准备再次执行openSHCHAppViaSearch流程...");
            await openSHCHAppViaSearch(retryCount + 1);
        } else {
            // 超过最大重试，抛出错误让外层处理
            throw new Error("超过最大重试次数，仍未检测到登录界面");
        }
    }
}

// 启动函数
async function main() {
    // await addStep(initializeConfig); // 第一步：初始化配置
    await addStep(openSHCHAppViaSearch); // 第二步：打开上海清算所客户端
    //TODO 第三步：填写登录表单
    //TODO 第四步：等待登录成功进入主页面
    //TODO 第五步：鼠标依次移动到清算、本币清算平台、全额结算管理
    //TODO 第六步：点击“查询”按钮
    //TODO 第七步：选择将页数设置为100页
    //TODO 第八步：点击导出按钮
    //TODO 第九步：等待弹出系统保存对话框，点击保存
    //TODO 第十步：文件可能已经存在，询问是否覆盖，点击确认按钮

    //TODO 下一个环节：鼠标点击资金账户


    // 启动流程
    await next();
}


// 执行主函数
main().catch(error => {
    // 捕获主函数中的错误并打印到控制台
    console.error(`执行过程中发生错误: ${error}`);
});
