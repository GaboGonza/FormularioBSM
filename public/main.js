
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
    return `FOL-${año}${mes}${dia}-${random}`;
  }
});




document.addEventListener('DOMContentLoaded', function () {
  const hoy = new Date().toISOString().split('T')[0];
  const camposFecha = ['date1', 'date2', 'date3'];

  camposFecha.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.value = hoy;
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


function respuestaCoP(esCoP) {
  ocultarTodo();
  if (esCoP) {
    document.getElementById('mensajeNoApoyo').classList.remove('hidden');
  } else {
    document.getElementById('filtro3').classList.remove('hidden');
  }
}

function respuestaCantidad(mayor800T) {
  ocultarTodo();
  if (mayor800T) {
    document.getElementById('mensajeNoApoyo').classList.remove('hidden');
  } else {
    document.getElementById('formularioHerramentales').classList.remove('hidden');
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


function addRow() {
  const table = document.getElementById("partsTable").getElementsByTagName('tbody')[0];
  const newRow = table.rows[0].cloneNode(true);
  const inputs = newRow.getElementsByTagName('input');
  for (let input of inputs) {
    input.value = ""; // Clear the input values
  }
  table.appendChild(newRow);
}



document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 15);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const inputs = document.querySelectorAll("input[name='visit_date']");
  inputs.forEach(input => {
    input.min = formatDate(today);
    input.max = formatDate(maxDate);
  });
});





document.addEventListener("DOMContentLoaded", () => {
  const formularios = [
    "formularioEvaluacionHerramentales",
    "formularioEvaluacionCapacidades",
    "formularioEvaluacionOtros"
  ];

  formularios.forEach(id => {
    const form = document.getElementById(id);
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = {};

        formData.forEach((value, key) => {
          if (key.endsWith("[]")) {
            const cleanKey = key.replace("[]", "");
            if (!data[cleanKey]) data[cleanKey] = [];
            data[cleanKey].push(value);
          } else {
            data[key] = value;
          }
        });

        fetch("http://localhost:3000/enviar-formulario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
          .then(response => response.json())
          .then(result => {
            alert(result.message);
          })
          .catch(err => {
            alert("Error al enviar: " + err);
          });
      });
    }
  });
});








