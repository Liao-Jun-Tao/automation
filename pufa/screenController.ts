import {Button, imageResource, mouse, Point, Region, screen, straightTo} from "@nut-tree/nut-js";
import {CONFIDENCE} from "./config";

/**
 * 查找屏幕上的图像并将鼠标移动到调整后的区域位置
 *
 * @param {string} imagePath - 图像文件的路径。
 * @param {object} [options] - 可选参数对象，用于配置查找行为。
 * @param {number} [options.confidence] - 匹配的置信度，默认为 0.8。
 * @param {object} [options.adjustment] - 可选，调整匹配区域的位置和大小。
 * @param {number} [options.adjustment.width] - 匹配区域的宽度调整值。
 * @param {number} [options.adjustment.height] - 匹配区域的高度调整值。
 * @param {number} [options.adjustment.offsetX] - 匹配区域的 X 轴偏移量。
 * @param {number} [options.adjustment.offsetY] - 匹配区域的 Y 轴偏移量。
 * @param {string} [options.action] - 指定鼠标动作（"move"、"click"、"doubleClick"），默认仅移动。
 *
 * @returns {Promise<Region>} 返回匹配到的调整后 `Region` 对象。
 *
 * @throws {Error} 如果图像未找到或发生其他错误，抛出错误。
 */

export const findImageAndMoveToAdjustedPosition = async (
    imagePath: string,
    options: {
        confidence?: number;
        adjustment?: { width?: number; height?: number; offsetX?: number; offsetY?: number };
        action?: string;
    } = {
        confidence: CONFIDENCE
    }
): Promise<Region> => {

    const {confidence = CONFIDENCE, adjustment = {}, action = "move"} = options;

    const {width = 0, height = 0, offsetX = 0, offsetY = 0} = adjustment;

    try {

        const originalRegion = await screen.find(imageResource(imagePath), {confidence});

        const adjustedRegion = new Region(
            originalRegion.left + offsetX,
            originalRegion.top + offsetY,
            originalRegion.width + width,
            originalRegion.height + height
        );

        const centerX = adjustedRegion.left + adjustedRegion.width / 2;

        const centerY = adjustedRegion.top + adjustedRegion.height / 2;

        const centerPoint = new Point(centerX, centerY);

        console.log(`[移动到中心] 开始移动到调整后的中心位置: (${centerX}, ${centerY})`);

        // 移动鼠标到调整后的中心点
        await mouse.move(straightTo(centerPoint));

        // 根据指定的动作执行
        if (action === "click") {
            await mouse.click(Button.LEFT); // 单击
        } else if (action === "doubleClick") {
            await mouse.doubleClick(Button.LEFT); // 双击
        } else {
            console.log(`[动作跳过] 仅移动到 ${imagePath} 的调整后区域中心`);
        }

        return adjustedRegion;
    } catch (error) {
        console.error(`[查找失败] 未能找到图像 ${imagePath}，错误信息：`, error);
        throw new Error(`未找到图像 ${imagePath} 或发生错误`);
    }
}
