let chartCat, chartMes;

// ---------- SEGURIDAD ----------
if (!localStorage.getItem("pin")) {
  localStorage.setItem("pin","1234"); // cambia luego
}

function verificarPIN() {
  if (pinInput.value === localStorage.getItem("pin")) {
    login.classList.add("hidden");
    app.classList.remove("hidden");
    render();
  }
}

// ---------- DATOS ----------
function obtenerGastos() {
  return JSON.parse(localStorage.getItem("gastos")) || [];
}

function guardarGastos(data) {
  localStorage.setItem("gastos", JSON.stringify(data));
}

function guardarGasto() {
  if (!monto.value) return;

  const data = obtenerGastos();
  data.push({
    id:Date.now(),
    monto:+monto.value,
    categoria:categoria.value,
    nota:nota.value,
    fecha:new Date().toISOString()
  });

  guardarGastos(data);
  monto.value = nota.value = "";
  render();
}

function eliminar(id) {
  if (!confirm("¿Eliminar este gasto?")) return;
  guardarGastos(obtenerGastos().filter(g => g.id !== id));
  mostrarFeedback();
  render();
}


// ---------- FILTRO ----------
function filtrados() {
  const mes = mesFiltro.value;
  return obtenerGastos().filter(g =>
    !mes || g.fecha.startsWith(mes)
  );
}

// ---------- RENDER ----------
function render() {
  lista.innerHTML = "";

if (filtrados().length === 0) {
  lista.innerHTML = `<div class="empty">No hay gastos este mes</div>`;
}
  let resumen = {}, meses = {}, total = 0;

  filtrados().forEach(g=>{
    total += g.monto;
    resumen[g.categoria]=(resumen[g.categoria]||0)+g.monto;
    const mes = g.fecha.slice(0,7);
    meses[mes]=(meses[mes]||0)+g.monto;

    const li = document.createElement("li");
    li.innerHTML = `
      ${g.categoria} $${g.monto}<br><small>${g.nota||""}</small>
      <button onclick="eliminar(${g.id})">🗑</button>
    `;
    lista.appendChild(li);
  });

  actualizarPresupuesto(total);
  graficoCategoria(resumen);
  graficoMensual(meses);
}

// ---------- GRÁFICOS ----------
function graficoCategoria(data) {
  if (chartCat) chartCat.destroy();
  chartCat = new Chart(graficoCategoriaCanvas, {
    type:"doughnut",
    data:{ labels:Object.keys(data), datasets:[{data:Object.values(data)}] }
  });
}

function graficoMensual(data) {
  if (chartMes) chartMes.destroy();
  chartMes = new Chart(graficoMesCanvas, {
    type:"bar",
    data:{ labels:Object.keys(data), datasets:[{data:Object.values(data)}] }
  });
}

// ---------- PRESUPUESTO ----------
function guardarPresupuesto() {
  localStorage.setItem("presupuesto", presupuesto.value);
  render();
}

function actualizarPresupuesto(total) {
  const p = localStorage.getItem("presupuesto");
  if (!p) return;
  estadoPresupuesto.textContent =
    total>p ? `⚠️ Excedido $${total}/${p}` : `✅ OK $${total}/${p}`;
}

// ---------- EXPORTAR ----------
function exportarCSV() {
  let csv = "Monto,Categoria,Nota,Fecha\n";
  obtenerGastos().forEach(g=>{
    csv+=`${g.monto},${g.categoria},${g.nota||""},${g.fecha}\n`;
  });
  descargar(csv,"gastos.csv");
}

// ---------- BACKUP ----------
function backup() {
  descargar(JSON.stringify(localStorage),"backup.json");
}

function restore(input) {
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = e=>{
    const data = JSON.parse(e.target.result);
    Object.keys(data).forEach(k=>localStorage.setItem(k,data[k]));
    location.reload();
  };
  reader.readAsText(file);
}

// ---------- UTIL ----------
function descargar(data,nombre) {
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([data]));
  a.download=nombre;
  a.click();
}

// ---------- ELEMENTOS ----------
const monto=document.getElementById("monto");
const nota=document.getElementById("nota");
const categoria=document.getElementById("categoria");
const lista=document.getElementById("lista");
const presupuesto=document.getElementById("presupuesto");
const estadoPresupuesto=document.getElementById("estadoPresupuesto");
const mesFiltro=document.getElementById("mesFiltro");
const graficoCategoriaCanvas=document.getElementById("graficoCategoria");
const graficoMesCanvas=document.getElementById("graficoMes");
const feedback = document.getElementById("feedback");

function mostrarFeedback() {
  const feedback = document.getElementById("feedback");
  if (!feedback) return;

  feedback.classList.remove("hidden");

  setTimeout(() => {
    feedback.classList.add("hidden");
  }, 1500);
}

