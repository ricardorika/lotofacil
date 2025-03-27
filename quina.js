// Função para buscar os últimos jogos da Quina
async function buscarUltimosJogos(quantidade = 100) {
    try {
        // Usando a API da Quina
        const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/quina/latest/${quantidade}`);
        if (!response.ok) {
            throw new Error('Erro na resposta da API');
        }
        const data = await response.json();
        
        // Verificar se os dados são válidos
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Dados inválidos recebidos da API');
        }

        // Garantir que os números estão no formato correto
        return data.map(jogo => ({
            ...jogo,
            dezenas: jogo.dezenas.map(num => parseInt(num))
        }));
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        // Retornar dados de exemplo em caso de erro
        return gerarDadosExemplo(quantidade);
    }
}

// Função para gerar dados de exemplo quando a API falhar
function gerarDadosExemplo(quantidade) {
    const jogos = [];
    for (let i = 0; i < quantidade; i++) {
        const numeros = Array.from({length: 80}, (_, i) => i + 1);
        // Embaralhar números
        for (let j = numeros.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [numeros[j], numeros[k]] = [numeros[k], numeros[j]];
        }
        jogos.push({
            concurso: i + 1,
            dezenas: numeros.slice(0, 5).sort((a, b) => a - b)
        });
    }
    return jogos;
}

// Função para calcular estatísticas dos números
function calcularEstatisticas(jogos) {
    const estatisticas = {
        frequencia: {},
        pares: {},
        impares: {},
        soma: []
    };

    // Inicializar contadores
    for (let i = 1; i <= 80; i++) {
        estatisticas.frequencia[i] = 0;
    }

    // Calcular frequência de cada número
    jogos.forEach(jogo => {
        jogo.dezenas.forEach(numero => {
            estatisticas.frequencia[numero]++;
        });

        // Contar pares e ímpares
        const pares = jogo.dezenas.filter(n => n % 2 === 0).length;
        const impares = jogo.dezenas.filter(n => n % 2 !== 0).length;
        
        estatisticas.pares[pares] = (estatisticas.pares[pares] || 0) + 1;
        estatisticas.impares[impares] = (estatisticas.impares[impares] || 0) + 1;

        // Calcular soma dos números
        const soma = jogo.dezenas.reduce((a, b) => a + b, 0);
        estatisticas.soma.push(soma);
    });

    // Calcular médias
    estatisticas.mediaSoma = estatisticas.soma.reduce((a, b) => a + b, 0) / estatisticas.soma.length;

    return estatisticas;
}

// Função para gerar números baseados em estatísticas
function gerarNumerosBaseadosEmEstatisticas(estatisticas) {
    const numeros = [];
    const numerosDisponiveis = Array.from({length: 80}, (_, i) => i + 1);
    
    // Ordenar números por frequência
    const numerosOrdenados = numerosDisponiveis.sort((a, b) => 
        estatisticas.frequencia[b] - estatisticas.frequencia[a]
    );

    // Selecionar números mais frequentes
    for (let i = 0; i < 5; i++) {
        numeros.push(numerosOrdenados[i]);
    }

    return numeros.sort((a, b) => a - b);
}

// Funções para gerenciar o histórico de jogos
function salvarJogo(numeros, tipo) {
    const jogos = JSON.parse(localStorage.getItem('ultimosJogosQuina') || '[]');
    const novoJogo = {
        numeros: Array.from(numeros).sort((a, b) => a - b),
        tipo: tipo,
        data: new Date().toLocaleString()
    };
    
    jogos.unshift(novoJogo);
    // Manter apenas os últimos 10 jogos
    const jogosLimitados = jogos.slice(0, 10);
    localStorage.setItem('ultimosJogosQuina', JSON.stringify(jogosLimitados));
    atualizarHistoricoJogos();
}

function atualizarHistoricoJogos() {
    const historicoContainer = document.getElementById('historicoJogos');
    const jogos = JSON.parse(localStorage.getItem('ultimosJogosQuina') || '[]');
    const tipoFiltro = document.getElementById('filtroTipo').value;
    
    historicoContainer.innerHTML = '';
    
    const jogosFiltrados = tipoFiltro === 'todos' 
        ? jogos 
        : jogos.filter(jogo => jogo.tipo === tipoFiltro);
    
    jogosFiltrados.forEach(jogo => {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 p-4 rounded-lg mb-2';
        
        const numerosHtml = jogo.numeros.map(num => 
            `<span class="bg-blue-600 text-white px-2 py-1 rounded-full text-sm mr-1">${num}</span>`
        ).join('');
        
        let tipoClass, tipoTexto;
        switch(jogo.tipo) {
            case 'estatisticas':
                tipoClass = 'text-purple-600';
                tipoTexto = 'Gerado com Estatísticas';
                break;
            case 'aleatorio':
                tipoClass = 'text-blue-600';
                tipoTexto = 'Gerado Aleatoriamente';
                break;
            case 'manual':
                tipoClass = 'text-green-600';
                tipoTexto = 'Gerado Manualmente';
                break;
        }
        
        div.innerHTML = `
            <div class="flex flex-wrap gap-2 mb-2">
                ${numerosHtml}
            </div>
            <div class="text-sm text-gray-600">
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
    const btnGerarJogo = document.getElementById('gerarJogo');
    const btnGerarEstatisticas = document.getElementById('gerarEstatisticas');
    const btnConfirmarJogo = document.getElementById('confirmarJogo');
    const btnLimparJogo = document.getElementById('limparJogo');
    const frequenciaNumerosContainer = document.getElementById('frequenciaNumeros');
    const distribuicaoContainer = document.getElementById('distribuicao');
    const loadingIcon = document.getElementById('loadingIcon');
    const filtroTipo = document.getElementById('filtroTipo');
    
    let numerosSelecionados = new Set();
    let estatisticasAtuais = null;
    let modoManual = false;

    // Criar os 80 números
    for (let i = 1; i <= 80; i++) {
        const numero = document.createElement('button');
        numero.className = 'w-12 h-12 rounded-full border-2 border-blue-600 text-lg font-semibold hover:bg-blue-100 transition-colors';
        numero.textContent = i;
        numero.addEventListener('click', () => toggleNumero(i, numero));
        numerosContainer.appendChild(numero);
    }

    function toggleNumero(num, elemento) {
        if (numerosSelecionados.has(num)) {
            numerosSelecionados.delete(num);
            elemento.classList.remove('bg-blue-600', 'text-white');
            elemento.classList.add('border-blue-600');
            atualizarNumerosSelecionados();
            modoManual = true;
            btnConfirmarJogo.classList.remove('hidden');
        } else if (numerosSelecionados.size < 5) {
            numerosSelecionados.add(num);
            elemento.classList.add('bg-blue-600', 'text-white');
            elemento.classList.remove('border-blue-600');
            atualizarNumerosSelecionados();
            modoManual = true;
            btnConfirmarJogo.classList.remove('hidden');
        } else {
            alert('Você já selecionou 5 números!');
        }
    }

    function atualizarNumerosSelecionados() {
        numerosSelecionadosContainer.innerHTML = '';
        [...numerosSelecionados].sort((a, b) => a - b).forEach(num => {
            const span = document.createElement('span');
            span.className = 'bg-blue-600 text-white px-3 py-1 rounded-full';
            span.textContent = num;
            numerosSelecionadosContainer.appendChild(span);
        });
    }

    function atualizarEstatisticas(estatisticas) {
        estatisticasAtuais = estatisticas;
        
        // Atualizar frequência dos números
        frequenciaNumerosContainer.innerHTML = '';
        Object.entries(estatisticas.frequencia)
            .sort((a, b) => b[1] - a[1])
            .forEach(([numero, frequencia]) => {
                const div = document.createElement('div');
                div.className = 'inline-block bg-gray-200 px-2 py-1 rounded mr-1 mb-1';
                div.textContent = `${numero}: ${frequencia}`;
                frequenciaNumerosContainer.appendChild(div);
            });

        // Atualizar distribuição
        distribuicaoContainer.innerHTML = `
            <p>Média de Pares: ${Object.entries(estatisticas.pares)
                .reduce((acc, [pares, freq]) => acc + (parseInt(pares) * freq), 0) / 
                Object.values(estatisticas.pares).reduce((a, b) => a + b, 0)}</p>
            <p>Média de Ímpares: ${Object.entries(estatisticas.impares)
                .reduce((acc, [impares, freq]) => acc + (parseInt(impares) * freq), 0) / 
                Object.values(estatisticas.impares).reduce((a, b) => a + b, 0)}</p>
            <p>Média da Soma: ${estatisticas.mediaSoma.toFixed(2)}</p>
        `;
    }

    async function gerarJogoComEstatisticas() {
        try {
            // Mostrar indicador de carregamento
            loadingIcon.classList.remove('hidden');
            btnGerarEstatisticas.disabled = true;

            const jogos = await buscarUltimosJogos(1000);
            const estatisticas = calcularEstatisticas(jogos);
            atualizarEstatisticas(estatisticas);

            const numerosGerados = gerarNumerosBaseadosEmEstatisticas(estatisticas);
            numerosSelecionados = new Set(numerosGerados);
            
            document.querySelectorAll('#numeros button').forEach(btn => {
                const num = parseInt(btn.textContent);
                if (numerosSelecionados.has(num)) {
                    btn.classList.add('bg-blue-600', 'text-white');
                    btn.classList.remove('border-blue-600');
                } else {
                    btn.classList.remove('bg-blue-600', 'text-white');
                    btn.classList.add('border-blue-600');
                }
            });

            atualizarNumerosSelecionados();
            salvarJogo(numerosSelecionados, 'estatisticas');
            modoManual = false;
            btnConfirmarJogo.classList.add('hidden');
        } catch (error) {
            console.error('Erro ao gerar jogo com estatísticas:', error);
            alert('Ocorreu um erro ao gerar o jogo com estatísticas. Tente novamente.');
        } finally {
            // Esconder indicador de carregamento
            loadingIcon.classList.add('hidden');
            btnGerarEstatisticas.disabled = false;
        }
    }

    function gerarJogoAleatorio() {
        const numeros = Array.from({length: 80}, (_, i) => i + 1);
        for (let i = numeros.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
        }
        
        numerosSelecionados = new Set(numeros.slice(0, 5));
        atualizarNumerosSelecionados();
        
        document.querySelectorAll('#numeros button').forEach(btn => {
            const num = parseInt(btn.textContent);
            if (numerosSelecionados.has(num)) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('border-blue-600');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('border-blue-600');
            }
        });

        salvarJogo(numerosSelecionados, 'aleatorio');
        modoManual = false;
        btnConfirmarJogo.classList.add('hidden');
    }

    function confirmarJogoManual() {
        if (numerosSelecionados.size === 5) {
            salvarJogo(numerosSelecionados, 'manual');
            modoManual = false;
            btnConfirmarJogo.classList.add('hidden');
        } else {
            alert('Selecione exatamente 5 números antes de confirmar!');
        }
    }

    function limparJogo() {
        numerosSelecionados.clear();
        document.querySelectorAll('#numeros button').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('border-blue-600');
        });
        numerosSelecionadosContainer.innerHTML = '';
        frequenciaNumerosContainer.innerHTML = '';
        distribuicaoContainer.innerHTML = '';
        modoManual = false;
        btnConfirmarJogo.classList.add('hidden');
    }

    btnGerarJogo.addEventListener('click', gerarJogoAleatorio);
    btnGerarEstatisticas.addEventListener('click', gerarJogoComEstatisticas);
    btnConfirmarJogo.addEventListener('click', confirmarJogoManual);
    btnLimparJogo.addEventListener('click', limparJogo);
    filtroTipo.addEventListener('change', atualizarHistoricoJogos);

    // Carregar histórico de jogos ao iniciar
    atualizarHistoricoJogos();
}); 