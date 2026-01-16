const monto = document.getElementById("monto");
const categoria = document.getElementById("categoria");
const fechaInput = document.getElementById("fecha");
const nota = document.getElementById("nota");
const guardarBtn = document.getElementById("guardar");
const lista = document.getElementById("lista");
const empty = document.querySelector(".empty");
const editMonto = document.getElementById("editMonto");
const editCategoria = document.getElementById("editCategoria");
const editFecha = document.getElementById("editFecha");
const editNota = document.getElementById("editNota");
const sheet = document.getElementById("sheet");


let chart;
let editId = null;

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
    fecha: fechaInput.value || new Date().toISOString().split("T")[0]
  });

  guardarGastos(data);

  monto.value = "";
  nota.value = "";
  fechaInput.value = "";

  render();
  mostrarFeedback();
}

function eliminar(id) {
  const data = obtenerGastos().filter(g => g.id !== id);
  guardarGastos(data);
  render();
}

function abrirEdicion(gasto) {
  editId = gasto.id;
  editMonto.value = gasto.monto;
  editCategoria.value = gasto.categoria;
  editFecha.value = gasto.fecha;
  editNota.value = gasto.nota || "";
  sheet.classList.remove("hidden");
}


function guardarEdicion() {
  const data = obtenerGastos().map(g =>
    g.id === editId
      ? {
          ...g,
          monto: Number(editMonto.value),
          categoria: editCategoria.value,
          fecha: editFecha.value,
          nota: editNota.value
        }
      : g
  );

  guardarGastos(data);
  cerrarSheet();
  render();
}


function cerrarSheet() {
  sheet.classList.add("hidden");
  editId = null;
}


function render() {
  const data = obtenerGastos();
  lista.innerHTML = "";
  empty.style.display = data.length ? "none" : "block";

  data.forEach(g => {
  const li = document.createElement("li");
  li.className = "swipe-item";

  li.innerHTML = `
    <div class="swipe-delete">Eliminar</div>
    <div class="swipe-content">
      <div>
        <strong>${g.categoria}</strong>
        <div style="font-size:12px;color:#888">
          ${new Date(g.fecha).toLocaleDateString()}
        </div>
      </div>
      <div>$${g.monto}</div>
    </div>
  `;

  // ELIMINAR
  li.querySelector(".swipe-delete").addEventListener("click", () => {
    eliminar(g.id);
  });

  // EDITAR (tap normal)
  li.querySelector(".swipe-content").addEventListener("click", () => {
    abrirEdicion(g);
  });

  lista.appendChild(li);
});


  renderGrafico(data);
  calcularTotalMes(data);
  renderCategoriaTop(data);
}

function calcularTotalMes(data) {
  const now = new Date();
  const total = data
    .filter(g => {
      const f = new Date(g.fecha);
      return f.getMonth() === now.getMonth() &&
             f.getFullYear() === now.getFullYear();
    })
    .reduce((s, g) => s + g.monto, 0);

  document.getElementById("totalMes").textContent = `$${total}`;
}

function renderCategoriaTop(data) {
  const contador = {};
  data.forEach(g => {
    contador[g.categoria] = (contador[g.categoria] || 0) + 1;
  });

  let top = "-";
  let max = 0;
  for (let c in contador) {
    if (contador[c] > max) {
      max = contador[c];
      top = c;
    }
  }

  document.getElementById("categoriaTop").textContent = top;
}

function renderGrafico(data) {
  const totals = {};
  data.forEach(g => {
    totals[g.categoria] = (totals[g.categoria] || 0) + g.monto;
  });

  const ctx = document.getElementById("grafico");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(totals),
      datasets: [{ data: Object.values(totals) }]
    }
  });
}

function mostrarFeedback() {
  const toast = document.getElementById("toast");
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 1500);
}

/* SWIPE */
let startX = 0;
let currentItem = null;

document.addEventListener("touchstart", e => {
  currentItem = e.target.closest(".swipe-item");
  if (!currentItem) return;
  startX = e.touches[0].clientX;
});

document.addEventListener("touchmove", e => {
  if (!currentItem) return;
  const diff = e.touches[0].clientX - startX;
  if (diff < -20) {
    currentItem.querySelector(".swipe-content").style.transform =
      "translateX(-80px)";
  }
});

document.addEventListener("touchend", () => {
  currentItem = null;
});

render();
