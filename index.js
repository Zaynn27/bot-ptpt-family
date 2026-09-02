const fs = require('fs'); // BUAT CEK UDAH LOGIN ATAU BELUM
if (!fs.existsSync('./auth')){ 
    fs.mkdirSync('./auth'); 
}
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const express = require('express');

// DATA 2 SERVER
let server1 = [];
let server2 = [];
for(let i = 1; i <= 20; i++) {
  server1.push({slot: i, nama: '', bayar: 0});
  server2.push({slot: i, nama: '', bayar: 0});
}

function resetData() {
  server1.forEach(d => { d.nama = ''; d.bayar = 0; });
  server2.forEach(d => { d.nama = ''; d.bayar = 0; });
}

function buatList(namaServer, data) {
  let slotKosong = data.filter(d => d.nama === '').length;
  let pesan = `*OPEN BOOST ${namaServer}* 🍀\n━━━━━━━━\n\n`;
  pesan += `*24 JAM 15k*\n> # *SLOT:* *-${slotKosong}* *SLOT KOSONG*\n`;
  pesan += `> *Time: Selasa Pukul 20.00 wib* \n> Full Cuaca | Free Script\n`;
  pesan += `*Daftar Player*\n`;
  data.forEach(d => { let nama = d.nama === ''? '-' : `*${d.nama}*`; pesan += `${d.slot}. ${nama}\n`; });
  return pesan;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ auth: state });
  sock.ev.on('creds.update', saveCreds);

  // KODE PAIRING BUAT RAILWAY - AUTO BACA DARI VARIABLE
  const pairingNumber = process.env.PAIRING_NUMBER;
  if (pairingNumber &&!fs.existsSync('./auth/creds.json')) {
    await delay(3000);
    const code = await sock.requestPairingCode(pairingNumber);
    console.log(`\n\n==============================`);
    console.log(` KODE PAIRING KAMU: ${code} `);
    console.log(` KODE INI GA GANTI2 SEBELUM DI SCAN`);
    console.log(`==============================\n\n`);
  }

  sock.ev.on('connection.update', (update) => {
    if(update.connection === 'open') console.log('Bot Open Boost Online!');
  });

  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0];
    if (!msg.message) return;
    const chat = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const senderName = msg.pushName || 'Member';

    if(!text.startsWith('!')) return;
    const args = text.split(' ');
    const command = args[0];

    if(command === '!list1') {
      let pesan = buatList('SERVER 1', server1);
      pesan += `\n*CARA ORDER:*\n1. Chat Admin cek slot\n2. Transfer via *QRIS DI PP GRUP*\n3. Kirim bukti + *Username Roblox*`;
      sock.sendMessage(chat, {text: pesan});
    }
    if(command === '!list2') {
      let pesan = buatList('SERVER 2', server2);
      pesan += `\n*CARA ORDER:*\n1. Chat Admin cek slot\n2. Transfer via *QRIS DI PP GRUP*\n3. Kirim bukti + *Username Roblox*`;
      sock.sendMessage(chat, {text: pesan});
    }

    if(command === '!join1') {
      const nama = args.slice(1).join(' ');
      const slotKosong = server1.find(d => d.nama === '');
      if(slotKosong) { slotKosong.nama = nama; sock.sendMessage(chat, {text: `✅ *${nama}* masuk SERVER 1 Slot ${slotKosong.slot}`}); }
      else { sock.sendMessage(chat, {text: '❌ SERVER 1 Penuh! 20/20'}); }
    }
    if(command === '!join2') {
      const nama = args.slice(1).join(' ');
      const slotKosong = server2.find(d => d.nama === '');
      if(slotKosong) { slotKosong.nama = nama; sock.sendMessage(chat, {text: `✅ *${nama}* masuk SERVER 2 Slot ${slotKosong.slot}`}); }
      else { sock.sendMessage(chat, {text: '❌ SERVER 2 Penuh! 20/20'}); }
    }

    if(command === '!bayar1') {
      const jumlah = parseInt(args[1]);
      const member = server1.find(d => d.nama.toLowerCase() === senderName.toLowerCase());
      if(member) { member.bayar += jumlah; sock.sendMessage(chat, {text: `✅ *${senderName}* Sudah Pay Rp ${jumlah.toLocaleString()} \nSERVER 1 Slot ${member.slot}`}); }
      else { sock.sendMessage(chat, {text: '❌ Kamu belum join SERVER 1 dulu. Ketik!join1 Namamu'}); }
    }
    if(command === '!bayar2') {
      const jumlah = parseInt(args[1]);
      const member = server2.find(d => d.nama.toLowerCase() === senderName.toLowerCase());
      if(member) { member.bayar += jumlah; sock.sendMessage(chat, {text: `✅ *${senderName}* Sudah Pay Rp ${jumlah.toLocaleString()} \nSERVER 2 Slot ${member.slot}`}); }
      else { sock.sendMessage(chat, {text: '❌ Kamu belum join SERVER 2 dulu. Ketik!join2 Namamu'}); }
    }

    if(command === '!reset') {
      resetData();
      sock.sendMessage(chat, {text: 'DATA DIBERSIHKAN!\nSERVER 1 & SERVER 2 sudah direset\nSiap open boost baru!'});
    }
  });
}
startBot();

// === KODE BUAT UPTIMEROBOT BIAR GA TIDUR ===
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Bot WA Aktif ✅')
})

app.listen(PORT, () => {
    console.log(`Server web jalan di port ${PORT}`)
})
// =============================================
