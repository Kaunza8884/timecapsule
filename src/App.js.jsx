import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

const DEFAULT_CREDITS = 100;

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
const slugOf   = c   => c.slug || `${String(c.to||"").split(" ")[0].toLowerCase()}-${c.id}`;
const recipientPath = c => `/untuk/${slugOf(c)}`;
const recipientLink = c => c.recipientUrl || `${window.location.origin}${recipientPath(c)}`;
function readCapsules(){ try { return JSON.parse(localStorage.getItem("timecapsule_capsules")) || DEMO_CAPSULES; } catch { return DEMO_CAPSULES; } }
function findCapsuleBySlug(slug){ return readCapsules().find(c=>slugOf(c)===slug) || null; }
// Hanya data URL gambar yang boleh dipakai sebagai logo/foto pengirim.
const safeAvatar = a => (typeof a==="string" && /^data:image\/(png|jpeg|webp);base64,/.test(a)) ? a : "";
// Kecilkan logo/foto pengirim jadi persegi 192px. Gambar yang jelas tidak persegi (logo lebar/tinggi) ditampilkan utuh, sisanya dipotong tengah.
function makeAvatar(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader(); r.onerror=reject;
    r.onload=()=>{
      const img=new Image(); img.onerror=reject;
      img.onload=()=>{
        const S=192, cv=document.createElement("canvas"); cv.width=cv.height=S;
        const ctx=cv.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,S,S);
        const ar=img.width/img.height, contain=ar>1.3||ar<0.77;
        const sc=contain ? Math.min(S/img.width,S/img.height)*0.86 : Math.max(S/img.width,S/img.height);
        const w=img.width*sc, h=img.height*sc;
        ctx.drawImage(img,(S-w)/2,(S-h)/2,w,h);
        resolve(cv.toDataURL("image/jpeg",0.86));
      };
      img.src=r.result;
    };
    r.readAsDataURL(file);
  });
}
// Lampiran dikecilkan (sisi terpanjang 1600px, JPEG) supaya muat dikirim ke server dan tidak memenuhi penyimpanan browser.
const MAX_ATTACH = 4;
function shrinkImage(file, max=1600){
  return new Promise((resolve,reject)=>{
    const r=new FileReader(); r.onerror=reject;
    r.onload=()=>{
      const img=new Image(); img.onerror=reject;
      img.onload=()=>{
        const sc=Math.min(1, max/Math.max(img.width,img.height));
        const cv=document.createElement("canvas"); cv.width=Math.round(img.width*sc); cv.height=Math.round(img.height*sc);
        const ctx=cv.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,cv.width,cv.height);
        ctx.drawImage(img,0,0,cv.width,cv.height);
        resolve(cv.toDataURL("image/jpeg",0.82));
      };
      img.src=r.result;
    };
    r.readAsDataURL(file);
  });
}
function validateFile(f){ if(!ALLOWED_IMG.includes(f.type)) return "Format tidak didukung. Hanya JPG, PNG, GIF, WEBP."; if(f.size>MAX_FILE_SIZE) return "Ukuran maks 5MB."; const ext=f.name.split(".").pop().toLowerCase(); if(["mp4","mov","avi","mkv","webm","flv"].includes(ext)) return "Upload video tidak diizinkan."; return null; }

/* ═══════════ CSS ═══════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Great+Vibes&family=Playfair+Display:wght@400;500&display=swap');
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
.hdr-logo{width:44px;height:44px;background:#fff;border-radius:8px;overflow:hidden;cursor:pointer;flex-shrink:0;position:relative;}
.hdr-logo img{position:absolute;width:82px;height:82px;left:-19px;top:-8px;object-fit:cover;}
.brand-logo-full{display:block;width:min(210px,72vw);height:auto;margin:0 auto 16px;border-radius:8px;}
.login-brand-logo{display:block;width:150px;height:auto;margin:0 auto 14px;border-radius:8px;}
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
.topt-box{height:44px;border-radius:6px;margin-bottom:4px;display:flex;align-items:center;justify-content:center;font-size:22px;}
.topt-ph{display:block;width:100%;height:44px;object-fit:cover;border-radius:6px;margin-bottom:4px;}
.cico{overflow:hidden;}
.cico img{width:100%;height:100%;object-fit:cover;display:block;}

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
.btn-main{width:100%;padding:11px;border:1px solid rgba(255,255,255,.16);border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;letter-spacing:.4px;transition:transform .18s,box-shadow .18s,filter .18s;display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(180deg,#35302A 0%,#171411 52%,#090807 100%);color:#E3C66C;box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset 0 -2px 0 rgba(0,0,0,.45),0 4px 0 #050504,0 9px 18px rgba(0,0,0,.24);text-shadow:0 1px 0 #000;}
.btn-main:hover{filter:brightness(1.15);transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.4),0 6px 0 #050504,0 12px 22px rgba(0,0,0,.28);}
.btn-main:active{transform:translateY(3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -2px 0 rgba(0,0,0,.5),0 1px 0 #050504,0 4px 10px rgba(0,0,0,.22);}
.btn-main:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-accent{background:linear-gradient(180deg,#F2D985 0%,#C9A84C 55%,#A67D25 100%);color:#0F0E0C;border:1px solid #F7E5A5;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 4px 0 #765719,0 8px 15px rgba(62,43,8,.22);transition:transform .18s,box-shadow .18s,filter .18s;}
.btn-sm{padding:5px 10px;font-size:10px;border-radius:6px;border:1px solid rgba(255,255,255,.18);cursor:pointer;font-family:'Outfit',sans-serif;font-weight:700;box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 3px 0 #050504,0 6px 11px rgba(0,0,0,.2);transition:transform .18s,box-shadow .18s,filter .18s;}

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
.copy-btn{background:linear-gradient(180deg,#3A352F,#0F0E0C);color:#fff;border:1px solid rgba(255,255,255,.18);padding:5px 10px;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.38),0 3px 0 #050504,0 6px 10px rgba(0,0,0,.2);transition:transform .18s,box-shadow .18s,filter .18s;}
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
.btn-hp{background:linear-gradient(180deg,#F4DD8D 0%,#D5B451 48%,#A97D22 100%);color:#0F0E0C;border:1px solid #F8E9AE;padding:12px 26px;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;font-family:'Outfit',sans-serif;transition:transform .18s,box-shadow .18s,filter .18s;box-shadow:inset 0 1px 0 rgba(255,255,255,.8),inset 0 -2px 0 rgba(98,68,8,.2),0 5px 0 #785718,0 10px 20px rgba(75,51,6,.25);text-shadow:0 1px 0 rgba(255,255,255,.4);}
.btn-hp:hover{filter:brightness(1.08);transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 7px 0 #785718,0 14px 24px rgba(75,51,6,.3);}
.btn-hp:active,.btn-accent:active,.btn-sm:active,.copy-btn:active{transform:translateY(3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 1px 0 rgba(0,0,0,.6),0 4px 8px rgba(0,0,0,.18);}
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
.login-inp:focus{border-color:#6B7280;background:#FFFFFF;color:#111827;}
.link-daftar{color:#C9A84C;cursor:pointer;font-weight:600;text-decoration:underline;}
.link-daftar:hover{color:#E3C66C;}
.login-inp:disabled{opacity:.6;cursor:not-allowed;}
.login-inp:-webkit-autofill,.login-inp:-webkit-autofill:hover,.login-inp:-webkit-autofill:focus{-webkit-text-fill-color:#111827 !important;-webkit-box-shadow:0 0 0 1000px #FFFFFF inset !important;caret-color:#111827;}
.login-show{width:100%;padding:8px 10px;margin-bottom:12px;background:linear-gradient(180deg,#334155,#1E293B);color:#E5E7EB;border:1px solid #64748B;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:transform .18s,box-shadow .18s,filter .18s;box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 3px 0 #0B1220,0 7px 12px rgba(0,0,0,.22);}
.login-show:hover{filter:brightness(1.12);transform:translateY(-1px);}
.login-btn{width:100%;padding:11px;background:linear-gradient(180deg,#64748B 0%,#475569 48%,#273449 100%);color:#F9FAFB;border:1px solid #8190A5;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;font-family:'Outfit',sans-serif;transition:transform .18s,box-shadow .18s,filter .18s;box-shadow:inset 0 1px 0 rgba(255,255,255,.42),inset 0 -2px 0 rgba(0,0,0,.24),0 5px 0 #172033,0 10px 18px rgba(0,0,0,.3);text-shadow:0 1px 1px rgba(0,0,0,.7);}
.login-btn:hover{filter:brightness(1.12);transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 7px 0 #172033,0 14px 22px rgba(0,0,0,.34);}
.login-btn:active,.login-show:active{transform:translateY(3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 1px 0 #172033,0 4px 8px rgba(0,0,0,.25);}
.login-err{background:#450a0a;border:1px solid #991b1b;color:#fca5a5;font-size:11px;padding:8px 12px;border-radius:7px;margin-top:9px;animation:fadeIn .25s ease;}
.login-hint{margin-top:14px;font-size:10px;color:#4B5563;line-height:1.6;}

/* LOGIN PENGIRIM (Elegant & Premium) */
/* Foto latar: taruh gambar di public/ lalu ganti none menjadi url('/login-bg.jpg') */
.sender-gate{--gate-photo:none;--cm-bg:#080D14;--cm-navy:#0B1420;--cm-gold:#D9A441;--cm-gold-light:#F5CD72;--cm-gold-soft:#E9B956;--cm-cream:#FFF7E7;--cm-text:#F7F2E8;--cm-muted:#B8B5B0;--cm-border-gold:rgba(225,171,70,.85);position:relative;overflow:hidden;padding:40px 16px;background:var(--cm-bg);}
.gate-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 55% at 50% 50%,rgba(8,13,20,.75),transparent 70%),radial-gradient(ellipse at 50% 50%,transparent 45%,rgba(3,5,9,.85) 100%),var(--gate-photo) center/cover no-repeat,radial-gradient(circle at 6% 28%,rgba(245,190,95,.42),transparent 20%),radial-gradient(ellipse at 18% 62%,rgba(217,164,65,.22),transparent 36%),radial-gradient(ellipse at 22% 95%,rgba(140,90,35,.35),transparent 40%),radial-gradient(ellipse at 84% 72%,rgba(233,185,86,.24),transparent 34%),radial-gradient(circle at 97% 45%,rgba(245,205,114,.2),transparent 18%),radial-gradient(ellipse at 45% -10%,rgba(245,205,114,.2),transparent 42%),linear-gradient(160deg,#1A130B 0%,#0B1420 48%,#080D14 70%,#17110A 100%);}
.gate-bokeh{position:absolute;inset:0;z-index:0;pointer-events:none;filter:blur(3px);opacity:.9;background:radial-gradient(circle at 70% 24%,rgba(255,214,140,.45) 0 6px,transparent 9px),radial-gradient(circle at 76% 14%,rgba(255,214,140,.3) 0 14px,transparent 18px),radial-gradient(circle at 93% 30%,rgba(255,214,140,.38) 0 11px,transparent 15px),radial-gradient(circle at 88% 58%,rgba(255,214,140,.3) 0 8px,transparent 11px),radial-gradient(circle at 97% 88%,rgba(255,214,140,.45) 0 18px,transparent 23px),radial-gradient(circle at 72% 92%,rgba(255,214,140,.35) 0 9px,transparent 12px),radial-gradient(circle at 18% 6%,rgba(255,214,140,.3) 0 7px,transparent 10px),radial-gradient(circle at 4% 52%,rgba(255,214,140,.35) 0 10px,transparent 14px),radial-gradient(circle at 30% 97%,rgba(255,214,140,.4) 0 8px,transparent 11px);}
.gate-clock{position:absolute;left:-6%;top:6%;width:min(44vw,640px);height:auto;z-index:0;pointer-events:none;opacity:.5;}
.gate-quote{position:absolute;right:4%;top:11%;z-index:0;pointer-events:none;font-family:'Great Vibes',cursive;font-size:40px;line-height:1.3;color:var(--cm-gold-soft);transform:rotate(-12deg);text-shadow:0 2px 14px rgba(0,0,0,.6);}
.gate-quote svg{display:block;margin:4px 0 0 110px;}
.sender-gate .login-card{position:relative;z-index:1;max-width:580px;padding:48px 52px 40px;border-radius:24px;background:linear-gradient(145deg,rgba(29,22,15,.90),rgba(5,12,19,.95));border:1px solid rgba(229,177,75,.85);box-shadow:0 28px 70px rgba(0,0,0,.48),0 0 40px rgba(211,155,51,.08);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:gateIn .35s ease-out both;}
@keyframes gateIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
.gate-logo{width:250px;height:222px;margin:0 auto 30px;background:#FFFDF8;border-radius:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(0,0,0,.35);}
.gate-logo img{width:306px;height:306px;flex-shrink:0;}
.sender-gate .login-ttl{font-family:'Playfair Display','Cormorant Garamond',Georgia,serif;font-size:52px;font-weight:500;color:var(--cm-text);margin-bottom:12px;line-height:1.1;}
.sender-gate .login-ttl em{color:var(--cm-gold-soft);font-style:normal;}
.sender-gate .login-sub{font-size:17px;color:var(--cm-muted);margin-bottom:30px;line-height:1.55;}
.gate-inp-wrap{position:relative;}
.gate-inp-ico{position:absolute;left:22px;top:50%;transform:translateY(-50%);color:var(--cm-text);pointer-events:none;display:flex;}
.sender-gate .login-inp{padding:16px 20px;border-radius:15px;background:rgba(5,10,16,.72);border:1px solid rgba(225,171,70,.55);color:var(--cm-text);font-size:16px;margin-bottom:16px;outline:none;transition:border-color .18s,box-shadow .18s;}
.sender-gate .gate-inp-wrap .login-inp{height:70px;padding-left:58px;font-size:18px;}
.sender-gate .login-inp::placeholder{color:var(--cm-muted);}
.sender-gate .login-inp:focus,.sender-gate .login-inp:focus-visible{outline:none;border-color:var(--cm-gold-light);background:rgba(5,10,16,.85);color:var(--cm-text);box-shadow:0 0 0 3px rgba(245,205,114,.14);}
.sender-gate .login-inp option{background:var(--cm-navy);color:var(--cm-text);}
.sender-gate .login-inp:-webkit-autofill,.sender-gate .login-inp:-webkit-autofill:hover,.sender-gate .login-inp:-webkit-autofill:focus{-webkit-text-fill-color:#F7F2E8 !important;-webkit-box-shadow:0 0 0 1000px #0A1119 inset !important;caret-color:#F7F2E8;}
.sender-gate .login-show{height:60px;padding:0 16px;margin-bottom:18px;border-radius:14px;background:rgba(8,13,20,.8);border:1px solid rgba(225,171,70,.5);color:var(--cm-text);font-size:18px;font-weight:600;box-shadow:none;transition:background .18s,border-color .18s;}
.sender-gate .login-show:hover{filter:none;transform:none;background:rgba(20,26,34,.9);border-color:rgba(225,171,70,.75);}
.sender-gate .login-show:active{transform:none;box-shadow:none;}
.sender-gate .login-btn{min-height:72px;padding:14px;border-radius:15px;background:linear-gradient(180deg,#F8D67E 0%,#E7AE45 100%);border:none;color:#111820;font-size:22px;font-weight:700;text-shadow:none;box-shadow:0 10px 28px rgba(217,164,65,.28);transition:transform .18s,box-shadow .18s;}
.sender-gate .login-btn:hover{filter:none;transform:translateY(-1px);box-shadow:0 14px 34px rgba(217,164,65,.38);}
.sender-gate .login-btn:active{transform:translateY(0);box-shadow:0 8px 22px rgba(217,164,65,.28);}
.sender-gate .login-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.sender-gate .login-hint{margin-top:26px;font-size:17px;color:var(--cm-muted);}
.sender-gate .link-daftar{color:var(--cm-gold-soft);text-decoration-thickness:1px;text-underline-offset:4px;}
.sender-gate .link-daftar:hover{color:var(--cm-gold-light);}
@media(max-width:1180px){.gate-quote{display:none;}.gate-clock{opacity:.3;}}
@media(max-width:768px){.sender-gate{padding:24px 16px;}.sender-gate .login-card{width:100%;max-width:none;padding:28px 24px 26px;}.sender-gate .login-ttl{font-size:36px;}.sender-gate .login-sub{font-size:15px;margin-bottom:24px;}.gate-logo{width:196px;height:174px;margin-bottom:22px;}.gate-logo img{width:240px;height:240px;}.sender-gate .gate-inp-wrap .login-inp{height:58px;font-size:14px;padding-left:48px;padding-right:12px;}.gate-inp-ico{left:18px;}.sender-gate .login-show{height:52px;font-size:16px;}.sender-gate .login-btn{min-height:58px;font-size:19px;}.sender-gate .login-hint{font-size:15px;}.gate-clock{display:none;}.gate-bokeh{opacity:.5;}}
@media(prefers-reduced-motion:reduce){.sender-gate .login-card{animation:none;}.sender-gate .login-btn,.sender-gate .login-btn:hover{transition:none;transform:none;}}
/* DASHBOARD PENGIRIM (Premium) */
.dhdr{--cm-gold:#D7A33C;--cm-gold-2:#F1C761;position:sticky;top:0;z-index:99;height:76px;display:flex;align-items:center;gap:20px;padding:0 max(24px,calc((100% - 1440px)/2 + 56px));background:linear-gradient(180deg,#0E0B07,#080807);border-bottom:1px solid rgba(215,163,60,.55);box-shadow:0 1px 0 rgba(241,199,97,.08),0 8px 24px rgba(0,0,0,.18);}
.d-brand{display:flex;align-items:center;gap:12px;cursor:pointer;flex-shrink:0;background:none;border:none;padding:0;}
.d-brand .hdr-logo{width:46px;height:46px;border-radius:10px;}
.d-brand-t{font-family:'Playfair Display','Cormorant Garamond',serif;font-size:24px;font-weight:500;color:#FFF9EF;}
.d-brand-t em{color:var(--cm-gold-2);font-style:normal;}
.d-nav{flex:1;display:flex;justify-content:center;gap:6px;}
.d-nb{height:44px;padding:0 18px;border-radius:12px;border:1px solid transparent;background:transparent;color:rgba(255,249,239,.72);font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;transition:color .18s,background .18s,border-color .18s;white-space:nowrap;}
.d-nb:hover{color:#FFF9EF;background:rgba(255,255,255,.04);}
.d-nb.on{color:var(--cm-gold-2);background:rgba(215,163,60,.1);border-color:rgba(215,163,60,.45);box-shadow:0 0 18px rgba(215,163,60,.12);}
.d-right{display:flex;align-items:center;gap:14px;flex-shrink:0;}
.d-credit{height:40px;padding:0 16px;border-radius:20px;display:flex;align-items:center;gap:8px;background:linear-gradient(180deg,#F8D67E,#D7A33C);color:#17130E;font-size:13px;font-weight:700;border:none;}
.d-credit b{font-size:15px;}
.d-ico-btn{position:relative;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,249,239,.14);background:rgba(255,255,255,.03);color:#FFF9EF;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .18s;}
.d-ico-btn:hover{border-color:rgba(215,163,60,.6);}
.d-badge{position:absolute;top:4px;right:4px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#E85050;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #0E0B07;}
.d-prof-wrap{position:relative;}
.d-prof{display:flex;align-items:center;gap:10px;height:48px;padding:0 6px 0 4px;border-radius:26px;background:none;border:none;cursor:pointer;color:#FFF9EF;font-family:'Outfit',sans-serif;text-align:left;}
.d-av{overflow:hidden;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#F1C761,#A87922);color:#17130E;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.d-prof-n{display:block;font-size:14px;font-weight:600;line-height:1.2;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.d-prof-s{display:block;font-size:11px;color:rgba(255,249,239,.55);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.d-menu-ov{position:fixed;inset:0;z-index:98;}
.d-menu{position:absolute;right:0;top:calc(100% + 10px);z-index:100;min-width:200px;background:#FFFFFF;border:1px solid rgba(173,126,40,.18);border-radius:14px;padding:8px;box-shadow:0 18px 40px rgba(39,28,12,.18);}
.d-menu button{width:100%;height:44px;padding:0 12px;border:none;background:none;border-radius:10px;text-align:left;font-family:'Outfit',sans-serif;font-size:14px;color:#17130E;cursor:pointer;display:flex;align-items:center;gap:10px;}
.d-menu button:hover{background:#FBF3E2;}
.d-menu .d-menu-out{color:#C0392B;}
.d-menu-err{padding:6px 12px;font-size:12px;color:#C0392B;}
.av-pick{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 14px;margin-bottom:14px;border:1px dashed rgba(173,126,40,.4);border-radius:12px;background:#FDF9EF;}
.av-pick-ph{width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,#F1C761,#A87922);color:#17130E;font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center;border:1.5px solid #D7A33C;}
.av-pick-t{flex:1;min-width:160px;font-size:12px;color:#6B6560;line-height:1.5;}
.av-pick-t strong{display:block;font-size:13px;color:#0F0E0C;}
.av-pick-b{display:flex;gap:8px;flex-wrap:wrap;}
.av-pick-b button{min-height:40px;padding:0 14px;border-radius:9px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;}
.av-btn{background:#17130E;color:#F1C761;border:none;}
.av-btn-x{background:#fff;color:#C0392B;border:1px solid #F3C4C0;}
.av-err{flex-basis:100%;font-size:12px;color:#C0392B;}

.dash{--cm-gold:#D7A33C;--cm-gold-2:#F1C761;--cm-gold-light:#FFE5A0;--cm-cream:#FFF9EF;--cm-text:#17130E;--cm-muted:#766E65;--cm-green:#1FA86A;--cm-border:rgba(173,126,40,.18);--cm-shadow:0 10px 30px rgba(39,28,12,.07),0 2px 8px rgba(39,28,12,.04);min-height:calc(100vh - 76px);background:radial-gradient(circle at 50% 0%,rgba(223,174,75,.08),transparent 32%),#FBF8F2;color:var(--cm-text);}
.dash-in{max-width:1440px;margin:0 auto;padding:28px 56px 64px;}
.dhero{position:relative;min-height:360px;border-radius:26px;overflow:hidden;border:1px solid rgba(215,163,60,.5);box-shadow:0 22px 50px rgba(39,28,12,.22),0 0 30px rgba(215,163,60,.08);background-color:#0C0905;background-image:linear-gradient(90deg,rgba(10,7,3,1) 0%,rgba(10,7,3,.98) 30%,rgba(10,7,3,.7) 42%,rgba(10,7,3,.15) 62%,rgba(10,7,3,.12) 100%),url('/assets/capsuleme-premium-hero.jpg');background-size:cover,auto 100%;background-position:center,right center;background-repeat:no-repeat;display:flex;align-items:center;margin-bottom:22px;}
.dhero-copy{position:relative;z-index:1;padding:44px 56px;max-width:620px;}
.dhero-eye{font-size:13px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,249,239,.85);margin-bottom:12px;}
.dhero-name{font-family:'Playfair Display','Cormorant Garamond',Georgia,serif;font-size:58px;font-weight:500;line-height:1.08;margin-bottom:16px;background:linear-gradient(180deg,#FFE5A0 0%,#E4B356 55%,#C58E2C 100%);-webkit-background-clip:text;background-clip:text;color:transparent;overflow-wrap:anywhere;}
.dhero-p{font-size:18px;line-height:1.5;color:#FFF9EF;margin-bottom:26px;}
.dhero-btns{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:26px;}
.d-cta{height:58px;padding:0 26px 0 14px;border-radius:14px;display:inline-flex;align-items:center;gap:12px;font-family:'Outfit',sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:transform .18s,box-shadow .18s;}
.d-cta:hover{transform:translateY(-1px);}
.d-cta:active{transform:translateY(0);}
.d-cta-p{background:linear-gradient(180deg,#F8D67E 0%,#E3AE4A 55%,#C9922F 100%);color:#17130E;border:1px solid rgba(255,229,160,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 10px 24px rgba(215,163,60,.25);}
.d-cta-p:hover{box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 14px 30px rgba(215,163,60,.35);}
.d-cta-plus{width:32px;height:32px;border-radius:50%;background:#17130E;color:#F1C761;display:flex;align-items:center;justify-content:center;}
.d-cta-s{background:#FFF9EF;color:#17130E;border:1px solid #FFF9EF;padding:0 30px;box-shadow:0 8px 20px rgba(0,0,0,.18);}
.d-cta-s:hover{box-shadow:0 12px 26px rgba(0,0,0,.24);}
.dhero-q{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:22px;line-height:1.4;color:rgba(255,249,239,.82);}
.dhero-q::after{content:"";display:block;width:96px;height:1px;margin-top:14px;background:linear-gradient(90deg,#D7A33C,transparent);}

.dstats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-bottom:22px;}
.dstat{display:flex;align-items:center;gap:16px;padding:22px 20px;background:#fff;border:1px solid var(--cm-border);border-radius:18px;box-shadow:var(--cm-shadow);cursor:pointer;text-align:left;font-family:'Outfit',sans-serif;transition:transform .18s,box-shadow .18s;}
.dstat:hover{transform:translateY(-1px);box-shadow:0 14px 34px rgba(39,28,12,.1);}
.d-icirc{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#FBEFD2,#F4DFAE);color:#9A6B18;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dstat-n{display:block;font-family:'Playfair Display',serif;font-size:34px;font-weight:500;color:#B8862B;line-height:1;}
.dstat-l{display:block;font-size:14px;color:var(--cm-muted);margin-top:4px;}
.d-chev{margin-left:auto;color:#B7AA98;flex-shrink:0;}

.dgrid{display:grid;grid-template-columns:minmax(0,2fr) minmax(320px,1fr);gap:18px;align-items:start;}
.dcol{display:flex;flex-direction:column;gap:18px;min-width:0;}
.dcard{background:#fff;border:1px solid var(--cm-border);border-radius:18px;box-shadow:var(--cm-shadow);padding:24px;}
.dcard-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;}
.dcard-t{font-family:'Playfair Display',serif;font-size:24px;font-weight:500;color:var(--cm-text);}
.dcard-s{font-size:13px;color:var(--cm-muted);margin-top:4px;}
.d-link{background:none;border:none;color:#B8862B;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;padding:8px 0;min-height:44px;}
.d-link:hover{color:#8A6214;}

.dtoken{background:radial-gradient(ellipse at 100% 0%,rgba(241,199,97,.18),transparent 55%),linear-gradient(135deg,#1B140A,#0B0907);border:1px solid rgba(215,163,60,.45);border-radius:18px;padding:22px 24px;color:#FFF9EF;box-shadow:var(--cm-shadow);}
.dtoken-top{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
.dtoken-coin{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#FFE5A0,#C9922F);color:#3B2708;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 18px rgba(241,199,97,.28);}
.dtoken-l{font-size:16px;font-weight:600;}
.dtoken-h{font-size:12px;color:rgba(255,249,239,.6);margin-top:2px;}
.dtoken-v{margin-left:auto;text-align:right;font-family:'Playfair Display',serif;font-size:32px;color:#F1C761;line-height:1;white-space:nowrap;}
.dtoken-v span{font-family:'Outfit',sans-serif;font-size:14px;color:rgba(255,249,239,.6);}
.dtoken-bar{height:8px;border-radius:4px;background:#2E2211;overflow:hidden;}
.dtoken-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#C9922F,#F1C761,#FFE5A0);box-shadow:0 0 12px rgba(241,199,97,.5);transition:width .4s;}
.dtoken-fill.empty{background:#E85050;box-shadow:none;}

.drows{display:flex;flex-direction:column;gap:12px;}
.drow{display:flex;align-items:center;gap:16px;min-height:86px;padding:14px 18px;background:#fff;border:1px solid var(--cm-border);border-radius:15px;box-shadow:0 2px 10px rgba(39,28,12,.04);cursor:pointer;transition:border-color .18s,box-shadow .18s;}
.drow:hover{border-color:rgba(215,163,60,.45);box-shadow:0 8px 20px rgba(39,28,12,.07);}
.drow-th{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;border:2px solid #F4DFAE;overflow:hidden;}
.drow-th img{width:100%;height:100%;object-fit:cover;display:block;}
.drow-inf{flex:1;min-width:0;}
.drow-cat{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--cm-muted);}
.drow-name{font-family:'Playfair Display',serif;font-size:18px;color:var(--cm-text);margin:2px 0;}
.drow-prev{font-size:13px;color:var(--cm-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.drow-meta{display:flex;align-items:center;gap:16px;flex-shrink:0;}
.d-status{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:14px;font-size:12px;font-weight:600;white-space:nowrap;}
.d-status.ready{background:#E3F6EC;color:#1FA86A;}
.d-status.wait{background:#FBF1DC;color:#9A6B18;}
.drow-date{font-size:13px;color:var(--cm-muted);white-space:nowrap;min-width:120px;text-align:right;}
.d-kelola{height:44px;padding:0 16px;border-radius:12px;background:#17130E;color:#F1C761;border:none;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap;}
.d-kelola:hover{background:#2A2115;}
.d-empty{text-align:center;padding:28px 12px;color:var(--cm-muted);font-size:14px;}

.dqa{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.dqa-i{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-height:118px;padding:16px;border:1px solid var(--cm-border);border-radius:14px;background:#fff;cursor:pointer;text-align:left;font-family:'Outfit',sans-serif;transition:background .18s,border-color .18s;}
.dqa-i:hover{background:#FDF6E8;border-color:rgba(215,163,60,.45);}
.dqa-i .d-icirc{width:42px;height:42px;}
.dqa-t{display:block;font-size:14px;font-weight:600;color:var(--cm-text);line-height:1.25;}
.dqa-h{display:block;font-size:12px;color:var(--cm-muted);margin-top:2px;line-height:1.3;}
.dqa-i .d-chev{position:absolute;top:16px;right:14px;margin:0;}

.dthemes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.dtheme{border:1px solid var(--cm-border);border-radius:14px;overflow:hidden;background:#fff;cursor:pointer;text-align:left;padding:0;font-family:'Outfit',sans-serif;transition:border-color .18s,transform .18s;}
.dtheme:hover{border-color:rgba(215,163,60,.5);transform:translateY(-1px);}
.dtheme-img{height:96px;display:flex;align-items:center;justify-content:center;font-size:34px;overflow:hidden;}
.dtheme-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s;}
.dtheme:hover .dtheme-img img{transform:scale(1.04);}
.dtheme-b{display:block;padding:10px 12px;}
.dtheme-n{display:block;font-size:14px;font-weight:600;color:var(--cm-text);}
.dtheme-c{display:block;font-size:12px;color:var(--cm-muted);margin-top:2px;}

@media(max-width:1200px){.dhdr .d-prof-txt{display:none;}.d-nb{padding:0 12px;}}
@media(max-width:1100px){.dgrid{grid-template-columns:minmax(0,1fr);}.dthemes{grid-template-columns:repeat(4,minmax(0,1fr));}.dash-in{padding:24px 24px 56px;}.dhero-copy{padding:40px;}}
@media(max-width:900px){
.dhdr{height:auto;flex-wrap:wrap;gap:8px 12px;padding:10px 16px 0;}
.d-nav{order:3;flex-basis:100%;justify-content:flex-start;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;}
.d-nav::-webkit-scrollbar{display:none;}
.d-right{margin-left:auto;gap:8px;}
.dstats{grid-template-columns:repeat(2,minmax(0,1fr));}
.dhero{background-size:cover,cover;background-position:center,62% center;background-image:linear-gradient(90deg,rgba(10,7,3,.95) 0%,rgba(10,7,3,.82) 55%,rgba(10,7,3,.55) 100%),url('/assets/capsuleme-premium-hero.jpg');}
.dash{min-height:auto;}
}
@media(max-width:640px){
.dash-in{padding:16px 16px 48px;}
.d-brand-t{font-size:20px;}
.d-brand .hdr-logo{width:40px;height:40px;}
.d-credit{height:36px;padding:0 12px;font-size:12px;}
.d-credit .d-credit-l{display:none;}.dhdr{gap:8px;}.d-brand{gap:8px;}.d-right{gap:6px;}.d-prof{padding:0;gap:0;}.d-prof>svg{display:none;}.d-ico-btn{width:44px;height:44px;}
.dhero{min-height:0;border-radius:20px;}
.dhero-copy{padding:28px 22px;}
.dhero-eye{font-size:11px;letter-spacing:3px;}
.dhero-name{font-size:38px;}
.dhero-p{font-size:15px;}
.dhero-btns{flex-direction:column;gap:12px;}
.d-cta{width:100%;justify-content:center;height:54px;}
.dhero-q{font-size:18px;}
.dstats{gap:12px;}
.dstat{flex-direction:column;align-items:flex-start;gap:10px;padding:16px;}
.dstat .d-chev{display:none;}
.d-icirc{width:44px;height:44px;}
.dstat-n{font-size:28px;}
.dcard{padding:18px;}
.dcard-t{font-size:22px;}
.drow{flex-wrap:wrap;align-items:flex-start;gap:12px;}
.drow-th{width:46px;height:46px;font-size:20px;}
.drow-inf{flex-basis:calc(100% - 60px);}
.drow-meta{flex-basis:100%;justify-content:space-between;flex-wrap:wrap;gap:10px;}
.drow-date{min-width:0;text-align:left;}
.dqa{grid-template-columns:1fr;}
.dthemes{grid-template-columns:repeat(2,minmax(0,1fr));}
}
@media(prefers-reduced-motion:reduce){.d-cta,.dstat,.dtheme,.dtoken-fill{transition:none;}.d-cta:hover,.dstat:hover,.dtheme:hover{transform:none;}}
/* HALAMAN PENERIMA (Premium) */
.rv-root{min-height:100vh;transition:background .6s;background:radial-gradient(circle at 50% 0%,rgba(223,174,75,.09),transparent 34%),#FBF8F2;}
.rv-page{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:84px 24px 64px;display:flex;flex-direction:column;gap:18px;}
.rv-sender{display:flex;align-items:center;gap:16px;padding:16px 22px;background:#FFFDF8;border:1px solid rgba(215,163,60,.4);border-radius:20px;box-shadow:0 10px 30px rgba(39,28,12,.07),0 2px 8px rgba(39,28,12,.04);animation:rvIn .3s ease-out both;}
.rv-av{overflow:hidden;width:52px;height:52px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#F1C761,#A87922);color:#17130E;font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center;}
.rv-av img,.d-av img,.av-pick-ph img{width:100%;height:100%;object-fit:cover;display:block;}
.rv-av:has(img),.d-av:has(img){background:#fff;border:1.5px solid #D7A33C;}
.rv-sname{font-family:'Playfair Display','Cormorant Garamond',serif;font-size:21px;color:#17130E;line-height:1.2;overflow-wrap:anywhere;}
.rv-sco{font-size:14px;color:#766E65;margin-top:2px;overflow-wrap:anywhere;}
.rv-badge{margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:17px;background:#E3F6EC;color:#168152;border:1px solid #BFE8D2;font-size:14px;font-weight:600;}
.rv-hero{position:relative;min-height:380px;border-radius:24px;overflow:hidden;background:#052E1C;border:1px solid rgba(215,163,60,.55);box-shadow:0 24px 54px rgba(39,28,12,.24);display:flex;align-items:center;animation:rvIn .3s .05s ease-out both;}
.rv-hero.locked{background:#0D0A06;}
.rv-hero.opened{min-height:300px;}
.rv-hero-img{position:absolute;right:0;top:0;height:100%;width:auto;max-width:none;display:block;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 40%);mask-image:linear-gradient(90deg,transparent 0%,#000 40%);}
.rv-hero-ov{position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,38,22,.94) 0%,rgba(4,38,22,.8) 36%,rgba(4,38,22,.22) 66%,rgba(4,38,22,.1) 100%);}
.rv-hero.locked .rv-hero-ov{background:linear-gradient(90deg,rgba(10,7,3,.95) 0%,rgba(10,7,3,.82) 36%,rgba(10,7,3,.3) 66%,rgba(10,7,3,.18) 100%);}
.rv-hero-copy{position:relative;z-index:1;padding:44px 52px 64px;max-width:600px;}
.rv-eye{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#F1C761;margin-bottom:14px;}
.rv-eye::after{content:"";width:56px;height:1px;background:linear-gradient(90deg,#D7A33C,transparent);}
.rv-name{font-family:'Playfair Display','Cormorant Garamond',Georgia,serif;font-size:54px;font-weight:500;line-height:1.08;color:#FFF9EF;margin-bottom:14px;overflow-wrap:anywhere;}
.rv-sub{font-size:18px;line-height:1.5;color:rgba(255,249,239,.9);}
.rv-sub strong{color:#FFE5A0;font-weight:600;}
.rv-tag{display:inline-flex;align-items:center;height:30px;padding:0 14px;border-radius:15px;background:rgba(255,249,239,.14);border:1px solid rgba(241,199,97,.5);color:#FFE5A0;font-size:13px;font-weight:600;}
.rv-panel{position:relative;z-index:2;margin:-48px 32px 0;padding:28px;background:#FFFDF8;border:1px solid rgba(173,126,40,.18);border-radius:22px;box-shadow:0 18px 44px rgba(39,28,12,.14),0 2px 8px rgba(39,28,12,.05);display:flex;flex-direction:column;gap:16px;animation:rvIn .3s .1s ease-out both;}
.rv-open{width:100%;min-height:68px;padding:12px 20px;border-radius:15px;background:linear-gradient(180deg,#0B5A36,#063D25);border:1px solid #D7A33C;color:#FFF9EF;font-family:'Outfit',sans-serif;font-size:20px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 10px 24px rgba(6,61,37,.28);transition:transform .18s,box-shadow .18s,filter .18s;}
.rv-open:hover{transform:translateY(-1px);filter:brightness(1.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 14px 30px rgba(6,61,37,.34);}
.rv-open:active{transform:translateY(0);}
.rv-safe{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;background:#EEF9F3;border:1px solid #CDEBDB;color:#17694A;font-size:14px;line-height:1.5;}
.rv-safe svg{flex-shrink:0;color:#1FA86A;}
.rv-safe strong{font-weight:600;}
.rv-report{align-self:center;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:10px;background:#FFF6F5;border:1px solid #F3C4C0;color:#C7392F;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background .18s;}
.rv-report:hover{background:#FDEBE9;}
.rv-cd{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;}
.rv-cd-c{padding:16px 6px;text-align:center;background:#FBF6EA;border:1px solid rgba(173,126,40,.18);border-radius:14px;}
.rv-cd-n{font-family:'Playfair Display',serif;font-size:36px;font-weight:500;color:#B8862B;line-height:1;}
.rv-cd-l{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#766E65;margin-top:8px;}
.rv-when{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:12px 14px;border-radius:12px;background:#FBF6EA;border:1px dashed rgba(173,126,40,.35);font-size:14px;color:#766E65;text-align:center;}
.rv-when strong{color:#17130E;}
.rv-from{display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid rgba(173,126,40,.18);}
.rv-from .rv-av{width:42px;height:42px;font-size:14px;}
.rv-from-l{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#766E65;}
.rv-from-n{font-size:15px;font-weight:600;color:#17130E;overflow-wrap:anywhere;}
.rv-msg{font-family:'Cormorant Garamond',serif;font-size:21px;line-height:1.75;color:#2C2825;white-space:pre-wrap;overflow-wrap:anywhere;}
.rv-imgs img{width:100%;border-radius:14px;margin-top:10px;object-fit:cover;display:block;}
.rv-foot{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-top:16px;border-top:1px solid rgba(173,126,40,.18);font-size:13px;color:#766E65;}
.rv-foot-b{display:flex;gap:8px;flex-wrap:wrap;}
.rv-share{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:10px;background:#17130E;color:#F1C761;border:none;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;}
.rv-opening{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;background:radial-gradient(circle at 50% 30%,rgba(223,174,75,.14),transparent 45%),#FBF8F2;}
.rv-opening-ph{width:132px;height:132px;border-radius:50%;overflow:hidden;border:3px solid #D7A33C;box-shadow:0 0 0 8px rgba(215,163,60,.14),0 18px 40px rgba(39,28,12,.2);margin-bottom:24px;animation:rvPulse 1.6s ease-in-out infinite;}
.rv-opening-ph img{width:100%;height:100%;object-fit:cover;display:block;}
.rv-opening-t{font-family:'Playfair Display',serif;font-size:28px;color:#17130E;}
.rv-opening-s{font-size:15px;color:#766E65;margin-top:8px;}
@keyframes rvIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
@keyframes rvPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
@media(max-width:768px){
.rv-page{padding:96px 16px 48px;gap:14px;}
.rv-sender{padding:12px 14px;gap:12px;border-radius:18px;}
.rv-av{width:44px;height:44px;font-size:15px;}
.rv-sname{font-size:18px;}
.rv-sco{font-size:13px;}
.rv-badge{height:30px;padding:0 10px;font-size:13px;}
.rv-hero{min-height:420px;align-items:flex-end;border-radius:20px;}
.rv-hero.opened{min-height:340px;}
.rv-hero-img{left:0;right:0;width:100%;height:58%;object-fit:cover;-webkit-mask-image:none;mask-image:none;}
.rv-hero-ov{background:linear-gradient(180deg,rgba(5,46,28,.05) 0%,rgba(5,46,28,.3) 32%,#052E1C 58%);}
.rv-hero.locked .rv-hero-ov{background:linear-gradient(180deg,rgba(13,10,6,.15) 0%,rgba(13,10,6,.45) 32%,#0D0A06 58%);}
.rv-hero-copy{padding:28px 22px 44px;}
.rv-eye{font-size:11px;letter-spacing:3px;}
.rv-name{font-size:38px;}
.rv-sub{font-size:16px;}
.rv-panel{margin:-24px 10px 0;padding:18px;border-radius:20px;}
.rv-open{min-height:58px;font-size:17px;}
.rv-cd{gap:8px;}
.rv-cd-n{font-size:28px;}
.rv-cd-l{font-size:10px;letter-spacing:1px;}
.rv-msg{font-size:19px;}
}
@media(prefers-reduced-motion:reduce){.rv-sender,.rv-hero,.rv-panel,.rv-opening-ph{animation:none;}.rv-open,.rv-open:hover{transition:none;transform:none;}}
.adm-hdr{background:#111827;border-bottom:1px solid #374151;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;position:sticky;top:0;z-index:99;}
.adm-logo{display:flex;align-items:center;gap:8px;color:#D1D5DB;font-size:13px;font-weight:600;}
.adm-logo img{width:34px;height:34px;object-fit:cover;border-radius:6px;}
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
  const waText = `Halo *${capsule.to}*! 👋\n\n*${capsule.from}* ${capsule.company?`dari *${capsule.company}* `:""}mengirimkan *CapsuleMe* spesial untukmu! 📦\n\nTerbuka pada:\n📅 *${fmtLong(capsule.openAt)}*\n\n🔗 ${recipientLink(capsule)}\n\n_Pesan resmi via CapsuleMe._`;

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
                <div className="emrow"><span className="emlbl">Dari:</span><span>noreply@capsuleme.app</span></div>
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
                  <div className="email-trust2">🛡️ Dikirim resmi via CapsuleMe. Tidak perlu login.</div>
                </div>
                <div className="email-footer2"><div>© 2026 CapsuleMe</div><div>capsuleme.netlify.app</div></div>
              </div>
            </div>
          )}
          {tab==="wa" && (
            <div className="wa-shell">
              <div className="wa-top"><div className="wa-av">CM</div><div><div className="wa-nm">CapsuleMe Official</div><div className="wa-st">Business Account</div></div><span className="wa-vf">✓ Resmi</span></div>
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
  const link = recipientLink(capsule);
  function copy(){ navigator.clipboard?.writeText(link); setCopied(true); setTimeout(()=>setCopied(false),2000); }
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
          {capsule.localOnly && <p style={{marginTop:10,fontSize:11,color:"#B45309",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>Capsule ini hanya tersimpan di perangkat ini karena server tidak tersedia saat dibuat. Link belum bisa dibuka dari perangkat lain.</p>}
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

  // Data capsule bisa berganti (cache lokal -> data server): hitung ulang status selama belum dibuka.
  useEffect(()=>{ setPhase(p=>(p==="locked"||p==="ready") ? (isReady(capsule.openAt)?"ready":"locked") : p); setCd(getCD(capsule.openAt)); },[capsule.openAt]);
  // Hitung mundur hanya berjalan saat terkunci. Begitu waktunya tiba: nol, jadi siap, lalu berhenti.
  useEffect(()=>{
    if (phase!=="locked") return;
    const t=setInterval(()=>{
      setCd(getCD(capsule.openAt));
      if (isReady(capsule.openAt)) { clearInterval(t); setPhase("ready"); }
    },1000);
    return()=>clearInterval(t);
  },[capsule.openAt,phase]);
  function doOpen(){ setPhase("opening"); setTimeout(()=>setPhase("opened"),2200); }

  const senderLabel = capsule.company || rtOf(capsule).label;
  // Foto hero mengikuti tema capsule; tema tanpa foto memakai foto kapsul CapsuleMe.
  const heroImg = THEME_PHOTOS[capsule.theme] || THEME_HERO_FALLBACK;
  const senderAvatar = safeAvatar(capsule.avatar);
  const heroFallback = e => { if(!e.currentTarget.dataset.fb){ e.currentTarget.dataset.fb="1"; e.currentTarget.src=THEME_HERO_FALLBACK; } };

  if (phase==="opening") return (
    <div className="rv-opening">
      <div className="rv-opening-ph"><img src={heroImg} alt="" onError={heroFallback}/></div>
      <div className="rv-opening-t">Membuka capsulemu…</div>
      <div className="rv-opening-s">Sebentar lagi, sesuatu istimewa menantimu.</div>
    </div>
  );

  return (
    <div className="rv-root" style={phase==="opened"?{background:theme.bg}:undefined}>
      {phase==="opened" && <Particles emoji={theme.particle}/>}
      {showReport && <ReportModal onClose={()=>setShowReport(false)}/>}
      <div className="trust-bar">
        <span>🔐</span>
        <span className="tb-txt">Dikirim resmi oleh <strong>{senderLabel}</strong> via CapsuleMe</span>
        <span className="tb-vf">✓ Terverifikasi</span>
        <button className="tb-back" onClick={onBack}>← Kembali</button>
      </div>
      <div className="rv-page">
        <div className="rv-sender">
          <div className="rv-av">{senderAvatar ? <img src={senderAvatar} alt=""/> : initials(capsule.from)}</div>
          <div style={{minWidth:0}}><div className="rv-sname">{capsule.from}</div><div className="rv-sco">{senderLabel}</div></div>
          <div className="rv-badge"><DIcon name="check" size={16} sw={2.4}/>Resmi</div>
        </div>

        <div>
          <section className={`rv-hero ${phase}`}>
            <img className="rv-hero-img" src={heroImg} alt="" onError={heroFallback} style={{objectPosition:THEME_FOCUS[capsule.theme]||"center"}}/>
            <div className="rv-hero-ov"/>
            <div className="rv-hero-copy">
              {phase==="locked" && <>
                <div className="rv-eye">Ada sesuatu untukmu</div>
                <h1 className="rv-name">{capsule.to}</h1>
                <p className="rv-sub"><strong>{capsule.from}</strong> menyimpan pesan istimewa untukmu. Sabar ya.</p>
              </>}
              {phase==="ready" && <>
                <div className="rv-eye">Capsulemu siap!</div>
                <h1 className="rv-name">{capsule.to}</h1>
                <p className="rv-sub"><strong>{capsule.from}</strong> punya pesan spesial untukmu!</p>
              </>}
              {phase==="opened" && <>
                <div className="rv-eye">Untuk</div>
                <h1 className="rv-name">{capsule.to}</h1>
                <span className="rv-tag">{theme.label}</span>
              </>}
            </div>
          </section>

          <div className="rv-panel">
            {phase==="locked" && <>
              <div className="rv-cd">{[{v:cd.d,l:"Hari"},{v:cd.h,l:"Jam"},{v:cd.m,l:"Menit"},{v:cd.s,l:"Detik"}].map(({v,l})=><div key={l} className="rv-cd-c"><div className="rv-cd-n">{String(v).padStart(2,"0")}</div><div className="rv-cd-l">{l}</div></div>)}</div>
              <div className="rv-when"><DIcon name="calendar" size={18}/>Terbuka pada <strong>{fmtLong(capsule.openAt)}</strong></div>
              <div className="rv-safe"><DIcon name="shield" size={20}/><span><strong>Ini bukan spam.</strong> Pesan resmi via CapsuleMe. Tidak ada data yang diminta.</span></div>
              <button className="rv-report" onClick={()=>setShowReport(true)}><DIcon name="flag" size={16}/>Laporkan Konten</button>
            </>}
            {phase==="ready" && <>
              <button className="rv-open" onClick={doOpen}>Buka Capsule Sekarang <DIcon name="arrow" size={22} sw={2.2}/></button>
              <div className="rv-safe"><DIcon name="shield" size={20}/><span><strong>Aman 100%.</strong> Tidak ada data yang diminta.</span></div>
              <button className="rv-report" onClick={()=>setShowReport(true)}><DIcon name="flag" size={16}/>Laporkan Konten</button>
            </>}
            {phase==="opened" && <>
              <div className="rv-from">
                <div className="rv-av">{senderAvatar ? <img src={senderAvatar} alt=""/> : initials(capsule.from)}</div>
                <div style={{minWidth:0}}><div className="rv-from-l">Pesan dari</div><div className="rv-from-n">{capsule.from}{capsule.company?` · ${capsule.company}`:""}</div></div>
              </div>
              <div className="rv-msg">{capsule.message}</div>
              {capsule.images?.length>0 && <div className="rv-imgs">{capsule.images.map((s,i)=><img key={i} src={s} alt=""/>)}</div>}
              <div className="rv-foot">
                <span>Dikirim via CapsuleMe ✦</span>
                <div className="rv-foot-b"><button className="rv-share"><DIcon name="link" size={16}/>Bagikan</button><button className="rv-report" onClick={()=>setShowReport(true)}><DIcon name="flag" size={16}/>Laporkan</button></div>
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ CREATE FORM ═══════════════════ */
function CreateForm({ setCapsules, onSuccess, credits, spendCredit, onServerCredits, avatar, avatarErr, onPickAvatar, onRemoveAvatar }) {
  const [form,setForm]=useState({to:"",email:"",from:"",company:"",message:"",openAt:"",theme:"birthday",recipientType:"personal",msgMode:"tulis"});
  const [images,setImages]=useState([]); const [fileErr,setFileErr]=useState(""); const [selTpl,setSelTpl]=useState(null);
  const [sendErr,setSendErr]=useState(""); const [submitting,setSubmitting]=useState(false);
  const fileRef = useRef();
  const fc = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const canSend = form.to && form.message && form.openAt && credits > 0;
  const tpls = TEMPLATES[form.theme] || [];

  function handleUpload(e) {
    setFileErr("");
    Array.from(e.target.files).forEach(f=>{
      const err=validateFile(f); if(err){setFileErr(err);return;}
      shrinkImage(f)
        .then(url=>setImages(p=>{ if(p.length>=MAX_ATTACH){ setFileErr(`Maksimal ${MAX_ATTACH} gambar per capsule.`); return p; } return [...p,{url}]; }))
        .catch(()=>setFileErr("Gambar tidak bisa dibaca. Coba file lain."));
    });
    e.target.value="";
  }

  async function send() {
    if (!canSend || submitting) return;
    setSendErr("");
    setSubmitting(true);
    const contact = form.email.trim();
    // Tanggal buka disimpan lengkap dengan zona waktu, supaya server dan penerima membaca jam yang sama.
    const c = { id:Date.now(), from:form.from||"Pengirim", company:form.company, to:form.to.trim(), email:contact, message:form.message, theme:form.theme, openAt:new Date(form.openAt).toISOString(), images:images.map(i=>i.url), recipientType:form.recipientType, avatar:avatar||"" };
    // Semua capsule dikirim ke server. Email/WA hanya kontak, bukan syarat penyimpanan.
    let serverDown = false;
    try {
      const res = await fetch("/.netlify/functions/create-capsule", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          accessCode: sessionStorage.getItem("timecapsule_sender_access"),
          capsule: c,
          recipients: [{ name: c.to, email: contact }],
        }),
      });
      const isJson = (res.headers.get("content-type")||"").includes("application/json");
      const data = isJson ? await res.json().catch(()=>null) : null;
      // Sisa token selalu mengikuti angka dari server.
      if (data && typeof data.sisa === "number") {
        const s = JSON.parse(sessionStorage.getItem("capsuleme_sender") || "{}");
        sessionStorage.setItem("capsuleme_sender", JSON.stringify({ ...s, sisa:data.sisa, total:data.total, used:data.used }));
        onServerCredits && onServerCredits(data.sisa);
      }
      if (res.ok && data && data.ok) {
        // Slug dan link dari server adalah satu-satunya link resmi capsule ini.
        const saved = data.capsules?.[0] || {};
        if (saved.id) c.serverId = saved.id;
        if (saved.slug) c.slug = saved.slug;
        if (saved.recipient_url) c.recipientUrl = saved.recipient_url;
      } else if (res.status === 404 || res.status === 501 || (res.ok && !isJson)) {
        serverDown = true;
      } else {
        setSendErr((data && data.error) || "Gagal menyimpan capsule. Token tidak dipotong. Coba lagi.");
        setSubmitting(false);
        return;
      }
    } catch {
      serverDown = true;
    }
    if (serverDown) {
      // Server tidak tersedia (mis. saat npm start): simpan di perangkat ini saja sebagai cadangan.
      if (!spendCredit()) { setSubmitting(false); return; }
      c.localOnly = true;
    }
    setCapsules(p=>[c,...p]); setForm(f=>({...f,to:"",email:"",message:"",openAt:""})); setImages([]); setSelTpl(null); onSuccess();
    setSubmitting(false);
  }

  return (
      <div className="wrap">
        <div className="pg-title">Buat Capsule Baru</div>
        <div className="pg-sub">Tulis pesan yang akan dikenang selamanya · Sisa kredit: {credits}</div>

      <div className="card">
        <div className="card-ttl">👥 Untuk siapa?</div><div className="card-sub">Pilih kategori penerima</div>
        <div className="rtype-grid">
          {RECIPIENT_TYPES.map(r=><div key={r.id} className={`rtype-opt ${form.recipientType===r.id?"on":""}`} onClick={()=>setForm(f=>({...f,recipientType:r.id}))}><div className="rtype-ico">{r.icon}</div><div className="rtype-lbl">{r.label}</div><div className="rtype-desc">{r.desc}</div></div>)}
        </div>
      </div>

      <div className="card" style={{animationDelay:".04s"}}>
        <div className="card-ttl">👤 Pengirim & Penerima</div><div className="card-sub">Isi data pengirim dan penerima</div>
        <div className="av-pick">
          <div className="av-pick-ph">{avatar ? <img src={avatar} alt=""/> : initials(form.from||"Pengirim")}</div>
          <div className="av-pick-t"><strong>Logo atau foto pengirim</strong>Tampil di halaman penerima menggantikan inisial. Paling bagus gambar persegi.</div>
          <div className="av-pick-b">
            <button type="button" className="av-btn" onClick={onPickAvatar}>{avatar ? "Ganti" : "Pilih gambar"}</button>
            {avatar && <button type="button" className="av-btn-x" onClick={onRemoveAvatar}>Hapus</button>}
          </div>
          {avatarErr && <div className="av-err">{avatarErr}</div>}
        </div>
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
          {THEMES.map(t=><div key={t.id} className={`topt ${form.theme===t.id?"on":""}`} onClick={()=>{setForm(f=>({...f,theme:t.id}));setSelTpl(null);}}>{THEME_PHOTOS[t.id] ? <img className="topt-ph" src={THEME_PHOTOS[t.id]} alt=""/> : <div className="topt-e topt-box" style={{background:t.bg}}>{t.emoji}</div>}<div className="topt-l">{t.label}</div></div>)}
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
          <div className="upzone" onClick={()=>fileRef.current.click()}><div style={{fontSize:20,marginBottom:4}}>🖼️</div><div style={{fontSize:11,color:"#6B6560"}}>Klik upload · <strong style={{color:"#C9A84C"}}>JPG, PNG, GIF, WEBP</strong> · max 5MB · maks. {MAX_ATTACH} gambar</div></div>
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

      <button className="btn-main" onClick={send} disabled={!canSend || submitting}>{submitting ? "Menyimpan..." : credits > 0 ? `📦 Kirim Capsule ${themeOf(form).emoji}` : "Kredit habis - hubungi admin"}</button>
      {sendErr && <div className="file-err" style={{marginTop:8}}>{sendErr}</div>}
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
          <p className="hero-p">CapsuleMe memungkinkan siapa saja mengirimkan ucapan yang terkunci waktu — untuk keluarga, sahabat, pasangan, atau karyawan. Dibuka saat momennya paling berarti.</p>
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
        <div style={{marginTop:16,fontSize:10,color:"#3D3530"}}>© 2026 CapsuleMe · All rights reserved</div>
      </div>
    </div>
  );
}

/* ═══════════════════ SENDER APP ═══════════════════ */
// Foto tema (public/assets/themes). Tema tanpa foto tetap memakai emoji.
const THEME_PHOTOS = {
  birthday:"/assets/themes/birthday.jpg",
  graduation:"/assets/themes/graduation.jpg",
  achievement:"/assets/themes/achievement.jpg",
  love:"/assets/themes/love.jpg",
  anniversary:"/assets/themes/anniversary.jpg",
  surprise:"/assets/themes/surprise.jpg",
  promotion:"/assets/themes/promotion.jpg",
  farewell:"/assets/themes/farewell.jpg",
  motivation:"/assets/themes/motivation.jpg",
  newhouse:"/assets/themes/newhouse.jpg",
};

// Tema tanpa foto (atau ID tak dikenal) memakai foto kapsul CapsuleMe sebagai hero.
const THEME_HERO_FALLBACK = "/assets/capsuleme-premium-hero.jpg";
// Titik fokus foto hero di layar HP (object-position).
const THEME_FOCUS = { birthday:"45% center", graduation:"55% center", farewell:"70% center", motivation:"35% center" };

const D_ICONS = {
  check:   <path d="m5 12 5 5 9-10"/>,
  shield:  <><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
  flag:    <><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></>,
  calendar:<><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
  link:    <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></>,
  plus:    <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  arrow:   <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  chev:    <path d="m9 6 6 6-6 6"/>,
  chevDown:<path d="m6 9 6 6 6-6"/>,
  folder:  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  capsule: <><rect x="2.5" y="8" width="19" height="8" rx="4"/><path d="M12 8v8"/></>,
  lock:    <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  unlock:  <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-.9-.7-1.3-.7-2.1 0-.9.7-1.4 1.6-1.4H17a4 4 0 0 0 4-4c0-5-4-9-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></>,
  bell:    <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
  coin:    <><circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M9.5 10.5h4a1.5 1.5 0 0 1 0 3h-3"/></>,
  gear:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
  info:    <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></>,
  logout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,
  home:    <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/></>,
};
function DIcon({ name, size=20, sw=1.8 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{D_ICONS[name]}</svg>;
}

function SenderApp({ accessCode, onLogout }) {
  const [tab,setTab]=useState("home");
  const [capsules,setCapsules]=useState(readCapsules);
  // credits adalah cermin sisa token dari Supabase (sender.sisa). Angka lokal hanya dipakai kalau data pengirim belum ada.
  const [credits,setCredits]=useState(() => {
    try { const s=JSON.parse(sessionStorage.getItem("capsuleme_sender")||"{}"); if (typeof s.sisa==="number") return s.sisa; } catch {}
    return Number(localStorage.getItem("timecapsule_sender_credits")) || DEFAULT_CREDITS;
  });
  const [showSuccess,setShowSuccess]=useState(false);
  const [linkModal,setLinkModal]=useState(null);
  const [notifModal,setNotifModal]=useState(null);
  const [viewing,setViewing]=useState(null);
  const readyCount = capsules.filter(c=>isReady(c.openAt)).length;
  const sender = JSON.parse(sessionStorage.getItem("capsuleme_sender") || "{}");
  const [menuOpen,setMenuOpen]=useState(false);
  const avatarKey = `capsuleme_sender_avatar_${sender.id ?? accessCode ?? "local"}`;
  const [avatar,setAvatar]=useState(()=>safeAvatar(localStorage.getItem(avatarKey)));
  const [avatarErr,setAvatarErr]=useState("");
  const avatarRef = useRef();
  async function handleAvatarFile(e) {
    const file=e.target.files[0]; e.target.value="";
    if (!file) return;
    const err=validateFile(file);
    if (err) { setAvatarErr(err); return; }
    try { const url=await makeAvatar(file); localStorage.setItem(avatarKey,url); setAvatar(url); setAvatarErr(""); }
    catch { setAvatarErr("Gambar tidak bisa dibaca. Coba file lain."); }
  }
  function removeAvatar() { localStorage.removeItem(avatarKey); setAvatar(""); setAvatarErr(""); }
  const pickAvatar = () => avatarRef.current && avatarRef.current.click();
  const senderName = sender.name || "Pengirim";
  const tokenSisa = sender.sisa ?? 0;
  const tokenTotal = sender.total ?? 0;
  const popularThemes = THEMES
    .map(t=>({...t, n:capsules.filter(c=>c.theme===t.id).length}))
    .sort((a,b)=>b.n-a.n)
    .slice(0,4);

  const renderHeader = () => (
    <header className="dhdr">
      <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleAvatarFile}/>
      <button className="d-brand" onClick={()=>setTab("home")} title="CapsuleMe">
        <div className="hdr-logo"><img src="/capsuleme-logo.png" alt=""/></div>
        <span className="d-brand-t">Capsule<em>Me</em></span>
      </button>
      <nav className="d-nav">
        <button className={`d-nb ${tab==="home"?"on":""}`} onClick={()=>setTab("home")}><DIcon name="home" size={18}/>Beranda</button>
        <button className={`d-nb ${tab==="create"?"on":""}`} onClick={()=>setTab("create")}><DIcon name="plus" size={18}/>Buat</button>
        <button className={`d-nb ${tab==="inbox"?"on":""}`} onClick={()=>setTab("inbox")}><DIcon name="folder" size={18}/>Kapsulku</button>
        <button className={`d-nb ${tab==="about"?"on":""}`} onClick={()=>setTab("about")}><DIcon name="info" size={18}/>Info</button>
      </nav>
      <div className="d-right">
        <div className="d-credit" title="Sisa token"><DIcon name="coin" size={18}/><span className="d-credit-l">Token</span><b>{tokenSisa}</b></div>
        <button className="d-ico-btn" onClick={()=>setTab("inbox")} title={readyCount>0?`${readyCount} capsule siap dibuka`:"Tidak ada notifikasi"} aria-label="Notifikasi">
          <DIcon name="bell"/>
          {readyCount>0 && <span className="d-badge">{readyCount}</span>}
        </button>
        <div className="d-prof-wrap">
          <button className="d-prof" onClick={()=>setMenuOpen(v=>!v)} aria-expanded={menuOpen} aria-label="Menu profil">
            <span className="d-av">{avatar ? <img src={avatar} alt=""/> : initials(senderName)}</span>
            <span className="d-prof-txt">
              <span className="d-prof-n">{senderName}</span>
              <span className="d-prof-s">{sender.company || sender.email || "Pengirim"}</span>
            </span>
            <DIcon name="chevDown" size={16}/>
          </button>
          {menuOpen && <>
            <div className="d-menu-ov" onClick={()=>setMenuOpen(false)}/>
            <div className="d-menu">
              <button onClick={()=>{setMenuOpen(false);setTab("inbox");}}><DIcon name="folder" size={18}/>Kapsulku</button>
              <button onClick={pickAvatar}><DIcon name="palette" size={18}/>{avatar ? "Ganti logo / foto" : "Pasang logo / foto"}</button>
              {avatar && <button onClick={removeAvatar}><DIcon name="flag" size={18}/>Hapus logo / foto</button>}
              {avatarErr && <div className="d-menu-err">{avatarErr}</div>}
              <button className="d-menu-out" onClick={()=>{setMenuOpen(false);onLogout();}}><DIcon name="logout" size={18}/>Keluar</button>
            </div>
          </>}
        </div>
      </div>
    </header>
  );

  // localStorage adalah cache/cadangan. Kalau penuh, gambar capsule yang sudah ada di server tidak ikut disimpan.
  useEffect(()=>{
    try { localStorage.setItem("timecapsule_capsules", JSON.stringify(capsules)); }
    catch {
      try { localStorage.setItem("timecapsule_capsules", JSON.stringify(capsules.map(x=>x.slug?{...x,images:[]}:x))); } catch {}
    }
  },[capsules]);
  useEffect(()=>{ localStorage.setItem("timecapsule_sender_credits", String(credits)); },[credits]);

  function spendCredit() {
    if (credits <= 0) return false;
    setCredits(c=>c-1);
    return true;
  }

  if (viewing) return (
    <>
      <style>{css}</style>
      <ReceiverPage capsule={viewing} onBack={()=>setViewing(null)}/>
    </>
  );

  if (tab==="about") return (
    <>
      <style>{css}</style>
      {renderHeader()}
      <AboutPage onStart={()=>setTab("create")}/>
    </>
  );

  return (
    <>
      <style>{css}</style>
      {renderHeader()}

      {tab==="home" && (
        <div className="dash">
          <div className="dash-in">
            <section className="dhero">
              <div className="dhero-copy">
                <div className="dhero-eye">Selamat datang kembali,</div>
                <h1 className="dhero-name">{senderName}</h1>
                <p className="dhero-p">Abadikan pesan hari ini<br/>untuk masa depan yang lebih bermakna.</p>
                <div className="dhero-btns">
                  <button className="d-cta d-cta-p" onClick={()=>setTab("create")}>
                    <span className="d-cta-plus"><DIcon name="plus" size={18} sw={2.4}/></span>
                    Buat Capsule Baru <DIcon name="arrow" size={18} sw={2.2}/>
                  </button>
                  <button className="d-cta d-cta-s" onClick={()=>setTab("inbox")}>
                    <DIcon name="folder" size={20}/> Lihat Kapsulku
                  </button>
                </div>
                <div className="dhero-q">“Setiap pesan adalah kenangan<br/>untuk masa depan.”</div>
              </div>
            </section>

            <div className="dstats">
              <button className="dstat" onClick={()=>setTab("inbox")}>
                <span className="d-icirc"><DIcon name="capsule" size={24}/></span>
                <span><span className="dstat-n">{capsules.length}</span><span className="dstat-l">Total Capsule</span></span>
                <span className="d-chev"><DIcon name="chev" size={18}/></span>
              </button>
              <button className="dstat" onClick={()=>setTab("inbox")}>
                <span className="d-icirc"><DIcon name="lock" size={24}/></span>
                <span><span className="dstat-n">{capsules.filter(c=>!isReady(c.openAt)).length}</span><span className="dstat-l">Terkunci</span></span>
                <span className="d-chev"><DIcon name="chev" size={18}/></span>
              </button>
              <button className="dstat" onClick={()=>setTab("inbox")}>
                <span className="d-icirc"><DIcon name="unlock" size={24}/></span>
                <span><span className="dstat-n">{readyCount}</span><span className="dstat-l">Siap Buka</span></span>
                <span className="d-chev"><DIcon name="chev" size={18}/></span>
              </button>
              <button className="dstat" onClick={()=>setTab("create")}>
                <span className="d-icirc"><DIcon name="palette" size={24}/></span>
                <span><span className="dstat-n">{THEMES.length}</span><span className="dstat-l">Tema Tersedia</span></span>
                <span className="d-chev"><DIcon name="chev" size={18}/></span>
              </button>
            </div>

            <div className="dgrid">
              <div className="dcol">
                <div className="dtoken">
                  <div className="dtoken-top">
                    <span className="dtoken-coin"><DIcon name="coin" size={26} sw={2}/></span>
                    <div>
                      <div className="dtoken-l">Sisa token</div>
                      <div className="dtoken-h">Setiap capsule yang dikirim memakai 1 token.</div>
                    </div>
                    <div className="dtoken-v">{tokenSisa} <span>dari {tokenTotal}</span></div>
                  </div>
                  <div className="dtoken-bar">
                    <div className={`dtoken-fill ${tokenSisa>0?"":"empty"}`} style={{width:`${tokenTotal ? Math.min(100,(tokenSisa/tokenTotal)*100) : 0}%`}}/>
                  </div>
                </div>

                <div className="dcard">
                  <div className="dcard-h">
                    <div>
                      <div className="dcard-t">Capsule Terbaru</div>
                      <div className="dcard-s">Klik pada capsule untuk melihat detail atau mengelola.</div>
                    </div>
                    <button className="d-link" onClick={()=>setTab("inbox")}>Lihat Semua →</button>
                  </div>
                  {capsules.length===0
                    ? <div className="d-empty">Belum ada capsule. Buat yang pertama!</div>
                    : <div className="drows">
                        {capsules.slice(0,4).map(c=>{
                          const th=themeOf(c); const tl=timeLeft(c.openAt); const rt=rtOf(c);
                          return (
                            <div key={c.id} className="drow" role="button" tabIndex={0} onClick={()=>setLinkModal(c)} onKeyDown={e=>e.key==="Enter"&&setLinkModal(c)}>
                              <div className="drow-th" style={{background:th.bg}}>{THEME_PHOTOS[th.id] ? <img src={THEME_PHOTOS[th.id]} alt=""/> : th.emoji}</div>
                              <div className="drow-inf">
                                <div className="drow-cat">{rt.label}</div>
                                <div className="drow-name">{c.to}</div>
                                <div className="drow-prev">{c.message}</div>
                              </div>
                              <div className="drow-meta">
                                {isReady(c.openAt)
                                  ? <span className="d-status ready"><DIcon name="unlock" size={14} sw={2}/>Siap</span>
                                  : <span className="d-status wait"><DIcon name="lock" size={14} sw={2}/>{tl}</span>}
                                <span className="drow-date">{fmtDate(c.openAt)}</span>
                                <button className="d-kelola" onClick={e=>{e.stopPropagation();setLinkModal(c);}}><DIcon name="gear" size={16}/>Kelola</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>}
                </div>
              </div>

              <div className="dcol">
                <div className="dcard">
                  <div className="dcard-h"><div className="dcard-t">Aksi Cepat</div></div>
                  <div className="dqa">
                    <button className="dqa-i" onClick={()=>setTab("create")}>
                      <span className="d-icirc"><DIcon name="plus" size={20}/></span>
                      <span><span className="dqa-t">Buat Capsule Baru</span><span className="dqa-h">Tulis pesan untuk nanti</span></span>
                      <span className="d-chev"><DIcon name="chev" size={16}/></span>
                    </button>
                    <button className="dqa-i" onClick={()=>setTab("inbox")}>
                      <span className="d-icirc"><DIcon name="folder" size={20}/></span>
                      <span><span className="dqa-t">Lihat Kapsulku</span><span className="dqa-h">Kelola semua capsule</span></span>
                      <span className="d-chev"><DIcon name="chev" size={16}/></span>
                    </button>
                    <button className="dqa-i" onClick={()=>setTab("create")}>
                      <span className="d-icirc"><DIcon name="palette" size={20}/></span>
                      <span><span className="dqa-t">Pilih Tema</span><span className="dqa-h">{THEMES.length} tema di form Buat</span></span>
                      <span className="d-chev"><DIcon name="chev" size={16}/></span>
                    </button>
                    <button className="dqa-i" onClick={()=>setTab("about")}>
                      <span className="d-icirc"><DIcon name="info" size={20}/></span>
                      <span><span className="dqa-t">Info CapsuleMe</span><span className="dqa-h">Cara kerja & fitur</span></span>
                      <span className="d-chev"><DIcon name="chev" size={16}/></span>
                    </button>
                  </div>
                </div>

                <div className="dcard">
                  <div className="dcard-h">
                    <div className="dcard-t">Tema Populer</div>
                    <button className="d-link" onClick={()=>setTab("create")}>Lihat Semua →</button>
                  </div>
                  <div className="dthemes">
                    {popularThemes.map(t=>(
                      <button key={t.id} className="dtheme" onClick={()=>setTab("create")}>
                        <span className="dtheme-img" style={{background:t.bg}}>{THEME_PHOTOS[t.id] ? <img src={THEME_PHOTOS[t.id]} alt={t.label}/> : t.emoji}</span>
                        <span className="dtheme-b">
                          <span className="dtheme-n">{t.label}</span>
                          <span className="dtheme-c">{t.n} capsule</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==="create" && <CreateForm setCapsules={setCapsules} onSuccess={()=>{setShowSuccess(true);setTab("inbox");}} credits={credits} spendCredit={spendCredit} onServerCredits={setCredits} avatar={avatar} avatarErr={avatarErr} onPickAvatar={pickAvatar} onRemoveAvatar={removeAvatar}/>}

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
                      <div className="cico">{THEME_PHOTOS[th.id] ? <img src={THEME_PHOTOS[th.id]} alt=""/> : th.emoji}</div>
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
  const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [showPass,setShowPass]=useState(false);
  const [loading,setLoading]=useState(false);
  // Sandi diperiksa di server (Netlify Function), tidak disimpan di kode aplikasi.
  async function tryLogin(){
    if (!pass || loading) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch("/.netlify/functions/admin-login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ password:pass }) });
      const isJson = (res.headers.get("content-type")||"").includes("application/json");
      const data = isJson ? await res.json().catch(()=>({})) : {};
      if (res.ok && data.ok) { onLogin(); return; }
      if (res.status===401) setErr("Password salah. Akses ditolak.");
      else if (res.status===501) setErr("Sandi admin belum diatur di server.");
      else setErr("Server admin tidak tersedia. Login admin hanya berjalan di situs online.");
      setPass("");
    } catch {
      setErr("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="admin-login-pg">
      <style>{css}</style>
      <div className="login-card">
        <img className="login-brand-logo" src="/capsuleme-logo.png" alt="CapsuleMe"/>
        <div className="login-ttl">Admin Access</div>
        <div className="login-sub">Halaman ini hanya untuk administrator CapsuleMe.</div>
        <input className="login-inp" type={showPass ? "text" : "password"} placeholder="Password admin" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/>
        <button type="button" className="login-show" onClick={()=>setShowPass(v=>!v)}>
          {showPass ? "Sembunyikan password" : "Tampilkan password"}
        </button>
        <button className="login-btn" onClick={tryLogin} disabled={loading}>{loading ? "Memeriksa…" : "Masuk →"}</button>
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
        <div className="adm-logo"><img src="/capsuleme-logo.png" alt="CapsuleMe"/><span>CapsuleMe Admin</span></div>
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
          <div className="pg-sub" style={{color:"#6B7280"}}>Kelola seluruh platform CapsuleMe</div>
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

function ReceiverRoute({ slug }) {
  const [capsule,setCapsule]=useState(()=>findCapsuleBySlug(slug));
  const [loading,setLoading]=useState(!capsule);
  const [err,setErr]=useState("");

  useEffect(()=>{
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/.netlify/functions/get-capsule?slug=${encodeURIComponent(slug)}`);
        if (!alive) return;
        if (res.ok) setCapsule(await res.json());
        else setErr("Capsule tidak ditemukan atau backend belum aktif.");
      } catch {
        if (alive) setErr("Gagal mengambil capsule.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return()=>{ alive=false; };
  },[slug]);

  if (loading) return <><style>{css}</style><div className="admin-login-pg"><div className="login-card"><div className="login-ico">📦</div><div className="login-ttl">Membuka Capsule</div><div className="login-sub">Sebentar, kami mengambil pesanmu...</div></div></div></>;
  if (!capsule) return <><style>{css}</style><div className="admin-login-pg"><div className="login-card"><div className="login-ico">🔎</div><div className="login-ttl">Capsule Tidak Ditemukan</div><div className="login-sub">{err || "Link ini tidak valid."}</div><button className="login-btn" onClick={()=>{window.location.href="/";}}>Kembali</button></div></div></>;
  return <><style>{css}</style><ReceiverPage capsule={capsule} onBack={()=>{ window.location.href="/"; }}/></>;
}

function SenderAccessGate({ onLogin }) {
  const [code, setCode]             = useState("");
  const [err, setErr]               = useState("");
  const [showCode, setShowCode]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showDaftar, setShowDaftar] = useState(false);

  async function tryLogin() {
    const kode = code.trim().toUpperCase();
    if (!kode) { setErr("Masukkan kode akses terlebih dahulu."); return; }
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase.rpc("check_sender_code", { p_code: kode });
      if (error) { setErr("Gagal terhubung ke server. Coba lagi."); setLoading(false); return; }
      if (!data || !data.ok) {
        setErr(data?.error || "Kode akses tidak ditemukan.");
        setCode("");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("timecapsule_sender_access", kode);
      sessionStorage.setItem("capsuleme_sender", JSON.stringify(data));
      onLogin(kode, data);
    } catch {
      setErr("Terjadi kesalahan. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  }

  if (showDaftar) return <FormMintaAkses onBack={()=>setShowDaftar(false)}/>;

  return (
    <div className="admin-login-pg sender-gate">
      <style>{css}</style>
      <div className="gate-bg" aria-hidden="true"/>
      <div className="gate-bokeh" aria-hidden="true"/>
      <svg className="gate-clock" viewBox="0 0 400 400" aria-hidden="true" fill="none" stroke="#D9A441">
        <circle cx="200" cy="200" r="186" strokeWidth="6" opacity=".55"/>
        <circle cx="200" cy="200" r="168" strokeWidth="1.5" opacity=".45"/>
        <circle cx="200" cy="200" r="120" strokeWidth="1" opacity=".25"/>
        {["XII","I","II","III","IIII","V","VI","VII","VIII","IX","X","XI"].map((n,i)=>{
          const a=(i*30-90)*Math.PI/180;
          return <text key={n} x={200+142*Math.cos(a)} y={200+142*Math.sin(a)+8} textAnchor="middle" fill="#D9A441" stroke="none" opacity=".6" style={{font:"600 24px 'Cormorant Garamond',serif"}}>{n}</text>;
        })}
        {Array.from({length:60}).map((_,i)=>{
          const a=i*6*Math.PI/180, r1=i%5?162:156;
          return <line key={i} x1={200+r1*Math.cos(a)} y1={200+r1*Math.sin(a)} x2={200+168*Math.cos(a)} y2={200+168*Math.sin(a)} strokeWidth={i%5?1:2.5} opacity=".5"/>;
        })}
        <line x1="200" y1="200" x2="148" y2="120" strokeWidth="6" strokeLinecap="round" opacity=".7"/>
        <line x1="200" y1="200" x2="282" y2="152" strokeWidth="3.5" strokeLinecap="round" opacity=".7"/>
        <circle cx="200" cy="200" r="9" fill="#D9A441" opacity=".7"/>
      </svg>
      <div className="gate-quote" aria-hidden="true">
        “Setiap pesan<br/>adalah kenangan<br/>untuk masa depan”
        <svg width="150" height="46" viewBox="0 0 150 46" fill="none" stroke="#E9B956" strokeWidth="2" strokeLinecap="round">
          <path d="M4 14 C 50 4, 100 2, 146 6"/>
          <path d="M40 40 c-8-6-16-12-12-20 c3-5 10-4 12 2 c2-6 9-7 12-2 c4 8-4 14-12 20z"/>
        </svg>
      </div>
      <div className="login-card">
        <div className="gate-logo"><img src="/capsuleme-logo.png" alt="CapsuleMe"/></div>
        <div className="login-ttl">Akses <em>Pengirim</em></div>
        <div className="login-sub">Masukkan kode akses untuk membuat dan mengirim capsule.</div>
        <div className="gate-inp-wrap">
          <span className="gate-inp-ico" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 20 3"/><path d="m16 7 3 3"/><path d="m18.5 4.5 2 2"/></svg>
          </span>
          <input className="login-inp" type={showCode ? "text" : "password"}
            placeholder="Kode akses (contoh: CM-XXXXXX)" value={code}
            onChange={e=>setCode(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&tryLogin()} disabled={loading}/>
        </div>
        <button type="button" className="login-show" aria-pressed={showCode}
          onClick={()=>setShowCode(v=>!v)}>
          {showCode ? "🙈 Sembunyikan kode" : "👁 Tampilkan kode"}
        </button>
        <button className="login-btn" onClick={tryLogin} disabled={loading}>
          {loading ? "Memeriksa…" : "Masuk →"}
        </button>
        {err && <div className="login-err">🚫 {err}</div>}
        <div className="login-hint">
          Belum punya kode akses?{" "}
          <span className="link-daftar" onClick={()=>setShowDaftar(true)}>Ajukan di sini</span>
        </div>
      </div>
    </div>
  );
}

function FormMintaAkses({ onBack }) {
  const [form, setForm] = useState({ nama:"", email:"", whatsapp:"", company:"", tujuan:"personal", catatan:"" });
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses]   = useState(false);
  const [err, setErr]         = useState("");
  const fc = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const bisaKirim = form.nama && form.email;

  async function kirim() {
    if (!bisaKirim) { setErr("Nama dan email wajib diisi."); return; }
    setLoading(true); setErr("");
    try {
      const { error } = await supabase.from("senders").insert({
        name: form.nama, email: form.email, whatsapp: form.whatsapp,
        company: form.company || form.tujuan, catatan: form.catatan,
        status: "pending", credits: 0
      });
      if (error) { setErr("Gagal mengirim pengajuan. Coba lagi."); setLoading(false); return; }
      setSukses(true);
    } catch {
      setErr("Terjadi kesalahan. Periksa koneksi internet.");
    } finally { setLoading(false); }
  }

  if (sukses) return (
    <div className="admin-login-pg sender-gate">
      <style>{css}</style>
      <div className="gate-bg" aria-hidden="true"/>
      <div className="gate-bokeh" aria-hidden="true"/>
      <div className="login-card">
        <div style={{fontSize:46,marginBottom:14}}>✅</div>
        <div className="login-ttl">Pengajuan Terkirim</div>
        <div className="login-sub" style={{lineHeight:1.7}}>
          Terima kasih, <strong>{form.nama}</strong>.<br/><br/>
          Pengajuan Anda sedang kami tinjau. Kode akses akan dikirim ke <strong>{form.email}</strong> dalam 1×24 jam.
        </div>
        <button className="login-btn" onClick={onBack}>← Kembali ke Masuk</button>
      </div>
    </div>
  );

  return (
    <div className="admin-login-pg sender-gate">
      <style>{css}</style>
      <div className="gate-bg" aria-hidden="true"/>
      <div className="gate-bokeh" aria-hidden="true"/>
      <div className="login-card" style={{maxWidth:460}}>
        <img className="login-brand-logo" src="/capsuleme-logo.png" alt="CapsuleMe"/>
        <div className="login-ttl">Ajukan Akses</div>
        <div className="login-sub">Isi data berikut. Kami kirim kode akses via email.</div>
        <input className="login-inp" name="nama" placeholder="Nama lengkap *" value={form.nama} onChange={fc}/>
        <input className="login-inp" name="email" placeholder="Alamat email *" value={form.email} onChange={fc} type="email"/>
        <input className="login-inp" name="whatsapp" placeholder="Nomor WhatsApp" value={form.whatsapp} onChange={fc}/>
        <input className="login-inp" name="company" placeholder="Nama perusahaan/instansi" value={form.company} onChange={fc}/>
        <select className="login-inp" name="tujuan" value={form.tujuan} onChange={fc}>
          <option value="personal">Untuk keperluan pribadi</option>
          <option value="perusahaan">Untuk perusahaan / tim</option>
        </select>
        <textarea className="login-inp" name="catatan" placeholder="Ceritakan rencana penggunaan (opsional)"
          value={form.catatan} onChange={fc} rows={3} style={{resize:"vertical",minHeight:70}}/>
        <button className="login-btn" onClick={kirim} disabled={!bisaKirim||loading}>
          {loading ? "Mengirim…" : "Kirim Pengajuan →"}
        </button>
        {err && <div className="login-err">🚫 {err}</div>}
        <div className="login-hint">
          Sudah punya kode? <span className="link-daftar" onClick={onBack}>Masuk di sini</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ ROOT APP ═══════════════════ */
export default function App() {
  // Simulasi routing sederhana via state
  // Di produksi nyata: pakai React Router
  // - "/" → SenderApp
  // - "/untuk/:id" → ReceiverPage (via link)
  // - "/admin-x7k9p2" → AdminPage (URL tersembunyi)

  const receiverSlug = window.location.pathname.startsWith("/untuk/")
    ? window.location.pathname.split("/").pop()
    : null;
  const [page,setPage]=useState(() => (
    window.location.pathname === "/admin-x7k9p2" ? "admin" : "sender"
  )); // "sender" | "admin" | "demo-receiver"
  const [senderAccess,setSenderAccess]=useState(() => sessionStorage.getItem("timecapsule_sender_access") || "");

  function handleSenderLogout() {
    sessionStorage.removeItem("capsuleme_sender");
    sessionStorage.removeItem("timecapsule_sender_access");
    setSenderAccess("");
  }

  // Simulasi: tombol hidden untuk demo admin & receiver
  return (
    <>
      {receiverSlug && <ReceiverRoute slug={receiverSlug}/>}
      {!receiverSlug && (
        <>
      {page==="sender" && (senderAccess ? <SenderApp accessCode={senderAccess} onLogout={handleSenderLogout}/> : <SenderAccessGate onLogin={setSenderAccess}/>)}
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
        </>
      )}

    </>
  );
}
