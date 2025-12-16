// /js/database.js (VERSÃO FINAL LIMPA)

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
// ## FUNÇÕES NOVAS PARA GERENCIAR PROVAS ADICIONADAS ABAIXO ##

/**
 * Remove uma prova específica do localStorage pelo seu ID.
 * @param {number} provaId O ID da prova a ser removida.
 */
function removerProva(provaId) {
    let provas = getProvas();
    // Filtra a lista, mantendo apenas as provas cujo ID NÃO é o que queremos remover.
    const provasAtualizadas = provas.filter(prova => Number(prova.id) !== Number(provaId));
    // Salva a nova lista (sem a prova removida) de volta no localStorage.
    localStorage.setItem('provas', JSON.stringify(provasAtualizadas));
}

/**
 * Remove TODAS as provas do localStorage.
 */
function removerTodasProvas() {
    // Simplesmente remove a chave 'provas' do localStorage.
    localStorage.removeItem('provas');
}
// ## FUNÇÕES NOVAS PARA ORDENAÇÃO DE PROVAS ##

/**
 * Salva a ordem personalizada das provas no localStorage.
 * @param {Array<string>} ordemIds Um array com os IDs das provas na ordem desejada.
 */
function salvarOrdemDasProvas(ordemIds) {
    localStorage.setItem('provas_ordem', JSON.stringify(ordemIds));
}

/**
 * Retorna a ordem personalizada das provas.
 * @returns {Array<string>} Um array com os IDs das provas na ordem salva.
 */
function getOrdemDasProvas() {
    return JSON.parse(localStorage.getItem('provas_ordem')) || [];
}
/**
 * Retorna todos os resultados salvos.
 * @returns {Array<Object>} Um array com os objetos de resultado.
 */
function getResultados() {
    return JSON.parse(localStorage.getItem('resultados')) || [];
}

/**
 * Salva os resultados de uma prova específica.
 * Ele mescla os novos resultados com os já existentes.
 * @param {Array<Object>} novosResultados - Array com os novos resultados a serem salvos.
 * @param {string} chaveProva - O identificador da prova (ex: "50m Livre|Infantil|Feminino").
 */
function salvarResultados(todosOsResultados) {
    // Simplesmente salva a nova lista completa no localStorage, sobrescrevendo a anterior.
    localStorage.setItem('resultados', JSON.stringify(todosOsResultados));
}