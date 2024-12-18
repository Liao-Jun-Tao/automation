import {openBrowser} from "./openScript";
import {AUTO_DELAYS, CONFIDENCE, DEFAULT_RESOURCE_DIRECTORY, MOUSE_SPEED} from "./config";
import "@nut-tree/nl-matcher";
import {keyboard, mouse, screen} from "@nut-tree/nut-js";
import path from "path";
import {logger} from "../utils/logger";
import {businessProcess} from "./businessScript";
import {login} from "./loginScript";
import {closeApp} from "./closeScript";

screen.config.confidence = CONFIDENCE
screen.config.resourceDirectory = path.resolve(DEFAULT_RESOURCE_DIRECTORY)
mouse.config.mouseSpeed = MOUSE_SPEED
mouse.config.autoDelayMs = AUTO_DELAYS
keyboard.config.autoDelayMs = AUTO_DELAYS

const main = async () => {
    try {
        logger.info("自动化脚本开始执行");

        // await openApp();
        await openBrowser()
        await login();
        await businessProcess();
        await closeApp();

        logger.info("自动化脚本执行完成");

    } catch (e) {
        logger.error('自动化脚本执行失败，错误信息：', e);
        // 可以根据需要添加更多的错误处理逻辑，例如截图、发送通知等
    }
};

// 立即调用主函数
main();
