// ==== GESTIÓN DE LOCALSTORAGE ====

function obtenerAprobados() {
  const data = localStorage.getItem('mallaAprobados');
  return data ? JSON.parse(data) : [];
}

function guardarAprobados(aprobados) {
  localStorage.setItem('mallaAprobados', JSON.stringify(aprobados));
}

// ==== CREAR LA MALLA ====

function crearMalla() {
  const lineaTiempo = document.querySelector('.linea-tiempo');
  if (!lineaTiempo) return;

  const aprobados = obtenerAprobados();

  for (let semestre = 1; semestre <= 14; semestre++) {
    const divSemestre = document.createElement('div');
    divSemestre.classList.add('semestre');

    // Asignar clase de ciclo
    if (semestre <= 4) divSemestre.classList.add('basico');
    else if (semestre <= 10) divSemestre.classList.add('intermedio');
    else divSemestre.classList.add('avanzado');

    const h3 = document.createElement('h3');
    h3.textContent = `Semestre ${semestre}`;
    divSemestre.appendChild(h3);

    for (const [nombre, datos] of Object.entries(ramos)) {
      if (datos.semestre === semestre) {
        const divRamo = document.createElement('div');
        divRamo.classList.add('ramo', datos.ciclo);
        divRamo.id = nombre;
        divRamo.textContent = nombre;

        if (aprobados.includes(nombre)) {
          divRamo.classList.add('aprobado');
        }

        divRamo.addEventListener('click', manejarAprobacion);
        divSemestre.appendChild(divRamo);
      }
    }

    lineaTiempo.appendChild(divSemestre);
  }

  actualizarDesbloqueos();
}

// ==== ACTUALIZAR DESBLOQUEOS ====

function actualizarDesbloqueos() {
  const aprobados = obtenerAprobados();

  for (const [nombre, datos] of Object.entries(ramos)) {
    const elemento = document.getElementById(nombre);
    if (!elemento) continue;

    const requisitos = datos.requisitos || [];
    const desbloqueado = requisitos.every(req => aprobados.includes(req));

    if (!elemento.classList.contains('aprobado')) {
      if (desbloqueado) {
        elemento.classList.remove('bloqueado');
      } else {
        elemento.classList.add('bloqueado');
      }
    } else {
      elemento.classList.remove('bloqueado');
    }
  }
}

// ==== MANEJAR APROBACIÓN ====

function manejarAprobacion(e) {
  const ramo = e.currentTarget;
  if (ramo.classList.contains('bloqueado')) return;

  ramo.classList.toggle('aprobado');

  const aprobados = obtenerAprobados();
  const nombre = ramo.id;

  if (ramo.classList.contains('aprobado')) {
    if (!aprobados.includes(nombre)) aprobados.push(nombre);
  } else {
    const index = aprobados.indexOf(nombre);
    if (index > -1) aprobados.splice(index, 1);
  }

  guardarAprobados(aprobados);
  actualizarDesbloqueos();
}

// ==== INICIALIZACIÓN ====

document.addEventListener('DOMContentLoaded', crearMalla);
