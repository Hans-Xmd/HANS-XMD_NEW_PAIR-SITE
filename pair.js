const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
let router = express.Router();
const pino = require('pino');
const {
    default: Mbuvi_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    async function Mbuvi_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_Mbuvi_Tech = Mbuvi_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: Browsers.macOS('Chrome')
            });

            if (!Pair_Code_By_Mbuvi_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Mbuvi_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Mbuvi_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_Mbuvi_Tech.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(3000);
                    
                    const credsPath = path.join(__dirname, `temp/${id}/creds.json`);
                    if (fs.existsSync(credsPath)) {
                        // Send creds.json as file
                        await Pair_Code_By_Mbuvi_Tech.sendMessage(
                            Pair_Code_By_Mbuvi_Tech.user.id,
                            {
                                document: fs.readFileSync(credsPath),
                                fileName: 'creds.json',
                                mimetype: 'application/json'
                            }
                        );

                        // Download and send audio file with PTT
                        const audioUrl = 'https://files.catbox.moe/gpfgu5.m4a';
                        const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                        
                        await Pair_Code_By_Mbuvi_Tech.sendMessage(
                            Pair_Code_By_Mbuvi_Tech.user.id,
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

                        await Pair_Code_By_Mbuvi_Tech.sendMessage(
                            Pair_Code_By_Mbuvi_Tech.user.id,
                            { text: instructions }
                        );
                    }

                    await delay(500);
                    await Pair_Code_By_Mbuvi_Tech.ws.close();
                    removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    Mbuvi_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error('Pairing Error:', err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    await Mbuvi_MD_PAIR_CODE();
});

module.exports = router;
