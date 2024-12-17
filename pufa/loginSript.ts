// 登录流程脚本

import {LOGIN_BUTTON, MouseAction, PASSWORD, PASSWORD_BOX} from "./config";
import {findImageAndMoveToAdjustedPosition} from "./screenController";
import {keyboard} from "@nut-tree/nut-js";

export const login = async () => {

    try {
        const passwordBox = await findImageAndMoveToAdjustedPosition(PASSWORD_BOX, {action: MouseAction.Click})

        await keyboard.type(PASSWORD)

        const loginButton = await findImageAndMoveToAdjustedPosition(LOGIN_BUTTON, {action: MouseAction.Click})


    } catch (e) {
        console.error(e)
    }
}
