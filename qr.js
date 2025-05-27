const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
let router = express.Router();
const pino = require("pino");
const {
    default: Mbuvi_Tech,
    useMultiFileAuthState,
    Browsers,
    delay,
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    async function MBUVI_MD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Qr_Code_By_Mbuvi_Tech = Mbuvi_Tech({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            Qr_Code_By_Mbuvi_Tech.ev.on('creds.update', saveCreds);
            Qr_Code_By_Mbuvi_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                if (qr) await res.end(await QRCode.toBuffer(qr));
                
                if (connection == "open") {
                    await delay(3000);
                    const credsPath = path.join(__dirname, `temp/${id}/creds.json`);
                    
                    if (fs.existsSync(credsPath)) {
                        // Send creds.json as file
                        await Qr_Code_By_Mbuvi_Tech.sendMessage(
                            Qr_Code_By_Mbuvi_Tech.user.id,
                            {
                                document: fs.readFileSync(credsPath),
                                fileName: 'creds.json',
                                mimetype: 'application/json'
                            }
                        );

                        // Download and send audio file with PTT
                        const audioUrl = 'https://files.catbox.moe/gpfgu5.m4a';
                        const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                        
                        await Qr_Code_By_Mbuvi_Tech.sendMessage(
                            Qr_Code_By_Mbuvi_Tech.user.id,
                            {
                                audio: audioResponse.data,
                                mimetype: 'audio/mp4',
                                ptt: true
                            }
                        );

                        // Send instructions
                        const instructions = `
> Successfully Connected 

> Put On Folder 📁 sessions 

> Then on creds.json 🤞 upload you creds.json file

> BOT REPO FORK 
> https://github.com/Mrhanstz/HANS-XMD_V2/fork

> FOLLOW MY WHATSAPP CHANNEL 
> https://whatsapp.com/channel/0029VasiOoR3bbUw5aV4qB31

> FOLLOW MY GIT
> https://github.com/Mrhanstz`;

                        await Qr_Code_By_Mbuvi_Tech.sendMessage(
                            Qr_Code_By_Mbuvi_Tech.user.id,
                            { text: instructions }
                        );
                    }

                    await delay(500);
                    await Qr_Code_By_Mbuvi_Tech.ws.close();
                    removeFile("./temp/" + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    MBUVI_MD_QR_CODE();
                }
            });
        } catch (err) {
            console.error('QR Error:', err);
            if (!res.headersSent) {
                res.json({ code: "Service is Currently Unavailable" });
            }
            removeFile("./temp/" + id);
        }
    }
    
    await MBUVI_MD_QR_CODE();
});

module.exports = router;
