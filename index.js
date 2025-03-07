const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code received, scan please!');
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if(message.body === '!ping') {
        message.reply('pong');
    }
});

client.initialize();

app.post('/send-message', (req, res) => {
    const { number, message } = req.body;
    client.sendMessage(number, message).then(response => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(500).json(err);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
