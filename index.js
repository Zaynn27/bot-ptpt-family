const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

let dataKas = [];
for(let i = 1; i <= 20; i++) { dataKas.push({slot: i, nama: '', bayar: 0}); }
function resetData() { dataKas.forEach(d => { d.nama = ''; d.bayar = 0; }); }

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ auth: state }); // hapus printQRInTerminal
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (update) => { 
    const { connection, qr } = update; 
    if(qr) {
      console.log("QR BARU MUNCUL!");
      qrcode.generate(qr, {small: true}); 
    }
    if(connection === 'open') console.log('Bot Open Boost Online!'); 
  });

  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0]; 
    if (!msg.message) return; 
    const chat = msg.key.remoteJid; 
    const text = msg.message.conversation || ''; 
    const senderName = msg.pushName || 'Member';

    if(!text.startsWith('!')) return;
    const args = text.split(' ');
    const command = args[0];

    if(command === '!list') { 
      let slotKosong = dataKas.filter(d => d.nama === '').length;
      let pesan = `*OPEN BOOST SERVER X8* 🍀 \n ━━━━━━━━━━━━━━━━\n\n`;
      pesan += `🔥 *24 JAM 15k*\n`;
      pesan += `> # 👥 *SLOT:* *-${slotKosong}* 🍀 *SLOT*\n`;
      pesan += `> 🕒 *Time: Selasa Pukul 20.00 wib* \n`;
      pesan += `> ☁️ Full Cuaca | 📜 Free Script\n`;
      pesan += `> 🔗 Webhook | 🔄 Bisa Ganti Akun\n`;
      pesan += `👥 *Daftar Player*\n`;
      dataKas.forEach(d => { 
        let nama = d.nama === ''? '' : `*${d.nama}*`;
        pesan += `${d.slot}. ${nama}\n`; 
      }); 
      pesan += `\n🚀 *FULL GAS LANGSUNG!!*\n`;
      pesan += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      pesan += `📝 *CARA ORDER:*\n`;
      pesan += `1. Chat Admin cek ketersediaan slot.\n`;
      pesan += `2. Transfer via *QRIS YG ADA DI PP GRUP*\n`;
      pesan += `3. Kirim bukti *Transfer* dan *Username Roblox* Ke admin\n`;
      pesan += `4. *Sudah Pay* ✅`;
      sock.sendMessage(chat, {text: pesan}); 
    }
    if(command === '!join') { 
      const nama = args[1]; 
      const slotKosong = dataKas.find(d => d.nama === ''); 
      if(slotKosong) { 
        slotKosong.nama = nama; 
        sock.sendMessage(chat, {text: `✅ *${nama}* masuk Slot ${slotKosong.slot}`}); 
      } else { 
        sock.sendMessage(chat, {text: '❌ Slot penuh! 20/20 sudah terisi'}); 
      }
    }
    if(command === '!bayar') { 
      const jumlah = parseInt(args[1]); 
      const member = dataKas.find(d => d.nama.toLowerCase() === senderName.toLowerCase()); 
      if(member) { 
        member.bayar += jumlah; 
        sock.sendMessage(chat, {text: `✅ *${senderName}* Sudah Pay Rp ${jumlah.toLocaleString()} \nSlot ${member.slot} ✅`}); 
      } else { 
        sock.sendMessage(chat, {text: '❌ Kamu belum join dulu. Ketik!join Namamu'}); 
      }
    }
    if(command === '!reset') { 
      resetData(); 
      sock.sendMessage(chat, {text: '🧹 DATA DIBERSIHKAN!\n20 Slot sudah direset\nSiap open boost baru!'}); 
    }
  });
}
startBot();
