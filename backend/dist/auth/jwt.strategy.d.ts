import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authService;
    constructor(cfg: ConfigService, authService: AuthService);
    validate(payload: any): Promise<import("../database/entities/user.entity").User>;
}
export {};
