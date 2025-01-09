const fs = require('fs');
const inquirer = require('inquirer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Caminho para o arquivo JSON
const dataPath = path.join(__dirname, 'products.json');

// Função para ler os produtos do arquivo JSON
function readProducts() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Função para escrever os produtos no arquivo JSON
function writeProducts(products) {
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
}

// Função para adicionar um novo produto
async function addProduct() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'nome',
            message: 'Nome do Produto:',
            validate: input => input ? true : 'O nome é obrigatório.'
        },
        {
            type: 'input',
            name: 'categoria',
            message: 'Categoria:',
            validate: input => input ? true : 'A categoria é obrigatória.'
        },
        {
            type: 'number',
            name: 'quantidade',
            message: 'Quantidade em Estoque:',
            validate: input => Number.isInteger(input) && input >= 0 ? true : 'Insira um número inteiro não negativo.'
        },
        {
            type: 'number',
            name: 'preco',
            message: 'Preço:',
            validate: input => input >= 0 ? true : 'O preço deve ser não negativo.'
        }
    ]);

    const products = readProducts();
    const newProduct = {
        id: uuidv4(),
        nome: answers.nome,
        categoria: answers.categoria,
        quantidade: answers.quantidade,
        preco: answers.preco
    };

    products.push(newProduct);
    writeProducts(products);
    console.log('Produto adicionado com sucesso!');
    mainMenu();
}

// Função para listar todos os produtos
function listProducts() {
    const products = readProducts();
    if (products.length === 0) {
        console.log('Nenhum produto encontrado.');
    } else {
        console.table(products);
    }
    mainMenu();
}

// Função para atualizar um produto existente
async function updateProduct() {
    const products = readProducts();
    if (products.length === 0) {
        console.log('Nenhum produto para atualizar.');
        return mainMenu();
    }

    const { id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Digite o ID do produto que deseja atualizar:',
            validate: input => input ? true : 'O ID é obrigatório.'
        }
    ]);

    const product = products.find(p => p.id === id);
    if (!product) {
        console.log('Produto não encontrado.');
        return mainMenu();
    }

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'nome',
            message: `Nome do Produto (${product.nome}):`,
            default: product.nome
        },
        {
            type: 'input',
            name: 'categoria',
            message: `Categoria (${product.categoria}):`,
            default: product.categoria
        },
        {
            type: 'number',
            name: 'quantidade',
            message: `Quantidade em Estoque (${product.quantidade}):`,
            default: product.quantidade,
            validate: input => Number.isInteger(input) && input >= 0 ? true : 'Insira um número inteiro não negativo.'
        },
        {
            type: 'number',
            name: 'preco',
            message: `Preço (${product.preco}):`,
            default: product.preco,
            validate: input => input >= 0 ? true : 'O preço deve ser não negativo.'
        }
    ]);

    product.nome = answers.nome;
    product.categoria = answers.categoria;
    product.quantidade = answers.quantidade;
    product.preco = answers.preco;

    writeProducts(products);
    console.log('Produto atualizado com sucesso!');
    mainMenu();
}

// Função para excluir um produto
async function deleteProduct() {
    const products = readProducts();
    if (products.length === 0) {
        console.log('Nenhum produto para excluir.');
        return mainMenu();
    }

    const { id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Digite o ID do produto que deseja excluir:',
            validate: input => input ? true : 'O ID é obrigatório.'
        }
    ]);

    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
        console.log('Produto não encontrado.');
        return mainMenu();
    }

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Tem certeza que deseja excluir o produto "${products[index].nome}"?`,
            default: false
        }
    ]);

    if (confirm) {
        products.splice(index, 1);
        writeProducts(products);
        console.log('Produto excluído com sucesso!');
    } else {
        console.log('Operação cancelada.');
    }
    mainMenu();
}

// **Nova Função: Buscar Produto**
async function searchProduct() {
    const products = readProducts();
    if (products.length === 0) {
        console.log('Nenhum produto cadastrado para busca.');
        return mainMenu();
    }

    const { searchBy } = await inquirer.prompt([
        {
            type: 'list',
            name: 'searchBy',
            message: 'Deseja buscar o produto por:',
            choices: [
                { name: 'ID', value: 'id' },
                { name: 'Nome', value: 'nome' }
            ]
        }
    ]);

    if (searchBy === 'id') {
        const { id } = await inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'Digite o ID do produto:',
                validate: input => input ? true : 'O ID é obrigatório.'
            }
        ]);

        const product = products.find(p => p.id === id);
        if (product) {
            console.log('\n** Detalhes do Produto **');
            console.log(`ID: ${product.id}`);
            console.log(`Nome: ${product.nome}`);
            console.log(`Categoria: ${product.categoria}`);
            console.log(`Quantidade em Estoque: ${product.quantidade}`);
            console.log(`Preço: R$ ${product.preco.toFixed(2)}\n`);
        } else {
            console.log('Nenhum produto encontrado com o ID fornecido.');
        }
    } else if (searchBy === 'nome') {
        const { nome } = await inquirer.prompt([
            {
                type: 'input',
                name: 'nome',
                message: 'Digite o nome ou parte do nome do produto:',
                validate: input => input ? true : 'O nome é obrigatório.'
            }
        ]);

        const regex = new RegExp(nome, 'i'); // Busca case-insensitive
        const matchedProducts = products.filter(p => regex.test(p.nome));

        if (matchedProducts.length === 0) {
            console.log('Nenhum produto encontrado com o nome fornecido.');
        } else if (matchedProducts.length === 1) {
            const product = matchedProducts[0];
            console.log('\n** Detalhes do Produto **');
            console.log(`ID: ${product.id}`);
            console.log(`Nome: ${product.nome}`);
            console.log(`Categoria: ${product.categoria}`);
            console.log(`Quantidade em Estoque: ${product.quantidade}`);
            console.log(`Preço: R$ ${product.preco.toFixed(2)}\n`);
        } else {
            console.log(`\nForam encontrados ${matchedProducts.length} produtos:`);
            matchedProducts.forEach((p, index) => {
                console.log(`${index + 1}. ID: ${p.id} | Nome: ${p.nome} | Categoria: ${p.categoria} | Quantidade: ${p.quantidade} | Preço: R$ ${p.preco.toFixed(2)}`);
            });

            const { selectProduct } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'selectProduct',
                    message: 'Digite o número do produto que deseja ver os detalhes (0 para cancelar):',
                    validate: input => {
                        if (Number.isInteger(input) && input >= 0 && input <= matchedProducts.length) {
                            return true;
                        }
                        return `Por favor, insira um número entre 0 e ${matchedProducts.length}.`;
                    }
                }
            ]);

            if (selectProduct === 0) {
                console.log('Operação cancelada.');
            } else {
                const selected = matchedProducts[selectProduct - 1];
                console.log('\n** Detalhes do Produto **');
                console.log(`ID: ${selected.id}`);
                console.log(`Nome: ${selected.nome}`);
                console.log(`Categoria: ${selected.categoria}`);
                console.log(`Quantidade em Estoque: ${selected.quantidade}`);
                console.log(`Preço: R$ ${selected.preco.toFixed(2)}\n`);
            }
        }
    }

    mainMenu();
}

// Menu principal
function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Selecione uma ação:',
            choices: [
                { name: 'Adicionar Produto', value: 'add' },
                { name: 'Listar Produtos', value: 'list' },
                { name: 'Atualizar Produto', value: 'update' },
                { name: 'Excluir Produto', value: 'delete' },
                { name: 'Buscar Produto', value: 'search' }, // **Nova Opção**
                { name: 'Sair', value: 'exit' }
            ]
        }
    ]).then(answer => {
        switch (answer.action) {
            case 'add':
                addProduct();
                break;
            case 'list':
                listProducts();
                break;
            case 'update':
                updateProduct();
                break;
            case 'delete':
                deleteProduct();
                break;
            case 'search':
                searchProduct();
                break;
            case 'exit':
                console.log('Saindo...');
                process.exit();
                break;
            default:
                mainMenu();
        }
    });
}

// Iniciar o menu principal
mainMenu();
