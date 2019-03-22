interface ApiOption {
    host?: string;
    protocol?: string;
    getRequestCount?: (token: string) => any;
    saveRequestCount?: (token: string) => void;
}

interface AuthOption {
    appKey: string;
    appSecret: string;
    callbackUrl?: string;
    redirectUrl?: string;
    scope?: string[];
    private?: boolean;
}

declare module 'yhsd-api' {
    class Auth {
        constructor(options: AuthOption);

        // 验证 Hmac
        verifyHmac(queryObj: object): boolean;

        // 获取应用授权页面地址，用于开放应用
        getAuthorizeUrl(shopKey: string, state: string): string;

        // 获取 token
        getToken(code?: string): Promise<string>;
    }

    class Api {

        constructor(token: string, option?: ApiOption);

        // 发送 GET 请求
        get(path: string, query?: object): Promise<any>;

        // 发送 PUT 请求
        put(path: string, data?: object): Promise<any>;

        // 发送 POST 请求
        post(path: string, data?: object): Promise<any>;

        // 发送 DELETE 请求
        delete(path: string): Promise<any>;

        // 请求函数
        request(method: string, path: string, params?: object): Promise<any>
    }

    class WebHook {
        constructor(webHookToken: string);

        // 验证WebHook Hmac
        verifyHmac(hmac: string, bodyData: string): boolean;
    }
}

