// src/config/config.ts

export const APP_NAME: string = '浦发银行网银'; // 应用名称
export const PROCESS_NAME: string = 'SPDBENTClient.exe'; // 进程名称
export const WAIT_TIME: number = 20000; // 等待时间（毫秒）
export const RETRY_INTERVAL: number = 5000; // 重试间隔时间（毫秒）
export const LOGIN_PAGE_IMAGE: string = 'login_page_image.png'; // 登录页面图像文件名
export const DEFAULT_RESOURCE_DIRECTORY: string = 'images/pufa'; // 资源目录
export const CONFIDENCE: number = 0.95; // 图像匹配置信度
export const PASSWORD_BOX: string = 'password_box.png'; // 密码框图像文件名
export const PASSWORD: string = '123456'; // 默认密码
export const LOGIN_BUTTON: string = 'loginButton.png'; // 登录按钮图像文件名
export const MouseAction = {
    Click: 'click',
    DoubleClick: 'doubleClick',
    Move: 'move'
} as const; // 鼠标操作类型
export type MouseActionType = typeof MouseAction[keyof typeof MouseAction];
export const MOUSE_SPEED: number = 1000; // 鼠标速度（毫秒）
export const AUTO_DELAYS: number = 100; // 自动延迟时间（毫秒）
export const MAX_RETRIES: number = 3; // 最大重试次数
export const RETRY_DELAY: number = 5000; // 每次重试的延迟时间（毫秒）
export const BROWSER_URL = 'https://www.spdb.com.cn/resourcesW/newentdemo/entprof_login.htm'
export const BROWSER_NAME = 'Google Chrome'
