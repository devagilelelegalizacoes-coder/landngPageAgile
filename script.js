tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "rgb(var(--color-primary) / <alpha-value>)",
                "background-light": "#f6f7f7",
                "background-dark": "#17181b",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
}

document.addEventListener("DOMContentLoaded", () => {

    // Funcionalidade de Envio do Orçamento p/ WhatsApp
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Simulação de botão de Loading
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>';
            btn.disabled = true;

            const nome = document.getElementById("form-nome")?.value || "";
            const tel = document.getElementById("form-tel")?.value || "";
            const placa = document.getElementById("form-placa")?.value || "";
            const msg = document.getElementById("form-msg")?.value || "";

            let text = `Olá, me chamo ${nome}. Gostaria de solicitar um orçamento para o meu veículo.`;
            if (placa) text += `\n*Veículo (Placa):* ${placa}`;
            if (msg) text += `\n\n*Mensagem:* ${msg}`;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;

                // Checa se a página configurou Whatsapp pelo Supabase (pelo context admin.js / content.js)
                if (window.globalWhatsappUrl && window.globalWhatsappUrl.trim() !== "") {
                    window.open(`${window.globalWhatsappUrl}?text=${encodeURIComponent(text)}`, "_blank");
                } else {
                    alert("Sua solicitação enviada! (Aviso: O Zap da empresa ainda não foi configurado no Admin)");
                }

                contactForm.reset();
            }, 600);
        });
    }

});
