"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const cfg = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.enableCors({
        origin: cfg.get('CORS_ORIGIN', 'http://localhost:3000'),
        credentials: true,
    });
    const port = cfg.get('PORT', 4000);
    await app.listen(port);
    console.log(`🚀 FitLog API running on http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map