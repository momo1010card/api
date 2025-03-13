const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// إعداد عميل WhatsApp
const client = new Client({
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || require('puppeteer').executablePath(), 
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// متغير لتخزين QR Code كصورة
let qrCodeImageUrl = null;

// توليد QR Code كصورة
client.on('qr', async (qr) => {
    console.log("✅ QR Code generated. Generating image...");

    // إنشاء QR Code كصورة
    const qrCodeImage = await qrcode.toDataURL(qr);
    qrCodeImageUrl = qrCodeImage;

    console.log("✅ QR Code image generated. Use the following URL to scan:");
    console.log("/qrcode"); // رابط صفحة QR Code
});

// التأكد من أن العميل جاهز
client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.send(`
        <h1>WhatsApp Web API</h1>
        <p>API is running. Visit <a href="/qrcode">QR Code page</a> to scan and authenticate.</p>
        <p>Send messages using POST to /send with phone and message in JSON body.</p>
    `);
});

// API لإرسال رسالة
app.post('/send', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, error: "رقم الهاتف والرسالة مطلوبان!" });
    }

    try {
        await client.sendMessage(`${phone}@c.us`, message);
        res.json({ success: true, message: "✅ تم إرسال الرسالة!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API للحصول على QR Code كصورة
app.get('/qrcode', (req, res) => {
    if (!qrCodeImageUrl) {
        return res.send(`
            <h1>انتظر...</h1>
            <p>جاري توليد رمز QR. يرجى تحديث الصفحة بعد بضع ثوانٍ.</p>
            <script>setTimeout(() => { window.location.reload(); }, 5000);</script>
        `);
    }
    res.send(`
        <h1>امسح رمز QR</h1>
        <p>افتح WhatsApp على هاتفك وامسح هذا الرمز لتسجيل الدخول</p>
        <img src="${qrCodeImageUrl}" alt="QR Code" style="max-width: 300px;" />
    `);
});

// حالة الاتصال
app.get('/status', (req, res) => {
    res.json({
        status: client.info ? 'connected' : 'disconnected',
        info: client.info || {}
    });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// تهيئة العميل
client.initialize().catch(err => {
    console.error('❌ Failed to initialize WhatsApp client:', err);
});
