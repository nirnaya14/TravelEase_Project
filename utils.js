//
// PROMPT USED TO GENERATE THIS FILE:
// Build utils.js shared utility library for TravelEase frontend.
// Constants: API='', getToken()=localStorage 'te_token', getUser()=JSON.parse localStorage 'te_user', setAuth(token,user) saves both, clearAuth() removes both.
// apiFetch(path, method='GET', body=null): fetch with Content-Type:application/json + Authorization:Bearer token header, return r.json().
// toast(msg, type): create/reuse #toast div, set innerHTML to icon+msg, add class t-{type}+show, auto-remove show after 3500ms. Icons: ✅❌ℹ️⚠️.
// fmtMoney(n): '₹' + n.toLocaleString('en-IN').
// fmtDate(d): new Date(d).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}).
// initials(n): first letter of each word joined, max 2 chars uppercase.
// BADGE map: confirmed→b-green, completed→b-cyan, cancelled→b-red, pending→b-yellow, paid→b-green, failed→b-red, refunded→b-purple, active→b-green, user→b-blue, admin→b-purple.
// badge(text): returns <span class="badge {BADGE[text]||b-gray}">{text}</span>.
// TICON map: bus→🚌, flight→✈️, train→🚂, car→🚗, auto→🛺, bike→🏍️.
// TCOLOR map: bus→rc-bus, flight→rc-flight, train→rc-train, car→rc-car, auto→rc-auto, bike→rc-bike.
// logout(redirect='/login'): clearAuth() + navigate redirect.
// requireLogin(): getUser() or redirect /login, return user.
// requireAdmin(): getUser() + role=admin check or redirect /admin-login, return user.
// updateNavbar(): read user, toggle display of loginBtn/registerBtn/logoutBtn/myBookingsLink/dashboardLink/adminLink/userGreeting based on auth state and role.
//
const API = '';
const getToken = () => localStorage.getItem('te_token') || '';
const getUser  = () => JSON.parse(localStorage.getItem('te_user') || 'null');
const setAuth  = (token, user) => { localStorage.setItem('te_token', token); localStorage.setItem('te_user', JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem('te_token'); localStorage.removeItem('te_user'); };

async function apiFetch(path, method='GET', body=null) {
  const h = { 'Content-Type':'application/json' };
  const t = getToken(); if(t) h['Authorization'] = 'Bearer ' + t;
  const r = await fetch(API + path, { method, headers:h, body: body ? JSON.stringify(body) : null });
  return r.json();
}

function toast(msg, type='info') {
  let t = document.getElementById('toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  const icons = { success:'✅', error:'❌', info:'ℹ️', warn:'⚠️' };
  t.innerHTML = (icons[type]||'') + ' ' + msg;
  t.className = 'toast t-' + type + ' show';
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 3500);
}

function fmtMoney(n){ return '₹' + (n||0).toLocaleString('en-IN'); }
function fmtDate(d){ return d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'; }
function initials(n){ return (n||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

const BADGE = { confirmed:'b-green', completed:'b-cyan', cancelled:'b-red', pending:'b-yellow', paid:'b-green', failed:'b-red', refunded:'b-purple', active:'b-green', inactive:'b-gray', user:'b-blue', admin:'b-purple' };
function badge(text){ return `<span class="badge ${BADGE[text]||'b-gray'}">${text}</span>`; }

const TICON = { bus:'🚌', flight:'✈️', train:'🚂', car:'🚗', auto:'🛺', bike:'🏍️' };
const TCOLOR = { bus:'rc-bus', flight:'rc-flight', train:'rc-train', car:'rc-car', auto:'rc-auto', bike:'rc-bike' };

function logout(redirect='/login') {
  clearAuth();
  window.location.href = redirect;
}

function requireLogin() {
  const user = getUser();
  if(!user) { window.location.href = '/login'; return false; }
  return user;
}

function requireAdmin() {
  const user = getUser();
  if(!user || user.role !== 'admin') { window.location.href = '/admin-login'; return false; }
  return user;
}

function updateNavbar() {
  const user = getUser();
  const loginBtn   = document.getElementById('loginBtn');
  const registerBtn= document.getElementById('registerBtn');
  const logoutBtn  = document.getElementById('logoutBtn');
  const myBkLink   = document.getElementById('myBookingsLink');
  const dashLink   = document.getElementById('dashboardLink');
  const adminLink  = document.getElementById('adminLink');
  const greeting   = document.getElementById('userGreeting');
  if(user) {
    if(loginBtn)    loginBtn.style.display='none';
    if(registerBtn) registerBtn.style.display='none';
    if(logoutBtn)   logoutBtn.style.display='';
    if(myBkLink)    myBkLink.style.display='';
    if(dashLink)    dashLink.style.display='';
    if(adminLink && user.role==='admin') adminLink.style.display='';
    if(greeting)  { greeting.style.display=''; greeting.textContent='Hi, '+user.name.split(' ')[0]; }
  }
}
