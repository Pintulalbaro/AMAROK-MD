const {
  Function,
  command,
  qrcode,
  webp2mp4,
  isUrl,
  isPrivate,
} = require("../lib/");
const { yta, ytIdRegex, ytv } = require("../lib/yotube");
const { search } = require("yt-search");
const { toAudio } = require("../lib/media");
let gis = require("g-i-s");
const { AddMp3Meta } = require("../lib");

const jimp = require("jimp");
const QRReader = require("qrcode-reader");
const { RMBG_KEY } = require("../config");
let { unlink } = require("fs/promises");
const got = require("got");
const FormData = require("form-data");
const stream = require("stream");
const { promisify } = require("util");
const pipeline = promisify(stream.pipeline);
const fs = require("fs");
command(
  {
    pattern: "qr ?(.*)",
    fromMe: isPrivate,
    type: "Tool",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    if (match) {
      let buff = await qrcode(match);
      return await message.sendMessage(buff, {}, "image");
    } else if (!message.reply_message || !message.reply_message.image)
      return await message.sendMessage(
        "*Example : qr test*\n*Reply to a qr image.*"
      );

    const { bitmap } = await jimp.read(
      await message.reply_message.downloadMediaMessage()
    );
    const qr = new QRReader();
    qr.callback = (err, value) =>
      message.sendMessage(err ?? value.result, { quoted: message.data });
    qr.decode(bitmap);
  }
);

Function(
  {
    pattern: "img ?(.*)",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match) => {
    if (!match) return await message.sendMessage("Enter Search Term,number");
    let [query, amount] = match.split(",");
    let result = await gimage(query, amount);
    await message.sendMessage(
      `📸𝘈𝘔𝘈𝘙𝘖𝘒 𝘐𝘚 𝘋𝘖𝘞𝘕𝘓𝘖𝘈𝘋𝘐𝘕𝘎 𝘠𝘖𝘜𝘙 𝘐𝘔𝘈𝘎𝘌𝘚📸 ${amount || 5} 𝘐𝘔𝘈𝘎𝘌𝘚 𝘍𝘖𝘙 ${query}_`
    );
    for (let i of result) {
      await message.sendFromUrl(i);
    }
  }
);

async function gimage(query, amount = 5) {
  let list = [];
  return new Promise((resolve, reject) => {
    gis(query, async (error, result) => {
      for (
        var i = 0;
        i < (result.length < amount ? result.length : amount);
        i++
      ) {
        list.push(result[i].url);
        resolve(list);
      }
    });
  });
}

command(
  {
    pattern: "vv ?(.*)",
    fromMe: isPrivate,
    type: "tool",
  },
  async (message, match, m) => {
    if (message.reply_message.type !== "view_once")
      return await message.reply("_Not a View Once_");
    let buff = await m.quoted.download();
    return await message.sendFile(buff);
  }
);

command(
  {
    pattern: "removebg ?(.*)",
    fromMe: isPrivate,
    type: "group",
  },
  async (message, match) => {
    if (!message.reply_message || !message.reply_message.image)
      return await message.reply("_Reply to a photo_");
    if (RMBG_KEY === false)
      return await message.reply(
        `_Get a new api key from https://www.remove.bg/api_\n_set it via_\n_setvar RMBG_KEY: api key_`
      );

    await message.reply("_Removing Background_");
    var location = await message.reply_message.downloadMediaMessage();

    var form = new FormData();
    form.append("image_file", fs.createReadStream(location));
    form.append("size", "auto");

    var rbg = await got.stream.post("https://api.remove.bg/v1.0/removebg", {
      body: form,
      headers: {
        "X-Api-Key": RMBG_KEY,
      },
    });

    await pipeline(rbg, fs.createWriteStream("rbg.png"));

    await message.sendMessage(fs.readFileSync("rbg.png"), {}, "image");
    await unlink(location);
    return await unlink("rbg.png");
  }
);

command(
  {
    pattern: "photo ?(.*)",
    fromMe: isPrivate,
    type: "converter",
  },
  async (message, match, m) => {
    if (!message.reply_message)
      return await message.reply("_Reply to a sticker_");
    if (message.reply_message.mtype !== "stickerMessage")
      return await message.reply("_Not a sticker_");
    let buff = await m.quoted.download();
    return await message.sendMessage(buff, {}, "image");
  }
);

command(
  {
    pattern: "mp4 ?(.*)",
    fromMe: isPrivate,
    type: "converter",
  },
  async (message, match, m) => {
    if (!message.reply_message)
      return await message.reply("_Reply to a sticker_");
    if (message.reply_message.mtype !== "stickerMessage")
      return await message.reply("_Not a sticker_");
    let buff = await m.quoted.download();
    let buffer = await webp2mp4(buff);
    return await message.sendMessage(buffer, {}, "video");
  }
);

command(
  {
    pattern: "video ?(.*)",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match) => {
    if (!match || !message.reply_message.text)
      return await message.reply("_Enter Video Name_");
    match = match || message.reply_message.text;
    if (ytIdRegex.test(match)) {
      ytv(match.trim()).then(({ dl_link, title }) => {
        message.sendFromUrl(dl_link, { filename: title });
      });
    }
    search(match).then(async ({ all }) => {
      await message.reply(`🎥𝘈𝘔𝘈𝘙𝘖𝘒 𝘐𝘚 𝘋𝘖𝘞𝘕𝘓𝘖𝘈𝘋𝘐𝘕𝘎 𝘠𝘖𝘜𝘙 𝘝𝘐𝘋𝘌𝘖🎥 ${all[0].title}_`);
      ytv(all[0].url).then(({ dl_link, title }) => {
        message.sendFromUrl(dl_link, { filename: title, quoted: message });
      });
    });
  }
);

command(
  {
    pattern: "mp3 ?(.*)",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match, m) => {
    //if(message.reply_message.text) return await message.reply('_Enter Video Name_')
    let buff = await m.quoted.download();
    buff = await toAudio(buff, "mp3");
    return await message.sendMessage(buff, { mimetype: "audio/mpeg" }, "audio");
  }
);
command(
  {
    pattern: "fetch ?(.*)",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    if (!match)
      return message.reply(
        "_Send a direct media link_\n_*link;caption(optional)*_"
      );
    try {
      let url = match.split(";")[0];
      let options = {};
      options.caption = match.split(";")[1];

      if (isUrl(url)) {
        message.sendFromUrl(url, options);
      } else {
        message.reply("_Not a URL_");
      }
    } catch (e) {
      console.log(e);
      message.reply("_No content found_");
    }
  }
);
command(
  {
    pattern: "yts ?(.*)",
    fromMe: isPrivate,
    type: "Search",
  },
  async (message, match) => {
    if (!match) return await message.reply("_Enter a search term_");
    let rows = [];
    search(match).then(async ({ videos }) => {
      videos.forEach((result) => {
        rows.push({
          title: result.title,
          description: `\nDuration : ${result.duration.toString()}\nAuthor : ${
            result.author
          }\nPublished : ${result.ago}\nDescription : ${
            result.description
          }\nURL : ${result.url}`,
          rowId: ` `,
        });
      });
      await message.client.sendMessage(message.jid, {
        text: "Youtube Search for " + match,
        buttonText: "View Results",
        sections: [
          {
            title: "Youtube Search",
            rows: rows,
          },
        ],
      });
    });
  }
);

command(
  {
    pattern: "ytv ?(.*)",
    fromMe: isPrivate,
    dontAddCommandList: true,
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Enter a URL_");

    if (!ytIdRegex.test(match)) return await message.reply("_Invalid Url_");
    ytv(match).then(async ({ dl_link, title }) => {
      await message.reply(`🔍𝘈𝘔𝘈𝘙𝘖𝘒 𝘐𝘚 𝘕𝘖𝘞 𝘋𝘖𝘞𝘕𝘓𝘖𝘈𝘋𝘐𝘕𝘎🔍 ${title}_`);
      return await message.sendFromUrl(dl_link, {
        filename: title,
        quoted: message,
      });
    });
  }
);

command(
  {
    pattern: "yta ?(.*)",
    fromMe: isPrivate,
    dontAddCommandList: true,
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Enter a URL_");
    if (!ytIdRegex.test(match)) return await message.reply("_Invalid Url_");
    yta(match).then(async ({ dl_link, title, thumb }) => {
      await message.reply(`🔍𝘈𝘔𝘈𝘙𝘖𝘒 𝘐𝘚 𝘕𝘖𝘞 𝘋𝘖𝘞𝘕𝘓𝘖𝘈𝘋𝘐𝘕𝘎🔍 ${title}_`);
      let buff = await AddMp3Meta(dl_link, thumb, {
        title,
      });
      return await message.sendMessage(
        buff,
        { mimetype: "audio/mpeg", quoted: message.data },
        "audio"
      );
    });
  }
);
