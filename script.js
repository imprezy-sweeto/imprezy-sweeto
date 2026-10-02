(function(){
var nav=document.getElementById('nav'),b=document.getElementById('burger');
function tog(o){nav.classList.toggle('open',o);b.setAttribute('aria-expanded',o)}
b.addEventListener('click',function(){tog(!nav.classList.contains('open'))});
nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){tog(false)})});
document.getElementById('yr').textContent=new Date().getFullYear();
document.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){
document.querySelectorAll('#chips input').forEach(function(c){if(c.value===a.dataset.pick)c.checked=true})})});
var f=document.getElementById('f');
function set(el,msg){var w=el.closest('.f');w.classList.toggle('invalid',!!msg);var e=w.querySelector('.err');if(e)e.textContent=msg||''; return !msg}
f.addEventListener('submit',function(ev){
ev.preventDefault();var ok=true,v=function(id){return f[id].value.trim()};
ok&=set(f.imie,v('imie')?'':'Podaj imię.');
var t=v('tel'),m=v('mail'),cm=!!(t||m);
set(f.tel,cm?'':'Podaj numer telefonu lub adres e-mail.');
if(!cm)ok=false;
if(t&&!/^[+\d][\d\s-]{6,}$/.test(t)){set(f.tel,'Podaj poprawny numer telefonu.');ok=false}
if(m&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)){set(f.mail,'Podaj poprawny adres e-mail.');ok=false}else if(m||!cm)set(f.mail,'');
ok&=set(f.data,v('data')?'':'Wybierz datę wydarzenia.');
ok&=set(f.miejsce,v('miejsce')?'':'Podaj miejsce wydarzenia.');
ok&=set(f.rodzaj,v('rodzaj')?'':'Wybierz rodzaj wydarzenia.');
ok&=set(f.msg,v('msg')?'':'Napisz krótką wiadomość.');
var z=document.getElementById('zgoda');ok&=set(z,z.checked?'':'Zaznacz zgodę, aby wysłać zapytanie.');
if(ok){
var pick=[].map.call(document.querySelectorAll('#chips input:checked'),function(c){return c.value}).join(', ');
var body='Imię: '+v('imie')+'\nTelefon: '+t+'\nE-mail: '+m+'\nData wydarzenia: '+v('data')+'\nMiejsce: '+v('miejsce')+'\nRodzaj wydarzenia: '+v('rodzaj')+'\nLiczba gości: '+v('goscie')+'\nAtrakcje: '+pick+'\n\nWiadomość:\n'+v('msg');
window.location.href='mailto:barkra1977@gmail.com?subject='+encodeURIComponent('Zapytanie o termin — '+v('rodzaj')+', '+v('data'))+'&body='+encodeURIComponent(body);
f.reset();document.getElementById('ok').style.display='block';document.getElementById('ok').scrollIntoView({block:'center'})}
else{var first=f.querySelector('.invalid input,.invalid select,.invalid textarea');if(first)first.focus()}
});
})();
