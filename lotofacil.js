// Funções para buscar dados da API
async function buscarUltimosJogos(quantidade = 1000) {
    try {
        const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest/${quantidade}`);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return gerarDadosExemplo(quantidade);
    }
}

function gerarDadosExemplo(quantidade) {
    const jogos = [];
    for (let i = 0; i < quantidade; i++) {
        const numeros = new Set();
        while (numeros.size < 15) {
            numeros.add(Math.floor(Math.random() * 25) + 1);
        }
        jogos.push({
            numbers: Array.from(numeros).sort((a, b) => a - b)
        });
    }
    return jogos;
}

// Funções para calcular estatísticas
function calcularEstatisticas(jogos) {
    const frequencia = new Array(25).fill(0);
    let totalPares = 0;
    let totalImpares = 0;
    let totalPrimos = 0;
    let somaTotal = 0;

    jogos.forEach(jogo => {
        jogo.numbers.forEach(num => {
            frequencia[num - 1]++;
            if (num % 2 === 0) totalPares++;
            else totalImpares++;
            if (ehPrimo(num)) totalPrimos++;
            somaTotal += num;
        });
    });

    return {
        frequencia,
        totalJogos: jogos.length,
        mediaPares: totalPares / jogos.length,
        mediaImpares: totalImpares / jogos.length,
        mediaPrimos: totalPrimos / jogos.length,
        mediaSoma: somaTotal / jogos.length
    };
}

function ehPrimo(num) {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

// Funções para gerar jogos
function gerarNumerosBaseadosEmEstatisticas(estatisticas) {
    const numeros = new Set();
    const pesos = estatisticas.frequencia.map(freq => freq / estatisticas.totalJogos);
    
    while (numeros.size < 15) {
        const numero = Math.floor(Math.random() * 25) + 1;
        if (!numeros.has(numero) && Math.random() < pesos[numero - 1]) {
            numeros.add(numero);
        }
    }
    
    return Array.from(numeros).sort((a, b) => a - b);
}

// Funções para gerenciar o histórico de jogos
function salvarJogo(numeros, tipo) {
    const jogos = JSON.parse(localStorage.getItem('ultimosJogosLotofacil') || '[]');
    const novoJogo = {
        numeros: Array.from(numeros).sort((a, b) => a - b),
        tipo: tipo,
        data: new Date().toLocaleString()
    };
    
    jogos.unshift(novoJogo);
    // Manter apenas os últimos 10 jogos
    const jogosLimitados = jogos.slice(0, 10);
    localStorage.setItem('ultimosJogosLotofacil', JSON.stringify(jogosLimitados));
    atualizarHistoricoJogos();
}

function atualizarHistoricoJogos() {
    const historicoContainer = document.getElementById('historicoJogos');
    const filtroTipo = document.getElementById('filtroTipo').value;
    const jogos = JSON.parse(localStorage.getItem('ultimosJogosLotofacil') || '[]');
    
    historicoContainer.innerHTML = '';
    
    jogos
        .filter(jogo => filtroTipo === 'todos' || jogo.tipo === filtroTipo)
        .forEach(jogo => {
            const div = document.createElement('div');
            div.className = 'historico-item';
            
            const numerosHtml = jogo.numeros.map(num => 
                `<span class="numero-selecionado">${num}</span>`
            ).join('');
            
            let tipoClass, tipoTexto;
            switch(jogo.tipo) {
                case 'aleatorio':
                    tipoClass = 'text-blue-600';
                    tipoTexto = 'Gerado Aleatoriamente';
                    break;
                case 'manual':
                    tipoClass = 'text-green-600';
                    tipoTexto = 'Gerado Manualmente';
                    break;
                case 'estatisticas':
                    tipoClass = 'text-purple-600';
                    tipoTexto = 'Gerado com Estatísticas';
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
    const numerosContainer = document.getElementById('numeros');
    const numerosSelecionadosContainer = document.getElementById('numerosSelecionados');
    const frequenciaNumerosContainer = document.getElementById('frequenciaNumeros');
    const distribuicaoContainer = document.getElementById('distribuicao');
    const btnGerarJogo = document.getElementById('gerarJogo');
    const btnGerarEstatisticas = document.getElementById('gerarEstatisticas');
    const btnConfirmarJogo = document.getElementById('confirmarJogo');
    const btnLimparJogo = document.getElementById('limparJogo');
    const loadingIcon = document.getElementById('loadingIcon');
    const filtroTipo = document.getElementById('filtroTipo');
    
    let numerosSelecionados = new Set();
    let estatisticas = null;

    // Criar grid de números
    for (let i = 1; i <= 25; i++) {
        const button = document.createElement('button');
        button.className = 'btn btn-gray w-full h-12 text-lg font-semibold';
        button.textContent = i;
        button.addEventListener('click', () => {
            if (numerosSelecionados.has(i)) {
                numerosSelecionados.delete(i);
                button.classList.remove('btn-primary');
                button.classList.add('btn-gray');
            } else if (numerosSelecionados.size < 15) {
                numerosSelecionados.add(i);
                button.classList.remove('btn-gray');
                button.classList.add('btn-primary');
            } else {
                alert('Você já selecionou 15 números!');
            }
            atualizarNumerosSelecionados();
            btnConfirmarJogo.classList.toggle('hidden', numerosSelecionados.size !== 15);
        });
        numerosContainer.appendChild(button);
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

    function atualizarEstatisticas(estatisticas) {
        // Atualizar frequência dos números
        frequenciaNumerosContainer.innerHTML = '';
        estatisticas.frequencia.forEach((freq, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2';
            const numero = index + 1;
            const porcentagem = (freq / estatisticas.totalJogos * 100).toFixed(1);
            div.innerHTML = `
                <span class="font-semibold">${numero}:</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${porcentagem}%"></div>
                </div>
                <span class="text-sm text-gray-600">${porcentagem}%</span>
            `;
            frequenciaNumerosContainer.appendChild(div);
        });

        // Atualizar distribuição
        distribuicaoContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-600">Média de Pares:</p>
                    <p class="font-semibold">${estatisticas.mediaPares.toFixed(1)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Média de Ímpares:</p>
                    <p class="font-semibold">${estatisticas.mediaImpares.toFixed(1)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Média de Primos:</p>
                    <p class="font-semibold">${estatisticas.mediaPrimos.toFixed(1)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Média da Soma:</p>
                    <p class="font-semibold">${estatisticas.mediaSoma.toFixed(1)}</p>
                </div>
            </div>
        `;
    }

    async function gerarJogoComEstatisticas() {
        loadingIcon.classList.remove('hidden');
        btnGerarEstatisticas.disabled = true;
        
        try {
            const jogos = await buscarUltimosJogos();
            estatisticas = calcularEstatisticas(jogos);
            atualizarEstatisticas(estatisticas);
            
            const numeros = gerarNumerosBaseadosEmEstatisticas(estatisticas);
            numerosSelecionados = new Set(numeros);
            
            // Atualizar botões
            document.querySelectorAll('#numeros button').forEach(button => {
                const num = parseInt(button.textContent);
                button.classList.toggle('btn-primary', numerosSelecionados.has(num));
                button.classList.toggle('btn-gray', !numerosSelecionados.has(num));
            });
            
            atualizarNumerosSelecionados();
            salvarJogo(numerosSelecionados, 'estatisticas');
        } catch (error) {
            console.error('Erro ao gerar jogo com estatísticas:', error);
            alert('Erro ao gerar jogo com estatísticas. Tente novamente.');
        } finally {
            loadingIcon.classList.add('hidden');
            btnGerarEstatisticas.disabled = false;
        }
    }

    function gerarJogoAleatorio() {
        const numeros = new Set();
        while (numeros.size < 15) {
            const numero = Math.floor(Math.random() * 25) + 1;
            numeros.add(numero);
        }
        
        numerosSelecionados = numeros;
        
        // Atualizar botões
        document.querySelectorAll('#numeros button').forEach(button => {
            const num = parseInt(button.textContent);
            button.classList.toggle('btn-primary', numerosSelecionados.has(num));
            button.classList.toggle('btn-gray', !numerosSelecionados.has(num));
        });
        
        atualizarNumerosSelecionados();
        salvarJogo(numerosSelecionados, 'aleatorio');
    }

    function confirmarJogoManual() {
        if (numerosSelecionados.size !== 15) {
            alert('Selecione exatamente 15 números!');
            return;
        }
        salvarJogo(numerosSelecionados, 'manual');
    }

    function limparJogo() {
        numerosSelecionados.clear();
        document.querySelectorAll('#numeros button').forEach(button => {
            button.classList.remove('btn-primary');
            button.classList.add('btn-gray');
        });
        numerosSelecionadosContainer.innerHTML = '';
        btnConfirmarJogo.classList.add('hidden');
    }

    // Event Listeners
    btnGerarJogo.addEventListener('click', gerarJogoAleatorio);
    btnGerarEstatisticas.addEventListener('click', gerarJogoComEstatisticas);
    btnConfirmarJogo.addEventListener('click', confirmarJogoManual);
    btnLimparJogo.addEventListener('click', limparJogo);
    filtroTipo.addEventListener('change', atualizarHistoricoJogos);

    // Carregar histórico de jogos ao iniciar
    atualizarHistoricoJogos();
}); 