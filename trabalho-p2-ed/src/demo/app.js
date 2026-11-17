
const elements = {
    input: document.getElementById("value-input"),
    treeSvg: document.getElementById("tree-svg"),
    emptyMessage: document.getElementById("empty-message"),
    treeStatus: document.getElementById("tree-status"),
    stepDescription: document.getElementById("step-description"),
    stepCounter: document.getElementById("step-counter"),
    stepPercentage: document.getElementById("step-percentage"),
    progressBar: document.getElementById("progress-bar"),
    simulationStatus: document.getElementById("simulation-status"),
    nodeCount: document.getElementById("node-count"),
    treeHeight: document.getElementById("tree-height"),
    operationCount: document.getElementById("operation-count"),
    stateOperation: document.getElementById("state-operation"),
    stateTarget: document.getElementById("state-target"),
    stateCurrent: document.getElementById("state-current"),
    stateComparison: document.getElementById("state-comparison"),
    variables: document.getElementById("variables-box"),
    inorder: document.getElementById("inorder-result"),
    preorder: document.getElementById("preorder-result"),
    postorder: document.getElementById("postorder-result"),
    message: document.getElementById("result-message"),
    scenarioStatus: document.getElementById("scenario-status"),
    play: document.getElementById("play-button"),
    next: document.getElementById("next-step-button"),
    pause: document.getElementById("pause-button"),
    reset: document.getElementById("reset-button")
};

let root = null;
let steps = [];
let currentStep = 0;
let playbackTimer = null;
let initialTree = null;
let initialScenarioName = "Modo personalizado";
let operationButtons = [];

const NODE_RADIUS = 23;
const LEVEL_HEIGHT = 85;
const HORIZONTAL_GAP = 76;

function createNode(value) {
    return {
        value,
        left: null,
        right: null
    };
}

function cloneTree(node) {
    if (!node) return null;

    return {
        value: node.value,
        left: cloneTree(node.left),
        right: cloneTree(node.right)
    };
}

function countNodes(node) {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
}

// Altura medida em arestas.
// Árvore vazia = -1; somente a raiz = 0.
function calculateHeight(node) {
    if (!node) return -1;

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

    function visit(current) {
        if (!current) return;

        result.preorder.push(current.value);
        visit(current.left);
        result.inorder.push(current.value);
        visit(current.right);
        result.postorder.push(current.value);
    }

    visit(node);
    return result;
}

function formatArray(values) {
    return values.length ? values.join(" → ") : "-";
}

function showMessage(message, type = "") {
    elements.message.textContent = message;
    elements.message.className = "message";

    if (type) {
        elements.message.classList.add(type);
    }
}

function stopPlayback() {
    if (playbackTimer !== null) {
        clearInterval(playbackTimer);
        playbackTimer = null;
    }

    elements.play.disabled = false;
    elements.pause.disabled = true;
}

function updateInformation(tree, operations) {
    elements.nodeCount.textContent = countNodes(tree);
    elements.treeHeight.textContent = calculateHeight(tree);
    elements.operationCount.textContent = operations;
    elements.treeStatus.textContent = countNodes(tree) + " nó(s)";
    updateTraversalResults(tree);
}

function updateTraversalResults(tree) {
    const results = getTraversals(tree);

    elements.inorder.textContent = formatArray(results.inorder);
    elements.preorder.textContent = formatArray(results.preorder);
    elements.postorder.textContent = formatArray(results.postorder);
}

function updateState(step) {
    elements.stateOperation.textContent = step.operation || "Nenhuma";
    elements.stateTarget.textContent =
        step.target === null || step.target === undefined ? "-" : step.target;

    elements.stateCurrent.textContent =
        step.current === null || step.current === undefined ? "-" : step.current;

    elements.stateComparison.textContent = step.comparison || "-";

    elements.variables.textContent = JSON.stringify(
        step.variables || {},
        null,
        2
    );
}

// ---------------------------------------------------------------------
// DESENHO DA ÁRVORE
// ---------------------------------------------------------------------

function createSvgElement(tag, attributes = {}) {
    const element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        tag
    );

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;
}

function getTreePositions(tree) {
    const positions = [];
    let index = 0;
    let maxDepth = 0;

    function visit(node, depth) {
        if (!node) return;

        maxDepth = Math.max(maxDepth, depth);

        visit(node.left, depth + 1);

        positions.push({
            node,
            x: 55 + index * HORIZONTAL_GAP,
            y: 55 + depth * LEVEL_HEIGHT
        });

        index++;

        visit(node.right, depth + 1);
    }

    visit(tree, 0);

    return {
        positions,
        width: Math.max(600, 110 + positions.length * HORIZONTAL_GAP),
        height: Math.max(390, 110 + (maxDepth + 1) * LEVEL_HEIGHT)
    };
}

function renderTree(tree, activeValue = null, foundValue = null) {
    elements.treeSvg.innerHTML = "";

    if (!tree) {
        elements.emptyMessage.style.display = "block";
        elements.treeSvg.setAttribute("viewBox", "0 0 600 390");
        elements.treeSvg.style.width = "600px";
        elements.treeSvg.style.height = "390px";
        return;
    }

    elements.emptyMessage.style.display = "none";

    const layout = getTreePositions(tree);
    const positionMap = new Map();

    layout.positions.forEach(item => {
        positionMap.set(item.node, item);
    });

    elements.treeSvg.setAttribute(
        "viewBox",
        `0 0 ${layout.width} ${layout.height}`
    );

    elements.treeSvg.style.width = `${layout.width}px`;
    elements.treeSvg.style.height = `${layout.height}px`;

    // Desenha as ligações antes dos nós.
    layout.positions.forEach(item => {
        const node = item.node;

        [node.left, node.right].forEach(child => {
            if (!child) return;

            const childPosition = positionMap.get(child);

            const line = createSvgElement("line", {
                x1: item.x,
                y1: item.y,
                x2: childPosition.x,
                y2: childPosition.y,
                stroke: "#64748b",
                "stroke-width": 2
            });

            elements.treeSvg.appendChild(line);
        });
    });

    // Desenha os nós.
    layout.positions.forEach(item => {
        const value = item.node.value;

        let fill = "#2563eb";

        if (value === activeValue) fill = "#d97706";
        if (value === foundValue) fill = "#16a34a";

        const circle = createSvgElement("circle", {
            cx: item.x,
            cy: item.y,
            r: NODE_RADIUS,
            fill,
            stroke: "#bfdbfe",
            "stroke-width": 2
        });

        const text = createSvgElement("text", {
            x: item.x,
            y: item.y + 5,
            fill: "#ffffff",
            "font-size": 13,
            "font-weight": "bold",
            "text-anchor": "middle"
        });

        text.textContent = value;

        elements.treeSvg.appendChild(circle);
        elements.treeSvg.appendChild(text);
    });
}

// ---------------------------------------------------------------------
// CONTROLE DA SIMULAÇÃO
// ---------------------------------------------------------------------

function addStep(tree, description, details = {}) {
    steps.push({
        tree: cloneTree(tree),
        description,
        operations: details.operations ?? 0,
        operation: details.operation ?? "Nenhuma",
        target: details.target ?? null,
        current: details.current ?? null,
        comparison: details.comparison ?? "-",
        variables: details.variables ?? {},
        activeValue: details.activeValue ?? null,
        foundValue: details.foundValue ?? null
    });
}

function startSimulation(description) {
    stopPlayback();

    currentStep = 0;

    if (steps.length === 0) {
        addStep(root, "Nenhuma etapa foi gerada.");
    }

    elements.simulationStatus.textContent = description;
    showStep(0);
}

function showStep(index) {
    if (!steps.length) return;

    currentStep = Math.max(0, Math.min(index, steps.length - 1));

    const step = steps[currentStep];

    root = cloneTree(step.tree);

    renderTree(
        root,
        step.activeValue,
        step.foundValue
    );

    updateInformation(root, step.operations);
    updateState(step);

    elements.stepDescription.textContent = step.description;

    elements.stepCounter.textContent =
        `Passo ${currentStep + 1} de ${steps.length}`;

    const percentage = Math.round(
        ((currentStep + 1) / steps.length) * 100
    );

    elements.stepPercentage.textContent = percentage + "%";
    elements.progressBar.style.width = percentage + "%";

    if (currentStep === steps.length - 1) {
        elements.simulationStatus.textContent = "Simulação concluída";
        elements.next.disabled = true;
        stopPlayback();
    } else {
        elements.next.disabled = false;
    }
}

function nextStep() {
    if (!steps.length) return;

    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    }
}

function playSimulation() {
    if (!steps.length) {
        showMessage("Execute uma operação antes de iniciar a simulação.", "error");
        return;
    }

    if (currentStep >= steps.length - 1) {
        showMessage("A simulação já chegou ao último passo.", "success");
        return;
    }

    if (playbackTimer !== null) return;

    elements.play.disabled = true;
    elements.pause.disabled = false;
    elements.simulationStatus.textContent = "Executando...";

    playbackTimer = setInterval(() => {
        if (currentStep >= steps.length - 1) {
            stopPlayback();
            return;
        }

        nextStep();
    }, 1000);
}

function pauseSimulation() {
    stopPlayback();
    elements.simulationStatus.textContent = "Simulação pausada";
}

function resetSimulation() {
    stopPlayback();

    if (!steps.length) {
        root = cloneTree(initialTree);
        renderTree(root);
        updateInformation(root, 0);
        elements.stepDescription.textContent = "Nenhuma simulação disponível.";
        elements.stepCounter.textContent = "Passo 0 de 0";
        elements.stepPercentage.textContent = "0%";
        elements.progressBar.style.width = "0%";
        elements.variables.textContent = "Aguardando execução...";
        elements.stateOperation.textContent = "Nenhuma";
        elements.stateTarget.textContent = "-";
        elements.stateCurrent.textContent = "-";
        elements.stateComparison.textContent = "-";
        elements.simulationStatus.textContent = "Aguardando operação";
        elements.next.disabled = true;
        return;
    }

    showStep(0);
    elements.simulationStatus.textContent = "Simulação reiniciada";
    showMessage("Simulação reiniciada desde o primeiro passo.", "success");
}

// ---------------------------------------------------------------------
// OPERAÇÃO: INSERIR
// ---------------------------------------------------------------------

function insertValue(value) {
    steps = [];
    let operations = 0;

    const workingTree = cloneTree(root);

    addStep(workingTree, `Iniciando a inserção do valor ${value}.`, {
        operation: "Inserção",
        target: value,
        variables: {
            current: "raiz",
            value: value,
            operations: 0
        }
    });

    if (!workingTree) {
        root = createNode(value);

        operations++;

        addStep(root, `Árvore vazia: ${value} foi inserido como raiz.`, {
            operations,
            operation: "Inserção",
            target: value,
            current: value,
            comparison: "Não foi necessária comparação.",
            variables: {
                current: value,
                parent: null,
                operations
            },
            activeValue: value
        });

        showMessage(`${value} inserido como raiz.`, "success");
        startSimulation("Inserção");
        return;
    }

    let current = workingTree;
    let parent = null;

    while (current) {
        operations++;
        parent = current;

        addStep(workingTree, `Analisando o nó ${current.value}.`, {
            operations,
            operation: "Inserção",
            target: value,
            current: current.value,
            comparison: `${value} ${value < current.value ? "<" : value > current.value ? ">" : "="} ${current.value}`,
            variables: {
                current: current.value,
                parent: parent.value,
                value,
                operations
            },
            activeValue: current.value
        });

        if (value < current.value) {
            if (!current.left) {
                current.left = createNode(value);

                addStep(workingTree, `${value} foi inserido à esquerda de ${current.value}.`, {
                    operations,
                    operation: "Inserção",
                    target: value,
                    current: current.value,
                    comparison: `${value} < ${current.value}`,
                    variables: {
                        current: current.value,
                        parent: parent.value,
                        inserted: value,
                        position: "left",
                        operations
                    },
                    activeValue: value
                });

                showMessage(`${value} inserido com sucesso.`, "success");
                break;
            }

            current = current.left;
        } else if (value > current.value) {
            if (!current.right) {
                current.right = createNode(value);

                addStep(workingTree, `${value} foi inserido à direita de ${current.value}.`, {
                    operations,
                    operation: "Inserção",
                    target: value,
                    current: current.value,
                    comparison: `${value} > ${current.value}`,
                    variables: {
                        current: current.value,
                        parent: parent.value,
                        inserted: value,
                        position: "right",
                        operations
                    },
                    activeValue: value
                });

                showMessage(`${value} inserido com sucesso.`, "success");
                break;
            }

            current = current.right;
        } else {
            addStep(workingTree, `O valor ${value} já existe. Valores duplicados não são inseridos.`, {
                operations,
                operation: "Inserção",
                target: value,
                current: current.value,
                comparison: `${value} = ${current.value}`,
                variables: {
                    current: current.value,
                    parent: parent.value,
                    duplicate: true,
                    operations
                },
                activeValue: current.value
            });

            showMessage(`${value} já existe na árvore.`, "error");
            break;
        }
    }

    root = workingTree;
    startSimulation("Inserção");
}

// ---------------------------------------------------------------------
// OPERAÇÃO: BUSCAR
// ---------------------------------------------------------------------

function searchValue(value) {
    steps = [];
    let operations = 0;
    let current = cloneTree(root);

    addStep(current, `Iniciando a busca pelo valor ${value}.`, {
        operation: "Busca",
        target: value,
        variables: {
            current: "raiz",
            target: value,
            operations: 0
        }
    });

    while (current) {
        operations++;

        addStep(root, `Comparando ${value} com o nó ${current.value}.`, {
            operations,
            operation: "Busca",
            target: value,
            current: current.value,
            comparison: `${value} ${value < current.value ? "<" : value > current.value ? ">" : "="} ${current.value}`,
            variables: {
                current: current.value,
                target: value,
                operations
            },
            activeValue: current.value
        });

        if (value === current.value) {
            addStep(root, `Valor ${value} encontrado na árvore.`, {
                operations,
                operation: "Busca",
                target: value,
                current: current.value,
                comparison: `${value} = ${current.value}`,
                variables: {
                    current: current.value,
                    target: value,
                    found: true,
                    operations
                },
                foundValue: value
            });

            showMessage(`Valor ${value} encontrado.`, "success");
            startSimulation("Busca");
            return;
        }

        current = value < current.value ? current.left : current.right;
    }

    addStep(root, `Valor ${value} não encontrado. A busca chegou a uma referência vazia.`, {
        operations,
        operation: "Busca",
        target: value,
        comparison: "current = null",
        variables: {
            current: null,
            target: value,
            found: false,
            operations
        }
    });

    showMessage(`Valor ${value} não encontrado.`, "error");
    startSimulation("Busca");
}

// ---------------------------------------------------------------------
// OPERAÇÃO: REMOVER
// ---------------------------------------------------------------------

function deleteValue(value) {
    steps = [];
    let operations = 0;

    const workingTree = cloneTree(root);

    addStep(workingTree, `Iniciando a remoção do valor ${value}.`, {
        operation: "Remoção",
        target: value,
        variables: {
            current: "raiz",
            parent: null,
            target: value,
            operations: 0
        }
    });

    let parent = null;
    let current = workingTree;

    while (current && current.value !== value) {
        operations++;

        addStep(workingTree, `Procurando ${value}: analisando o nó ${current.value}.`, {
            operations,
            operation: "Remoção",
            target: value,
            current: current.value,
            comparison: `${value} ${value < current.value ? "<" : ">"} ${current.value}`,
            variables: {
                current: current.value,
                parent: parent ? parent.value : null,
                target: value,
                operations
            },
            activeValue: current.value
        });

        parent = current;
        current = value < current.value ? current.left : current.right;
    }

    if (!current) {
        addStep(workingTree, `O valor ${value} não existe. Nada foi removido.`, {
            operations,
            operation: "Remoção",
            target: value,
            current: null,
            comparison: "current = null",
            variables: {
                current: null,
                parent: parent ? parent.value : null,
                target: value,
                removed: false,
                operations
            }
        });

        root = workingTree;
        showMessage(`Valor ${value} não encontrado para remoção.`, "error");
        startSimulation("Remoção");
        return;
    }

    operations++;

    addStep(workingTree, `Valor ${value} encontrado. Verificando seus filhos.`, {
        operations,
        operation: "Remoção",
        target: value,
        current: current.value,
        comparison: "Valor encontrado",
        variables: {
            current: current.value,
            parent: parent ? parent.value : null,
            hasLeft: Boolean(current.left),
            hasRight: Boolean(current.right),
            operations
        },
        activeValue: current.value
    });

    // Caso 1: nó folha ou nó com apenas um filho.
    if (!current.left || !current.right) {
        const child = current.left || current.right;

        if (!parent) {
            root = child;
        } else if (parent.left === current) {
            parent.left = child;
        } else {
            parent.right = child;
        }

        const updatedTree = parent ? workingTree : child;

        addStep(updatedTree, `Nó ${value} removido. Ele tinha zero ou um filho.`, {
            operations,
            operation: "Remoção",
            target: value,
            current: child ? child.value : null,
            comparison: "Remoção por substituição pelo filho",
            variables: {
                current: child ? child.value : null,
                parent: parent ? parent.value : null,
                removed: value,
                replacement: child ? child.value : null,
                operations
            },
            activeValue: child ? child.value : null
        });

        root = updatedTree;
    } else {
        // Caso 2: nó com dois filhos.
        let successorParent = current;
        let successor = current.right;

        addStep(workingTree, `O nó ${value} possui dois filhos. Procurando seu sucessor em ordem.`, {
            operations,
            operation: "Remoção",
            target: value,
            current: successor.value,
            comparison: "Iniciando pela subárvore direita",
            variables: {
                current: successor.value,
                parent: current.value,
                successor: successor.value,
                operations
            },
            activeValue: successor.value
        });

        while (successor.left) {
            operations++;

            successorParent = successor;
            successor = successor.left;

            addStep(workingTree, `Avançando à esquerda para encontrar o sucessor: ${successor.value}.`, {
                operations,
                operation: "Remoção",
                target: value,
                current: successor.value,
                comparison: "Procurando o menor valor da subárvore direita",
                variables: {
                    current: successor.value,
                    successor: successor.value,
                    successorParent: successorParent.value,
                    operations
                },
                activeValue: successor.value
            });
        }

        const oldValue = current.value;
        current.value = successor.value;

        if (successorParent === current) {
            successorParent.right = successor.right;
        } else {
            successorParent.left = successor.right;
        }

        addStep(workingTree, `O valor ${oldValue} foi substituído pelo sucessor ${successor.value}.`, {
            operations,
            operation: "Remoção",
            target: value,
            current: current.value,
            comparison: "Substituição pelo sucessor em ordem",
            variables: {
                current: current.value,
                successor: successor.value,
                successorParent: successorParent.value,
                removed: oldValue,
                operations
            },
            activeValue: current.value
        });

        root = workingTree;
    }

    showMessage(`Valor ${value} removido com sucesso.`, "success");
    startSimulation("Remoção");
}

// ---------------------------------------------------------------------
// OPERAÇÕES: TRAVESSIAS
// ---------------------------------------------------------------------

function runTraversal(type) {
    steps = [];
    let operations = 0;
    const values = [];

    const names = {
        inorder: "Em ordem",
        preorder: "Pré-ordem",
        postorder: "Pós-ordem"
    };

    addStep(root, `Iniciando a travessia ${names[type]}.`, {
        operation: names[type],
        variables: {
            current: "raiz",
            result: [],
            operations: 0
        }
    });

    function visit(node) {
        if (!node) return;

        if (type === "preorder") {
            operations++;
            values.push(node.value);
            addTraversalStep(node);
        }

        visit(node.left);

        if (type === "inorder") {
            operations++;
            values.push(node.value);
            addTraversalStep(node);
        }

        visit(node.right);

        if (type === "postorder") {
            operations++;
            values.push(node.value);
            addTraversalStep(node);
        }
    }

    function addTraversalStep(node) {
        addStep(root, `Visitando o nó ${node.value}. Resultado parcial: ${formatArray(values)}.`, {
            operations,
            operation: names[type],
            current: node.value,
            comparison: "Nó visitado",
            variables: {
                current: node.value,
                result: [...values],
                operations
            },
            activeValue: node.value
        });
    }

    visit(root);

    addStep(root, `Travessia concluída. Resultado: ${formatArray(values)}.`, {
        operations,
        operation: names[type],
        comparison: "Fim da travessia",
        variables: {
            current: null,
            result: [...values],
            operations
        }
    });

    showMessage(`${names[type]}: ${formatArray(values)}`, "success");
    startSimulation(names[type]);
}

// ---------------------------------------------------------------------
// OPERAÇÃO: ALTURA
// ---------------------------------------------------------------------

function calculateHeightStepByStep() {
    steps = [];
    let operations = 0;

    addStep(root, "Iniciando o cálculo da altura da árvore.", {
        operation: "Altura",
        variables: {
            current: "raiz",
            operations: 0
        }
    });

    function calculate(node) {
        if (!node) {
            return -1;
        }

        operations++;

        addStep(root, `Visitando o nó ${node.value} para calcular sua altura.`, {
            operations,
            operation: "Altura",
            current: node.value,
            comparison: "Calculando alturas das subárvores",
            variables: {
                current: node.value,
                operations
            },
            activeValue: node.value
        });

        const leftHeight = calculate(node.left);
        const rightHeight = calculate(node.right);
        const result = 1 + Math.max(leftHeight, rightHeight);

        addStep(root, `Altura calculada para o nó ${node.value}: ${result}.`, {
            operations,
            operation: "Altura",
            current: node.value,
            comparison: `1 + max(${leftHeight}, ${rightHeight}) = ${result}`,
            variables: {
                current: node.value,
                leftHeight,
                rightHeight,
                calculatedHeight: result,
                operations
            },
            activeValue: node.value
        });

        return result;
    }

    const height = calculate(root);

    addStep(root, `Cálculo concluído. Altura da árvore: ${height}.`, {
        operations,
        operation: "Altura",
        comparison: `Altura final = ${height}`,
        variables: {
            current: null,
            calculatedHeight: height,
            operations
        }
    });

    showMessage(`Altura da árvore: ${height}.`, "success");
    startSimulation("Cálculo da altura");
}

// ---------------------------------------------------------------------
// CENÁRIOS PRÉ-CONFIGURADOS
// ---------------------------------------------------------------------

function loadScenario(values, name) {
    stopPlayback();

    root = null;
    steps = [];
    currentStep = 0;

    for (const value of values) {
        const newNode = createNode(value);

        if (!root) {
            root = newNode;
            continue;
        }

        let current = root;

        while (true) {
            if (value < current.value) {
                if (!current.left) {
                    current.left = newNode;
                    break;
                }

                current = current.left;
            } else if (value > current.value) {
                if (!current.right) {
                    current.right = newNode;
                    break;
                }

                current = current.right;
            } else {
                break;
            }
        }
    }

    initialTree = cloneTree(root);
    initialScenarioName = name;

    renderTree(root);
    updateInformation(root, 0);

    elements.scenarioStatus.textContent = `Cenário carregado: ${name}`;
    elements.simulationStatus.textContent = "Cenário carregado";
    elements.stepDescription.textContent =
        "Cenário pronto. Escolha uma operação para acompanhar sua execução.";

    elements.stepCounter.textContent = "Passo 0 de 0";
    elements.stepPercentage.textContent = "0%";
    elements.progressBar.style.width = "0%";

    elements.variables.textContent = "Aguardando execução...";
    elements.stateOperation.textContent = "Nenhuma";
    elements.stateTarget.textContent = "-";
    elements.stateCurrent.textContent = "-";
    elements.stateComparison.textContent = "-";

    elements.next.disabled = true;

    showMessage(`${name} carregado com sucesso.`, "success");
}

function loadMediumCase() {
    loadScenario(
        [50, 30, 70, 20, 40, 60, 80],
        "Caso Médio"
    );
}

function loadWorstCase() {
    loadScenario(
        [10, 20, 30, 40, 50, 60, 70],
        "Pior Caso"
    );
}

function loadEdgeCase() {
    loadScenario(
        [],
        "Caso de Borda"
    );
}

// ---------------------------------------------------------------------
// LIMPAR ÁRVORE E ENTRADA
// ---------------------------------------------------------------------

function clearTree() {
    stopPlayback();

    root = null;
    initialTree = null;
    steps = [];
    currentStep = 0;
    initialScenarioName = "Modo personalizado";

    elements.scenarioStatus.textContent =
        "Modo personalizado: monte sua própria árvore.";

    elements.simulationStatus.textContent = "Árvore limpa";
    elements.stepDescription.textContent =
        "Insira valores ou carregue um cenário.";

    elements.stepCounter.textContent = "Passo 0 de 0";
    elements.stepPercentage.textContent = "0%";
    elements.progressBar.style.width = "0%";

    elements.variables.textContent = "Aguardando execução...";
    elements.stateOperation.textContent = "Nenhuma";
    elements.stateTarget.textContent = "-";
    elements.stateCurrent.textContent = "-";
    elements.stateComparison.textContent = "-";
    elements.next.disabled = true;

    renderTree(root);
    updateInformation(root, 0);

    showMessage("Árvore limpa. Modo personalizado ativado.");
}

// ---------------------------------------------------------------------
// EVENTOS DOS BOTÕES
// ---------------------------------------------------------------------

function getIntegerInput() {
    const value = elements.input.value.trim();

    if (value === "") {
        showMessage("Digite um valor inteiro.", "error");
        elements.input.focus();
        return null;
    }

    const number = Number(value);

    if (!Number.isSafeInteger(number)) {
        showMessage("Digite um número inteiro válido.", "error");
        elements.input.focus();
        return null;
    }

    return number;
}

document.getElementById("insert-button").addEventListener("click", () => {
    const value = getIntegerInput();
    if (value !== null) insertValue(value);
});

document.getElementById("search-button").addEventListener("click", () => {
    const value = getIntegerInput();
    if (value !== null) searchValue(value);
});

document.getElementById("delete-button").addEventListener("click", () => {
    const value = getIntegerInput();
    if (value !== null) deleteValue(value);
});

document.getElementById("inorder-button").addEventListener("click", () => {
    runTraversal("inorder");
});

document.getElementById("preorder-button").addEventListener("click", () => {
    runTraversal("preorder");
});

document.getElementById("postorder-button").addEventListener("click", () => {
    runTraversal("postorder");
});

document.getElementById("height-button").addEventListener("click", () => {
    calculateHeightStepByStep();
});

document.getElementById("clear-button").addEventListener("click", clearTree);

document.getElementById("medium-button").addEventListener("click", loadMediumCase);
document.getElementById("worst-button").addEventListener("click", loadWorstCase);
document.getElementById("edge-button").addEventListener("click", loadEdgeCase);

elements.play.addEventListener("click", playSimulation);
elements.next.addEventListener("click", nextStep);
elements.pause.addEventListener("click", pauseSimulation);
elements.reset.addEventListener("click", resetSimulation);

elements.input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        const value = getIntegerInput();
        if (value !== null) insertValue(value);
    }
});

// ---------------------------------------------------------------------
// INICIALIZAÇÃO
// ---------------------------------------------------------------------

function initialize() {
    root = null;
    initialTree = null;

    renderTree(root);
    updateInformation(root, 0);

    elements.next.disabled = true;
    elements.pause.disabled = true;

    elements.variables.textContent = "Aguardando execução...";
    elements.scenarioStatus.textContent =
        "Modo personalizado: monte sua própria árvore.";

    showMessage("Simulador iniciado. Escolha um cenário ou insira valores.");
}

initialize();
