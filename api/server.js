const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser'); // Para trabalhar com req.body

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080;

// Configuração do diretório temporário
const tempDir = '/tmp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Caminhos dos arquivos
const dbFile = path.join(__dirname, 'db.json');
const tempDbFile = path.join(tempDir, 'db.json');

// Função para carregar o banco de dados inicial no arquivo temporário
const loadInitialDB = () => {
    if (!fs.existsSync(tempDbFile)) {
        const data = fs.readFileSync(dbFile, 'utf8');
        fs.writeFileSync(tempDbFile, data, 'utf8');
    }
};

// Funções de leitura e escrita no banco de dados
const readDB = () => JSON.parse(fs.readFileSync(tempDbFile, 'utf8'));
const writeDB = (data) => fs.writeFileSync(tempDbFile, JSON.stringify(data, null, 2), 'utf8');

// Carregar os dados iniciais no arquivo temporário
loadInitialDB();

// Middlewares globais
server.use(cors());
server.use(bodyParser.json());
server.use(middlewares);

// Rota personalizada: Login
server.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios!' });
    }

    const db = readDB();
    const usuario = db.usuarios.find((u) => u.email === email && u.senha === senha);

    if (usuario) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
});

// Rota para cadastro de usuário
server.post('/user/cadastrarUser', (req, res) => {
    const { nome, email, senha, premium, imagemPerfil } = req.body;

    if (!nome || !email || !senha || premium === undefined || !imagemPerfil) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const db = readDB();
    const newId = db.usuarios.length > 0 ? db.usuarios[db.usuarios.length - 1].id + 1 : 1;

    const novoUser = { id: newId, nome, email, senha, premium, imagemPerfil };
    db.usuarios.push(novoUser);

    writeDB(db);
    res.status(201).json(novoUser);
});

// Rota para deletar usuário
server.delete('/user/deleteuser/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    const db = readDB();
    const userIndex = db.usuarios.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    db.usuarios.splice(userIndex, 1);
    writeDB(db);
    res.status(204).send();
});

// Rota para atualizar usuário
server.put('/user/atualizarUser/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    const { nome, email, senha, premium, imagemPerfil } = req.body;

    const db = readDB();
    const userIndex = db.usuarios.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = db.usuarios[userIndex];
    if (nome) user.nome = nome;
    if (email) user.email = email;
    if (senha) user.senha = senha;
    if (premium !== undefined) user.premium = premium;
    if (imagemPerfil) user.imagemPerfil = imagemPerfil;

    writeDB(db);
    res.status(200).json(user);
});

// Rota para listar publicações
server.get('/publicacoes/listarPublicacoes', (req, res) => {
    const db = readDB();
    res.status(200).json(db.publicacoes);
});

// Rota para cadastrar publicação
server.post('/publicacoes/cadastrarPublicacao', (req, res) => {
    const { descricao, dataPublicacao, imagem, local, idUsuario } = req.body;

    if (!descricao || !dataPublicacao || !imagem || !local || !idUsuario) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const db = readDB();
    const newId = db.publicacoes.length > 0 ? db.publicacoes[db.publicacoes.length - 1].id + 1 : 1;

    const novaPublicacao = { id: newId, descricao, dataPublicacao, imagem, local, idUsuario };
    db.publicacoes.push(novaPublicacao);

    writeDB(db);
    res.status(201).json(novaPublicacao);
});

// Rota para deletar publicação
server.delete('/publicacoes/deletarPublicacao/:id', (req, res) => {
    const pubId = parseInt(req.params.id, 10);

    if (isNaN(pubId)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    const db = readDB();
    const pubIndex = db.publicacoes.findIndex((p) => p.id === pubId);

    if (pubIndex === -1) {
        return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    db.publicacoes.splice(pubIndex, 1);
    writeDB(db);
    res.status(204).send();
});

// Atualizar publicação
server.put('/publicacoes/atualizarPublicacao/:id', (req, res) => {
    const pubId = parseInt(req.params.id, 10);

    if (isNaN(pubId)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    const { descricao, dataPublicacao, imagem, local, idUsuario } = req.body;

    const db = readDB();
    const pubIndex = db.publicacoes.findIndex((p) => p.id === pubId);

    if (pubIndex === -1) {
        return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    const publicacao = db.publicacoes[pubIndex];
    if (descricao) publicacao.descricao = descricao;
    if (dataPublicacao) publicacao.dataPublicacao = dataPublicacao;
    if (imagem) publicacao.imagem = imagem;
    if (local) publicacao.local = local;
    if (idUsuario) publicacao.idUsuario = idUsuario;

    writeDB(db);
    res.status(200).json(publicacao);
});

// Inicia o servidor
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});
