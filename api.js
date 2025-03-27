// Função para buscar os últimos jogos da Lotofácil
async function buscarUltimosJogos(quantidade = 100) {
    try {
        // Usando a API da Lotofácil
        const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest/${quantidade}`);
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
        const numeros = Array.from({length: 25}, (_, i) => i + 1);
        // Embaralhar números
        for (let j = numeros.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [numeros[j], numeros[k]] = [numeros[k], numeros[j]];
        }
        jogos.push({
            concurso: i + 1,
            dezenas: numeros.slice(0, 15).sort((a, b) => a - b)
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
    for (let i = 1; i <= 25; i++) {
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
    const numerosDisponiveis = Array.from({length: 25}, (_, i) => i + 1);
    
    // Ordenar números por frequência
    const numerosOrdenados = numerosDisponiveis.sort((a, b) => 
        estatisticas.frequencia[b] - estatisticas.frequencia[a]
    );

    // Selecionar números mais frequentes
    for (let i = 0; i < 15; i++) {
        numeros.push(numerosOrdenados[i]);
    }

    return numeros.sort((a, b) => a - b);
}

export { buscarUltimosJogos, calcularEstatisticas, gerarNumerosBaseadosEmEstatisticas }; 