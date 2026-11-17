# Trabalho P2 - Estrutura de Dados
Aluno: Marcio Ribeiro Junqueira  
RA: 2840482521023  
Tema: TEMA B - Árvores Binárias de Busca (BST)  
Link do vídeo: Não terás gravação  

Explicação do algoritmo: A Árvore Binária de Busca (BST) tem um propósito muito simples, serve para guardar dados de forma organizada, realizar buscas, inserir novos dados e remover eles de maneira muito rápida. O algoritmo funciona da seguinte maneira, existe um nó principal no topo da árvore que é chamado de raiz, cada nó pode ter no máximo dois filhos, uma na esquerda e outro na direita. Eles seguem uma regra de ouro para sua organização, para qualquer nó da árvore o da esquerda deve ser menor que o que seu nó pai e o da direita deve ser maior que seu nó pai, não necessáriamente a raiz. Ele tem algumas operações que são: Busca, Inserção e Remoção como principal; Também tem como percurso Em Ordem, Pré-Ordem, Pós-Ordem; Por fim tem o termo height que é a altura da árvore.    

Busca: O algoritmo começa na raiz e compara o valor procurado com o valor atual, se for igual a busca termina, se for menor ele segue para o nó filho da esquerda, se for maior segue para o nó filho da direita, ignorando completamente o outro lado, cortando sua busca pela metade, repete essa lógica até encontrar o valor buscado, se não achar a busca termina.    

Inserção: Ele utiliza a mesma lógica da busca, ele vai comparando os valores e vai descendo a árvore até achar um nó vazio (um nó sem filho), ele é conectado ali como um novo nó da árvore, mantendo a regra de ordenação.    

Remoção: Ele possui algumas regras, se o nó a ser removido não tiver filhos, ele é apenas apagado, se tiver apenas um filho, o filho toma seu lugar, se tiver dois filhos, o algorimo busca o menor valor da subárvore direita ou mair da esquerda para substituí-lo e manter o equilíbrio lógico.  

Em Ordem: Segue uma sequência Esquerda -> Raiz -> Direita. Retorna os elementos em ordem crescente.  

Pré-Ordem: Segue a sequência Raiz -> Esquerda -> Direita. O nó pai é processado antes dos filhos, é usada para clonar uma árvore, usado para salvamento de arquivos.

Pós-Ordem: Segue a sequência Esquerda -> Direita -> Raiz. Nesse os filhos vem antes do pai, é ideal para deletar uma árvore inteira sem perder os ponteiros de referências, visto que ele vai limpando de baixo para cima.

Height (Altura da árvore): Calcula o comprimento do maior caminho entre a raiz e a folha mais profunda da árvore. É importante por que determina diretamente o desemprenho máximo de todas as buscas, inserções e remoções.

Utilização no mundo real: Raramente o modelo BST é usado puro, ele é adaptado para modelos mais modernos seja em Banco de Dados (SGBDs) que utilizam variação da Árvore que utilizam varios filhos por nó para criar indices, também é usado em bibliotecas padrão nas linguagens de progamação em que conjuntos e dicionário ordenado são contruídos sobre Árvoes Rubro-Negras.  

### Tabela de Complexidade (Árvore Binária de Busca Padrão)

| Operação / Métrica | Melhor Caso | Caso Médio | Pior Caso |
| :--- | :--- | :--- | :--- |
| **Busca (Search)** | O(1) ou O(log n) | O(log n) | O(n) |
| **Inserção (Insert)** | O(log n) | O(\log n) | O(n) |
| **Remoção (Delete)** | O(log n) | O(\log n) | O(n) |
| **Espaço de Armazenamento** | O(n) | O(n) | O(n) |
| **Espaço Auxiliar (Recursão)** | O(1) ou O(log n) | O(log n) | O(n) |

> **Nota:** Na busca, o melhor caso absoluto é O(1) se o elemento estiver exatamente na raiz, mas em análises assintóticas gerais de estrutura considera-se (O(log n)) para árvores equilibradas. No espaço auxiliar, a abordagem iterativa (com laços while) usa sempre O(1), enquanto a recursiva consome memória na pilha proporcional à altura da árvore.

Pior caso: A explicação do por que o pior caso O(n) ocorre é bem simples, o algoritmo segue o caminhho da sua raiz até uma de suas folhas, um caso que pode acontecer é a perda da busca binária, digamos que ao invés de ficar criando dois nós sempre, um na esquerda e um na direita, a gente fique criando apenas um nó numa sequência linear em que cada nó tem um filho sempre maior (ou menor) seguidos, ao invés do algoritmo descartar a ramificação. ela nunca existiu para começo de conversa, então ele vira uma busca linear percorrendo tudo até a ultima folha.  

Diário de Engenharia de IA:
Modelo usado: Chat GPT x  
Prompts:  
> Github: Preciso criar um projeto seguindo a seguinte estrutura:
trabalho-p2-ed/  
__├── README.md               # Documentação teórica, Big-O, Diário de IA e LINK DO VÍDEO  
__└── src/  
____├── algoritmo.py        # Implementação em Python puro + casos de teste  
____└── demo/  
______├── index.html      # Interface do simulador visual  
______├── styles.css      # Estilização da página e animações  
______└── app.js          # Lógica da simulação passo a passo  


>Primeiro eu nunca usei github, preciso de um passo a passo para criar as pastas nesse repositório.  
Depois eu ja sei oq colocar no algoritmo.py.
So vou precisar de ajuda na demo/ para criar uma interface visual para demonstrar meu codigo.

>Como eu faço a parte da demonstração do meu projeto para fazer a parte visual do meu código

>Meu codigo em python: Ele é baseado em Árvore binária de busca. (Junto do algoritmo.py)

>Quero a interface escura, com simulação passo a passo. Vamos começar pelo index.html.

>Proximo, styles.css

>Proximo app.js
