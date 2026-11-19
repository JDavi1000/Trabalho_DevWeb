// ==========================================
// ORGANIZAÊ - GERENCIADOR DE TAREFAS
// ==========================================

// Elementos HTML
const formulario = document.getElementById("form-tarefa");
const campo_titulo = document.getElementById("titulo");
const campo_descricao = document.getElementById("descricao");
const campo_data = document.getElementById("data");

const lista_tarefas = document.getElementById("lista_tarefas");
const mensagem_feedback = document.getElementById("mensagem_feedback");

const contador_total = document.getElementById("tarefas_totais");
const contador_pendentes = document.getElementById("tarefas_pendentes");
const contador_progresso = document.getElementById("tarefas_progresso");
const contador_concluidas = document.getElementById("tarefas_concluidas");

const botoes_filtro = document.querySelectorAll("#filtros_tarefas button");
const botao_modo_escuro = document.getElementById("botao_modo_escuro");

// Variáveis principais
let tarefas = [];
let filtro_atual = "todas";

const chave_tarefas = "organizae_tarefas";
const chave_tema = "organizae_tema";

// ==========================================
// FEEDBACK AO USUÁRIO
// ==========================================

function mostrar_mensagem(texto, tipo = "sucesso") {
    mensagem_feedback.textContent = texto;
    mensagem_feedback.className = tipo;
}

// ==========================================
// FORMATAÇÃO DE DADOS
// ==========================================

function obter_nome_status(status) {
    const nomes = {
        pendente: "Pendente",
        progresso: "Em progresso",
        concluida: "Concluída"
    };

    return nomes[status] || status;
}

function formatar_data(data) {
    if (!data) return "Sem data definida";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ==========================================
// PAINEL DE CONTADORES
// ==========================================

function atualizar_painel() {
    contador_total.textContent = tarefas.length;

    contador_pendentes.textContent = tarefas.filter(
        tarefa => tarefa.status === "pendente"
    ).length;

    contador_progresso.textContent = tarefas.filter(
        tarefa => tarefa.status === "progresso"
    ).length;

    contador_concluidas.textContent = tarefas.filter(
        tarefa => tarefa.status === "concluida"
    ).length;
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function salvar_tarefas() {
    localStorage.setItem(chave_tarefas, JSON.stringify(tarefas));
}

function carregar_tarefas() {
    const dados_salvos = localStorage.getItem(chave_tarefas);

    if (dados_salvos) {
        try {
            const dados = JSON.parse(dados_salvos);
            tarefas = Array.isArray(dados) ? dados : [];
        } catch (erro) {
            tarefas = [];
            console.error("Erro ao carregar tarefas:", erro);
        }
    }
}

// ==========================================
// CADASTRAR TAREFAS
// ==========================================

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const titulo = campo_titulo.value.trim();
    const descricao = campo_descricao.value.trim();
    const data = campo_data.value;

    if (!titulo) {
        mostrar_mensagem("Digite um título para a tarefa.", "erro");
        campo_titulo.focus();
        return;
    }

    const nova_tarefa = {
        id: Date.now(),
        titulo: titulo,
        descricao: descricao,
        data: data,
        status: "pendente"
    };

    tarefas.push(nova_tarefa);

    salvar_tarefas();
    renderizar_tarefas();
    atualizar_painel();

    formulario.reset();

    mostrar_mensagem("Tarefa cadastrada com sucesso!");
});

// ==========================================
// RENDERIZAR E LISTAR TAREFAS
// ==========================================

function renderizar_tarefas() {
    lista_tarefas.innerHTML = "";

    const tarefas_filtradas = tarefas.filter(tarefa => {
        return filtro_atual === "todas" ||
               tarefa.status === filtro_atual;
    });

    if (tarefas_filtradas.length === 0) {
        const mensagem_vazia = document.createElement("li");
        mensagem_vazia.textContent = "Nenhuma tarefa encontrada.";
        mensagem_vazia.classList.add("lista-vazia");

        lista_tarefas.appendChild(mensagem_vazia);
        return;
    }

    tarefas_filtradas.forEach(tarefa => {
        const item = document.createElement("li");
        item.classList.add("tarefa");

        const titulo = document.createElement("h3");
        titulo.textContent = tarefa.titulo;

        const descricao = document.createElement("p");
        descricao.textContent = tarefa.descricao || "Sem descrição";

        const data = document.createElement("p");
        data.textContent = "Data: " + formatar_data(tarefa.data);

        const status = document.createElement("select");

        const opcoes = [
            { valor: "pendente", texto: "Pendente" },
            { valor: "progresso", texto: "Em progresso" },
            { valor: "concluida", texto: "Concluída" }
        ];

        opcoes.forEach(opcao => {
            const elemento = document.createElement("option");
            elemento.value = opcao.valor;
            elemento.textContent = opcao.texto;

            status.appendChild(elemento);
        });

        status.value = tarefa.status;

        status.addEventListener("change", function() {
            const status_anterior = tarefa.status;

            tarefa.status = status.value;

            salvar_tarefas();
            renderizar_tarefas();
            atualizar_painel();

            if (tarefa.status === "concluida") {
                mostrar_mensagem("Tarefa concluída com sucesso!");
            } else if (status_anterior === "concluida") {
                mostrar_mensagem("Status da tarefa atualizado!");
            } else {
                mostrar_mensagem("Status da tarefa atualizado!");
            }
        });

        const botao_editar = document.createElement("button");
        botao_editar.textContent = "Editar";

        botao_editar.addEventListener("click", function() {
            editar_tarefa(tarefa.id);
        });

        const botao_excluir = document.createElement("button");
        botao_excluir.textContent = "Excluir";

        botao_excluir.addEventListener("click", function() {
            excluir_tarefa(tarefa.id);
        });

        item.appendChild(titulo);
        item.appendChild(descricao);
        item.appendChild(data);
        item.appendChild(status);
        item.appendChild(botao_editar);
        item.appendChild(botao_excluir);

        lista_tarefas.appendChild(item);
    });
}

// ==========================================
// EDITAR TAREFAS
// ==========================================

function editar_tarefa(id) {
    const tarefa = tarefas.find(item => item.id === id);

    if (!tarefa) return;

    const novo_titulo = prompt("Digite o novo título:", tarefa.titulo);

    if (novo_titulo === null) return;

    if (!novo_titulo.trim()) {
        mostrar_mensagem("O título não pode ficar vazio.", "erro");
        return;
    }

    const nova_descricao = prompt(
        "Digite a nova descrição:",
        tarefa.descricao
    );

    if (nova_descricao === null) return;

    const nova_data = prompt(
        "Digite a nova data (AAAA-MM-DD):",
        tarefa.data
    );

    if (nova_data === null) return;

    tarefa.titulo = novo_titulo.trim();
    tarefa.descricao = nova_descricao.trim();
    tarefa.data = nova_data;

    salvar_tarefas();
    renderizar_tarefas();
    atualizar_painel();

    mostrar_mensagem("Tarefa editada com sucesso!");
}

// ==========================================
// EXCLUIR TAREFAS
// ==========================================

function excluir_tarefa(id) {
    const confirmacao = confirm(
        "Tem certeza de que deseja excluir esta tarefa?"
    );

    if (!confirmacao) return;

    tarefas = tarefas.filter(tarefa => tarefa.id !== id);

    salvar_tarefas();
    renderizar_tarefas();
    atualizar_painel();

    mostrar_mensagem("Tarefa excluída com sucesso!");
}

// ==========================================
// FILTROS
// ==========================================

botoes_filtro.forEach(botao => {
    botao.addEventListener("click", function() {
        const texto = botao.textContent.trim().toLowerCase();

        if (texto === "todas") {
            filtro_atual = "todas";
        } else if (texto === "pendentes") {
            filtro_atual = "pendente";
        } else if (texto === "em progresso") {
            filtro_atual = "progresso";
        } else if (texto === "concluídas" || texto === "concluidas") {
            filtro_atual = "concluida";
        }

        renderizar_tarefas();
    });
});

// ==========================================
// MODO ESCURO
// ==========================================

function carregar_tema() {
    const tema_salvo = localStorage.getItem(chave_tema);

    if (tema_salvo === "escuro") {
        document.body.classList.add("modo_escuro");
    }
}

if (botao_modo_escuro) {
    botao_modo_escuro.addEventListener("click", function() {
        document.body.classList.toggle("modo_escuro");

        const tema_atual = document.body.classList.contains("modo_escuro")
            ? "escuro"
            : "claro";

        localStorage.setItem(chave_tema, tema_atual);
    });
}

// ==========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================

carregar_tarefas();
carregar_tema();
renderizar_tarefas();
atualizar_painel();