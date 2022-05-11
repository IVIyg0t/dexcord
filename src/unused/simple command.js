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
import { Discord, SimpleCommand, SimpleCommandOption, SimpleCommandOptionType, Slash, } from "discordx";
let Example = class Example {
    hello(command) {
        command.message.reply(`👋 ${command.message.member}`);
    }
    sum(num1, num2, command) {
        if (!num1 || !num2) {
            command.sendUsageSyntax();
            return;
        }
        command.message.reply(`total = ${num1 + num2}`);
    }
    // make single handler for simple and slash command
    likeIt(command) {
        command.reply("I like it, Thanks");
    }
    simpleLikeIt(command) {
        this.likeIt(command.message);
    }
    slashLikeIt(command) {
        this.likeIt(command);
    }
};
__decorate([
    SimpleCommand("hello", { aliases: ["hi"] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "hello", null);
__decorate([
    SimpleCommand("sum", { argSplitter: "+" }),
    __param(0, SimpleCommandOption("num1", { type: SimpleCommandOptionType.Number })),
    __param(1, SimpleCommandOption("num2", { type: SimpleCommandOptionType.Number })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "sum", null);
__decorate([
    SimpleCommand("like-it"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "simpleLikeIt", null);
__decorate([
    Slash("like-it"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "slashLikeIt", null);
Example = __decorate([
    Discord()
], Example);
export { Example };
