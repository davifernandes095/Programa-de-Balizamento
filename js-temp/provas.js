// js/provas.js (VERSÃO FINAL COMPLETA COM ORDENAÇÃO)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-prova');
    const checkboxesContainer = document.getElementById('categorias-checkboxes');
    const listaProvasContainer = document.getElementById('lista-provas-container');
    const removerTodasProvasBtn = document.getElementById('remover-todas-provas-btn');
    const salvarOrdemBtn = document.getElementById('salvar-ordem-btn'); // Pega o novo botão

    const todasCategorias = ["Pré-Mirim", "Mirim 1", "Mirim 2", "Petiz 1", "Petiz 2", "Infantil 1", "Infantil 2", "Juvenil 1","Juvenil 2","Júnior","Sênior"];

    // Função para desenhar/redesenhar a lista de provas
    function renderizarListaProvas() {
        const provas = getProvas();
        const ordemSalva = getOrdemDasProvas(); // Pega a ordem personalizada
        listaProvasContainer.innerHTML = ''; // Limpa a lista antiga

        // Ordena as provas com base na ordem salva antes de exibir
        provas.sort((a, b) => {
            // Converte os IDs para string para garantir a comparação correta com o array de ordem
            const idA = String(a.id);
            const idB = String(b.id);
            const indexA = ordemSalva.indexOf(idA);
            const indexB = ordemSalva.indexOf(idB);

            // Se ambos os IDs estão na lista de ordem, ordena por sua posição
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // Se apenas A está na lista, ele vem primeiro
            if (indexA !== -1) {
                return -1;
            }
            // Se apenas B está na lista, ele vem primeiro
            if (indexB !== -1) {
                return 1;
            }
            // Se nenhum está na lista (provas novas), mantém a ordem original
            return 0;
        });

        if (provas.length === 0) {
            listaProvasContainer.innerHTML = '<p>Nenhuma prova cadastrada.</p>';
            removerTodasProvasBtn.style.display = 'none'; // Esconde os botões de ação
            salvarOrdemBtn.style.display = 'none';
            return;
        }
        
        removerTodasProvasBtn.style.display = 'inline-block'; // Mostra os botões de ação
        salvarOrdemBtn.style.display = 'inline-block';

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome da Prova</th>
                    <th>Categorias Permitidas</th>
                    <th>Ação</th>
                </tr>
            </thead>
        `;
        const tbody = document.createElement('tbody');
        tbody.id = 'lista-provas-tbody'; // ID para o SortableJS encontrar o elemento
        provas.forEach(prova => {
            const tr = document.createElement('tr');
            tr.className = 'prova-item'; // Classe para estilização e para o SortableJS
            tr.dataset.id = prova.id;    // Armazena o ID na própria linha da tabela
            tr.innerHTML = `
                <td>${prova.nome}</td>
                <td>${prova.categorias.join(', ')}</td>
                <td><button class="btn-remover-prova" data-id="${prova.id}">Remover</button></td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        listaProvasContainer.appendChild(table);

        // INICIA A BIBLIOTECA SORTABLEJS PARA TORNAR AS LINHAS ARRASTÁVEIS
        new Sortable(tbody, {
            animation: 150, // Animação suave ao arrastar
            ghostClass: 'sortable-ghost' // Classe CSS para o "fantasma" do item sendo arrastado
        });
    }

    // Cria os checkboxes para cada categoria no formulário
    todasCategorias.forEach(cat => {
        const div = document.createElement('div');
        div.innerHTML = `<input type="checkbox" id="${cat}" name="categoria" value="${cat}"><label for="${cat}">${cat}</label>`;
        checkboxesContainer.appendChild(div);
    });

    // Evento para salvar uma nova prova
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nomeProva = document.getElementById('nome-prova').value;
        const categoriasPermitidas = [];
        document.querySelectorAll('input[name="categoria"]:checked').forEach(checkbox => {
            categoriasPermitidas.push(checkbox.value);
        });

        if (!nomeProva) {
            alert('Por favor, preencha o nome da prova.');
            return;
        }
        if (categoriasPermitidas.length === 0) {
            alert('Selecione ao menos uma categoria para a prova.');
            return;
        }

        const novaProva = {
            id: Date.now(), // ID único para a prova
            nome: nomeProva,
            categorias: categoriasPermitidas
        };

        salvarProva(novaProva);
        
        alert('Prova salva com sucesso!');
        form.reset();
        renderizarListaProvas(); // Atualiza a lista na tela
    });

    // Evento para o botão "Salvar Ordem"
    salvarOrdemBtn.addEventListener('click', () => {
        const tbody = document.getElementById('lista-provas-tbody');
        if (!tbody) {
            alert('Não há provas para ordenar.');
            return;
        }
        
        // Pega todos os IDs das linhas da tabela na nova ordem visual
        const novaOrdemIds = Array.from(tbody.querySelectorAll('tr')).map(tr => tr.dataset.id);
        
        salvarOrdemDasProvas(novaOrdemIds); // Salva a nova ordem no localStorage
        alert('Ordem das provas salva com sucesso!');
        renderizarListaProvas(); // Re-renderiza para confirmar a ordem
    });

    // Evento para o botão "Remover Todas as Provas"
    removerTodasProvasBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover TODAS as provas? Os atletas inscritos nelas não poderão mais ser selecionados.')) {
            removerTodasProvas();
            renderizarListaProvas(); // Atualiza a lista na tela
        }
    });

    // Evento para os botões individuais de remover prova
    listaProvasContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remover-prova')) {
            const provaId = parseInt(event.target.dataset.id, 10);
            if (confirm('Tem certeza que deseja remover esta prova?')) {
                removerProva(provaId);
                renderizarListaProvas(); // Atualiza a lista na tela
            }
        }
    });

    // Carrega a lista de provas pela primeira vez quando a página abre
    renderizarListaProvas();
});