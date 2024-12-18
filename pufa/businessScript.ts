import {findImageAndMoveToAdjustedPosition} from "./screenController";
import {MouseAction} from "./config";
import {mouse, sleep} from "@nut-tree/nut-js";

export const businessProcess = async () => {
    try {
        await findImageAndMoveToAdjustedPosition('首页按钮.png', {action: MouseAction.Click})
        await findImageAndMoveToAdjustedPosition('余额及明细.png', {action: MouseAction.Click})
        await sleep(500)
        await findImageAndMoveToAdjustedPosition('账户.png', {action: MouseAction.Click})
        await sleep(500)
        await findImageAndMoveToAdjustedPosition('账户明细查询.png', {action: MouseAction.Click})
        await sleep(500)
        // await mouse.scrollDown(500)
        await sleep(500)
        await findImageAndMoveToAdjustedPosition('查询.png', {action: MouseAction.Click})
        await sleep(500)
        await mouse.scrollDown(100)
        await sleep(500)
        await findImageAndMoveToAdjustedPosition('全选.png', {adjustment: {offsetX: -20}, action: MouseAction.Click})
        await sleep(500)
        await findImageAndMoveToAdjustedPosition('交易明细下载.png', {action: MouseAction.Click})
        await sleep(500)
        await findImageAndMoveToAdjustedPosition('Excel下载.png', {adjustment: {width: 20}, action: MouseAction.Click})
        await sleep(500)
    } catch (e) {
        console.log(e)
    }
}
