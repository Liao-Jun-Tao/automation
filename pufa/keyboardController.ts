// utils/keyboardController.ts

import {Key, keyboard} from "@nut-tree/nut-js";


/**
 * 按下并释放多个按键
 * @param {...Key[]} keys - 要按下并释放的按键
 */
export const pressAndRelease = async (...keys: Key[]): Promise<void> => {
    await keyboard.pressKey(...keys);
    await keyboard.releaseKey(...keys);
}

/**
 * 输入文本
 * @param text 要输入的文本
 */
export const typeText = async (text: string): Promise<void> => {
    await keyboard.type(text);
}
