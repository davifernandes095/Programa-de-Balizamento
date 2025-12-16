// /js/database.js (VERSÃO COM FUNÇÃO DE EDITAR)

function getCategoriaPorAno(anoNascimento) {
    const ano = parseInt(anoNascimento, 10);
    if (ano === 2017 || ano === 2018) return "Pré-Mirim";
    if (ano === 2016) return "Mirim 1";
    if (ano === 2015) return "Mirim 2";
    if (ano === 2014) return "Petiz 1";
    if (ano === 2013) return "Petiz 2";
    if (ano === 2012) return "Infantil 1";
    if (ano === 2011) return "Infantil 2";
    if (ano === 2010) return "Juvenil 1";
    if (ano === 2009) return "Juvenil 2";
    if (ano === 2008 || ano === 2007 || ano === 2006) return "Júnior";
    if (ano <= 2005) return "Sênior";
    return "Categoria não encontrada";
}

function getProvas() {
    return JSON.parse(localStorage.getItem('provas')) || [];
}

function salvarProva(novaProva) {
    const provas = getProvas();
    provas.push(novaProva);
    localStorage.setItem('provas', JSON.stringify(provas));
}

function getAtletas() {
    return JSON.parse(localStorage.getItem('atletas')) || [];
}

function salvarAtleta(novoAtleta) {
    const atletas = getAtletas();
    const atletaJaInscrito = atletas.some(
        atleta => atleta.nome.toLowerCase() === novoAtleta.nome.toLowerCase() &&
                  atleta.prova === novoAtleta.prova
    );
    if (atletaJaInscrito) {
        alert("Erro: Este atleta já está inscrito nesta prova!");
        return false;
    }
    atletas.push(novoAtleta);
    localStorage.setItem('atletas', JSON.stringify(atletas));
    return true;
}

function removerAtleta(atletaId) {
    let atletas = getAtletas();
    const atletasAtualizados = atletas.filter(atleta => Number(atleta.id) !== Number(atletaId));
    localStorage.setItem('atletas', JSON.stringify(atletasAtualizados));
}

function removerTodosAtletas() {
    localStorage.removeItem('atletas');
}

// --- FUNÇÕES DE GERENCIAMENTO DE PROVAS ---

function removerProva(provaId) {
    let provas = getProvas();
    const provasAtualizadas = provas.filter(prova => Number(prova.id) !== Number(provaId));
    localStorage.setItem('provas', JSON.stringify(provasAtualizadas));
}

function removerTodasProvas() {
    localStorage.removeItem('provas');
}

function salvarOrdemDasProvas(ordemIds) {
    localStorage.setItem('provas_ordem', JSON.stringify(ordemIds));
}

function getOrdemDasProvas() {
    return JSON.parse(localStorage.getItem('provas_ordem')) || [];
}

function getResultados() {
    return JSON.parse(localStorage.getItem('resultados')) || [];
}

function salvarResultados(todosOsResultados) {
    localStorage.setItem('resultados', JSON.stringify(todosOsResultados));
}

// --- NOVA FUNÇÃO PARA EDITAR ATLETA ---
function atualizarAtleta(atletaId, novosDados) {
    let atletas = getAtletas();
    const index = atletas.findIndex(a => Number(a.id) === Number(atletaId));
    
    if (index !== -1) {
        // Atualiza apenas os campos permitidos, mantendo o resto (como ID e Sexo)
        atletas[index].nome = novosDados.nome;
        atletas[index].clube = novosDados.clube;
        atletas[index].tempo = novosDados.tempo;
        
        localStorage.setItem('atletas', JSON.stringify(atletas));
        return true;
    }
    return false;
}