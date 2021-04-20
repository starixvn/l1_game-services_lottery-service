export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "https://10.2.189.51:7300/",
        url: "http://10.2.189.51:7303",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        placeBetTimeout: 4500,
        requestTimeout: 10000, // 10s
        enabledApiLogs: true,
    },
    mainServerApiSettings: {
        url: "https://uatproxy.sabagame.com/uat/main",
        auth: {
            url: "http://10.2.189.51:7303",
            id: "game-services",
            secret: "gameservices@20luminet&",
        },
        requestTimeout: 10000,
        placeBetTimeout: 4500,
        useAuthenticate: true,
    },
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend%4022027@10.99.99.187:27201/?replicaSet=SabaUAT",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://58fc00e79ab34a3bab04a79038760cb8@sentry.sabagame.com/8",
        logIdentifier: "lottery",
        env: "PROD",
    },
    authenticateSettings: {
        audiences: ["api", "admin-api"],
    },
    adminSecretKey: "asWDEer4yGdgsdqR4uqmKQZgh",
    enableCorsWs: true,
    corsUrls: ["http://uat.sabagame.com", "https://uat.sabagame.com", "http://uat-adm.sabagame.com", "https://uat-adm.sabagame.com"],
};
