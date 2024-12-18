// 关闭脚本

import {findImageAndMoveToAdjustedPosition} from "./screenController";

export const closeApp = async () => {
    console.log("关闭脚本")
    await findImageAndMoveToAdjustedPosition('安全退出.png', {action: "click"})
}
