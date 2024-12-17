// 打开浦发银行网银自动化脚本

import {keyboardController, logger} from "../tools";
import {imageResource, Key, screen} from "@nut-tree/nut-js";
import {APP_NAME, LOGIN_PAGE_IMAGE, RETRY_INTERVAL, WAIT_TIME} from "./config";

export const openApp = async () => {

    try {

        logger.info("开始打开浦发银行网银");

        await keyboardController.pressAndRelease(Key.LeftSuper) // 打开win搜索框

        await keyboardController.typeText(APP_NAME)  // 输入浦发银行

        await keyboardController.pressAndRelease(Key.Enter) // 打开浦发银行网银

        const loginPage = await screen.waitFor(imageResource(LOGIN_PAGE_IMAGE), WAIT_TIME, RETRY_INTERVAL)

    } catch (e) {

        console.error('打开程序失败 错误信息：', e)

    }

}
