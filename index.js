const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let dataKas = [];
for(let i = 1; i <= 20; i++) {
  dataKas.push({slot: i, nama: '', bayar: 0});
}

function resetData() { 
  dataKas.forEach(d => { d.nama = ''; d.bayar = 0; }); 
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (update) => { 
    const { connection, qr } = update; 
    if(qr) qrcode.generate(qr, {small: true}); 
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
      let pesan = `*OPEN BOOST SERVER X8* 🍀 \n ━━━━━━━━━━━━━━━━\n\n`; // INI UDAH DIHAPUS SERVER 1
      pesan += `🔥 *24 JAM 15k*\n`;
      pesan += `> # 👥 *SLOT:* *-${slotKosong}* 🍀 *SLOT*\n`;
      pesan += `> 🕒 *Time: Selasa Pukul 20.00 wib* \n`;
      pesan += `> ☁️ Full Cuaca | 📜 Free Script\n`;
      pesan += `> 🔗 Webhook | 🔄 Bisa Ganti Akun\n\n\n`;
      pesan += `👥 *Daftar Player*\n`;
      
      dataKas.forEach(d => { 
        let nama = d.nama === ''? '' : `*${d.nama}*`;
        pesan += `${d.slot}. ${nama}\n`; 
      }); 
      
      pesan += `\n🚀 *FULL
