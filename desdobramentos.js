document.addEventListener('DOMContentLoaded', () => {
    const resultadoDesdobramento = document.getElementById('resultadoDesdobramento');
    const buttons = document.querySelectorAll('.gerar-desdobramento');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const dezenas = parseInt(button.dataset.dezenas);
            const jogos = parseInt(button.dataset.jogos);
            const fixas = parseInt(button.dataset.fixas) || 0;
            const precisaAcertar = parseInt(button.dataset.precisa) || 15;
            const valorTotal = jogos * 3.00;

            gerarDesdobramento(dezenas, jogos, fixas, valorTotal, precisaAcertar);
        });
    });

    function gerarDesdobramento(dezenas, jogos, fixas = 0, valorTotal, precisaAcertar) {
        resultadoDesdobramento.innerHTML = '';
        
        // Gerar números aleatórios para o desdobramento
        const numeros = Array.from({length: 25}, (_, i) => i + 1);
        const numerosSelecionados = [];
        
        // Se houver fixas, selecionar primeiro
        if (fixas > 0) {
            const fixasSelecionadas = [];
            while (fixasSelecionadas.length < fixas) {
                const num = Math.floor(Math.random() * 25) + 1;
                if (!fixasSelecionadas.includes(num)) {
                    fixasSelecionadas.push(num);
                }
            }
            numerosSelecionados.push(...fixasSelecionadas);
        }

        // Criar container para os jogos
        const jogosContainer = document.createElement('div');
        jogosContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

        // Gerar os jogos
        for (let i = 0; i < jogos; i++) {
            const jogo = [...numerosSelecionados];
            
            // Completar o jogo com números aleatórios
            while (jogo.length < 15) {
                const num = Math.floor(Math.random() * 25) + 1;
                if (!jogo.includes(num)) {
                    jogo.push(num);
                }
            }

            // Ordenar os números
            jogo.sort((a, b) => a - b);

            // Criar elemento para mostrar o jogo
            const jogoElement = document.createElement('div');
            jogoElement.className = 'p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200';
            
            const numerosElement = document.createElement('div');
            numerosElement.className = 'grid grid-cols-5 gap-2 mb-2';
            
            jogo.forEach(num => {
                const numeroElement = document.createElement('span');
                numeroElement.className = 'numero-selecionado flex items-center justify-center';
                numeroElement.textContent = num.toString().padStart(2, '0');
                numerosElement.appendChild(numeroElement);
            });

            const infoElement = document.createElement('div');
            infoElement.className = 'text-sm text-gray-600 flex justify-between items-center';
            infoElement.innerHTML = `
                <span>Jogo ${i + 1} de ${jogos}</span>
                <span class="font-semibold">R$ 3,00</span>
            `;

            jogoElement.appendChild(numerosElement);
            jogoElement.appendChild(infoElement);
            jogosContainer.appendChild(jogoElement);
        }

        // Adicionar informações sobre o desdobramento
        const infoDesdobramento = document.createElement('div');
        infoDesdobramento.className = 'p-4 bg-blue-50 rounded-lg mb-6 border border-blue-100';
        
        let infoText = `Desdobramento de ${dezenas} dezenas em ${jogos} jogos`;
        if (fixas > 0) {
            infoText += ` (${fixas} dezenas fixas)`;
        }
        if (precisaAcertar < 15) {
            infoText += ` - Garantia de ${precisaAcertar} pontos`;
        }
        
        infoDesdobramento.innerHTML = `
            <h4 class="font-semibold mb-2">Informações do Desdobramento</h4>
            <p>${infoText}</p>
            <p class="mt-2 font-semibold text-lg">Valor total da aposta: R$ ${valorTotal.toFixed(2)}</p>
            <p class="mt-2 text-sm text-gray-600">Este desdobramento garante premiação mínima conforme a tabela acima.</p>
        `;

        resultadoDesdobramento.appendChild(infoDesdobramento);
        resultadoDesdobramento.appendChild(jogosContainer);
    }
}); 