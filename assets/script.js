const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbylZmA2Rqo4zyN8j_Z4Gcs0nMOhdbIYABNXX38131Kw4v1xIP1K-YPo_oCDJxpL1lZ0kw/exec';

// Elementos do formulário
const form = document.getElementById('transferForm');
const successMessage = document.getElementById('successMessage');
const newTransferBtn = document.getElementById('newTransferBtn');
const adicionarBtn = document.getElementById('adicionarBtn');
const seriaisContainer = document.getElementById('seriais-container');

const requiredFields = [
    { id: 'supervisor', errorId: 'supervisor-error' },
    { id: 'consultor', errorId: 'consultor-error' },
    { id: 'data', errorId: 'data-error' },
    { id: 'quantidade', errorId: 'quantidade-error' }
];

function updateCurrentDate() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = now.toLocaleDateString('pt-BR', options);
    document.getElementById('current-date').textContent = formattedDate;
}

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
    
    return isValid;
}

function resetForm() {
    form.reset();
    seriaisContainer.innerHTML = '';
    requiredFields.forEach(field => {
        document.getElementById(field.id).style.borderColor = 'var(--border)';
        document.getElementById(field.errorId).style.display = 'none';
    });
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
    document.getElementById('quantidade').value = 1;
}

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

async function submitForm(data) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        return { status: "success" };
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Coletar todos os seriais
    const serialInputs = document.querySelectorAll('.serial-input');
    const submittedSerials = Array.from(serialInputs).map(input => input.value.trim());
    
    if (submittedSerials.length === 0 || submittedSerials.some(serial => !serial)) {
        alert('Por favor, preencha todos os números de série das máquinas');
        return;
    }
    
    const formData = {
        supervisor: document.getElementById('supervisor').value.trim(),
        consultor: document.getElementById('consultor').value.trim(),
        data: document.getElementById('data').value,
        serials: submittedSerials,
        observacoes: document.getElementById('observacoes').value.trim()
    };
    
    // Mostrar loading no botão
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        await submitForm(formData);
        
        document.getElementById('success-details').innerHTML = `
            <strong>${formData.consultor}</strong> recebeu <strong>${submittedSerials.length}</strong> máquina(s):<br>
            ${submittedSerials.join(', ')}
        `;
        
        // Esconder formulário e mostrar mensagem de sucesso
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        resetForm();
     } /*catch (error) {
         alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
    }*/ finally {
        // Restaurar botão independente do resultado
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

adicionarBtn.addEventListener('click', () => {
    adicionarCamposSeriais();
});

newTransferBtn.addEventListener('click', () => {
    successMessage.style.display = 'none';
    form.style.display = 'block';
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    
    // Configura a data atual como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
});
