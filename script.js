let habits=JSON.parse(localStorage.getItem("habits"))||[];
let coins=JSON.parse(localStorage.getItem("coins"))||0;
let history=JSON.parse(localStorage.getItem("history"))||{};
let reflections=JSON.parse(localStorage.getItem("reflections"))||{};
let idToEdit=null, filter="All";

// Save
function save(){ localStorage.setItem("habits",JSON.stringify(habits));
  localStorage.setItem("coins",JSON.stringify(coins));
  localStorage.setItem("history",JSON.stringify(history));
  localStorage.setItem("reflections",JSON.stringify(reflections));
}

// Render Habits
function renderHabits(){
  const grid=document.getElementById("habits-grid"); grid.innerHTML="";
  habits.filter(h=>filter==="All"||h.category===filter).forEach(h=>{
    const div=document.createElement("div");
    div.className="habit-card";
    div.innerHTML=`<h3>${h.name}</h3>
      <p>${h.category}</p>
      <p>🔥 ${h.streak||0}</p>
      <button onclick="checkIn(${h.id})">Check-in</button>
      <button onclick="openEdit(${h.id})">Edit</button>
      <button onclick="delHabit(${h.id})">Delete</button>`;
    grid.appendChild(div);
  });
  document.getElementById("coin-counter").textContent=coins;
  renderStats();
}

// Add Habit
function addHabit(name,category="Personal"){ habits.push({id:Date.now(),name,category,streak:0,completions:[]}); save(); renderHabits(); }
document.getElementById("hero-add").onclick=()=>{const n=prompt("Habit?"); if(n) addHabit(n);};

// Check-in
function checkIn(id){
  const h=habits.find(x=>x.id===id); const today=new Date().toISOString().slice(0,10);
  if(!h.completions.includes(today)){ h.completions.push(today); h.streak++; coins++; if(!history[today]) history[today]=[]; history[today].push(h.name); save(); renderHabits(); renderCalendar(); openReflection(today);}
}

// Edit Habit
function openEdit(id){ idToEdit=id; const h=habits.find(x=>x.id===id);
  document.getElementById("modal-name").value=h.name;
  document.getElementById("modal-category").value=h.category;
  document.getElementById("habit-modal").classList.remove("hidden");
}
document.getElementById("modal-save").onclick=()=>{const h=habits.find(x=>x.id===idToEdit);
  h.name=document.getElementById("modal-name").value; h.category=document.getElementById("modal-category").value;
  save(); renderHabits(); document.getElementById("habit-modal").classList.add("hidden");};
document.getElementById("modal-cancel").onclick=()=>document.getElementById("habit-modal").classList.add("hidden");
function delHabit(id){ habits=habits.filter(h=>h.id!==id); save(); renderHabits(); }

// Calendar
function renderCalendar(){
  const grid=document.getElementById("calendar-grid"); grid.innerHTML="";
  const today=new Date(), days=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
  for(let i=1;i<=days;i++){ const d=new Date(today.getFullYear(),today.getMonth(),i).toISOString().slice(0,10);
    const cell=document.createElement("div"); cell.className="calendar-cell"; cell.textContent=i;
    if(history[d]) cell.classList.add("completed"); cell.onclick=()=>openReflection(d); grid.appendChild(cell);
  }
}

// Reflections
function openReflection(date){
  document.getElementById("reflection-text").value=reflections[date]||"";
  document.getElementById("reflection-modal").classList.remove("hidden");
  document.getElementById("reflection-save").onclick=()=>{ reflections[date]=document.getElementById("reflection-text").value; coins++; save();
    document.getElementById("reflection-modal").classList.add("hidden"); renderHabits();};
  document.getElementById("reflection-close").onclick=()=>document.getElementById("reflection-modal").classList.add("hidden");
}

// Stats
function renderStats(){ document.getElementById("total-habits").textContent=habits.length;
  const tot=habits.reduce((a,h)=>a+h.completions.length,0); document.getElementById("total-completions").textContent=tot;
  document.getElementById("avg-rate").textContent=(habits.length?Math.round(tot/(habits.length*30)*100):0)+"%"; renderChart();}
function renderChart(){ const ctx=document.getElementById("weeklyChart").getContext("2d"); const data=new Array(7).fill(0); const labels=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  habits.forEach(h=>h.completions.forEach(date=>{const d=new Date(date); if((new Date()-d)<7*864e5){ let i=d.getDay()-1; if(i<0)i=6; data[i]++;}}));
  new Chart(ctx,{type:"bar",data:{labels,datasets:[{data,backgroundColor:window.getComputedStyle(document.body).getPropertyValue('--accent')} ]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
}

// Store
document.querySelectorAll(".buy-btn").forEach(b=>b.onclick=()=>{let cost=+b.dataset.cost,theme=b.dataset.theme; if(coins>=cost){coins-=cost;document.body.dataset.theme=theme;save();alert("Theme Applied: "+theme);renderHabits();}else alert("Not enough coins");});

// Export/Import
document.getElementById("export-btn").onclick=()=>{const blob=new Blob([JSON.stringify({habits,coins,history,reflections})],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="habits.json"; a.click();};
document.getElementById("import-btn").onclick=()=>document.getElementById("import-input").click();
document.getElementById("import-input").onchange=e=>{const r=new FileReader(); r.onload=ev=>{const d=JSON.parse(ev.target.result); habits=d.habits||[];coins=d.coins||0;history=d.history||{};reflections=d.reflections||{};save();renderHabits();renderCalendar();}; r.readAsText(e.target.files[0]);};

// Filters
document.querySelectorAll(".filter-btn").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); filter=btn.dataset.filter; renderHabits(); });

// Init
(function init(){ document.body.dataset.theme=localStorage.getItem("theme")||"default"; document.getElementById("coin-counter").textContent=coins; renderHabits(); renderCalendar();})();