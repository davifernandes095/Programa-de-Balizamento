// js/balizamento.js (VERSÃO FINAL: EDITAR ATLETA + INPUT ESPECÍFICO + IMPRESSÃO)

function unificarCategoria(categoria) {
    const partes = categoria.split(' ');
    return partes[0];
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('balizamento-container');
    const imprimirButton = document.getElementById('imprimir-btn');
    const removerTodosButton = document.getElementById('remover-todos-btn');

    function carregarPagina() {
        const atletas = getAtletas();
        const provasFinais = processarDados(atletas);
        renderizarBalisamento(provasFinais);
    }

    // --- OUVINTES DE EVENTOS ---
    imprimirButton.addEventListener('click', () => { window.print(); });
    
    removerTodosButton.addEventListener('click', () => { 
        if (confirm('Tem certeza? Isso removerá todos os atletas inscritos.')) { 
            removerTodosAtletas(); 
            carregarPagina(); 
        } 
    });
    
    // OUVINTE UNIFICADO DE CLIQUES (REMOVER E EDITAR)
    container.addEventListener('click', (event) => {
        // Lógica de REMOVER
        if (event.target.classList.contains('btn-remover-atleta')) {
            const atletaId = parseInt(event.target.dataset.id, 10);
            if (atletaId === 0) { alert("Não é possível remover 'None'."); return; }
            if (confirm('Tem certeza que deseja remover este atleta?')) { 
                removerAtleta(atletaId); 
                carregarPagina(); 
            }
        }

        // Lógica de EDITAR (NOVO)
        if (event.target.classList.contains('btn-editar-atleta')) {
            const atletaId = parseInt(event.target.dataset.id, 10);
            const atletas = getAtletas();
            const atletaAtual = atletas.find(a => a.id === atletaId);

            if (atletaAtual) {
                // Abre prompts sequenciais preenchidos com o valor atual
                // O usuário altera o que quiser e aperta Enter para o próximo
                const novoNome = prompt("Editar Nome:", atletaAtual.nome);
                if (novoNome === null) return; // Cancelou

                const novoClube = prompt("Editar Clube:", atletaAtual.clube);
                if (novoClube === null) return; // Cancelou

                const novoTempo = prompt("Editar Tempo (MM:SS.ms):", atletaAtual.tempo);
                if (novoTempo === null) return; // Cancelou

                // Validação básica para não salvar vazio
                if (novoNome && novoClube && novoTempo) {
                    atualizarAtleta(atletaId, {
                        nome: novoNome,
                        clube: novoClube,
                        tempo: novoTempo
                    });
                    // Recarrega a página para atualizar o balizamento (se o tempo mudou, a série pode mudar)
                    carregarPagina();
                } else {
                    alert("Campos não podem ficar vazios.");
                }
            }
        }
    });

    // Ouvinte para mudança de número da prova (Input Manual)
    container.addEventListener('change', (event) => {
        if (event.target.classList.contains('input-numero-prova')) {
            const novoNumero = parseInt(event.target.value, 10);
            const provaId = parseInt(event.target.dataset.provaId, 10);
            const sexoEditado = event.target.dataset.sexo;
            const categoriaEditada = event.target.dataset.categoriaUnica; 

            if (isNaN(novoNumero) || novoNumero < 1) {
                alert("Por favor, insira um número válido.");
                carregarPagina(); return;
            }

            const spanEspelho = event.target.nextElementSibling;
            if (spanEspelho && spanEspelho.classList.contains('numero-print')) {
                spanEspelho.textContent = novoNumero;
            }

            atualizarNumeroDaProva(provaId, novoNumero, sexoEditado, categoriaEditada);
        }
    });

    function atualizarNumeroDaProva(provaId, novoNumero, sexoEditado, categoriaEditada) {
        let provas = getProvas();
        const index = provas.findIndex(p => p.id === provaId);
        if (index !== -1) {
            let provaBase = provas[index];
            let novoNumeroBase;
            if (sexoEditado === 'Feminino') {
                novoNumeroBase = novoNumero;
            } else {
                novoNumeroBase = novoNumero - 1;
            }
            if (novoNumeroBase < 1) novoNumeroBase = 1;

            if (!provaBase.numerosEspecificos) provaBase.numerosEspecificos = {};
            provaBase.numerosEspecificos[categoriaEditada] = novoNumeroBase;
            
            provas[index] = provaBase;
            localStorage.setItem('provas', JSON.stringify(provas));
            carregarPagina(); 
        }
    }

    function processarDados(atletas) {
        const ordemRaias = [4, 5, 3, 6, 2, 7, 1];
        const NUMERO_DE_RAIAS = 7;
        const ordemDasCategorias = ["Pré-Mirim", "Mirim 1", "Mirim 2", "Petiz 1", "Petiz 2", "Infantil 1", "Infantil 2", "Juvenil", "Júnior", "Sênior"];
        const todasProvasDefinidas = getProvas();

        let eventosBaseParaProcessar = [];
        todasProvasDefinidas.forEach(provaDefinida => {
            const categoriasUnificadas = [...new Set(provaDefinida.categorias.map(cat => unificarCategoria(cat)))];
            categoriasUnificadas.forEach(categoriaUnificada => {
                let numeroBaseEspecifico = 0;
                if (provaDefinida.numerosEspecificos && provaDefinida.numerosEspecificos[categoriaUnificada]) {
                    numeroBaseEspecifico = provaDefinida.numerosEspecificos[categoriaUnificada];
                } else if (provaDefinida.numero) {
                    numeroBaseEspecifico = parseInt(provaDefinida.numero);
                }
                eventosBaseParaProcessar.push({
                    id: provaDefinida.id,
                    nome: provaDefinida.nome,
                    categoria: categoriaUnificada,
                    numeroBase: numeroBaseEspecifico
                });
            });
        });

        eventosBaseParaProcessar.sort((a, b) => {
            const numA = a.numeroBase || 99999;
            const numB = b.numeroBase || 99999;
            if (numA !== numB) return numA - numB;
            const indexA = ordemDasCategorias.map(c => unificarCategoria(c)).indexOf(a.categoria);
            const indexB = ordemDasCategorias.map(c => unificarCategoria(c)).indexOf(b.categoria);
            return indexA - indexB;
        });

        let listaDeProvasFinais = [];
        let contadorSequencial = 1;
        const maxNumManual = Math.max(...eventosBaseParaProcessar.map(e => e.numeroBase || 0));
        if (maxNumManual > 0) contadorSequencial = maxNumManual + 2;

        eventosBaseParaProcessar.forEach((eventoBase) => {
            let baseCalc;
            if (eventoBase.numeroBase > 0) {
                baseCalc = eventoBase.numeroBase;
            } else {
                baseCalc = contadorSequencial;
                contadorSequencial += 2; 
            }

            const numFem = baseCalc;
            const numMasc = baseCalc + 1;

            const atletasFemininos = atletas.filter(a =>
                a.prova === eventoBase.nome &&
                unificarCategoria(a.categoria) === eventoBase.categoria &&
                a.sexo === 'Feminino'
            );
            
            if (atletasFemininos.length > 0) {
                let seriesFemininas = criarSeries(atletasFemininos, ordemRaias, NUMERO_DE_RAIAS);
                listaDeProvasFinais.push({ 
                    ...eventoBase, 
                    sexo: 'Feminino', 
                    numeroProva: numFem, 
                    séries: seriesFemininas, 
                    isPlaceholder: false,
                    categoriaUnificadaReal: eventoBase.categoria 
                });
            }

            const atletasMasculinos = atletas.filter(a =>
                a.prova === eventoBase.nome &&
                unificarCategoria(a.categoria) === eventoBase.categoria &&
                a.sexo === 'Masculino'
            );

            if (atletasMasculinos.length > 0) {
                let seriesMasculinas = criarSeries(atletasMasculinos, ordemRaias, NUMERO_DE_RAIAS);
                listaDeProvasFinais.push({ 
                    ...eventoBase, 
                    sexo: 'Masculino', 
                    numeroProva: numMasc, 
                    séries: seriesMasculinas, 
                    isPlaceholder: false,
                    categoriaUnificadaReal: eventoBase.categoria
                });
            }
        });

        listaDeProvasFinais.sort((a, b) => a.numeroProva - b.numeroProva);
        return listaDeProvasFinais;
    }

    function criarSeries(listaDeAtletas, ordemRaias, numRaias) {
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

    function criarSeriePlaceholder(raia) {
        return [[{ id: 0, nome: 'None', clube: 'None', anoNascimento: 'N/A', tempo: '99:99.99', raia: raia }]];
    }

    function renderizarBalisamento(provasFinais) {
        container.innerHTML = '';
        if (provasFinais.length === 0) {
            container.innerHTML = '<p>Nenhum atleta inscrito ou nenhuma prova cadastrada.</p>';
            return;
        }

        provasFinais.forEach(prova => {
            const provaDiv = document.createElement('div');
            provaDiv.classList.add('prova-section');
            if (prova.isPlaceholder) provaDiv.classList.add('placeholder');

            const textoProva = document.createElement('h3');
            textoProva.innerHTML = `
                Prova 
                <input type="number" 
                       class="input-numero-prova" 
                       value="${prova.numeroProva}" 
                       data-prova-id="${prova.id}" 
                       data-sexo="${prova.sexo}"
                       data-categoria-unica="${prova.categoriaUnificadaReal}">
                <span class="numero-print">${prova.numeroProva}</span>
                - ${prova.nome} (${prova.categoria} ${prova.sexo})
            `;
            provaDiv.appendChild(textoProva);

            prova.séries.forEach((serie, serieIndex) => {
                const serieContainer = document.createElement('div');
                serieContainer.classList.add('serie-container');
                const serieTitulo = document.createElement('h4');
                serieTitulo.textContent = `Série ${serieIndex + 1}`;
                if (prova.séries.length > 1) serieTitulo.classList.add('serie-titulo-arrastavel');
                serieContainer.appendChild(serieTitulo);

                const table = document.createElement('table');
                // ADICIONEI O BOTÃO EDITAR NA TABELA ABAIXO
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Raia</th>
                            <th>Nome</th>
                            <th>Clube</th>
                            <th>Ano</th>
                            <th>Tempo</th>
                            <th class="coluna-acao">Ação</th>
                        </tr>
                    </thead>`;
                const tbody = document.createElement('tbody');
                serie.forEach(atleta => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${atleta.raia}</td>
                        <td>${atleta.nome}</td>
                        <td>${atleta.clube}</td>
                        <td>${atleta.anoNascimento}</td>
                        <td>${atleta.tempo}</td>
                        <td class="coluna-acao">
                            <button class="btn-editar-atleta" data-id="${atleta.id}">Editar</button>
                            <button class="btn-remover-atleta" data-id="${atleta.id}">Remover</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                serieContainer.appendChild(table);
                provaDiv.appendChild(serieContainer);
            });
            container.appendChild(provaDiv);
            
            if (prova.séries.length > 1) {
                new Sortable(provaDiv, {
                    animation: 150,
                    handle: '.serie-titulo-arrastavel',
                    onEnd: function (evt) {
                        const titulos = evt.from.querySelectorAll('.serie-titulo-arrastavel');
                        titulos.forEach((t, i) => t.textContent = `Série ${i + 1}`);
                    }
                });
            }
        });
    }

    carregarPagina();
});