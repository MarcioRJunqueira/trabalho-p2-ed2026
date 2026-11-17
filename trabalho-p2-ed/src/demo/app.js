
const $ = id => document.getElementById(id);

let root = null;
let steps = [];
let currentStep = 0;
let playbackTimer = null;
let scenarioName = "Exemplo Customizado";

const speed = 900;

function createNode(value) {
    return { value, left: null, right: null };
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

function height(node) {
    if (!node) return -1;

    return 1 + Math.max(
        height(node.left),
        height(node.right)
    );
}

function traversals(node) {
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

function formatValues(values) {
    return values.length ? values.join(" → ") : "-";
}

function showMessage(message, type = "") {
    $("result-message").textContent = message;
    $("result-message").className = "message";

    if (type) {
        $("result-message").classList.add(type);
    }
}

// ------------------------------------------------------------------
// ÁRVORE E DESENHO
// ------------------------------------------------------------------

function getPositions(tree) {
    const positions = [];
    let index = 0;
    let maxDepth = 0;

    function visit(node, depth) {
        if (!node) return;

        maxDepth = Math.max(maxDepth, depth);
        visit(node.left, depth + 1);

        positions.push({
            node,
            x: 55 + index * 76,
            y: 55 + depth * 85
        });

        index++;
        visit(node.right, depth + 1);
    }

    visit(tree, 0);

    return {
        positions,
        width: Math.max(600, 110 + positions.length * 76),
        height: Math.max(390, 110 + (maxDepth + 1) * 85)
    };
}

function svgElement(tag, attributes) {
    const element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        tag
    );

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;
}

function renderTree(tree, activeValue = null, foundValue = null) {
    const svg = $("tree-svg");
    const emptyMessage = $("empty-message");

    svg.innerHTML = "";

    if (!tree) {
        emptyMessage.style.display = "block";
        svg.setAttribute("viewBox", "0 0 600 390");
        svg.style.width = "600px";
        svg.style.height = "390px";
        return;
    }

    emptyMessage.style.display = "none";

    const layout = getPositions(tree);
    const map = new Map();

    layout.positions.forEach(item => map.set(item.node, item));

    svg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
    svg.style.width = `${layout.width}px`;
    svg.style.height = `${layout.height}px`;

    // Ligações entre os nós.
    layout.positions.forEach(item => {
        [item.node.left, item.node.right].forEach(child => {
            if (!child) return;

            const childPosition = map.get(child);

            svg.appendChild(svgElement("line", {
                x1: item.x,
                y1: item.y,
                x2: childPosition.x,
                y2: childPosition.y,
                stroke: "#64748b",
                "stroke-width": 2
            }));
        });
    });

    // Nós e seus valores.
    layout.positions.forEach(item => {
        const value = item.node.value;

        let color = "#2563eb";
        if (value === activeValue) color = "#d97706";
        if (value === foundValue) color = "#16a34a";

        svg.appendChild(svgElement("circle", {
            cx: item.x,
            cy: item.y,
            r: 23,
            fill: color,
            stroke: "#bfdbfe",
            "stroke-width": 2
        }));

        const text = svgElement("text", {
            x: item.x,
            y: item.y + 5,
            fill: "#ffffff",
            "font-size": 13,
            "font-weight": "bold",
            "text-anchor": "middle"
        });

        text.textContent = value;
        svg.appendChild(text);
    });
}

function updateInformation(tree, operations = 0) {
    $("node-count").textContent = countNodes(tree);
    $("tree-height").textContent = height(tree);
    $("operation-count").textContent = operations;

    $("tree-status").textContent = `${countNodes(tree)} nó(s)`;

    const result = traversals(tree);

    $("inorder-result").textContent = formatValues(result.inorder);
    $("preorder-result").textContent = formatValues(result.preorder);
    $("postorder-result").textContent = formatValues(result.postorder);
}

// ------------------------------------------------------------------
// ETAPAS DA SIMULAÇÃO
// ------------------------------------------------------------------

function addStep(tree, description, data = {}) {
    steps.push({
        tree: cloneTree(tree),
        description,
        operations: data.operations ?? 0,
        operation: data.operation ?? "Nenhuma",
        target: data.target ?? null,
        current: data.current ?? null,
        comparison: data.comparison ?? "-",
        variables: data.variables ?? {},
        activeValue: data.activeValue ?? null,
        foundValue: data.foundValue ?? null
    });
}

function stopPlayback() {
    if (playbackTimer !== null) {
        clearInterval(playbackTimer);
        playbackTimer = null;
    }

    $("play-button").disabled = false;
    $("pause-button").disabled = true;
}

function showStep(index) {
    if (!steps.length) return;

    currentStep = Math.max(0, Math.min(index, steps.length - 1));

    const step = steps[currentStep];

    root = cloneTree(step.tree);

    renderTree(root, step.activeValue, step.foundValue);
    updateInformation(root, step.operations);

    $("step-description").textContent = step.description;
    $("step-counter").textContent =
        `Passo ${currentStep + 1} de ${steps.length}`;

    const percentage = Math.round(
        ((currentStep + 1) / steps.length) * 100
    );

    $("step-percentage").textContent = `${percentage}%`;
    $("progress-bar").style.width = `${percentage}%`;

    $("state-operation").textContent = step.operation;
    $("state-target").textContent = step.target ?? "-";
    $("state-current").textContent = step.current ?? "-";
    $("state-comparison").textContent = step.comparison;

    $("variables-box").textContent =
        JSON.stringify(step.variables, null, 2);

    if (currentStep === steps.length - 1) {
        $("simulation-status").textContent = "Simulação concluída";
        $("next-step-button").disabled = true;
        stopPlayback();
    } else {
        $("next-step-button").disabled = false;
        $("simulation-status").textContent = "Simulação em andamento";
    }
}

function startSimulation(name) {
    stopPlayback();

    if (!steps.length) {
        addStep(root, "Nenhuma etapa foi gerada.");
    }

    currentStep = 0;
    $("simulation-status").textContent = name;
    showStep(0);
}

function nextStep() {
    if (!steps.length) {
        showMessage("Execute uma operação primeiro.", "error");
        return;
    }

    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    }
}

function playSimulation() {
    if (!steps.length) {
        showMessage("Execute uma operação antes de iniciar.", "error");
        return;
    }

    if (currentStep >= steps.length - 1) {
        showMessage("A simulação já foi concluída.", "success");
        return;
    }

    if (playbackTimer !== null) return;

    $("play-button").disabled = true;
    $("pause-button").disabled = false;
    $("simulation-status").textContent = "Executando automaticamente";

    playbackTimer = setInterval(() => {
        if (currentStep >= steps.length - 1) {
            stopPlayback();
            return;
        }

        showStep(currentStep + 1);
    }, speed);
}

function pauseSimulation() {
    if (playbackTimer === null) return;

    stopPlayback();
    $("simulation-status").textContent = "Simulação pausada";
    showMessage("Execução pausada. Você pode continuar ou avançar manualmente.");
}

function resetSimulation() {
    stopPlayback();

    if (!steps.length) {
        showMessage("Não há uma simulação para reiniciar.", "error");
        return;
    }

    showStep(0);
    $("simulation-status").textContent = "Simulação reiniciada";
    showMessage("Simulação voltou ao primeiro passo.", "success");
}

// ------------------------------------------------------------------
// OPERAÇÃO: INSERÇÃO
// ------------------------------------------------------------------

function insertValue(value) {
    stopPlayback();
    steps = [];

    const tree = cloneTree(root);
    let operations = 0;

    addStep(tree, `Iniciando a inserção de ${value}.`, {
        operation: "Inserção",
        target: value,
        variables: { current: "raiz", value, operations }
    });

    if (!tree) {
        root = createNode(value);
        operations = 1;

        addStep(root, `${value} foi inserido como raiz da árvore.`, {
            operation: "Inserção",
            target: value,
            current: value,
            operations,
            comparison: "Árvore vazia: nenhuma comparação necessária",
            variables: { current: value, parent: null, operations },
            activeValue: value
        });

        showMessage(`${value} inserido como raiz.`, "success");
        startSimulation("Inserção");
        return;
    }

    let current = tree;
    let parent = null;

    while (current) {
        operations++;
        parent = current;

        addStep(tree, `Analisando o nó ${current.value}.`, {
            operation: "Inserção",
            target: value,
            current: current.value,
            operations,
            comparison: `${value} ${value < current.value ? "<" : value > current.value ? ">" : "="} ${current.value}`,
            variables: {
                current: current.value,
                parent: parent.value,
                value,
                operations
            },
            activeValue: current.value
        });

        if (value === current.value) {
            addStep(tree, `O valor ${value} já existe. Duplicatas não são inseridas.`, {
                operation: "Inserção",
                target: value,
                current: current.value,
                operations,
                comparison: `${value} = ${current.value}`,
                variables: {
                    current: current.value,
                    parent: parent.value,
                    duplicate: true,
                    operations
                },
                activeValue: current.value
            });

            root = tree;
            showMessage(`${value} já existe na árvore.`, "error");
            startSimulation("Inserção");
            return;
        }

        if (value < current.value) {
            if (!current.left) {
                current.left = createNode(value);
                break;
            }
            current = current.left;
        } else {
            if (!current.right) {
                current.right = createNode(value);
                break;
            }
            current = current.right;
        }
    }

    root = tree;

    addStep(root, `${value} foi inserido na posição correta.`, {
        operation: "Inserção",
        target: value,
        current: value,
        operations,
        comparison: value < parent.value
            ? `${value} < ${parent.value}: filho esquerdo`
            : `${value} > ${parent.value}: filho direito`,
        variables: {
            current: value,
            parent: parent.value,
            inserted: value,
            operations
        },
        activeValue: value
    });

    showMessage(`${value} inserido com sucesso.`, "success");
    startSimulation("Inserção");
}

// ------------------------------------------------------------------
// OPERAÇÃO: BUSCA
// ------------------------------------------------------------------

function searchValue(value) {
    stopPlayback();
    steps = [];

    let current = cloneTree(root);
    let operations = 0;

    addStep(root, `Iniciando a busca por ${value}.`, {
        operation: "Busca",
        target: value,
        variables: { current: "raiz", target: value, operations }
    });

    while (current) {
        operations++;

        addStep(root, `Comparando ${value} com ${current.value}.`, {
            operation: "Busca",
            target: value,
            current: current.value,
            operations,
            comparison: `${value} ${value < current.value ? "<" : value > current.value ? ">" : "="} ${current.value}`,
            variables: {
                current: current.value,
                target: value,
                operations
            },
            activeValue: current.value
        });

        if (value === current.value) {
            addStep(root, `Valor ${value} encontrado!`, {
                operation: "Busca",
                target: value,
                current: current.value,
                operations,
                comparison: `${value} = ${current.value}`,
                variables: {
                    current: current.value,
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
        operation: "Busca",
        target: value,
        current: null,
        operations,
        comparison: "current = null",
        variables: { current: null, found: false, operations }
    });

    showMessage(`Valor ${value} não encontrado.`, "error");
    startSimulation("Busca");
}

// ------------------------------------------------------------------
// OPERAÇÃO: REMOÇÃO
// ------------------------------------------------------------------

function deleteValue(value) {
    stopPlayback();
    steps = [];

    const tree = cloneTree(root);
    let operations = 0;
    let parent = null;
    let current = tree;

    addStep(tree, `Iniciando a remoção de ${value}.`, {
        operation: "Remoção",
        target: value,
        variables: { current: "raiz", parent: null, operations }
    });

    while (current && current.value !== value) {
        operations++;

        addStep(tree, `Procurando ${value}: analisando ${current.value}.`, {
            operation: "Remoção",
            target: value,
            current: current.value,
            operations,
            comparison: `${value} ${value < current.value ? "<" : ">"} ${current.value}`,
            variables: {
                current: current.value,
                parent: parent ? parent.value : null,
                operations
            },
            activeValue: current.value
        });

        parent = current;
        current = value < current.value ? current.left : current.right;
    }

    if (!current) {
        addStep(tree, `${value} não foi encontrado. Nenhum nó foi removido.`, {
            operation: "Remoção",
            target: value,
            current: null,
            operations,
            comparison: "current = null",
            variables: { current: null, removed: false, operations }
        });

        root = tree;
        showMessage(`${value} não encontrado para remoção.`, "error");
        startSimulation("Remoção");
        return;
    }

    operations++;

    addStep(tree, `Nó ${value} encontrado. Verificando seus filhos.`, {
        operation: "Remoção",
        target: value,
        current: value,
        operations,
        variables: {
            current: value,
            parent: parent ? parent.value : null,
            hasLeft: Boolean(current.left),
            hasRight: Boolean(current.right),
            operations
        },
        activeValue: value
    });

    // Caso de zero ou um filho.
    if (!current.left || !current.right) {
        const child = current.left || current.right;

        if (!parent) {
            root = child;
        } else if (parent.left === current) {
            parent.left = child;
            root = tree;
        } else {
            parent.right = child;
            root = tree;
        }

        addStep(root, `Nó ${value} removido. Caso de zero ou um filho.`, {
            operation: "Remoção",
            target: value,
            current: child ? child.value : null,
            operations,
            comparison: "Substituição pelo filho, se existir",
            variables: {
                current: child ? child.value : null,
                parent: parent ? parent.value : null,
                removed: value,
                replacement: child ? child.value : null,
                operations
            },
            activeValue: child ? child.value : null
        });
    } else {
        // Caso de dois filhos: menor nó da subárvore direita.
        let successorParent = current;
        let successor = current.right;

        addStep(tree, "Nó com dois filhos. Procurando o sucessor em ordem.", {
            operation: "Remoção",
            target: value,
            current: successor.value,
            operations,
            comparison: "Início da subárvore direita",
            variables: {
                current: successor.value,
                successor: successor.value,
                successorParent: successorParent.value,
                operations
            },
            activeValue: successor.value
        });

        while (successor.left) {
            operations++;
            successorParent = successor;
            successor = successor.left;

            addStep(tree, `Avançando à esquerda: sucessor candidato ${successor.value}.`, {
                operation: "Remoção",
                target: value,
                current: successor.value,
                operations,
                comparison: "Buscando o menor valor da subárvore direita",
                variables: {
                    current: successor.value,
                    successor: successor.value,
                    successorParent: successorParent.value,
                    operations
                },
                activeValue: successor.value
            });
        }

        const successorValue = successor.value;
        current.value = successorValue;

        if (successorParent === current) {
            successorParent.right = successor.right;
        } else {
            successorParent.left = successor.right;
        }

        root = tree;

        addStep(root, `O nó ${value} foi substituído pelo sucessor ${successorValue}.`, {
            operation: "Remoção",
            target: value,
            current: successorValue,
            operations,
            comparison: "Substituição pelo sucessor em ordem",
            variables: {
                current: current.value,
                successor: successorValue,
                successorParent: successorParent.value,
                removed: value,
                operations
            },
            activeValue: current.value
        });
    }

    showMessage(`${value} removido com sucesso.`, "success");
    startSimulation("Remoção");
}

// ------------------------------------------------------------------
// TRAVESSIAS
// ------------------------------------------------------------------

function runTraversal(type) {
    stopPlayback();
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
        variables: { current: "raiz", result: [], operations }
    });

    function record(node) {
        operations++;
        values.push(node.value);

        addStep(root, `Visitando ${node.value}. Resultado parcial: ${formatValues(values)}.`, {
            operation: names[type],
            current: node.value,
            operations,
            comparison: "Nó visitado",
            variables: {
                current: node.value,
                result: [...values],
                operations
            },
            activeValue: node.value
        });
    }

    function visit(node) {
        if (!node) return;

        if (type === "preorder") record(node);

        visit(node.left);

        if (type === "inorder") record(node);

        visit(node.right);

        if (type === "postorder") record(node);
    }

    visit(root);

    addStep(root, `Travessia concluída: ${formatValues(values)}.`, {
        operation: names[type],
        operations,
        comparison: "Fim da travessia",
        variables: {
            current: null,
            result: [...values],
            operations
        }
    });

    showMessage(`${names[type]}: ${formatValues(values)}`, "success");
    startSimulation(names[type]);
}

// ------------------------------------------------------------------
// CÁLCULO DA ALTURA
// ------------------------------------------------------------------

function calculateHeightStepByStep() {
    stopPlayback();
    steps = [];

    let operations = 0;

    addStep(root, "Iniciando o cálculo da altura.", {
        operation: "Altura",
        variables: { current: "raiz", operations }
    });

    function calculate(node) {
        if (!node) return -1;

        operations++;

        addStep(root, `Visitando o nó ${node.value}.`, {
            operation: "Altura",
            current: node.value,
            operations,
            comparison: "Calculando altura das subárvores",
            variables: {
                current: node.value,
                operations
            },
            activeValue: node.value
        });

        const leftHeight = calculate(node.left);
        const rightHeight = calculate(node.right);
        const result = 1 + Math.max(leftHeight, rightHeight);

        addStep(root, `Altura calculada para ${node.value}: ${result}.`, {
            operation: "Altura",
            current: node.value,
            operations,
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

    const result = calculate(root);

    addStep(root, `Altura final da árvore: ${result}.`, {
        operation: "Altura",
        operations,
        comparison: `Altura = ${result}`,
        variables: {
            current: null,
            calculatedHeight: result,
            operations
        }
    });

    showMessage(`Altura da árvore: ${result}.`, "success");
    startSimulation("Cálculo da altura");
}

// ------------------------------------------------------------------
// CENÁRIOS PRÉ-CONFIGURADOS
// ------------------------------------------------------------------

function loadScenario(values, name) {
    stopPlayback();

    root = null;
    steps = [];
    currentStep = 0;
    scenarioName = name;

    for (const value of values) {
        if (!root) {
            root = createNode(value);
            continue;
        }

        let current = root;

        while (true) {
            if (value < current.value) {
                if (!current.left) {
                    current.left = createNode(value);
                    break;
                }
                current = current.left;
            } else if (value > current.value) {
                if (!current.right) {
                    current.right = createNode(value);
                    break;
                }
                current = current.right;
            } else {
                break;
            }
        }
    }

    renderTree(root);
    updateInformation(root, 0);
    resetDisplay();

    $("scenario-status").textContent = `Cenário carregado: ${name}`;
    $("simulation-status").textContent = "Cenário pronto";

    showMessage(`${name} carregado. Escolha uma operação para simular.`, "success");
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

function loadCustomCase() {
    loadScenario([], "Exemplo Customizado");
    $("scenario-status").textContent =
        "Exemplo Customizado: insira os valores que desejar.";
    showMessage("Modo personalizado ativado. Monte sua própria árvore.");
}

// ------------------------------------------------------------------
// RESET VISUAL E LIMPEZA
// ------------------------------------------------------------------

function resetDisplay() {
    $("step-description").textContent =
        "Escolha uma operação para acompanhar sua execução.";

    $("step-counter").textContent = "Passo 0 de 0";
    $("step-percentage").textContent = "0%";
    $("progress-bar").style.width = "0%";

    $("state-operation").textContent = "Nenhuma";
    $("state-target").textContent = "-";
    $("state-current").textContent = "-";
    $("state-comparison").textContent = "-";

    $("variables-box").textContent = "Aguardando execução...";
    $("next-step-button").disabled = true;

    $("simulation-status").textContent = "Aguardando operação";
}

function clearTree() {
    stopPlayback();

    root = null;
    steps = [];
    currentStep = 0;
    scenarioName = "Exemplo Customizado";

    renderTree(root);
    updateInformation(root, 0);
    resetDisplay();

    $("scenario-status").textContent =
        "Exemplo Customizado: insira os valores que desejar.";

    showMessage("Árvore limpa. Você pode montar uma nova árvore.");
}

// ------------------------------------------------------------------
// ENTRADA E EVENTOS
// ------------------------------------------------------------------

function getInputValue() {
    const raw = $("value-input").value.trim();

    if (raw === "") {
        showMessage("Digite um valor inteiro.", "error");
        $("value-input").focus();
        return null;
    }

    const value = Number(raw);

    if (!Number.isSafeInteger(value)) {
        showMessage("Informe um número inteiro válido.", "error");
        $("value-input").focus();
        return null;
    }

    return value;
}

$("insert-button").addEventListener("click", () => {
    const value = getInputValue();
    if (value !== null) insertValue(value);
});

$("search-button").addEventListener("click", () => {
    const value = getInputValue();
    if (value !== null) searchValue(value);
});

$("delete-button").addEventListener("click", () => {
    const value = getInputValue();
    if (value !== null) deleteValue(value);
});

$("inorder-button").addEventListener("click", () => runTraversal("inorder"));
$("preorder-button").addEventListener("click", () => runTraversal("preorder"));
$("postorder-button").addEventListener("click", () => runTraversal("postorder"));

$("height-button").addEventListener("click", calculateHeightStepByStep);
$("clear-button").addEventListener("click", clearTree);

$("medium-button").addEventListener("click", loadMediumCase);
$("worst-button").addEventListener("click", loadWorstCase);
$("custom-button").addEventListener("click", loadCustomCase);

$("play-button").addEventListener("click", playSimulation);
$("next-step-button").addEventListener("click", nextStep);
$("pause-button").addEventListener("click", pauseSimulation);
$("reset-button").addEventListener("click", resetSimulation);

$("value-input").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        const value = getInputValue();
        if (value !== null) insertValue(value);
    }
});

// ------------------------------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------------------------------

function initialize() {
    root = null;
    steps = [];
    currentStep = 0;

    renderTree(root);
    updateInformation(root, 0);
    resetDisplay();

    $("pause-button").disabled = true;

    $("scenario-status").textContent =
        "Selecione um cenário ou monte sua própria árvore.";

    showMessage("Simulador iniciado. Escolha um dos três cenários.");
}

initialize();
