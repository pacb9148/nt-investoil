// ============================================================
// REPRODUCTOR EXCLUSIVO DE VIDEOS (.video)
// ============================================================
// 'capture: true' es indispensable porque el evento 'play' nativo no burbujea
document.addEventListener("play", (e) => {
  if (e.target && e.target.tagName === "VIDEO") {
    const currentContainer = e.target.closest(".video");
    if (!currentContainer) return;

    const allVideos = document.querySelectorAll(".video video");
    allVideos.forEach((otherVideo) => {
      if (otherVideo !== e.target && !otherVideo.paused) {
        otherVideo.pause();
      }
    });
  }
}, true);

// ============================================================
// DOM READY
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // GSAP REGISTRATION
  // ============================================================
  const hasGSAP = typeof gsap !== "undefined";
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ============================================================
  // MAPA SVG / ACCORDEON CLINICAS
  // ============================================================
  const accordionWidget = document.querySelector(".accordeon.mapa");
  const svgElements = document.querySelectorAll(
    "svg.mapa-desk, svg.mapa-mobile, .accordeon.mapa svg"
  );

  if (svgElements.length && accordionWidget) {
    const purpleClasses = [
      "col7-fila16", "col8-fila12", "col8-fila14", "col8-fila15",
      "col8-fila16", "col9-fila12", "col9-fila13", "col9-fila14",
      "col9-fila15", "col9-fila17", "col10-fila13", "col10-fila16"
    ];
    const whiteClasses = [];
    const tealClasses = [
      "col3-fila7", "col3-fila11", "col4-fila9", "col4-fila10", "col5-fila9"
    ];

    const assignGroupClasses = (classList, groupName) => {
      if (!classList.length) return;
      const selector = classList.map((cls) => `circle.${cls}`).join(",");
      svgElements.forEach((svg) => {
        svg.querySelectorAll(selector).forEach((circle) => {
          circle.classList.add(groupName);
          circle.style.cursor = "pointer";
        });
      });
    };

    assignGroupClasses(purpleClasses, "dot-purple");
    assignGroupClasses(whiteClasses, "dot-white");
    assignGroupClasses(tealClasses, "dot-teal");

    const accordionItems = Array.from(
      accordionWidget.querySelectorAll(".e-n-accordion-item")
    ).filter((item) => item.closest(".accordeon.mapa") === accordionWidget);

    const activeClassMap = { 0: "active-purple", 1: "active-teal", 2: "active-white" };

    const updateSVGColors = () => {
      svgElements.forEach((svg) => {
        svg.classList.remove("active-purple", "active-white", "active-teal");
      });

      accordionItems.forEach((item, index) => {
        if (item.hasAttribute("open") && activeClassMap[index]) {
          svgElements.forEach((svg) => {
            svg.classList.add(activeClassMap[index]);
          });
        }
      });
    };

    const openAccordionItem = (targetIndex) => {
      accordionItems.forEach((item, index) => {
        const summary = item.querySelector("summary");
        const isOpen = index === targetIndex;
        item.toggleAttribute("open", isOpen);
        if (summary) summary.setAttribute("aria-expanded", String(isOpen));
      });
      updateSVGColors();
    };

    svgElements.forEach((svg) => {
      svg.addEventListener("click", (e) => {
        const circle = e.target.closest("circle");
        if (!circle) return;

        if (circle.classList.contains("dot-purple")) openAccordionItem(0);
        else if (circle.classList.contains("dot-teal")) openAccordionItem(1);
        else if (circle.classList.contains("dot-white")) openAccordionItem(2);
      });
    });

    const observer = new MutationObserver(updateSVGColors);
    accordionItems.forEach((item) => {
      observer.observe(item, { attributes: true, attributeFilter: ["open"] });
    });

    updateSVGColors();
  }


  // ============================================================
  // TESTIMONIALS (Desktop Only)
  // ============================================================
  const testimonialTrigger = document.querySelector(".testimonial-trigger");
  const testimonialsContainer = document.querySelector(".testimonial-container");
  const testimonials = document.querySelector(".testimonials");

  if (testimonialsContainer && testimonials && hasGSAP && hasScrollTrigger) {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1025px)", () => {
      gsap.to(testimonials, {
        y: -450,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: testimonialTrigger,
          start: "top top",
          end: "+=150%",
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
        },
      });
    });
  }




  // ============================================================
  // STORYTELLING ATF
  // ============================================================
  const atf = document.querySelector(".atf");
  const items = hasGSAP ? gsap.utils.toArray(".atf .p-none") : [];

  if (atf && items.length > 1) {
    const ATF_HOLD = 2; // segundos que se ve cada item
    const ATF_FADE = 1; // segundos de cada fundido

    gsap.set(items, { display: "none", opacity: 0 });
    gsap.set(items[0], { display: "flex", opacity: 1 });

    // Bucle continuo: cada item se ve, se funde y da paso al siguiente; el último vuelve al primero
    const tl = gsap.timeline({ repeat: -1 });

    items.forEach((item, index) => {
      const next = items[(index + 1) % items.length];

      tl.to(item, { opacity: 0, duration: ATF_FADE, ease: "none" }, `+=${ATF_HOLD}`)
        .set(item, { display: "none" })
        .set(next, { display: "flex" }, "<")
        .to(next, { opacity: 1, duration: ATF_FADE, ease: "none" }, "<");
    });
  }

  

  // ============================================================
  // TRATAMIENTO TIMELINE STEPS (JetEngine)
  // ============================================================
  const timelineWrappers = document.querySelectorAll(
    "._custom-timeline_steps-numbers .jet-timeline"
  );

  if (timelineWrappers.length) {
    const updateTimelineNumbers = () => {
      timelineWrappers.forEach((timeline) => {
        timeline.querySelectorAll(".jet-timeline-item").forEach((item, index) => {
          const point = item.querySelector(".timeline-item__point-content--text");
          if (point) point.textContent = index + 1;
        });
      });
    };

    updateTimelineNumbers();

    const timelineObserver = new MutationObserver(updateTimelineNumbers);
    timelineWrappers.forEach((timeline) => {
      timelineObserver.observe(timeline, { childList: true, subtree: true });
    });
  }

  // ============================================================
  // FAQs TRATAMIENTOS
  // ============================================================
  const faqContainer = document.querySelector("._custom-faqs");

  if (faqContainer) {
    const faqItems = faqContainer.querySelectorAll(".e-n-accordion-item");

    const collapseItem = (item, content) => {
      content.style.height = `${content.scrollHeight}px`;
      content.offsetHeight;
      requestAnimationFrame(() => {
        content.style.height = "0px";
      });

      content.addEventListener(
        "transitionend",
        function handler(e) {
          if (e.propertyName === "height" && e.target === content) {
            item.removeAttribute("open");
            content.removeEventListener("transitionend", handler);
          }
        },
        { once: true }
      );
    };

    const expandItem = (item, content) => {
      item.setAttribute("open", "");
      content.style.height = "0px";
      content.offsetHeight;
      requestAnimationFrame(() => {
        content.style.height = `${content.scrollHeight}px`;
      });

      content.addEventListener(
        "transitionend",
        function handler(e) {
          if (e.propertyName === "height" && e.target === content) {
            content.style.height = "auto";
            content.removeEventListener("transitionend", handler);
          }
        },
        { once: true }
      );
    };

    faqItems.forEach((item) => {
      const summary = item.querySelector(".e-n-accordion-item-title");
      const content = item.querySelector(".e-n-accordion-item-content");
      if (!summary || !content) return;

      content.style.height = item.hasAttribute("open")
        ? `${content.scrollHeight}px`
        : "0px";

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = item.hasAttribute("open");

        if (isOpen) {
          collapseItem(item, content);
          return;
        }

        faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.hasAttribute("open")) {
            const otherContent = otherItem.querySelector(".e-n-accordion-item-content");
            if (otherContent) collapseItem(otherItem, otherContent);
          }
        });

        expandItem(item, content);
      });
    });
  }

  // ============================================================
  // FORMATO TELEFÓNICO (.tel)
  // ============================================================
  const formatPhoneNumber = (raw) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return raw;

    let countryCode = "+34";
    let nationalNumber = digits;

    if (digits.startsWith("351") && digits.length === 12) {
      countryCode = "+351";
      nationalNumber = digits.slice(3);
    } else if (digits.startsWith("34") && digits.length === 11) {
      nationalNumber = digits.slice(2);
    } else if (digits.length !== 9) {
      return `+${digits.match(/.{1,3}/g).join(" ")}`;
    }

    const blocks = nationalNumber.match(/.{1,3}/g)?.join(" ") || nationalNumber;
    return `${countryCode} ${blocks}`;
  };

  document.querySelectorAll("a.tel, .tel a").forEach((link) => {
    const originalText = link.textContent.trim();
    if (originalText) {
      link.innerHTML = `o llámanos al <b> ${formatPhoneNumber(originalText)}</b>`;
    }
  });
});


// ============================================================
// FORMATO TELEFÓNICO (.tel-format)
// ============================================================
const formatPhoneNumber = (raw) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;

  let countryCode = "+34";
  let nationalNumber = digits;

  if (digits.startsWith("351") && digits.length === 12) {
    countryCode = "+351";
    nationalNumber = digits.slice(3);
  } else if (digits.startsWith("34") && digits.length === 11) {
    nationalNumber = digits.slice(2);
  } else if (digits.length !== 9) {
    return `+${digits.match(/.{1,3}/g).join(" ")}`;
  }

  const blocks = nationalNumber.match(/.{1,3}/g)?.join(" ") || nationalNumber;
  return `${countryCode} ${blocks}`;
};

const applyTelFormat = () => {
  // Cubre:
  // 1. Un enlace/botón que tenga la clase directamente: a.tel-format, button.tel-format
  // 2. Un enlace/botón hijo dentro de un contenedor .tel-format: .tel-format a, .tel-format button
  const targets = document.querySelectorAll(
    "a.tel-format, button.tel-format, .tel-format a, .tel-format button"
  );

  // Set para evitar procesar dos veces si un elemento cumple doble condición
  const uniqueElements = new Set(targets);

  uniqueElements.forEach((el) => {
    // Si el elemento contiene un <span> interno típico de Elementor o builders,
    // actualizamos ese span para no romper iconos; si no, el propio elemento.
    const textContainer = el.querySelector(".elementor-button-text, span") || el;
    const originalText = textContainer.textContent.trim();

    if (originalText) {
      textContainer.innerHTML = `${formatPhoneNumber(originalText)}`;
    }
  });
};

document.addEventListener("DOMContentLoaded", applyTelFormat);


// ============================================================
// REFRESH DE SCROLLTRIGGER
// ============================================================
window.addEventListener("load", () => {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
});

// ============================================================
// ELEMENTOR HOOKS
// ============================================================
if (typeof jQuery !== "undefined") {
  jQuery(window).on("elementor/frontend/init", () => {
    elementorFrontend.hooks.addAction(
      "frontend/element_ready/jet-listing-grid.default",
      ($scope) => {
        $scope
          .find(".elementor-widget-jet-image-comparison")
          .addClass("swiper-no-swiping");

        const swiperEl = $scope.find(".jet-listing-grid__slider")[0];
        if (swiperEl && swiperEl.swiper) {
          swiperEl.swiper.params.noSwiping = true;
          swiperEl.swiper.params.noSwipingClass = "swiper-no-swiping";
          swiperEl.swiper.update();
        }
      }
    );
  });
}

// ============================================================
// REDIRECT INSTAGRAM IN-APP BROWSER: FORMULARIO CLÍNICAS
// ============================================================
(function () {

	const config = window.idexClinicRedirect || null;

	if (!config) {
		return;
	}

	function showDebug(text, isError) {
		if (!config.debug) return;
		const box = document.createElement('div');
		box.style.cssText =
			'position:fixed;top:0;left:0;right:0;background:' +
			(isError ? '#900' : '#000') +
			';color:' + (isError ? '#fff' : '#0f0') +
			';padding:10px;z-index:99999;font-size:12px;word-break:break-all;';
		box.textContent = text;
		document.body.appendChild(box);
	}

	function getClinicId(form) {
		const select = form.querySelector('select[name="form_fields[form_clinicas]"]');
		return select ? select.value : '';
	}

	function getRedirectUrl(form) {
		const clinicId = getClinicId(form);

		const body = new URLSearchParams({
			action: 'idex_get_clinic_redirect',
			nonce: config.nonce,
			clinic_id: clinicId,
		});

		return fetch(config.ajax_url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: body.toString(),
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (json) {
				if (!json || !json.success || !json.data || !json.data.url) {
					throw new Error('Respuesta AJAX inválida');
				}
				return json.data.url;
			});
	}

	function redirectTo(url) {
		showDebug('Redirigiendo a: ' + url);

		if (config.debug) {
			setTimeout(function () {
				window.location.href = url;
			}, 1500);
		} else {
			window.location.href = url;
		}
	}

	function handleSuccess(form) {
		if (form.dataset.idexRedirectHandled === '1') return;
		form.dataset.idexRedirectHandled = '1';

		const clinicId = getClinicId(form);

		// Formulario con selector de clínica (form_clinicas): la URL
		// depende de lo elegido, hay que pedirla por AJAX.
		if (clinicId) {
			showDebug('Formulario enviado, pidiendo URL de redirección...');

			getRedirectUrl(form)
				.then(function (url) {
					if (!url) {
						showDebug('URL obtenida: NULL/VACÍA', true);
						return;
					}
					redirectTo(url);
				})
				.catch(function (err) {
					showDebug('ERROR en fetch: ' + err.message, true);
				});
			return;
		}

		// Formulario de página de clínica individual: la URL ya viene
		// calculada en el render (sin selector, sin segunda petición).
		if (config.page_redirect_url) {
			redirectTo(config.page_redirect_url);
			return;
		}

		showDebug('No hay URL de redirección disponible', true);
	}

	function watchForm(form) {
		if (form.dataset.idexRedirectWatched === '1') return;
		form.dataset.idexRedirectWatched = '1';

		const widgetContainer = form.closest('.elementor-widget-form') || form.parentElement;
		if (!widgetContainer) return;

		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === 'attributes') {
					const target = mutation.target;
					if (target.nodeType === 1 && target.classList.contains('elementor-message-success')) {
						handleSuccess(form);
					}
					return;
				}
				mutation.addedNodes.forEach(function (node) {
					if (node.nodeType !== 1) return;
					const isSuccess =
						node.matches && node.matches('.elementor-message-success')
							? true
							: !!(node.querySelector && node.querySelector('.elementor-message-success'));
					if (isSuccess) {
						handleSuccess(form);
					}
				});
			});
		});

		observer.observe(widgetContainer, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['class'],
		});
	}

	function initRedirect() {
		document.querySelectorAll('.form-redirect-clinica').forEach(watchForm);
	}

	// Vía primaria: evento jQuery que Elementor Pro dispara en el <form>
	// al recibir una respuesta AJAX de éxito. Más fiable que adivinar
	// mutaciones del DOM.
	if (typeof jQuery !== 'undefined') {
		jQuery(document).on('submit_success', function (event) {
			const form = event.target && event.target.closest
				? event.target.closest('.form-redirect-clinica')
				: null;
			if (form) {
				handleSuccess(form);
			}
		});
	}

	function startWatchingBody() {
		new MutationObserver(initRedirect).observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			initRedirect();
			startWatchingBody();
		});
	} else {
		initRedirect();
		startWatchingBody();
	}

})();