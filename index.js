import { default as makeWASocket, useSingleFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import yt from "./plugins/yt.js";
import fs from "fs";

const { state, saveState } = useSingleFileAuthState("./auth_info.json");

async function connectToWhatsApp() {
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });
    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting:', shouldReconnect);
            if(shouldReconnect) connectToWhatsApp();
        } else if(connection === 'open') {
            console.log('Connected to WhatsApp');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0].message.conversation || "";
        const from = messages[0].key.remoteJid;

        if(msg.startsWith("!video") || msg.startsWith("!song")) {
            await yt(msg, from, sock);
        }
    });
}

connectToWhatsApp();
