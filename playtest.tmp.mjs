import { chromium } from '@playwright/test'
import { Chess } from 'chess.js'
const BASE='http://localhost:4196/Chess-of-Kings/'
const V={p:100,n:320,b:330,r:500,q:900,k:0}
function ev(c){let s=0;const bd=c.board();for(let r=0;r<8;r++)for(let f=0;f<8;f++){const pc=bd[r][f];if(!pc)continue;let v=V[pc.type];if(pc.type==='p'||pc.type==='n'||pc.type==='b'){const cf=Math.abs(f-3.5),cr=Math.abs(r-3.5);v+=Math.round((7-(cf+cr))*3)}s+=(pc.color==='w'?1:-1)*v}return s}
function evStm(c){const e=ev(c);return c.turn()==='w'?e:-e}
function qs(c,a,b){if(c.isCheckmate())return -1e6;if(c.isDraw())return 0;let st=evStm(c);if(st>=b)return b;if(st>a)a=st;for(const m of c.moves({verbose:true})){if(!m.captured&&!m.promotion)continue;c.move(m);const sc=-qs(c,-b,-a);c.undo();if(sc>=b)return b;if(sc>a)a=sc}return a}
function nm(c,d,a,b){if(c.isCheckmate())return -1e6+(10-d);if(c.isDraw())return 0;if(d===0)return qs(c,a,b);let best=-1e9;for(const m of c.moves()){c.move(m);const sc=-nm(c,d-1,-b,-a);c.undo();if(sc>best)best=sc;if(best>a)a=best;if(a>=b)break}return best}
function best(c){let bm=null,bv=-1e9;for(const m of c.moves({verbose:true})){c.move(m);const v=-nm(c,2,-1e9,1e9)+Math.random()*0.5;c.undo();if(v>bv){bv=v;bm=m}}return bm}
const strip=(s)=>s.replace(/[!?]+$/,'').trim()
async function ledgerSans(p){const txt=await p.locator('#move-ledger').innerText().catch(()=>'');return txt.split(/\s+/).map(t=>strip(t)).filter(t=>t&&!/^\d+\.$/.test(t)&&t!=='/'&&/^[A-Za-z0-9+#=x-]+$/.test(t)&&t.length<=7&&!/^\d+$/.test(t))}
const errors=[]
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:1440,height:900}})
p.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE: '+m.text())})
p.on('pageerror',e=>errors.push('PAGEERROR: '+e.message))
await p.goto(BASE);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(500)
await p.locator('#btn-duel').click({timeout:15000});await p.waitForTimeout(300)
await p.locator('.duel-row').first().click();await p.waitForTimeout(300)
await p.locator('#duel-difficulty').selectOption('novice').catch(()=>{})
await p.waitForTimeout(150)
await p.locator('#btn-start-duel').click({timeout:8000});await p.waitForTimeout(1000)
const tr=new Chess();let applied=0
let shot=0
for(let mv=0;mv<160&&!tr.isGameOver();mv++){
  if(tr.turn()!=='w')break
  const m=best(tr);if(!m)break
  await p.locator(`[data-square="${m.from}"]`).click({timeout:5000}).catch(()=>{})
  await p.waitForTimeout(160)
  await p.locator(`[data-square="${m.to}"]`).click({timeout:5000}).catch(()=>{})
  if(m.promotion){await p.waitForTimeout(250);await p.locator('.promo-panel button, .promo-panel [data-piece]').first().click().catch(()=>{})}
  tr.move(m);applied++
  if(mv===6){await p.locator('#board-panel').screenshot({path:'/tmp/pt-mid.png'}).catch(()=>{})}
  await p.waitForTimeout(350)
  if(tr.isGameOver())break
  const before=applied
  for(let t=0;t<60;t++){
    const sans=await ledgerSans(p)
    if(sans.length>=before+1){for(let i=before;i<sans.length;i++){try{tr.move(sans[i])}catch(e){}}applied=sans.length;break}
    const st=await p.locator('#board-status').innerText().catch(()=>'')
    if(/Victory|Defeat|Draw/i.test(st))break
    await p.waitForTimeout(250)
  }
}
await p.waitForTimeout(1500)
const status=await p.locator('#board-status').innerText().catch(()=>'?')
const overlay=await p.locator('.reward-overlay').isVisible().catch(()=>false)
console.log('FINAL:',JSON.stringify(status),'| over:',tr.isGameOver(),tr.isCheckmate()?'mate':'','| reward overlay:',overlay,'| plies:',applied)
await p.screenshot({path:'/tmp/pt-final.png'})
if(overlay){await p.locator('.reward-sheet').screenshot({path:'/tmp/pt-reward.png'}).catch(()=>{})}
console.log('--- ERRORS('+errors.length+') ---');errors.slice(0,15).forEach(e=>console.log(e))
await b.close()
