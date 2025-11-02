import ytdl from "ytdl-core";

export default async function yt(message, from, sock) {
    try {
        const args = message.split(" ");
        const url = args[1];
        if(!url) return sock.sendMessage(from, { text: "Send YouTube link: !video <url> or !song <url>" });

        const isSong = args[0] === "!song";
        const stream = ytdl(url, { quality: isSong ? "highestaudio" : "highestvideo" });
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);

        await sock.sendMessage(from, {
            [isSong ? "audio" : "video"]: buffer,
            caption: isSong ? "Here is your song!" : "Here is your video!"
        });
    } catch (err) {
        console.log(err);
        sock.sendMessage(from, { text: "Error downloading content 😅" });
    }
}
