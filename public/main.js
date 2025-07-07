
document.addEventListener('DOMContentLoaded', () => {
  const camposFolio = ['folio1', 'folio2', 'folio3'];

  camposFolio.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.value = generarFolio();
    }
  });

  function generarFolio() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `Rpt. No.-${año}${mes}${dia}-${random}`;
  }
});




document.addEventListener('DOMContentLoaded', function () {
  const camposFecha = [
    { visible: 'date1', hidden: 'date_hidden1' },
    { visible: 'date2', hidden: 'date_hidden2' },
    { visible: 'date3', hidden: 'date_hidden3' }
  ];

  const hoy = new Date().toISOString().split('T')[0];

  camposFecha.forEach(({ visible, hidden }) => {
    const visibleInput = document.getElementById(visible);
    const hiddenInput = document.getElementById(hidden);
    if (visibleInput && hiddenInput) {
      visibleInput.value = hoy;
      hiddenInput.value = hoy; // ✅ Esto asegura que sí se mande
    }
  });
});



function mostrarFiltro1() {
  ocultarTodo();
  document.getElementById('inicio').classList.add('hidden');
  document.getElementById('selectorEvaluacion').classList.remove('hidden');
}

function exit() {
  location.reload();
}


function showSection(tipo) {
  ocultarTodo(); // Asegúrate de que esta función oculte todas las secciones

  if (tipo === "herramentales") {
    document.getElementById('filtro2').classList.remove('hidden');
  } else if (tipo === "capacidad") {
    document.getElementById('formularioCapacidades').classList.remove('hidden');
  } else if (tipo === "otros") {
    document.getElementById('formularioOtros').classList.remove('hidden');
  } else {
    document.getElementById('mensajeNoApoyo').classList.remove('hidden');
  }
}



// Imagen 1: libreta → muestra ejem1H.png
document.addEventListener("DOMContentLoaded", () => {
  const libreta = document.getElementById("libreta");
  if (libreta) {
    libreta.addEventListener("click", mostrarImagen); // usa mostrarImagen()
  } else {
    console.error("No se encontró la imagen con ID 'libreta'");
  }

  // Imagen 2: tabla → muestra ejemtable.png
  const table_ejem = document.getElementById("table_ejem");
  if (table_ejem) {
    table_ejem.addEventListener("click", mostrarImagenTabla); // usa mostrarImagenTabla()
  } else {
    console.error("No se encontró la imagen con ID 'table_ejem'");
  }
});

// Función para mostrar ejem1H.png
function mostrarImagen() {
  mostrarImagenOverlay("img/ejem1H.png");
}

// Función para mostrar ejemtable.png
function mostrarImagenTabla() {
  mostrarImagenOverlay("img/ejemtable.png");
}

// Función reutilizable que muestra imagen en overlay
function mostrarImagenOverlay(src) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const imagen = document.createElement("img");
  imagen.src = src;
  imagen.style.maxWidth = "90%";
  imagen.style.maxHeight = "90%";
  imagen.style.border = "5px solid white";
  imagen.style.borderRadius = "10px";
  imagen.style.boxShadow = "0 0 20px white";

  imagen.addEventListener("click", (e) => e.stopPropagation());
  overlay.addEventListener("click", () => document.body.removeChild(overlay));

  overlay.appendChild(imagen);
  document.body.appendChild(overlay);
}





function respuestaCoP(esCoP) {
  ocultarTodo();
  if (esCoP) {
    document.getElementById('mensajeNoApoyo').classList.remove('hidden');
  } else {
    document.getElementById('formularioHerramentales').classList.remove('hidden');;
  }
}




function ocultarTodo() {
  const secciones = [
    'selectorEvaluacion', 'filtro2', 'filtro3',
    'mensajeApoyo', 'mensajeNoApoyo', 'formularioHerramentales',
    'formularioCapacidades', 'formularioOtros'
  ];
  secciones.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}


function addRow(button) {
  const table = button.closest("form").querySelector("table tbody");
  if (!table) return;

  const newRow = table.rows[0].cloneNode(true);
  const inputs = newRow.querySelectorAll("input");

  inputs.forEach(input => input.value = "");
  table.appendChild(newRow);
}




document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() + 16); // Hoy + 16 días (para permitir a partir del día 16)

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const inputs = document.querySelectorAll("input[name='visit_date']");
  inputs.forEach(input => {
    input.min = formatDate(minDate);
    // Si quieres, puedes establecer un límite máximo opcional
    // input.max = "9999-12-31"; // o cualquier fecha máxima que desees
  });
});





function setupFormHandler(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const plainObject = {};

    formData.forEach((value, key) => {
      if (plainObject[key]) {
        if (Array.isArray(plainObject[key])) {
          plainObject[key].push(value);
        } else {
          plainObject[key] = [plainObject[key], value];
        }
      } else {
        plainObject[key] = value;
      }
    });

    fetch("/enviar-formulario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(plainObject)
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      this.reset();
      window.location.href = "/"; // O ajusta a tu ruta inicial
    })
    .catch(err => {
      console.error("Error al enviar:", err);
      alert("Hubo un error al enviar el formulario");
    });
  });
}

// Configura los 3 formularios
setupFormHandler("formularioEvaluacionHerramentales");
setupFormHandler("formularioEvaluacionCapacidades");
setupFormHandler("formularioEvaluacionOtros");














