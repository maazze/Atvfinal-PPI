import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3007;

const app = express();

let listaLivros = [];
let listaLeitores = [];

app.use(session({
    secret: 'B1bl10t3c4S3cr3t4',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30
    }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.get('/', (requisicao, resposta) => {
    if (requisicao.session?.logado) {
        resposta.redirect('/inicio');
    } else {
        resposta.redirect('/login');
    }
});

app.get('/inicio', estaAutenticado, (requisicao, resposta) => {
    const ultimoAcesso = requisicao.cookies?.ultimoAcesso || 'Nunca acessou';

    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Menu do Sistema</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/inicio">Biblioteca</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/livro">Cadastro de Livros</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/listaLivros">Listar Livros</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/leitor">Cadastro de Leitores</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/listaLeitores">Listar Leitores</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-danger" href="/logout">Logout</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <div class="container mt-5">
                    <div class="p-4 border rounded bg-light">
                        <h1 class="mb-3">Sistema de Gerenciamento de Biblioteca</h1>
                        <p class="mb-1">Bem-vindo ao sistema.</p>
                        <p class="mb-3"><strong>Último acesso:</strong> ${ultimoAcesso}</p>

                        <div class="d-flex gap-2 flex-wrap">
                            <a href="/livro" class="btn btn-primary">Cadastrar Livro</a>
                            <a href="/leitor" class="btn btn-success">Cadastrar Leitor</a>
                            <a href="/listaLivros" class="btn btn-secondary">Ver Livros</a>
                            <a href="/listaLeitores" class="btn btn-dark">Ver Leitores</a>
                        </div>
                    </div>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);

    resposta.end();
});

app.get('/livro', estaAutenticado, (requisicao, resposta) => {
    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Livro</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/livro" class="border p-4 rounded bg-light">
                        <legend><h3>Cadastro de Livro</h3></legend>

                        <div class="mb-3">
                            <label class="form-label" for="titulo">Título do livro</label>
                            <input type="text" class="form-control" id="titulo" name="titulo">
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="autor">Nome do autor</label>
                            <input type="text" class="form-control" id="autor" name="autor">
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="isbn">Código ISBN ou identificação</label>
                            <input type="text" class="form-control" id="isbn" name="isbn">
                        </div>

                        <button type="submit" class="btn btn-primary">Cadastrar Livro</button>
                        <a href="/inicio" class="btn btn-secondary">Voltar ao menu</a>
                    </form>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);

    resposta.end();
});

app.post('/livro', estaAutenticado, (requisicao, resposta) => {
    const titulo = requisicao.body.titulo;
    const autor = requisicao.body.autor;
    const isbn = requisicao.body.isbn;

    if (!titulo || !autor || !isbn) {
        let html = `
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Livro</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/livro" class="border p-4 rounded bg-light">
                        <legend><h3>Cadastro de Livro</h3></legend>

                        <div class="mb-3">
                            <label class="form-label" for="titulo">Título do livro</label>
                            <input type="text" class="form-control" id="titulo" name="titulo" value="${titulo || ''}">`;
        if (!titulo) {
            html += `<div class="text-danger">Informe o título do livro.</div>`;
        }
        html += `
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="autor">Nome do autor</label>
                            <input type="text" class="form-control" id="autor" name="autor" value="${autor || ''}">`;
        if (!autor) {
            html += `<div class="text-danger">Informe o nome do autor.</div>`;
        }
        html += `
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="isbn">Código ISBN ou identificação</label>
                            <input type="text" class="form-control" id="isbn" name="isbn" value="${isbn || ''}">`;
        if (!isbn) {
            html += `<div class="text-danger">Informe o ISBN ou identificação do livro.</div>`;
        }
        html += `
                        </div>

                        <button type="submit" class="btn btn-primary">Cadastrar Livro</button>
                        <a href="/inicio" class="btn btn-secondary">Voltar ao menu</a>
                    </form>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
        `;

        resposta.write(html);
        resposta.end();
    } else {
        listaLivros.push({
            titulo: titulo,
            autor: autor,
            isbn: isbn
        });

        resposta.redirect('/listaLivros');
    }
});

app.get('/listaLivros', estaAutenticado, (requisicao, resposta) => {
    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lista de Livros</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h2 class="mb-4">Livros cadastrados</h2>

                    <table class="table table-striped table-hover table-bordered">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Autor</th>
                                <th>ISBN</th>
                            </tr>
                        </thead>
                        <tbody>
    `);

    if (listaLivros.length === 0) {
        resposta.write(`
            <tr>
                <td colspan="4" class="text-center">Nenhum livro cadastrado.</td>
            </tr>
        `);
    } else {
        for (let i = 0; i < listaLivros.length; i++) {
            const livro = listaLivros[i];
            resposta.write(`
                <tr>
                    <td>${i + 1}</td>
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.isbn}</td>
                </tr>
            `);
        }
    }

    resposta.write(`
                        </tbody>
                    </table>

                    <a href="/livro" class="btn btn-primary">Continuar cadastrando</a>
                    <a href="/inicio" class="btn btn-secondary">Voltar ao menu</a>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);

    resposta.end();
});

app.get('/leitor', estaAutenticado, (requisicao, resposta) => {
    let optionsLivros = `<option value="">Selecione um livro</option>`;

    for (let i = 0; i < listaLivros.length; i++) {
        optionsLivros += `<option value="${listaLivros[i].titulo}">${listaLivros[i].titulo}</option>`;
    }

    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Leitor</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/leitor" class="border p-4 rounded bg-light">
                        <legend><h3>Cadastro de Leitor</h3></legend>

                        <div class="mb-3">
                            <label class="form-label" for="nomeLeitor">Nome do leitor</label>
                            <input type="text" class="form-control" id="nomeLeitor" name="nomeLeitor">
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="cpf">CPF ou identificação</label>
                            <input type="text" class="form-control" id="cpf" name="cpf">
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="telefone">Telefone para contato</label>
                            <input type="text" class="form-control" id="telefone" name="telefone">
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="dataEmprestimo">Data de empréstimo</label>
                            <input type="date" class="form-control" id="dataEmprestimo" name="dataEmprestimo">
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="dataDevolucao">Data de devolução</label>
                            <input type="date" class="form-control" id="dataDevolucao" name="dataDevolucao">
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="livroSelecionado">Livro</label>
                            <select class="form-select" id="livroSelecionado" name="livroSelecionado">
                                ${optionsLivros}
                            </select>
                        </div>

                        <button type="submit" class="btn btn-success">Cadastrar Leitor</button>
                        <a href="/inicio" class="btn btn-secondary">Voltar ao menu</a>
                    </form>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);

    resposta.end();
});

app.post('/leitor', estaAutenticado, (requisicao, resposta) => {
    const nomeLeitor = requisicao.body.nomeLeitor;
    const cpf = requisicao.body.cpf;
    const telefone = requisicao.body.telefone;
    const dataEmprestimo = requisicao.body.dataEmprestimo;
    const dataDevolucao = requisicao.body.dataDevolucao;
    const livroSelecionado = requisicao.body.livroSelecionado;

    if (!nomeLeitor || !cpf || !telefone || !dataEmprestimo || !dataDevolucao || !livroSelecionado) {
        let optionsLivros = `<option value="">Selecione um livro</option>`;

        for (let i = 0; i < listaLivros.length; i++) {
            if (listaLivros[i].titulo === livroSelecionado) {
                optionsLivros += `<option value="${listaLivros[i].titulo}" selected>${listaLivros[i].titulo}</option>`;
            } else {
                optionsLivros += `<option value="${listaLivros[i].titulo}">${listaLivros[i].titulo}</option>`;
            }
        }

        let html = `
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Leitor</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/leitor" class="border p-4 rounded bg-light">
                        <legend><h3>Cadastro de Leitor</h3></legend>

                        <div class="mb-3">
                            <label class="form-label" for="nomeLeitor">Nome do leitor</label>
                            <input type="text" class="form-control" id="nomeLeitor" name="nomeLeitor" value="${nomeLeitor || ''}">`;
        if (!nomeLeitor) {
            html += `<div class="text-danger">Informe o nome do leitor.</div>`;
        }
        html += `
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="cpf">CPF ou identificação</label>
                            <input type="text" class="form-control" id="cpf" name="cpf" value="${cpf || ''}">`;
        if (!cpf) {
            html += `<div class="text-danger">Informe o CPF ou identificação.</div>`;
        }
        html += `
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="telefone">Telefone para contato</label>
                            <input type="text" class="form-control" id="telefone" name="telefone" value="${telefone || ''}">`;
        if (!telefone) {
            html += `<div class="text-danger">Informe o telefone para contato.</div>`;
        }
        html += `
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="dataEmprestimo">Data de empréstimo</label>
                            <input type="date" class="form-control" id="dataEmprestimo" name="dataEmprestimo" value="${dataEmprestimo || ''}">`;
        if (!dataEmprestimo) {
            html += `<div class="text-danger">Informe a data de empréstimo.</div>`;
        }
        html += `
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="dataDevolucao">Data de devolução</label>
                            <input type="date" class="form-control" id="dataDevolucao" name="dataDevolucao" value="${dataDevolucao || ''}">`;
        if (!dataDevolucao) {
            html += `<div class="text-danger">Informe a data de devolução.</div>`;
        }
        html += `
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="livroSelecionado">Livro</label>
                            <select class="form-select" id="livroSelecionado" name="livroSelecionado">
                                ${optionsLivros}
                            </select>`;
        if (!livroSelecionado) {
            html += `<div class="text-danger">Selecione um livro.</div>`;
        }
        html += `
                        </div>

                        <button type="submit" class="btn btn-success">Cadastrar Leitor</button>
                        <a href="/inicio" class="btn btn-secondary">Voltar ao menu</a>
                    </form>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
        `;

        resposta.write(html);
        resposta.end();
    } else {
        listaLeitores.push({
            nomeLeitor: nomeLeitor,
            cpf: cpf,
            telefone: telefone,
            dataEmprestimo: dataEmprestimo,
            dataDevolucao: dataDevolucao,
            livroSelecionado: livroSelecionado
        });

        resposta.redirect('/listaLeitores');
    }
});

app.get('/listaLeitores', estaAutenticado, (requisicao, resposta) => {
    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lista de Leitores</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h2 class="mb-4">Leitores cadastrados</h2>

                    <table class="table table-striped table-hover table-bordered">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nome do Leitor</th>
                                <th>CPF / Identificação</th>
                                <th>Telefone</th>
                                <th>Data de Empréstimo</th>
                                <th>Data de Devolução</th>
                                <th>Livro</th>
                            </tr>
                        </thead>
                        <tbody>
    `);

    if (listaLeitores.length === 0) {
        resposta.write(`
            <tr>
                <td colspan="7" class="text-center">Nenhum leitor cadastrado.</td>
            </tr>
        `);
    } else {
        for (let i = 0; i < listaLeitores.length; i++) {
            const leitor = listaLeitores[i];
            resposta.write(`
                <tr>
                    <td>${i + 1}</td>
                    <td>${leitor.nomeLeitor}</td>
                    <td>${leitor.cpf}</td>
                    <td>${leitor.telefone}</td>
                    <td>${leitor.dataEmprestimo}</td>
                    <td>${leitor.dataDevolucao}</td>
                    <td>${leitor.livroSelecionado}</td>
                </tr>
            `);
        }
    }

    resposta.write(`
                        </tbody>
                    </table>

                    <a href="/leitor" class="btn btn-success">Continuar cadastrando</a>
                    <a href="/inicio" class="btn btn-secondary">Voltar ao menu</a>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);

    resposta.end();
});

app.get('/login', (requisicao, resposta) => {
    const ultimoAcesso = requisicao.cookies?.ultimoAcesso || 'Nunca acessou';

    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Página de Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="d-flex align-items-center py-4 bg-body-tertiary" style="min-height:100vh;">
                <main class="form-signin w-100 m-auto" style="max-width: 400px;">
                    <form action="/login" method="POST" class="border rounded p-4 bg-white shadow-sm">
                        <h1 class="h3 mb-3 fw-normal text-center">Faça o login</h1>

                        <div class="form-floating mb-3">
                            <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com">
                            <label for="email">Email</label>
                        </div>

                        <div class="form-floating mb-3">
                            <input type="password" class="form-control" id="senha" name="senha" placeholder="Senha">
                            <label for="senha">Senha</label>
                        </div>

                        <button class="btn btn-primary w-100 py-2" type="submit">Login</button>
                        <p class="mt-4 mb-0 text-body-secondary text-center">Último acesso: ${ultimoAcesso}</p>
                    </form>
                </main>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);

    resposta.end();
});

app.post('/login', (requisicao, resposta) => {
    const email = requisicao.body.email;
    const senha = requisicao.body.senha;

    if (email && senha) {
        requisicao.session.logado = true;

        const dataUltimoAcesso = new Date();
        resposta.cookie('ultimoAcesso', dataUltimoAcesso.toLocaleString(), {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        resposta.redirect('/inicio');
    } else {
        resposta.write(`
            <!DOCTYPE html>
            <html lang="pt-br">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Página de Login</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body class="d-flex align-items-center py-4 bg-body-tertiary" style="min-height:100vh;">
                    <main class="form-signin w-100 m-auto" style="max-width: 400px;">
                        <form action="/login" method="POST" class="border rounded p-4 bg-white shadow-sm">
                            <h1 class="h3 mb-3 fw-normal text-center">Faça o login</h1>

                            <div class="form-floating mb-3">
                                <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com">
                                <label for="email">Email</label>
                            </div>

                            <div class="form-floating mb-3">
                                <input type="password" class="form-control" id="senha" name="senha" placeholder="Senha">
                                <label for="senha">Senha</label>
                            </div>

                            <div class="alert alert-danger" role="alert">
                                Email ou senha inválidos.
                            </div>

                            <button class="btn btn-primary w-100 py-2" type="submit">Login</button>
                        </form>
                    </main>

                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
                </body>
            </html>
        `);

        resposta.end();
    }
});

app.get('/logout', (requisicao, resposta) => {
    requisicao.session.destroy();
    resposta.redirect('/login');
});

function estaAutenticado(requisicao, resposta, proximo) {
    if (requisicao.session?.logado) {
        proximo();
    } else {
        resposta.redirect('/login');
    }
}

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});