// 登录流程脚本

import {LOGIN_BUTTON, MouseAction, PASSWORD, PASSWORD_BOX} from "./config";
import {findImageAndMoveToAdjustedPosition} from "./screenController";
import {keyboard, sleep} from "@nut-tree/nut-js";

export const login = async () => {

    try {
        const passwordBox = await findImageAndMoveToAdjustedPosition(PASSWORD_BOX, {action: MouseAction.Click})
        await sleep(500)
        await keyboard.type(PASSWORD)
        await sleep(500)
        const loginButton = await findImageAndMoveToAdjustedPosition(LOGIN_BUTTON, {action: MouseAction.Click})


    } catch (e) {
        console.error(e)
    }
}
