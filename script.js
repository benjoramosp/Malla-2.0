// ==== GESTIÓN DE LOCALSTORAGE ====

function obtenerAprobados() {
  const data = localStorage.getItem('mallaAprobados');
  return data ? JSON.parse(data) : [];
}

function guardarAprobados(aprobados) {
  localStorage.setItem('mallaAprobados', JSON.stringify(aprobados));
}

// ==== CREAR SEMESTRES ====

function crearSemestres() {
  const contenedor = document.querySelector(".linea-tiempo");
  for (let i = 1; i <= 14; i++) {
    const div = document.createElement("div");
    div.className = `semestre semestre-${i}`;

    // Ciclo visual
    if (i <= 4) div.classList.add("basico");
    else if (i <= 10) div.classList.add("intermedio");
    else div.classList.add("avanzado");

    const h3 = document.createElement("h3");
    h3.textContent = `Semestre ${i}`;
    div.appendChild(h3);
    contenedor.appendChild(div);
  }
}

// ==== CREAR RAMO ====

function crearRamo(nombre, datos) {
  const div = document.createElement("div");
  div.className = `ramo bloqueado ${datos.ciclo}`;
  div.textContent = nombre;
  div.dataset.nombre = nombre;
  div.dataset.estado = "bloqueado";
  div.id = nombre;

  const col = document.querySelector(`.semestre-${datos.semestre}`);
  if (col) col.appendChild(div);
}

// ==== DESBLOQUEAR ====

function desbloquear(nombre) {
  const div = document.querySelector(`.ramo[data-nombre="${nombre}"]`);
  if (!div || div.dataset.estado !== "bloqueado") return;

  const requisitos = ramos[nombre].requisitos || [];
  const cumple = requisitos.every(req => {
    const elem = document.querySelector(`.ramo[data-nombre="${req}"]`);
    return elem && elem.dataset.estado === "aprobado";
  });

  if (cumple) {
    div.classList.remove("bloqueado");
    div.classList.add("activo");
    div.dataset.estado = "activo";

    div.addEventListener("click", () => manejarAprobacion(div));
  }
}

// ==== MANEJAR APROBACIÓN Y DESAPROBACIÓN ====

function manejarAprobacion(div) {
  const nombre = div.dataset.nombre;
  const estado = div.dataset.estado;

  if (estado === "bloqueado") return;

  const aprobados = obtenerAprobados();
  const yaAprobado = aprobados.includes(nombre);

  if (yaAprobado) {
    // Desaprobar
    div.classList.remove("aprobado");
    div.dataset.estado = "activo";
    guardarAprobados(aprobados.filter(r => r !== nombre));
  } else {
    // Aprobar
    div.classList.remove("activo");
    div.classList.add("aprobado");
    div.dataset.estado = "aprobado";
    guardarAprobados([...aprobados, nombre]);

    // Desbloquear los que abre
    (ramos[nombre].abre || []).forEach(desbloquear);
  }

  // Clonar para evitar listeners duplicados
  const clon = div.cloneNode(true);
  clon.addEventListener("click", () => manejarAprobacion(clon));
  div.parentNode.replaceChild(clon, div);
}

// ==== CARGAR ESTADO GUARDADO Y DESBLOQUEAR ====

function cargarEstado() {
  const aprobados = obtenerAprobados();

  aprobados.forEach(nombre => {
    const div = document.querySelector(`.ramo[data-nombre="${nombre}"]`);
    if (div) {
      div.classList.remove("bloqueado", "activo");
      div.classList.add("aprobado");
      div.dataset.estado = "aprobado";

      // Desbloquear lo que abre
      (ramos[nombre].abre || []).forEach(desbloquear);
    }
  });
}

// ==== INICIALIZAR ====

document.addEventListener("DOMContentLoaded", () => {
  crearSemestres();
  Object.entries(ramos).forEach(([nombre, datos]) => crearRamo(nombre, datos));
  cargarEstado();

  Object.entries(ramos).forEach(([nombre, datos]) => {
    const requisitos = datos.requisitos || [];
    if (requisitos.length === 0) desbloquear(nombre);
  });
});
