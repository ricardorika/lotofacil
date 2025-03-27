// Funções para gerenciar o histórico de jogos
function salvarJogo(numeros, tipo) {
    const jogos = JSON.parse(localStorage.getItem('ultimosJogosFederal') || '[]');
    const novoJogo = {
        numeros: Array.from(numeros).sort((a, b) => a - b),
        tipo: tipo,
        data: new Date().toLocaleString()
    };
    
    jogos.unshift(novoJogo);
    // Manter apenas os últimos 10 jogos
    const jogosLimitados = jogos.slice(0, 10);
    localStorage.setItem('ultimosJogosFederal', JSON.stringify(jogosLimitados));
    atualizarHistoricoJogos();
}

function atualizarHistoricoJogos() {
    const historicoContainer = document.getElementById('historicoJogos');
    const jogos = JSON.parse(localStorage.getItem('ultimosJogosFederal') || '[]');
    
    historicoContainer.innerHTML = '';
    
    jogos.forEach(jogo => {
        const div = document.createElement('div');
        div.className = 'historico-item';
        
        const numerosHtml = jogo.numeros.map(num => 
            `<span class="numero-selecionado">${num}</span>`
        ).join('');
        
        let tipoClass, tipoTexto;
        switch(jogo.tipo) {
            case 'aleatorio':
                tipoClass = 'text-indigo-600';
                tipoTexto = 'Gerado Aleatoriamente';
                break;
            case 'manual':
                tipoClass = 'text-green-600';
                tipoTexto = 'Gerado Manualmente';
                break;
        }
        
        div.innerHTML = `
            <div class="historico-numeros">
                ${numerosHtml}
            </div>
            <div class="historico-info">
                <span class="${tipoClass} font-semibold">${tipoTexto}</span>
                <span class="ml-2">${jogo.data}</span>
            </div>
        `;
        
        historicoContainer.appendChild(div);
    });
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    const numerosSelecionadosContainer = document.getElementById('numerosSelecionados');
    const btnGerarJogo = document.getElementById('gerarJogo');
    const btnConfirmarJogo = document.getElementById('confirmarJogo');
    const btnLimparJogo = document.getElementById('limparJogo');
    const inputs = document.querySelectorAll('input[type="number"]');
    
    let numerosSelecionados = new Set();

    function validarNumero(numero) {
        return numero >= 0 && numero <= 99999;
    }

    function atualizarNumerosSelecionados() {
        numerosSelecionadosContainer.innerHTML = '';
        [...numerosSelecionados].sort((a, b) => a - b).forEach(num => {
            const span = document.createElement('span');
            span.className = 'numero-selecionado';
            span.textContent = num;
            numerosSelecionadosContainer.appendChild(span);
        });
    }

    function gerarJogoAleatorio() {
        numerosSelecionados.clear();
        const numeros = new Set();
        
        while (numeros.size < 5) {
            const numero = Math.floor(Math.random() * 100000);
            if (!numeros.has(numero)) {
                numeros.add(numero);
            }
        }
        
        numerosSelecionados = numeros;
        atualizarNumerosSelecionados();
        salvarJogo(numerosSelecionados, 'aleatorio');
    }

    function confirmarJogoManual() {
        const numeros = Array.from(inputs).map(input => parseInt(input.value));
        
        // Validar números
        if (numeros.some(num => isNaN(num) || !validarNumero(num))) {
            alert('Por favor, insira números válidos entre 0 e 99999!');
            return;
        }
        
        // Verificar duplicatas
        if (new Set(numeros).size !== 5) {
            alert('Por favor, insira números diferentes!');
            return;
        }
        
        numerosSelecionados = new Set(numeros);
        atualizarNumerosSelecionados();
        salvarJogo(numerosSelecionados, 'manual');
    }

    function limparJogo() {
        numerosSelecionados.clear();
        inputs.forEach(input => input.value = '');
        numerosSelecionadosContainer.innerHTML = '';
    }

    // Adicionar validação em tempo real para os inputs
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const valor = parseInt(input.value);
            if (valor < 0) input.value = 0;
            if (valor > 99999) input.value = 99999;
        });
    });

    btnGerarJogo.addEventListener('click', gerarJogoAleatorio);
    btnConfirmarJogo.addEventListener('click', confirmarJogoManual);
    btnLimparJogo.addEventListener('click', limparJogo);

    // Carregar histórico de jogos ao iniciar
    atualizarHistoricoJogos();
}); 