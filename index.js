const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const express = require('express');
const fs = require('fs');

// === 1. SERVER BUAT UPTIMEROBOT BIAR GA TIDUR ===
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Bot Open Boost Aktif ✅');
});
app.listen(PORT, () => {
    console.log(`Server web jalan di port ${PORT}`);
});
// =================================================

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
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  // PAIRING CODE
  if (!sock.authState.creds.registered) {
    const phoneNumber = "6283190521078"; // GANTI NOMOR KAMU
    await delay(3000);
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`\n\n==============================`);
    console.log(` 🍀 SALIN KODE INI: ${code} `);
    console.log(` 🍀 Tempel di WA > Perangkat Tertaut`);
    console.log(`==============================\n\n`);
  }

  // AUTO RECONNECT
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'open') console.log('Bot Open Boost Online! ✅');

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode!== DisconnectReason.loggedOut;
      console.log('Koneksi putus. Reconnect:', shouldReconnect);
      if(shouldReconnect) startBot();
    }
  });

  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0];
    if (!msg.message) return;
    const chat = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const senderName = msg.pushName || 'Member';

    if(!text.startsWith('!')) return;
    const args = text.trim().split(' ');
    const command = args[0].toLowerCase();

    try {
      //!list1 atau!list2
      if(command === '!list1') {
        let pesan = buatList('SERVER 1', server1);
        pesan += `\n*CARA ORDER:*\n1. Chat Admin cek slot\n2. Transfer via *QRIS DI PP GRUP*\n3. Kirim bukti + *Username Roblox*`;
        await sock.sendMessage(chat, {text: pesan});
      }
      if(command === '!list2') {
        let pesan = buatList('SERVER 2', server2);
        pesan += `\n*CARA ORDER:*\n1. Chat Admin cek slot\n2. Transfer via *QRIS DI PP GRUP*\n3. Kirim bukti + *Username Roblox*`;
        await sock.sendMessage(chat, {text: pesan});
      }

      //!join1 Nama atau!join2 Nama
      if(command === '!join1') {
        const nama = args.slice(1).join(' ');
        if(!nama) return sock.sendMessage(chat, {text: '❌ Format:!join1 Namamu'});
        const slotKosong = server1.find(d => d.nama === '');
        if(slotKosong) { slotKosong.nama = nama; await sock.sendMessage(chat, {text: `✅ *${nama}* masuk SERVER 1 Slot ${slotKosong.slot}`}); }
        else { await sock.sendMessage(chat, {text: '❌ SERVER 1 Penuh! 20/20'}); }
      }
      if(command === '!join2') {
        const nama = args.slice(1).join(' ');
        if(!nama) return sock.sendMessage(chat, {text: '❌ Format:!join2 Namamu'});
        const slotKosong = server2.find(d => d.nama === '');
        if(slotKosong) { slotKosong.nama = nama; await sock.sendMessage(chat, {text: `✅ *${nama}* masuk SERVER 2 Slot ${slotKosong.slot}`}); }
        else { await sock.sendMessage(chat, {text: '❌ SERVER 2 Penuh! 20/20'}); }
      }

      //!bayar1 15000 atau!bayar2 15000
      if(command === '!bayar1') {
        const jumlah = parseInt(args[1]);
        if(!jumlah) return sock.sendMessage(chat, {text: '❌ Format:!bayar1 15000'});
        const member = server1.find(d => d.nama.toLowerCase() === senderName.toLowerCase());
        if(member) { member.bayar += jumlah; await sock.sendMessage(chat, {text: `✅ *${senderName}* Sudah Pay Rp ${jumlah.toLocaleString('id-ID')} \nSERVER 1 Slot ${member.slot}`}); }
        else { await sock.sendMessage(chat, {text: '❌ Kamu belum join SERVER 1 dulu. Ketik!join1 Namamu'}); }
      }
      if(command === '!bayar2') {
        const jumlah = parseInt(args[1]);
        if(!jumlah) return sock.sendMessage(chat, {text: '❌ Format:!bayar2 15000'});
        const member = server2.find(d => d.nama.toLowerCase() === senderName.toLowerCase());
        if(member) { member.bayar += jumlah; await sock.sendMessage(chat, {text: `✅ *${senderName}* Sudah Pay Rp ${jumlah.toLocaleString('id-ID')} \nSERVER 2 Slot ${member.slot}`}); }
        else { await sock.sendMessage(chat, {text: '❌ Kamu belum join SERVER 2 dulu. Ketik!join2 Namamu'}); }
      }

      // RESET SEMUA
      if(command === '!reset') {
        resetData();
        await sock.sendMessage(chat, {text: 'DATA DIBERSIHKAN!\nSERVER 1 & SERVER 2 sudah direset\nSiap open boost baru!'});
      }
    } catch (e) {
      console.log(e)
    }
  });
}

startBot();
