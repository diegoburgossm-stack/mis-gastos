const monto = document.getElementById("monto");
const categoria = document.getElementById("categoria");
const nota = document.getElementById("nota");
const guardarBtn = document.getElementById("guardar");
const lista = document.getElementById("lista");
const empty = document.querySelector(".empty");

let chart;

guardarBtn.addEventListener("click", guardarGasto);

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
  id: Date.now(),
  monto: Number(monto.value),
  categoria: categoria.value,
  nota: nota.value,
  fecha: new Date().toISOString()
});

  guardarGastos(data);

  monto.value = "";
  nota.value = "";

  render();
  mostrarFeedback();
}

function eliminar(id) {
  const data = obtenerGastos().filter(g => g.id !== id);
  guardarGastos(data);
  render();
}

function render() {
  const data = obtenerGastos();
  lista.innerHTML = "";

  empty.style.display = data.length ? "none" : "block";

  data.forEach(g => {
    const li = document.createElement("li");
    li.innerHTML = `
  <div>
    <strong>${g.categoria}</strong>
    <div style="font-size: 12px; color: #888;">
      ${new Date(g.fecha).toLocaleDateString()}
    </div>
  </div>
  <div>
    $${g.monto}
    <button onclick="eliminar(${g.id})">✕</button>
  </div>
`;
    lista.appendChild(li);
  });

  renderGrafico(data);
  calcularTotalMes(data);
  renderDashboard(data);
  function renderDashboard(data) {
  const ahora = new Date();
  const mes = ahora.getMonth();
  const anio = ahora.getFullYear();

  const gastosMes = data.filter(g => {
    const f = new Date(g.fecha);
    return f.getMonth() === mes && f.getFullYear() === anio;
  });

  // Cantidad de gastos
  document.getElementById("cantidadMes").textContent = gastosMes.length;

  // Categoría más usada
  const contador = {};
  gastosMes.forEach(g => {
    contador[g.categoria] = (contador[g.categoria] || 0) + 1;
  });

  let top = "-";
  let max = 0;

  for (let cat in contador) {
    if (contador[cat] > max) {
      max = contador[cat];
      top = cat;
    }
  }

  document.getElementById("categoriaTop").textContent = top;
}
  function calcularTotalMes(data) {
  const ahora = new Date();
  const mes = ahora.getMonth();
  const anio = ahora.getFullYear();

  const total = data
    .filter(g => {
      const f = new Date(g.fecha);
      return f.getMonth() === mes && f.getFullYear() === anio;
    })
    .reduce((sum, g) => sum + g.monto, 0);

  document.getElementById("totalMes").textContent = `$${total}`;
}
}

function renderGrafico(data) {
  const totalPorCategoria = {};

  data.forEach(g => {
    totalPorCategoria[g.categoria] =
      (totalPorCategoria[g.categoria] || 0) + g.monto;
  });

  const ctx = document.getElementById("grafico");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(totalPorCategoria),
      datasets: [{
        data: Object.values(totalPorCategoria)
      }]
    }
  });
}

function mostrarFeedback() {
  const toast = document.getElementById("toast");
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 1500);
}

render();
