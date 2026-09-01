const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
let dataKas = [{slot: 1, nama: 'Kosong', bayar: 0},{slot: 2, nama: 'Kosong', bayar: 0},{slot: 3, nama: 'Kosong', bayar: 0},{slot: 4, nama: 'Kosong', bayar: 0}];
function resetData() { dataKas.forEach(d => { d.nama = 0; d.bayar = 0; }); }
async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState('./auth');
const sock = makeWASocket({ auth: state, printQRInTerminal: true });
sock.ev.on('creds.update', saveCreds);
sock.ev.on('connection.update', (update) => { const { connection, qr } = update; if(qr) qrcode.generate(qr, {small: true}); if(connection === 'open') console.log(' Bot Kas Online!'); });
sock.ev.on('messages.upsert', async m => {
const msg = m.messages[0]; if (!msg.message) return; const chat = msg.key.remoteJid; const text = msg.message.conversation || ''; const senderName = msg.pushName || 'Member';
if(text === '.list') { let pesan = "DAFTAR KAS PTPT FAMILY\n\n"; dataKas.forEach(d => { pesan += `Slot ${d.slot}: ${d.nama} - Rp ${d.bayar.toLocaleString()}\n`; }); sock.sendMessage(chat, {text: pesan}); }
if(text.startsWith('.join ')) { const nama = text.split(' ')[1]; const slotKosong = dataKas.find(d => d.nama === 'Kosong'); if(slotKosong) { slotKosong.nama = nama; sock.sendMessage(chat, {text: `✅ ${nama} masuk Slot${slotKosong.slot}`}); } else { sock.sendMessage(chat, {text: '❌ Slot penuh!'}); }
if(text.startsWith('.bayar ')) { const jumlah = parseInt(text.split(' ')[1]); const member = dataKas.find(d => d.nama.toLowerCase() === senderName.toLowerCase()); if(member) { member.bayar += jumlah; sock.sendMessage(chat, {text: `✅ Terima kasih ${senderName} ✅ Bayar: Rp ${jumlah.toLocaleString()} | Total: Rp ${member.bayar.toLocaleString()}`}); } else { sock.sendMessage(chat, {text: '❌ Kamu belum join dulu ya'}); }
if(text === '.reset') { resetData(); sock.sendMessage(chat, {text: '🧹 DATA KAS DIBERSIHKAN! Semua total bayar sudah di reset ke 0\nSiap untuk bulan baru!'}); }
});
}
startBot();
