// js/balizamento.js (VERSÃO FINAL: SEM MINI-MIRIM + SEM PROVAS VAZIAS + INPUT MANUAL)

/**
 * Unifica categorias com número (ex: "Infantil 1" -> "Infantil").
 * Se a categoria não tem número, retorna ela mesma.
 */
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
    
    // Ouvinte para remover um atleta específico
    container.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remover-atleta')) {
            const atletaIdParaRemover = parseInt(event.target.dataset.id, 10);
            if (atletaIdParaRemover === 0) {
                alert("Não é possível remover o registro 'None'.");
                return;
            }
            if (confirm('Tem certeza que deseja remover este atleta?')) { 
                removerAtleta(atletaIdParaRemover); 
                carregarPagina(); 
            }
        }
    });

    // --- OUVINTE PARA MUDANÇA DE NÚMERO (EDITAR PROVA) ---
    container.addEventListener('change', (event) => {
        if (event.target.classList.contains('input-numero-prova')) {
            const novoNumero = parseInt(event.target.value, 10);
            const provaId = parseInt(event.target.dataset.provaId, 10);
            const sexoEditado = event.target.dataset.sexo;
            // Pega a categoria específica que está sendo editada
            const categoriaEditada = event.target.dataset.categoriaUnica; 

            if (isNaN(novoNumero) || novoNumero < 1) {
                alert("Por favor, insira um número válido.");
                carregarPagina(); // Reseta
                return;
            }

            // ATUALIZAÇÃO VISUAL IMEDIATA DO SPAN ESPELHO
            // Isso garante que se imprimir sem recarregar, o número esteja certo
            const spanEspelho = event.target.nextElementSibling;
            if (spanEspelho && spanEspelho.classList.contains('numero-print')) {
                spanEspelho.textContent = novoNumero;
            }

            // Salva no banco de dados
            atualizarNumeroDaProva(provaId, novoNumero, sexoEditado, categoriaEditada);
        }
    });

    /**
     * Atualiza o número base da prova no localStorage DE FORMA ESPECÍFICA POR CATEGORIA
     */
    function atualizarNumeroDaProva(provaId, novoNumero, sexoEditado, categoriaEditada) {
        let provas = getProvas();
        
        // Encontra a prova base no array
        const index = provas.findIndex(p => p.id === provaId);

        if (index !== -1) {
            let provaBase = provas[index];
            
            // Calcula o novo número base (sempre o Ímpar/Feminino)
            let novoNumeroBase;
            if (sexoEditado === 'Feminino') {
                novoNumeroBase = novoNumero;
            } else {
                // Se editou o Masculino (ex: digitou 6), a base (Feminino) vira 5
                novoNumeroBase = novoNumero - 1;
            }
            if (novoNumeroBase < 1) novoNumeroBase = 1;

            // Cria o objeto de números específicos se não existir
            if (!provaBase.numerosEspecificos) {
                provaBase.numerosEspecificos = {};
            }

            // Salva o número especificamente para essa categoria unificada (ex: "Mirim")
            provaBase.numerosEspecificos[categoriaEditada] = novoNumeroBase;
            
            // Salva de volta no array e no localStorage
            provas[index] = provaBase;
            localStorage.setItem('provas', JSON.stringify(provas));
            
            // Recarrega a tela para reordenar tudo
            carregarPagina(); 
        }
    }

    /**
     * Processa os dados para gerar a lista de provas ordenadas
     */
    function processarDados(atletas) {
        const ordemRaias = [4, 5, 3, 6, 2, 7, 1];
        const NUMERO_DE_RAIAS = 7;
        // REMOVIDO "Mini Mirim" DA LISTA ABAIXO
        const ordemDasCategorias = ["Pré-Mirim", "Mirim 1", "Mirim 2", "Petiz 1", "Petiz 2", "Infantil 1", "Infantil 2", "Juvenil", "Júnior", "Sênior"];
        const todasProvasDefinidas = getProvas();

        let eventosBaseParaProcessar = [];
        
        // Separa cada categoria de cada prova em um evento base individual
        todasProvasDefinidas.forEach(provaDefinida => {
            const categoriasUnificadas = [...new Set(provaDefinida.categorias.map(cat => unificarCategoria(cat)))];
            
            categoriasUnificadas.forEach(categoriaUnificada => {
                // Lógica de Prioridade do Número:
                // 1. Tenta pegar o número específico salvo para essa categoria.
                // 2. Se não existir, tenta o número geral da prova.
                // 3. Se não tiver, usa 0 (será preenchido sequencialmente depois).
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

        // Ordena: Primeiro pelo número definido, depois pela ordem padrão de categorias
        eventosBaseParaProcessar.sort((a, b) => {
            const numA = a.numeroBase || 99999; // Joga quem não tem número pro final
            const numB = b.numeroBase || 99999;
            
            if (numA !== numB) return numA - numB;

            // Desempate pela categoria (ex: Mirim vem antes de Petiz)
            const indexA = ordemDasCategorias.map(c => unificarCategoria(c)).indexOf(a.categoria);
            const indexB = ordemDasCategorias.map(c => unificarCategoria(c)).indexOf(b.categoria);
            return indexA - indexB;
        });

        let listaDeProvasFinais = [];
        // Contador para preencher as provas que não têm número manual
        let contadorSequencial = 1;

        // Se já existem provas com números manuais, o contador deve começar depois da maior delas para evitar conflito visual
        const maxNumManual = Math.max(...eventosBaseParaProcessar.map(e => e.numeroBase || 0));
        if (maxNumManual > 0) contadorSequencial = maxNumManual + 2;

        eventosBaseParaProcessar.forEach((eventoBase) => {
            let baseCalc;
            
            if (eventoBase.numeroBase > 0) {
                baseCalc = eventoBase.numeroBase;
            } else {
                // Se não tem número manual, usa o sequencial
                baseCalc = contadorSequencial;
                contadorSequencial += 2; // Pula 2 (Ímpar e Par)
            }

            const numFem = baseCalc;
            const numMasc = baseCalc + 1;

            // --- Feminino (Ímpar) ---
            const atletasFemininos = atletas.filter(a =>
                a.prova === eventoBase.nome &&
                unificarCategoria(a.categoria) === eventoBase.categoria &&
                a.sexo === 'Feminino'
            );
            
            // SÓ ADICIONA SE TIVER ATLETA (Remove placeholders vazios)
            if (atletasFemininos.length > 0) {
                let seriesFemininas = criarSeries(atletasFemininos, ordemRaias, NUMERO_DE_RAIAS);
                listaDeProvasFinais.push({ 
                    ...eventoBase, 
                    sexo: 'Feminino', 
                    numeroProva: numFem, 
                    séries: seriesFemininas, 
                    isPlaceholder: false,
                    categoriaUnificadaReal: eventoBase.categoria // Guarda para usar no input
                });
            }

            // --- Masculino (Par) ---
            const atletasMasculinos = atletas.filter(a =>
                a.prova === eventoBase.nome &&
                unificarCategoria(a.categoria) === eventoBase.categoria &&
                a.sexo === 'Masculino'
            );

            // SÓ ADICIONA SE TIVER ATLETA (Remove placeholders vazios)
            if (atletasMasculinos.length > 0) {
                let seriesMasculinas = criarSeries(atletasMasculinos, ordemRaias, NUMERO_DE_RAIAS);
                listaDeProvasFinais.push({ 
                    ...eventoBase, 
                    sexo: 'Masculino', 
                    numeroProva: numMasc, 
                    séries: seriesMasculinas, 
                    isPlaceholder: false,
                    categoriaUnificadaReal: eventoBase.categoria // Guarda para usar no input
                });
            }
        });

        // Ordenação final garantida pelo número da prova
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

    /**
     * Renderiza o HTML na tela
     */
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
            
            // --- CONSTRUÇÃO DO HTML COM INPUT (Tela) E SPAN (Impressão) ---
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
                        <td class="coluna-acao"><button class="btn-remover-atleta" data-id="${atleta.id}">Remover</button></td>
                    `;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                serieContainer.appendChild(table);
                provaDiv.appendChild(serieContainer);
            });
            container.appendChild(provaDiv);
            
            // Ativa o Drag and Drop (SortableJS) se houver mais de uma série
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