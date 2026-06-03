import { useState, useEffect, useRef } from "react";

const ADMIN_PASSWORD = "timecapsule2025";

const THEMES = [
  { id:"birthday",   emoji:"🎂", label:"Ulang Tahun",       bg:"#FFF7ED", accent:"#EA580C", particle:"🎈" },
  { id:"graduation", emoji:"🎓", label:"Kelulusan",         bg:"#F0FDF4", accent:"#16A34A", particle:"⭐" },
  { id:"achievement",emoji:"🏆", label:"Pencapaian",        bg:"#FEFCE8", accent:"#CA8A04", particle:"✨" },
  { id:"love",       emoji:"💌", label:"Cinta & Kasih",     bg:"#FFF1F2", accent:"#E11D48", particle:"❤️" },
  { id:"friendship", emoji:"🤝", label:"Persahabatan",      bg:"#FFF7ED", accent:"#D97706", particle:"🌻" },
  { id:"anniversary",emoji:"💍", label:"Anniversary",       bg:"#FDF4FF", accent:"#9333EA", particle:"💫" },
  { id:"newchapter", emoji:"🌟", label:"Babak Baru",        bg:"#EFF6FF", accent:"#2563EB", particle:"🌠" },
  { id:"surprise",   emoji:"🎉", label:"Kejutan",           bg:"#FAF5FF", accent:"#7C3AED", particle:"🎊" },
  { id:"lebaran",    emoji:"🌙", label:"Lebaran",           bg:"#FFFBEB", accent:"#B45309", particle:"🌙" },
  { id:"christmas",  emoji:"🎄", label:"Natal & Tahun Baru",bg:"#F0FDF4", accent:"#15803D", particle:"❄️" },
  { id:"newbaby",    emoji:"👶", label:"Kelahiran Bayi",    bg:"#FFF0F6", accent:"#DB2777", particle:"🍼" },
  { id:"promotion",  emoji:"💼", label:"Promosi Jabatan",   bg:"#EFF6FF", accent:"#1D4ED8", particle:"🚀" },
  { id:"farewell",   emoji:"✈️", label:"Perpisahan",        bg:"#F8FAFC", accent:"#475569", particle:"🌸" },
  { id:"motivation", emoji:"💪", label:"Semangat",          bg:"#FFF7ED", accent:"#C2410C", particle:"🔥" },
  { id:"newhouse",   emoji:"🏠", label:"Rumah Baru",        bg:"#F0FDF4", accent:"#065F46", particle:"🌿" },
  { id:"sympathy",   emoji:"🙏", label:"Ucapan Duka",       bg:"#F8FAFC", accent:"#475569", particle:"🕊️" },
];

const RECIPIENT_TYPES = [
  { id:"company",  label:"Karyawan / Tim",  icon:"🏢", desc:"HRD ke karyawan" },
  { id:"family",   label:"Keluarga",         icon:"👨‍👩‍👧", desc:"Orang tua, saudara" },
  { id:"friend",   label:"Sahabat",          icon:"🤝", desc:"Teman dekat" },
  { id:"partner",  label:"Orang Terkasih",   icon:"💑", desc:"Pasangan, kekasih" },
  { id:"personal", label:"Personal Lainnya", icon:"💌", desc:"Siapapun yang spesial" },
];

const TEMPLATES = {
  birthday:[
    {label:"Hangat & Tulus",  text:"Selamat ulang tahun! 🎂\n\nDi hari yang istimewa ini, aku ingin kamu tahu betapa berartinya kehadiranmu. Semoga tahun ini membawa kebahagiaan, kesehatan, dan semua yang kamu impikan. Selalu bersinar ya! 🌟"},
    {label:"Penuh Cinta",     text:"Happy birthday! 🎂💕\n\nAku bersyukur setiap hari bisa mengenalmu. Semoga hari ini dan seterusnya dipenuhi tawa dan kebahagiaan. Kamu layak mendapatkan semua yang terbaik! ❤️"},
    {label:"Profesional",     text:"Selamat ulang tahun!\n\nSemoga di usia baru ini semakin sukses, sehat, dan terus berkembang. Terima kasih sudah menjadi bagian dari perjalanan ini. Terus berkarya dan menginspirasi! 🎂"},
    {label:"Lucu & Santai",   text:"Hei! Selamat nambah tua ya~ 🎂😄\n\nTapi tenang, makin tua makin bijak katanya. Semoga tahun ini makin keren dan makin banyak rezeki. Happy birthday! 🎉"},
    {label:"Dari Perusahaan", text:"Atas nama seluruh keluarga besar perusahaan, kami mengucapkan Selamat Ulang Tahun! 🎂\n\nTerima kasih atas dedikasi dan kontribusi yang luar biasa. Semoga selalu sehat, bahagia, dan terus berkembang bersama kami."},
  ],
  graduation:[
    {label:"Bangga & Haru",  text:"Selamat atas kelulusanmu! 🎓\n\nPerjuanganmu selama ini tidak sia-sia. Setiap kerja keras, setiap malam begadang — semua terbayar hari ini. Kami sangat bangga denganmu.\n\nIni bukan akhir, ini baru permulaan petualangan luar biasamu! 🌟"},
    {label:"Motivatif",      text:"Selamat wisuda! 🎓\n\nGelar ini bukan sekadar kertas — ini bukti bahwa kamu mampu menyelesaikan apa yang kamu mulai. Dunia menunggumu. Pergi dan taklukkan!"},
    {label:"Dari Orang Tua", text:"Anakku yang membanggakan 🎓\n\nAir mata kebanggaan ini tak bisa aku sembunyikan. Terima kasih sudah membuat kami begitu bangga. Kini dunia ada di tanganmu — raih semua impianmu!"},
    {label:"Dari Sahabat",   text:"AKHIRNYA LULUS JUGA!! 🎓🎉\n\nKita sudah melewati begitu banyak hal bersama. Selamat ya! Sekarang saatnya kita taklukkan dunia bareng! 💪"},
  ],
  love:[
    {label:"Romantis",          text:"Untukmu yang selalu ada di hatiku 💌\n\nKata-kata terasa kurang untuk menggambarkan betapa berartinya kamu. Setiap hari bersamamu adalah anugerah yang aku syukuri.\n\nTerima kasih sudah menjadi bagian terbaik dari hidupku. ❤️"},
    {label:"Sederhana & Dalam", text:"Aku mungkin tidak selalu bisa mengungkapkan perasaanku dengan sempurna. Tapi satu hal yang pasti — kamu sangat berarti bagiku. Selalu. 💌"},
    {label:"Jarak Jauh",        text:"Jarak memang memisahkan kita secara fisik 💌\n\nTapi tidak ada jarak yang cukup jauh untuk memisahkan hati kita. Tunggu aku ya — kita akan segera bersama lagi. ❤️"},
    {label:"Puitis",            text:"Kalau hidupku adalah sebuah buku 💌\n\nMaka kamu adalah bab favoritku — yang selalu aku baca ulang dan tidak ingin aku akhiri. Terima kasih sudah hadir. ❤️"},
  ],
  friendship:[
    {label:"Hangat",   text:"Untuk sahabatku yang luar biasa 🤝\n\nTerima kasih sudah selalu ada di setiap momen — baik suka maupun duka. Persahabatan kita adalah salah satu hal terindah dalam hidupku. Semoga kita terus bersama selamanya! 🌻"},
    {label:"Lucu",     text:"Hei kamu! 🤝😄\n\nHidupku jauh lebih seru karena ada kamu. Terima kasih sudah jadi teman paling ajaib! Jangan ke mana-mana ya! 🌻"},
    {label:"Berpisah", text:"Sahabatku 🤝\n\nJarak boleh memisahkan kita, tapi persahabatan kita tidak akan pernah pudar. Miss you already! 🌻"},
  ],
  anniversary:[
    {label:"Romantis",     text:"Untuk cintaku di hari istimewa kita 💍\n\nBersamamu selalu terasa seperti pulang ke rumah. Terima kasih sudah memilihku setiap harinya. Sini terus bersamaku ya? ❤️"},
    {label:"Penuh Syukur", text:"Di hari anniversary kita 💍\n\nMemilihmu adalah keputusan terbaik yang pernah aku buat. Terima kasih atas semua cinta dan dukunganmu. ❤️"},
  ],
  lebaran:[
    {label:"Formal",          text:"Taqabbalallahu minna wa minkum 🌙\n\nSelamat Hari Raya Idul Fitri. Mohon maaf lahir dan batin. Semoga kita semua kembali fitri dan selalu dalam lindungan Allah SWT."},
    {label:"Hangat",          text:"Selamat Lebaran! 🌙✨\n\nMinal aidin wal faizin — mohon maaf lahir dan batin ya. Selamat berkumpul dengan keluarga tercinta!"},
    {label:"Dari Perusahaan", text:"Atas nama seluruh jajaran pimpinan dan karyawan 🌙\n\nKami mengucapkan Selamat Hari Raya Idul Fitri. Taqabbalallahu minna wa minkum. Mohon maaf lahir dan batin."},
  ],
  christmas:[
    {label:"Hangat",          text:"Selamat Natal dan Tahun Baru! 🎄\n\nSemoga musim perayaan ini membawa kehangatan dan kedamaian. Terima kasih sudah menjadi bagian dari tahun yang luar biasa ini!"},
    {label:"Dari Perusahaan", text:"Selamat Natal & Tahun Baru! 🎄\n\nTerima kasih atas kerja keras dan dedikasi sepanjang tahun ini. Semoga perayaan ini membawa sukacita bagi seluruh keluarga."},
  ],
  newbaby:[
    {label:"Hangat",         text:"Selamat atas kelahiran buah hati kalian! 👶\n\nSemoga si kecil tumbuh sehat, cerdas, dan menjadi kebanggaan keluarga. 🍼"},
    {label:"Untuk Orang Tua",text:"Selamat menjadi orang tua! 👶\n\nSemoga kalian diberikan kesabaran dan kebahagiaan dalam membesarkan si kecil. ❤️🍼"},
  ],
  promotion:[
    {label:"Profesional", text:"Selamat atas promosi jabatanmu! 💼\n\nIni adalah buah dari kerja keras dan dedikasi yang selama ini kamu tunjukkan. Terus ukir prestasi! 🚀"},
    {label:"Dari Tim",    text:"Selamat naik jabatan! 💼🎉\n\nNggak ada yang lebih layak dari kamu! Kami yakin kamu akan jadi pemimpin yang luar biasa. Selamat!"},
  ],
  farewell:[
    {label:"Haru",        text:"Perpisahan memang selalu berat ✈️\n\nTapi ini bukan selamat tinggal — ini 'sampai jumpa lagi'. Terima kasih atas semua kenangan indah! 🌸"},
    {label:"Profesional", text:"Terima kasih atas semua kontribusi dan dedikasimu ✈️\n\nBekerja bersamamu adalah pengalaman luar biasa. Semoga perjalanan baru membawa kesuksesan yang lebih besar!"},
  ],
  motivation:[
    {label:"Semangat",  text:"Hei kamu! 💪\n\nAku tahu jalannya tidak selalu mudah. Tapi kamu lebih kuat dari yang kamu kira. Jangan menyerah. You got this! 🔥"},
    {label:"Mendukung", text:"Aku percaya padamu 💪\n\nIngatlah — ada orang yang selalu mendoakan dan mendukungmu. Kamu tidak sendirian. Semangat! 🔥"},
  ],
  newhouse:[
    {label:"Hangat",   text:"Selamat atas rumah barumu! 🏠\n\nSemoga rumah ini menjadi tempat yang penuh cinta, tawa, dan kenangan indah. 🌿"},
    {label:"Keluarga", text:"Selamat punya rumah sendiri! 🏠\n\nSemoga rumah ini menjadi surga kecil bagi keluargamu. Selamat ya! 🌿❤️"},
  ],
  sympathy:[
    {label:"Tulus",   text:"Kami turut berduka cita yang sedalam-dalamnya 🙏\n\nSemoga almarhum/almarhumah ditempatkan di sisi terbaik-Nya, dan semoga keluarga diberikan ketabahan."},
    {label:"Singkat", text:"Kami turut berduka 🙏\n\nSemoga almarhum/almarhumah diterima di sisi Allah SWT, dan keluarga diberikan ketabahan. Kami selalu ada untukmu."},
  ],
  achievement:[
    {label:"Bangga", text:"Selamat atas pencapaianmu yang luar biasa! 🏆\n\nIni hasil dari kerja keras dan semangat yang tidak pernah padam. Teruslah melangkah lebih tinggi! ✨"},
    {label:"Tim",    text:"Luar biasa! Tidak ada yang tidak mungkin jika dikerjakan bersama 🏆\n\nPencapaian ini milik kita semua. Bangga jadi bagian dari kalian! ✨"},
  ],
  newchapter:[{label:"Penuh Harapan",text:"Selamat memasuki babak baru! 🌟\n\nSetiap akhir adalah awal dari sesuatu yang lebih indah. Melangkahlah dengan berani! 🌠"}],
  surprise:[{label:"Kejutan",text:"SURPRISE! 🎉\n\nKamu tidak menyangka kan? Kami sengaja menyiapkan ini khusus untukmu. You're special — jangan pernah lupa itu! 🎊"}],
};

const ALLOWED_IMG = ["image/jpeg","image/jpg","image/png","image/gif","image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DEMO_CAPSULES = [
  { id:1, from:"Abi Rachman", company:"PT. Maju Jaya Indonesia", to:"Budi Santoso", recipientType:"company", email:"budi@co.id", message:"Selamat ulang tahun, Budi! 🎂\n\nTerima kasih atas dedikasimu. Semoga semakin sukses!", theme:"birthday", openAt:new Date(Date.now()+86400000*3).toISOString(), images:[] },
  { id:2, from:"Abi Rachman", company:"PT. Maju Jaya Indonesia", to:"Siti Rahayu",  recipientType:"company", email:"siti@co.id",  message:"Selamat atas kelulusanmu, Siti! 🎓 Kami sangat bangga!", theme:"graduation", openAt:new Date(Date.now()-3600000).toISOString(), images:[] },
  { id:3, from:"Abi Rachman", company:"PT. Maju Jaya Indonesia", to:"Tim Sales",    recipientType:"company", email:"", message:"Selamat atas pencapaian target bulan ini! 🏆", theme:"achievement", openAt:new Date(Date.now()+86400000*7).toISOString(), images:[] },
];

/* HELPERS */
const fmtDate  = iso => new Date(iso).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
const fmtLong  = iso => new Date(iso).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})+" · "+new Date(iso).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
const initials = n   => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const isReady  = iso => new Date(iso)<=new Date();
const timeLeft = iso => { const d=new Date(iso)-new Date(); if(d<=0)return null; const dy=Math.floor(d/86400000),hr=Math.floor((d%86400000)/3600000); return dy>0?`${dy} hari`:hr>0?`${hr} jam`:"< 1 jam"; };
const getCD    = iso => { const d=Math.max(0,new Date(iso)-new Date()); return {d:Math.floor(d/86400000),h:Math.floor((d%86400000)/3600000),m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000)}; };
const themeOf  = c   => THEMES.find(t=>t.id===c.theme)||THEMES[0];
const rtOf     = c   => RECIPIENT_TYPES.find(r=>r.id===c.recipientType)||RECIPIENT_TYPES[0];
function validateFile(f){ if(!ALLOWED_IMG.includes(f.type)) return "Format tidak didukung. Hanya JPG, PNG, GIF, WEBP."; if(f.size>MAX_FILE_SIZE) return "Ukuran maks 5MB."; const ext=f.name.split(".").pop().toLowerCase(); if(["mp4","mov","avi","mkv","webm","flv"].includes(ext)) return "Upload video tidak diizinkan."; return null; }

/* ═══════════ CSS ═══════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Outfit',sans-serif;background:#F7F4EF;color:#0F0E0C;min-height:100vh;}

@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes popIn{from{opacity:0;transform:scale(.9);}to{opacity:1;transform:scale(1);}}
@keyframes bounceIn{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
@keyframes pulseLock{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.4);}50%{box-shadow:0 0 0 14px rgba(201,168,76,0);}}
@keyframes drift{0%{transform:translateY(100vh) rotate(0deg);opacity:0;}10%{opacity:.6;}90%{opacity:.4;}100%{transform:translateY(-80px) rotate(360deg);opacity:0;}}
@keyframes bobble{0%,100%{transform:scale(1) rotate(-3deg);}50%{transform:scale(1.1) rotate(3deg);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes heroFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}

/* HEADER */
.hdr{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:99;background:#0F0E0C;border-bottom:2px solid #C9A84C;}
.hdr-logo{font-family:'Cormorant Garamond',serif;font-size:19px;color:#C9A84C;letter-spacing:1.5px;cursor:pointer;flex-shrink:0;}
.hdr-logo span{color:#D6CFC7;font-style:italic;}
.nav{display:flex;gap:3px;flex-wrap:wrap;}
.nb{padding:5px 11px;border-radius:6px;border:1.5px solid transparent;background:transparent;color:rgba(201,168,76,.65);font-size:11px;font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s;white-space:nowrap;}
.nb:hover{color:#C9A84C;border-color:rgba(201,168,76,.35);}
.nb.on{background:#C9A84C;color:#0F0E0C;font-weight:700;border-color:#C9A84C;}
.npill{font-size:9px;font-weight:700;padding:1px 5px;border-radius:20px;margin-left:3px;background:#EF4444;color:#fff;}

/* LAYOUT */
.wrap{max-width:860px;margin:0 auto;padding:32px 16px 80px;}
.pg-title{font-family:'Cormorant Garamond',serif;font-size:25px;margin-bottom:4px;}
.pg-sub{font-size:12px;color:#6B6560;margin-bottom:20px;}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px;}
.stat{background:#fff;border-radius:11px;padding:13px 10px;text-align:center;border:1px solid rgba(0,0,0,.08);box-shadow:0 2px 8px rgba(0,0,0,.04);}
.stat-n{font-family:'Cormorant Garamond',serif;font-size:30px;color:#C9A84C;line-height:1;}
.stat-l{font-size:9px;color:#6B6560;text-transform:uppercase;letter-spacing:1px;margin-top:4px;}

/* CARD */
.card{background:#fff;border-radius:13px;padding:20px 22px;margin-bottom:13px;border:1px solid rgba(201,168,76,.18);box-shadow:0 3px 13px rgba(0,0,0,.06);position:relative;overflow:hidden;animation:fadeUp .4s ease both;}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#C9A84C,#8B3A2A,#C9A84C);}
.card-ttl{font-family:'Cormorant Garamond',serif;font-size:17px;margin-bottom:3px;}
.card-sub{font-size:11px;color:#6B6560;margin-bottom:14px;}

/* FORM */
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.fg{margin-bottom:12px;}
label{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#5A5249;margin-bottom:5px;}
input,textarea,select{width:100%;padding:9px 12px;border:1.5px solid #DDD8CF;border-radius:8px;font-family:'Outfit',sans-serif;font-size:13px;color:#0F0E0C;background:#F7F4EF;outline:none;transition:border-color .18s,background .18s;}
input:focus,textarea:focus,select:focus{border-color:#C9A84C;background:#fff;}
textarea{resize:vertical;min-height:90px;line-height:1.6;}
.charcount{text-align:right;font-size:11px;color:#9A9089;margin-top:3px;}

/* RECIPIENT TYPES */
.rtype-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;}
.rtype-opt{padding:10px 5px;border-radius:10px;border:2px solid rgba(0,0,0,.08);cursor:pointer;text-align:center;background:#fff;transition:all .18s;}
.rtype-opt:hover{border-color:#C9A84C;}
.rtype-opt.on{border-color:#C9A84C;background:#FBF3E0;}
.rtype-ico{font-size:18px;margin-bottom:3px;}
.rtype-lbl{font-size:9px;font-weight:600;}
.rtype-desc{font-size:9px;color:#6B6560;margin-top:1px;}

/* THEME GRID */
.theme-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.topt{padding:8px 5px;border-radius:9px;border:2px solid rgba(0,0,0,.08);cursor:pointer;text-align:center;background:#fff;transition:all .18s;}
.topt:hover{border-color:#C9A84C;}
.topt.on{border-color:#C9A84C;background:#FBF3E0;}
.topt-e{font-size:17px;margin-bottom:2px;}
.topt-l{font-size:9px;font-weight:500;}

/* MSG TABS */
.msg-tabs{display:flex;gap:5px;margin-bottom:11px;flex-wrap:wrap;}
.msg-tab{padding:6px 11px;border-radius:7px;border:2px solid rgba(0,0,0,.08);font-size:11px;font-weight:600;cursor:pointer;background:#fff;font-family:'Outfit',sans-serif;transition:all .18s;}
.msg-tab.on{border-color:#C9A84C;background:#FBF3E0;}

/* TEMPLATE LIST */
.tpl-list{display:flex;flex-direction:column;gap:6px;margin-bottom:9px;}
.tpl-item{padding:10px 12px;border-radius:9px;border:2px solid rgba(0,0,0,.08);cursor:pointer;transition:all .18s;background:#fff;}
.tpl-item:hover{border-color:#C9A84C;background:#FAFAF7;}
.tpl-item.on{border-color:#C9A84C;background:#FBF3E0;}
.tpl-lbl{font-size:10px;font-weight:700;color:#5A5249;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;}
.tpl-prev{font-size:11px;color:#6B6560;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

/* AI BOX */
.ai-box{background:linear-gradient(135deg,#1A0533,#2D1B69);border-radius:11px;padding:15px 16px;}
.ai-ttl{color:#DDD6FE;font-size:11px;font-weight:700;margin-bottom:9px;}
.ai-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px;}
.ai-inp{padding:8px 10px;border-radius:7px;border:1px solid rgba(167,139,250,.3);background:rgba(255,255,255,.08);color:#EDE9FE;font-size:12px;font-family:'Outfit',sans-serif;outline:none;width:100%;}
.ai-inp::placeholder{color:rgba(237,233,254,.4);}
.ai-inp:focus{border-color:rgba(167,139,250,.6);}
.ai-btn{width:100%;padding:9px;background:#7C3AED;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;}
.ai-btn:hover{background:#6D28D9;}
.ai-btn:disabled{opacity:.5;cursor:not-allowed;}
.ai-spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
.ai-result{background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;margin-top:8px;font-size:12px;color:#EDE9FE;line-height:1.65;white-space:pre-wrap;}
.ai-use{margin-top:6px;width:100%;padding:7px;background:rgba(255,255,255,.13);color:#DDD6FE;border:1px solid rgba(167,139,250,.35);border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;}

/* UPLOAD */
.upzone{border:2px dashed #DDD8CF;border-radius:10px;padding:14px;text-align:center;cursor:pointer;background:#F7F4EF;transition:all .18s;}
.upzone:hover{border-color:#C9A84C;background:#FBF8F2;}
.up-warn{font-size:10px;color:#9A3412;background:#FEF2E8;border:1px solid #FED7AA;border-radius:6px;padding:5px 9px;margin-top:6px;display:flex;align-items:center;gap:4px;}
.previews{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;}
.prev{position:relative;width:60px;height:60px;border-radius:8px;overflow:hidden;border:2px solid #E8D5A3;}
.prev img{width:100%;height:100%;object-fit:cover;}
.prev-rm{position:absolute;top:2px;right:2px;background:#8B3A2A;color:#fff;border:none;border-radius:50%;width:15px;height:15px;font-size:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.file-err{font-size:10px;color:#991B1B;background:#FEE2E2;border-radius:6px;padding:5px 9px;margin-top:6px;}
.dt-box{background:#0F0E0C;color:#C9A84C;border-radius:9px;padding:10px 14px;text-align:center;font-family:'Cormorant Garamond',serif;font-size:14px;margin-top:7px;}

/* BUTTONS */
.btn-main{width:100%;padding:11px;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;letter-spacing:.4px;transition:all .22s;display:flex;align-items:center;justify-content:center;gap:7px;background:#0F0E0C;color:#C9A84C;}
.btn-main:hover{background:#2C251E;transform:translateY(-1px);box-shadow:0 8px 20px rgba(0,0,0,.18);}
.btn-main:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-accent{background:#C9A84C;color:#0F0E0C;border:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;}
.btn-sm{padding:5px 10px;font-size:10px;border-radius:6px;border:none;cursor:pointer;font-family:'Outfit',sans-serif;font-weight:600;}

/* CAPSULE LIST */
.clist{display:flex;flex-direction:column;gap:8px;}
.citem{background:#fff;border-radius:11px;padding:14px 17px;border:1px solid rgba(0,0,0,.07);box-shadow:0 2px 8px rgba(0,0,0,.05);display:flex;align-items:center;gap:12px;transition:transform .18s,box-shadow .18s;animation:fadeUp .4s ease both;}
.citem:hover{transform:translateY(-2px);box-shadow:0 6px 15px rgba(0,0,0,.08);}
.cico{width:40px;height:40px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#E8D5A3,#C9A84C);display:flex;align-items:center;justify-content:center;font-size:16px;}
.cinf{flex:1;min-width:0;}
.c-to{font-size:9px;color:#6B6560;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;}
.c-name{font-family:'Cormorant Garamond',serif;font-size:15px;margin-bottom:2px;}
.c-prev{font-size:11px;color:#6B6560;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px;}
.cmeta{text-align:right;flex-shrink:0;}
.c-date{font-size:10px;font-weight:600;margin-bottom:3px;}
.c-tl{font-size:9px;color:#6B6560;}
.bdg{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:600;margin-top:4px;}
.b-wait{background:#FEF3C7;color:#92400E;}.b-ready{background:#D1FAE5;color:#065F46;}
.dot{width:4px;height:4px;border-radius:50%;}
.d-w{background:#F59E0B;}.d-r{background:#10B981;}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(15,14,12,.78);display:flex;align-items:center;justify-content:center;z-index:200;padding:14px;backdrop-filter:blur(4px);animation:fadeIn .2s ease;}
.modal{background:#fff;border-radius:13px;width:100%;overflow:hidden;animation:popIn .3s cubic-bezier(.34,1.56,.64,1);box-shadow:0 24px 70px rgba(0,0,0,.3);max-height:92vh;overflow-y:auto;}
.modal-hdr{background:#0F0E0C;padding:15px 20px;border-bottom:2px solid #C9A84C;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;}
.modal-ttl{font-family:'Cormorant Garamond',serif;color:#C9A84C;font-size:17px;}
.modal-close{background:transparent;border:1px solid rgba(201,168,76,.4);color:#C9A84C;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .18s;}
.modal-close:hover{background:#C9A84C;color:#0F0E0C;}
.modal-body{padding:18px 20px;}

/* NOTIF */
.ntabs{display:flex;gap:6px;margin-bottom:14px;}
.ntab{padding:6px 14px;border-radius:7px;border:2px solid rgba(0,0,0,.08);font-size:11px;font-weight:600;cursor:pointer;background:#fff;font-family:'Outfit',sans-serif;transition:all .18s;}
.ntab.on{border-color:#C9A84C;background:#FBF3E0;}
.email-shell{border:1px solid rgba(0,0,0,.1);border-radius:9px;overflow:hidden;}
.email-bar{background:#F1F3F4;padding:7px 12px;display:flex;align-items:center;gap:5px;}
.edot{width:9px;height:9px;border-radius:50%;}
.email-meta{background:#fff;padding:10px 14px;border-bottom:1px solid rgba(0,0,0,.07);}
.emrow{display:flex;gap:6px;font-size:10px;margin-bottom:3px;}
.emlbl{color:#6B6560;min-width:30px;font-weight:500;}
.email-hdr2{background:#0F0E0C;padding:18px;text-align:center;}
.email-logo2{font-family:'Cormorant Garamond',serif;font-size:17px;color:#C9A84C;letter-spacing:2px;}
.email-cnt{padding:16px 20px;background:#fff;}
.email-locked-box{background:#F7F4EF;border-radius:8px;padding:12px;text-align:center;margin:10px 0;}
.email-cta2{display:block;width:fit-content;margin:0 auto;background:#0F0E0C;color:#C9A84C;padding:9px 22px;border-radius:7px;font-size:11px;font-weight:700;text-decoration:none;font-family:'Outfit',sans-serif;}
.email-trust2{display:flex;align-items:center;gap:5px;font-size:10px;color:#166534;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:7px;padding:6px 10px;margin:10px 0;}
.email-footer2{background:#F1F0EE;padding:10px 18px;text-align:center;font-size:9px;color:#9A9089;line-height:1.8;}
.wa-shell{background:#ECE5DD;border-radius:9px;overflow:hidden;}
.wa-top{background:#128C7E;padding:9px 12px;display:flex;align-items:center;gap:8px;}
.wa-av{width:30px;height:30px;border-radius:50%;background:#C9A84C;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;color:#0F0E0C;flex-shrink:0;}
.wa-nm{color:#fff;font-weight:600;font-size:11px;}.wa-st{color:rgba(255,255,255,.7);font-size:9px;}
.wa-vf{margin-left:auto;background:rgba(255,255,255,.15);color:#fff;font-size:8px;font-weight:600;padding:2px 6px;border-radius:10px;}
.wa-body{padding:11px;min-height:100px;}
.wa-bubble{background:#fff;border-radius:0 9px 9px 9px;padding:8px 11px;max-width:88%;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:5px;}
.wa-txt{font-size:11px;line-height:1.6;color:#111;white-space:pre-wrap;}
.wa-time{font-size:9px;color:#9A9089;text-align:right;margin-top:2px;}
.wa-hint{background:rgba(0,0,0,.07);border-radius:7px;padding:7px 10px;margin-top:8px;font-size:10px;color:#555;text-align:center;line-height:1.6;}
.link-row{display:flex;align-items:center;gap:6px;background:#F7F4EF;border-radius:7px;padding:8px 11px;border:1px solid rgba(0,0,0,.08);margin-bottom:10px;}
.link-url{flex:1;font-size:11px;color:#6B6560;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.copy-btn{background:#0F0E0C;color:#fff;border:none;padding:5px 10px;border-radius:5px;font-size:10px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;flex-shrink:0;}
.copy-btn.ok{background:#166534;}

/* REPORT */
.report-opts{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
.report-opt{padding:10px 12px;border-radius:8px;border:2px solid rgba(0,0,0,.08);cursor:pointer;font-size:12px;background:#fff;transition:all .18s;display:flex;align-items:center;gap:8px;}
.report-opt:hover{border-color:#DC2626;background:#FEF2F2;}
.report-opt.on{border-color:#DC2626;background:#FEF2F2;font-weight:600;}

/* SUCCESS */
.suc-ov{position:fixed;inset:0;background:rgba(15,14,12,.85);display:flex;align-items:center;justify-content:center;z-index:300;animation:fadeIn .25s;}
.suc-box{background:#fff;border-radius:13px;padding:36px 32px;text-align:center;max-width:340px;width:90%;animation:popIn .35s cubic-bezier(.34,1.56,.64,1);}
.suc-ico{font-size:44px;margin-bottom:11px;}
.suc-ttl{font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:7px;}
.suc-sub{color:#6B6560;font-size:12px;line-height:1.65;margin-bottom:18px;}

/* RECEIVER PAGE */
.rcv-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:76px 16px;position:relative;z-index:1;}
.particles{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.particle{position:absolute;animation:drift linear infinite;opacity:0;}
.trust-bar{position:fixed;top:0;left:0;right:0;background:#0F0E0C;padding:8px 18px;display:flex;align-items:center;justify-content:center;gap:9px;z-index:100;border-bottom:1px solid rgba(201,168,76,.25);flex-wrap:wrap;}
.tb-txt{font-size:10px;color:#A8A29E;}.tb-txt strong{color:#D6CFC7;}
.tb-vf{display:inline-flex;align-items:center;gap:3px;background:#166534;color:#BBF7D0;font-size:9px;font-weight:600;padding:2px 7px;border-radius:20px;}
.tb-back{background:transparent;border:1px solid rgba(201,168,76,.3);color:#A8A29E;padding:3px 9px;border-radius:5px;font-size:10px;cursor:pointer;font-family:'Outfit',sans-serif;}
.tb-back:hover{color:#C9A84C;border-color:#C9A84C;}
.sndr-card{background:#fff;border-radius:11px;padding:10px 14px;display:flex;align-items:center;gap:10px;max-width:410px;width:100%;margin-bottom:13px;border:1px solid rgba(0,0,0,.08);box-shadow:0 2px 10px rgba(0,0,0,.06);animation:fadeUp .45s ease;}
.sndr-av{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#C9A84C,#8B5E1A);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:700;}
.sndr-name{font-size:12px;font-weight:600;}.sndr-co{font-size:10px;color:#6B6560;margin-top:1px;}
.sndr-ok{font-size:11px;color:#16A34A;font-weight:600;margin-left:auto;white-space:nowrap;}
.rcv-card{max-width:410px;width:100%;animation:fadeUp .45s .07s ease;}
.lk-wrap{background:#fff;border-radius:13px;overflow:hidden;box-shadow:0 8px 34px rgba(0,0,0,.1);border:1px solid rgba(0,0,0,.07);}
.lk-top{background:#0F0E0C;padding:26px 20px 22px;text-align:center;position:relative;}
.lk-top::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:20px;background:#fff;border-radius:20px 20px 0 0;}
.lk-ring{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.07);border:2px solid rgba(201,168,76,.45);display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 12px;animation:pulseLock 2.5s ease-in-out infinite;}
.lk-label{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;margin-bottom:4px;font-weight:600;}
.lk-name{font-family:'Cormorant Garamond',serif;font-size:24px;color:#fff;font-weight:600;}
.lk-body{padding:16px 18px 18px;}
.lk-msg{font-size:12px;color:#6B6560;text-align:center;line-height:1.7;margin-bottom:14px;}
.lk-msg strong{color:#0F0E0C;}
.cd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:12px;}
.cd-cell{background:#F7F4EF;border-radius:7px;padding:9px 3px;text-align:center;border:1px solid rgba(0,0,0,.06);}
.cd-n{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;line-height:1;}
.cd-l{font-size:8px;color:#6B6560;text-transform:uppercase;letter-spacing:1px;margin-top:3px;font-weight:500;}
.open-row{display:flex;align-items:center;justify-content:center;gap:5px;padding:8px 10px;background:#F7F4EF;border-radius:7px;font-size:10px;color:#6B6560;border:1px dashed rgba(0,0,0,.1);}
.open-row strong{color:#0F0E0C;}
.safe-row{margin-top:11px;padding:9px 11px;background:#F0FDF4;border-radius:7px;border:1px solid #BBF7D0;display:flex;gap:7px;align-items:flex-start;}
.safe-ico{font-size:11px;flex-shrink:0;margin-top:1px;}.safe-txt{font-size:10px;color:#166534;line-height:1.6;}
.safe-txt strong{font-weight:600;}
.op-wrap{background:#fff;border-radius:13px;overflow:hidden;box-shadow:0 8px 42px rgba(0,0,0,.12);border:1px solid rgba(0,0,0,.07);animation:popIn .5s cubic-bezier(.34,1.56,.64,1);}
.op-top{padding:22px 18px 16px;text-align:center;position:relative;}
.op-top::after{content:'';position:absolute;bottom:0;left:18px;right:18px;height:1px;background:rgba(0,0,0,.07);}
.op-emoji{font-size:42px;display:block;margin-bottom:9px;animation:bounceIn .5s .3s cubic-bezier(.34,1.56,.64,1) both;}
.op-to{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#6B6560;margin-bottom:3px;font-weight:500;}
.op-name{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600;line-height:1.15;}
.op-lbl{display:inline-block;margin-top:6px;font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;}
.op-body{padding:16px 18px 20px;}
.from-row{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(0,0,0,.07);}
.from-av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#8B5E1A);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;flex-shrink:0;}
.from-lbl{font-size:9px;color:#6B6560;text-transform:uppercase;letter-spacing:.8px;}.from-nm{font-size:12px;font-weight:600;}
.op-msg{font-family:'Cormorant Garamond',serif;font-size:16px;line-height:1.8;color:#2C2825;white-space:pre-wrap;animation:fadeUp .5s .4s ease both;}
.op-foot{margin-top:14px;padding-top:13px;border-top:1px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:10px;color:#6B6560;}
.share-b{background:#0F0E0C;color:#fff;border:none;padding:5px 12px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;}
.report-b{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;padding:5px 12px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;}
.opening-pg{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:32px;}
.opening-ico{font-size:60px;animation:bobble 1.2s ease-in-out infinite;margin-bottom:16px;}
.opening-ttl{font-family:'Cormorant Garamond',serif;font-size:22px;color:#0F0E0C;}
.opening-sub{font-size:11px;color:#6B6560;margin-top:5px;}
.empty{text-align:center;padding:44px 16px;color:#6B6560;}
.empty-ico{font-size:36px;margin-bottom:10px;}.empty-txt{font-size:12px;line-height:1.65;}

/* ABOUT PAGE */
.about-hero{background:linear-gradient(160deg,#0F0E0C 0%,#1E1A14 55%,#2C2010 100%);padding:64px 20px 56px;text-align:center;position:relative;overflow:hidden;}
.about-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% -20%,rgba(201,168,76,.18) 0%,transparent 65%);}
.hero-tag{display:inline-flex;align-items:center;gap:7px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.3);color:#C9A84C;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:30px;margin-bottom:22px;}
.hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,6vw,60px);color:#F7F4EF;line-height:1.1;margin-bottom:14px;}
.hero-h1 em{color:#C9A84C;font-style:italic;}
.hero-p{font-size:14px;color:#A8A29E;max-width:500px;margin:0 auto 28px;line-height:1.75;font-weight:300;}
.hero-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
.btn-hp{background:#C9A84C;color:#0F0E0C;border:none;padding:12px 26px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .22s;}
.btn-hp:hover{background:#DDB84E;transform:translateY(-2px);}
.btn-hg{background:transparent;color:#C9A84C;border:1.5px solid rgba(201,168,76,.4);padding:12px 26px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .22s;}
.btn-hg:hover{border-color:#C9A84C;background:rgba(201,168,76,.08);}
.hero-cap{font-size:70px;animation:heroFloat 3s ease-in-out infinite;display:block;margin:32px auto 0;}

.sec-lbl{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;text-align:center;margin-bottom:10px;}
.sec-ttl{font-family:'Cormorant Garamond',serif;font-size:32px;text-align:center;margin-bottom:8px;}
.sec-sub{font-size:13px;color:#6B6560;text-align:center;margin-bottom:36px;max-width:440px;margin-left:auto;margin-right:auto;line-height:1.7;}

.how-sec{padding:52px 20px;background:#F7F4EF;}
.how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:820px;margin:0 auto;}
.how-card{text-align:center;padding:20px 13px;background:#fff;border-radius:13px;border:1px solid rgba(0,0,0,.07);box-shadow:0 2px 10px rgba(0,0,0,.04);}
.how-num{width:32px;height:32px;border-radius:50%;background:#C9A84C;color:#0F0E0C;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 11px;}
.how-ico{font-size:24px;margin-bottom:8px;}
.how-ttl{font-weight:700;font-size:13px;margin-bottom:5px;}
.how-txt{font-size:11px;color:#6B6560;line-height:1.65;}

.feat-sec{padding:52px 20px;background:#0F0E0C;}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;max-width:820px;margin:0 auto;}
.feat-card{background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.14);border-radius:13px;padding:20px 16px;}
.feat-ico{font-size:26px;margin-bottom:10px;}
.feat-ttl{font-family:'Cormorant Garamond',serif;font-size:16px;color:#E8D5A3;margin-bottom:5px;}
.feat-txt{font-size:11px;color:#9A9089;line-height:1.7;}

.price-sec{padding:52px 20px;background:#F7F4EF;}
.price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:700px;margin:0 auto;}
.price-card{background:#fff;border-radius:14px;padding:24px 18px;border:2px solid rgba(0,0,0,.08);text-align:center;position:relative;box-shadow:0 3px 14px rgba(0,0,0,.06);}
.price-card.pop{border-color:#C9A84C;transform:scale(1.03);}
.pop-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:#C9A84C;color:#0F0E0C;font-size:9px;font-weight:700;padding:3px 12px;border-radius:20px;white-space:nowrap;}
.price-name{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6B6560;margin-bottom:8px;}
.price-amt{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:700;margin-bottom:3px;}
.price-per{font-size:11px;color:#9A9089;margin-bottom:16px;}
.price-feats{text-align:left;margin-bottom:18px;}
.price-feat{font-size:11px;color:#444;padding:4px 0;border-bottom:1px solid rgba(0,0,0,.05);display:flex;align-items:center;gap:6px;}
.price-feat:last-child{border:none;}

.trust-sec{padding:44px 20px;background:#1A1714;text-align:center;}
.trust-row{display:flex;align-items:center;justify-content:center;gap:26px;flex-wrap:wrap;margin-top:22px;}
.trust-item{display:flex;align-items:center;gap:7px;color:#9A9089;font-size:12px;}

.footer{background:#0F0E0C;border-top:1px solid rgba(201,168,76,.14);padding:28px 20px;text-align:center;}
.footer-logo{font-family:'Cormorant Garamond',serif;font-size:18px;color:#C9A84C;letter-spacing:1.5px;margin-bottom:7px;}
.footer-logo span{color:#D6CFC7;font-style:italic;}
.footer-txt{font-size:11px;color:#6B6560;line-height:1.7;margin-bottom:12px;}
.footer-links{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
.footer-link{font-size:11px;color:#9A9089;cursor:pointer;transition:color .18s;}
.footer-link:hover{color:#C9A84C;}

/* ADMIN */
.admin-login-pg{min-height:100vh;background:#111827;display:flex;align-items:center;justify-content:center;padding:20px;}
.login-card{background:#1F2937;border:1px solid #374151;border-radius:14px;padding:36px 30px;max-width:360px;width:100%;text-align:center;animation:popIn .4s cubic-bezier(.34,1.56,.64,1);}
.login-ico{font-size:40px;margin-bottom:14px;}
.login-ttl{font-family:'Cormorant Garamond',serif;font-size:22px;color:#F9FAFB;margin-bottom:5px;}
.login-sub{font-size:11px;color:#6B7280;margin-bottom:20px;line-height:1.6;}
.login-inp{width:100%;padding:10px 13px;border:1.5px solid #374151;border-radius:8px;background:#111827;color:#F9FAFB;font-size:13px;font-family:'Outfit',sans-serif;outline:none;margin-bottom:9px;transition:border-color .18s;}
.login-inp:focus{border-color:#6B7280;}
.login-btn{width:100%;padding:11px;background:#374151;color:#F9FAFB;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s;}
.login-btn:hover{background:#4B5563;}
.login-err{background:#450a0a;border:1px solid #991b1b;color:#fca5a5;font-size:11px;padding:8px 12px;border-radius:7px;margin-top:9px;animation:fadeIn .25s ease;}
.login-hint{margin-top:14px;font-size:10px;color:#4B5563;line-height:1.6;}
.adm-hdr{background:#111827;border-bottom:1px solid #374151;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;position:sticky;top:0;z-index:99;}
.adm-logo{font-family:'Cormorant Garamond',serif;font-size:15px;color:#9CA3AF;}
.adm-badge{background:#374151;color:#D1D5DB;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;}
.adm-logout{background:transparent;border:1px solid #374151;color:#6B7280;padding:4px 10px;border-radius:6px;font-size:10px;cursor:pointer;font-family:'Outfit',sans-serif;}
.adm-logout:hover{border-color:#6B7280;color:#9CA3AF;}
.adm-stat{background:#1F2937;border-radius:10px;padding:13px 10px;text-align:center;border:1px solid #374151;}
.adm-stat-n{font-family:'Cormorant Garamond',serif;font-size:28px;color:#C9A84C;line-height:1;}
.adm-stat-l{font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin-top:3px;}
.mod-item2{background:#1F2937;border-radius:10px;padding:13px 16px;border:1px solid #4B0082;display:flex;align-items:center;gap:12px;margin-bottom:8px;}
.mod-ttl2{font-size:12px;font-weight:600;color:#F9FAFB;margin-bottom:2px;}
.mod-sub2{font-size:10px;color:#6B7280;}
.btn-ok{padding:5px 12px;border-radius:6px;border:none;background:#064e3b;color:#6EE7B7;font-size:10px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;}
.btn-del{padding:5px 12px;border-radius:6px;border:none;background:#450a0a;color:#FCA5A5;font-size:10px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;}
.policy2{background:#1F2937;border:1px solid #374151;border-radius:9px;padding:14px 16px;font-size:11px;color:#9CA3AF;line-height:1.75;margin-top:16px;}
.policy2 strong{color:#D1D5DB;}
.nb-adm{color:rgba(156,163,175,.7);}
.nb-adm:hover{color:#9CA3AF;border-color:rgba(156,163,175,.3);}
.nb-adm.on{background:#374151;color:#F9FAFB;border-color:#374151;}

@media(max-width:600px){
  .hdr,.adm-hdr{padding:0 12px;height:48px;}
  .wrap{padding:18px 12px 70px;}
  .card{padding:16px 13px;}
  .frow,.rtype-grid,.ai-row{grid-template-columns:1fr;gap:0;}
  .rtype-grid{grid-template-columns:repeat(3,1fr);gap:6px;}
  .theme-grid{grid-template-columns:repeat(3,1fr);gap:5px;}
  .stats{grid-template-columns:repeat(2,1fr);}
  .how-grid,.feat-grid,.price-grid{grid-template-columns:1fr;}
  .price-card.pop{transform:none;}
  .citem{flex-direction:column;align-items:flex-start;}.cmeta{text-align:left;}
  .cd-n{font-size:20px;}.lk-body,.op-body{padding:13px 12px;}
  .login-card{padding:26px 18px;}
}
`;

/* ═══════════════════ PARTICLES ═══════════════════ */
function Particles({ emoji }) {
  const pts = Array.from({length:10},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*8,dur:6+Math.random()*8,size:13+Math.random()*10}));
  return (
    <div className="particles">
      {pts.map(p => (
        <div key={p.id} className="particle" style={{left:`${p.left}%`,fontSize:p.size,animationDelay:`${p.delay}s`,animationDuration:`${p.dur}s`}}>{emoji}</div>
      ))}
    </div>
  );
}

/* ═══════════════════ AI BOX ═══════════════════ */
function AIBox({ theme, recipientType, onUse }) {
  const [name,setName]=useState(""); const [sender,setSender]=useState(""); const [tone,setTone]=useState("hangat");
  const [loading,setLoading]=useState(false); const [result,setResult]=useState(""); const [err,setErr]=useState("");
  const th = THEMES.find(t=>t.id===theme)||THEMES[0];
  const rt = RECIPIENT_TYPES.find(r=>r.id===recipientType)||RECIPIENT_TYPES[0];

  async function gen() {
    if (!name) return;
    setLoading(true); setResult(""); setErr("");
    const prompt = `Buatkan pesan ucapan Time Capsule dalam bahasa Indonesia.\nTema: ${th.label}\nPenerima: ${name} (hubungan: ${rt.label})\nPengirim: ${sender||"seseorang yang peduli"}\nNada: ${tone}\nBuat pesan tulus 3-5 kalimat dengan 1-3 emoji. Tulis pesannya saja.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text||"";
      text ? setResult(text) : setErr("Gagal generate. Coba lagi.");
    } catch { setErr("Koneksi gagal."); }
    finally { setLoading(false); }
  }

  return (
    <div className="ai-box">
      <div className="ai-ttl">✨ Generate dengan AI <span style={{fontSize:9,opacity:.6,fontWeight:400}}>— powered by Claude</span></div>
      <div className="ai-row">
        <input className="ai-inp" placeholder="Nama penerima *" value={name} onChange={e=>setName(e.target.value)}/>
        <input className="ai-inp" placeholder="Nama pengirim" value={sender} onChange={e=>setSender(e.target.value)}/>
      </div>
      <select className="ai-inp" style={{width:"100%",marginBottom:8}} value={tone} onChange={e=>setTone(e.target.value)}>
        <option value="hangat">😊 Hangat & Tulus</option>
        <option value="romantis">💕 Romantis</option>
        <option value="profesional">💼 Profesional</option>
        <option value="lucu">😄 Lucu & Santai</option>
        <option value="puitis">🌹 Puitis</option>
        <option value="singkat">⚡ Singkat & Padat</option>
        <option value="haru">😢 Haru & Mendalam</option>
      </select>
      <button className="ai-btn" onClick={gen} disabled={loading||!name}>
        {loading ? <><span className="ai-spin"/> Sedang menulis…</> : "✨ Generate Pesan AI"}
      </button>
      {err && <div style={{marginTop:6,fontSize:11,color:"#FCA5A5",textAlign:"center"}}>{err}</div>}
      {result && (
        <div>
          <div className="ai-result">{result}</div>
          <button className="ai-use" onClick={()=>onUse(result)}>← Gunakan pesan ini</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ REPORT MODAL ═══════════════════ */
function ReportModal({ onClose }) {
  const [sel,setSel]=useState(null); const [sent,setSent]=useState(false);
  const reasons = [{id:"explicit",icon:"🔞",label:"Konten dewasa / pornografi"},{id:"violence",icon:"⚠️",label:"Konten kekerasan"},{id:"spam",icon:"🚫",label:"Spam / penipuan"},{id:"harass",icon:"😡",label:"Pelecehan / intimidasi"},{id:"other",icon:"📝",label:"Lainnya"}];

  if (sent) return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr"><div className="modal-ttl">✅ Laporan Terkirim</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body" style={{textAlign:"center",padding:"30px 20px"}}>
          <div style={{fontSize:40,marginBottom:11}}>🛡️</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,marginBottom:8}}>Terima Kasih!</div>
          <div style={{fontSize:12,color:"#6B6560",lineHeight:1.65,marginBottom:16}}>Laporan diterima dan akan ditinjau dalam 24 jam.</div>
          <button className="btn-accent" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr"><div className="modal-ttl">🚩 Laporkan Konten</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <p style={{fontSize:11,color:"#6B6560",marginBottom:11,lineHeight:1.65}}>Pilih alasan pelaporan. Tim kami meninjau dalam 24 jam.</p>
          <div className="report-opts">
            {reasons.map(r => (
              <div key={r.id} className={`report-opt ${sel===r.id?"on":""}`} onClick={()=>setSel(r.id)}>
                <span style={{fontSize:16}}>{r.icon}</span><span>{r.label}</span>
                {sel===r.id && <span style={{marginLeft:"auto",color:"#DC2626"}}>✓</span>}
              </div>
            ))}
          </div>
          <button className="btn-main" style={{background:sel?"#DC2626":"#ccc"}} disabled={!sel} onClick={()=>setSent(true)}>🚩 Kirim Laporan</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ NOTIF MODAL ═══════════════════ */
function NotifModal({ capsule, onClose }) {
  const [tab,setTab]=useState("email");
  const theme = themeOf(capsule);
  const waText = `Halo *${capsule.to}*! 👋\n\n*${capsule.from}* ${capsule.company?`dari *${capsule.company}* `:""}mengirimkan *Time Capsule* spesial untukmu! 📦\n\nTerbuka pada:\n📅 *${fmtLong(capsule.openAt)}*\n\n🔗 https://timecapsule.id/untuk/${capsule.to.split(" ")[0].toLowerCase()}-${capsule.id}\n\n_Pesan resmi via TimeCapsule._`;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr"><div className="modal-ttl">📬 Preview Notifikasi</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="ntabs">
            <button className={`ntab ${tab==="email"?"on":""}`} onClick={()=>setTab("email")}>📧 Email</button>
            <button className={`ntab ${tab==="wa"?"on":""}`} onClick={()=>setTab("wa")}>💬 WhatsApp</button>
          </div>
          {tab==="email" && (
            <div className="email-shell">
              <div className="email-bar"><div className="edot" style={{background:"#FF5F57"}}/><div className="edot" style={{background:"#FEBC2E"}}/><div className="edot" style={{background:"#28C840"}}/><span style={{marginLeft:7,fontSize:10,color:"#666"}}>Kotak Masuk</span></div>
              <div className="email-meta">
                <div className="emrow"><span className="emlbl">Dari:</span><span>noreply@timecapsule.id</span></div>
                <div className="emrow"><span className="emlbl">Ke:</span><span>{capsule.email||capsule.to}</span></div>
                <div className="emrow"><span className="emlbl">Hal:</span><span style={{fontWeight:600}}>📦 Ada Capsule dari {capsule.from}</span></div>
              </div>
              <div>
                <div className="email-hdr2"><div className="email-logo2">Time<span style={{color:"#D6CFC7",fontStyle:"italic"}}>Capsule</span></div></div>
                <div className="email-cnt">
                  <span style={{display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:10,fontWeight:600,background:theme.accent+"18",color:theme.accent,marginBottom:10}}>{theme.emoji} {theme.label}</span>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,marginBottom:8,lineHeight:1.35}}>Halo, {capsule.to}! 👋<br/>Ada pesan istimewa untukmu.</div>
                  <div style={{fontSize:11,color:"#444",lineHeight:1.7,marginBottom:10}}><strong>{capsule.from}</strong>{capsule.company?` dari ${capsule.company}`:""} menyiapkan sesuatu spesial untukmu.</div>
                  <div className="email-locked-box"><div style={{fontSize:22,marginBottom:4}}>🔒</div><div style={{fontSize:10,color:"#6B6560"}}>Terbuka pada</div><div style={{fontSize:12,fontWeight:700,marginTop:3}}>{fmtLong(capsule.openAt)}</div></div>
                  <div style={{textAlign:"center",marginBottom:11}}><span className="email-cta2">🎁 Lihat Capsuleku</span></div>
                  <div className="email-trust2">🛡️ Dikirim resmi via TimeCapsule. Tidak perlu login.</div>
                </div>
                <div className="email-footer2"><div>© 2025 TimeCapsule</div><div>timecapsule.id</div></div>
              </div>
            </div>
          )}
          {tab==="wa" && (
            <div className="wa-shell">
              <div className="wa-top"><div className="wa-av">TC</div><div><div className="wa-nm">TimeCapsule Official</div><div className="wa-st">Business Account</div></div><span className="wa-vf">✓ Resmi</span></div>
              <div className="wa-body">
                <div className="wa-bubble"><div className="wa-txt">{waText}</div><div className="wa-time">09:00 ✓✓</div></div>
                <div className="wa-hint">⚠️ Centang hijau resmi memerlukan <strong>WhatsApp Business API</strong> (Fonnte/Wablas).</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ LINK MODAL ═══════════════════ */
function LinkModal({ capsule, onClose, onPreview, onNotif }) {
  const [copied,setCopied]=useState(false);
  const link = `timecapsule.id/untuk/${capsule.to.split(" ")[0].toLowerCase()}-${capsule.id}`;
  function copy(){ setCopied(true); setTimeout(()=>setCopied(false),2000); }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr"><div className="modal-ttl">⚙ Kelola Capsule</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <label style={{marginBottom:6}}>Link Penerima</label>
          <div className="link-row"><span className="link-url">🔗 {link}</span><button className={`copy-btn ${copied?"ok":""}`} onClick={copy}>{copied?"✓ Tersalin":"Salin"}</button></div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            <button className="btn-main" onClick={onPreview}>👁️ Preview Tampilan Penerima</button>
            <button className="btn-main" style={{background:"#0F4C75"}} onClick={onNotif}>📬 Preview Notifikasi Email & WA</button>
          </div>
          <p style={{marginTop:10,fontSize:10,color:"#6B6560",textAlign:"center"}}>Penerima tidak perlu login. Tidak ada data yang diminta.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ RECEIVER PAGE ═══════════════════ */
function ReceiverPage({ capsule, onBack }) {
  const [phase,setPhase]=useState(isReady(capsule.openAt)?"ready":"locked");
  const [cd,setCd]=useState(getCD(capsule.openAt));
  const [showReport,setShowReport]=useState(false);
  const theme = themeOf(capsule);

  useEffect(()=>{ const t=setInterval(()=>setCd(getCD(capsule.openAt)),1000); return()=>clearInterval(t); },[capsule.openAt]);
  function doOpen(){ setPhase("opening"); setTimeout(()=>setPhase("opened"),2200); }

  if (phase==="opening") return (
    <div style={{minHeight:"100vh",background:theme.bg}}>
      <div className="opening-pg"><div className="opening-ico">📦</div><div className="opening-ttl">Membuka capsulemu…</div><div className="opening-sub">Sebentar lagi, sesuatu istimewa menantimu 🌟</div></div>
    </div>
  );

  const senderLabel = capsule.company || rtOf(capsule).label;

  return (
    <div style={{background:phase==="opened"?theme.bg:"#F7F4EF",minHeight:"100vh",transition:"background .6s"}}>
      {phase==="opened" && <Particles emoji={theme.particle}/>}
      {showReport && <ReportModal onClose={()=>setShowReport(false)}/>}
      <div className="trust-bar">
        <span>🔐</span>
        <span className="tb-txt">Dikirim resmi oleh <strong>{senderLabel}</strong> via TimeCapsule</span>
        <span className="tb-vf">✓ Terverifikasi</span>
        <button className="tb-back" onClick={onBack}>← Kembali</button>
      </div>
      <div className="rcv-page">
        <div className="sndr-card">
          <div className="sndr-av">{initials(capsule.from)}</div>
          <div><div className="sndr-name">{capsule.from}</div><div className="sndr-co">{senderLabel}</div></div>
          <div className="sndr-ok">✅ Resmi</div>
        </div>
        <div className="rcv-card">
          {phase==="locked" && (
            <div className="lk-wrap">
              <div className="lk-top"><div className="lk-ring">🔒</div><div className="lk-label">Ada sesuatu untukmu</div><div className="lk-name">{capsule.to}</div></div>
              <div className="lk-body">
                <p className="lk-msg"><strong>{capsule.from}</strong> menyimpan pesan istimewa untukmu. Sabar ya 🌟</p>
                <div className="cd-grid">{[{v:cd.d,l:"Hari"},{v:cd.h,l:"Jam"},{v:cd.m,l:"Menit"},{v:cd.s,l:"Detik"}].map(({v,l})=><div key={l} className="cd-cell"><div className="cd-n">{String(v).padStart(2,"0")}</div><div className="cd-l">{l}</div></div>)}</div>
                <div className="open-row">📅 Terbuka pada <strong>{fmtLong(capsule.openAt)}</strong></div>
                <div className="safe-row"><div className="safe-ico">🛡️</div><div className="safe-txt"><strong>Ini bukan spam.</strong> Pesan resmi via TimeCapsule. Tidak ada data yang diminta.</div></div>
                <div style={{marginTop:10,textAlign:"center"}}><button className="report-b" onClick={()=>setShowReport(true)}>🚩 Laporkan Konten</button></div>
              </div>
            </div>
          )}
          {phase==="ready" && (
            <div className="lk-wrap">
              <div className="lk-top" style={{background:"linear-gradient(135deg,#166534,#14532D)"}}>
                <div className="lk-ring" style={{borderColor:"rgba(187,247,208,.5)"}}>🎁</div>
                <div className="lk-label" style={{color:"#BBF7D0"}}>Capsulemu siap!</div>
                <div className="lk-name">{capsule.to}</div>
              </div>
              <div className="lk-body">
                <p className="lk-msg"><strong>{capsule.from}</strong> punya pesan spesial untukmu!</p>
                <button className="btn-main" style={{background:"#166534",color:"#fff"}} onClick={doOpen}>🎁 Buka Capsule Sekarang</button>
                <div className="safe-row" style={{marginTop:10}}><div className="safe-ico">🛡️</div><div className="safe-txt"><strong>Aman 100%.</strong> Tidak ada data yang diminta.</div></div>
                <div style={{marginTop:10,textAlign:"center"}}><button className="report-b" onClick={()=>setShowReport(true)}>🚩 Laporkan Konten</button></div>
              </div>
            </div>
          )}
          {phase==="opened" && (
            <div className="op-wrap">
              <div className="op-top" style={{background:theme.bg}}>
                <span className="op-emoji">{theme.emoji}</span>
                <div className="op-to">Untuk</div><div className="op-name">{capsule.to}</div>
                <span className="op-lbl" style={{background:theme.accent+"20",color:theme.accent}}>{theme.label}</span>
              </div>
              <div className="op-body">
                <div className="from-row">
                  <div className="from-av">{initials(capsule.from)}</div>
                  <div><div className="from-lbl">Pesan dari</div><div className="from-nm">{capsule.from}{capsule.company?` · ${capsule.company}`:""}</div></div>
                </div>
                <div className="op-msg">{capsule.message}</div>
                {capsule.images?.length>0 && <div style={{marginTop:10}}>{capsule.images.map((s,i)=><img key={i} src={s} alt="" style={{width:"100%",borderRadius:8,marginTop:6,objectFit:"cover"}}/>)}</div>}
                <div className="op-foot">
                  <span>Dikirim via TimeCapsule ✦</span>
                  <div style={{display:"flex",gap:6}}><button className="share-b">🔗 Bagikan</button><button className="report-b" onClick={()=>setShowReport(true)}>🚩 Laporkan</button></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ CREATE FORM ═══════════════════ */
function CreateForm({ setCapsules, onSuccess }) {
  const [form,setForm]=useState({to:"",email:"",from:"",company:"",message:"",openAt:"",theme:"birthday",recipientType:"personal",msgMode:"tulis"});
  const [images,setImages]=useState([]); const [fileErr,setFileErr]=useState(""); const [selTpl,setSelTpl]=useState(null);
  const fileRef = useRef();
  const fc = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const canSend = form.to && form.message && form.openAt;
  const tpls = TEMPLATES[form.theme] || [];

  function handleUpload(e) {
    setFileErr("");
    Array.from(e.target.files).forEach(f=>{ const err=validateFile(f); if(err){setFileErr(err);return;} const r=new FileReader(); r.onload=ev=>setImages(p=>[...p,{url:ev.target.result}]); r.readAsDataURL(f); });
    e.target.value="";
  }

  function send() {
    if (!canSend) return;
    const c = { id:Date.now(), from:form.from||"Pengirim", company:form.company, to:form.to, email:form.email, message:form.message, theme:form.theme, openAt:form.openAt, images:images.map(i=>i.url), recipientType:form.recipientType };
    setCapsules(p=>[c,...p]); setForm(f=>({...f,to:"",email:"",message:"",openAt:""})); setImages([]); setSelTpl(null); onSuccess();
  }

  return (
    <div className="wrap">
      <div className="pg-title">Buat Capsule Baru</div>
      <div className="pg-sub">Tulis pesan yang akan dikenang selamanya</div>

      <div className="card">
        <div className="card-ttl">👥 Untuk siapa?</div><div className="card-sub">Pilih kategori penerima</div>
        <div className="rtype-grid">
          {RECIPIENT_TYPES.map(r=><div key={r.id} className={`rtype-opt ${form.recipientType===r.id?"on":""}`} onClick={()=>setForm(f=>({...f,recipientType:r.id}))}><div className="rtype-ico">{r.icon}</div><div className="rtype-lbl">{r.label}</div><div className="rtype-desc">{r.desc}</div></div>)}
        </div>
      </div>

      <div className="card" style={{animationDelay:".04s"}}>
        <div className="card-ttl">👤 Pengirim & Penerima</div><div className="card-sub">Isi data pengirim dan penerima</div>
        <div className="frow">
          <div className="fg"><label>Namamu</label><input name="from" value={form.from} onChange={fc} placeholder="Nama kamu"/></div>
          {form.recipientType==="company"
            ? <div className="fg"><label>Nama Perusahaan</label><input name="company" value={form.company} onChange={fc} placeholder="PT. Nama Perusahaan"/></div>
            : <div className="fg"><label>Hubungan</label><select name="company" value={form.company} onChange={fc}><option value="">— Pilih —</option><option>Ayah / Ibu</option><option>Kakak / Adik</option><option>Sahabat</option><option>Pasangan</option><option>Teman</option><option>Kerabat</option></select></div>}
        </div>
        <div className="frow">
          <div className="fg"><label>Nama Penerima *</label><input name="to" value={form.to} onChange={fc} placeholder="Nama penerima"/></div>
          <div className="fg"><label>Email / No. WA</label><input name="email" value={form.email} onChange={fc} placeholder="Email atau WA"/></div>
        </div>
      </div>

      <div className="card" style={{animationDelay:".08s"}}>
        <div className="card-ttl">🎨 Tema — {THEMES.length} pilihan</div><div className="card-sub">Pilih tema sesuai momen</div>
        <div className="theme-grid">
          {THEMES.map(t=><div key={t.id} className={`topt ${form.theme===t.id?"on":""}`} onClick={()=>{setForm(f=>({...f,theme:t.id}));setSelTpl(null);}}><div className="topt-e">{t.emoji}</div><div className="topt-l">{t.label}</div></div>)}
        </div>
      </div>

      <div className="card" style={{animationDelay:".12s"}}>
        <div className="card-ttl">✍️ Pesan</div><div className="card-sub">Pilih cara membuat pesanmu</div>
        <div className="msg-tabs">
          <button className={`msg-tab ${form.msgMode==="tulis"?"on":""}`} onClick={()=>setForm(f=>({...f,msgMode:"tulis"}))}>✏️ Tulis Sendiri</button>
          <button className={`msg-tab ${form.msgMode==="template"?"on":""}`} onClick={()=>setForm(f=>({...f,msgMode:"template"}))}>📋 Template ({tpls.length})</button>
          <button className={`msg-tab ${form.msgMode==="ai"?"on":""}`} onClick={()=>setForm(f=>({...f,msgMode:"ai"}))}>✨ Generate AI</button>
        </div>

        {form.msgMode==="template" && (
          <div>
            {tpls.length>0
              ? <div className="tpl-list">{tpls.map((t,i)=><div key={i} className={`tpl-item ${selTpl===i?"on":""}`} onClick={()=>{setSelTpl(i);setForm(f=>({...f,message:t.text}));}}><div className="tpl-lbl">{t.label}</div><div className="tpl-prev">{t.text}</div></div>)}</div>
              : <div style={{fontSize:12,color:"#9A9089",textAlign:"center",padding:"12px 0"}}>Belum ada template untuk tema ini.</div>}
            {selTpl!==null && <div className="fg" style={{marginTop:8}}><label>Edit (opsional)</label><textarea name="message" value={form.message} onChange={fc} maxLength={1000}/><div className="charcount">{form.message.length}/1000</div></div>}
          </div>
        )}
        {form.msgMode==="ai" && <AIBox theme={form.theme} recipientType={form.recipientType} onUse={txt=>setForm(f=>({...f,message:txt,msgMode:"tulis"}))}/>}
        {form.msgMode==="tulis" && <div className="fg" style={{marginBottom:0}}><label>Isi Pesan *</label><textarea name="message" value={form.message} onChange={fc} placeholder="Tulis pesan tulus dari hatimu…" maxLength={1000}/><div className="charcount">{form.message.length}/1000</div></div>}

        <div className="fg" style={{marginTop:13,marginBottom:0}}>
          <label>Lampiran Gambar (opsional)</label>
          <div className="upzone" onClick={()=>fileRef.current.click()}><div style={{fontSize:20,marginBottom:4}}>🖼️</div><div style={{fontSize:11,color:"#6B6560"}}>Klik upload · <strong style={{color:"#C9A84C"}}>JPG, PNG, GIF, WEBP</strong> · max 5MB</div></div>
          <div className="up-warn">🚫 Upload video tidak diizinkan. Hanya gambar.</div>
          {fileErr && <div className="file-err">⚠️ {fileErr}</div>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple style={{display:"none"}} onChange={handleUpload}/>
          {images.length>0 && <div className="previews">{images.map((img,i)=><div key={i} className="prev"><img src={img.url} alt=""/><button className="prev-rm" onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))}>✕</button></div>)}</div>}
        </div>
      </div>

      <div className="card" style={{animationDelay:".16s"}}>
        <div className="card-ttl">⏰ Waktu Buka</div><div className="card-sub">Capsule hanya bisa dibuka setelah waktu ini</div>
        <div className="fg"><label>Tanggal & Jam *</label><input type="datetime-local" name="openAt" value={form.openAt} onChange={fc} min={new Date().toISOString().slice(0,16)}/></div>
        {form.openAt && <div className="dt-box">🔒 Terkunci hingga {fmtLong(form.openAt)}</div>}
      </div>

      <button className="btn-main" onClick={send} disabled={!canSend}>📦 Kirim Capsule {themeOf(form).emoji}</button>
    </div>
  );
}

/* ═══════════════════ ABOUT PAGE ═══════════════════ */
function AboutPage({ onStart }) {
  return (
    <div>
      <div className="about-hero">
        <div style={{position:"relative",zIndex:1}}>
          <div className="hero-tag">✦ Platform Pesan Istimewa</div>
          <h1 className="hero-h1">Pesan yang Terbuka<br/>di <em>Momen yang Tepat</em></h1>
          <p className="hero-p">TimeCapsule memungkinkan siapa saja mengirimkan ucapan yang terkunci waktu — untuk keluarga, sahabat, pasangan, atau karyawan. Dibuka saat momennya paling berarti.</p>
          <div className="hero-btns">
            <button className="btn-hp" onClick={onStart}>Mulai Gratis →</button>
          </div>
          <span className="hero-cap">📦</span>
        </div>
      </div>

      <div className="how-sec" id="how">
        <div className="sec-lbl">Cara Kerja</div>
        <div className="sec-ttl">Semudah 4 Langkah</div>
        <div className="sec-sub">Tidak perlu keahlian teknis. Cukup tulis, tentukan waktu, dan kirim.</div>
        <div className="how-grid">
          {[{n:1,ico:"✍️",ttl:"Tulis Pesan",txt:"Tulis sendiri, pilih template, atau biarkan AI yang membuatkan pesanmu."},{n:2,ico:"🎨",ttl:"Pilih Tema",txt:"16 tema tersedia — ulang tahun, kelulusan, lebaran, anniversary, dan banyak lagi."},{n:3,ico:"⏰",ttl:"Tentukan Waktu",txt:"Tentukan kapan capsule boleh dibuka. Bisa besok, bulan depan, atau tahun depan."},{n:4,ico:"🎁",ttl:"Penerima Membuka",txt:"Penerima mendapat link. Saat waktunya tiba — pesan terbuka dengan animasi berkesan."}].map((s,i)=>(
            <div key={s.n} className="how-card" style={{animationDelay:`${i*.1}s`}}>
              <div className="how-num">{s.n}</div><div className="how-ico">{s.ico}</div><div className="how-ttl">{s.ttl}</div><div className="how-txt">{s.txt}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="feat-sec">
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div className="sec-lbl" style={{color:"rgba(201,168,76,.7)"}}>Fitur Unggulan</div>
          <div className="sec-ttl" style={{color:"#F7F4EF",marginBottom:8}}>Dirancang untuk Semua</div>
          <div className="sec-sub" style={{color:"#6B6560",marginBottom:32}}>Dari ucapan personal hingga kebutuhan perusahaan.</div>
          <div className="feat-grid">
            {[{ico:"🤖",ttl:"Generate AI",txt:"Biarkan AI Claude membuatkan pesan yang tulus dan berkesan — dalam hitungan detik."},{ico:"📋",ttl:"35+ Template",txt:"Template siap pakai untuk 16 tema berbeda. Pilih, edit, kirim."},{ico:"🔒",ttl:"Kunci Waktu",txt:"Pesan tidak bisa dibuka sebelum waktunya. Sistem kunci otomatis menjaga kejutan."},{ico:"🛡️",ttl:"Aman & Terpercaya",txt:"Badge verifikasi, nama pengirim jelas, tanpa login untuk penerima."},{ico:"🏢",ttl:"Fitur Perusahaan",txt:"HRD kirim ucapan ke seluruh karyawan sekaligus. Bangun kedekatan tim."},{ico:"📬",ttl:"Notifikasi Email & WA",txt:"Penerima otomatis dinotifikasi. Saat capsule siap — mereka langsung tahu."},{ico:"🎨",ttl:"16 Tema Momen",txt:"Dari ulang tahun hingga ucapan duka. Setiap momen punya temanya."},{ico:"🖼️",ttl:"Lampiran Gambar",txt:"Tambahkan foto kenangan. Gambar terbuka bersama pesan utama."},{ico:"🚩",ttl:"Moderasi Konten",txt:"Sistem pelaporan aktif 24/7. Upload video diblokir penuh."}].map((f,i)=>(
              <div key={i} className="feat-card"><div className="feat-ico">{f.ico}</div><div className="feat-ttl">{f.ttl}</div><div className="feat-txt">{f.txt}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="price-sec">
        <div className="sec-lbl">Harga</div>
        <div className="sec-ttl">Mulai Gratis, Tumbuh Bersama</div>
        <div className="sec-sub" style={{marginBottom:32}}>Pilih paket yang sesuai kebutuhanmu.</div>
        <div className="price-grid">
          {[
            {name:"Free",amt:"Gratis",per:"Selamanya",feats:["3 capsule/bulan","Teks saja","Template dasar","Email notifikasi"],pop:false},
            {name:"Personal Pro",amt:"Rp 29rb",per:"per bulan",feats:["Unlimited capsule","Teks + Gambar","Semua template & tema","AI Generate pesan","Email & WA notifikasi","Link personal"],pop:true},
            {name:"Business",amt:"Rp 199rb",per:"per bulan",feats:["Unlimited untuk tim","Kirim massal (CSV)","Branding perusahaan","Dashboard analytics","Prioritas dukungan"],pop:false},
          ].map((p,i)=>(
            <div key={i} className={`price-card ${p.pop?"pop":""}`}>
              {p.pop && <div className="pop-badge">⭐ Paling Populer</div>}
              <div className="price-name">{p.name}</div>
              <div className="price-amt">{p.amt}</div>
              <div className="price-per">{p.per}</div>
              <div className="price-feats">{p.feats.map((f,j)=><div key={j} className="price-feat"><span style={{color:"#16A34A",fontWeight:700}}>✓</span>{f}</div>)}</div>
              <button className="btn-main" style={{background:p.pop?"#C9A84C":"#0F0E0C",color:p.pop?"#0F0E0C":"#C9A84C"}} onClick={onStart}>{p.pop?"Mulai Sekarang →":"Pilih Paket"}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="trust-sec">
        <div className="sec-lbl" style={{color:"rgba(201,168,76,.6)"}}>Keamanan</div>
        <div className="sec-ttl" style={{color:"#F7F4EF",marginBottom:0}}>Dibangun dengan Keamanan Utama</div>
        <div className="trust-row">
          {[{ico:"🔐",txt:"Enkripsi pesan"},{ico:"🛡️",txt:"Moderasi aktif"},{ico:"🚫",txt:"Video diblokir"},{ico:"✅",txt:"Verifikasi pengirim"},{ico:"🔒",txt:"Penerima tanpa login"},{ico:"📋",txt:"Syarat jelas"}].map((t,i)=>(
            <div key={i} className="trust-item"><span style={{fontSize:18}}>{t.ico}</span><span>{t.txt}</span></div>
          ))}
        </div>
      </div>

      <div className="footer">
        <div className="footer-logo">Time<span>Capsule</span></div>
        <div className="footer-txt">Platform pesan istimewa berbasis waktu.<br/>Untuk momen yang tak terlupakan.</div>
        <div className="footer-links">
          <span className="footer-link" onClick={onStart}>Buat Capsule</span>
          <span className="footer-link">Syarat & Ketentuan</span>
          <span className="footer-link">Kebijakan Privasi</span>
          <span className="footer-link">Hubungi Kami</span>
        </div>
        <div style={{marginTop:16,fontSize:10,color:"#3D3530"}}>© 2025 TimeCapsule · All rights reserved</div>
      </div>
    </div>
  );
}

/* ═══════════════════ SENDER APP ═══════════════════ */
function SenderApp() {
  const [tab,setTab]=useState("home");
  const [capsules,setCapsules]=useState(DEMO_CAPSULES);
  const [showSuccess,setShowSuccess]=useState(false);
  const [linkModal,setLinkModal]=useState(null);
  const [notifModal,setNotifModal]=useState(null);
  const [viewing,setViewing]=useState(null);
  const readyCount = capsules.filter(c=>isReady(c.openAt)).length;

  if (viewing) return (
    <>
      <style>{css}</style>
      <ReceiverPage capsule={viewing} onBack={()=>setViewing(null)}/>
    </>
  );

  if (tab==="about") return (
    <>
      <style>{css}</style>
      <header className="hdr">
        <div className="hdr-logo" onClick={()=>setTab("home")}>Time<span>Capsule</span></div>
        <nav className="nav">
          <button className="nb" onClick={()=>setTab("home")}>← Buat Capsule</button>
        </nav>
      </header>
      <AboutPage onStart={()=>setTab("create")}/>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <header className="hdr">
        <div className="hdr-logo" onClick={()=>setTab("home")}>Time<span>Capsule</span></div>
        <nav className="nav">
          <button className={`nb ${tab==="home"?"on":""}`} onClick={()=>setTab("home")}>🏠 Beranda</button>
          <button className={`nb ${tab==="create"?"on":""}`} onClick={()=>setTab("create")}>+ Buat</button>
          <button className={`nb ${tab==="inbox"?"on":""}`} onClick={()=>setTab("inbox")}>Kapsulku{readyCount>0&&<span className="npill">{readyCount}</span>}</button>
          <button className={`nb ${tab==="about"?"on":""}`} onClick={()=>setTab("about")} style={{opacity:.6,fontSize:10}}>ℹ️ Info</button>
        </nav>
      </header>

      {tab==="home" && (
        <div className="wrap">
          <div style={{background:"linear-gradient(135deg,#0F0E0C,#2C2010)",borderRadius:14,padding:"24px 20px",marginBottom:20,textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.12),transparent 70%)"}}/>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{fontSize:32,marginBottom:10}}>📦</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#F7F4EF",marginBottom:7}}>Selamat datang di <em style={{color:"#C9A84C"}}>TimeCapsule</em></div>
              <div style={{fontSize:12,color:"#9A9089",lineHeight:1.7,marginBottom:16,maxWidth:380,margin:"0 auto 16px"}}>Buat pesan yang terkunci waktu — untuk keluarga, sahabat, pasangan, atau karyawanmu.</div>
              <button className="btn-hp" onClick={()=>setTab("create")}>Buat Capsule Pertama →</button>
            </div>
          </div>

          <div className="stats">
            <div className="stat"><div className="stat-n">{capsules.length}</div><div className="stat-l">Total Capsule</div></div>
            <div className="stat"><div className="stat-n">{capsules.filter(c=>!isReady(c.openAt)).length}</div><div className="stat-l">Terkunci</div></div>
            <div className="stat"><div className="stat-n">{readyCount}</div><div className="stat-l">Siap Buka</div></div>
            <div className="stat"><div className="stat-n">{THEMES.length}</div><div className="stat-l">Tema</div></div>
          </div>

          <div className="pg-title" style={{fontSize:19}}>Capsule Terbaru</div>
          <div className="pg-sub">Klik ⚙ Kelola untuk kirim link atau preview</div>
          <div className="clist">
            {capsules.slice(0,4).map((c,i)=>{
              const th=themeOf(c); const tl=timeLeft(c.openAt); const rt=rtOf(c);
              return (
                <div key={c.id} className="citem" style={{animationDelay:`${i*.05}s`}}>
                  <div className="cico">{th.emoji}</div>
                  <div className="cinf">
                    <div className="c-to">{rt.icon} {rt.label}</div>
                    <div className="c-name">{c.to}</div>
                    <div className="c-prev">{c.message}</div>
                    {isReady(c.openAt) ? <span className="bdg b-ready"><span className="dot d-r"/>✨ Siap</span> : <span className="bdg b-wait"><span className="dot d-w"/>🔒 {tl}</span>}
                  </div>
                  <div className="cmeta">
                    <div className="c-date">{fmtDate(c.openAt)}</div>
                    <button className="btn-sm" style={{background:"#0F0E0C",color:"#C9A84C",marginTop:6}} onClick={()=>setLinkModal(c)}>⚙ Kelola</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="create" && <CreateForm setCapsules={setCapsules} onSuccess={()=>{setShowSuccess(true);setTab("inbox");}}/>}

      {tab==="inbox" && (
        <div className="wrap">
          <div className="pg-title">Kapsulku</div>
          <div className="pg-sub">Semua capsule yang pernah kamu buat</div>
          {capsules.length===0
            ? <div className="empty"><div className="empty-ico">📭</div><div className="empty-txt">Belum ada capsule. Buat yang pertama!</div></div>
            : <div className="clist">
                {capsules.map((c,i)=>{
                  const th=themeOf(c); const tl=timeLeft(c.openAt); const rt=rtOf(c);
                  return (
                    <div key={c.id} className="citem" style={{animationDelay:`${i*.05}s`}}>
                      <div className="cico">{th.emoji}</div>
                      <div className="cinf">
                        <div className="c-to">{rt.icon} {rt.label}</div>
                        <div className="c-name">{c.to}</div>
                        <div className="c-prev">{c.message}</div>
                        {isReady(c.openAt) ? <span className="bdg b-ready"><span className="dot d-r"/>✨ Siap</span> : <span className="bdg b-wait"><span className="dot d-w"/>🔒 {tl}</span>}
                      </div>
                      <div className="cmeta">
                        <div className="c-date">{fmtDate(c.openAt)}</div>
                        <div className="c-tl">{c.email||"—"}</div>
                        <button className="btn-sm" style={{background:"#0F0E0C",color:"#C9A84C",marginTop:6,display:"block",width:"100%"}} onClick={()=>setLinkModal(c)}>⚙ Kelola</button>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      )}

      {linkModal && <LinkModal capsule={linkModal} onClose={()=>setLinkModal(null)} onPreview={()=>{setViewing(linkModal);setLinkModal(null);}} onNotif={()=>{setNotifModal(linkModal);setLinkModal(null);}}/>}
      {notifModal && <NotifModal capsule={notifModal} onClose={()=>setNotifModal(null)}/>}
      {showSuccess && (
        <div className="suc-ov">
          <div className="suc-box">
            <div className="suc-ico">📦✨</div>
            <div className="suc-ttl">Capsule Terkirim!</div>
            <div className="suc-sub">Pesanmu sudah dikunci. Penerima akan mendapat notifikasi saat waktunya tiba.</div>
            <button className="btn-accent" onClick={()=>setShowSuccess(false)}>Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════ ADMIN ═══════════════════ */
function AdminLogin({ onLogin }) {
  const [pass,setPass]=useState(""); const [err,setErr]=useState("");
  function tryLogin(){ if(pass===ADMIN_PASSWORD){ onLogin(); } else { setErr("Password salah. Akses ditolak."); setPass(""); } }
  return (
    <div className="admin-login-pg">
      <style>{css}</style>
      <div className="login-card">
        <div className="login-ico">🔐</div>
        <div className="login-ttl">Admin Access</div>
        <div className="login-sub">Halaman ini hanya untuk administrator TimeCapsule.</div>
        <input className="login-inp" type="password" placeholder="Password admin" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/>
        <button className="login-btn" onClick={tryLogin}>Masuk →</button>
        {err && <div className="login-err">🚫 {err}</div>}
        <div className="login-hint">URL halaman ini bersifat rahasia.<br/>Jangan bagikan ke siapapun.</div>
      </div>
    </div>
  );
}

function AdminPanel({ onLogout }) {
  const [tab,setTab]=useState("dashboard");
  const [capsules]=useState(DEMO_CAPSULES);
  const [reports,setReports]=useState([{id:1,from:"User Anonymous",to:"Budi",reason:"Konten mencurigakan"},{id:2,from:"User 042",to:"Dewi",reason:"Spam"}]);
  const dismiss = id => setReports(r=>r.filter(x=>x.id!==id));

  return (
    <>
      <style>{css}</style>
      <header className="adm-hdr">
        <div className="adm-logo">🔧 TimeCapsule Admin</div>
        <nav className="nav">
          <button className={`nb nb-adm ${tab==="dashboard"?"on":""}`} onClick={()=>setTab("dashboard")}>Dashboard</button>
          <button className={`nb nb-adm ${tab==="capsules"?"on":""}`} onClick={()=>setTab("capsules")}>Capsule</button>
          <button className={`nb nb-adm ${tab==="mod"?"on":""}`} onClick={()=>setTab("mod")}>🛡️ Moderasi{reports.length>0&&<span className="npill">{reports.length}</span>}</button>
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="adm-badge">🔧 Admin</span>
          <button className="adm-logout" onClick={onLogout}>Keluar</button>
        </div>
      </header>

      {tab==="dashboard" && (
        <div className="wrap">
          <div className="pg-title" style={{color:"#F9FAFB",fontFamily:"'Cormorant Garamond',serif"}}>Dashboard Admin</div>
          <div className="pg-sub" style={{color:"#6B7280"}}>Kelola seluruh platform TimeCapsule</div>
          <div className="stats">
            {[{n:capsules.length,l:"Total Capsule"},{n:capsules.filter(c=>!isReady(c.openAt)).length,l:"Terkunci"},{n:capsules.filter(c=>isReady(c.openAt)).length,l:"Siap Buka"},{n:reports.length,l:"Laporan",red:true}].map((s,i)=>(
              <div key={i} className="adm-stat"><div className="adm-stat-n" style={{color:s.red?"#EF4444":"#C9A84C"}}>{s.n}</div><div className="adm-stat-l">{s.l}</div></div>
            ))}
          </div>
          <div style={{background:"#1F2937",border:"1px solid #374151",borderRadius:11,padding:"16px 18px",marginBottom:13}}>
            <div style={{color:"#F9FAFB",fontWeight:600,marginBottom:7,fontSize:13}}>📊 Status Platform</div>
            <div style={{fontSize:11,color:"#9CA3AF",lineHeight:1.8}}>
              • Upload video: <strong style={{color:"#6EE7B7"}}>Diblokir penuh ✓</strong><br/>
              • Hanya gambar tervalidasi (JPG/PNG/GIF/WEBP, max 5MB): <strong style={{color:"#6EE7B7"}}>Aktif ✓</strong><br/>
              • Laporan menunggu tinjau: <strong style={{color:"#EF4444"}}>{reports.length}</strong><br/>
              • Akses admin: <strong style={{color:"#6EE7B7"}}>Via URL tersembunyi + password ✓</strong>
            </div>
          </div>
          <div className="policy2">
            <strong>🛡️ Kebijakan Konten:</strong> Upload video diblokir penuh. Hanya gambar tervalidasi. Laporan ditinjau 24 jam. Pelanggaran berat → akun diblokir permanen.
          </div>
        </div>
      )}

      {tab==="capsules" && (
        <div className="wrap">
          <div className="pg-title" style={{color:"#F9FAFB",fontFamily:"'Cormorant Garamond',serif"}}>Semua Capsule</div>
          <div className="pg-sub" style={{color:"#6B7280"}}>Seluruh capsule di platform</div>
          <div className="clist">
            {capsules.map((c,i)=>{
              const th=themeOf(c); const tl=timeLeft(c.openAt); const rt=rtOf(c);
              return (
                <div key={c.id} className="citem" style={{animationDelay:`${i*.05}s`}}>
                  <div className="cico">{th.emoji}</div>
                  <div className="cinf">
                    <div className="c-to">{rt.icon} {rt.label}</div>
                    <div className="c-name">{c.to}</div>
                    <div className="c-prev">{c.message}</div>
                    {isReady(c.openAt) ? <span className="bdg b-ready"><span className="dot d-r"/>Siap</span> : <span className="bdg b-wait"><span className="dot d-w"/>🔒 {tl}</span>}
                  </div>
                  <div className="cmeta"><div className="c-date">{fmtDate(c.openAt)}</div></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="mod" && (
        <div className="wrap">
          <div className="pg-title" style={{color:"#F9FAFB",fontFamily:"'Cormorant Garamond',serif"}}>🛡️ Panel Moderasi</div>
          <div className="pg-sub" style={{color:"#6B7280"}}>Tinjau laporan konten yang masuk</div>
          {reports.length===0
            ? <div style={{background:"#1F2937",border:"1px solid #374151",borderRadius:11,padding:"32px 18px",textAlign:"center"}}><div style={{fontSize:32,marginBottom:10}}>✅</div><div style={{color:"#6EE7B7",fontWeight:600}}>Platform aman.</div><div style={{color:"#6B7280",fontSize:12,marginTop:4}}>Tidak ada laporan aktif.</div></div>
            : <div>{reports.map(r=>(
                <div key={r.id} className="mod-item2">
                  <div style={{fontSize:22}}>🚩</div>
                  <div style={{flex:1}}><div className="mod-ttl2">Laporan dari: {r.from}</div><div className="mod-sub2">Untuk: {r.to} · {r.reason}</div></div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}><button className="btn-ok" onClick={()=>dismiss(r.id)}>✓ Aman</button><button className="btn-del" onClick={()=>dismiss(r.id)}>✗ Hapus</button></div>
                </div>
              ))}</div>
          }
          <div className="policy2" style={{marginTop:16}}>
            <strong>Panduan:</strong> ✓ Aman = konten dilanjutkan · ✗ Hapus = capsule dihapus & akun ditangguhkan
          </div>
        </div>
      )}
    </>
  );
}

function AdminPage() {
  const [loggedIn,setLoggedIn]=useState(false);
  if (!loggedIn) return <AdminLogin onLogin={()=>setLoggedIn(true)}/>;
  return <AdminPanel onLogout={()=>setLoggedIn(false)}/>;
}

/* ═══════════════════ ROOT APP ═══════════════════ */
export default function App() {
  // Simulasi routing sederhana via state
  // Di produksi nyata: pakai React Router
  // - "/" → SenderApp
  // - "/untuk/:id" → ReceiverPage (via link)
  // - "/admin-x7k9p2" → AdminPage (URL tersembunyi)

  const [page,setPage]=useState("sender"); // "sender" | "admin" | "demo-receiver"

  // Simulasi: tombol hidden untuk demo admin & receiver
  return (
    <>
      {page==="sender" && <SenderApp/>}
      {page==="admin" && <AdminPage/>}
      {page==="demo-receiver" && (
        <>
          <style>{css}</style>
          <ReceiverPage
            capsule={{...DEMO_CAPSULES[1], openAt:new Date(Date.now()-3600000).toISOString()}}
            onBack={()=>setPage("sender")}
          />
        </>
      )}

      {/* DEMO SWITCHER — hanya untuk preview, tidak ada di produksi */}
      {process.env.NODE_ENV === "development" && <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(15,14,12,.92)",borderTop:"1px solid rgba(201,168,76,.2)",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,zIndex:500,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:"#6B6560",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Preview Mode:</span>
        <button onClick={()=>setPage("sender")} style={{padding:"5px 12px",borderRadius:6,border:"1.5px solid",borderColor:page==="sender"?"#C9A84C":"#374151",background:page==="sender"?"#C9A84C":"transparent",color:page==="sender"?"#0F0E0C":"#9A9089",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
          ✉️ Pengirim
        </button>
        <button onClick={()=>setPage("demo-receiver")} style={{padding:"5px 12px",borderRadius:6,border:"1.5px solid",borderColor:page==="demo-receiver"?"#10B981":"#374151",background:page==="demo-receiver"?"#10B981":"transparent",color:page==="demo-receiver"?"#fff":"#9A9089",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
          🎁 Penerima
        </button>
        <button onClick={()=>setPage("admin")} style={{padding:"5px 12px",borderRadius:6,border:"1.5px solid",borderColor:page==="admin"?"#6B7280":"#374151",background:page==="admin"?"#374151":"transparent",color:page==="admin"?"#F9FAFB":"#9A9089",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
          🔧 Admin (pw: timecapsule2025)
        </button>
      </div>}
    </>
  );
}
