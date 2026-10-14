const HTML = String.raw`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BiiLxNL Studio</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#08090b;color:#eee;font:15px Arial,sans-serif}
header{padding:22px 5%;border-bottom:1px solid #292b30;background:#0d0e11}
.logo{font-size:23px;font-weight:bold;letter-spacing:2px}
.logo span{color:#999}
main{max-width:950px;margin:35px auto;padding:0 16px}
h1{font-size:30px;margin-bottom:8px}
.sub{color:#999;line-height:1.6}
.tabs{display:flex;gap:8px;margin:25px 0}
button,.tab{border:1px solid #35373d;background:#15161a;color:#eee;padding:12px 16px;border-radius:9px;cursor:pointer}
button.primary{background:#e7e7e7;color:#111;font-weight:bold}
.panel{background:#101114;border:1px solid #2b2c31;border-radius:14px;padding:22px}
label{display:block;margin:15px 0 7px;color:#bbb}
input,select,textarea{width:100%;padding:12px;background:#090a0c;color:#eee;border:1px solid #36383f;border-radius:8px}
textarea{min-height:90px;resize:vertical}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
button:disabled{opacity:.5}
#status{white-space:pre-wrap;line-height:1.6;margin-top:16px;color:#ccc}
.item{padding:12px 0;border-bottom:1px solid #292b30;overflow-wrap:anywhere}
.hidden{display:none}
footer{text-align:center;color:#666;padding:30px}
@media(max-width:600px){.grid{grid-template-columns:1fr}main{margin-top:22px}.panel{padding:16px}}
</style>
</head>
<body>
<header><div class="logo">BiiLxNL <span>STUDIO</span></div></header>
<main>
<h1>Roblox Asset Studio</h1>
<p class="sub">Kelola dan kirim aset melalui Roblox Open Cloud API resmi.</p>
<div class="tabs">
<button class="tab primary" data-page="upload">Upload Asset</button>
<button class="tab" data-page="history">Riwayat</button>
</div>
<section id="upload" class="panel">
<form id="form">
<div class="grid">
<div><label>Target pemilik</label>
<select name="targetType"><option value="user">Akun pribadi</option><option value="group">Grup</option></select></div>
<div><label>ID akun / grup Roblox</label>
<input name="creatorId" required placeholder="Masukkan ID numerik"></div>
</div>
<label>Jenis aset</label>
<select name="assetType">
<option value="Decal">Decal / gambar</option>
<option value="Model">Model</option>
<option value="Audio">Audio</option>
<option value="Animation">Animation</option>
</select>
<label>Nama aset</label><input name="name" required maxlength="50" placeholder="Nama aset">
<label>Deskripsi</label><textarea name="description" maxlength="1000" placeholder="Deskripsi aset"></textarea>
<label>File aset</label><input name="file" type="file" required>
<p class="sub">Ukuran file dibatasi 20 MB oleh aplikasi ini. Format dan kelayakan tetap mengikuti aturan Roblox.</p>
<button class="primary" id="submit" type="submit">Kirim aset</button>
<div id="status" role="status"></div>
</form>
</section>
<section id="history" class="panel hidden"><h2>Riwayat di perangkat ini</h2><div id="records"></div><button id="clear">Hapus riwayat lokal</button></section>
</main>
<footer>BiiLxNL Studio · by BiiLxLangz</footer>
<script>
const $=s=>document.querySelector(s);
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('primary',x===b));
 $('#upload').classList.toggle('hidden',b.dataset.page!=='upload');
 $('#history').classList.toggle('hidden',b.dataset.page!=='history');
 render();
});
function render(){
 let rows=JSON.parse(localStorage.getItem('bxHistory')||'[]');
 $('#records').innerHTML=rows.length?rows.map(x=>'<div class="item"><b>'+esc(x.name)+'</b><br>'+esc(x.time)+'<br>'+esc(x.result)+'</div>').join(''):'Belum ada riwayat.';
}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
$('#clear').onclick=()=>{localStorage.removeItem('bxHistory');render();};
$('#form').onsubmit=async e=>{
 e.preventDefault();
 const button=$('#submit'), status=$('#status'), data=new FormData(e.target);
 button.disabled=true;status.textContent='Mengirim permintaan...';
 try{
  const r=await fetch('/api/assets/upload',{method:'POST',body:data});
  const out=await r.json();
  if(!r.ok)throw Error(out.error||'Upload gagal');
  status.textContent='Permintaan diterima Roblox. Status aset mungkin masih diproses.\\n'+JSON.stringify(out,null,2);
  const rows=JSON.parse(localStorage.getItem('bxHistory')||'[]');
  rows.unshift({name:data.get('name'),time:new Date().toLocaleString(),result:out.operationPath||out.message||'Dikirim'});
  localStorage.setItem('bxHistory',JSON.stringify(rows.slice(0,50)));
 }catch(err){status.textContent='Gagal: '+err.message;}
 finally{button.disabled=false;}
};
render();
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "BiiLxNL Studio" });
    }

    if (request.method === "POST" && url.pathname === "/api/assets/upload") {
      if (!env.ROBLOX_API_KEY) {
        return Response.json(
          { error: "ROBLOX_API_KEY belum disetel di Cloudflare Secrets." },
          { status: 500 }
        );
      }

      let form;
      try {
        form = await request.formData();
      } catch {
        return Response.json({ error: "Form upload tidak valid." }, { status: 400 });
      }

      const targetType = String(form.get("targetType") || "");
      const creatorId = String(form.get("creatorId") || "");
      const name = String(form.get("name") || "").trim();
      const description = String(form.get("description") || "").trim();
      const assetType = String(form.get("assetType") || "");
      const file = form.get("file");

      if (!["user", "group"].includes(targetType) ||
          !/^\d+$/.test(creatorId) ||
          !name || name.length > 50 || description.length > 1000 ||
          !["Decal", "Model", "Audio", "Animation"].includes(assetType) ||
          !(file instanceof File) || file.size === 0 || file.size > 20 * 1024 * 1024) {
        return Response.json(
          { error: "Data tidak valid. Periksa ID, jenis aset, nama, dan ukuran file (maksimal 20 MB)." },
          { status: 400 }
        );
      }

      const creator = targetType === "group"
        ? { groupId: Number(creatorId) }
        : { userId: Number(creatorId) };

      const metadata = {
        assetType,
        displayName: name,
        description,
        creationContext: { creator }
      };

      const body = new FormData();
      body.append("request", new Blob([JSON.stringify(metadata)], {
        type: "application/json"
      }));
      body.append("fileContent", file, file.name);

      let response;
      try {
        response = await fetch("https://apis.roblox.com/assets/v1/assets", {
          method: "POST",
          headers: { "x-api-key": env.ROBLOX_API_KEY },
          body
        });
      } catch {
        return Response.json({ error: "Tidak dapat menghubungi Roblox Open Cloud." }, { status: 502 });
      }

      const raw = await response.text();
      let result;
      try { result = JSON.parse(raw); } catch { result = {}; }

      if (!response.ok) {
        return Response.json({
          error: "Roblox menolak permintaan upload.",
          details: result.message || result.error || ("HTTP " + response.status)
        }, { status: response.status });
      }

      return Response.json({
        ok: true,
        message: "Permintaan upload diterima Roblox.",
        operationPath: result.path || null,
        result
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
