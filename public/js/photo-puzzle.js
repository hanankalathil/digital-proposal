document.addEventListener('DOMContentLoaded',()=>{
const grid=document.getElementById('memory-puzzle');if(!grid)return;
const status=document.getElementById('puzzle-status'),shuffle=document.getElementById('puzzle-shuffle'),hint=document.getElementById('puzzle-hint'),preview=document.getElementById('puzzle-preview');
let tiles=[0,1,2,3,4,5,6,7,8],moves=0,won=false;
const adjacent=(a,b)=>Math.abs(Math.floor(a/3)-Math.floor(b/3))+Math.abs(a%3-b%3)===1;
function draw(){grid.replaceChildren();const empty=tiles.indexOf(8);tiles.forEach((tile,i)=>{const b=document.createElement('button');b.type='button';b.className='puzzle-tile'+(tile===8?' empty':adjacent(i,empty)?' movable':'');b.setAttribute('aria-label',tile===8?'Empty space':`Move picture tile ${tile+1}`);b.disabled=tile===8||won;b.style.backgroundPosition=`${(tile%3)*50}% ${Math.floor(tile/3)*50}%`;b.addEventListener('click',()=>move(i));grid.append(b)})}
function move(i){const e=tiles.indexOf(8);if(won||!adjacent(i,e))return;[tiles[i],tiles[e]]=[tiles[e],tiles[i]];moves++;won=tiles.every((v,i)=>v===i);status.textContent=won?`Beautiful! You solved it in ${moves} moves 💗`:`${moves} moves · Keep going!`;draw()}
function reset(){tiles=[0,1,2,3,4,5,6,7,8];let last=-1;for(let i=0;i<55;i++){const e=tiles.indexOf(8),opts=[e-3,e+3,e%3?e-1:-1,e%3<2?e+1:-1].filter(n=>n>=0&&n<9&&n!==last);const next=opts[Math.floor(Math.random()*opts.length)];[tiles[e],tiles[next]]=[tiles[next],tiles[e]];last=e}moves=0;won=false;status.textContent='Can you solve it?';draw()}
shuffle.addEventListener('click',reset);hint.addEventListener('click',()=>{preview.hidden=!preview.hidden;hint.textContent=preview.hidden?'Show picture':'Hide picture'});reset();
});