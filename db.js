// ATENÇÃO: Substitua pelos seus dados do Supabase!
// Mantenha as aspas e cole a URL e a Anon Key fornecidas painel do Supabase.
const SUPABASE_URL = 'https://opkaxdifypriizkircrx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_t8Gh3F14FCFem9PvnhjYoQ_BM-qPRe9';

// Inicializa o cliente Supabase se a URL for válida
let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_URL.includes('supabase.co')) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Utilitário global para converter HEX dinâmico para R G B, necessário pro tailwind opacity funcionar.
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
}
