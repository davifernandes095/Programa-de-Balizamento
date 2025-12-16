// js-temp/resultados.js (VERSÃO COMPLETA E INTEGRADA)

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const containerPrincipal = document.getElementById('central-resultados-container');
    const salvarResultadosBtn = document.getElementById('salvar-resultados-btn');
    const imprimirPdfBtn = document.getElementById('imprimir-pdf-btn');

    // Função para unificar categoria (copiada de balizamento.js)
    function unificarCategoria(categoria) {
        const partes = categoria.split(' ');
        return partes[0];
    }

    /**
     * Função principal que renderiza a página inteira com todas as provas.
     */
    function renderizarPaginaCompleta() {
        containerPrincipal.innerHTML = ''; // Limpa o container
        const atletas = getAtletas();
        const todasOsResultadosSalvos = getResultados();

        // Pega os dados do balizamento para saber quais provas realmente existem
        const dadosBalizamento = processarDadosBalizamento(atletas);

        if (dadosBalizamento.every(p => p.isPlaceholder)) {
            containerPrincipal.innerHTML = '<p>Nenhum atleta inscrito em nenhuma prova ainda.</p>';
            salvarResultadosBtn.style.display = 'none';
            imprimirPdfBtn.style.display = 'none';
            return;
        }

        dadosBalizamento.forEach(prova => {
            // Ignora provas sem nenhum atleta inscrito
            if (prova.isPlaceholder) {
                return;
            }

            const chaveProva = `${prova.nome}|${prova.categoria}|${prova.sexo}`;
            const atletasDaProva = atletas.filter(a =>
                a.prova === prova.nome &&
                unificarCategoria(a.categoria) === prova.categoria &&
                a.sexo === prova.sexo
            );
            
            // Cria um grande bloco para esta prova
            const blocoProvaDiv = document.createElement('div');
            blocoProvaDiv.className = 'prova-bloco';

            const titulo = document.createElement('h3');
            titulo.textContent = `Prova ${prova.numeroProva} - ${prova.nome} (${prova.categoria} ${prova.sexo})`;
            blocoProvaDiv.appendChild(titulo);

            // --- Seção de Entrada de Tempos ---
            const entradaDiv = document.createElement('div');
            entradaDiv.className = 'entrada-container';
            const series = criarSeries(atletasDaProva);
            series.forEach((serie, index) => {
                entradaDiv.innerHTML += `<h4>Série ${index + 1}</h4>`;
                let tabelaHtml = `
                    <table>
                        <thead>
                            <tr>
                                <th>Raia</th>
                                <th>Nome</th>
                                <th>Clube</th>
                                <th>Tempo Final (MM:SS.ms)</th>
                            </tr>
                        </thead>
                        <tbody>`;
                serie.forEach(atleta => {
                    const resultadoSalvo = todasOsResultadosSalvos.find(r => r.atletaId === atleta.id && r.chaveProva === chaveProva);
                    const tempoSalvo = resultadoSalvo ? resultadoSalvo.tempoFinal : '';
                    tabelaHtml += `
                        <tr>
                            <td>${atleta.raia}</td>
                            <td>${atleta.nome}</td>
                            <td>${atleta.clube}</td>
                            <td>
                                <input 
                                    type="text" 
                                    class="tempo-resultado-input" 
                                    placeholder="00:00.00" 
                                    data-atleta-id="${atleta.id}"
                                    data-chave-prova="${chaveProva}"
                                    value="${tempoSalvo}">
                            </td>
                        </tr>`;
                });
                tabelaHtml += '</tbody></table>';
                entradaDiv.innerHTML += tabelaHtml;
            });
            blocoProvaDiv.appendChild(entradaDiv);


            // --- Seção de Classificação Final ---
            const classificacaoDiv = document.createElement('div');
            classificacaoDiv.className = 'classificacao-container';
            classificacaoDiv.id = `classificacao-${chaveProva.replace(/[^a-zA-Z0-9]/g, '-')}`; // ID único para a tabela de classificação
            blocoProvaDiv.appendChild(classificacaoDiv);

            containerPrincipal.appendChild(blocoProvaDiv);
        });

        // Após renderizar tudo, exibe a classificação para os dados já salvos
        exibirTodasAsClassificacoes();
    }

    /**
     * Salva TODOS os tempos inseridos na página de uma só vez.
     */
    function salvarTodosOsResultados() {
        const inputs = document.querySelectorAll('.tempo-resultado-input');
        const todosOsResultados = [];

        inputs.forEach(input => {
            const tempo = input.value.trim();
            if (tempo) { // Salva apenas se um tempo foi digitado
                todosOsResultados.push({
                    atletaId: parseInt(input.dataset.atletaId, 10),
                    chaveProva: input.dataset.chaveProva,
                    tempoFinal: tempo
                });
            }
        });

        salvarResultados(todosOsResultados);
        alert('Todos os resultados foram salvos com sucesso!');
        
        // Atualiza as tabelas de classificação
        exibirTodasAsClassificacoes();
    }

    /**
     * Renderiza as tabelas de classificação para todas as provas que têm resultados.
     */
    function exibirTodasAsClassificacoes() {
        const atletas = getAtletas();
        const todosResultados = getResultados();
        
        // Agrupa resultados por prova
        const resultadosAgrupados = todosResultados.reduce((acc, res) => {
            (acc[res.chaveProva] = acc[res.chaveProva] || []).push(res);
            return acc;
        }, {});

        // Itera sobre cada prova agrupada para criar sua tabela de classificação
        for (const chaveProva in resultadosAgrupados) {
            const resultadosDaProva = resultadosAgrupados[chaveProva];
            const containerClassificacao = document.getElementById(`classificacao-${chaveProva.replace(/[^a-zA-Z0-9]/g, '-')}`);
            if (!containerClassificacao) continue;

            const atletasComTempo = resultadosDaProva.map(resultado => {
                const atletaInfo = atletas.find(a => a.id === resultado.atletaId);
                return { ...atletaInfo, tempoFinal: resultado.tempoFinal };
            });

            atletasComTempo.sort((a, b) => a.tempoFinal.localeCompare(b.tempoFinal));

            let tabelaHtml = '<h4>Classificação Final</h4><table><thead><tr><th>Colocação</th><th>Nome</th><th>Clube</th><th>Tempo Final</th></tr></thead><tbody>';
            atletasComTempo.forEach((atleta, index) => {
                tabelaHtml += `
                    <tr>
                        <td>${index + 1}º</td>
                        <td>${atleta.nome}</td>
                        <td>${atleta.clube}</td>
                        <td>${atleta.tempoFinal}</td>
                    </tr>`;
            });
            tabelaHtml += '</tbody></table>';
            
            containerClassificacao.innerHTML = tabelaHtml;
        }
    }


    // --- Funções Auxiliares (copiadas/adaptadas de balizamento.js) ---
    // (Estas funções permanecem as mesmas da resposta anterior)
    function criarSeries(listaDeAtletas) {
        const ordemRaias = [4, 5, 3, 6, 2, 7, 1];
        const numRaias = 7;
        listaDeAtletas.sort((a, b) => a.tempo.localeCompare(b.tempo));
        const séries = [];
        for (let i = 0; i < listaDeAtletas.length; i += numRaias) {
            const atletasDaSerie = listaDeAtletas.slice(i, i + numRaias);
            const serieFormatada = atletasDaSerie.map((atleta, index) => ({ ...atleta, raia: ordemRaias[index] }));
            serieFormatada.sort((a, b) => a.raia - b.raia);
            séries.push(serieFormatada);
        }
        return séries;
    }

    function processarDadosBalizamento(atletas) {
        const ordemDasCategorias = ["Mini Mirim", "Pré-Mirim", "Mirim 1", "Mirim 2", "Petiz 1", "Petiz 2", "Infantil 1", "Infantil 2", "Juvenil", "Júnior", "Sênior"];
        const todasProvasDefinidas = getProvas();
        const ordemPersonalizada = getOrdemDasProvas();
        let eventosBase = [];
        const provasOrdenadas = [...todasProvasDefinidas].sort((a, b) => {
            const indexA = ordemPersonalizada.indexOf(String(a.id));
            const indexB = ordemPersonalizada.indexOf(String(b.id));
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            return 0;
        });
        provasOrdenadas.forEach(provaDefinida => {
            const categoriasUnificadas = [...new Set(provaDefinida.categorias.map(cat => unificarCategoria(cat)))];
            categoriasUnificadas.sort((a, b) => {
                const indexA = ordemDasCategorias.map(c => unificarCategoria(c)).indexOf(a);
                const indexB = ordemDasCategorias.map(c => unificarCategoria(c)).indexOf(b);
                return indexA - indexB;
            });
            categoriasUnificadas.forEach(categoriaUnificada => {
                eventosBase.push({
                    id: provaDefinida.id,
                    nome: provaDefinida.nome,
                    categoria: categoriaUnificada
                });
            });
        });
        let listaDeProvasFinais = [];
        eventosBase.forEach((eventoBase, index) => {
            const numeroBase = index + 1;
            const atletasFemininos = atletas.filter(a => a.prova === eventoBase.nome && unificarCategoria(a.categoria) === eventoBase.categoria && a.sexo === 'Feminino');
            listaDeProvasFinais.push({ ...eventoBase, sexo: 'Feminino', numeroProva: (numeroBase * 2) - 1, isPlaceholder: atletasFemininos.length === 0 });
            const atletasMasculinos = atletas.filter(a => a.prova === eventoBase.nome && unificarCategoria(a.categoria) === eventoBase.categoria && a.sexo === 'Masculino');
            listaDeProvasFinais.push({ ...eventoBase, sexo: 'Masculino', numeroProva: (numeroBase * 2), isPlaceholder: atletasMasculinos.length === 0 });
        });
        return listaDeProvasFinais.sort((a, b) => a.numeroProva - b.numeroProva);
    }

    // --- Ouvintes de Eventos ---
    salvarResultadosBtn.addEventListener('click', salvarTodosOsResultados);
    imprimirPdfBtn.addEventListener('click', () => { window.print(); });

    // --- Inicialização ---
    renderizarPaginaCompleta();
});