// Landing Corazones Conectados

(function () {
  'use strict';

  // ---------- Calculadora de compatibilidad ----------

  var form = document.getElementById('form-calculadora');
  var inputUno = document.getElementById('nombre-uno');
  var inputDos = document.getElementById('nombre-dos');
  var errorMsg = document.getElementById('calc-error');
  var etiqueta = document.getElementById('resultado-etiqueta');
  var numero = document.getElementById('resultado-numero');
  var barra = document.getElementById('barra');
  var relleno = document.getElementById('barra-relleno');
  var mensaje = document.getElementById('resultado-mensaje');
  var compartir = document.getElementById('btn-compartir');

  var reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Deja solo letras (sin tildes ni símbolos) para que "María" y "maria" den lo mismo
  function normalizar(nombre) {
    return nombre
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/g, '');
  }

  // Mismo par de nombres = mismo resultado, sin importar el orden. Rango: 38 a 99
  function calcularPorcentaje(a, b) {
    var par = [normalizar(a), normalizar(b)].sort().join('|');
    var hash = 2166136261;
    for (var i = 0; i < par.length; i++) {
      hash ^= par.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return 38 + (hash % 62);
  }

  function mensajePara(porcentaje) {
    if (porcentaje >= 90) return 'Esto late fuerte. Cuéntale a tus amigos.';
    if (porcentaje >= 75) return 'Muy buena sintonía. Aquí hay química.';
    if (porcentaje >= 60) return 'Van por buen camino. Un café lo confirma.';
    if (porcentaje >= 45) return 'Hay pulso, pero toca ponerle ganas.';
    return 'Los opuestos también se atraen. Dale una oportunidad.';
  }

  function animarNumero(destino) {
    if (reducirMovimiento) {
      numero.textContent = destino;
      return;
    }
    var inicio = null;
    var duracion = 600;
    function paso(t) {
      if (inicio === null) inicio = t;
      var avance = Math.min((t - inicio) / duracion, 1);
      numero.textContent = Math.round(destino * avance);
      if (avance < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  function mostrarResultado(nombreUno, nombreDos, esEjemplo) {
    var porcentaje = calcularPorcentaje(nombreUno, nombreDos);
    var texto = mensajePara(porcentaje);

    etiqueta.textContent = (esEjemplo ? 'Ejemplo: ' : '') + nombreUno.trim() + ' y ' + nombreDos.trim();
    mensaje.textContent = texto;
    barra.setAttribute('aria-valuenow', porcentaje);
    relleno.style.width = porcentaje + '%';
    animarNumero(porcentaje);

    var textoWhatsApp = nombreUno.trim() + ' y ' + nombreDos.trim() + ' tienen ' + porcentaje +
      '% de compatibilidad en Corazones Conectados. Prueba el tuyo: ' + window.location.href.split('#')[0];
    compartir.href = 'https://wa.me/?text=' + encodeURIComponent(textoWhatsApp);

    return porcentaje;
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (!normalizar(inputUno.value) || !normalizar(inputDos.value)) {
      errorMsg.hidden = false;
      (normalizar(inputUno.value) ? inputDos : inputUno).focus();
      return;
    }

    errorMsg.hidden = true;
    var porcentaje = mostrarResultado(inputUno.value, inputDos.value, false);

    // Para GTM / Google Analytics: evento extra con el resultado
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'calculo_compatibilidad', porcentaje: porcentaje });
  });

  // Al cargar, se muestra un resultado de ejemplo para que la calculadora no se vea vacía
  mostrarResultado(inputUno.value, inputDos.value, true);


  // ---------- Menú: se cierra al elegir una sección (celular) ----------

  var menu = document.getElementById('menu');
  document.querySelectorAll('#menu a').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      if (menu.classList.contains('show') && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });


  // ---------- HubSpot ----------

  var config = window.HS_CONFIG || {};
  var configurado = config.portalId && config.portalId !== 'REEMPLAZAR' &&
                    config.formId && config.formId !== 'REEMPLAZAR';

  if (configurado && window.hbspt) {
    document.getElementById('registro-hubspot').innerHTML = '';
    window.hbspt.forms.create({
      region: config.region,
      portalId: config.portalId,
      formId: config.formId,
      target: '#registro-hubspot'
    });
  }

  // HubSpot avisa con un mensaje cuando alguien envía el formulario.
  // Lo convertimos en un evento del dataLayer para usarlo en GTM (activador "Evento personalizado": hubspot_form_submit)
  window.addEventListener('message', function (evento) {
    var datos = evento.data;
    if (datos && datos.type === 'hsFormCallback' && datos.eventName === 'onFormSubmitted') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'hubspot_form_submit', formId: datos.id });
    }
  });
})();
