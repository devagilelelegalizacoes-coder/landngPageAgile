document.addEventListener("DOMContentLoaded", async () => {

    const loadingOverlay = document.getElementById("loading-overlay");
    const loginContainer = document.getElementById("login-container");
    const adminContent = document.getElementById("admin-content");

    // Arrays de Estado
    let servicesData = [];
    let testimonialsData = [];
    let promotionsData = [];

    // Função Helper para Upload de Imagens no Supabase Storage
    async function uploadImage(file, path) {
        if (!supabaseClient) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { data, error } = await supabaseClient.storage
            .from('images') // Certifique-se de ter criado o bucket 'images' como público
            .upload(filePath, file);

        if (error) {
            console.error("Erro no upload:", error);
            alert("Erro ao enviar imagem: " + error.message);
            return null;
        }

        const { data: { publicUrl } } = supabaseClient.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    // Configurar Listeners de Upload
    const heroUpload = document.getElementById("upload-hero-image");
    if (heroUpload) heroUpload.addEventListener("change", async (e) => {
        if (e.target.files.length > 0) {
            const url = await uploadImage(e.target.files[0], "hero");
            if (url) {
                document.getElementById("input-hero-image").value = url;
                alert("Imagem Hero enviada com sucesso!");
            }
        }
    });

    const logoUpload = document.getElementById("upload-logo-url");
    if (logoUpload) logoUpload.addEventListener("change", async (e) => {
        if (e.target.files.length > 0) {
            const url = await uploadImage(e.target.files[0], "logo");
            if (url) {
                document.getElementById("input-logo-url").value = url;
                alert("Logo enviada com sucesso!");
            }
        }
    });

    // Funções Helper de UI
    window.renderPromotionsList = function () {
        const list = document.getElementById("admin-promotions-list");
        if (!list) return;
        list.innerHTML = "";
        promotionsData.forEach((p, index) => {
            const div = document.createElement("div");
            div.className = "p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4 relative bg-white dark:bg-slate-800 shadow-sm";
            div.innerHTML = `
                <button type="button" class="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors p-1" title="Remover" onclick="removePromotion(${index})"><span class="material-symbols-outlined text-lg">delete</span></button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500 flex items-center gap-1">
                            Imagem (Upload)
                            <span class="text-[9px] bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-500">1200x600</span>
                        </label>
                        <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm" type="file" accept="image/*" onchange="uploadPromoImage(${index}, this)" />
                        <input type="hidden" value="${p.image_url || ''}" id="promo-url-${index}" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500">Etiqueta (Badge)</label>
                        <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" type="text" value="${p.badge || ''}" onchange="updatePromotion(${index}, 'badge', this.value)" placeholder="Ex: Oferta" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500">Título</label>
                        <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" type="text" value="${p.title || ''}" onchange="updatePromotion(${index}, 'title', this.value)" placeholder="Título" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500">Link (Web ou #ID)</label>
                        <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" type="text" value="${p.link_url || ''}" onchange="updatePromotion(${index}, 'link_url', this.value)" placeholder="https://... ou #contato" />
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-xs uppercase font-bold text-slate-500">Descrição</label>
                    <textarea class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" rows="2" onchange="updatePromotion(${index}, 'description', this.value)">${p.description || ''}</textarea>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updatePromotion = (i, field, val) => { promotionsData[i][field] = val; }
    window.removePromotion = (i) => { promotionsData.splice(i, 1); window.renderPromotionsList(); }
    window.uploadPromoImage = async (i, el) => {
        if (el.files.length > 0) {
            const url = await uploadImage(el.files[0], "promotions");
            if (url) {
                promotionsData[i].image_url = url;
                alert("Imagem da promoção enviada!");
            }
        }
    }

    window.renderServicesList = function () {
        const list = document.getElementById("admin-services-list");
        if (!list) return;
        list.innerHTML = "";
        servicesData.forEach((s, index) => {
            const div = document.createElement("div");
            div.className = "p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4 relative bg-white dark:bg-slate-800 shadow-sm";
            div.innerHTML = `
                <button type="button" class="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors p-1" title="Remover" onclick="removeService(${index})"><span class="material-symbols-outlined text-lg">delete</span></button>
                <div class="space-y-2">
                    <label class="text-xs uppercase font-bold text-slate-500 flex items-center gap-1">
                        Imagem da Capa (Upload)
                        <span class="text-[9px] bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-500">800x800</span>
                    </label>
                    <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" type="file" accept="image/*" onchange="uploadServiceImage(${index}, this)" />
                    <input type="hidden" value="${s.image_url || ''}" id="service-url-${index}" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500">Etiqueta (Badge)</label>
                        <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" type="text" value="${s.badge || ''}" onchange="updateService(${index}, 'badge', this.value)" placeholder="Ex: Técnico" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500">Título</label>
                        <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" type="text" value="${s.title || ''}" onchange="updateService(${index}, 'title', this.value)" placeholder="Título" />
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-xs uppercase font-bold text-slate-500">Descrição</label>
                    <textarea class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" rows="2" onchange="updateService(${index}, 'description', this.value)">${s.description || ''}</textarea>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateService = (i, field, val) => { servicesData[i][field] = val; }
    window.removeService = (i) => { servicesData.splice(i, 1); window.renderServicesList(); }
    window.uploadServiceImage = async (i, el) => {
        if (el.files.length > 0) {
            const url = await uploadImage(el.files[0], "services");
            if (url) {
                servicesData[i].image_url = url;
                alert("Imagem do serviço enviada!");
            }
        }
    }

    window.renderTestimonialsList = function () {
        const list = document.getElementById("admin-testimonials-list");
        if (!list) return;
        list.innerHTML = "";
        testimonialsData.forEach((t, index) => {
            const div = document.createElement("div");
            div.className = "p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4 relative bg-white dark:bg-slate-800 shadow-sm";
            div.innerHTML = `
                <button type="button" class="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors p-1" title="Remover" onclick="removeTestimonial(${index})"><span class="material-symbols-outlined text-lg">delete</span></button>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500">Nome do Cliente</label>
                        <input class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" type="text" value="${t.name || ''}" onchange="updateTestimonial(${index}, 'name', this.value)" placeholder="Nome" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs uppercase font-bold text-slate-500">Qtd de Estrelas</label>
                        <select class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" onchange="updateTestimonial(${index}, 'stars', this.value)">
                            <option value="5" ${t.stars == 5 ? 'selected' : ''}>5 Estrelas</option>
                            <option value="4" ${t.stars == 4 ? 'selected' : ''}>4 Estrelas</option>
                            <option value="3" ${t.stars == 3 ? 'selected' : ''}>3 Estrelas</option>
                        </select>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-xs uppercase font-bold text-slate-500">Mensagem</label>
                    <textarea class="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" rows="2" onchange="updateTestimonial(${index}, 'message', this.value)">${t.message || ''}</textarea>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateTestimonial = (i, field, val) => { testimonialsData[i][field] = val; }
    window.removeTestimonial = (i) => { testimonialsData.splice(i, 1); window.renderTestimonialsList(); }

    // Handlers Botoes Adicionar
    const btnAddService = document.getElementById("btn-add-service");
    if (btnAddService) btnAddService.addEventListener("click", () => {
        servicesData.push({ image_url: "", badge: "", title: "", description: "" });
        window.renderServicesList();
    });

    const btnAddTest = document.getElementById("btn-add-testimonial");
    if (btnAddTest) btnAddTest.addEventListener("click", () => {
        testimonialsData.push({ name: "", stars: 5, message: "" });
        window.renderTestimonialsList();
    });

    const btnAddPromo = document.getElementById("btn-add-promotion");
    if (btnAddPromo) btnAddPromo.addEventListener("click", () => {
        promotionsData.push({ title: "", description: "", badge: "", image_url: "", link_url: "" });
        window.renderPromotionsList();
    });

    // Verifica se configurou a conexão do banco
    if (!supabaseClient) {
        loadingOverlay.classList.add("hidden");
        adminContent.classList.remove("hidden");
        document.getElementById("supabase-warning").classList.remove("hidden");
        document.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);
        return;
    }

    // 1. Verificar Sessão Atual
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        // Usuário logado
        showAdminContent();
        loadAdminData();
    } else {
        // Usuário deslogado
        loadingOverlay.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    }

    // Listener do Formulário de Login
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const btn = document.getElementById("btn-login");
        const errorDiv = document.getElementById("login-error");

        btn.disabled = true;
        btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>';
        errorDiv.classList.add("hidden");

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            btn.disabled = false;
            btn.innerHTML = 'Entrar <span class="material-symbols-outlined text-sm">login</span>';
            errorDiv.innerText = "Email ou senha incorretos.";
            errorDiv.classList.remove("hidden");
        } else {
            // Sucesso no login
            loginContainer.classList.add("hidden");
            loadingOverlay.classList.remove("hidden");
            showAdminContent();
            loadAdminData();
        }
    });

    // Listener do Botão de Sair (Logout)
    document.getElementById("btn-logout").addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.reload();
    });

    function showAdminContent() {
        loadingOverlay.classList.add("hidden");
        adminContent.classList.remove("hidden");
    }

    async function loadAdminData() {

        try {
            // Carrega dados do Supabase
            const { data, error } = await supabaseClient
                .from('page_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignora se não existir
                console.error("Erro ao carregar dados do Supabase: ", error);
            }

            if (data) {
                document.getElementById("input-hero-title").value = data.hero_title || '';
                document.getElementById("input-hero-subtitle").value = data.hero_subtitle || '';
                document.getElementById("input-about-title").value = data.about_title || '';
                document.getElementById("input-contact-phone").value = data.contact_phone || '';

                document.getElementById("input-logo-url").value = data.logo_url || '';
                document.getElementById("input-primary-color").value = data.primary_color || '#4e5f7e';
                document.getElementById("input-hero-image").value = data.hero_image_url || '';

                // Novos campos
                document.getElementById("input-btn1-text").value = data.btn1_text || '';
                document.getElementById("input-btn2-text").value = data.btn2_text || '';
                document.getElementById("input-about-num1").value = data.about_num1 || '';
                document.getElementById("input-about-quote").value = data.about_quote || '';
                document.getElementById("input-contact-location").value = data.contact_location || '';
                document.getElementById("input-contact-hours").value = data.contact_hours || '';
                document.getElementById("input-contact-email").value = data.contact_email || '';
                document.getElementById("input-whatsapp-url").value = data.whatsapp_url || '';

                document.getElementById("input-social-instagram").value = data.social_instagram || '';
                document.getElementById("input-social-facebook").value = data.social_facebook || '';
                document.getElementById("input-social-google").value = data.social_google || '';

                // Carregar Arrays
                servicesData = data.services || [];
                testimonialsData = data.testimonials || [];
                promotionsData = data.promotions || [];

                window.renderServicesList();
                window.renderTestimonialsList();
                window.renderPromotionsList();

                // Injeta cor visualmente no painel administrativo também
                if (data.primary_color) {
                    const rgb = hexToRgb(data.primary_color);
                    if (rgb) document.documentElement.style.setProperty('--color-primary', rgb);
                }
            }
        } catch (err) {
            console.error("Exceção:", err);
        }
    }

    // Ao enviar o formulário
    document.getElementById("admin-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        // Extrai dados
        const payload = {
            id: 1,
            hero_title: document.getElementById("input-hero-title").value,
            hero_subtitle: document.getElementById("input-hero-subtitle").value,
            about_title: document.getElementById("input-about-title").value,
            contact_phone: document.getElementById("input-contact-phone").value,
            logo_url: document.getElementById("input-logo-url").value,
            primary_color: document.getElementById("input-primary-color").value,
            hero_image_url: document.getElementById("input-hero-image").value,
            btn1_text: document.getElementById("input-btn1-text").value,
            btn2_text: document.getElementById("input-btn2-text").value,

            // Textos info globais
            about_num1: document.getElementById("input-about-num1").value,
            about_quote: document.getElementById("input-about-quote").value,
            contact_location: document.getElementById("input-contact-location").value,
            contact_hours: document.getElementById("input-contact-hours").value,
            contact_email: document.getElementById("input-contact-email").value,
            whatsapp_url: document.getElementById("input-whatsapp-url").value,

            // Sociais
            social_instagram: document.getElementById("input-social-instagram").value,
            social_facebook: document.getElementById("input-social-facebook").value,
            social_google: document.getElementById("input-social-google").value,

            // Metadados Listas JSON
            services: servicesData,
            testimonials: testimonialsData,
            promotions: promotionsData
        };

        const { error } = await supabaseClient
            .from('page_settings')
            .upsert(payload);

        if (error) {
            console.error("Erro do Supabase: ", error);
            alert("Erro ao salvar no banco de dados: " + error.message + "\n\nCódigo do Erro: " + error.code + "\n\nDetalhes comuns:\n- Verifique se você criou a coluna 'id' (tipo int ou bigint, ou texto se preferir, e marcou como Primary Key)\n- Verifique se desativou o RLS (Row Level Security)\n- Verifique se criou todas as colunas sugeridas na tabela page_settings.");
        } else {
            // Atualizar imediatamente a página admin após salvar a cor
            const rgb = hexToRgb(payload.primary_color);
            if (rgb) document.documentElement.style.setProperty('--color-primary', rgb);

            alert("Sucesso! As alterações foram salvas via Supabase. Volte a página inicial para verificar.");
        }
    });

    // Event listener para alterar a cor do tema dinamicamente no preview admin
    document.getElementById("input-primary-color").addEventListener("input", (e) => {
        const rgb = hexToRgb(e.target.value);
        if (rgb) document.documentElement.style.setProperty('--color-primary', rgb);
    });

    // Reset Defaults do Banco de Dados
    document.getElementById("btn-reset-db").addEventListener("click", async () => {
        if (!confirm("Aviso: Essa ação vai APAGAR todas as suas customizações e reverter a página inteira para o padrão. Tem certeza?")) return;

        const defaultPayload = {
            id: 1,
            hero_title: "Regularize seu Veículo sem Burocracia",
            hero_subtitle: "Despachante especializado em documentação para carros, motos e caminhões. Transferência, licenciamento e regularização de motor com rapidez e segurança.",
            about_title: "Especialistas em resolver problemas burocráticos",
            contact_phone: "(21) 99999-9999",
            contact_location: "Rio de Janeiro, RJ",
            contact_hours: "Seg à Sex: 09h às 18h",
            contact_email: "contato@agilelegalizacoes.com.br",
            primary_color: "#4e5f7e",
            btn1_text: "Falar com Especialista",
            btn2_text: "Ver Serviços",
            about_num1: "10+",
            about_quote: '"Comprometimento com a agilidade sem abrir mão do rigor jurídico que o mercado do Rio de Janeiro exige."',
            whatsapp_url: "",
            social_instagram: "",
            social_facebook: "",
            social_google: "",
            logo_url: null,
            hero_image_url: null,
            services: [
                {
                    badge: "Documentação",
                    title: "Transferência de Veículos",
                    description: "Gestão completa do processo de transferência (CRV/ATPV-e) sem burocracia. Cuidamos de todos os trâmites legais para que você não precise se preocupar com filas ou erros no preenchimento.",
                    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAp7NYzD9TDs6MGFOQ0v7-vSsQjs2gnf5XXs8bfDIzvggMUZJix6b3s--SO5CaPyxjbbi6FG7Zz8YPopAowdO37D9jwsiBMnJ3cqCyuUyC8caAsjTrRxPlp5aX07dY83HO2BgQTkC_jflNaT0XYIkBQk5EnrQN_CxT7RePvWSaw2ar0DKjFbO_zhSI8qH3JR5JP8P7zwCX1xfkJu31sz6pIy8-jK42JUvP_QKaJwgsDsOzGi-anWo4C9Ao15GEsZ7VR-JAWy-TnWI"
                },
                {
                    badge: "Técnico & Legal",
                    title: "Regularização de Motor e Câmbio",
                    description: "Adequação técnica conforme Resolução 916/2022. Segurança e conformidade para seu veículo. Validamos numerações, notas fiscais e procedência para evitar apreensões e multas.",
                    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Ts31jHN5xkpq1Mvf-cdGVxWl9qCitlJ4JiaxDBiopTWPBgj9yVXwQ6bMFtMCZrVKY1d3ZgzV0XS-Z9jfI8KnIwRvyWM0KvG1N0Zk769eU4mRsbqZO7qz-QYexMwAfCIMeIIgORlIFW16OdQDARJRZC7WrAcIFbHeg0cK4bpRN6BZxscD7OGuVvNAGnWsXbOeGDIcaSOEUrx-zQU61AgvYcqruWRtFGnMqOJv2anH32cunBhmRLRL8F4LuaVlQJi7M4qhNF-2RKw"
                }
            ],
            testimonials: []
        };

        const { error } = await supabaseClient.from('page_settings').upsert(defaultPayload);

        if (error) {
            alert("Erro ao formatar para base padrão!");
        } else {
            alert("Reset concluído!");
            window.location.reload();
        }
    });

});
