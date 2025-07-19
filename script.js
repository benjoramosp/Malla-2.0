// ==== FUNCIONES PARA LOCALSTORAGE ====

function obtenerAprobados() {
  const data = localStorage.getItem('mallaAprobados');
  return data ? JSON.parse(data) : [];
}

function guardarAprobados(aprobados) {
  localStorage.setItem('mallaAprobados', JSON.stringify(aprobados));
}

// ==== FUNCIÓN PARA CREAR LA MALLA ====

function crearMalla() {
  const lineaTiempo = document.querySelector('.linea-tiempo');
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

        if (aprobados.includes(nombre)) {
          divRamo.classList.add('aprobado');
        }

        divRamo.textContent = nombre;

        divRamo.addEventListener('click', aprobar);
        divSemestre.appendChild(divRamo);
      }
    }

    lineaTiempo.appendChild(divSemestre);
  }

  actualizarDesbloqueos();
}

// ==== FUNCIÓN PARA ACTUALIZAR DESBLOQUEOS ====

function actualizarDesbloqueos() {
  const aprobados = obtenerAprobados();

  for (const [nombre, datos] of Object.entries(ramos)) {
    const elemento = document.getElementById(nombre);
    if (!elemento) continue;

    const cumpleRequisitos = (datos.requisitos || []).every(r => aprobados.includes(r));

    if (!elemento.classList.contains('aprobado')) {
      if (cumpleRequisitos) {
        elemento.classList.remove('bloqueado');
        elemento.classList.add('activo');
      } else {
        elemento.classList.add('bloqueado');
        elemento.classList.remove('activo');
      }
    } else {
      elemento.classList.remove('bloqueado');
    }
  }
}

// ==== FUNCIÓN PARA APROBAR O DESAPROBAR ====

function aprobar(e) {
  const ramo = e.currentTarget;
  if (ramo.classList.contains('bloqueado')) return;

  ramo.classList.toggle('aprobado');

  const aprobados = obtenerAprobados();
  const id = ramo.id;

  if (ramo.classList.contains('aprobado')) {
    if (!aprobados.includes(id)) aprobados.push(id);
  } else {
    const idx = aprobados.indexOf(id);
    if (idx > -1) aprobados.splice(idx, 1);
  }

  guardarAprobados(aprobados);
  actualizarDesbloqueos();
}

// ==== INICIALIZAR ====

window.addEventListener('DOMContentLoaded', () => {
  crearMalla();
});
