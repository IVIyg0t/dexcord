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
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
let Example = class Example {
    choose(what, interaction) {
        interaction.reply(what);
    }
    choice(what, interaction) {
        interaction.reply(what);
    }
};
__decorate([
    Slash(),
    __param(0, SlashChoice("Human", "Astronaut", "Dev")),
    __param(0, SlashOption("what", { description: "What are you?" })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "choose", null);
__decorate([
    Slash(),
    __param(0, SlashChoice({ name: "are you okay?", value: "okay" })),
    __param(0, SlashChoice({ name: "are you good?", value: "good" })),
    __param(0, SlashOption("text")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", void 0)
], Example.prototype, "choice", null);
Example = __decorate([
    Discord()
], Example);
export { Example };
