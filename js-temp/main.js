// js/main.js (VERSÃO COM ID ÚNICO)
document.addEventListener('DOMContentLoaded', () => {
    const anoNascimentoInput = document.getElementById('ano-nascimento');
    const categoriaDisplay = document.getElementById('categoria-display');
    const provaSelect = document.getElementById('prova-select');
    const formAtleta = document.getElementById('form-atleta');

    let categoriaAtual = '';

    function atualizarCategoriaEProvas() {
        const ano = anoNascimentoInput.value;
        if (ano) {
            categoriaAtual = getCategoriaPorAno(ano);
            categoriaDisplay.textContent = categoriaAtual;
            carregarProvasDisponiveis();
        } else {
            categoriaDisplay.textContent = "Preencha o ano de nascimento";
            provaSelect.innerHTML = '<option value="">Selecione uma prova</option>';
        }
    }

    function carregarProvasDisponiveis() {
        const todasProvas = getProvas();
        provaSelect.innerHTML = '<option value="">Selecione uma prova</option>';
        const provasFiltradas = todasProvas.filter(prova => 
            prova.categorias.includes(categoriaAtual)
        );
        provasFiltradas.forEach(prova => {
            const option = document.createElement('option');
            option.value = prova.nome;
            option.textContent = prova.nome;
            provaSelect.appendChild(option);
        });
    }
    
    anoNascimentoInput.addEventListener('input', atualizarCategoriaEProvas);

    formAtleta.addEventListener('submit', (e) => {
        e.preventDefault();
        const sexoSelecionado = document.querySelector('input[name="sexo"]:checked');
        if (!sexoSelecionado) {
            alert('Por favor, selecione o sexo do atleta.');
            return;
        }

        const novoAtleta = {
            id: Date.now(), // <-- NOVO: Adiciona um ID único baseado na data/hora atual
            nome: document.getElementById('nome-atleta').value,
            clube: document.getElementById('clube-atleta').value,
            sexo: sexoSelecionado.value,
            anoNascimento: document.getElementById('ano-nascimento').value,
            categoria: categoriaAtual,
            prova: document.getElementById('prova-select').value,
            tempo: document.getElementById('melhor-tempo').value,
        };
        
        if (!novoAtleta.prova) {
            alert('Por favor, selecione uma prova válida para a categoria do atleta.');
            return;
        }
        const sucesso = salvarAtleta(novoAtleta);
        if (sucesso) {
            alert('Atleta cadastrado com sucesso!');
            formAtleta.reset();
            categoriaDisplay.textContent = 'Preencha o ano de nascimento';
            provaSelect.innerHTML = '<option value="">Selecione uma prova</option>';
        }
    });

    atualizarCategoriaEProvas();
});