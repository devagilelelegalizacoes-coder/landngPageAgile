document.addEventListener("DOMContentLoaded", async () => {

    // Se não tiver DB configurado, não faz nada
    if (!supabaseClient) {
        console.warn("Supabase não configurado. Exibindo o site original.");
        return;
    }

    try {
        // Busca do DB
        const { data, error } = await supabaseClient
            .from('page_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Erro Supabase:", error);
            return;
        }

        if (data) {
            // Textos
            if (data.hero_title) {
                const el = document.getElementById("editable-hero-title");
                if (el) el.innerText = data.hero_title;
            }
            if (data.hero_subtitle) {
                const el = document.getElementById("editable-hero-subtitle");
                if (el) el.innerText = data.hero_subtitle;
            }
            if (data.about_title) {
                const el = document.getElementById("editable-about-title");
                if (el) el.innerText = data.about_title;
            }
            if (data.contact_phone) {
                const els = document.querySelectorAll(".editable-contact-phone");
                els.forEach(el => el.innerText = data.contact_phone);
                const placeholders = document.querySelectorAll(".editable-contact-phone-placeholder");
                placeholders.forEach(el => el.placeholder = data.contact_phone);
            }

            // Textos e Botões Isolados
            if (data.btn1_text) {
                const el = document.getElementById("editable-btn1-text");
                if (el) el.innerText = data.btn1_text;
            }
            if (data.whatsapp_url && data.whatsapp_url.trim() !== '') {
                // Guarda a url globalmente pro script.js de formulário usar
                window.globalWhatsappUrl = data.whatsapp_url;

                // Modifica onde é o destino de todos os botões que tem a classe .link-whatsapp
                const btns = document.querySelectorAll(".link-whatsapp");
                const defaultMsg = "Olá, gostaria de falar com um especialista.";
                btns.forEach(btn => {
                    btn.href = `${data.whatsapp_url}?text=${encodeURIComponent(defaultMsg)}`;
                    btn.target = "_blank"; // Abre wpp em nova aba
                });
            }

            if (data.btn2_text) {
                const el = document.getElementById("editable-btn2-text");
                if (el) el.innerText = data.btn2_text;
            }

            // Redes Sociais no Footer
            if (data.social_facebook && data.social_facebook.trim() !== '') {
                const f = document.getElementById("link-social-facebook");
                if (f) { f.href = data.social_facebook; f.classList.remove("hidden"); }
            }
            if (data.social_instagram && data.social_instagram.trim() !== '') {
                const ig = document.getElementById("link-social-instagram");
                if (ig) { ig.href = data.social_instagram; ig.classList.remove("hidden"); }
            }
            if (data.social_google && data.social_google.trim() !== '') {
                const gl = document.getElementById("link-social-google");
                if (gl) { gl.href = data.social_google; gl.classList.remove("hidden"); }
            }

            // Render Serviços Dinâmicos
            if (data.services && Array.isArray(data.services) && data.services.length > 0) {
                const servicesGrid = document.getElementById("services-grid");
                if (servicesGrid) {
                    servicesGrid.innerHTML = "";
                    data.services.forEach((s) => {
                        const div = document.createElement("div");
                        div.className = "group bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-primary/10 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col";

                        let wppLink = "#contato";
                        if (data.whatsapp_url && data.whatsapp_url.trim() !== '') {
                            const sMsg = `Olá, gostaria de saber mais sobre ${s.title || "Serviço"}.`;
                            wppLink = `${data.whatsapp_url}?text=${encodeURIComponent(sMsg)}`;
                        }

                        div.innerHTML = `
                            <div class="relative h-64 overflow-hidden shrink-0">
                                <img alt="${s.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${s.image_url || ''}" />
                                ${s.badge ? `<div class="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">${s.badge}</div>` : ''}
                            </div>
                            <div class="p-8 flex flex-col flex-1">
                                <h4 class="text-slate-900 dark:text-white text-2xl font-bold mb-3">${s.title || ''}</h4>
                                <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-base flex-1">${s.description || ''}</p>
                                <hr class="my-6 border-primary/10" />
                                <a href="${wppLink}" target="${wppLink.startsWith('http') ? '_blank' : '_self'}" class="mt-auto inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/70 transition-colors w-fit">
                                    Saiba mais <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        `;
                        servicesGrid.appendChild(div);
                    });
                }
            } else {
                // Tenta esconder o grid caso o array estaja vazio (ou a coluna não exista)
                const servicesGrid = document.getElementById("services-grid");
                if (servicesGrid) servicesGrid.innerHTML = "<p class='text-center text-slate-500 col-span-full'>Nenhum serviço cadastrado.</p>";
            }
            
            // Render Promoções Dinâmicas (Carrossel Swiper)
            if (data.promotions && Array.isArray(data.promotions) && data.promotions.length > 0) {
                const promoSection = document.getElementById("promocoes");
                const promoWrapper = document.getElementById("promotions-wrapper");
                if (promoSection && promoWrapper) {
                    promoSection.classList.remove("hidden");
                    promoWrapper.innerHTML = "";
                    data.promotions.forEach((p) => {
                        const slide = document.createElement("div");
                        slide.className = "swiper-slide relative min-h-[400px] flex items-center p-8 md:p-16";
                        slide.innerHTML = `
                            <div class="absolute inset-0 z-0">
                                <img src="${p.image_url || ''}" class="w-full h-full object-cover" alt="${p.title || ''}">
                                <div class="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
                            </div>
                            <div class="relative z-10 max-w-xl space-y-4">
                                ${p.badge ? `<span class="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">${p.badge}</span>` : ''}
                                <h2 class="text-3xl md:text-5xl font-black text-white leading-tight">${p.title || ''}</h2>
                                <p class="text-slate-200 text-lg">${p.description || ''}</p>
                                ${p.link_url ? `
                                    <a href="${p.link_url}" class="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
                                        Clique aqui <span class="material-symbols-outlined">arrow_forward</span>
                                    </a>
                                ` : ''}
                            </div>
                        `;
                        promoWrapper.appendChild(slide);
                    });

                    // Inicializa o Swiper após renderizar
                    new Swiper('.promotions-swiper', {
                        loop: true,
                        autoplay: { delay: 5000 },
                        pagination: { el: '.swiper-pagination', clickable: true },
                        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                        effect: 'fade',
                        fadeEffect: { crossFade: true }
                    });
                }
            }

            // Render Depoimentos Dinâmicos
            if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
                const testGrid = document.getElementById("testimonials-grid");
                if (testGrid) {
                    testGrid.innerHTML = "";
                    data.testimonials.forEach((t) => {
                        const div = document.createElement("div");
                        div.className = "bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 space-y-4 shadow-sm h-full flex flex-col";

                        let starsHtml = "";
                        const fillClass = "font-variation-settings-'FILL'1"; // Apenas hack para forçar estrelinha preenchida material icon
                        for (let i = 0; i < 5; i++) {
                            if (i < t.stars) starsHtml += `<span class="material-symbols-outlined text-yellow-400 text-lg fill-current" style="font-variation-settings: 'FILL' 1;">star</span>`;
                            else starsHtml += `<span class="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg" style="font-variation-settings: 'FILL' 0;">star</span>`;
                        }

                        div.innerHTML = `
                            <div class="flex gap-1 mb-2">${starsHtml}</div>
                            <p class="text-slate-700 dark:text-slate-300 italic text-lg leading-relaxed flex-1">"${t.message || ''}"</p>
                            <div class="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 flex items-center gap-3 shrink-0">
                                <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary uppercase">${(t.name || '?').charAt(0)}</div>
                                <div>
                                    <h5 class="font-bold text-slate-900 dark:text-white leading-tight">${t.name || ''}</h5>
                                    <span class="text-xs text-slate-500 uppercase flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-xs text-blue-500" style="font-variation-settings: 'FILL' 1;">verified</span> Cliente Verificado</span>
                                </div>
                            </div>
                        `;
                        testGrid.appendChild(div);
                    });
                }
            } else {
                const testSection = document.getElementById("depoimentos");
                if (testSection) testSection.classList.add("hidden"); // Esconder seção inteira se não houver depoimentos
            }

            // Identidade Sobre Nós
            if (data.about_num1) {
                const els = document.querySelectorAll("#editable-about-num1");
                els.forEach(el => el.innerText = data.about_num1);
            }
            if (data.about_quote) {
                const el = document.getElementById("editable-about-quote");
                if (el) el.innerText = data.about_quote;
            }

            // Contato e Footer
            if (data.contact_location) {
                const els = document.querySelectorAll(".editable-contact-location");
                els.forEach(el => el.innerText = data.contact_location);
            }
            if (data.contact_hours) {
                const el = document.getElementById("editable-contact-hours");
                if (el) el.innerText = data.contact_hours;
            }
            if (data.contact_email) {
                const el = document.getElementById("editable-contact-email");
                if (el) el.innerText = data.contact_email;
            }
            if (data.contact_address) {
                const el = document.getElementById("editable-contact-address");
                if (el) el.innerText = data.contact_address;
            }

            // Cores Customizadas (Tailwind variables via CSS)
            if (data.primary_color) {
                const rgb = hexToRgb(data.primary_color);
                if (rgb) document.documentElement.style.setProperty('--color-primary', rgb);
            }

            // Imagens e Logos
            if (data.logo_url) {
                const logos = document.querySelectorAll(".editable-logo");
                logos.forEach(logo => {
                    logo.src = data.logo_url;
                    logo.classList.remove("hidden"); // Remove classe do tailwind que esconde

                    // Esconde os simbolos padrões do icone Google Material Icons
                    const parent = logo.parentElement;
                    const icon = parent.querySelector(".editable-logo-icon");
                    if (icon) icon.classList.add("hidden");
                });
            }

            if (data.hero_image_url) {
                const el = document.getElementById("editable-hero-image");
                if (el) el.src = data.hero_image_url;
            }

            console.log("Configurações do painel admin (Supabase) carregadas com sucesso.");
        }

    } catch (e) {
        console.error(e);
    }
});
