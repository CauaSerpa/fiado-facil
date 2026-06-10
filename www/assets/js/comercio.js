import { db } from '../../database/db.js';

export async function initComercio() {
    await carregar();

    // Inserir variáveis na mensagem
    document.querySelectorAll('.variavel').forEach(btn => {
        btn.addEventListener('click', () => inserirVariavel(btn.dataset.tag));
    });

    document.getElementById('btnSalvarComercio')
        .addEventListener('click', salvarInfo);

    document.getElementById('btnSalvarMensagem')
        .addEventListener('click', salvarMensagem);

    document.getElementById('btnResetMensagem')
        .addEventListener('click', resetMensagem);

    // Máscara do telefone
    const telefoneInput = document.getElementById('telefoneComercio');
    telefoneInput.value = formatPhone(telefoneInput.value);
    telefoneInput.addEventListener('input', e => {
        e.target.value = formatPhone(e.target.value);
        clearFieldValidation(telefoneInput);
    });

    // Máscara PIX
    const pixInput = document.getElementById('pixComercio');
    const tipoPix = document.getElementById('tipoPix');

    pixInput.addEventListener('input', e => {
        e.target.value = formatPix(e.target.value, tipoPix.value);
        clearFieldValidation(pixInput);
    });

    tipoPix.addEventListener('change', () => {
        pixInput.value = '';
        clearFieldValidation(pixInput);
        pixInput.focus();
    });
}

let PADRAO = 
`Olá {cliente} 👋

Consta em nosso sistema um saldo pendente de {valor}.

Caso já tenha realizado o pagamento, desconsidere esta mensagem.`;

let MELHORADA =
`Olá {cliente} 👋

Identificamos um saldo pendente em nosso sistema no valor de {valor}.

Data da última compra:
{ultima_compra}

Caso o pagamento já tenha sido realizado, por favor desconsidere esta mensagem.

PIX ({tipo_pix})
{pix}

Atenciosamente,

{comercio}
{telefone}`;

async function carregar() {
    const info = await db.configuracoes.get('comercio');
    const msg = await db.configuracoes.get('mensagem');

    if (info) {
        document.getElementById('nomeComercio').value = info.nome || '';
        document.getElementById('telefoneComercio').value = info.telefone || '';
        document.getElementById('pixComercio').value = info.pix || '';
    }

    // Decide se mostra mensagem melhorada ou padrão
    const mensagemPadrao = document.getElementById('mensagemPadrao');
    const btnResetMensagem = document.getElementById('btnResetMensagem');
    if (info && info.nome && info.telefone && info.pix) {
        mensagemPadrao.value = msg?.texto || MELHORADA;

        btnResetMensagem.textContent =
            'Restaurar com mensagem melhorada';
    } else {
        mensagemPadrao.value = msg?.texto || PADRAO;

        btnResetMensagem.textContent =
            'Restaurar mensagem';
    }
}

function inserirVariavel(tag) {
    const textarea = document.getElementById('mensagemPadrao');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + tag + textarea.value.substring(end);
    textarea.focus();
}

// Resetar mensagem
function resetMensagem() {
    const info = {
        nome: document.getElementById('nomeComercio').value.trim(),
        telefone: document.getElementById('telefoneComercio').value.trim(),
        pix: document.getElementById('pixComercio').value.trim()
    };

    const mensagemPadrao = document.getElementById('mensagemPadrao');
    if (info.nome && info.telefone && info.pix) {
        mensagemPadrao.value = MELHORADA;
    } else {
        mensagemPadrao.value = PADRAO;
    }
}

// Máscara do telefone
function formatPhone(value) {
    const numbers = value.replace(/\D/g, '').substring(0, 11);
    if(numbers.length <= 2) return numbers ? `(${numbers}` : '';
    if(numbers.length <= 10) return `(${numbers.substring(0,2)}) ${numbers.substring(2,6)}-${numbers.substring(6)}`;
    return `(${numbers.substring(0,2)}) ${numbers.substring(2,7)}-${numbers.substring(7)}`;
}

// Máscara PIX
function formatPix(value, tipo) {
    value = value.replace(/\D/g, '');
    switch(tipo) {
        case 'cpf': return value.substring(0,11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        case 'cnpj': return value.substring(0,14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        case 'telefone': return value.substring(0,11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        default: return value;
    }
}

function setFieldValid(input) { input.classList.remove('is-invalid'); input.classList.add('is-valid'); }
function setFieldInvalid(input) { input.classList.remove('is-valid'); input.classList.add('is-invalid'); }
function clearFieldValidation(input) { input.classList.remove('is-valid','is-invalid'); }

async function salvarInfo() {
    const nome = document.getElementById('nomeComercio').value.trim();
    const telefone = document.getElementById('telefoneComercio').value.replace(/\D/g,'');
    const pix = document.getElementById('pixComercio').value.trim();
    const tipo = document.getElementById('tipoPix').value;

    let hasError = false;

    if(!nome) { setFieldInvalid(document.getElementById('nomeComercio')); hasError = true; }
    else setFieldValid(document.getElementById('nomeComercio'));

    if(!telefone || (telefone.length !== 10 && telefone.length !== 11)) { setFieldInvalid(document.getElementById('telefoneComercio')); hasError = true; }
    else setFieldValid(document.getElementById('telefoneComercio'));

    if(!pix || (tipo==='cpf' && pix.replace(/\D/g,'').length!==11) || (tipo==='cnpj' && pix.replace(/\D/g,'').length!==14)) {
        setFieldInvalid(document.getElementById('pixComercio'));
        hasError = true;
    } else setFieldValid(document.getElementById('pixComercio'));

    if(hasError) return;

    await db.configuracoes.put({ chave:'comercio', nome, telefone, pix, tipo });

    window.navigate(
        `feedback?type=success&msg=${encodeURIComponent('Informações salvas com sucesso')}&redirect=comercio`
    );
}

async function salvarMensagem() {
    const texto = document.getElementById('mensagemPadrao').value.trim();
    if(!texto) return alert('Mensagem não pode ficar vazia');
    await db.configuracoes.put({ chave:'mensagem', texto });

    window.navigate(
        `feedback?type=success&msg=${encodeURIComponent('Mensagem salva com sucesso')}&redirect=comercio`
    );
}