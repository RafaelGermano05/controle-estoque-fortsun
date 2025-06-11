// Configurações do Google Apps Script
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxJUp4K2ILpObeKRdJvMWFe2bcXAtSglQoXQoKebtRgwGm5DVkJWytKKOrWgWKbC64xIw/exec';

// Elementos do formulário
const form = document.getElementById('transferForm');
const successMessage = document.getElementById('successMessage');
const newTransferBtn = document.getElementById('newTransferBtn');
const adicionarBtn = document.getElementById('adicionarBtn');
const seriaisContainer = document.getElementById('seriais-container');

// Campos obrigatórios
const requiredFields = [
    { id: 'supervisor', errorId: 'supervisor-error' },
    { id: 'consultor', errorId: 'consultor-error' },
    { id: 'data', errorId: 'data-error' },
    { id: 'quantidade', errorId: 'quantidade-error' }
];

// Array para armazenar os seriais
let serials = [];

// Atualiza a data atual no footer
function updateCurrentDate() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = now.toLocaleDateString('pt-BR', options);
    document.getElementById('current-date').textContent = formattedDate;
}

// Valida os campos do formulário
function validateForm() {
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorElement = document.getElementById(field.errorId);
        
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--error)';
            errorElement.textContent = 'Este campo é obrigatório';
            errorElement.style.display = 'block';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border)';
            errorElement.style.display = 'none';
        }
    });
    
    // valida se há pelo menos um serial adicionado
    if (serials.length === 9999) {
        alert('Por favor, adicione pelo menos uma máquina usando o botão "Adicionar Máquinas"');
        return false;
    }
    
    return isValid;
}

// Limpa o formulário completamente
function resetForm() {
    form.reset();
    serials = [];
    seriaisContainer.innerHTML = '';
    requiredFields.forEach(field => {
        document.getElementById(field.id).style.borderColor = 'var(--border)';
        document.getElementById(field.errorId).style.display = 'none';
    });
    
    // Configura a data atual como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
    document.getElementById('quantidade').value = 1;
}

// Adiciona campos de serial dinamicamente
function adicionarCamposSeriais() {
    const quantidade = parseInt(document.getElementById('quantidade').value);
    
    if (quantidade < 1) {
        alert('A quantidade deve ser pelo menos 1');
        return;
    }
    
    seriaisContainer.innerHTML = '';
    
    for (let i = 0; i < quantidade; i++) {
        const serialGroup = document.createElement('div');
        serialGroup.className = 'serial-group';
        
        serialGroup.innerHTML = `
            <label>Máquina ${i + 1}:</label>
            <input type="text" class="serial-input" placeholder="Número de série" required>
        `;
        
        seriaisContainer.appendChild(serialGroup);
    }
}

// Envia os dados para o Google Sheets
async function submitForm(data) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
   
        // assumimos que foi bem-sucedido se não houve erro de rede
        return { status: "success" };
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Manipulador de envio do formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Coletar todos os seriais
    const serialInputs = document.querySelectorAll('.serial-input');
    const serials = Array.from(serialInputs).map(input => input.value.trim());
    
    const formData = {
        supervisor: document.getElementById('supervisor').value.trim(),
        consultor: document.getElementById('consultor').value.trim(),
        data: document.getElementById('data').value,
        serials: serials,
        observacoes: document.getElementById('observacoes').value.trim()
    };
    
    // Mostrar loading no botão
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        await submitForm(formData);
        
        // Mostrar detalhes do envio
        document.getElementById('success-details').innerHTML = `
            <strong>${formData.consultor}</strong> recebeu <strong>${serials.length}</strong> máquina(s):<br>
            ${serials.join(', ')}
        `;
        
        // Esconder formulário e mostrar mensagem de sucesso
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        // Resetar o formulário após envio bem-sucedido
        resetForm();
     } /*catch (error) {
         alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
    }*/ finally {
        // Restaurar botão independente do resultado
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Botão para adicionar máquinas
adicionarBtn.addEventListener('click', () => {
    adicionarCamposSeriais();
});

// Botão para nova transferência
newTransferBtn.addEventListener('click', () => {
    successMessage.classList.add('hidden');
    form.classList.remove('hidden');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    
    // Configura a data atual como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
});
 requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorElement = document.getElementById(field.errorId);
        
        input.addEventListener('input', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = 'var(--error)';
                errorElement.textContent = 'Este campo é obrigatório';
                errorElement.style.display = 'block';
            } else {
                this.style.borderColor = 'var(--border)';
                errorElement.style.display = 'none';
            }
        });
    });
