
(function(){
const overlay=document.getElementById('welcomeOverlay');
const key='innenleben-journal-welcome-seen-v1';
function openWelcome(){overlay.hidden=false;document.body.style.overflow='hidden';document.getElementById('welcomeContinue').focus()}
function closeWelcome(){overlay.hidden=true;document.body.style.overflow='';try{localStorage.setItem(key,'1')}catch(e){}}
document.getElementById('welcomeContinue').addEventListener('click',closeWelcome);
document.getElementById('welcomeAgain').addEventListener('click',openWelcome);
try{if(localStorage.getItem(key)!=='1')openWelcome()}catch(e){openWelcome()}
})();
