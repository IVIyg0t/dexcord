var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ContextMenu, Discord } from "discordx";
let Example = class Example {
    messageHandler(interaction) {
        interaction.reply("I am user context handler");
    }
    userHandler(interaction) {
        interaction.reply("I am user context handler");
    }
};
__decorate([
    ContextMenu("MESSAGE", "message context"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "messageHandler", null);
__decorate([
    ContextMenu("USER", "user context"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "userHandler", null);
Example = __decorate([
    Discord()
], Example);
export { Example };
