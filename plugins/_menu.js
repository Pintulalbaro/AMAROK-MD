const events = require("../lib/event");
const {
  command,
  isPrivate,
  styletext,
  tiny,
  serif_B,
  clockString,
} = require("../lib");
const config = require("../config.js");
const prefix =  config.PREFIX
const { FancyRandom } = require('abu-bot');
const { OWNER_NAME, BOT_NAME, PREFIX , WORK_TYPE} = require("../config");
const { hostname, uptime } = require("os");
command(
  {
    pattern: "menu",
    fromMe: isPrivate,
    dontAddCommandList: true,
  },
  async (message,match) => {
    let [date, time] = new Date()
      .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      .split(",");
                
 let menu = `
╭━━〘 `+ styletext(BOT_NAME.split(' ')[0],58) +` 〙━━──⊷` 
menu+= `
┃ ⛥ ╭──────────────
┃ ⛥ │ *OWNER* :  ${OWNER_NAME}
┃ ⛥ │ *USER* : ${message.pushName}
┃ ⛥ │ *MODE* : ${WORK_TYPE}
┃ ⛥ │ *PREFIX* : ${prefix}
┃ ⛥ │ *HOST NAME* :${hostname().split("-")[0]}
┃ ⛥ │ *DATE* : ${date}
┃ ⛥ │ *TIME* : ${time}
┃ ⛥ │ *UPTIME* : ${clockString(uptime())} 
┃ ⛥ │ *VERSION* : ${require("../package.json").version}
┃ ⛥ │ *PLUGINS* : ${events.commands.length} 
┃ ⛥ ╰──────────────
╰━━━━━━━━━━━──⊷\n
`
menu+= `╭───『 `+ FancyRandom('command',57)+`』──◆`
    let cmnd = [];
    let cmd;
    let category = [];
    events.commands.map((command, num) => {
      if (command.pattern) {
        cmd = command.pattern
          .toString()
          .match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)[2];
      }

      if (!command.dontAddCommandList && cmd !== undefined) {
        let type;
        if (!command.type) {
          type = "extra";
        } else {
          type = command.type.toLowerCase();
        }

        cmnd.push({ cmd, type: type });

        if (!category.includes(type)) category.push(type);
      }
    });
    cmnd.sort();
    category.sort().forEach((cmmd) => {
     menu+=`
┃ ❐ ╭─────────────⬤
┃ ❐ │ ⦿---- ${cmmd} ----⦿
┃ ❐ ╰┬────────────⬤
┃ ❐ ┌┤`
let comad = cmnd.filter(({ type }) => type == cmmd);
      comad.forEach(({ cmd }, num) => {
 menu += `\n┃ ❐ │ ⬤  ${cmd.trim()}`;
      });
 menu += `\n┃ ❐ ╰─────────────⬤`;
    });

    menu += ` ╰━━━━━━━━━━━──⊷\n`
    menu += `_🐺Send ${prefix}menu <command name> to get detailed information of specific command._\n*📍Eg:* _${prefix}help anime_`;
    return await message.client.sendMessage(message.jid, {
      image: { url: `https://i.ibb.co/GtwvJnk/bce2563a25ef.jpg` },
      caption: FancyRandom(menu),
      footer: tiny(
        `Amarok Md\nVersion : ${require("../package.json").version}` ),
      buttons: [
        {
          buttonId: '${prefix}arise',
          buttonText: { displayText: tiny("⫷ALIVE⫸") },
        },
        {
          buttonId: '${prefix}list',
          buttonText: { displayText: tiny("⫷LIST⫸") },
        },
      ],
    });
  }
);

command(
  {
    pattern: "list",
    fromMe: isPrivate,
    dontAddCommandList: true,
  },
  async (message, match, { prefix }) => {
    let [date, time] = new Date()
        .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        .split(",");
    let menu = `╭━━〘 `+ styletext(BOT_NAME.split(' ')[0],58) +` 〙━━──⊷` 
menu+= `
┃ ⛥ ╭━━━━━━━━━━━──⊷ 
┃ ⛥ │ *OWNER* :  ${OWNER_NAME}
┃ ⛥ │ *USER* : ${message.pushName}
┃ ⛥ │ *MODE* : ${WORK_TYPE}
┃ ⛥ │ *PREFIX* : ${PREFIX}
┃ ⛥ │ *HOST NAME* :${hostname().split("-")[0]}
┃ ⛥ │ *DATE* : ${date}
┃ ⛥ │ *TIME* : ${time}
┃ ⛥ │ *UPTIME* : ${clockString(uptime())} 
┃ ⛥ │ *VERSION* : ${require("../package.json").version}
┃ ⛥ │ *PLUGINS* : ${events.commands.length} 
┃ ⛥ ╰━━━━━━━━━━━──⊷
╰━━━━━━━━━━━──⊷\n
` 
    let cmnd = [];
    let cmd, desc;
    events.commands.map((command) => {
      if (command.pattern) {
        cmd = command.pattern
          .toString()
          .match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)[2];
      }
      if (command.desc) {
        desc = command.desc;
      } else {
        desc = false;
      }
      if (!command.dontAddCommandList && cmd !== undefined) {
        cmnd.push({ cmd, desc });
      }
    });
    cmnd.sort();
    cmnd.forEach(({ cmd, desc }, num) => {
      menu += `┃ ⛥ │ ➛ ${(num += 1)} *${tiny(cmd.trim())}*\n`; 
      if (desc) menu += `┃ ⛥ │ ➛ ${tiny("use : " + desc)}\n`;
    });
    menu += `╰━━━━━━━━━━━━━━━━──⊷`;
   return await message.reply(menu);
  }
);
