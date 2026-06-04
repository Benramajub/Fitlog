"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramsController = void 0;
const common_1 = require("@nestjs/common");
const programs_service_1 = require("./programs.service");
const auth_guard_1 = require("../common/guards/auth.guard");
let ProgramsController = class ProgramsController {
    constructor(s) {
        this.s = s;
    }
    findByMember(memberId) { return this.s.findByMember(memberId); }
    findOne(id) { return this.s.findOne(id); }
    create(body) { return this.s.create(body.memberId, body); }
    addDay(id, body) {
        return this.s.addDay(id, body.title, body.dayOrder || 1);
    }
    updateDay(dayId, body) {
        return this.s.updateDay(dayId, body.title);
    }
    addExercise(dayId, body) {
        return this.s.addExercise(dayId, body);
    }
    updateExercise(exId, body) {
        return this.s.updateExercise(exId, body);
    }
    removeExercise(exId) { return this.s.removeExercise(exId); }
    remove(id) { return this.s.remove(id); }
};
exports.ProgramsController = ProgramsController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Query)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "findByMember", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/days'),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "addDay", null);
__decorate([
    (0, common_1.Patch)('days/:dayId'),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('dayId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "updateDay", null);
__decorate([
    (0, common_1.Post)('days/:dayId/exercises'),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('dayId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "addExercise", null);
__decorate([
    (0, common_1.Patch)('exercises/:exId'),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('exId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "updateExercise", null);
__decorate([
    (0, common_1.Delete)('exercises/:exId'),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('exId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "removeExercise", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_guard_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgramsController.prototype, "remove", null);
exports.ProgramsController = ProgramsController = __decorate([
    (0, common_1.Controller)('programs'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.RolesGuard),
    __metadata("design:paramtypes", [programs_service_1.ProgramsService])
], ProgramsController);
//# sourceMappingURL=programs.controller.js.map