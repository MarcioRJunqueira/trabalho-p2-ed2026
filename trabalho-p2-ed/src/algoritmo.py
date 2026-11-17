# Implementação do algoritmo

class Node:
    """
    Representa um nó da Árvore de Busca Binária.

    Attributes:
        value: Valor armazenado no nó.
        left: Referência ao filho esquerdo.
        right: Referência ao filho direito.
    """

    def __init__(self, value: int) -> None:
        self.value: int = value
        self.left: Node | None = None
        self.right: Node | None = None


class BST:
    """
    Implementa uma Árvore de Busca Binária.

    Valores menores ficam à esquerda e valores maiores
    ficam à direita.

    A classe implementa inserção, busca, remoção,
    travessias e cálculo de altura.
    """

    def __init__(self) -> None:
        self.root: Node | None = None
        self.operations: int = 0

    # --------------------------------------------------------
    # INSERÇÃO
    # --------------------------------------------------------

    def insert(self, value: int) -> bool:
        """
        Insere um valor na árvore.

        Duplicatas não são permitidas.

        Args:
            value: Valor inteiro a ser inserido.

        Returns:
            True se inserido, False se já existir.
        """

        if self.root is None:
            self.root = Node(value)
            self.operations += 1
            return True

        current = self.root

        while True:
            self.operations += 1

            if value == current.value:
                return False

            elif value < current.value:
                if current.left is None:
                    current.left = Node(value)
                    return True

                current = current.left

            else:
                if current.right is None:
                    current.right = Node(value)
                    return True

                current = current.right

    # --------------------------------------------------------
    # BUSCA
    # --------------------------------------------------------

    def search(self, value: int) -> bool:
        """
        Procura um valor na árvore.

        Args:
            value: Valor que será procurado.

        Returns:
            True se encontrado, False caso contrário.
        """

        current = self.root

        while current is not None:
            self.operations += 1

            if value == current.value:
                return True

            elif value < current.value:
                current = current.left

            else:
                current = current.right

        return False

    # --------------------------------------------------------
    # REMOÇÃO
    # --------------------------------------------------------

    def delete(self, value: int) -> bool:
        """
        Remove um valor da árvore.

        Trata três situações:
        1. Nó sem filhos.
        2. Nó com apenas um filho.
        3. Nó com dois filhos.

        Returns:
            True se removido, False se não encontrado.
        """

        parent: Node | None = None
        current = self.root

        # Localiza o elemento.
        while current is not None:
            self.operations += 1

            if value == current.value:
                break

            parent = current

            if value < current.value:
                current = current.left
            else:
                current = current.right

        if current is None:
            return False

        # Caso 1: nó com dois filhos.
        if current.left is not None and current.right is not None:

            successor_parent = current
            successor = current.right

            # Encontra o menor elemento da subárvore direita.
            while successor.left is not None:
                self.operations += 1
                successor_parent = successor
                successor = successor.left

            # Substitui o valor pelo sucessor.
            current.value = successor.value

            # Remove o sucessor de sua posição original.
            if successor_parent == current:
                successor_parent.right = successor.right
            else:
                successor_parent.left = successor.right

        else:
            # Caso 2: nó com um filho ou sem filhos.
            if current.left is not None:
                child = current.left
            else:
                child = current.right

            if parent is None:
                self.root = child

            elif parent.left == current:
                parent.left = child

            else:
                parent.right = child

        return True

    # --------------------------------------------------------
    # TRAVESSIAS
    # --------------------------------------------------------

    def in_order(self) -> list[int]:
        """
        Percorre a árvore: esquerda, raiz e direita.

        Returns:
            Lista de valores em ordem crescente.
        """

        result: list[int] = []

        def traverse(node: Node | None) -> None:
            if node is not None:
                self.operations += 1
                traverse(node.left)
                result.append(node.value)
                traverse(node.right)

        traverse(self.root)
        return result

    def pre_order(self) -> list[int]:
        """
        Percorre a árvore: raiz, esquerda e direita.

        Returns:
            Lista de valores em pré-ordem.
        """

        result: list[int] = []

        def traverse(node: Node | None) -> None:
            if node is not None:
                self.operations += 1
                result.append(node.value)
                traverse(node.left)
                traverse(node.right)

        traverse(self.root)
        return result

    def post_order(self) -> list[int]:
        """
        Percorre a árvore: esquerda, direita e raiz.

        Returns:
            Lista de valores em pós-ordem.
        """

        result: list[int] = []

        def traverse(node: Node | None) -> None:
            if node is not None:
                self.operations += 1
                traverse(node.left)
                traverse(node.right)
                result.append(node.value)

        traverse(self.root)
        return result

    # --------------------------------------------------------
    # ALTURA
    # --------------------------------------------------------

    def height(self) -> int:
        """
        Calcula a altura da árvore.

        Árvore vazia: -1.
        Árvore com apenas a raiz: 0.

        Returns:
            Número de arestas do maior caminho da raiz
            até uma folha.
        """

        def calculate(node: Node | None) -> int:
            if node is None:
                return -1

            self.operations += 1

            left_height = calculate(node.left)
            right_height = calculate(node.right)

            return 1 + max(left_height, right_height)

        return calculate(self.root)

    # --------------------------------------------------------
    # VISUALIZAÇÃO NO TERMINAL
    # --------------------------------------------------------

    def display(self) -> None:
        """
        Exibe a estrutura da árvore no terminal.

        Mostra os nós e suas conexões de maneira hierárquica.
        """

        if self.root is None:
            print("\nÁrvore vazia!")
            return

        def draw(node: Node | None, prefix: str, is_left: bool) -> None:
            if node is None:
                return

            print(prefix + ("├── " if is_left else "└── ") + str(node.value))

            children_prefix = prefix + ("│   " if is_left else "    ")

            if node.left is not None or node.right is not None:
                if node.left is not None:
                    draw(node.left, children_prefix, True)

                if node.right is not None:
                    draw(node.right, children_prefix, False)

        print(f"\nRaiz: {self.root.value}")

        if self.root.left is not None:
            draw(self.root.left, "", True)

        if self.root.right is not None:
            draw(self.root.right, "", False)

    # --------------------------------------------------------
    # CONTADOR DE OPERAÇÕES
    # --------------------------------------------------------

    def reset_operations(self) -> None:
        """Reinicia o contador de operações."""

        self.operations = 0


# ============================================================
# INTERFACE DE TERMINAL
# ============================================================


def main() -> None:
    """
    Executa o menu interativo da Árvore de Busca Binária.

    Permite ao usuário criar e manipular sua própria árvore.
    O programa continua em execução até a opção de saída.
    """

    bst = BST()

    while True:

        print("\n===================================")
        print("       ÁRVORE DE BUSCA BINÁRIA")
        print("===================================")
        print("1 - Inserir elemento")
        print("2 - Buscar elemento")
        print("3 - Remover elemento")
        print("4 - Visualizar árvore")
        print("5 - Exibir travessias")
        print("6 - Calcular altura")
        print("7 - Exibir operações")
        print("8 - Reiniciar contador")
        print("0 - Sair")
        print("===================================")

        option = input("Escolha uma opção: ").strip()

        # INSERIR
        if option == "1":

            try:
                value = int(input("Digite o valor para inserir: "))

                bst.reset_operations()
                result = bst.insert(value)

                if result:
                    print(f"\nValor {value} inserido com sucesso!")
                else:
                    print(f"\nO valor {value} já existe na árvore.")

                print("Operações realizadas:", bst.operations)

            except ValueError:
                print("\nDigite um número inteiro válido!")

        # BUSCAR
        elif option == "2":

            try:
                value = int(input("Digite o valor que deseja buscar: "))

                bst.reset_operations()
                result = bst.search(value)

                if result:
                    print(f"\nValor {value} encontrado!")
                else:
                    print(f"\nValor {value} não encontrado.")

                print("Operações realizadas:", bst.operations)

            except ValueError:
                print("\nDigite um número inteiro válido!")

        # REMOVER
        elif option == "3":

            try:
                value = int(input("Digite o valor que deseja remover: "))

                bst.reset_operations()
                result = bst.delete(value)

                if result:
                    print(f"\nValor {value} removido com sucesso!")
                else:
                    print(f"\nValor {value} não encontrado.")

                print("Operações realizadas:", bst.operations)

            except ValueError:
                print("\nDigite um número inteiro válido!")

        # VISUALIZAR
        elif option == "4":

            bst.display()

        # TRAVESSIAS
        elif option == "5":

            bst.reset_operations()
            print("\nIn-order:", bst.in_order())

            bst.reset_operations()
            print("Pre-order:", bst.pre_order())

            bst.reset_operations()
            print("Post-order:", bst.post_order())

        # ALTURA
        elif option == "6":

            bst.reset_operations()
            result = bst.height()

            print("\nAltura da árvore:", result)
            print("Operações realizadas:", bst.operations)

        # CONTADOR
        elif option == "7":

            print("\nTotal de operações desde o último reinício:",
                  bst.operations)

        # REINICIAR CONTADOR
        elif option == "8":

            bst.reset_operations()
            print("\nContador reiniciado com sucesso!")

        # SAIR
        elif option == "0":

            print("\nEncerrando o programa...")
            break

        else:
            print("\nOpção inválida! Tente novamente.")


# ============================================================
# EXECUÇÃO PRINCIPAL
# ============================================================

if __name__ == "__main__":
    main()
  
# ------------------------------------------------------------
# CENÁRIO 1: CASO COMUM
#
# Objetivo:
# Testar inserção, busca, remoção, travessias e altura.
#
# bst = BST()
#
# valores = [50, 30, 70, 20, 40, 60, 80]
#
# for valor in valores:
#     bst.insert(valor)
#
# print("Árvore:")
# bst.display()
#
# bst.reset_operations()
# print("Busca 40:", bst.search(40))
# print("Operações:", bst.operations)
#
# bst.reset_operations()
# print("Remoção 30:", bst.delete(30))
# print("Operações:", bst.operations)
#
# print("In-order:", bst.in_order())
# print("Pre-order:", bst.pre_order())
# print("Post-order:", bst.post_order())
# print("Altura:", bst.height())


# ------------------------------------------------------------
# CENÁRIO 2: CASO DE BORDA
#
# Objetivo:
# Testar árvore vazia, elemento duplicado e remoções
# de elementos inexistentes.
#
# bst = BST()
#
# print("Busca em árvore vazia:", bst.search(10))
# print("Remoção em árvore vazia:", bst.delete(10))
# print("Altura:", bst.height())
#
# bst.insert(50)
# bst.insert(50)
#
# print("Árvore com elemento duplicado:", bst.in_order())
#
# print("Remoção de elemento inexistente:", bst.delete(100))
#
# print("Remoção da raiz:", bst.delete(50))
# print("Árvore após remoção:", bst.in_order())


# ------------------------------------------------------------
# CENÁRIO 3: PIOR CASO
#
# Objetivo:
# Demonstrar uma árvore degenerada por meio da inserção
# de elementos em ordem crescente.
#
# bst = BST()
#
# valores = [10, 20, 30, 40, 50, 60, 70]
#
# for valor in valores:
#     bst.insert(valor)
#
# print("Árvore degenerada:")
# bst.display()
#
# bst.reset_operations()
# print("Busca 70:", bst.search(70))
# print("Operações de busca:", bst.operations)
#
# bst.reset_operations()
# print("Altura:", bst.height())
# print("Operações para calcular altura:", bst.operations)
