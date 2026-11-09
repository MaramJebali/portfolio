const fs = require("fs"), zlib = require("zlib");
for (const f of ["public/cv.pdf", "public/French_version.pdf"]) {
  const s = fs.readFileSync(f).toString("latin1");
  let out = "";
  for (const m of s.matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
    try { out += zlib.inflateSync(Buffer.from(m[1], "latin1")).toString("latin1"); } catch (e) {}
  }
  const chunks = [];
  const re = /\[((?:\(\\?\)?|[^\\])*?)\]\s*T[Jj]/g;
  let mm;
  while ((mm = re.exec(out))) {
    chunks.push((mm[1].match(/\(([^)]+)\)/g) || []).map(x => x.slice(1, -1)).join("").replace(/\\(\d{3}|.)/g, " "));
  }
  const text = chunks.join(" ").replace(/\s+/g, " ").replace(/[^ -~ÉéÀàÊêÎîÔôÛûÇç]/g, " ");
  console.log("====", f);
  console.log(text.slice(0, 500));
}
