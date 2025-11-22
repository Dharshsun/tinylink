import pool from '../../../lib/db.cjs';
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;
function randomCode(len = 6){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s=''; for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  return s;
}
export default async function handler(req,res){
  if(req.method==='GET'){
    const { rows } = await pool.query('SELECT code, target, total_clicks, last_clicked, created_at FROM links WHERE deleted=false ORDER BY created_at DESC');
    return res.status(200).json(rows);
  }
  if(req.method==='POST'){
    const { target, code: customCode } = req.body||{};
    if(!target) return res.status(400).json({ error: 'invalid_target' });
    try{ new URL(target); }catch(e){ return res.status(400).json({ error: 'invalid_url' }); }
    let code = customCode?.trim();
    if(code){
      if(!CODE_REGEX.test(code)) return res.status(400).json({ error: 'invalid_code_format' });
      const exists = await pool.query('SELECT 1 FROM links WHERE code=$1 AND deleted=false',[code]);
      if(exists.rowCount>0) return res.status(409).json({ error: 'code_exists' });
    } else {
      let tries=0;
      do{ code=randomCode(6); const r=await pool.query('SELECT 1 FROM links WHERE code=$1',[code]); if(r.rowCount===0) break; tries++; }while(tries<10);
    }
    try{
      const { rows } = await pool.query('INSERT INTO links(code,target) VALUES($1,$2) RETURNING code,target,total_clicks,last_clicked,created_at',[code,target]);
      return res.status(201).json(rows[0]);
    }catch(err){ if(err.code==='23505') return res.status(409).json({ error: 'code_exists' }); console.error(err); return res.status(500).json({ error:'internal_error' }); }
  }
  res.setHeader('Allow','GET,POST'); res.status(405).json({ error:'method_not_allowed' });
}

