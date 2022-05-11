var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { Discord, SelectMenuComponent, Slash } from "discordx";
const roles = [
    { label: "Principal", value: "principal" },
    { label: "Teacher", value: "teacher" },
    { label: "Student", value: "student" },
];
let Example = class Example {
    async handle(interaction) {
        await interaction.deferReply();
        // extract selected value by member
        const roleValue = interaction.values?.[0];
        // if value not found
        if (!roleValue) {
            return interaction.followUp("invalid role id, select again");
        }
        await interaction.followUp(`you have selected role: ${roles.find((r) => r.value === roleValue)?.label}`);
        return;
    }
    async myRoles(interaction) {
        await interaction.deferReply();
        // create menu for roles
        const menu = new MessageSelectMenu()
            .addOptions(roles)
            .setCustomId("role-menu");
        // create a row for message actions
        const buttonRow = new MessageActionRow().addComponents(menu);
        // send it
        interaction.editReply({
            components: [buttonRow],
            content: "select your role!",
        });
        return;
    }
};
__decorate([
    SelectMenuComponent("role-menu"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], Example.prototype, "handle", null);
__decorate([
    Slash("my_roles", { description: "roles menu" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], Example.prototype, "myRoles", null);
Example = __decorate([
    Discord()
], Example);
export { Example };
