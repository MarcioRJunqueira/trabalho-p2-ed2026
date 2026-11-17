// Lógica da simulação

/* ==========================================
   ÁRVORE DE BUSCA BINÁRIA
   Implementação visual em JavaScript
========================================== */

let root = null;
let operations = 0;

let steps = [];
let currentStep = 0;
let simulationResults = null;

const SVG_NS = "http://www.w3.org/2000/svg";

// Elementos da página
const valueInput = document.getElementById("value-input");

const insertButton = document.getElementById("insert-button");
const searchButton = document.getElementById("search-button");
const deleteButton = document.getElementById("delete-button");

const inorderButton = document.getElementById("inorder-button");
const preorderButton = document.getElementById("preorder-button");
const postorderButton = document.getElementById("postorder-button");

const heightButton = document.getElementById("height-button");
const resetButton = document.getElementById("reset-button");

const previousButton = document.getElementById("previous-step-button");
const nextButton = document.getElementById("next-step-button");

const treeSvg = document.getElementById("tree-svg");
const emptyMessage = document.getElementById("empty-message");

const treeStatus = document.getElementById("tree-status");
const stepDescription = document.getElementById("step-description");
const stepCounter = document.getElementById("step-counter");
const progressBar = document.getElementById("progress-bar");

const nodeCountElement = document.getElementById("node-count");
const treeHeightElement = document.getElementById("tree-height");
const operationCountElement = document.getElementById("operation-count");

const resultMessage = document.getElementById("result-message");

const inorderResult = document.getElementById("inorder-result");
const preorderResult = document.getElementById("preorder-result");
const postorderResult = document.getElementById("postorder-result");


/* ==========================================
   ESTRUTURA DOS NÓS
========================================== */

function createNode(value) {
    return {
        value: value,
        left: null,
        right: null
    };
}

function cloneTree(node) {
    if (node === null) {
        return null;
    }

    const copy = createNode(node.value);

    copy.left = cloneTree(node.left);
    copy.right = cloneTree(node.right);

    return copy;
}


/* ==========================================
   FUNÇÕES AUXILIARES
========================================== */

function countNodes(node) {
    if (node === null) {
        return 0;
    }

    return 1 + countNodes(node.left) + countNodes(node.right);
}

function calculateHeight(node) {
    if (node === null) {
        return -1;
    }

    return 1 + Math.max(
        calculateHeight(node.left),
        calculateHeight(node.right)
    );
}

function getTraversals(node) {
    const result = {
        inorder: [],
        preorder: [],
        postorder: []
    };

    function traverse(current) {
        if (current === null) {
            return;
        }

        result.preorder.push(current.value);

        traverse(current.left);

        result.inorder.push(current.value);

        traverse(current.right);

        result.postorder.push(current.value);
    }

    traverse(node);

    return result;
}

function formatArray(array) {
    return array.length > 0 ? array.join(" → ") : "-";
}

function getIntegerInput() {
    const text = valueInput.value.trim();

    if (text === "" || !/^-?\d+$/.test(text)) {
        showMessage("Digite um número inteiro válido.");
        valueInput.focus();
        return null;
    }

    const value = Number(text);

    if (!Number.isSafeInteger(value)) {
        showMessage("Digite um número inteiro dentro do limite seguro.");
        valueInput.focus();
        return null;
    }

    return value;
}

function showMessage(message) {
    resultMessage.textContent = message;
}


/* ==========================================
   REGISTRO DAS ETAPAS
========================================== */

function addStep(tree, activeValue, foundValue, description, count) {
    steps.push({
        tree: cloneTree(tree),
        activeValue: activeValue,
        foundValue: foundValue,
        description: description,
        count: count
    });
}

function startSimulation(message) {
    simulationResults = null;

    if (steps.length === 0) {
        addStep(root, null, null, message, operations);
    }

    currentStep = 0;

    showStep(currentStep);
}

function showStep(index) {
    if (index < 0 || index >= steps.length) {
        return;
    }

    currentStep = index;

    const step = steps[currentStep];

    renderTree(
        step.tree,
        step.activeValue,
        step.foundValue
    );

    stepDescription.textContent = step.description;

    stepCounter.textContent =
        `Etapa ${currentStep + 1} de ${steps.length}`;

    const progress = steps.length > 1
        ? (currentStep / (steps.length - 1)) * 100
        : 100;

    progressBar.style.width = `${progress}%`;

    previousButton.disabled = currentStep === 0;
    nextButton.disabled = currentStep === steps.length - 1;

    // Bloqueia novas operações até a simulação terminar.
    setOperationButtonsDisabled(currentStep < steps.length - 1);

    updateInformation(step.tree, step.count);

    updateTraversalResults(getTraversals(step.tree));
}

function setOperationButtonsDisabled(disabled) {
    const buttons = [
        insertButton,
        searchButton,
        deleteButton,
        inorderButton,
        preorderButton,
        postorderButton,
        heightButton,
        resetButton
    ];

    buttons.forEach(button => {
        button.disabled = disabled;
    });
}


/* ==========================================
   INSERÇÃO
========================================== */

function insertValue(value) {
    let tree = cloneTree(root);
    let count = 0;

    steps = [];

    if (tree === null) {
        tree = createNode(value);
        count++;

        addStep(
            tree,
            value,
            null,
            `A árvore estava vazia. O valor ${value} foi inserido como raiz.`,
            count
        );

        root = tree;
        operations = count;

        showMessage(`Valor ${value} inserido com sucesso.`);
        startSimulation("Inserção concluída.");

        return;
    }

    let current = tree;

    while (true) {
        count++;

        if (value === current.value) {
            addStep(
                tree,
                current.value,
                null,
                `O valor ${value} já existe. Valores duplicados não são permitidos.`,
                count
            );

            root = tree;
            operations = count;

            showMessage(`O valor ${value} já existe na árvore.`);
            startSimulation("Inserção não realizada.");

            return;
        }

        if (value < current.value) {
            addStep(
                tree,
                current.value,
                null,
                `${value} é menor que ${current.value}. Vamos verificar a esquerda.`,
                count
            );

            if (current.left === null) {
                current.left = createNode(value);

                addStep(
                    tree,
                    value,
                    null,
                    `A posição à esquerda está vazia. O valor ${value} foi inserido.`,
                    count
                );

                root = tree;
                operations = count;

                showMessage(`Valor ${value} inserido com sucesso.`);
                startSimulation("Inserção concluída.");

                return;
            }

            current = current.left;

        } else {
            addStep(
                tree,
                current.value,
                null,
                `${value} é maior que ${current.value}. Vamos verificar a direita.`,
                count
            );

            if (current.right === null) {
                current.right = createNode(value);

                addStep(
                    tree,
                    value,
                    null,
                    `A posição à direita está vazia. O valor ${value} foi inserido.`,
                    count
                );

                root = tree;
                operations = count;

                showMessage(`Valor ${value} inserido com sucesso.`);
                startSimulation("Inserção concluída.");

                return;
            }

            current = current.right;
        }
    }
}


/* ==========================================
   BUSCA
========================================== */

function searchValue(value) {
    let current = root;
    let count = 0;

    steps = [];

    if (current === null) {
        addStep(
            root,
            null,
            null,
            "A árvore está vazia. Não há valores para pesquisar.",
            count
        );

        operations = count;

        showMessage("Árvore vazia. Valor não encontrado.");
        startSimulation("Busca encerrada.");

        return;
    }

    while (current !== null) {
        count++;

        addStep(
            root,
            current.value,
            null,
            `Comparando ${value} com o nó ${current.value}.`,
            count
        );

        if (value === current.value) {
            addStep(
                root,
                null,
                current.value,
                `Valor ${value} encontrado!`,
                count
            );

            operations = count;

            showMessage(`Valor ${value} encontrado.`);
            startSimulation("Busca concluída.");

            return;
        }

        if (value < current.value) {
            current = current.left;

        } else {
            current = current.right;
        }
    }

    addStep(
        root,
        null,
        null,
        `O valor ${value} não foi encontrado. A posição necessária está vazia.`,
        count
    );

    operations = count;

    showMessage(`Valor ${value} não encontrado.`);
    startSimulation("Busca concluída.");
}


/* ==========================================
   REMOÇÃO
========================================== */

function deleteValue(value) {
    let tree = cloneTree(root);

    let parent = null;
    let current = tree;

    let count = 0;

    steps = [];

    // Localiza o valor.
    while (current !== null) {
        count++;

        addStep(
            tree,
            current.value,
            null,
            `Procurando o valor ${value}. Comparando com ${current.value}.`,
            count
        );

        if (value === current.value) {
            break;
        }

        parent = current;

        if (value < current.value) {
            current = current.left;
        } else {
            current = current.right;
        }
    }

    // Valor não encontrado.
    if (current === null) {
        addStep(
            tree,
            null,
            null,
            `O valor ${value} não existe na árvore. Nada foi removido.`,
            count
        );

        operations = count;

        showMessage(`Valor ${value} não encontrado.`);
        startSimulation("Remoção não realizada.");

        return;
    }

    // CASO 1: nó com dois filhos.
    if (current.left !== null && current.right !== null) {
        addStep(
            tree,
            current.value,
            null,
            `O nó ${current.value} possui dois filhos. Vamos encontrar seu sucessor.`,
            count
        );

        let successorParent = current;
        let successor = current.right;

        // Procura o menor valor da subárvore direita.
        while (successor.left !== null) {
            count++;

            addStep(
                tree,
                successor.value,
                null,
                `Procurando o menor valor da subárvore direita. Avançando para a esquerda.`,
                count
            );

            successorParent = successor;
            successor = successor.left;
        }

        addStep(
            tree,
            successor.value,
            null,
            `O sucessor encontrado é ${successor.value}.`,
            count
        );

        // Substitui o valor do nó pelo sucessor.
        const oldValue = current.value;
        current.value = successor.value;

        // Remove o sucessor de sua posição original.
        if (successorParent === current) {
            successorParent.right = successor.right;
        } else {
            successorParent.left = successor.right;
        }

        addStep(
            tree,
            current.value,
            null,
            `O valor ${oldValue} foi substituído por ${successor.value}, e o sucessor foi removido de sua posição original.`,
            count
        );
    }

    // CASO 2: nó com um filho ou sem filhos.
    else {
        let child;

        if (current.left !== null) {
            child = current.left;
        } else {
            child = current.right;
        }

        if (parent === null) {
            tree = child;

        } else if (parent.left === current) {
            parent.left = child;

        } else {
            parent.right = child;
        }

        if (child === null) {
            addStep(
                tree,
                null,
                null,
                `O nó ${value} não possui filhos. Ele foi removido diretamente.`,
                count
            );

        } else {
            addStep(
                tree,
                child.value,
                null,
                `O nó ${value} tinha um filho. O filho ${child.value} ocupou sua posição.`,
                count
            );
        }
    }

    root = tree;
    operations = count;

    showMessage(`Valor ${value} removido com sucesso.`);
    startSimulation("Remoção concluída.");
}


/* ==========================================
   TRAVESSIAS
========================================== */

function runTraversal(type) {
    const result = [];
    let count = 0;

    steps = [];

    function traverse(node) {
        if (node === null) {
            return;
        }

        count++;

        if (type === "preorder") {
            result.push(node.value);

            addStep(
                root,
                node.value,
                null,
                `Pré-ordem: visitando o nó ${node.value}.`,
                count
            );
        }

        traverse(node.left);

        if (type === "inorder") {
            result.push(node.value);

            addStep(
                root,
                node.value,
                null,
                `Em ordem: visitando o nó ${node.value}.`,
                count
            );
        }

        traverse(node.right);

        if (type === "postorder") {
            result.push(node.value);

            addStep(
                root,
                node.value,
                null,
                `Pós-ordem: visitando o nó ${node.value}.`,
                count
            );
        }
    }

    traverse(root);

    operations = count;

    if (result.length === 0) {
        addStep(
            root,
            null,
            null,
            "A árvore está vazia. Não há nós para percorrer.",
            count
        );
    } else {
        addStep(
            root,
            null,
            null,
            `Percurso concluído: ${formatArray(result)}.`,
            count
        );
    }

    const results = getTraversals(root);
    updateTraversalResults(results);

    if (type === "inorder") {
        showMessage(`Percurso em ordem: ${formatArray(result)}`);

    } else if (type === "preorder") {
        showMessage(`Percurso pré-ordem: ${formatArray(result)}`);

    } else {
        showMessage(`Percurso pós-ordem: ${formatArray(result)}`);
    }

    startSimulation("Percurso concluído.");
}


/* ==========================================
   CÁLCULO DA ALTURA
========================================== */

function calculateHeightStepByStep() {
    let count = 0;

    steps = [];

    function calculate(node) {
        if (node === null) {
            return -1;
        }

        count++;

        addStep(
            root,
            node.value,
            null,
            `Visitando o nó ${node.value} para calcular a altura.`,
            count
        );

        const leftHeight = calculate(node.left);
        const rightHeight = calculate(node.right);

        return 1 + Math.max(leftHeight, rightHeight);
    }

    const height = calculate(root);

    operations = count;

    addStep(
        root,
        null,
        null,
        `Cálculo concluído. A altura da árvore é ${height}.`,
        count
    );

    showMessage(`Altura da árvore: ${height}.`);
    startSimulation("Cálculo da altura concluído.");
}


/* ==========================================
   ATUALIZAÇÃO DAS INFORMAÇÕES
========================================== */

function updateInformation(tree, operationCount) {
    nodeCountElement.textContent = countNodes(tree);

    treeHeightElement.textContent = calculateHeight(tree);

    operationCountElement.textContent = operationCount;

    treeStatus.textContent = tree === null
        ? "Árvore vazia"
        : "Árvore preenchida";
}

function updateTraversalResults(results) {
    inorderResult.textContent = formatArray(results.inorder);
    preorderResult.textContent = formatArray(results.preorder);
    postorderResult.textContent = formatArray(results.postorder);
}


/* ==========================================
   DESENHO DA ÁRVORE
========================================== */

function createSvgElement(tag, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tag);

    Object.entries(attributes).forEach(([name, value]) => {
        element.setAttribute(name, value);
    });

    return element;
}

function renderTree(tree, activeValue = null, foundValue = null) {
    treeSvg.replaceChildren();

    if (tree === null) {
        emptyMessage.style.display = "flex";
        treeSvg.setAttribute("viewBox", "0 0 600 390");
        return;
    }

    emptyMessage.style.display = "none";

    const positions = [];
    let horizontalIndex = 0;
    let maxDepth = 0;

    // Calcula a posição de cada nó.
    function calculatePositions(node, depth) {
        if (node === null) {
            return;
        }

        calculatePositions(node.left, depth + 1);

        const x = 60 + horizontalIndex * 85;
        const y = 55 + depth * 85;

        positions.push({
            node: node,
            x: x,
            y: y,
            depth: depth
        });

        horizontalIndex++;
        maxDepth = Math.max(maxDepth, depth);

        calculatePositions(node.right, depth + 1);
    }

    calculatePositions(tree, 0);

    const width = Math.max(500, horizontalIndex * 85 + 30);
    const height = Math.max(390, (maxDepth + 1) * 85 + 55);

    treeSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    treeSvg.setAttribute("width", width);
    treeSvg.setAttribute("height", height);
    treeSvg.style.width = `${width}px`;
    treeSvg.style.height = `${height}px`;
   
    const positionMap = new Map();

    positions.forEach(position => {
        positionMap.set(position.node, position);
    });

    // Desenha as ligações antes dos nós.
    positions.forEach(position => {
        const node = position.node;

        [node.left, node.right].forEach(child => {
            if (child === null) {
                return;
            }

            const childPosition = positionMap.get(child);

            const line = createSvgElement("line", {
                x1: position.x,
                y1: position.y,
                x2: childPosition.x,
                y2: childPosition.y,
                stroke: "#64748b",
                "stroke-width": "2"
            });

            treeSvg.appendChild(line);
        });
    });

    // Desenha os nós.
    positions.forEach(position => {
        const value = position.node.value;

        let color = "#3b82f6";

        if (value === activeValue) {
            color = "#f59e0b";
        }

        if (value === foundValue) {
            color = "#22c55e";
        }

        const circle = createSvgElement("circle", {
            cx: position.x,
            cy: position.y,
            r: 23,
            fill: color,
            stroke: "#e2e8f0",
            "stroke-width": "2"
        });

        const text = createSvgElement("text", {
            x: position.x,
            y: position.y + 5,
            fill: "#ffffff",
            "font-size": "14",
            "font-weight": "bold",
            "text-anchor": "middle"
        });

        text.textContent = value;

        treeSvg.appendChild(circle);
        treeSvg.appendChild(text);
    });
}


/* ==========================================
   REINICIAR ÁRVORE
========================================== */

function resetTree() {
    root = null;
    operations = 0;

    steps = [];
    currentStep = 0;
    simulationResults = null;

    renderTree(root);

    updateInformation(root, operations);
    updateTraversalResults(getTraversals(root));

    stepDescription.textContent =
        "Árvore reiniciada. Insira um valor para começar.";

    stepCounter.textContent = "Etapa 0 de 0";
    progressBar.style.width = "0%";

    previousButton.disabled = true;
    nextButton.disabled = true;

    setOperationButtonsDisabled(false);

    showMessage("Árvore reiniciada com sucesso.");
    valueInput.value = "";
}


/* ==========================================
   EVENTOS DOS BOTÕES
========================================== */

insertButton.addEventListener("click", () => {
    const value = getIntegerInput();

    if (value !== null) {
        insertValue(value);
    }
});

searchButton.addEventListener("click", () => {
    const value = getIntegerInput();

    if (value !== null) {
        searchValue(value);
    }
});

deleteButton.addEventListener("click", () => {
    const value = getIntegerInput();

    if (value !== null) {
        deleteValue(value);
    }
});

inorderButton.addEventListener("click", () => {
    runTraversal("inorder");
});

preorderButton.addEventListener("click", () => {
    runTraversal("preorder");
});

postorderButton.addEventListener("click", () => {
    runTraversal("postorder");
});

heightButton.addEventListener("click", () => {
    calculateHeightStepByStep();
});

resetButton.addEventListener("click", () => {
    resetTree();
});

previousButton.addEventListener("click", () => {
    showStep(currentStep - 1);
});

nextButton.addEventListener("click", () => {
    showStep(currentStep + 1);
});

// Permite executar a operação pressionando Enter.
valueInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        insertButton.click();
    }
});


/* ==========================================
   INICIALIZAÇÃO
========================================== */

function initialize() {
    renderTree(root);

    updateInformation(root, operations);

    updateTraversalResults(getTraversals(root));
}

initialize();
