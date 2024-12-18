// src/utils/retry.ts

/**
 * 重试选项接口
 */
interface RetryOptions {
    retries: number; // 最大重试次数
    delay: number; // 每次重试的延迟时间（毫秒）
}

/**
 * 通用重试机制
 * @param fn 需要重试的异步函数
 * @param options 重试选项
 * @returns {Promise<T>} 最终的执行结果
 */
export const retry = async <T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> => {
    const {retries, delay} = options;
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error) {
            attempt++;
            if (attempt >= retries) {
                throw error;
            }
            console.warn(`尝试第 ${attempt} 次失败，${retries - attempt} 次重试机会。错误信息：`, error);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    // 理论上不会到达这里
    throw new Error('Retry mechanism failed unexpectedly.');
};
