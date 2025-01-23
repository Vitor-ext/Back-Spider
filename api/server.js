const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const server = jsonServer.create();
const cors = require('cors');  // Importar o pacote cors
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 8080;

// Carrega o banco de dados diretamente do arquivo JSON
const dbFile = path.join(__dirname, 'db.json');

// Função para ler e parsear o conteúdo de db.json
const readDB = () => {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
};

// Função para atualizar o db.json após alterações
const writeDB = (data) => {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
};

server.use(cors());

// Custom POST /login route for user authentication
server.post('/login', (req, res) => {
    
     const { email, senha } = req.query;
     
    // Verificar se email e senha foram passados
    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios!' });
    }

    // Ler o banco de dados diretamente
    const db = readDB();

    // Encontrar o usuário pelo email e verificar a senha
    const usuario = db.usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false });
    }
});


// Register User
server.post('/user/cadastrarUser', (req, res) => {
    const { nome, email, senha, premium, imagemPerfil } = req.query;

    // Verificar se todos os campos necessários estão presentes
    if (!nome || !email || !senha || !premium || !imagemPerfil) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Ler o banco de dados diretamente
    const db = readDB();

    // Gerar um novo ID para a publicação
    const newId = db.usuarios.length > 0 ? db.usuarios[db.usuarios.length - 1].id + 1 : 1;

    // Criar a nova publicação
    const novoUser = {
        id: newId,
        nome,
        email,
        senha,
        premium,
        imagemPerfil
    };

    // Adicionar a nova publicação ao banco de dados
    db.usuarios.push(novoUser);

    // Atualizar o arquivo db.json com a nova publicação
    writeDB(db);

    // Retornar a nova publicação criada
    res.status(201).json(novoUser);
});


// delete user
server.delete('/user/deleteuser/:id', (req, res) => {
    const idDelete = parseInt(req.params.id); // Converta para número!

    if (isNaN(idDelete)) {
        return res.status(400).json({ // Retorna erro 400 se o ID não for um número
            "Message": "ID inválido.",
            "Erro": "ID deve ser um número inteiro.",
            "Sucess": "False"
        });
    }

    try {
        const db = readDB();
        const listUsers = db.usuarios;

        const index = listUsers.findIndex(usuario => usuario.id === idDelete);

        if (index === -1) {
            return res.status(404).json({ // Retorna 404 se a publicação não for encontrada
                "Message": "Usuário não encontrado.",
                "Erro": "Usuário com o ID especificado não existe.",
                "Sucess": "False"
            });
        }

        listUsers.splice(index, 1); // Remove o item CORRETAMENTE usando o índice

        writeDB(db);

        res.status(204).send();
      

    } catch (erro) {
        
        res.status(501).json({
            "Message": "Não foi possivel deletar a publicação.",
            "Erro": erro,
            "Sucess": "False"
        })
    }

})


// Update User (PUT)
server.put('/user/atualizarUser/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    const { nome, email, senha, premium, imagemPerfil } = req.query;

    //Verifica se pelo menos um campo foi enviado para atualizar
    if (!nome && !email && !senha && premium === undefined && !imagemPerfil) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const db = readDB(); // Lê o banco de dados

    const userIndex = db.usuarios.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Atualiza apenas os campos fornecidos na requisição
    if (nome) db.usuarios[userIndex].nome = nome;
    if (email) db.usuarios[userIndex].email = email;
    if (senha) db.usuarios[userIndex].senha = senha;
    if (premium !== undefined) db.usuarios[userIndex].premium = premium;
    if (imagemPerfil) db.usuarios[userIndex].imagemPerfil = imagemPerfil;

    writeDB(db); // Escreve as alterações no banco de dados

    res.status(200).json(db.usuarios[userIndex]); // Retorna o usuário atualizado
});



// Publicações

server.get('/publicacoes/listarPublicacoes', (req, res) => {
    // Ler o banco de dados diretamente
    const db = readDB();

    let publicacoes = db.publicacoes

    res.status(200).json(publicacoes)

})

server.post('/publicacoes/cadastrarPublicacao', (req, res) => {
    const { descricao, dataPublicacao, imagem, local, idUsuario } = req.query;

    // Verificar se todos os campos necessários estão presentes
    if (!descricao || !dataPublicacao || !imagem || !local || !idUsuario) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: descricao, dataPublicacao, imagem, local, idUsuario' });
    }

    // Ler o banco de dados diretamente
    const db = readDB();

    // Gerar um novo ID para a publicação
    const newId = db.publicacoes.length > 0 ? db.publicacoes[db.publicacoes.length - 1].id + 1 : 1;

    // Criar a nova publicação
    const novaPublicacao = {
        id: newId,
        descricao,
        dataPublicacao,
        imagem,
        local,
        idUsuario
    };

    // Adicionar a nova publicação ao banco de dados
    db.publicacoes.push(novaPublicacao);

    // Atualizar o arquivo db.json com a nova publicação
    writeDB(db);

    // Retornar a nova publicação criada
    res.status(201).json(novaPublicacao);
});


server.delete('/publicacoes/deletarPublicacao/:id', (req, res) => {
    const idDelete = parseInt(req.params.id); // Converta para número!

    if (isNaN(idDelete)) {
        return res.status(400).json({ // Retorna erro 400 se o ID não for um número
            "Message": "ID inválido.",
            "Erro": "ID deve ser um número inteiro.",
            "Sucess": "False"
        });
    }

    try {
        const db = readDB();
        const listPublicacoes = db.publicacoes;

        const index = listPublicacoes.findIndex(publicacao => publicacao.id === idDelete);

        if (index === -1) {
            return res.status(404).json({ // Retorna 404 se a publicação não for encontrada
                "Message": "Publicação não encontrada.",
                "Erro": "Publicação com o ID especificado não existe.",
                "Sucess": "False"
            });
        }

        listPublicacoes.splice(index, 1); // Remove o item CORRETAMENTE usando o índice

        writeDB(db);

        res.status(204).send();
      

    } catch (erro) {
        
        res.status(501).json({
            "Message": "Não foi possivel deletar a publicação.",
            "Erro": erro,
            "Sucess": "False"
        })
    }

})

// Update Publicacao (PUT)
server.put('/publicacoes/atualizarPublicacao/:id', (req, res) => {
    const publicacaoId = parseInt(req.params.id); // Converte o ID para número
    if (isNaN(publicacaoId)) {
        return res.status(400).json({ message: 'ID de publicação inválido' });
    }

    const { descricao, dataPublicacao, imagem, local, idUsuario } = req.query;

    // Verifica se pelo menos um campo foi enviado para atualizar
    if (!descricao && !dataPublicacao && !imagem && !local && !idUsuario) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const db = readDB();
    const publicacaoIndex = db.publicacoes.findIndex(publicacao => publicacao.id === publicacaoId);

    if (publicacaoIndex === -1) {
        return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    // Atualiza apenas os campos fornecidos na requisição
    if (descricao) db.publicacoes[publicacaoIndex].descricao = descricao;
    if (dataPublicacao) db.publicacoes[publicacaoIndex].dataPublicacao = dataPublicacao;
    if (imagem) db.publicacoes[publicacaoIndex].imagem = imagem;
    if (local) db.publicacoes[publicacaoIndex].local = local;
    if (idUsuario) db.publicacoes[publicacaoIndex].idUsuario = idUsuario;

    writeDB(db);

    res.status(200).json(db.publicacoes[publicacaoIndex]); // Retorna a publicação atualizada
});


server.use(middlewares);
server.listen(port, () => {
    console.log('JSON Server is running...');
});
